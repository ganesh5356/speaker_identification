"""
Flask API that connects the React frontend to the trained model.

Run from the project root:   python app/api.py
Endpoints:
    GET  /api/health    -> model status + enrolled speakers
    POST /api/predict   -> multipart form field "audio" (WAV) -> prediction JSON
"""
import datetime
import io
import re
import subprocess
import sys
import threading
from pathlib import Path

from flask import Flask, request, jsonify

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))
import config as C                                        # noqa: E402
from predict import predict_file, get_speakers            # noqa: E402
from analyze_words import analyze_words                   # noqa: E402

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 25 * 1024 * 1024       # 25 MB upload limit
_model_lock = threading.Lock()                            # one prediction at a time


def run_evaluation_script():
    eval_script = Path(__file__).resolve().parent.parent / "src" / "evaluate_model.py"
    if eval_script.exists():
        subprocess.run([sys.executable, str(eval_script)], check=True, timeout=90)


def parse_evaluation_report(force_recompute=False):
    report_path = C.REPORTS_DIR / "evaluation.txt"
    if force_recompute or not report_path.exists():
        try:
            run_evaluation_script()
        except Exception as e:
            print(f"Error running evaluation script: {e}")

    report_text = report_path.read_text(encoding="utf-8") if report_path.exists() else ""
    
    seg_acc = 0.0
    rec_acc = 0.0
    weighted_f1 = 0.0
    macro_f1 = 0.0
    seg_samples = 0
    rec_samples = 0
    speaker_metrics = []

    if report_text:
        parts = report_text.split("=== recording-level ===")
        seg_part = parts[0]
        rec_part = parts[1] if len(parts) > 1 else ""

        seg_m = re.search(r"=== segment-level ===\s*Accuracy:\s*([\d\.]+)", seg_part)
        if seg_m:
            seg_acc = float(seg_m.group(1))

        rec_m = re.search(r"Accuracy:\s*([\d\.]+)", rec_part)
        if rec_m:
            rec_acc = float(rec_m.group(1))

        w_m = re.search(r"weighted avg\s+([\d\.]+)\s+([\d\.]+)\s+([\d\.]+)\s+(\d+)", seg_part)
        if w_m:
            weighted_f1 = float(w_m.group(3))
            seg_samples = int(w_m.group(4))

        m_m = re.search(r"macro avg\s+([\d\.]+)\s+([\d\.]+)\s+([\d\.]+)", seg_part)
        if m_m:
            macro_f1 = float(m_m.group(3))

        acc_m = re.search(r"accuracy\s+([\d\.]+)\s+(\d+)", rec_part)
        if acc_m:
            rec_samples = int(acc_m.group(2))

        for line in seg_part.splitlines():
            line = line.strip()
            if not line or line.startswith("===") or line.startswith("Accuracy") or line.startswith("precision"):
                continue
            if line.startswith("accuracy") or line.startswith("macro avg") or line.startswith("weighted avg"):
                continue
            row_match = re.match(r"^([a-zA-Z0-9_\-]+)\s+([\d\.]+)\s+([\d\.]+)\s+([\d\.]+)\s+(\d+)$", line)
            if row_match:
                spk = row_match.group(1)
                if spk == "_background_":
                    continue
                speaker_metrics.append({
                    "speaker": spk,
                    "precision": float(row_match.group(2)),
                    "recall": float(row_match.group(3)),
                    "f1": float(row_match.group(4)),
                    "support": int(row_match.group(5)),
                    "status": "Evaluated"
                })

    try:
        current_speakers = get_speakers()
    except Exception:
        current_speakers = []

    parsed_speakers = {m["speaker"] for m in speaker_metrics}
    for spk in current_speakers:
        if spk not in parsed_speakers and spk != "_background_":
            speaker_metrics.append({
                "speaker": spk,
                "precision": 0.0,
                "recall": 0.0,
                "f1": 0.0,
                "support": 0,
                "status": "Enrolled (Pending Test)"
            })

    speaker_metrics.sort(key=lambda x: x["speaker"].lower())

    last_modified = ""
    if report_path.exists():
        mtime = report_path.stat().st_mtime
        last_modified = datetime.datetime.fromtimestamp(mtime).strftime("%Y-%m-%d %H:%M:%S")

    return {
        "status": "ok",
        "segment_accuracy": f"{seg_acc * 100:.2f}%",
        "recording_accuracy": f"{rec_acc * 100:.2f}%",
        "weighted_f1": f"{weighted_f1:.2f}",
        "macro_f1": f"{macro_f1:.2f}",
        "segment_samples": seg_samples,
        "recording_samples": rec_samples,
        "speaker_metrics": speaker_metrics,
        "total_speakers": len(current_speakers) if current_speakers else len(speaker_metrics),
        "evaluation_report": report_text if report_text else "No evaluation report available.",
        "last_evaluated": last_modified
    }


@app.get("/api/health")
def health():
    try:
        return jsonify(status="ok", speakers=get_speakers(), min_confidence=C.MIN_CONFIDENCE)
    except Exception as e:
        return jsonify(status="error", error=str(e)), 503


@app.get("/api/evaluation")
def evaluation():
    try:
        force = request.args.get("recompute", "").lower() in ("true", "1", "yes")
        data = parse_evaluation_report(force_recompute=force)
        return jsonify(data)
    except Exception as e:
        return jsonify(status="error", error=str(e)), 500


@app.post("/api/evaluation/recompute")
def evaluation_recompute():
    try:
        data = parse_evaluation_report(force_recompute=True)
        return jsonify(data)
    except Exception as e:
        return jsonify(status="error", error=str(e)), 500


@app.post("/api/predict")
def predict():
    import tempfile
    import os
    
    file = request.files.get("audio")
    if file is None:
        return jsonify(error="No audio received."), 400
        
    file_bytes = file.read()
    
    try:
        # 1. Speaker Recognition
        with _model_lock:
            result = predict_file(io.BytesIO(file_bytes))
            
        # 2. Word Recognition
        temp_path = tempfile.mktemp(suffix=".wav")
        with open(temp_path, "wb") as f:
            f.write(file_bytes)
            
        try:
            transcription = analyze_words(temp_path)
            result["transcription"] = transcription if transcription else "No speech detected or audio too noisy."
        except Exception as e:
            result["transcription"] = "Error transcribing audio."
            print(f"Transcription error: {e}")
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)
                
        return jsonify(result)
        
    except ValueError as e:                               # e.g. audio too short
        return jsonify(error=str(e)), 422
    except FileNotFoundError as e:                        # model not trained yet
        return jsonify(error=str(e)), 503
    except Exception as e:
        return jsonify(error=f"Prediction failed: {e}"), 500


if __name__ == "__main__":
    get_speakers()                                        # load the model once at start-up
    print("API ready on http://127.0.0.1:8000")
    app.run(host="127.0.0.1", port=8000, debug=False)
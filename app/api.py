"""
Flask API that connects the React frontend to the trained model.

Run from the project root:   python app/api.py
Endpoints:
    GET  /api/health    -> model status + enrolled speakers
    POST /api/predict   -> multipart form field "audio" (WAV) -> prediction JSON
"""
import io
import sys
import threading
from pathlib import Path

from flask import Flask, request, jsonify

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))
import config as C                                        # noqa: E402
from predict import predict_file, get_speakers            # noqa: E402

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 25 * 1024 * 1024       # 25 MB upload limit
_model_lock = threading.Lock()                            # one prediction at a time


@app.get("/api/health")
def health():
    try:
        return jsonify(status="ok", speakers=get_speakers(), min_confidence=C.MIN_CONFIDENCE)
    except Exception as e:
        return jsonify(status="error", error=str(e)), 503


@app.post("/api/predict")
def predict():
    file = request.files.get("audio")
    if file is None:
        return jsonify(error="No audio received."), 400
    try:
        with _model_lock:
            result = predict_file(io.BytesIO(file.read()))
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
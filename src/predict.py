"""
Steps 10 & 11 - Prediction for a new audio file or microphone waveform.

CLI:   python src/predict.py path/to/voice.wav
       python src/predict.py --mic --seconds 5
"""
import argparse
import json
from functools import lru_cache

import numpy as np

import config as C
from preprocess_audio import load_audio
from extract_mfcc import waveform_to_mfcc_segments


@lru_cache(maxsize=1)
def _load():
    from tensorflow.keras.models import load_model      # imported lazily (slow)
    model_path = C.MODELS_DIR / "speaker_bilstm.keras"
    if not model_path.exists():
        raise FileNotFoundError("No trained model found. Run src/train_model.py first.")
    model = load_model(model_path)
    classes = json.loads((C.MODELS_DIR / "label_map.json").read_text())

    saved = json.loads((C.MODELS_DIR / "params.json").read_text())
    if saved != C.snapshot():
        print("[warning] config.py differs from the settings used for training - "
              "predictions may be unreliable. Re-run prepare_dataset.py and train_model.py.")
    return model, classes


def get_speakers():
    return _load()[1]


def predict_waveform(y: np.ndarray) -> dict:
    """Mono 16 kHz waveform -> {'speaker', 'confidence', 'probabilities'}."""
    model, classes = _load()
    feats = waveform_to_mfcc_segments(y)
    if len(feats) == 0:
        raise ValueError("Audio is too short. Please speak for at least 1-2 seconds.")
    probs = model.predict(feats, verbose=0).mean(axis=0)     # average over segments
    best = int(probs.argmax())
    return {
        "speaker": classes[best],
        "confidence": float(probs[best]),
        "probabilities": {c: float(p) for c, p in zip(classes, probs)},
    }


def predict_file(path_or_file) -> dict:
    return predict_waveform(load_audio(path_or_file))


def _print(result: dict):
    print(f"\nPredicted speaker: {result['speaker']}  (confidence {result['confidence']:.1%})")
    for name, p in sorted(result["probabilities"].items(), key=lambda kv: -kv[1]):
        print(f"  {name:<20s} {p:6.1%}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("audio", nargs="?", help="path to a WAV/FLAC/MP3 file")
    ap.add_argument("--mic", action="store_true", help="record from the microphone instead")
    ap.add_argument("--seconds", type=float, default=5.0)
    a = ap.parse_args()

    if a.mic:
        from record_audio import record
        print(f"Speak now ({a.seconds:.0f} s)...")
        _print(predict_waveform(record(a.seconds)))
    elif a.audio:
        _print(predict_file(a.audio))
    else:
        ap.error("give an audio file path or use --mic")
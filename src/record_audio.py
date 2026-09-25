"""
Steps 2 & 11 - Microphone recording.

Enroll a speaker (saves WAV files into dataset/<speaker>/):
    python src/record_audio.py --speaker Ganesh --count 12 --seconds 6

Record a fresh test clip (saves into recordings/):
    python src/record_audio.py --test --seconds 5
"""
import argparse
import time

import numpy as np

import config as C

PROMPTS = [
    "Hello, this is my voice and I am recording it for the speaker identification project.",
    "The quick brown fox jumps over the lazy dog near the river bank.",
    "Today the weather is pleasant, and I am going to read a few sentences aloud.",
    "Machine learning helps computers find patterns in data.",
    "Please call me back when you get this message, it is important.",
    "I usually drink a cup of tea in the morning before I start working.",
    "Numbers are easy to say: one, two, three, four, five, six, seven, eight, nine, ten.",
    "Speech recognition and speaker recognition are two different problems.",
    "Yesterday I walked to the market and bought some fresh vegetables and fruit.",
    "Just say anything you like in your natural voice for a few seconds.",
]


def record(seconds: float, sr: int = C.SAMPLE_RATE) -> np.ndarray:
    """Record `seconds` of mono audio from the default microphone."""
    import sounddevice as sd
    audio = sd.rec(int(seconds * sr), samplerate=sr, channels=1, dtype="float32")
    sd.wait()
    return audio[:, 0]


def save_wav(path, y: np.ndarray, sr: int = C.SAMPLE_RATE):
    import soundfile as sf
    path.parent.mkdir(parents=True, exist_ok=True)
    sf.write(str(path), y, sr)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--speaker", help="speaker name (= folder name in dataset/)")
    ap.add_argument("--count", type=int, default=10, help="number of recordings to make")
    ap.add_argument("--seconds", type=float, default=6.0)
    ap.add_argument("--test", action="store_true", help="save into recordings/ instead")
    a = ap.parse_args()

    if not a.test and not a.speaker:
        ap.error("use --speaker NAME to enroll, or --test for a test clip")

    out_dir = C.RECORDINGS_DIR if a.test else C.DATASET_DIR / a.speaker
    existing = len(list(out_dir.glob("*.wav"))) if out_dir.exists() else 0
    count = 1 if a.test else a.count

    for i in range(count):
        prompt = PROMPTS[(existing + i) % len(PROMPTS)]
        print(f"\n[{i + 1}/{count}] Read aloud (or say something similar):\n  \"{prompt}\"")
        input("Press Enter, then start speaking... ")
        y = record(a.seconds)
        name = f"{'test' if a.test else a.speaker}_{int(time.time())}.wav"
        save_wav(out_dir / name, y)
        print(f"Saved {out_dir / name}")


if __name__ == "__main__":
    main()
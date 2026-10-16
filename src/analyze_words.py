import json
import os
import sys
from pathlib import Path
import librosa
import numpy as np

# Global cache so the Whisper model is only loaded into memory once
_whisper_model = None

def get_whisper_model():
    """
    Load and cache OpenAI Whisper via faster-whisper.
    Uses 'base.en' quantized to int8 for ultra-fast, highly accurate offline CPU inference.
    """
    global _whisper_model
    if _whisper_model is None:
        print("[*] Initializing Whisper Neural Speech Engine (offline)...")
        from faster_whisper import WhisperModel
        _whisper_model = WhisperModel("base.en", device="cpu", compute_type="int8")
        print("[*] Whisper Engine Ready.")
    return _whisper_model

def preprocess_audio(file_path):
    """
    Load and normalize audio signal to fix low microphone gain, DC offset, and quiet speech.
    Returns 16kHz float32 audio waveform ready for Whisper.
    """
    y, sr = librosa.load(file_path, sr=16000, mono=True)
    if len(y) == 0:
        return y, sr

    # 1. Remove DC bias
    y = y - np.mean(y)

    # 2. Trim dead air / silence from start and end
    trimmed_y, _ = librosa.effects.trim(y, top_db=35)
    if len(trimmed_y) > 0.3 * sr:
        y = trimmed_y

    # 3. Peak Normalization (boosts quiet browser microphone recordings to clear reference level)
    max_amp = np.max(np.abs(y))
    if max_amp > 1e-4:
        y = (y / max_amp) * 0.95

    return y.astype(np.float32), sr

def analyze_words(file_path):
    """
    Transcribe spoken words with high accuracy using Whisper.
    Passes normalized float32 waveform directly to Whisper for maximum accuracy and speed.
    100% offline.
    """
    print(f"[*] Analyzing speech: {file_path}")
    try:
        # Preprocess and normalize audio signal
        y, sr = preprocess_audio(file_path)
        if len(y) == 0:
            return "No audio signal detected."

        model = get_whisper_model()
        
        # Passing numpy array directly bypasses container decode issues and runs in memory
        segments, info = model.transcribe(
            y,
            beam_size=5,
            language="en",
            temperature=0.0,
            vad_filter=True, # Voice Activity Filter filters out background noise
        )

        transcribed_text = " ".join([segment.text.strip() for segment in segments]).strip()

        print("\n" + "=" * 50)
        print("   HIGH-ACCURACY WHISPER TRANSCRIPTION:")
        print("=" * 50)
        print(f'"{transcribed_text}"')
        print("=" * 50 + "\n")

        return transcribed_text if transcribed_text else "No clear speech detected."

    except Exception as e:
        print(f"[!] Whisper transcription failed: {e}. Falling back to Vosk...")
        return _fallback_vosk(file_path)

def _fallback_vosk(file_path):
    """Fallback engine in case of any system error."""
    try:
        from vosk import Model, KaldiRecognizer
        model = Model(lang="en-us")
        y, sr = librosa.load(file_path, sr=16000, mono=True)
        int16_pcm = (np.clip(y, -1.0, 1.0) * 32767).astype(np.int16).tobytes()
        rec = KaldiRecognizer(model, 16000)
        rec.AcceptWaveform(int16_pcm)
        res = json.loads(rec.FinalResult())
        return res.get("text", "").strip() or "No speech detected."
    except Exception as ex:
        return f"Speech recognition unavailable: {ex}"

if __name__ == "__main__":
    import config as C
    if len(sys.argv) > 1:
        audio_file = Path(sys.argv[1])
        if audio_file.exists():
            analyze_words(audio_file)
        else:
            print(f"File not found: {audio_file}")
    else:
        test_files = list(C.DATASET_DIR.rglob("*.flac")) or list(C.DATASET_DIR.rglob("*.wav"))
        if test_files:
            analyze_words(test_files[0])
        else:
            print("No audio files found in dataset to test.")

"""
Step 3 - Audio preprocessing.
load -> mono -> 16 kHz -> trim silence -> normalise -> split into fixed-length segments
"""
import numpy as np
import librosa

from config import (SAMPLE_RATE, SEGMENT_SECONDS, SEGMENT_HOP_SECONDS,
                    MIN_SEGMENT_SECONDS, TRIM_TOP_DB, MIN_SPEECH_RMS)


def load_audio(path_or_file, sr: int = SAMPLE_RATE) -> np.ndarray:
    """Load any audio file (or file-like object) as mono float32 at `sr`."""
    y, _ = librosa.load(path_or_file, sr=sr, mono=True)
    return y.astype(np.float32)


def clean_audio(y: np.ndarray) -> np.ndarray:
    """Trim leading/trailing silence and peak-normalise if sufficient speech energy exists."""
    if y.size == 0:
        return y
    rms = float(np.sqrt(np.mean(y ** 2)))
    if rms < MIN_SPEECH_RMS:
        # Audio is almost silent or quiet background noise - do not peak normalize
        return np.array([], dtype=np.float32)

    trimmed, _ = librosa.effects.trim(y, top_db=TRIM_TOP_DB)
    # only use the trimmed version if enough speech is left
    if trimmed.size >= int(MIN_SEGMENT_SECONDS * SAMPLE_RATE):
        y = trimmed
    peak = float(np.max(np.abs(y)))
    if peak > 0:
        y = y / peak * 0.95
    return y.astype(np.float32)


def _pad_to(y: np.ndarray, length: int) -> np.ndarray:
    """Repeat (wrap) short audio up to `length` samples instead of padding silence."""
    if len(y) >= length:
        return y[:length]
    return np.pad(y, (0, length - len(y)), mode="wrap")


def split_into_segments(y: np.ndarray,
                        seg_seconds: float = SEGMENT_SECONDS,
                        hop_seconds: float = SEGMENT_HOP_SECONDS,
                        sr: int = SAMPLE_RATE) -> list:
    """Cut audio into fixed-length, overlapping segments (all the same length)."""
    seg_len = int(seg_seconds * sr)
    hop = int(hop_seconds * sr)
    min_len = int(MIN_SEGMENT_SECONDS * sr)

    if len(y) < min_len:
        return []                                   # too short to use
    if len(y) <= seg_len:
        return [_pad_to(y, seg_len)]

    segments, start = [], 0
    while start + seg_len <= len(y):
        segments.append(y[start:start + seg_len])
        start += hop
    # leftover tail: add one window aligned to the end of the recording
    covered_until = start - hop + seg_len
    if len(y) - covered_until >= min_len:
        segments.append(y[-seg_len:])
    return segments


def preprocess_file(path, sr: int = SAMPLE_RATE) -> list:
    """File path -> list of clean fixed-length waveform segments."""
    y = clean_audio(load_audio(path, sr))
    return split_into_segments(y, sr=sr)
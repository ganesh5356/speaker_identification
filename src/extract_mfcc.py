"""
Step 4 & 5 - MFCC extraction and validation.
Audio -> framing -> windowing -> FFT -> mel filter bank -> log -> DCT -> MFCC
"""
import numpy as np
import librosa

from config import (SAMPLE_RATE, N_MFCC, N_FEATURES, INCLUDE_DELTAS, N_MELS, N_FFT, WIN_LENGTH, HOP_LENGTH,
                    FMIN, FMAX, N_FRAMES, SEGMENT_HOP_SECONDS)
from preprocess_audio import clean_audio, split_into_segments


def extract_mfcc(y: np.ndarray, sr: int = SAMPLE_RATE) -> np.ndarray:
    """One waveform segment -> MFCC matrix of shape (N_FRAMES, N_FEATURES)."""
    mfcc = librosa.feature.mfcc(
        y=y, sr=sr, n_mfcc=N_MFCC, n_mels=N_MELS, n_fft=N_FFT,
        win_length=WIN_LENGTH, hop_length=HOP_LENGTH,
        fmin=FMIN, fmax=FMAX, window="hann",
    )                                   # (n_mfcc, frames)

    if INCLUDE_DELTAS:
        delta = librosa.feature.delta(mfcc)
        delta2 = librosa.feature.delta(mfcc, order=2)
        mfcc = np.concatenate([mfcc, delta, delta2], axis=0)     # (n_features, frames)

    mfcc = mfcc.T                       # (frames, n_features) -> what the BiLSTM expects

    # cepstral mean & variance normalisation (per coefficient, per segment)
    mfcc = (mfcc - mfcc.mean(axis=0)) / (mfcc.std(axis=0) + 1e-8)

    # force a fixed number of frames
    if mfcc.shape[0] < N_FRAMES:
        mfcc = np.pad(mfcc, ((0, N_FRAMES - mfcc.shape[0]), (0, 0)))
    return mfcc[:N_FRAMES].astype(np.float32)


def validate_mfcc(mfcc: np.ndarray) -> None:
    """Raise if an MFCC matrix has the wrong shape or contains NaN/inf."""
    if mfcc.shape != (N_FRAMES, N_FEATURES):
        raise ValueError(f"Bad MFCC shape {mfcc.shape}, expected {(N_FRAMES, N_FEATURES)}")
    if not np.isfinite(mfcc).all():
        raise ValueError("MFCC contains NaN or infinite values")


def waveform_to_mfcc_segments(y: np.ndarray, hop_seconds: float = SEGMENT_HOP_SECONDS) -> np.ndarray:
    """
    Full pipeline for an in-memory waveform (used by prediction & microphone):
    clean -> split -> MFCC.   Returns (n_segments, N_FRAMES, N_FEATURES).
    """
    feats, _ = waveform_to_mfcc_segments_with_rms(y, hop_seconds=hop_seconds)
    return feats


def waveform_to_mfcc_segments_with_rms(y: np.ndarray, hop_seconds: float = SEGMENT_HOP_SECONDS) -> tuple:
    """
    Extracts MFCC features alongside per-segment RMS energy for energy-weighted aggregation.
    Returns (feats, rms_energies).
    """
    cleaned = clean_audio(y)
    segments = split_into_segments(cleaned, hop_seconds=hop_seconds)
    if not segments:
        return np.empty((0, N_FRAMES, N_FEATURES), dtype=np.float32), np.array([], dtype=np.float32)
    feats = np.stack([extract_mfcc(s) for s in segments])
    for f in feats:
        validate_mfcc(f)
    rms_energies = np.array([float(np.sqrt(np.mean(s ** 2))) for s in segments], dtype=np.float32)
    return feats, rms_energies

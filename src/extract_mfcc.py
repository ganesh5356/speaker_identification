"""
Step 4 & 5 - MFCC extraction and validation.
Audio -> framing -> windowing -> FFT -> mel filter bank -> log -> DCT -> MFCC
"""
import numpy as np
import librosa

from config import (SAMPLE_RATE, N_MFCC, N_MELS, N_FFT, WIN_LENGTH, HOP_LENGTH,
                    FMIN, FMAX, N_FRAMES)
from preprocess_audio import clean_audio, split_into_segments


def extract_mfcc(y: np.ndarray, sr: int = SAMPLE_RATE) -> np.ndarray:
    """One waveform segment -> MFCC matrix of shape (N_FRAMES, N_MFCC)."""
    mfcc = librosa.feature.mfcc(
        y=y, sr=sr, n_mfcc=N_MFCC, n_mels=N_MELS, n_fft=N_FFT,
        win_length=WIN_LENGTH, hop_length=HOP_LENGTH,
        fmin=FMIN, fmax=FMAX, window="hann",
    )                                   # (n_mfcc, frames)
    mfcc = mfcc.T                       # (frames, n_mfcc) -> what the BiLSTM expects

    # cepstral mean & variance normalisation (per coefficient, per segment)
    mfcc = (mfcc - mfcc.mean(axis=0)) / (mfcc.std(axis=0) + 1e-8)

    # force a fixed number of frames
    if mfcc.shape[0] < N_FRAMES:
        mfcc = np.pad(mfcc, ((0, N_FRAMES - mfcc.shape[0]), (0, 0)))
    return mfcc[:N_FRAMES].astype(np.float32)


def validate_mfcc(mfcc: np.ndarray) -> None:
    """Raise if an MFCC matrix has the wrong shape or contains NaN/inf."""
    if mfcc.shape != (N_FRAMES, N_MFCC):
        raise ValueError(f"Bad MFCC shape {mfcc.shape}, expected {(N_FRAMES, N_MFCC)}")
    if not np.isfinite(mfcc).all():
        raise ValueError("MFCC contains NaN or infinite values")


def waveform_to_mfcc_segments(y: np.ndarray) -> np.ndarray:
    """
    Full pipeline for an in-memory waveform (used by prediction & microphone):
    clean -> split -> MFCC.   Returns (n_segments, N_FRAMES, N_MFCC).
    """
    segments = split_into_segments(clean_audio(y))
    if not segments:
        return np.empty((0, N_FRAMES, N_MFCC), dtype=np.float32)
    feats = np.stack([extract_mfcc(s) for s in segments])
    for f in feats:
        validate_mfcc(f)
    return feats
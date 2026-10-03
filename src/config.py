"""
Central configuration.
Every audio / MFCC parameter lives here so that TRAINING and PREDICTION
always use exactly the same settings.
"""
from pathlib import Path

# ----------------------------------------------------------------- paths
ROOT = Path(__file__).resolve().parent.parent
DATASET_DIR = ROOT / "dataset"          # dataset/<speaker_name>/*.wav
FEATURES_DIR = ROOT / "features"
MODELS_DIR = ROOT / "models"
RECORDINGS_DIR = ROOT / "recordings"
REPORTS_DIR = ROOT / "reports"

AUDIO_EXTENSIONS = {".wav", ".flac", ".ogg", ".mp3"}

# ----------------------------------------------------------------- audio
SAMPLE_RATE = 16_000            # every file is resampled to 16 kHz mono
SEGMENT_SECONDS = 3.0           # the model sees 3-second chunks
SEGMENT_HOP_SECONDS = 1.5       # 50% overlap between chunks
MIN_SEGMENT_SECONDS = 1.0       # ignore leftovers shorter than this
TRIM_TOP_DB = 25                # silence trimming threshold

# ------------------------------------------------------------------ MFCC
N_MFCC = 40
N_MELS = 64
N_FFT = 512
WIN_LENGTH = 400                # 25 ms at 16 kHz
HOP_LENGTH = 160                # 10 ms at 16 kHz
FMIN = 20
FMAX = 7600

SEGMENT_SAMPLES = int(SEGMENT_SECONDS * SAMPLE_RATE)
N_FRAMES = 1 + SEGMENT_SAMPLES // HOP_LENGTH     # 301 frames per segment

# ------------------------------------------------------------- training
SEED = 42
VAL_FRACTION = 0.2              # fraction of each speaker's FILES
TEST_FRACTION = 0.2

# ---------------------------------------------------- unknown-speaker rejection
MIN_SPEECH_RMS = 0.005          # minimum RMS energy to consider audio as valid speech
SIMILARITY_THRESHOLD = 0.58     # cosine similarity to closest voiceprint required to accept
SIMILARITY_MARGIN = 0.05        # closest voiceprint must beat runner-up by this margin
MIN_CONFIDENCE = 0.60           # legacy softmax display value, no longer used for rejection


def snapshot() -> dict:
    """Parameters that must match between training and prediction."""
    return {
        "sample_rate": SAMPLE_RATE,
        "segment_seconds": SEGMENT_SECONDS,
        "n_mfcc": N_MFCC,
        "n_mels": N_MELS,
        "n_fft": N_FFT,
        "win_length": WIN_LENGTH,
        "hop_length": HOP_LENGTH,
        "fmin": FMIN,
        "fmax": FMAX,
        "n_frames": N_FRAMES,
    }
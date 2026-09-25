"""
Step 5 - MFCC validation.
Plots waveform + MFCC for one file per speaker and checks shapes / NaNs
for the whole dataset BEFORE any model training.

Run:  python src/visualize_mfcc.py
"""
import argparse
import matplotlib
import matplotlib.pyplot as plt
import librosa.display

from config import DATASET_DIR, REPORTS_DIR, AUDIO_EXTENSIONS, SAMPLE_RATE, HOP_LENGTH
from preprocess_audio import preprocess_file
from extract_mfcc import extract_mfcc, validate_mfcc


def speaker_files():
    out = {}
    for d in sorted(p for p in DATASET_DIR.iterdir() if p.is_dir()):
        files = [f for f in sorted(d.rglob("*")) if f.suffix.lower() in AUDIO_EXTENSIONS]
        if files:
            out[d.name] = files
    return out


def main(show: bool):
    data = speaker_files()
    if not data:
        raise SystemExit(f"No audio found in {DATASET_DIR}. Add dataset/<speaker>/*.wav first.")

    # ---- 1. numeric checks on every file
    total, bad = 0, 0
    for speaker, files in data.items():
        for f in files:
            for seg in preprocess_file(f):
                total += 1
                try:
                    validate_mfcc(extract_mfcc(seg))
                except ValueError as e:
                    bad += 1
                    print(f"[BAD] {f}: {e}")
    print(f"Checked {total} segments from {sum(len(v) for v in data.values())} files "
          f"-> {bad} problems")
    for s, files in data.items():
        print(f"  {s}: {len(files)} recordings")

    # ---- 2. plots: one example per speaker
    REPORTS_DIR.mkdir(exist_ok=True)
    fig, axes = plt.subplots(len(data), 2, figsize=(12, 3 * len(data)), squeeze=False)
    for row, (speaker, files) in enumerate(data.items()):
        segs = preprocess_file(files[0])
        if not segs:
            continue
        y, mfcc = segs[0], extract_mfcc(segs[0])
        librosa.display.waveshow(y, sr=SAMPLE_RATE, ax=axes[row, 0])
        axes[row, 0].set_title(f"{speaker} - waveform")
        img = librosa.display.specshow(mfcc.T, sr=SAMPLE_RATE, hop_length=HOP_LENGTH,
                                       x_axis="time", ax=axes[row, 1])
        axes[row, 1].set_title(f"{speaker} - MFCC {mfcc.shape}")
        axes[row, 1].set_ylabel("MFCC index")
        fig.colorbar(img, ax=axes[row, 1])
    fig.tight_layout()
    out = REPORTS_DIR / "mfcc_samples.png"
    fig.savefig(out, dpi=120)
    print(f"Saved {out}")
    if show:
        plt.show()


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--no-show", action="store_true", help="save the plot without opening a window")
    args = ap.parse_args()
    if args.no_show:
        matplotlib.use("Agg")
    main(show=not args.no_show)
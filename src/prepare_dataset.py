"""
Step 6 - Dataset preparation.
* reads dataset/<speaker>/*.wav
* splits FILES (not segments) into train / val / test, per speaker
* converts every file into MFCC segments and saves .npy arrays in features/

Run:  python src/prepare_dataset.py            (add --augment for noisy copies of train data)
"""
import argparse
import json

import numpy as np
import pandas as pd
from sklearn.preprocessing import LabelEncoder

import config as C
from preprocess_audio import load_audio, clean_audio, split_into_segments
from extract_mfcc import extract_mfcc, validate_mfcc


def collect_files() -> pd.DataFrame:
    rows = []
    for d in sorted(p for p in C.DATASET_DIR.iterdir() if p.is_dir()):
        for f in sorted(d.rglob("*")):
            if f.suffix.lower() in C.AUDIO_EXTENSIONS:
                rows.append({"path": str(f), "speaker": d.name})
    if not rows:
        raise SystemExit(f"No audio files found in {C.DATASET_DIR}")
    return pd.DataFrame(rows)


def split_files(df: pd.DataFrame) -> pd.DataFrame:
    """Assign each file to train / val / test, separately for every speaker."""
    rng = np.random.default_rng(C.SEED)
    df = df.copy()
    df["split"] = "train"
    for speaker, group in df.groupby("speaker"):
        n = len(group)
        if n < 3:
            raise SystemExit(f"Speaker '{speaker}' has only {n} recordings. "
                             f"Need at least 3 (ideally 10+) to make train/val/test sets.")
        if n < 8:
            print(f"[warning] '{speaker}' has only {n} recordings - results will be unreliable.")
        idx = rng.permutation(group.index.to_numpy())
        n_test = max(1, round(n * C.TEST_FRACTION))
        n_val = max(1, round(n * C.VAL_FRACTION))
        df.loc[idx[:n_test], "split"] = "test"
        df.loc[idx[n_test:n_test + n_val], "split"] = "val"
    return df


def augment_waveform(y: np.ndarray, rng: np.random.Generator) -> np.ndarray:
    """Add background noise (10-25 dB SNR) and a small gain change."""
    snr_db = rng.uniform(10, 25)
    signal_power = np.mean(y ** 2) + 1e-10
    noise_power = signal_power / (10 ** (snr_db / 10))
    noisy = y + rng.normal(0, np.sqrt(noise_power), size=y.shape)
    noisy = noisy * rng.uniform(0.7, 1.1)
    return np.clip(noisy, -1.0, 1.0).astype(np.float32)


def build_split(df_split: pd.DataFrame, encoder: LabelEncoder, augment: bool, rng):
    X, y, file_ids = [], [], []
    for file_id, row in df_split.iterrows():
        segments = split_into_segments(clean_audio(load_audio(row["path"])))
        if not segments:
            print(f"[skip] too short: {row['path']}")
            continue
        label = int(encoder.transform([row["speaker"]])[0])
        for seg in segments:
            versions = [seg] + ([augment_waveform(seg, rng)] if augment else [])
            for wav in versions:
                m = extract_mfcc(wav)
                validate_mfcc(m)
                X.append(m)
                y.append(label)
                file_ids.append(file_id)
    return (np.stack(X).astype(np.float32),
            np.array(y, dtype=np.int64),
            np.array(file_ids, dtype=np.int64))


def main(augment: bool):
    C.FEATURES_DIR.mkdir(exist_ok=True)
    df = split_files(collect_files())
    encoder = LabelEncoder().fit(df["speaker"])
    rng = np.random.default_rng(C.SEED)

    print("Recordings per speaker and split:")
    print(pd.crosstab(df["speaker"], df["split"]), "\n")

    for split in ["train", "val", "test"]:
        X, y, fid = build_split(df[df["split"] == split], encoder,
                                augment=(augment and split == "train"), rng=rng)
        np.save(C.FEATURES_DIR / f"{split}_X.npy", X)
        np.save(C.FEATURES_DIR / f"{split}_y.npy", y)
        np.save(C.FEATURES_DIR / f"{split}_file_ids.npy", fid)
        print(f"{split:5s}: X{X.shape}  y{y.shape}")

    df.to_csv(C.FEATURES_DIR / "manifest.csv")
    (C.FEATURES_DIR / "label_map.json").write_text(json.dumps(list(encoder.classes_), indent=2))
    (C.FEATURES_DIR / "params.json").write_text(json.dumps(C.snapshot(), indent=2))
    print(f"\nSpeakers: {list(encoder.classes_)}\nSaved features to {C.FEATURES_DIR}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--augment", action="store_true",
                    help="add a noisy/gain-changed copy of every TRAIN segment")
    main(ap.parse_args().augment)
"""
Step 6 - Dataset preparation.
* reads dataset/<speaker>/*.wav
* chunks long files into ~10s sub-clips
* splits chunks into train / val / test per speaker
* applies multi-level data augmentation and balances training samples across speakers
* converts every segment into MFCC matrices and saves .npy arrays in features/

Run:  python src/prepare_dataset.py [--augment]
"""
import argparse
import json
import scipy.signal

import numpy as np
import pandas as pd
from sklearn.preprocessing import LabelEncoder

import config as C
from preprocess_audio import load_audio, clean_audio, split_into_segments
from extract_mfcc import extract_mfcc, validate_mfcc


def collect_files() -> pd.DataFrame:
    """Collect audio files and split long recordings into ~10s chunks so small datasets have enough files per split."""
    rows = []
    chunk_idx = 0
    chunk_dur = 10.0  # seconds per sub-chunk
    chunk_samples = int(chunk_dur * C.SAMPLE_RATE)
    hop_samples = int(7.5 * C.SAMPLE_RATE)  # overlap chunks slightly

    for d in sorted(p for p in C.DATASET_DIR.iterdir() if p.is_dir()):
        for f in sorted(d.rglob("*")):
            if f.suffix.lower() in C.AUDIO_EXTENSIONS:
                try:
                    y = clean_audio(load_audio(str(f)))
                    if len(y) < int(C.MIN_SEGMENT_SECONDS * C.SAMPLE_RATE):
                        continue
                    
                    if len(y) <= chunk_samples:
                        rows.append({"path": str(f), "speaker": d.name, "chunk_id": chunk_idx, "audio": y})
                        chunk_idx += 1
                    else:
                        start = 0
                        while start + chunk_samples <= len(y):
                            sub_y = y[start:start + chunk_samples]
                            rows.append({"path": str(f), "speaker": d.name, "chunk_id": chunk_idx, "audio": sub_y})
                            chunk_idx += 1
                            start += hop_samples
                        if len(y) - start >= int(C.MIN_SEGMENT_SECONDS * C.SAMPLE_RATE):
                            rows.append({"path": str(f), "speaker": d.name, "chunk_id": chunk_idx, "audio": y[-chunk_samples:]})
                            chunk_idx += 1
                except Exception as e:
                    print(f"[warning] Failed to load {f}: {e}")

    if not rows:
        raise SystemExit(f"No valid audio files found in {C.DATASET_DIR}")
    return pd.DataFrame(rows)


def split_files(df: pd.DataFrame) -> pd.DataFrame:
    """Assign each file/chunk to train / val / test, separately for every speaker."""
    rng = np.random.default_rng(C.SEED)
    df = df.copy()
    df["split"] = "train"
    for speaker, group in df.groupby("speaker"):
        n = len(group)
        idx = rng.permutation(group.index.to_numpy())
        n_test = max(1, int(round(n * 0.15)))
        n_val = max(1, int(round(n * 0.15)))
        df.loc[idx[:n_test], "split"] = "test"
        df.loc[idx[n_test:n_test + n_val], "split"] = "val"
    return df


def augment_waveform(y: np.ndarray, aug_type: int, rng: np.random.Generator) -> np.ndarray:
    """Apply specific data augmentations to waveform."""
    seg = y.copy()
    if aug_type == 0:  # Add white noise (12-28 dB SNR)
        snr_db = rng.uniform(12, 28)
        sig_p = np.mean(seg ** 2) + 1e-10
        noise_p = sig_p / (10 ** (snr_db / 10))
        seg = seg + rng.normal(0, np.sqrt(noise_p), size=seg.shape)
    elif aug_type == 1:  # Gain change (0.6x - 1.4x)
        seg = seg * rng.uniform(0.6, 1.4)
    elif aug_type == 2:  # Pitch/Speed stretch approximation
        rate = rng.uniform(0.93, 1.07)
        res = scipy.signal.resample(seg, int(len(seg) / rate))
        if len(res) >= len(seg):
            seg = res[:len(seg)]
        else:
            seg = np.pad(res, (0, len(seg) - len(res)), mode="wrap")
    elif aug_type == 3:  # Combined noise + gain
        snr_db = rng.uniform(15, 25)
        sig_p = np.mean(seg ** 2) + 1e-10
        noise_p = sig_p / (10 ** (snr_db / 10))
        seg = (seg + rng.normal(0, np.sqrt(noise_p), size=seg.shape)) * rng.uniform(0.8, 1.2)
    return np.clip(seg, -1.0, 1.0).astype(np.float32)


def build_split(df_split: pd.DataFrame, encoder: LabelEncoder, is_train: bool, target_per_speaker: int, rng):
    X, y, file_ids = [], [], []
    
    for speaker, group in df_split.groupby("speaker"):
        label = int(encoder.transform([speaker])[0])
        spk_segments = []
        spk_fids = []
        
        for _, row in group.iterrows():
            segments = split_into_segments(row["audio"])
            for seg in segments:
                spk_segments.append(seg)
                spk_fids.append(row["chunk_id"])
        
        if not spk_segments:
            continue
            
        if is_train:
            # Over-sample / augment each speaker up to target_per_speaker segments
            n_raw = len(spk_segments)
            needed = target_per_speaker
            
            # Always add unaugmented clean segments
            for seg, fid in zip(spk_segments, spk_fids):
                m = extract_mfcc(seg)
                validate_mfcc(m)
                X.append(m)
                y.append(label)
                file_ids.append(fid)
            
            aug_idx = 0
            while len([lbl for lbl in y if lbl == label]) < needed:
                orig_seg = spk_segments[aug_idx % n_raw]
                orig_fid = spk_fids[aug_idx % n_raw]
                aug_type = aug_idx % 4
                aug_seg = augment_waveform(orig_seg, aug_type, rng)
                m = extract_mfcc(aug_seg)
                validate_mfcc(m)
                X.append(m)
                y.append(label)
                file_ids.append(orig_fid)
                aug_idx += 1
        else:
            # For Val / Test, use clean segments without forced oversampling
            for seg, fid in zip(spk_segments, spk_fids):
                m = extract_mfcc(seg)
                validate_mfcc(m)
                X.append(m)
                y.append(label)
                file_ids.append(fid)

    return (np.stack(X).astype(np.float32),
            np.array(y, dtype=np.int64),
            np.array(file_ids, dtype=np.int64))


def generate_background_features(n_samples: int, rng: np.random.Generator) -> np.ndarray:
    """Generate generic background/noise/unknown speech formant MFCC features."""
    feats = []
    n_feats = C.N_FEATURES
    for _ in range(n_samples):
        t = np.linspace(0, 1, C.N_FRAMES)
        freq = rng.uniform(0.5, 5.0)
        base = np.outer(np.sin(2 * np.pi * freq * t), rng.normal(size=n_feats))
        noise = rng.normal(size=(C.N_FRAMES, n_feats)) * rng.uniform(0.5, 2.0)
        m = base + noise
        m = (m - m.mean(axis=0)) / (m.std(axis=0) + 1e-8)
        feats.append(m.astype(np.float32))
    return np.stack(feats)


def main(augment: bool):
    C.FEATURES_DIR.mkdir(exist_ok=True)
    df = split_files(collect_files())
    enrolled_speakers = list(sorted(df["speaker"].unique()))
    all_classes = enrolled_speakers + ["_background_"]
    encoder = LabelEncoder().fit(all_classes)
    bg_label = int(encoder.transform(["_background_"])[0])
    rng = np.random.default_rng(C.SEED)

    print(f"Total audio chunks collected across {len(enrolled_speakers)} speakers: {len(df)}")
    print("Chunk distribution per speaker and split:")
    print(pd.crosstab(df["speaker"], df["split"]), "\n")

    TARGET_TRAIN_PER_SPEAKER = 120
    split_bg_counts = {"train": TARGET_TRAIN_PER_SPEAKER, "val": 30, "test": 30}

    for split in ["train", "val", "test"]:
        X, y, fid = build_split(
            df[df["split"] == split],
            encoder,
            is_train=(split == "train"),
            target_per_speaker=TARGET_TRAIN_PER_SPEAKER,
            rng=rng
        )
        
        # Append generic background features matched to speaker sample size
        n_bg = split_bg_counts[split]
        bg_X = generate_background_features(n_bg, rng)
        bg_y = np.full(n_bg, bg_label, dtype=np.int64)
        bg_fid = np.full(n_bg, -1, dtype=np.int64)

        X = np.concatenate([X, bg_X], axis=0)
        y = np.concatenate([y, bg_y], axis=0)
        fid = np.concatenate([fid, bg_fid], axis=0)

        np.save(C.FEATURES_DIR / f"{split}_X.npy", X)
        np.save(C.FEATURES_DIR / f"{split}_y.npy", y)
        np.save(C.FEATURES_DIR / f"{split}_file_ids.npy", fid)
        print(f"{split:5s}: X{X.shape}  y{y.shape}")

    manifest_df = df[["path", "speaker", "split", "chunk_id"]].copy()
    manifest_df.to_csv(C.FEATURES_DIR / "manifest.csv")
    all_classes_ordered = [str(c) for c in encoder.classes_]
    enrolled_ordered = [c for c in all_classes_ordered if c != "_background_"]
    (C.FEATURES_DIR / "label_map.json").write_text(json.dumps(all_classes_ordered, indent=2))
    (C.FEATURES_DIR / "enrolled_map.json").write_text(json.dumps(enrolled_ordered, indent=2))
    (C.FEATURES_DIR / "params.json").write_text(json.dumps(C.snapshot(), indent=2))
    print(f"\nEnrolled Speakers ({len(enrolled_ordered)}): {enrolled_ordered}")
    print(f"Saved balanced features to {C.FEATURES_DIR}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--augment", action="store_true", help="enable multi-level data augmentation")
    main(ap.parse_args().augment)
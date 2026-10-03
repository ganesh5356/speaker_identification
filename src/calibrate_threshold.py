"""
Run this ONCE after training to suggest a good SIMILARITY_THRESHOLD for
config.py, based on your own enrolled speakers' held-out test recordings.

It measures, for every TEST recording, how similar its voice embedding is to
its OWN speaker's voiceprint (should be high) versus the closest OTHER
speaker's voiceprint (should be lower). A good threshold sits between them.

Run:  python src/calibrate_threshold.py
"""
import json

import numpy as np
import tensorflow as tf

import config as C


def l2_normalize(v, axis=-1, eps=1e-9):
    return v / (np.linalg.norm(v, axis=axis, keepdims=True) + eps)


def main():
    model = tf.keras.models.load_model(C.MODELS_DIR / "speaker_bilstm.keras")
    embedder = tf.keras.Model(model.input, model.get_layer("embedding").output)
    centroids = np.load(C.MODELS_DIR / "centroids.npy")           # (n_enrolled, dim)
    classes = json.loads((C.MODELS_DIR / "label_map.json").read_text())
    
    enrolled_path = C.MODELS_DIR / "enrolled_map.json"
    if enrolled_path.exists():
        enrolled_classes = json.loads(enrolled_path.read_text())
    else:
        enrolled_classes = [c for c in classes if c != "_background_"]

    X_test = np.load(C.FEATURES_DIR / "test_X.npy")
    y_test = np.load(C.FEATURES_DIR / "test_y.npy")
    file_ids = np.load(C.FEATURES_DIR / "test_file_ids.npy")

    emb = l2_normalize(embedder.predict(X_test, batch_size=64, verbose=0))

    genuine, impostor = [], []
    for fid in np.unique(file_ids):
        mask = file_ids == fid
        class_name = classes[y_test[mask][0]]
        file_emb = l2_normalize(emb[mask].mean(axis=0, keepdims=True))[0]
        sims = centroids @ file_emb                                # cosine sim to enrolled voiceprints
        
        if class_name in enrolled_classes:
            enrolled_idx = enrolled_classes.index(class_name)
            genuine.append(sims[enrolled_idx])
            other_sims = [s for i, s in enumerate(sims) if i != enrolled_idx]
            if other_sims:
                impostor.append(max(other_sims))
        else:
            # background / unknown sample - all enrolled sims are impostor scores
            impostor.append(max(sims))

    genuine, impostor = np.array(genuine), np.array(impostor)
    print(f"Genuine similarity  (own speaker):    min={genuine.min():.3f}  "
          f"mean={genuine.mean():.3f}  max={genuine.max():.3f}")
    print(f"Impostor similarity (other speakers): min={impostor.min():.3f}  "
          f"mean={impostor.mean():.3f}  max={impostor.max():.3f}")

    if genuine.min() > impostor.max():
        suggestion = (genuine.min() + impostor.max()) / 2
        print(f"\nGood separation. Suggested SIMILARITY_THRESHOLD ~= {suggestion:.2f}")
    else:
        suggestion = (genuine.mean() + impostor.mean()) / 2
        print(f"\n[warning] Overlap between genuine and impostor scores - unknown detection "
              f"will be imperfect with this little data. Rough starting point: "
              f"SIMILARITY_THRESHOLD ~= {suggestion:.2f}. More recordings per speaker will help.")

    print(f"\nSet this in src/config.py:\n  SIMILARITY_THRESHOLD = {suggestion:.2f}")
    print("\nNOTE: this only measures separation AMONG your enrolled speakers "
          "(how well they're told apart from each other), not against a true stranger. "
          "If you have a spare recording of someone NOT enrolled, test it directly with:\n"
          "  python src/predict.py path/to/stranger_clip.wav\n"
          "and check its 'best similarity' printout against this threshold.")


if __name__ == "__main__":
    main()
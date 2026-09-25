"""
Step 9 - Evaluate on UNSEEN test recordings.
Reports accuracy, precision, recall, F1 and a confusion matrix, both
per 3-second segment and per recording (segment probabilities averaged).

Run:  python src/evaluate_model.py
"""
import json

import numpy as np
import matplotlib.pyplot as plt
from sklearn.metrics import (accuracy_score, classification_report,
                             confusion_matrix, ConfusionMatrixDisplay)
from tensorflow.keras.models import load_model

import config as C


def report(name, y_true, y_pred, classes):
    labels = list(range(len(classes)))
    acc = accuracy_score(y_true, y_pred)
    text = (f"=== {name} ===\nAccuracy: {acc:.4f}\n\n" +
            classification_report(y_true, y_pred, labels=labels, target_names=classes,
                                  zero_division=0))
    print(text)

    cm = confusion_matrix(y_true, y_pred, labels=labels)
    fig, ax = plt.subplots(figsize=(1.2 * len(classes) + 3, 1.2 * len(classes) + 2))
    ConfusionMatrixDisplay(cm, display_labels=classes).plot(ax=ax, cmap="Blues", colorbar=False)
    ax.set_title(f"Confusion matrix - {name}")
    fig.tight_layout()
    fig.savefig(C.REPORTS_DIR / f"confusion_matrix_{name.split()[0].lower()}.png", dpi=120)
    return text


def main():
    C.REPORTS_DIR.mkdir(exist_ok=True)
    model = load_model(C.MODELS_DIR / "speaker_bilstm.keras")
    classes = json.loads((C.MODELS_DIR / "label_map.json").read_text())

    X = np.load(C.FEATURES_DIR / "test_X.npy")
    y = np.load(C.FEATURES_DIR / "test_y.npy")
    file_ids = np.load(C.FEATURES_DIR / "test_file_ids.npy")

    probs = model.predict(X, batch_size=64, verbose=0)
    seg_text = report("segment-level", y, probs.argmax(axis=1), classes)

    # recording-level: average the probabilities of all segments of each file
    y_file, pred_file = [], []
    for fid in np.unique(file_ids):
        mask = file_ids == fid
        y_file.append(y[mask][0])
        pred_file.append(probs[mask].mean(axis=0).argmax())
    file_text = report("recording-level", np.array(y_file), np.array(pred_file), classes)

    (C.REPORTS_DIR / "evaluation.txt").write_text(seg_text + "\n" + file_text)
    print(f"Saved results to {C.REPORTS_DIR}")


if __name__ == "__main__":
    main()
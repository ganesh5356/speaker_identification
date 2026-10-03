"""
Steps 7 & 8 - Build and train the BiLSTM classifier.

Input : (batch, 301 frames, 40 MFCC)
Output: softmax probabilities over the enrolled speakers

Run:  python src/train_model.py [--epochs 60] [--batch-size 32]
"""
import argparse
import json
import shutil

import numpy as np
import matplotlib.pyplot as plt
import tensorflow as tf
from tensorflow.keras import layers, models, callbacks, optimizers

import config as C


def build_model(n_frames: int, n_features: int, n_classes: int) -> tf.keras.Model:
    """
    BiLSTM speaker embedder with L2 Unit Normalization.
    Normalizes embeddings onto the unit hypersphere so that cosine similarity
    and centroid distance measurements work accurately for open-set / unknown
    speaker rejection.
    """
    reg = tf.keras.regularizers.l2(1e-3)
    inputs = layers.Input(shape=(n_frames, n_features), name="mfcc_sequence")
    x = layers.Bidirectional(
        layers.LSTM(64, return_sequences=True, kernel_regularizer=reg, recurrent_regularizer=reg),
        name="bilstm_1")(inputs)
    x = layers.Dropout(0.3)(x)
    x = layers.Bidirectional(
        layers.LSTM(32, kernel_regularizer=reg, recurrent_regularizer=reg), name="bilstm_2")(x)
    x = layers.Dropout(0.3)(x)
    x = layers.Dense(64, activation=None, kernel_regularizer=reg, name="embedding_linear")(x)
    x = layers.BatchNormalization()(x)
    embedding = layers.UnitNormalization(axis=-1, name="embedding")(x)
    outputs = layers.Dense(n_classes, activation="softmax", name="speaker_probs")(embedding)

    model = models.Model(inputs, outputs, name="speaker_bilstm")
    model.compile(optimizer=optimizers.Adam(1e-3),
                  loss="sparse_categorical_crossentropy",
                  metrics=["accuracy"])
    return model


def plot_history(history, path):
    fig, ax = plt.subplots(1, 2, figsize=(11, 4))
    ax[0].plot(history.history["loss"], label="train")
    ax[0].plot(history.history["val_loss"], label="validation")
    ax[0].set_title("Loss"); ax[0].set_xlabel("epoch"); ax[0].legend()
    ax[1].plot(history.history["accuracy"], label="train")
    ax[1].plot(history.history["val_accuracy"], label="validation")
    ax[1].set_title("Accuracy"); ax[1].set_xlabel("epoch"); ax[1].legend()
    fig.tight_layout()
    fig.savefig(path, dpi=120)


def main(epochs: int, batch_size: int):
    tf.keras.utils.set_random_seed(C.SEED)
    C.MODELS_DIR.mkdir(exist_ok=True)
    C.REPORTS_DIR.mkdir(exist_ok=True)

    X_train = np.load(C.FEATURES_DIR / "train_X.npy")
    y_train = np.load(C.FEATURES_DIR / "train_y.npy")
    X_val = np.load(C.FEATURES_DIR / "val_X.npy")
    y_val = np.load(C.FEATURES_DIR / "val_y.npy")
    classes = json.loads((C.FEATURES_DIR / "label_map.json").read_text())

    model = build_model(X_train.shape[1], X_train.shape[2], len(classes))
    model.summary()

    model_path = C.MODELS_DIR / "speaker_bilstm.keras"
    cbs = [
        callbacks.ModelCheckpoint(model_path, monitor="val_loss", save_best_only=True),
        callbacks.EarlyStopping(monitor="val_loss", patience=12, restore_best_weights=True),
        callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=5, min_lr=1e-5),
    ]
    history = model.fit(X_train, y_train, validation_data=(X_val, y_val),
                        epochs=epochs, batch_size=batch_size, shuffle=True,
                        callbacks=cbs, verbose=2)

    # files needed later by predict.py / app.py
    shutil.copy(C.FEATURES_DIR / "label_map.json", C.MODELS_DIR / "label_map.json")
    if (C.FEATURES_DIR / "enrolled_map.json").exists():
        shutil.copy(C.FEATURES_DIR / "enrolled_map.json", C.MODELS_DIR / "enrolled_map.json")
    shutil.copy(C.FEATURES_DIR / "params.json", C.MODELS_DIR / "params.json")
    plot_history(history, C.REPORTS_DIR / "training_curves.png")

    # ---- build each enrolled speaker's reference "voiceprint" (centroid embedding).
    best_model = tf.keras.models.load_model(model_path)
    embedder = tf.keras.Model(best_model.input, best_model.get_layer("embedding").output)

    def l2_normalize(v, axis=-1, eps=1e-9):
        return v / (np.linalg.norm(v, axis=axis, keepdims=True) + eps)

    enrolled = json.loads((C.MODELS_DIR / "enrolled_map.json").read_text()) \
        if (C.MODELS_DIR / "enrolled_map.json").exists() else [c for c in classes if c != "_background_"]

    train_embeddings = l2_normalize(embedder.predict(X_train, batch_size=64, verbose=0))
    n_enrolled = len(enrolled)
    centroids = np.zeros((n_enrolled, train_embeddings.shape[1]), dtype=np.float32)
    for i, spk in enumerate(enrolled):
        c_idx = classes.index(spk)
        mask = y_train == c_idx
        centroids[i] = l2_normalize(train_embeddings[mask].mean(axis=0, keepdims=True))[0]
    np.save(C.MODELS_DIR / "centroids.npy", centroids)
    print(f"Saved {n_enrolled} enrolled speaker voiceprints to {C.MODELS_DIR / 'centroids.npy'}")
    print(f"Best model saved to {model_path}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--epochs", type=int, default=60)
    ap.add_argument("--batch-size", type=int, default=32)
    a = ap.parse_args()
    main(a.epochs, a.batch_size)
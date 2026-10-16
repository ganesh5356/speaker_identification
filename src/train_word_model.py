import os
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from pathlib import Path
import config as C

# --- Configuration for ASR ---
FRAME_LENGTH = 256
FRAME_STEP = 160
FFT_SIZE = 384
# Vocabulary: a-z, space, and a blank token for CTC
VOCAB = [x for x in "abcdefghijklmnopqrstuvwxyz'?! "]
# -----------------------------

def build_dataset_metadata():
    """Parses LibriSpeech .txt files to map audio paths to text transcripts."""
    audio_paths = []
    texts = []
    
    # Go through all text files in the dataset
    for txt_file in C.DATASET_DIR.rglob("*.txt"):
        speaker_dir = txt_file.parent
        with open(txt_file, "r", encoding="utf-8") as f:
            lines = f.readlines()
            for line in lines:
                parts = line.strip().split(" ", 1)
                if len(parts) == 2:
                    file_id, transcript = parts
                    # The audio file has the exact same name as the file_id
                    audio_path = speaker_dir / f"{file_id}.flac"
                    if audio_path.exists():
                        audio_paths.append(str(audio_path))
                        texts.append(transcript.lower())
                        
    return audio_paths, texts

# --- Text Processing ---
char_to_num = keras.layers.StringLookup(vocabulary=VOCAB, oov_token="")
num_to_char = keras.layers.StringLookup(
    vocabulary=char_to_num.get_vocabulary(), oov_token="", invert=True
)

def encode_single_sample(wav_path, label):
    """Loads audio, computes spectrogram, and converts text to numbers."""
    # 1. Process Audio
    audio = tf.io.read_file(wav_path)
    # Decode FLAC (tf.audio doesn't natively decode FLAC easily in all versions, 
    # but we can use tfio if installed. If it fails, we fall back to a python function).
    # To keep it universally compatible without extra pip installs, let's read the raw bytes
    # via a tf.numpy_function wrapping soundfile or librosa.
    return wav_path, label

def load_audio_and_text(wav_path, text):
    import soundfile as sf
    def _process(path, txt):
        path = path.decode("utf-8")
        txt = txt.decode("utf-8")
        audio, _ = sf.read(path)
        return audio.astype(np.float32), txt
    
    audio, txt = tf.numpy_function(
        _process, [wav_path, text], [tf.float32, tf.string]
    )
    audio.set_shape([None])
    txt.set_shape([])
    
    # Compute Spectrogram
    spectrogram = tf.signal.stft(
        audio, frame_length=FRAME_LENGTH, frame_step=FRAME_STEP, fft_length=FFT_SIZE
    )
    spectrogram = tf.abs(spectrogram)
    spectrogram = tf.math.pow(spectrogram, 0.5)
    
    # Normalize
    means = tf.math.reduce_mean(spectrogram, 1, keepdims=True)
    stddevs = tf.math.reduce_std(spectrogram, 1, keepdims=True)
    spectrogram = (spectrogram - means) / (stddevs + 1e-10)
    
    # Encode label
    label = tf.strings.unicode_split(txt, input_encoding="UTF-8")
    label = char_to_num(label)
    
    return spectrogram, label

# --- The CTC Loss Function ---
def CTCLoss(y_true, y_pred):
    batch_len = tf.cast(tf.shape(y_true)[0], dtype="int64")
    input_length = tf.cast(tf.shape(y_pred)[1], dtype="int64")
    label_length = tf.cast(tf.shape(y_true)[1], dtype="int64")

    input_length = input_length * tf.ones(shape=(batch_len, 1), dtype="int64")
    label_length = label_length * tf.ones(shape=(batch_len, 1), dtype="int64")

    loss = keras.backend.ctc_batch_cost(y_true, y_pred, input_length, label_length)
    return loss

# --- The ASR Model Architecture ---
def build_asr_model(input_dim, output_dim, rnn_layers=2, rnn_units=256):
    input_spectrogram = layers.Input((None, input_dim), name="input")
    
    # Expand dimensions for 2D Conv
    x = layers.Reshape((-1, input_dim, 1), name="expand_dim")(input_spectrogram)
    
    # 2D Convolution layers
    x = layers.Conv2D(
        filters=32, kernel_size=[11, 41], strides=[2, 2], padding="same", use_bias=False, name="conv_1"
    )(x)
    x = layers.BatchNormalization(name="conv_1_bn")(x)
    x = layers.ReLU(name="conv_1_relu")(x)
    
    x = layers.Conv2D(
        filters=32, kernel_size=[11, 21], strides=[1, 2], padding="same", use_bias=False, name="conv_2"
    )(x)
    x = layers.BatchNormalization(name="conv_2_bn")(x)
    x = layers.ReLU(name="conv_2_relu")(x)
    
    # Reshape back to 1D sequence
    x = layers.Reshape((-1, x.shape[-2] * x.shape[-1]))(x)
    
    # RNN Layers
    for i in range(rnn_layers):
        recurrent = layers.GRU(
            units=rnn_units, return_sequences=True, name=f"gru_{i}"
        )
        x = layers.Bidirectional(recurrent, name=f"bidirectional_{i}")(x)
        x = layers.Dropout(rate=0.5)(x)
        
    # Dense layer (output)
    x = layers.Dense(units=rnn_units * 2, name="dense_1")(x)
    x = layers.ReLU(name="dense_1_relu")(x)
    x = layers.Dropout(rate=0.5)(x)
    
    # Classification layer (+1 for CTC blank token)
    output = layers.Dense(units=output_dim + 1, activation="softmax")(x)
    
    model = keras.Model(input_spectrogram, output, name="WordRecognitionModel")
    # Optimizer
    opt = keras.optimizers.Adam(learning_rate=1e-4)
    model.compile(optimizer=opt, loss=CTCLoss)
    return model


if __name__ == "__main__":
    print("Gathering audio transcripts...")
    audio_paths, texts = build_dataset_metadata()
    print(f"Found {len(audio_paths)} matching audio-transcript pairs.")
    
    if len(audio_paths) == 0:
        print("Error: No transcriptions found. Did LibriSpeech download correctly?")
        exit(1)

    # Split into train and validation sets
    split = int(len(audio_paths) * 0.90)
    train_audio_paths, val_audio_paths = audio_paths[:split], audio_paths[split:]
    train_texts, val_texts = texts[:split], texts[split:]
    
    print(f"Training on {len(train_audio_paths)} files, validating on {len(val_audio_paths)} files.")

    # Build tf.data pipeline
    batch_size = 8
    
    def prepare_dataset(paths, labels):
        dataset = tf.data.Dataset.from_tensor_slices((paths, labels))
        dataset = dataset.map(load_audio_and_text, num_parallel_calls=tf.data.AUTOTUNE)
        dataset = dataset.padded_batch(batch_size)
        dataset = dataset.prefetch(buffer_size=tf.data.AUTOTUNE)
        return dataset
        
    train_ds = prepare_dataset(train_audio_paths, train_texts)
    val_ds = prepare_dataset(val_audio_paths, val_texts)

    # Build the Model
    # input_dim = FFT_SIZE // 2 + 1
    model = build_asr_model(
        input_dim=FFT_SIZE // 2 + 1,
        output_dim=char_to_num.vocabulary_size(),
        rnn_units=256
    )
    model.summary(line_length=110)
    
    print("\nStarting Training! (Press Ctrl+C to stop early)")
    epochs = 30
    
    # Ensure models dir exists
    C.MODELS_DIR.mkdir(exist_ok=True)
    
    # Save best model
    checkpoint = keras.callbacks.ModelCheckpoint(
        filepath=C.MODELS_DIR / "word_recognition_model.keras",
        monitor="val_loss",
        save_best_only=True,
        verbose=1
    )

    try:
        model.fit(
            train_ds,
            validation_data=val_ds,
            epochs=epochs,
            callbacks=[checkpoint]
        )
        print(f"\nSuccess! Word Recognition model saved to {C.MODELS_DIR / 'word_recognition_model.keras'}")
    except KeyboardInterrupt:
        print("\nTraining stopped manually.")

# 🎙️ Speaker Recognition & Voice Intelligence Console

A state-of-the-art **BiLSTM Speaker Recognition System** and **Dark Cinematic Voice Intelligence Console** built with Python, MFCC Audio Preprocessing, Keras Deep Learning, Flask REST API, and React + Vite.

---

## 📋 Overview

This repository provides an end-to-end voice intelligence solution that identifies enrolled speakers from audio recordings or real-time microphone input. It features:

- **Acoustic Neural Network**: Bi-directional LSTM (BiLSTM) model trained on extracted Mel-Frequency Cepstral Coefficients (MFCCs).
- **Dark Cinematic Visual Identity**: Sleek dark charcoal interface with glowing purple/emerald accents, ambient grid background, and responsive `01` / `02` / `03` / `04` step navigation.
- **Voice Intelligence Analysis Console**:
  1. **Predicted Speaker**: Large bold identity display with automatic `UNKNOWN SPEAKER` fallback.
  2. **Confidence Score**: Dynamic threshold badges (`HIGH` $\ge 80\%$, `MEDIUM` $60\%-79.99\%$, `LOW` $< 60\%$).
  3. **Unknown Speaker Warning Banner**: Subtle alert when confidence falls below threshold.
  4. **Probability Distribution Chart**: Horizontal bar chart comparing prediction probabilities for all enrolled speakers.
  5. **Audio Details Grid**: Compact metadata display (`FILE`, `DURATION`, `SAMPLE RATE`, `ANALYZED AT`).
  6. **Audio Quality Check**: Status flags for length, noise level, and volume.
  7. **Waveform Analyzer**: Smooth SVG curve with pulse-bar audio signal visualizer.
  8. **Spectrogram / MFCC Heatmap**: Acoustic feature coefficient map across time frames.
  9. **Plain-Language Summary**: Human-readable narrative explanation.
  10. **Low-Confidence Tips**: Contextual guidance on improving audio recording quality.
  11. **PDF Report Download**: One-click printable PDF report generation.
- **Multi-Speaker Diarization**: Support for detecting multiple speakers in a single audio segment.
- **Developer Evaluation Suite**: Confusion matrix plots, per-speaker precision/recall/F1 metrics.

---

## 🛠️ System Requirements

- **Python**: `3.9` or higher
- **Node.js**: `18.0` or higher
- **Package Managers**: `pip` and `npm`

---

## 🚀 Quick Start Guide (Run from Scratch)

Follow these step-by-step instructions to get the application running on any fresh machine:

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/speaker-recognition.git
cd "speaker-recognition"
```

---

### 2. Setup Python Virtual Environment (Backend)

**On Windows (PowerShell):**
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

**On macOS / Linux:**
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

---

### 3. Setup Frontend Dependencies

In a new terminal tab or window:
```bash
cd frontend
npm install
cd ..
```

---

### 4. Prepare Your Speaker Dataset

Create speaker folders inside the `dataset/` directory and add `.wav` audio recordings (1–2 minutes per speaker recommended):

```text
dataset/
├── Speaker_A/
│   ├── sample1.wav
│   ├── sample2.wav
│   └── sample3.wav
├── Speaker_B/
│   ├── sample1.wav
│   └── sample2.wav
└── YourName/
    ├── voice1.wav
    └── voice2.wav
```

> 💡 **Tip:** Each speaker folder name in `dataset/` will automatically become their enrolled identifier in the application.

---

### 5. Extract Features & Train the Model

Run feature extraction (with optional audio data augmentation):
```bash
python src/prepare_dataset.py --augment
```
*This extracts MFCC features and generates train/val/test matrices in `features/`.*

Train the BiLSTM neural network:
```bash
python src/train_model.py --epochs 60 --batch-size 32
```
*This saves the trained model weights to `models/speaker_bilstm.keras` and generates label metadata.*

Optional: Evaluate model performance and produce reports:
```bash
python src/evaluate_model.py
```

---

### 6. Launch the Application

#### Terminal 1: Start the Backend Flask API
```bash
# Ensure virtual environment is active
python app/api.py
```
*API will run at `http://127.0.0.1:8000`.*

#### Terminal 2: Start the Frontend Console
```bash
cd frontend
npm run dev
```
*Web application will launch at `http://localhost:5173`.*

Open your browser to **`http://localhost:5173`** to access the Voice Intelligence Console!

---

## 📁 Repository Structure

```text
├── app/                  # Flask REST API backend (api.py)
├── dataset/              # Speaker audio folders (git-ignored, create locally)
├── features/             # Generated MFCC feature matrices (git-ignored)
├── frontend/             # React + Vite dark gaming interface
│   ├── src/
│   │   ├── components/   # UI components & AnalysisResult/ sub-components
│   │   ├── screens/      # Analysis, Result, History & Developer screens
│   │   ├── styles/       # Dark theme CSS tokens & global styles
│   │   └── utils/        # Threshold helpers & mock normalizer
│   └── package.json
├── models/               # Trained BiLSTM weights & maps (git-ignored)
├── reports/              # Evaluation reports & confusion matrices
├── src/                  # Core ML logic
│   ├── prepare_dataset.py# MFCC extraction & augmentation
│   ├── train_model.py    # Model architecture & training loop
│   ├── evaluate_model.py # Model evaluation suite
│   └── predict.py        # Inference engine
├── requirements.txt      # Python dependencies
└── README.md             # Project documentation
```

---

## ⚡ CLI Prediction (Alternative Usage)

You can also run predictions directly from the command line without starting the web UI:

**Predict from a saved audio file:**
```bash
python src/predict.py path/to/sample.wav
```

**Predict from live microphone input (5 seconds):**
```bash
python src/predict.py --mic --seconds 5
```

---

## 📄 License

This project is intended for educational, research, and voice intelligence demonstration purposes.

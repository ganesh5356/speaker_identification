# 🎙️ Speaker Recognition & Voice Intelligence Console

A high-performance **Speaker Recognition System** and **Voice Intelligence Console** built with Python, MFCC feature extraction, a **BiLSTM Deep Neural Network**, Flask RESTful API backend, and a modern **Dark Gaming / Cinematic React Frontend**.

---

## 🌟 Key Features

- **BiLSTM Deep Learning Model**: Acoustic model trained on MFCC sequence coefficients for high-accuracy voice identification.
- **Dark Cinematic Visual Console**: Modern UI inspired by premium gaming and iPhone lock-screen aesthetics with glowing purple/emerald accents and numerical step navigation (`01`, `02`, `03`, `04`).
- **Comprehensive Voice Analysis Result Experience**:
  - **Identified Speaker Display**: Prominent speaker matching with automatic `UNKNOWN SPEAKER` fallback when below threshold.
  - **Dynamic Confidence Score**: Configurable thresholds (`HIGH` $\ge 80\%$, `MEDIUM` $60\%-79.99\%$, `LOW` $< 60\%$) with status badges.
  - **Unknown Speaker Warning**: Subtle alert banner when audio fails identification confidence requirement.
  - **Probability Distribution Chart**: Horizontal bar chart comparing probabilities across all enrolled speakers.
  - **Audio Details**: Privacy-focused audio metadata (`FILE`, `DURATION`, `SAMPLE RATE`, `ANALYZED AT`).
  - **Audio Quality Checks**: Automatic verification for sample length, noise level, and volume.
  - **Waveform Analyzer**: Animated continuous signal plot showing dynamic amplitude.
  - **Spectrogram / MFCC Heatmap**: Structured acoustic feature heatmap over time frames.
  - **Plain-Language Summary**: Accessible, non-technical sentence explaining prediction logic.
  - **Low-Confidence Tips**: Contextual guidance on improving microphone placement and environment.
  - **PDF Report Download**: Instant export of detailed analysis reports.
- **Multi-Speaker Diarization**: Support for multi-speaker segment detection.
- **Developer Evaluation Console**: F1-Score metrics, Confusion Matrix, and validation reports.

---

## 📁 Project Structure

```text
├── app/                  # Flask REST API backend (api.py)
├── dataset/              # Training audio recordings organized by speaker folder
├── features/             # Extracted MFCC features, standardizer scalars, metadata
├── frontend/             # React + Vite dark futuristic web interface
│   ├── src/
│   │   ├── components/   # UI components including AnalysisResult/ sub-components
│   │   ├── screens/      # Main application views (Analysis, Result, History, Evaluation)
│   │   ├── styles/       # Dark theme design system & global CSS
│   │   └── utils/        # Confidence logic & mock data normalizer
├── models/               # Saved Keras model (speaker_bilstm.keras) & label maps
├── reports/              # Model evaluation metrics & visual confusion matrices
├── src/                  # Python core ML pipeline
│   ├── prepare_dataset.py# MFCC feature extraction & data augmentation
│   ├── train_model.py    # BiLSTM model training loop
│   ├── evaluate_model.py # Evaluation & confusion matrix generator
│   └── predict.py        # CLI and backend inference engine
├── requirements.txt      # Python dependencies
└── README.md             # Documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites & Virtual Environment

Clone the repository and set up a Python virtual environment:

```bash
# Clone the repository
git clone https://github.com/your-username/speaker-recognition.git
cd speaker-recognition

# Create virtual environment
python -m venv .venv
```

Activate the environment:
- **Windows PowerShell**:
  ```powershell
  .\.venv\Scripts\Activate.ps1
  ```
- **macOS / Linux**:
  ```bash
  source .venv/bin/activate
  ```

### 2. Install Dependencies

**Backend Python dependencies:**
```bash
pip install -r requirements.txt
```

**Frontend React dependencies:**
```bash
cd frontend
npm install
cd ..
```

---

## 🎧 Dataset Format

Organize your voice recordings under the `dataset/` directory by speaker name:

```text
dataset/
├── Ganesh/
│   ├── recording1.wav
│   └── recording2.wav
├── Rakshitha/
│   ├── recording1.wav
│   └── recording2.wav
└── Speaker_C/
    ├── recording1.wav
    └── recording2.wav
```

---

## ⚙️ Model Pipeline Workflow

### 1) Feature Extraction & Data Augmentation

Process raw `.wav` audio into MFCC features:
```bash
python src/prepare_dataset.py
```

Enable optional audio data augmentation (pitch shift, noise addition):
```bash
python src/prepare_dataset.py --augment
```

### 2) Model Training

Train the BiLSTM neural network:
```bash
python src/train_model.py --epochs 60 --batch-size 32
```
*Trained weights and label mappings are saved to `models/speaker_bilstm.keras`.*

### 3) Model Evaluation

Generate confusion matrix and evaluation metrics:
```bash
python src/evaluate_model.py
```

### 4) CLI Inference Test

Test prediction on an audio file:
```bash
python src/predict.py path/to/sample.wav
```

---

## 🌐 Running the Web Application

### Step 1: Start the Backend API

From the project root directory:
```bash
python app/api.py
```
*Backend API server runs at `http://127.0.0.1:8000`.*

### Step 2: Start the Frontend Application

In a separate terminal:
```bash
cd frontend
npm run dev
```
*Frontend console runs at `http://localhost:5173`.*

---

## 📄 License

This project is built for educational and voice intelligence research purposes.

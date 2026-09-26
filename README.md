# Speaker Recognition Project

This project builds a speaker recognition system using MFCC features and a BiLSTM neural network. It includes:

- audio preprocessing and MFCC extraction
- dataset preparation and train/validation/test splitting
- model training and evaluation
- CLI prediction for new audio files
- a Flask API for serving predictions
- a React frontend for recording and identifying speakers

## Project overview

The project follows this flow:

1. Collect audio files under the `dataset/` folder by speaker name.
2. Prepare and transform audio into MFCC-based features.
3. Train a BiLSTM model in `src/train_model.py`.
4. Evaluate the trained model in `src/evaluate_model.py`.
5. Run predictions with `src/predict.py`.
6. Serve predictions through the Flask API in `app/api.py`.
7. Use the frontend in `frontend/` to record audio and display the speaker result.

## Folder structure

- `app/` — Flask API server
- `dataset/` — speaker audio files, organized by person
- `features/` — generated MFCC feature arrays and metadata
- `frontend/` — React + Vite frontend
- `models/` — trained model and label metadata
- `reports/` — evaluation reports and plots
- `src/` — training, preprocessing, prediction, and audio utilities

## Requirements

Python dependencies are in `requirements.txt`.

Frontend dependencies are in `frontend/package.json`.

## Setup

### 1) Create a virtual environment

```bash
python -m venv .venv
```

On Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

On macOS/Linux:

```bash
source .venv/bin/activate
```

### 2) Install Python dependencies

```bash
pip install -r requirements.txt
```

### 3) Install frontend dependencies

```bash
cd frontend
npm install
```

## Dataset format

Place your recordings in folders like this:

```text
dataset/
  Ganesh/
    sample1.wav
    sample2.wav
  Rakshitha/
    sample1.wav
    sample2.wav
```

The project expects each speaker to have a folder under `dataset/` and audio files inside it.

## Training pipeline

### Prepare the dataset and features

```bash
python src/prepare_dataset.py
```

Optional augmentation:

```bash
python src/prepare_dataset.py --augment
```

### Train the model

```bash
python src/train_model.py
```

Optional arguments:

```bash
python src/train_model.py --epochs 60 --batch-size 32
```

This saves the trained model to `models/speaker_bilstm.keras` and copies label metadata into the models folder.

### Evaluate the model

```bash
python src/evaluate_model.py
```

This saves accuracy and confusion matrix reports under `reports/`.

## Prediction

### Predict from an audio file

```bash
python src/predict.py path/to/audio.wav
```

### Predict from microphone input

```bash
python src/predict.py --mic --seconds 5
```

## Run the API

From the project root:

```bash
python app/api.py
```

The API runs at:

```text
http://127.0.0.1:8000
```

Check health:

```bash
curl http://127.0.0.1:8000/api/health
```

## Run the frontend

In a separate terminal:

```bash
cd frontend
npm run dev
```

The frontend typically runs at:

```text
http://localhost:5173
```

## Frontend usage

1. Open the frontend in the browser.
2. Allow microphone access or upload an audio file.
3. Click the prediction button.
4. The app sends audio to the Flask API and displays the predicted speaker with confidence.

## Notes

- The model uses MFCC sequences and a BiLSTM architecture.
- Audio is resampled to 16 kHz and processed in short segments.
- Ensure the training and prediction configuration stay consistent.
- If the model is not trained yet, prediction endpoints will return an error until `src/train_model.py` has been run.

## Common commands summary

```bash
pip install -r requirements.txt
cd frontend && npm install
python src/prepare_dataset.py
python src/train_model.py --epochs 60 --batch-size 32
python src/evaluate_model.py
python app/api.py
cd frontend && npm run dev
```

## License

This project is intended for educational and personal use.

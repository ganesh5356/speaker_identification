# Frontend README

This folder contains the React + Vite frontend for the speaker recognition application.

## What it does

- records audio from the microphone
- allows audio upload
- sends the audio to the backend API
- displays the predicted speaker and confidence score

## Setup

From this folder:

```bash
npm install
```

## Run locally

```bash
npm run dev
```

This usually starts the app at:

```text
http://localhost:5173
```

## Build for production

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Backend dependency

This frontend expects the Python Flask API to be running at:

```text
http://127.0.0.1:8000
```

Start the API from the project root with:

```bash
python app/api.py
```

## Notes

- If the backend is unavailable, prediction requests will fail.
- The frontend uses browser audio APIs, so microphone permissions are required in the browser.

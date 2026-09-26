import { useEffect, useRef, useState } from "react";
import Nav from "./components/Nav.jsx";
import About from "./components/About.jsx";
import Reveal from "./components/Reveal.jsx";
import Visualizer from "./components/Visualizer.jsx";
import ResultCard from "./components/ResultCard.jsx";
import { getHealth, identifySpeaker } from "./api.js";
import { blobToWav16k } from "./audioUtils.js";

const MAX_SECONDS = 8;
const PIPELINE = ["Preprocess", "MFCC", "BiLSTM", "Softmax"];

export default function App() {
  const [tab, setTab] = useState("identify");
  const [health, setHealth] = useState({ state: "loading", speakers: [], minConfidence: 0.6 });
  const [status, setStatus] = useState("idle"); // idle | recording | processing
  const [seconds, setSeconds] = useState(0);
  const [analyser, setAnalyser] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [step, setStep] = useState(0);
  const [dragging, setDragging] = useState(false);

  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const checkBackend = async () => {
    setHealth((h) => ({ ...h, state: "loading" }));
    try {
      const data = await getHealth();
      setHealth({ state: "online", speakers: data.speakers, minConfidence: data.min_confidence });
    } catch (e) {
      setHealth((h) => ({ ...h, state: "offline", message: e.message }));
    }
  };
  useEffect(() => {
    checkBackend();
  }, []);

  useEffect(() => {
    if (status !== "processing") return;
    setStep(0);
    const id = setInterval(() => setStep((s) => Math.min(s + 1, PIPELINE.length - 1)), 500);
    return () => clearInterval(id);
  }, [status]);

  const analyze = async (blob, label) => {
    setStatus("processing");
    setError("");
    try {
      const wav = await blobToWav16k(blob);
      const data = await identifySpeaker(wav);
      setResult(data);
      setHistory((h) =>
        [{ label, speaker: data.speaker, confidence: data.confidence, time: new Date() }, ...h].slice(0, 5)
      );
    } catch (e) {
      setResult(null);
      setError(e.message);
    } finally {
      setStatus("idle");
    }
  };

  const startRecording = async () => {
    setError("");
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      streamRef.current = stream;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioCtxRef.current = audioCtx;
      const node = audioCtx.createAnalyser();
      node.fftSize = 256;
      audioCtx.createMediaStreamSource(stream).connect(node);
      setAnalyser(node);

      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        releaseMic();
        analyze(blob, "Microphone");
      };
      recorder.start();
      recorderRef.current = recorder;

      const startedAt = Date.now();
      setSeconds(0);
      setStatus("recording");
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startedAt) / 1000;
        setSeconds(elapsed);
        if (elapsed >= MAX_SECONDS) stopRecording();
      }, 100);
    } catch {
      releaseMic();
      setError("Microphone access was blocked. Allow it in the browser and try again.");
    }
  };

  const stopRecording = () => {
    clearInterval(timerRef.current);
    if (recorderRef.current && recorderRef.current.state !== "inactive") recorderRef.current.stop();
  };

  const releaseMic = () => {
    clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close().catch(() => {});
    streamRef.current = null;
    audioCtxRef.current = null;
    setAnalyser(null);
  };

  useEffect(() => releaseMic, []);

  const handleFile = (file) => {
    if (!file) return;
    setResult(null);
    analyze(file, file.name);
  };

  const recording = status === "recording";
  const processing = status === "processing";
  const offline = health.state !== "online";

  return (
    <div className="page">
      <div className="blob blob-a" />
      <div className="blob blob-b" />

      <Nav tab={tab} setTab={setTab} health={health} onRefresh={checkBackend} />

      {tab === "about" ? (
        <About />
      ) : (
        <main className="grid">
          <Reveal as="section" className="card">
            <p className="eyebrow">Voice input</p>
            <Visualizer analyser={analyser} active={recording} />

            <div className="controls">
              <button
                className={`mic ${recording ? "recording" : ""}`}
                onClick={recording ? stopRecording : startRecording}
                disabled={processing || offline}
                aria-label={recording ? "Stop recording" : "Start recording"}
              >
                {recording ? <span className="stop-icon" /> : <MicIcon />}
              </button>
              <p className="hint">
                {offline && "Start the Python API to enable identification"}
                {!offline && status === "idle" && "Tap to record 3–8 seconds of speech"}
                {recording && `Recording… ${seconds.toFixed(1)}s / ${MAX_SECONDS}s`}
                {processing && "Analysing voice…"}
              </p>
            </div>

            <div className="divider"><span>or</span></div>

            <label
              className={`drop ${dragging ? "dragging" : ""} ${processing || offline ? "disabled" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                if (!processing && !offline) handleFile(e.dataTransfer.files[0]);
              }}
            >
              <input
                type="file"
                accept="audio/*"
                hidden
                disabled={processing || offline}
                onChange={(e) => { handleFile(e.target.files[0]); e.target.value = ""; }}
              />
              <strong>Drop an audio file</strong>
              <span className="muted">or click to browse · WAV, MP3, OGG, M4A</span>
            </label>

            {error && <p className="error">⚠ {error}</p>}
          </Reveal>

          <div className="stack">
            <Reveal as="section" className="card pipeline-card" delay={80}>
              <p className="eyebrow">Pipeline</p>
              <ol className="pipeline">
                {PIPELINE.map((name, i) => (
                  <li
                    key={name}
                    className={processing ? (i <= step ? "on" : "") : result ? "done" : ""}
                  >
                    <span className="num">{i + 1}</span>
                    {name}
                  </li>
                ))}
              </ol>
            </Reveal>

            {result ? (
              <ResultCard result={result} threshold={health.minConfidence} />
            ) : (
              <Reveal as="section" className="card placeholder" delay={140}>
                <p className="eyebrow">Result</p>
                <p className="muted">
                  {processing
                    ? "Extracting MFCC features and running the BiLSTM…"
                    : "Record or upload a voice sample to see who is speaking."}
                </p>
                {health.speakers.length > 0 && (
                  <div className="chips">
                    {health.speakers.map((s) => (
                      <span key={s} className="chip">{s}</span>
                    ))}
                  </div>
                )}
              </Reveal>
            )}

            {history.length > 0 && (
              <Reveal as="section" className="card" delay={200}>
                <p className="eyebrow">Recent</p>
                <ul className="history">
                  {history.map((h, i) => (
                    <li key={i}>
                      <span className="h-name">{h.speaker}</span>
                      <span className="muted h-src">{h.label}</span>
                      <span className="h-conf">{Math.round(h.confidence * 100)}%</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
          </div>
        </main>
      )}

      <footer className="muted foot">
        Closed-set identification: the model only chooses among the enrolled speakers.
      </footer>
    </div>
  );
}

function MicIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v4" />
    </svg>
  );
}
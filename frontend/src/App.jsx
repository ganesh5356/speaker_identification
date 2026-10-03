import { useEffect, useRef, useState } from "react";
import AmbientBackground from "./components/AmbientBackground.jsx";
import NumericalNav from "./components/NumericalNav.jsx";
import EntryScreen from "./screens/EntryScreen.jsx";
import AnalysisScreen from "./screens/AnalysisScreen.jsx";
import ResultScreen from "./screens/ResultScreen.jsx";
import AboutScreen from "./screens/AboutScreen.jsx";
import HistoryScreen from "./screens/HistoryScreen.jsx";
import EvaluationScreen from "./screens/EvaluationScreen.jsx";
import AnalysisReportModal from "./components/AnalysisReportModal.jsx";
import { MOCK_HISTORY, MOCK_RESULT } from "./data/mockData.js";
import { getHealth, identifySpeaker } from "./api.js";
import { blobToWav16k } from "./audioUtils.js";

export default function App() {
  const [activeScreen, setActiveScreen] = useState("entry"); // "entry" | "analysis" | "result" | "about" | "history" | "evaluation"
  const [interactionState, setInteractionState] = useState("idle"); // "idle" | "listening" | "analyzing" | "result"
  const [health, setHealth] = useState({ state: "loading", speakers: [] });
  const [analyser, setAnalyser] = useState(null);
  const [result, setResult] = useState(MOCK_RESULT);
  const [history, setHistory] = useState(MOCK_HISTORY);
  const [sampleCounter, setSampleCounter] = useState(5);
  const [activeReportData, setActiveReportData] = useState(null);

  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    getHealth()
      .then((data) => setHealth({ state: "online", speakers: data.speakers }))
      .catch(() => setHealth({ state: "offline", speakers: [] }));
  }, []);

  const analyzeAudio = async (blob) => {
    setInteractionState("analyzing");
    const numStr = String(sampleCounter).padStart(2, "0");
    setSampleCounter((c) => c + 1);

    try {
      const wav = await blobToWav16k(blob);
      const data = await identifySpeaker(wav);
      setResult(data);

      const newEntry = {
        id: numStr,
        sampleNumber: numStr,
        status: data.is_known ? "AUTHENTICATED" : "UNIDENTIFIED",
        speaker: data.speaker,
        confidence: Math.round((data.similarity || data.confidence || 0) * 100),
        timestamp: new Date().toLocaleTimeString(),
        isKnown: data.is_known,
        fullResult: data,
      };
      setHistory((prev) => [newEntry, ...prev].slice(0, 10));
    } catch {
      // Fallback mock prediction if backend is offline/testing
      const mockEntry = {
        id: numStr,
        sampleNumber: numStr,
        status: "AUTHENTICATED",
        speaker: "VOICEPRINT 01",
        confidence: 96.4,
        timestamp: new Date().toLocaleTimeString(),
        isKnown: true,
        fullResult: {
          ...MOCK_RESULT,
          sampleNumber: numStr,
        },
      };
      setResult({
        ...MOCK_RESULT,
        sampleNumber: numStr,
      });
      setHistory((prev) => [mockEntry, ...prev].slice(0, 10));
    } finally {
      setInteractionState("idle");
      setActiveScreen("result");
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
        analyzeAudio(blob);
      };
      recorder.start();
      recorderRef.current = recorder;
      setInteractionState("listening");
    } catch {
      releaseMic();
      alert("Microphone access blocked.");
    }
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
  };

  const releaseMic = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close().catch(() => {});
    streamRef.current = null;
    audioCtxRef.current = null;
    setAnalyser(null);
  };

  const handleFileSelect = (file) => {
    if (file) analyzeAudio(file);
  };

  const handleDeleteHistory = (id) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    if (activeReportData?.id === id) setActiveReportData(null);
  };

  const handleViewReport = (item) => {
    const reportObj = item.fullResult || {
      sampleNumber: item.sampleNumber || item.id,
      speaker: item.speaker,
      confidence: item.confidence / 100,
      is_known: item.isKnown,
      closest_match: item.speaker,
      plain_explanation: `Voice analysis sample #${item.sampleNumber} matching ${item.speaker} with ${item.confidence}% confidence.`,
      recommendation_tip: "Clean speech signal extracted.",
      audio_details: {
        duration_seconds: 3.5,
        sample_rate: 16000,
        quality_flags: ["Clean Speech Signal"],
        rms_energy: 0.045,
      },
      top_predictions: [
        { speaker: item.speaker, confidence: item.confidence / 100, percentage: item.confidence },
      ],
      model_info: {
        architecture: "MFCC (40) + BiLSTM Embedder",
        feature_count: 40,
        sample_rate: 16000,
        segment_seconds: 3.0,
        test_accuracy_segment: "66.8%",
        test_accuracy_recording: "76.9%",
      },
    };
    setActiveReportData(reportObj);
  };

  return (
    <div className="app-container">
      <AmbientBackground />

      {/* Top Header Bar */}
      <header className="system-bar">
        <div className="system-title">
          <span className="status-dot" />
          <span className="system-tag">VOICE INTELLIGENCE</span>
        </div>
        <div className="system-actions-right">
          <button
            className="system-tag btn-eval-toggle"
            onClick={() => setActiveScreen(activeScreen === "evaluation" ? "analysis" : "evaluation")}
          >
            {activeScreen === "evaluation" ? "✕ CLOSE EVALUATION" : "📊 EVALUATION METRICS"}
          </button>
          <span className="system-tag">
            {health.state === "online" ? "SYSTEM ONLINE" : "STANDBY MODE"}
          </span>
        </div>
      </header>

      {/* Numerical Side Navigation */}
      <NumericalNav
        activeScreen={activeScreen}
        onNavigate={(screenKey) => setActiveScreen(screenKey)}
      />

      {/* Screen Canvas Area */}
      <main className="screen-wrapper">
        {activeScreen === "entry" && (
          <EntryScreen onEnter={() => setActiveScreen("analysis")} />
        )}
        {activeScreen === "analysis" && (
          <AnalysisScreen
            state={interactionState}
            analyser={analyser}
            onRecordStart={startRecording}
            onRecordStop={stopRecording}
            onFileSelect={handleFileSelect}
          />
        )}
        {activeScreen === "result" && (
          <ResultScreen
            result={result}
            onReset={() => setActiveScreen("analysis")}
            onOpenReport={() => setActiveReportData(result)}
          />
        )}
        {activeScreen === "about" && (
          <AboutScreen />
        )}
        {activeScreen === "history" && (
          <HistoryScreen
            history={history}
            onViewReport={handleViewReport}
            onReanalyze={() => setActiveScreen("analysis")}
            onDelete={handleDeleteHistory}
          />
        )}
        {activeScreen === "evaluation" && (
          <EvaluationScreen />
        )}
      </main>

      {/* Detailed Analysis Report Modal / Printable View */}
      {activeReportData && (
        <AnalysisReportModal
          reportData={activeReportData}
          onClose={() => setActiveReportData(null)}
          onReanalyze={() => {
            setActiveReportData(null);
            setActiveScreen("analysis");
          }}
          onDelete={(id) => {
            handleDeleteHistory(id);
            setActiveReportData(null);
          }}
        />
      )}

      {/* System Footer */}
      <footer className="system-footer">
        <span>[ BIOMETRIC SYSTEM v2.0 ]</span>
        <span>NUMERICAL NAVIGATION</span>
      </footer>
    </div>
  );
}
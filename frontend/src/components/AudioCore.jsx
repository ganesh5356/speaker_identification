import { useRef, useState, useEffect } from "react";
import { Mic, Square, UploadCloud, Radio, Sparkles, AlertCircle } from "lucide-react";
import VisualizerCanvas from "./VisualizerCanvas.jsx";

export default function AudioCore({
  state = "idle", // "idle" | "listening" | "analyzing" | "result"
  sampleNum = "01",
  analyser = null,
  onRecordStart,
  onRecordStop,
  onFileSelect,
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);

  // Live recording timer
  useEffect(() => {
    let timer = null;
    if (state === "listening") {
      setRecSeconds(0);
      timer = setInterval(() => {
        setRecSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecSeconds(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [state]);

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const getStateText = () => {
    switch (state) {
      case "listening":
        return {
          num: "02",
          status: "RECORDING SPEECH",
          desc: `RECORDING ACTIVE (${formatTimer(recSeconds)}) — SPEAK CLEARLY INTO MICROPHONE`,
        };
      case "analyzing":
        return {
          num: "03",
          status: "ANALYZING VOICE",
          desc: "EXTRACTING MFCCs & BIOMETRIC HYPERSPHERE EMBEDDINGS...",
        };
      case "result":
        return {
          num: "04",
          status: "SCAN COMPLETED",
          desc: "ACOUSTIC ANALYSIS & FORENSICS READY",
        };
      default:
        return {
          num: "01",
          status: "SYSTEM READY",
          desc: "TAP MICROPHONE TO RECORD OR DROP AUDIO FILE BELOW",
        };
    }
  };

  const info = getStateText();

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      onFileSelect(files[0]);
    }
  };

  return (
    <div className={`audio-core-container state-${state}`}>
      {/* Outer Decorative Frequency Rings */}
      <div className="ring-outer anim-spin" />
      <div className={`ring-pulse ${state === "listening" ? "active" : ""}`} />

      {/* Main Circular Interaction Sphere */}
      <div className="core-sphere">
        <div className="core-content">
          <div className="core-header-pill">
            <span className="core-num">{info.num}</span>
            {state === "listening" ? (
              <span className="rec-live-tag">
                <Radio size={12} className="rec-live-icon" />
                <span>{formatTimer(recSeconds)}</span>
              </span>
            ) : (
              <span className="core-standby-tag">STANDBY</span>
            )}
          </div>

          <h2 className="core-status">{info.status}</h2>

          {/* Real-Time Live Waveform Visualizer */}
          <VisualizerCanvas analyser={analyser} active={state === "listening"} />

          {/* Interactive Trigger Button */}
          <div className="core-controls">
            {state === "listening" ? (
              <button
                className="btn-core stop"
                onClick={onRecordStop}
                title="Stop recording and analyze audio"
                aria-label="Stop recording"
              >
                <Square size={20} className="btn-core-icon" />
                <span className="btn-core-hint">STOP</span>
              </button>
            ) : (
              <button
                className="btn-core start"
                onClick={onRecordStart}
                disabled={state === "analyzing"}
                title="Start microphone recording"
                aria-label="Start recording"
              >
                <Mic size={24} className="btn-core-icon" />
                <span className="btn-core-hint">RECORD</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Real-time contextual description */}
      <p className="core-desc">{info.desc}</p>

      {/* Drag & Drop Audio Upload Target */}
      <div
        className={`waveform-drop-trigger ${isDragging ? "drag-over" : ""}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        title="Click to browse audio file or drag & drop WAV/MP3 here"
      >
        <input
          type="file"
          accept="audio/*"
          ref={fileInputRef}
          hidden
          onChange={(e) => e.target.files[0] && onFileSelect(e.target.files[0])}
        />

        <div className="drop-icon-wrap">
          <UploadCloud size={20} className="drop-upload-icon" />
        </div>

        <div className="drop-text-group">
          <span className="drop-code">
            {isDragging ? "DROP AUDIO FILE HERE" : "CHOOSE OR DRAG AUDIO FILE"}
          </span>
          <span className="drop-hint">WAV, MP3, FLAC, OGG &bull; UP TO 25MB</span>
        </div>
      </div>
    </div>
  );
}

import { useRef } from "react";
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

  const getStateText = () => {
    switch (state) {
      case "listening":
        return { num: "02", status: "LISTENING", desc: "RECORDING LIVE AUDIO STREAM..." };
      case "analyzing":
        return { num: "03", status: "ANALYZING", desc: "PROCESSING VOICEPRINT EMBEDDINGS..." };
      case "result":
        return { num: "04", status: "COMPLETED", desc: "ANALYSIS COMPLETED" };
      default:
        return { num: "01", status: "READY", desc: "PRESS TO START SYSTEM SCAN" };
    }
  };

  const info = getStateText();

  return (
    <div className={`audio-core-container state-${state}`}>
      {/* Outer Decorative Frequency Rings */}
      <div className="ring-outer anim-spin" />
      <div className={`ring-pulse ${state === "listening" ? "active" : ""}`} />

      {/* Main Circular Interaction Sphere */}
      <div className="core-sphere">
        <div className="core-content">
          <span className="core-num">{info.num}</span>
          <h2 className="core-status">{info.status}</h2>

          <VisualizerCanvas analyser={analyser} active={state === "listening"} />

          {/* Interactive Trigger Button */}
          <div className="core-controls">
            {state === "listening" ? (
              <button className="btn-core stop" onClick={onRecordStop}>
                <span className="stop-square" />
              </button>
            ) : (
              <button
                className="btn-core start"
                onClick={onRecordStart}
                disabled={state === "analyzing"}
              >
                <span className="mic-dot" />
              </button>
            )}
          </div>
        </div>
      </div>

      <p className="core-desc">{info.desc}</p>

      {/* Alternate Waveform Upload Trigger */}
      <div className="waveform-drop-trigger" onClick={() => fileInputRef.current?.click()}>
        <input
          type="file"
          accept="audio/*"
          ref={fileInputRef}
          hidden
          onChange={(e) => e.target.files[0] && onFileSelect(e.target.files[0])}
        />
        <span className="drop-code">WAVEFORM INPUT</span>
        <span className="drop-hint">[ CLICK OR DROP AUDIO FILE ]</span>
      </div>
    </div>
  );
}

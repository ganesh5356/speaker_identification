import React from 'react';
import { 
  Cpu, 
  ShieldCheck, 
  Mic, 
  Activity, 
  Layers, 
  Lock, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Volume2
} from 'lucide-react';

export default function AboutScreen() {
  const PILLARS = [
    {
      icon: Cpu,
      color: "text-violet",
      bg: "bg-violet-glow",
      title: "BiLSTM Hypersphere Embedder",
      desc: "Two-stage Bidirectional LSTM with recurrent L2 regularizers and unit normalization that maps speech temporal trajectories onto a 64-D unit hypersphere."
    },
    {
      icon: ShieldCheck,
      color: "text-emerald",
      bg: "bg-emerald-glow",
      title: "Open-Set Centroid Rejection",
      desc: "Replaces naive closed-set softmax classification with centroid cosine metric learning (τ = 0.52, Δ = 0.05), reliably rejecting unenrolled voices and impostors."
    },
    {
      icon: Mic,
      color: "text-cyan",
      bg: "bg-cyan-glow",
      title: "100% Offline Whisper ASR",
      desc: "OpenAI Whisper base neural speech engine (quantized int8) with Voice Activity Detection (VAD) delivering accurate, private on-device transcription."
    },
    {
      icon: Activity,
      color: "text-amber",
      bg: "bg-amber-glow",
      title: "Wav2Vec2 Deepfake Forensics",
      desc: "Neural sequence classifier on ONNX Runtime paired with pitch trajectory and spectral naturalness variance to detect synthetic and cloned voices."
    }
  ];

  const PIPELINE_STEPS = [
    { num: "01", name: "Audio Ingestion", note: "16 kHz Mono &bull; DC Centered &bull; 25dB Silence Trim" },
    { num: "02", name: "MFCC Extraction", note: "120-dim features (40 Static + 40 Δ + 40 ΔΔ)" },
    { num: "03", name: "BiLSTM Embedder", note: "301 frames &rarr; 64-D Hypersphere Vector" },
    { num: "04", name: "Centroid Match", note: "Cosine Sim against 15+ Enrolled Voiceprints" },
    { num: "05", name: "Forensics & ASR", note: "Whisper Speech-to-Text & Wav2Vec2 Deepfake Check" },
    { num: "06", name: "Audit Console", note: "Multi-modal Dashboard & Formal PDF Report" }
  ];

  const SPECS = [
    { label: "SAMPLING RATE", value: "16,000 Hz", sub: "Standardized Mono PCM" },
    { label: "FEATURE VECTOR", value: "120 Dimensions", sub: "Static + Δ + ΔΔ MFCCs" },
    { label: "ANALYSIS WINDOW", value: "3.0 Seconds", sub: "301 Temporal Frames" },
    { label: "REJECTION THRESHOLD", value: "τ = 0.52", sub: "Margin Δ = 0.05" },
    { label: "RECORDING ACCURACY", value: "100.00%", sub: "44 Unseen Test Files" },
    { label: "SYSTEM LATENCY", value: "< 850 ms", sub: "Standard Consumer CPU" }
  ];

  return (
    <div className="screen-about anim-fade-up">
      <div className="about-center-container">
        
        {/* Top Header Tag */}
        <div className="about-badge-row">
          <span className="about-system-pill">
            <Sparkles size={12} className="text-violet" />
            <span>PROJECT SPECIFICATIONS & ARCHITECTURE</span>
          </span>
          <span className="about-phase-pill">PHASE-II MAJOR PROJECT (23CSE750)</span>
        </div>

        {/* Display Title */}
        <h1 className="text-display-giant about-title">
          VOICE BIOMETRIC<br />
          <span className="title-accent-glow">INTELLIGENCE</span> CONSOLE
        </h1>

        <p className="text-sub about-intro">
          An open-set acoustic speaker verification and forensic platform engineered with 
          deep Bidirectional LSTMs, metric learning, offline Whisper ASR, and neural deepfake voice detection.
        </p>

        {/* 4 Core Technology Pillars */}
        <div className="about-pillars-grid">
          {PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div key={idx} className="about-pillar-card">
                <div className={`pillar-icon-box ${pillar.bg}`}>
                  <Icon size={20} className={pillar.color} />
                </div>
                <h3 className="pillar-title">{pillar.title}</h3>
                <p className="pillar-desc">{pillar.desc}</p>
              </div>
            );
          })}
        </div>

        {/* System Pipeline Flow */}
        <div className="system-flow-section">
          <div className="flow-header-row">
            <span className="text-label flow-section-title">END-TO-END SYSTEM PIPELINE</span>
            <span className="flow-sub-hint">Synchronous Thread-Safe Processing</span>
          </div>

          <div className="system-flow-diagram modern">
            {PIPELINE_STEPS.map((step, idx) => (
              <React.Fragment key={step.num}>
                <div className="flow-step modern">
                  <span className="flow-num-tag">{step.num}</span>
                  <span className="flow-text">{step.name}</span>
                  <span className="flow-note" dangerouslySetInnerHTML={{ __html: step.note }} />
                </div>
                {idx < PIPELINE_STEPS.length - 1 && (
                  <div className="flow-connector">
                    <ArrowRight size={16} className="flow-arrow-icon" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* System Performance & Acoustic Specifications */}
        <div className="system-specs-section">
          <span className="text-label specs-title">CORE TECHNICAL SPECIFICATIONS</span>
          <div className="specs-grid">
            {SPECS.map((spec, i) => (
              <div key={i} className="spec-card">
                <span className="spec-label">{spec.label}</span>
                <span className="spec-val">{spec.value}</span>
                <span className="spec-sub">{spec.sub}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Technology Stack Tags */}
        <div className="technology-section">
          <span className="text-label tech-title">DEVELOPMENT STACK & FRAMEWORKS</span>
          <div className="tech-tags-list">
            <span className="tech-tag highlight">Python 3.12</span>
            <span className="tech-tag highlight">TensorFlow / Keras 2.21</span>
            <span className="tech-tag">Faster-Whisper (int8)</span>
            <span className="tech-tag">Wav2Vec2 ONNX Runtime</span>
            <span className="tech-tag">Librosa Audio DSP</span>
            <span className="tech-tag">Flask REST Backend</span>
            <span className="tech-tag">React 18 + Vite</span>
            <span className="tech-tag">HTML5 Web Audio API</span>
          </div>
        </div>

      </div>
    </div>
  );
}

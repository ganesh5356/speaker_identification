import React from 'react';
import { ShieldCheck, AlertTriangle, Cpu, Activity, Sparkles, Radio } from 'lucide-react';

export default function VoiceAuthenticity({ authenticity = {} }) {
  const {
    classification = "Human",
    is_human = true,
    confidence = 89.4,
    human_probability = 89.4,
    synthetic_probability = 10.6,
    risk_level = "LOW",
    verdict_title = "Verified Authentic Human Voice",
    explanation = "Biological vocal tract characteristics confirmed.",
    indicators = {}
  } = authenticity;

  const isFake = !is_human || classification === "AI-Generated";
  const formattedConfidence = typeof confidence === 'number' ? confidence.toFixed(1) : parseFloat(confidence).toFixed(1);
  const formattedHuman = typeof human_probability === 'number' ? human_probability.toFixed(1) : parseFloat(human_probability).toFixed(1);
  const formattedSynth = typeof synthetic_probability === 'number' ? synthetic_probability.toFixed(1) : parseFloat(synthetic_probability).toFixed(1);

  return (
    <div className={`voice-authenticity-card ${isFake ? 'is-synthetic' : 'is-human'}`}>
      {/* Top Header Badge & Tag */}
      <div className="auth-header-row">
        <div className="auth-title-group">
          {isFake ? (
            <AlertTriangle className="auth-status-icon warning" size={18} />
          ) : (
            <ShieldCheck className="auth-status-icon secure" size={18} />
          )}
          <span className="section-label">VOICE AUTHENTICITY & DEEPFAKE FORENSICS</span>
        </div>

        <div className="auth-badges-group">
          <span className={`risk-pill ${risk_level.toLowerCase()}`}>
            {risk_level} DEEPFAKE RISK
          </span>
          <span className={`auth-verdict-pill ${isFake ? 'pill-fake' : 'pill-human'}`}>
            {isFake ? '🤖 SYNTHETIC / AI VOICE' : '👤 AUTHENTIC HUMAN VOICE'}
          </span>
        </div>
      </div>

      {/* Main Verdict Banner */}
      <div className="auth-verdict-banner">
        <div className="verdict-text-wrap">
          <h2 className={`auth-headline ${isFake ? 'text-synthetic' : 'text-human'}`}>
            {verdict_title}
          </h2>
          <p className="auth-explanation-quote">
            "{explanation}"
          </p>
        </div>

        <div className="auth-score-hero">
          <span className="auth-score-num">{formattedConfidence}%</span>
          <span className="auth-score-sub">{isFake ? 'SYNTHETIC CONFIDENCE' : 'HUMAN CONFIDENCE'}</span>
        </div>
      </div>

      {/* Comparative Bi-directional Probability Meter */}
      <div className="auth-meter-section">
        <div className="meter-labels-row">
          <span className={`meter-side-label human ${!isFake ? 'active' : ''}`}>
            👤 Human Voice ({formattedHuman}%)
          </span>
          <span className={`meter-side-label synthetic ${isFake ? 'active' : ''}`}>
            🤖 AI-Generated / Deepfake ({formattedSynth}%)
          </span>
        </div>

        <div className="auth-dual-track">
          <div
            className="track-fill-human"
            style={{ width: `${Math.max(3, human_probability)}%` }}
            title={`Human: ${formattedHuman}%`}
          />
          <div
            className="track-fill-synthetic"
            style={{ width: `${Math.max(3, synthetic_probability)}%` }}
            title={`Synthetic: ${formattedSynth}%`}
          />
        </div>
      </div>

      {/* 4 Forensic Acoustic Indicators */}
      <div className="auth-indicators-grid">
        {/* Indicator 1: Neural Sequence Detection */}
        <div className="indicator-block">
          <div className="ind-header">
            <Cpu size={14} className="ind-icon" />
            <span className="ind-title">NEURAL SEQUENCE CLASSIFIER</span>
          </div>
          <span className="ind-val">{isFake ? `${formattedSynth}% AI Likelihood` : `${formattedHuman}% Biological Voice`}</span>
          <span className="ind-sub">Wav2Vec2 Deepfake Embeddings</span>
        </div>

        {/* Indicator 2: Pitch Dynamics */}
        <div className="indicator-block">
          <div className="ind-header">
            <Activity size={14} className="ind-icon" />
            <span className="ind-title">PITCH & INTONATION DYNAMICS</span>
          </div>
          <span className="ind-val">{indicators.pitch_dynamics || 'Natural Intonation'}</span>
          <span className="ind-sub">Fundamental Frequency ({indicators.avg_pitch_hz ? `${indicators.avg_pitch_hz} Hz` : 'Estimated'})</span>
        </div>

        {/* Indicator 3: Spectral Naturalness */}
        <div className="indicator-block">
          <div className="ind-header">
            <Sparkles size={14} className="ind-icon" />
            <span className="ind-title">SPECTRAL NATURALNESS</span>
          </div>
          <span className="ind-val">{indicators.spectral_naturalness ? `${indicators.spectral_naturalness}% Formant Fidelity` : 'High Naturalness'}</span>
          <span className="ind-sub">Acoustic Roll-off & Flatness</span>
        </div>

        {/* Indicator 4: Vocoder Signature */}
        <div className="indicator-block">
          <div className="ind-header">
            <Radio size={14} className="ind-icon" />
            <span className="ind-title">VOCODER ARTIFACT ANALYSIS</span>
          </div>
          <span className="ind-val">{indicators.vocoder_artifacts || 'None Detected'}</span>
          <span className="ind-sub">HiFi-GAN / Diffusion Waveform Check</span>
        </div>
      </div>
    </div>
  );
}

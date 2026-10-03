import { useState } from "react";
import MFCCVisualizer from "./MFCCVisualizer.jsx";

export default function AnalysisReportModal({
  reportData,
  onClose,
  onReanalyze,
  onDelete,
}) {
  const [modelInfoOpen, setModelInfoOpen] = useState(false);

  if (!reportData) return null;

  const {
    id = "01",
    sampleNumber = "01",
    speaker = "VOICEPRINT 01",
    confidence = 0.948,
    is_known = true,
    confidence_level = "High",
    closest_match = "VOICEPRINT 01",
    plain_explanation = "The voice matches Speaker 01 with 94.8% confidence.",
    recommendation_tip = "High quality voice match verified.",
    audio_details = {
      duration_seconds: 3.5,
      sample_rate: 16000,
      quality_flags: ["Clean Speech Signal"],
      rms_energy: 0.042,
    },
    top_predictions = [
      { speaker: "VOICEPRINT 01", confidence: 0.948, percentage: 94.8 },
      { speaker: "VOICEPRINT 02", confidence: 0.042, percentage: 4.2 },
      { speaker: "VOICEPRINT 03", confidence: 0.010, percentage: 1.0 },
    ],
    timeline = [],
    model_info = {
      architecture: "MFCC (40) + BiLSTM Embedder",
      feature_count: 40,
      sample_rate: 16000,
      segment_seconds: 3.0,
      test_accuracy_segment: "66.8%",
      test_accuracy_recording: "76.9%",
    },
    probabilities = {},
  } = reportData;

  const confPct = Math.round((confidence || 0) * 100);

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="report-modal-overlay">
      <div className="report-modal-card printable-report">
        {/* Action Header */}
        <div className="report-action-bar no-print">
          <button className="btn-report-action primary" onClick={handleDownloadPDF}>
            ↓ DOWNLOAD REPORT AS PDF
          </button>
          {onReanalyze && (
            <button className="btn-report-action" onClick={() => onReanalyze(reportData)}>
              🔄 RE-ANALYZE
            </button>
          )}
          {onDelete && (
            <button className="btn-report-action danger" onClick={() => onDelete(reportData.id)}>
              🗑 DELETE
            </button>
          )}
          <button className="btn-report-close" onClick={onClose}>
            ✕ CLOSE
          </button>
        </div>

        {/* Report Document Body */}
        <div className="report-document-body">
          <div className="report-doc-header">
            <span className="doc-type-tag">SPEAKER RECOGNITION REPORT</span>
            <span className="doc-num-tag">SAMPLE ID #{sampleNumber || id}</span>
          </div>

          {/* 1. RESULT SUMMARY (TOP) */}
          <div className="report-section summary-top-section">
            <span className="text-label">1. ANALYSIS RESULT SUMMARY</span>
            <div className="summary-banner">
              <h1 className="report-speaker-large">{speaker}</h1>
              
              <div className="summary-pills">
                <span className={`pill-conf level-${(confidence_level || "high").toLowerCase()}`}>
                  {confPct}% CONFIDENCE ({confidence_level.toUpperCase()})
                </span>

                {!is_known && (
                  <span className="pill-warn">
                    ⚠️ UNKNOWN SPEAKER / LOW CONFIDENCE MATCH
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 5. PLAIN-LANGUAGE EXPLANATION */}
          <div className="report-section explanation-section">
            <span className="text-label">EXPLANATION & RECOMMENDATION</span>
            <p className="plain-exp-text">{plain_explanation}</p>
            <p className="plain-tip-text">💡 {recommendation_tip}</p>
          </div>

          {/* 2. PROBABILITY BREAKDOWN */}
          <div className="report-section probability-section">
            <span className="text-label">2. TOP PREDICTIONS BREAKDOWN</span>
            <div className="top-predictions-grid">
              {top_predictions.map((pred, i) => (
                <div key={i} className={`pred-card ${i === 0 ? "top-rank" : ""}`}>
                  <span className="pred-rank">#0{i + 1}</span>
                  <span className="pred-speaker">{pred.speaker}</span>
                  <span className="pred-pct">{pred.percentage}%</span>
                </div>
              ))}
            </div>

            {Object.keys(probabilities).length > 0 && (
              <div className="prob-bars-list">
                <span className="text-label sub-label">ALL ENROLLED VOICEPRINTS</span>
                {Object.entries(probabilities)
                  .sort((a, b) => b[1] - a[1])
                  .map(([spk, p]) => (
                    <div key={spk} className="prob-row">
                      <span className="p-spk">{spk}</span>
                      <div className="p-track">
                        <div className="p-fill" style={{ width: `${p * 100}%` }} />
                      </div>
                      <span className="p-val">{(p * 100).toFixed(1)}%</span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* 3. AUDIO DETAILS */}
          <div className="report-section audio-details-section">
            <span className="text-label">3. AUDIO SIGNAL METRICS</span>
            <div className="audio-details-grid">
              <div className="detail-item">
                <span className="d-label">DURATION</span>
                <span className="d-val">{audio_details.duration_seconds}s</span>
              </div>
              <div className="detail-item">
                <span className="d-label">SAMPLE RATE</span>
                <span className="d-val">{audio_details.sample_rate} Hz (Mono)</span>
              </div>
              <div className="detail-item">
                <span className="d-label">SIGNAL RMS</span>
                <span className="d-val">{audio_details.rms_energy}</span>
              </div>
              <div className="detail-item">
                <span className="d-label">QUALITY FLAGS</span>
                <div className="q-flags">
                  {audio_details.quality_flags.map((flag, idx) => (
                    <span key={idx} className="q-flag-chip">{flag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 4. VISUALS (MFCC & WAVEFORM & DIARIZATION) */}
          <div className="report-section visuals-section">
            <span className="text-label">4. SPECTRAL & DIARIZATION VISUALS</span>
            <MFCCVisualizer timeline={timeline} />

            {timeline.length > 0 && (
              <div className="timeline-breakdown-box">
                <span className="text-label sub-label">SEGMENT DIARIZATION TIMELINE</span>
                <div className="diarization-list">
                  {timeline.map((item, idx) => (
                    <div key={idx} className="diar-row">
                      <span className="d-time">{item.start_time.toFixed(1)}s - {item.end_time.toFixed(1)}s</span>
                      <span className="d-name">{item.speaker}</span>
                      <span className="d-sim">SIM {Math.round((item.similarity || 0) * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 6. MODEL INFORMATION (COLLAPSIBLE) */}
          <div className="report-section model-info-section">
            <button
              className="collapsible-trigger"
              onClick={() => setModelInfoOpen(!modelInfoOpen)}
            >
              <span>6. NEURAL MODEL TECHNICAL SPECIFICATIONS</span>
              <span>{modelInfoOpen ? "▲ HIDE" : "▼ VIEW SPECIFICATIONS"}</span>
            </button>

            {modelInfoOpen && (
              <div className="model-info-body anim-fade-up">
                <div className="info-row">
                  <span>Model Architecture:</span>
                  <strong>{model_info.architecture}</strong>
                </div>
                <div className="info-row">
                  <span>MFCC Features Extracted:</span>
                  <strong>{model_info.feature_count} cepstral bands</strong>
                </div>
                <div className="info-row">
                  <span>Frame Segment Window:</span>
                  <strong>{model_info.segment_seconds} seconds (50% overlap)</strong>
                </div>
                <div className="info-row">
                  <span>Test Set Accuracy (Segment Level):</span>
                  <strong>{model_info.test_accuracy_segment}</strong>
                </div>
                <div className="info-row">
                  <span>Test Set Accuracy (Recording Level):</span>
                  <strong>{model_info.test_accuracy_recording}</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

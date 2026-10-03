import { useEffect, useState } from "react";

const RADIUS = 52;
const CIRC = 2 * Math.PI * RADIUS;

export default function ResultCard({ result, sampleId = 1 }) {
  const {
    speaker,
    is_known,
    confidence,
    closest_match,
    probabilities,
    speaker_count,
    multi_speaker,
    active_speakers,
    summary,
    timeline,
  } = result;

  const [shown, setShown] = useState(false);

  useEffect(() => {
    setShown(false);
    const t = setTimeout(() => setShown(true), 60);
    return () => clearTimeout(t);
  }, [result]);

  const sorted = probabilities ? Object.entries(probabilities).sort((a, b) => b[1] - a[1]) : [];
  const highlightName = is_known ? speaker : null;
  const sampleNumStr = String(sampleId).padStart(2, "0");

  return (
    <section className={`card result-card ${is_known ? "verified" : "unverified"}`}>
      <div className="card-top-row">
        <span className="eyebrow">PREDICTION RESULT</span>
        <span className="sample-badge">{sampleNumStr}</span>
      </div>

      <div className="result-head">
        <div className="ring">
          <svg viewBox="0 0 120 120">
            <circle className="ring-bg" cx="60" cy="60" r={RADIUS} />
            <circle
              className="ring-fg"
              cx="60"
              cy="60"
              r={RADIUS}
              strokeDasharray={CIRC}
              strokeDashoffset={shown ? CIRC * (1 - (confidence || 0)) : CIRC}
            />
          </svg>
          <div className="ring-content">
            <span className="ring-val">{Math.round((confidence || 0) * 100)}%</span>
            <span className="ring-label">MATCH</span>
          </div>
        </div>

        <div className="result-info">
          {multi_speaker ? (
            <div className="badge-tag multi">MULTI-SPEAKER DETECTED</div>
          ) : is_known ? (
            <div className="badge-tag known">AUTHENTICATED VOICEPRINT</div>
          ) : (
            <div className="badge-tag unknown">UNIDENTIFIED VOICEPRINT</div>
          )}

          {is_known ? (
            <h2 className="speaker-name">{speaker}</h2>
          ) : (
            <>
              <h2 className="speaker-name unknown-name">UNKNOWN VOICE</h2>
              <p className="warn">
                Closest voiceprint match: <strong>{closest_match}</strong> ({Math.round((confidence || 0) * 100)}%)
              </p>
            </>
          )}

          {summary && <p className="summary-text">{summary}</p>}
        </div>
      </div>

      {timeline && timeline.length > 0 && (
        <div className="timeline-section">
          <p className="section-subtitle">SPEAKER DIARIZATION TIMELINE</p>
          <div className="timeline-list">
            {timeline.map((item, idx) => (
              <div key={idx} className={`timeline-item ${item.is_known ? "known-item" : "unknown-item"}`}>
                <span className="time-range">{item.start_time.toFixed(1)}s - {item.end_time.toFixed(1)}s</span>
                <span className="timeline-speaker">{item.speaker}</span>
                <span className="timeline-sim">SIM {(item.similarity * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </section>
  );
}
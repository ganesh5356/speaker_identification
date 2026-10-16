import React from 'react';
import { ShieldCheck, UserCheck, UserX } from 'lucide-react';

export function ProbabilityChart({ probabilities = [], predictedSpeaker }) {
  const chartData = probabilities.length > 0 ? probabilities : [
    { speaker: "Speaker A", probability: 92 },
    { speaker: "Speaker B", probability: 5 },
    { speaker: "Speaker C", probability: 2 },
    { speaker: "Speaker D", probability: 1 }
  ];

  return (
    <div className="probability-chart-card professional-chart-card">
      <div className="prob-header-row">
        <div className="prob-title-group">
          <ShieldCheck size={16} className="text-emerald" />
          <span className="section-label">BIOMETRIC MATCH PROBABILITIES</span>
        </div>
        <span className="prob-meta-sub">TOP ENROLLED CANDIDATES</span>
      </div>

      <div className="chart-bars-container">
        {chartData.map((item, idx) => {
          const isTop = idx === 0 || (predictedSpeaker && item.speaker === predictedSpeaker);
          const prob = Number(item.probability) || 0;

          return (
            <div key={idx} className={`prob-row-item ${isTop ? 'is-top-candidate' : ''}`}>
              <div className="prob-speaker-identity">
                {isTop ? (
                  <UserCheck size={14} className="candidate-icon text-emerald" />
                ) : (
                  <span className="candidate-rank-bullet">{idx + 1}</span>
                )}
                <span className={`prob-speaker-label ${isTop ? 'is-top' : ''}`}>
                  {item.speaker}
                </span>
                {isTop && <span className="top-match-badge">PRIMARY</span>}
              </div>

              <div className="prob-bar-track">
                <div
                  className={`prob-bar-fill ${isTop ? 'is-top' : ''}`}
                  style={{ width: `${Math.max(prob, 2)}%` }}
                />
              </div>

              <div className="prob-pct-wrapper">
                <span className={`prob-pct-val ${isTop ? 'is-top' : ''}`}>
                  {prob}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProbabilityChart;

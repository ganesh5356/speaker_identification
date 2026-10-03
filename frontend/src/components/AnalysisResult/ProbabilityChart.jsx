import React from 'react';

export function ProbabilityChart({ probabilities = [], predictedSpeaker }) {
  const chartData = probabilities.length > 0 ? probabilities : [
    { speaker: "Speaker A", probability: 92 },
    { speaker: "Speaker B", probability: 5 },
    { speaker: "Speaker C", probability: 2 },
    { speaker: "Speaker D", probability: 1 }
  ];

  return (
    <div className="probability-chart-card">
      <div className="section-label">PROBABILITY DISTRIBUTION</div>
      <div className="chart-bars-container">
        {chartData.map((item, idx) => {
          const isTop = idx === 0 || (predictedSpeaker && item.speaker === predictedSpeaker);
          return (
            <div key={idx} className="prob-row-item">
              <span className={`prob-speaker-label ${isTop ? 'is-top' : ''}`}>
                {item.speaker}
              </span>
              <div className="prob-bar-track">
                <div
                  className={`prob-bar-fill ${isTop ? 'is-top' : ''}`}
                  style={{ width: `${Math.max(item.probability, 1)}%` }}
                />
              </div>
              <span className={`prob-pct-val ${isTop ? 'is-top' : ''}`}>
                {item.probability}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProbabilityChart;

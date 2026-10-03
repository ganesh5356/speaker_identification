import React from 'react';

const FeatureHeatmap = ({ mfccData = [] }) => {
  // Mock 12x20 matrix if no data passed
  const rows = 10;
  const cols = 24;

  const getHeatmapColor = (r, c) => {
    if (mfccData && mfccData.length > 0 && mfccData[r] && mfccData[r][c] !== undefined) {
      const val = mfccData[r][c]; // 0 to 1
      return `hsla(${270 - val * 120}, 85%, ${25 + val * 45}%, 0.85)`;
    }
    // Dynamic synth pattern for mock visual
    const synthVal = Math.sin(r * 0.5) * Math.cos(c * 0.4) * 0.5 + 0.5;
    const hue = 260 + synthVal * 90; // purple to cyan
    const lightness = 15 + synthVal * 55;
    return `hsla(${hue}, 80%, ${lightness}%, 0.85)`;
  };

  return (
    <div className="feature-heatmap-card">
      <div className="heatmap-header">
        <span className="section-label">SPECTROGRAM / MFCC HEATMAP</span>
        <span className="heatmap-tag">13 COEFFICIENTS</span>
      </div>

      <div className="heatmap-grid-container">
        <div className="heatmap-matrix">
          {Array.from({ length: rows }).map((_, rIdx) => (
            <div key={rIdx} className="heatmap-row">
              {Array.from({ length: cols }).map((_, cIdx) => (
                <div
                  key={cIdx}
                  className="heatmap-cell"
                  style={{ backgroundColor: getHeatmapColor(rIdx, cIdx) }}
                  title={`Coeff ${rIdx + 1}, Frame ${cIdx + 1}`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="heatmap-axis-y">
          <span>Freq / Coeff</span>
        </div>
        <div className="heatmap-axis-x">
          <span>Time (Frames) →</span>
        </div>
      </div>

      <p className="heatmap-caption">
        Shows how the extracted acoustic features vary across time and frequency-related coefficients.
      </p>
    </div>
  );
};

export default FeatureHeatmap;

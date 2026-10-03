import React from 'react';

const Waveform = ({ waveformData = [] }) => {
  // Fallback futuristic waveform array if none provided
  const points = waveformData && waveformData.length > 0
    ? waveformData
    : [20, 35, 60, 45, 80, 95, 70, 40, 65, 85, 90, 50, 30, 65, 80, 55, 40, 25, 60, 75, 45, 30, 50, 35, 20];

  const maxVal = Math.max(...points, 100);

  return (
    <div className="waveform-card">
      <div className="waveform-header">
        <span className="section-label">AUDIO WAVEFORM ANALYZER</span>
        <span className="waveform-live-tag">RAW SIGNAL</span>
      </div>
      <div className="waveform-visual-container">
        <svg viewBox="0 0 500 120" className="waveform-svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="waveformGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(139, 92, 246, 0.4)" />
              <stop offset="50%" stopColor="rgba(168, 85, 247, 0.9)" />
              <stop offset="100%" stopColor="rgba(16, 185, 129, 0.6)" />
            </linearGradient>
            <linearGradient id="waveformAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(168, 85, 247, 0.25)" />
              <stop offset="100%" stopColor="rgba(168, 85, 247, 0.0)" />
            </linearGradient>
          </defs>

          {/* Background grid line */}
          <line x1="0" y1="60" x2="500" y2="60" stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="4 4" />

          {/* Continuous smoothed line path */}
          {(() => {
            const width = 500;
            const step = width / (points.length - 1);
            let pathD = `M 0 60`;
            let areaD = `M 0 60`;

            points.forEach((val, i) => {
              const x = i * step;
              const h = (val / maxVal) * 45;
              const y = 60 - h;
              pathD += ` L ${x} ${y}`;
              areaD += ` L ${x} ${y}`;
            });

            // Mirrors down for realistic audio waveform look
            for (let i = points.length - 1; i >= 0; i--) {
              const x = i * step;
              const h = (points[i] / maxVal) * 45;
              const y = 60 + h;
              areaD += ` L ${x} ${y}`;
            }

            areaD += ` Z`;

            return (
              <>
                <path d={areaD} fill="url(#waveformAreaGrad)" />
                <path d={pathD} fill="none" stroke="url(#waveformGrad)" strokeWidth="2.5" strokeLinecap="round" />
              </>
            );
          })()}
        </svg>

        {/* Dynamic vertical pulse bar animation overlay */}
        <div className="waveform-bars">
          {points.map((val, i) => (
            <div
              key={i}
              className="waveform-bar"
              style={{
                height: `${Math.max(12, (val / maxVal) * 100)}%`,
                animationDelay: `${(i * 0.04).toFixed(2)}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Waveform;

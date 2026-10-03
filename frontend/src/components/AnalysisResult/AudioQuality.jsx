import React from 'react';

const AudioQuality = ({ quality = {} }) => {
  const flags = [
    {
      label: 'LENGTH',
      status: quality.duration === 'too_short' ? 'TOO SHORT' : 'SUFFICIENT',
      ok: quality.duration !== 'too_short'
    },
    {
      label: 'NOISE',
      status: quality.noise === 'too_noisy' ? 'TOO NOISY' : 'ACCEPTABLE',
      ok: quality.noise !== 'too_noisy'
    },
    {
      label: 'VOLUME',
      status: quality.volume === 'too_quiet' || quality.volume === 'low' ? 'LOW' : 'GOOD',
      ok: quality.volume !== 'too_quiet' && quality.volume !== 'low'
    }
  ];

  return (
    <div className="audio-quality-container">
      <div className="section-label">AUDIO QUALITY</div>
      <div className="quality-grid">
        {flags.map((item, idx) => (
          <div key={idx} className={`quality-item ${item.ok ? 'is-good' : 'is-warning'}`}>
            <div className="quality-status-icon">
              {item.ok ? '✓' : '⚠'}
            </div>
            <div className="quality-info">
              <span className="quality-tag">{item.label}</span>
              <span className="quality-val">{item.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AudioQuality;

import React from 'react';

const LowConfidenceTips = ({ isVisible = true }) => {
  if (!isVisible) return null;

  const tips = [
    'Upload a longer recording (at least 5–10 seconds).',
    'Record in a quieter environment with minimal background noise.',
    'Keep the microphone closer to your mouth.',
    'Avoid overlapping or background conversations.',
    'Ensure the voice pitch and volume are clearly audible.'
  ];

  return (
    <div className="low-confidence-tips-card">
      <div className="tips-header">
        <span className="tips-icon">💡</span>
        <span className="tips-title">IMPROVE YOUR RECORDING</span>
      </div>
      <ul className="tips-list">
        {tips.map((tip, idx) => (
          <li key={idx} className="tip-item">
            <span className="tip-bullet">•</span> {tip}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LowConfidenceTips;

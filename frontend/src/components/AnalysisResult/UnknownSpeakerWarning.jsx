import React from 'react';

export function UnknownSpeakerWarning({ confidence = 42.8, threshold = 60 }) {
  const formattedPct = typeof confidence === 'number' ? confidence.toFixed(1) : parseFloat(confidence).toFixed(1);

  return (
    <div className="unknown-speaker-banner">
      <div className="warning-icon-wrap">⚠️</div>
      <div className="warning-content">
        <span className="warning-title">CONFIDENCE BELOW THRESHOLD</span>
        <span className="warning-desc">
          Confidence is below the identification threshold ({formattedPct}% achieved).
        </span>
        <span className="warning-req">{threshold}% required</span>
      </div>
    </div>
  );
}

export default UnknownSpeakerWarning;

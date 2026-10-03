import React from 'react';
import { getConfidenceState } from '../../utils/confidenceUtils';

export function ConfidenceScore({ confidence = 92.4, threshold = 60 }) {
  const { level, badgeText } = getConfidenceState(confidence, threshold);
  const formattedPct = typeof confidence === 'number' ? confidence.toFixed(1) : parseFloat(confidence).toFixed(1);

  return (
    <div className="confidence-score-container">
      <div className="confidence-val-wrap">
        <span className="confidence-number">{formattedPct}</span>
        <span className="confidence-pct-sign">%</span>
      </div>
      <div className="confidence-divider" />
      <div className={`confidence-badge ${level.toLowerCase()}`}>
        {badgeText}
      </div>
    </div>
  );
}

export default ConfidenceScore;

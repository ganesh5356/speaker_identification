import React from 'react';
import { getConfidenceState } from '../../utils/confidenceUtils';

export function SpeakerResult({ speaker = "SPEAKER A", confidence = 92.4, threshold = 60 }) {
  const { isUnknown } = getConfidenceState(confidence, threshold);
  const displayName = isUnknown ? "UNKNOWN SPEAKER" : speaker;

  return (
    <div className="speaker-result-container">
      <span className="speaker-subtitle">
        <span className="section-num">04</span> IDENTIFIED SPEAKER
      </span>
      <h1 className={`speaker-identity-title ${isUnknown ? 'unknown' : ''}`}>
        {displayName}
      </h1>
    </div>
  );
}

export default SpeakerResult;

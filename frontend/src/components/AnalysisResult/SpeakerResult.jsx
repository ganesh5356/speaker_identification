import React from 'react';
import { ShieldCheck, AlertTriangle, UserCheck, HelpCircle } from 'lucide-react';
import { getConfidenceState } from '../../utils/confidenceUtils';

export function SpeakerResult({ speaker = "SPEAKER A", confidence = 92.4, threshold = 52, isKnown }) {
  const { isUnknown: confidenceIsLow } = getConfidenceState(confidence, threshold);
  const isUnknown = isKnown !== undefined ? !isKnown : confidenceIsLow;
  const displayName = isUnknown ? "UNKNOWN SPEAKER" : speaker;

  return (
    <div className="speaker-result-container">
      <div className="speaker-header-tag-row">
        <span className="speaker-subtitle">
          {isUnknown ? (
            <HelpCircle size={14} className="text-amber" />
          ) : (
            <UserCheck size={14} className="text-emerald" />
          )}
          <span>VERIFIED SPEAKER IDENTITY</span>
        </span>
        <span className={`speaker-status-pill ${isUnknown ? 'unidentified' : 'authenticated'}`}>
          {isUnknown ? 'UNENROLLED VOICE' : 'ENROLLED VOICEPRINT'}
        </span>
      </div>

      <h1 className={`speaker-identity-title ${isUnknown ? 'unknown' : ''}`}>
        {displayName}
      </h1>
    </div>
  );
}

export default SpeakerResult;

"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

interface UnknownSpeakerWarningProps {
  confidence?: number;
  threshold?: number;
}

export function UnknownSpeakerWarning({ confidence = 42.8, threshold = 52 }: UnknownSpeakerWarningProps) {
  const formattedPct = typeof confidence === "number" ? confidence.toFixed(1) : parseFloat(confidence).toFixed(1);

  return (
    <div className="card p-4 border-l-4 border-l-amber-400 bg-amber-400/5 flex items-start gap-3">
      <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
      <div className="flex flex-col gap-0.5">
        <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-wider">
          OPEN-SET REJECTION: LOW MATCH CONFIDENCE
        </span>
        <p className="font-body text-xs text-text-muted">
          Extracted voice embeddings achieved {formattedPct}% similarity, which is below the required calibrated
          verification threshold of {threshold}%. Classified as an unenrolled / unknown speaker.
        </p>
      </div>
    </div>
  );
}

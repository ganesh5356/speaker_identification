"use client";

import React from "react";
import { UserCheck, HelpCircle } from "lucide-react";
import { getConfidenceState } from "@/lib/confidence";

interface SpeakerResultProps {
  speaker?: string;
  confidence?: number;
  threshold?: number;
  isKnown?: boolean;
}

export function SpeakerResult({
  speaker = "VOICEPRINT 01",
  confidence = 98.4,
  threshold = 52,
  isKnown,
}: SpeakerResultProps) {
  const { isUnknown: confidenceIsLow } = getConfidenceState(confidence, threshold);
  const isUnknown = isKnown !== undefined ? !isKnown : confidenceIsLow;
  const displayName = isUnknown ? "UNKNOWN SPEAKER" : speaker;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 font-mono text-2xs font-bold uppercase tracking-wider text-text-muted">
          {isUnknown ? (
            <HelpCircle size={13} className="text-amber-400" />
          ) : (
            <UserCheck size={13} className="text-accent-emerald" />
          )}
          <span>VERIFIED SPEAKER IDENTITY</span>
        </span>
        <span
          className={`px-2 py-0.5 rounded-full font-mono text-2xs font-bold uppercase tracking-wider ${
            isUnknown
              ? "bg-amber-400/10 text-amber-400 border border-amber-400/20"
              : "bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20"
          }`}
        >
          {isUnknown ? "UNENROLLED VOICE" : "ENROLLED VOICEPRINT"}
        </span>
      </div>

      <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tight text-text-main">
        {displayName}
      </h1>
    </div>
  );
}

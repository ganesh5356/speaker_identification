"use client";

import React from "react";
import { Lightbulb } from "lucide-react";

interface LowConfidenceTipsProps {
  isVisible?: boolean;
}

export function LowConfidenceTips({ isVisible = true }: LowConfidenceTipsProps) {
  if (!isVisible) return null;

  const tips = [
    "Provide a longer recording (at least 3–5 seconds of sustained speech).",
    "Reduce acoustic reverberation and ambient background noise.",
    "Position the microphone approximately 10–15 cm from the speaker's mouth.",
    "Avoid cross-talk, whispers, or competing background dialogue.",
    "Speak with a steady, natural conversational cadence.",
  ];

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb size={15} className="text-amber-400" />
        <span className="font-mono text-2xs font-bold tracking-[0.16em] uppercase text-text-muted">
          OPTIMIZATION RECOMMENDATIONS
        </span>
      </div>
      <ul className="flex flex-col gap-2 font-body text-xs text-text-muted">
        {tips.map((tip, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="font-mono text-accent-primary font-bold text-2xs mt-0.5">•</span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

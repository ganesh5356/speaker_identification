"use client";

import React from "react";
import { getConfidenceState } from "@/lib/confidence";

interface ConfidenceScoreProps {
  confidence?: number;
  threshold?: number;
}

export function ConfidenceScore({ confidence = 98.4, threshold = 52 }: ConfidenceScoreProps) {
  const { level, badgeText } = getConfidenceState(confidence, threshold);
  const formatted = typeof confidence === "number" ? confidence.toFixed(1) : parseFloat(confidence).toFixed(1);

  return (
    <div className="flex flex-col items-end justify-center">
      <div className="flex items-baseline gap-0.5">
        <span className="font-display text-4xl sm:text-5xl font-black tracking-tight text-text-main">
          {formatted}
        </span>
        <span className="font-display text-2xl font-black text-accent-primary">%</span>
      </div>
      <div
        className={`mt-1 px-2.5 py-0.5 rounded-full font-mono text-2xs font-bold uppercase tracking-wider ${
          level === "HIGH"
            ? "bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/30"
            : level === "MEDIUM"
            ? "bg-amber-400/10 text-amber-400 border border-amber-400/30"
            : "bg-accent-danger/10 text-accent-danger border border-accent-danger/30"
        }`}
      >
        {badgeText}
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { generatePlainSummary } from "@/lib/confidence";

interface AnalysisSummaryProps {
  speaker?: string;
  confidence?: number;
  probabilities?: Array<{ speaker: string; probability: number }>;
  summaryText?: string;
}

export function AnalysisSummary({
  speaker = "Speaker A",
  confidence = 92.4,
  probabilities = [],
  summaryText,
}: AnalysisSummaryProps) {
  const text = summaryText || generatePlainSummary(speaker, confidence, probabilities);

  return (
    <div className="card p-5">
      <span className="font-mono text-2xs font-bold tracking-[0.16em] uppercase text-text-muted block mb-2">
        EXECUTIVE SUMMARY
      </span>
      <p className="font-body text-xs sm:text-sm text-text-muted leading-relaxed italic">
        &ldquo;{text}&rdquo;
      </p>
    </div>
  );
}

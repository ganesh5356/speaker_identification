"use client";

import React from "react";
import type { AudioMeta } from "@/lib/data";

interface AudioDetailsProps {
  audio?: AudioMeta;
}

export function AudioDetails({ audio }: AudioDetailsProps) {
  const {
    id = "01",
    duration = "00:08",
    sampleRate = "16 kHz",
    analyzedAt = "03 OCT 2026 · 16:42",
  } = audio || {};

  return (
    <div className="card p-5">
      <span className="font-mono text-2xs font-bold tracking-[0.16em] uppercase text-text-muted block mb-3">
        AUDIO METRICS
      </span>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="flex flex-col">
          <span className="font-mono text-[10px] text-text-dim uppercase">SAMPLE ID</span>
          <span className="font-mono text-xs font-bold text-text-main">#{id}</span>
        </div>
        <div className="flex flex-col">
          <span className="font-mono text-[10px] text-text-dim uppercase">DURATION</span>
          <span className="font-mono text-xs font-bold text-text-main">{duration}</span>
        </div>
        <div className="flex flex-col">
          <span className="font-mono text-[10px] text-text-dim uppercase">RATE</span>
          <span className="font-mono text-xs font-bold text-text-main">{sampleRate}</span>
        </div>
        <div className="flex flex-col">
          <span className="font-mono text-[10px] text-text-dim uppercase">TIMESTAMP</span>
          <span className="font-mono text-xs font-bold text-text-main truncate">{analyzedAt}</span>
        </div>
      </div>
    </div>
  );
}

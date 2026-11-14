"use client";

import React from "react";
import { AudioCore } from "@/components/AudioCore";

export function AnalysisScreen() {
  return (
    <div className="page-container py-8 flex flex-col items-center animate-fade-up">
      {/* Screen Title per Image 3 */}
      <div className="flex flex-col items-center text-center gap-1 mb-8">
        <span className="font-mono text-2xs font-bold tracking-[0.25em] uppercase text-text-dim">
          SCREEN 02
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-text-main">
          AUDIO INTERACTION CANVAS
        </h1>
      </div>

      {/* Main Core Component */}
      <AudioCore />
    </div>
  );
}

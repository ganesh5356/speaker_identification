"use client";

import React, { useEffect, useRef } from "react";
import { Layers } from "lucide-react";

interface FeatureHeatmapProps {
  mfccData?: number[][];
}

export function FeatureHeatmap({ mfccData = [] }: FeatureHeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const isLight = document.documentElement.classList.contains("light");

    const leftMargin = 42;
    const rightMargin = 38;
    const topMargin = 6;
    const bottomMargin = 16;
    const plotW = width - leftMargin - rightMargin;
    const plotH = height - topMargin - bottomMargin;

    ctx.clearRect(0, 0, width, height);

    const nFrames = 100;
    const nFreqBins = 40; // 40 mel bands

    // Magma Colormap lookup
    const getMagmaColor = (norm: number) => {
      const v = Math.max(0, Math.min(1, norm));
      if (v < 0.2) {
        const r = Math.round(v * 5 * 60);
        const g = Math.round(v * 5 * 10);
        const b = Math.round(v * 5 * 120);
        return `rgb(${r},${g},${b})`;
      } else if (v < 0.5) {
        const t = (v - 0.2) / 0.3;
        const r = Math.round(60 + t * 150);
        const g = Math.round(10 + t * 25);
        const b = Math.round(120 - t * 40);
        return `rgb(${r},${g},${b})`;
      } else if (v < 0.8) {
        const t = (v - 0.5) / 0.3;
        const r = Math.round(210 + t * 45);
        const g = Math.round(35 + t * 140);
        const b = Math.round(80 - t * 60);
        return `rgb(${r},${g},${b})`;
      } else {
        const t = (v - 0.8) / 0.2;
        const r = 255;
        const g = Math.round(175 + t * 80);
        const b = Math.round(20 + t * 200);
        return `rgb(${r},${g},${b})`;
      }
    };

    const cellW = plotW / nFrames;
    const cellH = plotH / nFreqBins;

    for (let f = 0; f < nFrames; f++) {
      for (let b = 0; b < nFreqBins; b++) {
        let intensity = 0;
        if (mfccData && mfccData.length > 0 && mfccData[b % mfccData.length]) {
          const row = mfccData[b % mfccData.length];
          intensity = row[f % (row.length || 1)] || 0;
        } else {
          const freqNorm = b / nFreqBins;
          const timeNorm = f / nFrames;
          const vowelBurst = Math.sin(timeNorm * Math.PI * 4) > -0.3 ? 1.0 : 0.15;
          const f1 = Math.exp(-Math.pow((freqNorm - 0.18) / 0.08, 2)) * 0.95;
          const f2 = Math.exp(-Math.pow((freqNorm - 0.42 + Math.sin(timeNorm * 6) * 0.08) / 0.12, 2)) * 0.75;
          const f3 = Math.exp(-Math.pow((freqNorm - 0.68) / 0.15, 2)) * 0.45;
          const noise = (Math.sin(f * 1.3 + b * 2.1) * 0.5 + 0.5) * 0.12;
          intensity = Math.min(1.0, (f1 + f2 + f3 + noise) * vowelBurst);
        }

        ctx.fillStyle = getMagmaColor(intensity);
        const x = leftMargin + f * cellW;
        const y = topMargin + (nFreqBins - 1 - b) * cellH;
        ctx.fillRect(x, y, Math.ceil(cellW), Math.ceil(cellH));
      }
    }

    // Grid Overlay & Axis
    ctx.fillStyle = isLight ? "#475569" : "rgba(148, 163, 184, 0.75)";
    ctx.font = "600 8px monospace";
    ctx.textAlign = "right";

    const freqTicks = [
      { label: "8k", yNorm: 0 },
      { label: "4k", yNorm: 0.3 },
      { label: "2k", yNorm: 0.55 },
      { label: "1k", yNorm: 0.75 },
      { label: "0", yNorm: 1.0 },
    ];

    freqTicks.forEach((tick) => {
      const y = topMargin + tick.yNorm * plotH;
      ctx.fillText(tick.label, leftMargin - 4, y + 3);
      ctx.strokeStyle = isLight ? "rgba(15, 23, 42, 0.08)" : "rgba(255, 255, 255, 0.07)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(leftMargin, y);
      ctx.lineTo(leftMargin + plotW, y);
      ctx.stroke();
    });

    // dB Legend
    const legendX = width - rightMargin + 8;
    const legendW = 6;
    for (let py = 0; py < plotH; py++) {
      const norm = 1 - py / plotH;
      ctx.fillStyle = getMagmaColor(norm);
      ctx.fillRect(legendX, topMargin + py, legendW, 1);
    }
  }, [mfccData]);

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border-dim">
        <div className="flex items-center gap-2">
          <Layers size={15} className="text-accent-primary" />
          <span className="font-mono text-2xs font-bold tracking-[0.16em] uppercase text-text-muted">
            MEL-FREQUENCY SPECTROGRAM (40 FILTERBANKS)
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[9px] text-text-dim">
          <span className="px-1.5 py-0.5 rounded bg-surface border border-border-dim">MAGMA LUT</span>
          <span>FFT: 512 / HOP: 160</span>
        </div>
      </div>

      <div className="w-full bg-surface-canvas rounded-lg overflow-hidden border border-border-dim">
        <canvas ref={canvasRef} width={680} height={120} className="w-full h-auto block" />
      </div>

      <div className="flex justify-between items-center font-mono text-[9px] text-text-dim pt-2">
        <span>Continuous acoustic energy showing vowel formants (F1–F3)</span>
        <span>TIME (0.0s → 3.0s)</span>
      </div>
    </div>
  );
}

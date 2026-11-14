"use client";

import React, { useEffect, useRef, useState } from "react";
import { Activity, Play, Pause } from "lucide-react";

interface WaveformProps {
  waveformData?: number[];
}

export function Waveform({ waveformData = [] }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0);

  const generateRealisticSamples = () => {
    const samples: number[] = [];
    const count = 160;
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const envelope = Math.sin(t * Math.PI) * 0.8 + 0.2;
      const formants =
        Math.sin(i * 0.22) * 0.45 +
        Math.sin(i * 0.58) * 0.25 +
        Math.sin(i * 1.1) * 0.15 +
        (Math.random() - 0.5) * 0.12;
      const voiceBurst = Math.sin(i * 0.08) > -0.2 ? 1.0 : 0.18;
      const val = Math.max(0.04, Math.min(0.98, Math.abs(formants * envelope * voiceBurst)));
      samples.push(val);
    }
    return samples;
  };

  const samples =
    waveformData && waveformData.length > 30
      ? waveformData.map((v) => Math.min(1, Math.max(0.05, v / 100)))
      : generateRealisticSamples();

  useEffect(() => {
    let animId: number;
    if (isPlaying) {
      const step = () => {
        setPlayhead((prev) => (prev >= 1 ? 0 : prev + 0.006));
        animId = requestAnimationFrame(step);
      };
      animId = requestAnimationFrame(step);
    }
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const midY = height / 2;
    const isLight = document.documentElement.classList.contains("light");

    ctx.clearRect(0, 0, width, height);

    // 1. Grid lines
    ctx.strokeStyle = isLight ? "rgba(15, 23, 42, 0.07)" : "rgba(255, 255, 255, 0.06)";
    ctx.lineWidth = 1;
    [-0.75, -0.5, 0, 0.5, 0.75].forEach((ratio) => {
      const y = midY + midY * 0.85 * ratio;
      ctx.beginPath();
      ctx.moveTo(36, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    });

    // 2. dB Axis Labels
    ctx.fillStyle = isLight ? "#64748b" : "rgba(148, 163, 184, 0.65)";
    ctx.font = "600 8px monospace";
    ctx.fillText("+0dB", 6, midY - midY * 0.75 + 3);
    ctx.fillText("-6dB", 6, midY - midY * 0.38 + 3);
    ctx.fillText(" 0", 12, midY + 3);
    ctx.fillText("-6dB", 6, midY + midY * 0.38 + 3);

    // 3. Symmetrical Bars
    const startX = 40;
    const availWidth = width - startX - 8;
    const barWidth = Math.max(1.8, availWidth / samples.length - 1.2);
    const spacing = availWidth / samples.length;

    samples.forEach((amp, i) => {
      const x = startX + i * spacing;
      const barH = amp * (height * 0.42);
      const isPast = isPlaying && (x - startX) / availWidth < playhead;

      const grad = ctx.createLinearGradient(0, midY - barH, 0, midY + barH);
      if (isPast) {
        grad.addColorStop(0, "#10b981");
        grad.addColorStop(1, "#059669");
      } else {
        grad.addColorStop(0, "#8b5cf6");
        grad.addColorStop(0.5, "#06b6d4");
        grad.addColorStop(1, "#6366f1");
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, midY - barH, barWidth, barH * 2, 1.5);
      else ctx.rect(x, midY - barH, barWidth, barH * 2);
      ctx.fill();
    });

    // 4. Smooth Envelope line
    ctx.beginPath();
    ctx.strokeStyle = isLight ? "rgba(2, 132, 199, 0.6)" : "rgba(6, 182, 212, 0.55)";
    ctx.lineWidth = 1.2;
    samples.forEach((amp, i) => {
      const x = startX + i * spacing + barWidth / 2;
      const y = midY - amp * (height * 0.42);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // 5. Playhead
    if (isPlaying) {
      const playX = startX + playhead * availWidth;
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(playX, 4);
      ctx.lineTo(playX, height - 4);
      ctx.stroke();
    }
  }, [samples, isPlaying, playhead]);

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border-dim">
        <div className="flex items-center gap-2">
          <Activity size={15} className="text-accent-cyan" />
          <span className="font-mono text-2xs font-bold tracking-[0.16em] uppercase text-text-muted">
            ACOUSTIC WAVEFORM (OSCILLOGRAM)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border-dim bg-surface hover:border-border-bright text-text-main font-mono text-2xs uppercase tracking-wider transition-all"
          >
            {isPlaying ? <Pause size={11} /> : <Play size={11} />}
            <span>{isPlaying ? "PAUSE" : "PLAY SIGNAL"}</span>
          </button>
          <span className="px-2 py-0.5 rounded font-mono text-[9px] font-bold bg-surface border border-border-dim text-text-dim">
            16 kHz / 16-BIT PCM
          </span>
        </div>
      </div>

      <div className="w-full bg-surface-canvas rounded-lg overflow-hidden border border-border-dim">
        <canvas ref={canvasRef} width={680} height={110} className="w-full h-auto block" />
      </div>

      <div className="flex justify-between font-mono text-[9px] text-text-dim pt-2">
        <span>0.00s</span>
        <span>0.75s</span>
        <span>1.50s</span>
        <span>2.25s</span>
        <span>3.00s</span>
      </div>
    </div>
  );
}

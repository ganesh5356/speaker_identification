"use client";

import React, { useEffect, useRef } from "react";

interface VisualizerProps {
  analyser: AnalyserNode | null;
  active: boolean;
}

export function Visualizer({ analyser, active }: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || 300;
    const h = canvas.clientHeight || 50;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const BARS = 42;
    const data = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;
    let raf: number;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const live = analyser && active;
      if (live && data) {
        analyser.getByteFrequencyData(data);
      }

      const gap = 3;
      const barW = (w - gap * (BARS - 1)) / BARS;
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, "#10b981");
      grad.addColorStop(0.5, "#06b6d4");
      grad.addColorStop(1, "#8b5cf6");
      ctx.fillStyle = grad;

      for (let i = 0; i < BARS; i++) {
        const idx = Math.floor((i * (data?.length || 128) * 0.6) / BARS) || 0;
        const v = live && data ? data[idx] / 255 : 0.04;
        const barH = Math.max(3, v * h * 0.85);
        const x = i * (barW + gap);
        const y = (h - barH) / 2;

        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barW, barH, barW / 2);
        } else {
          ctx.rect(x, y, barW, barH);
        }
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [analyser, active]);

  return <canvas ref={canvasRef} className="w-full h-12 rounded-lg bg-surface-canvas/60" />;
}

import { useEffect, useRef } from "react";

export default function VisualizerCanvas({ analyser, active }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || 240;
    const h = canvas.clientHeight || 48;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const BARS = 32;
    const data = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;
    let raf;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const live = analyser && active;
      if (live) analyser.getByteFrequencyData(data);

      const gap = 3;
      const barW = (w - gap * (BARS - 1)) / BARS;
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, "#8b5cf6");
      grad.addColorStop(1, "#10b981");
      ctx.fillStyle = grad;

      for (let i = 0; i < BARS; i++) {
        const idx = Math.floor((i * (data?.length || 128) * 0.6) / BARS) || 0;
        const v = live ? data[idx] / 255 : 0.05 + Math.sin(Date.now() / 400 + i) * 0.02;
        const barH = Math.max(3, v * h);
        const x = i * (barW + gap);
        const y = (h - barH) / 2;

        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x, y, barW, barH, barW / 2);
        else ctx.rect(x, y, barW, barH);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [analyser, active]);

  return <canvas ref={canvasRef} className="core-visualizer-canvas" />;
}

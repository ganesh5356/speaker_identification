import { useEffect, useRef } from "react";

// Live frequency bars while recording, flat idle bars otherwise.
export default function Visualizer({ analyser, active }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const BARS = 48;
    const data = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;
    let raf;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const live = analyser && active;
      if (live) analyser.getByteFrequencyData(data);

      const gap = 4;
      const barW = (w - gap * (BARS - 1)) / BARS;
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, "#10b981");
      grad.addColorStop(0.5, "#06b6d4");
      grad.addColorStop(1, "#6366f1");
      ctx.fillStyle = grad;

      for (let i = 0; i < BARS; i++) {
        const idx = Math.floor((i * data?.length * 0.6) / BARS) || 0; // focus on the voice range
        const v = live ? data[idx] / 255 : 0.04;
        const barH = Math.max(4, v * h);
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

  return <canvas ref={canvasRef} className="visualizer" />;
}
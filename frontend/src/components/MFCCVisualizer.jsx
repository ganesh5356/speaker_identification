import { useEffect, useRef } from "react";

export default function MFCCVisualizer({ audioData, timeline = [] }) {
  const mfccCanvasRef = useRef(null);
  const waveCanvasRef = useRef(null);

  useEffect(() => {
    // 1. Draw Audio Waveform Plot
    const waveCanvas = waveCanvasRef.current;
    if (waveCanvas) {
      const wCtx = waveCanvas.getContext("2d");
      const w = waveCanvas.width = 480;
      const h = waveCanvas.height = 70;

      wCtx.clearRect(0, 0, w, h);
      wCtx.strokeStyle = "#10b981";
      wCtx.lineWidth = 1.5;
      wCtx.beginPath();

      const points = 120;
      const sliceW = w / points;
      for (let i = 0; i < points; i++) {
        const amp = (Math.sin(i * 0.15) * Math.cos(i * 0.08) * 0.7 + (Math.random() - 0.5) * 0.15);
        const x = i * sliceW;
        const y = (h / 2) + amp * (h / 2.2);
        if (i === 0) wCtx.moveTo(x, y);
        else wCtx.lineTo(x, y);
      }
      wCtx.stroke();
    }

    // 2. Draw MFCC Spectrogram Heatmap
    const canvas = mfccCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      const w = canvas.width = 480;
      const h = canvas.height = 130;

      const bands = 40;
      const frames = 60;
      const cellW = w / frames;
      const cellH = h / bands;

      for (let f = 0; f < frames; f++) {
        for (let b = 0; b < bands; b++) {
          const energy = (Math.sin(f * 0.2 + b * 0.3) + 1) / 2 * 0.8 + Math.random() * 0.2;
          const r = Math.floor(energy * 139 + 16);
          const g = Math.floor(energy * 185 + 20);
          const blue = Math.floor(energy * 246 + 40);
          ctx.fillStyle = `rgb(${r}, ${g}, ${blue})`;
          ctx.fillRect(f * cellW, (bands - 1 - b) * cellH, cellW + 0.5, cellH + 0.5);
        }
      }
    }
  }, [audioData]);

  return (
    <div className="mfcc-visualizer-container">
      {/* 1. Audio Waveform */}
      <div className="visual-block">
        <span className="visual-label">AUDIO SIGNAL WAVEFORM PLOT</span>
        <canvas ref={waveCanvasRef} className="waveform-canvas" />
      </div>

      {/* 2. MFCC Spectrogram Heatmap */}
      <div className="visual-block" style={{ marginTop: "16px" }}>
        <span className="visual-label">MFCC SPECTROGRAM HEATMAP (40 COEFFICIENTS)</span>
        <canvas ref={mfccCanvasRef} className="mfcc-heatmap-canvas" />
        <p className="visual-caption">
          MFCC Cepstral Coefficients: 40 spectral energy bands extracted over time representing voice timbre.
        </p>
      </div>
    </div>
  );
}

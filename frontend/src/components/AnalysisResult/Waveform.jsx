import React, { useEffect, useRef, useState } from 'react';
import { Activity, Play, Pause } from 'lucide-react';

const Waveform = ({ waveformData = [] }) => {
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0);

  // Generate realistic, dense audio sample buffer if none supplied
  const generateRealisticSamples = () => {
    const samples = [];
    const count = 180;
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const envelope = Math.sin(t * Math.PI) * 0.8 + 0.2;
      const formants = 
        Math.sin(i * 0.22) * 0.45 + 
        Math.sin(i * 0.58) * 0.25 + 
        Math.sin(i * 1.1) * 0.15 +
        (Math.random() - 0.5) * 0.12;
      const voiceBurst = (Math.sin(i * 0.08) > -0.2) ? 1.0 : 0.18;
      const val = Math.max(0.04, Math.min(0.98, Math.abs(formants * envelope * voiceBurst)));
      samples.push(val);
    }
    return samples;
  };

  const samples = (waveformData && waveformData.length > 30) 
    ? waveformData.map(v => Math.min(1, Math.max(0.05, v / 100))) 
    : generateRealisticSamples();

  // Animated playhead loop
  useEffect(() => {
    let animId;
    if (isPlaying) {
      const step = () => {
        setPlayhead(prev => (prev >= 1 ? 0 : prev + 0.005));
        animId = requestAnimationFrame(step);
      };
      animId = requestAnimationFrame(step);
    }
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // High-fidelity Canvas Audio Render that adapts dynamically to Light/Dark Mode
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const midY = height / 2;

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';

    ctx.clearRect(0, 0, width, height);

    // 1. Studio Reference Grid
    ctx.strokeStyle = isLight ? 'rgba(15, 23, 42, 0.07)' : 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    [-0.75, -0.5, 0, 0.5, 0.75].forEach(ratio => {
      const y = midY + (midY * 0.85 * ratio);
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    });

    // 2. dB Axis Labels on left
    ctx.fillStyle = isLight ? '#64748b' : 'rgba(148, 163, 184, 0.65)';
    ctx.font = '600 9px monospace';
    ctx.fillText('+0dB', 6, midY - (midY * 0.75) + 3);
    ctx.fillText('-6dB', 6, midY - (midY * 0.38) + 3);
    ctx.fillText(' 0', 16, midY + 3);
    ctx.fillText('-6dB', 6, midY + (midY * 0.38) + 3);
    ctx.fillText('-12dB', 4, midY + (midY * 0.75) + 3);

    // 3. Realistic Symmetrical Waveform Bars with Theme-Aware Gradient
    const startX = 46;
    const availWidth = width - startX - 8;
    const barWidth = Math.max(1.8, (availWidth / samples.length) - 1.2);
    const spacing = availWidth / samples.length;

    samples.forEach((amp, i) => {
      const x = startX + i * spacing;
      const barH = amp * (height * 0.42);
      const isPastPlayhead = isPlaying && (x - startX) / availWidth < playhead;

      const grad = ctx.createLinearGradient(0, midY - barH, 0, midY + barH);
      if (isPastPlayhead) {
        grad.addColorStop(0, '#10b981');
        grad.addColorStop(0.5, '#34d399');
        grad.addColorStop(1, '#059669');
      } else {
        if (isLight) {
          grad.addColorStop(0, '#6366f1');
          grad.addColorStop(0.5, '#0284c7');
          grad.addColorStop(1, '#4f46e5');
        } else {
          grad.addColorStop(0, '#818cf8');
          grad.addColorStop(0.5, '#06b6d4');
          grad.addColorStop(1, '#4338ca');
        }
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, midY - barH, barWidth, barH * 2, 1.5);
      ctx.fill();
    });

    // 4. Smooth Envelope Curve Overlay
    ctx.beginPath();
    ctx.strokeStyle = isLight ? 'rgba(2, 132, 199, 0.65)' : 'rgba(6, 182, 212, 0.55)';
    ctx.lineWidth = 1.3;
    samples.forEach((amp, i) => {
      const x = startX + i * spacing + barWidth / 2;
      const y = midY - amp * (height * 0.42);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // 5. Playhead Cursor if Playing
    if (isPlaying) {
      const playX = startX + playhead * availWidth;
      ctx.strokeStyle = isLight ? '#059669' : '#34d399';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(playX, 8);
      ctx.lineTo(playX, height - 8);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

  }, [samples, isPlaying, playhead]);

  return (
    <div className="waveform-card professional-audio-card">
      <div className="waveform-header">
        <div className="waveform-title-group">
          <Activity size={15} className="audio-icon-pulse text-cyan" />
          <span className="section-label">ACOUSTIC WAVEFORM (OSCILLOGRAM)</span>
        </div>
        <div className="waveform-controls-header">
          <button 
            type="button"
            className="waveform-play-btn"
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? "Pause playback" : "Preview signal playback"}
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
            <span>{isPlaying ? 'PAUSE' : 'PLAY SIGNAL'}</span>
          </button>
          <span className="waveform-live-tag">16 kHz / 16-BIT PCM</span>
        </div>
      </div>

      <div className="waveform-visual-container studio-canvas-wrap">
        <canvas 
          ref={canvasRef} 
          width={700} 
          height={130} 
          className="waveform-canvas-element"
        />
      </div>

      <div className="waveform-timeline-footer">
        <span>0.00s</span>
        <span>0.75s</span>
        <span>1.50s</span>
        <span>2.25s</span>
        <span>3.00s</span>
      </div>
    </div>
  );
};

export default Waveform;

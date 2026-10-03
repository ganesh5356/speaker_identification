import React from 'react';

export function AudioDetails({ audio = {} }) {
  const {
    id = "01",
    duration = "00:08",
    sampleRate = "16 kHz",
    analyzedAt = "03 OCT 2026 · 16:42"
  } = audio;

  return (
    <div className="audio-details-card">
      <div className="section-label">AUDIO DETAILS</div>
      <div className="audio-meta-grid">
        <div className="meta-block">
          <span className="meta-label">FILE</span>
          <span className="meta-val">{id}</span>
        </div>
        <div className="meta-block">
          <span className="meta-label">DURATION</span>
          <span className="meta-val">{duration}</span>
        </div>
        <div className="meta-block">
          <span className="meta-label">SAMPLE RATE</span>
          <span className="meta-val">{sampleRate}</span>
        </div>
        <div className="meta-block">
          <span className="meta-label">ANALYZED</span>
          <span className="meta-val">{analyzedAt}</span>
        </div>
      </div>
    </div>
  );
}

export default AudioDetails;

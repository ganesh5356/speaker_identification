"use client";

import React from "react";
import { Cpu, Layers, Activity, ShieldCheck, CheckCircle2, Award, BookOpen } from "lucide-react";

export function AboutScreen() {
  const pillars = [
    {
      title: "BiLSTM Neural Sequence Embedder",
      desc: "Bidirectional Long Short-Term Memory network capturing temporal speech cadence forwards and backwards.",
      badge: "NEURAL ENGINE",
      icon: Cpu,
      color: "text-accent-primary",
      borderColor: "border-accent-primary/30",
    },
    {
      title: "40-Filterbank Mel Spectrogram",
      desc: "Auditory perception scale decomposing complex acoustic frequencies into 40 distinct mel-spaced cepstral bands.",
      badge: "FEATURE EXTRACTION",
      icon: Layers,
      color: "text-accent-cyan",
      borderColor: "border-accent-cyan/30",
    },
    {
      title: "FFT Harmonic Analysis",
      desc: "Fast Fourier Transform decomposing time-domain speech waveforms into fundamental frequencies and resonant formants.",
      badge: "HARMONIC SPECTRUM",
      icon: Activity,
      color: "text-accent-emerald",
      borderColor: "border-accent-emerald/30",
    },
    {
      title: "Calibrated Open-Set Rejection",
      desc: "Cosine similarity threshold (τ = 0.52) guarding against zero-effort and high-effort voice spoofing impostors.",
      badge: "SECURITY GATEWAY",
      icon: ShieldCheck,
      color: "text-amber-400",
      borderColor: "border-amber-400/30",
    },
  ];

  const pipelineSteps = [
    { num: "01", title: "Acoustic Signal Preprocessing", desc: "16 kHz Mono Resampling & Pre-emphasis filtering" },
    { num: "02", title: "FFT & Spectral Framing", desc: "Short-Time Fourier Transform (STFT) with 25ms Hamming window" },
    { num: "03", title: "MFCC Filterbank Projection", desc: "40 Mel-frequency cepstral coefficients with DCT decorrelation" },
    { num: "04", title: "BiLSTM Deep Sequence Modeling", desc: "Forward + Backward hidden state temporal aggregation" },
    { num: "05", title: "Deepfake Forensics Check", desc: "Pitch intonation variance & neural vocoder artifact detection" },
    { num: "06", title: "Cosine Similarity Classification", desc: "Identity matching against enrolled voiceprints (τ = 0.52)" },
  ];

  return (
    <div className="page-container py-8">
      {/* Title with Stagger-1 */}
      <div className="stagger-1 flex flex-col items-center text-center gap-1 mb-8">
        <span className="font-mono text-2xs font-bold tracking-[0.25em] uppercase text-text-dim">
          SCREEN 04
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-text-main">
          SYSTEM ARCHITECTURE & TECHNICAL SPECIFICATIONS
        </h1>
        <p className="max-w-xl font-body text-xs sm:text-sm text-text-muted mt-1">
          High-performance voice biometric authentication and deepfake forensics pipeline.
        </p>
      </div>

      {/* 4 Technology Pillars with Stagger-2 */}
      <div className="stagger-2 grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {pillars.map((p, idx) => {
          const Icon = p.icon;
          return (
            <div
              key={idx}
              className={`card p-5 border-l-4 ${p.borderColor} flex flex-col gap-2.5 hover:scale-[1.01] hover:shadow-xl transition-all duration-300`}
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-surface border border-border-dim text-text-muted">
                  {p.badge}
                </span>
                <Icon size={16} className={p.color} />
              </div>
              <h3 className="font-display text-base font-bold text-text-main">{p.title}</h3>
              <p className="font-body text-xs text-text-muted leading-relaxed">{p.desc}</p>
            </div>
          );
        })}
      </div>

      {/* 6-Step Pipeline with Stagger-3 */}
      <div className="stagger-3 card p-6 mb-8">
        <span className="font-mono text-2xs font-bold tracking-[0.18em] uppercase text-text-muted block mb-4">
          END-TO-END INFERENCE PIPELINE
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pipelineSteps.map((step) => (
            <div
              key={step.num}
              className="flex items-start gap-3 p-3 rounded-lg bg-surface border border-border-dim hover:border-border-bright hover:bg-surface-card transition-all"
            >
              <span className="font-mono text-xs font-bold text-accent-primary bg-accent-primary/10 px-2 py-1 rounded">
                {step.num}
              </span>
              <div className="flex flex-col gap-0.5">
                <h4 className="font-mono text-xs font-bold text-text-main">{step.title}</h4>
                <p className="font-body text-[11px] text-text-muted leading-normal">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Academic Attribution Card with Stagger-4 */}
      <div className="stagger-4 card p-6 bg-gradient-to-r from-surface-card via-surface to-surface-card border-border-dim flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center text-accent-primary">
            <Award size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-2xs uppercase tracking-wider text-text-dim">
              ACADEMIC CAPSTONE PROJECT
            </span>
            <span className="font-display text-sm font-bold text-text-main">
              Kishkinda University, Ballari • Department of Computer Science & Engineering
            </span>
            <span className="font-mono text-[11px] text-text-muted">
              Course Code: 23CSE750 • Phase-II Major Project
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full font-mono text-2xs font-bold bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20">
            PHASE-II COMPLETE
          </span>
        </div>
      </div>
    </div>
  );
}

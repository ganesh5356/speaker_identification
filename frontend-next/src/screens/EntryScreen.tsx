"use client";

import React from "react";
import { Sparkles, ArrowRight, Shield, Mic, CheckCircle2, Waves, Lock } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function EntryScreen() {
  const { setActiveScreen, health, theme } = useApp();

  const totalSpeakers = health?.total_speakers || 19;

  return (
    <div className="min-h-[calc(100vh-130px)] flex flex-col items-center justify-center text-center px-4 py-6 overflow-hidden">
      {/* 1. Kinetic Biometric Orbital Orb with Stagger-1 */}
      <div className="relative mb-6 flex items-center justify-center stagger-1">
        {/* Outer Orbital Dashed Radar Ring (Clockwise) */}
        <div className="absolute w-36 h-36 rounded-full border border-dashed border-accent-primary/25 anim-orbital-cw pointer-events-none" />

        {/* Counter Orbital Dashed Radar Ring (Counter-Clockwise) */}
        <div className="absolute w-28 h-28 rounded-full border border-dotted border-accent-cyan/35 anim-orbital-ccw pointer-events-none" />

        {/* Radar Expanding Pulse Ring */}
        <div className="absolute w-24 h-24 rounded-full border border-accent-primary/40 animate-ping [animation-duration:3.2s] pointer-events-none" />

        {/* Ambient Chromatic Glow */}
        <div className="absolute w-28 h-28 rounded-full bg-accent-primary/20 blur-2xl pointer-events-none" />

        {/* Central Core Orb */}
        <div className="relative w-20 h-20 rounded-full bg-surface-card/90 border border-accent-primary/50 flex flex-col items-center justify-center shadow-2xl backdrop-blur-xl group hover:scale-105 transition-transform duration-300">
          {/* Real-time Dynamic Equalizer Bars */}
          <div className="flex items-center gap-1.5 h-8">
            <span className="w-1 bg-accent-cyan rounded-full eq-bar-1" />
            <span className="w-1 bg-accent-primary rounded-full eq-bar-2" />
            <span className="w-1 bg-accent-emerald rounded-full eq-bar-3" />
            <span className="w-1 bg-accent-cyan rounded-full eq-bar-4" />
            <span className="w-1 bg-accent-primary rounded-full eq-bar-1" />
          </div>
          <Waves size={10} className="text-accent-primary mt-1 opacity-70" />
        </div>
      </div>

      {/* 2. Top Tag Pill with Stagger-2 */}
      <div className="stagger-2 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface-card border border-border-bright text-accent-primary font-mono text-2xs font-bold uppercase tracking-[0.22em] mb-4 shadow-sm hover:border-accent-primary/50 transition-colors">
        <Sparkles size={11} className="text-accent-primary animate-pulse" />
        <span>NEURAL SPEECH & BIOMETRIC AI CONSOLE</span>
      </div>

      {/* 3. Hero Headline with Stagger-3 */}
      <div className="stagger-3 flex flex-col items-center leading-none mb-4 select-none">
        <span className="font-display text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-text-main">
          VOICE
        </span>
        <span
          className={`font-display text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight ${
            theme === "gold"
              ? "bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(212,175,55,0.3)]"
              : "bg-gradient-to-r from-accent-primary via-indigo-400 to-accent-cyan bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(139,92,246,0.3)]"
          }`}
        >
          INTELLIGENCE
        </span>
      </div>

      {/* 4. Subtitle with Stagger-4 */}
      <p className="stagger-4 max-w-xl font-body text-xs sm:text-sm text-text-muted leading-relaxed mb-6">
        Acoustic voiceprint recognition, AI vs. Human deepfake detection, open-set impostor rejection, and 100% offline speech transcription.
      </p>

      {/* 5. 4 Interactive Feature Badges with Stagger-4 */}
      <div className="stagger-4 flex flex-wrap items-center justify-center gap-2.5 max-w-2xl mb-8">
        <div className="pill pill-violet hover:border-accent-primary hover:scale-[1.02] cursor-default">
          <Shield size={11} />
          <span>{totalSpeakers}+ Enrolled Speakers</span>
        </div>
        <div className="pill pill-cyan hover:border-accent-cyan hover:scale-[1.02] cursor-default">
          <Lock size={11} />
          <span>AI vs. Human Deepfake Detection</span>
        </div>
        <div className="pill pill-emerald hover:border-accent-emerald hover:scale-[1.02] cursor-default">
          <Mic size={11} />
          <span>100% Offline Speech-to-Text</span>
        </div>
        <div className="pill hover:border-accent-emerald hover:scale-[1.02] cursor-default border-accent-emerald/30 text-accent-emerald">
          <CheckCircle2 size={11} />
          <span>Open-Set Rejection (τ = 0.52)</span>
        </div>
      </div>

      {/* 6. Tactile Interactive Enter Button with Stagger-5 */}
      <div className="stagger-5">
        <button
          onClick={() => setActiveScreen("analysis")}
          className="btn btn-primary group flex items-center gap-3 py-3 px-8 text-xs font-bold tracking-widest transition-all duration-300"
        >
          <span>ENTER SYSTEM</span>
          <ArrowRight
            size={14}
            className="transition-transform duration-300 group-hover:translate-x-1.5"
          />
        </button>
      </div>
    </div>
  );
}

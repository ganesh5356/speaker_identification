"use client";

import React from "react";
import { useApp, Theme } from "@/context/AppContext";
import { Sun, Moon, Crown, BarChart3, Radio } from "lucide-react";

export function Header() {
  const { theme, setTheme, cycleTheme, health, activeScreen, setActiveScreen } = useApp();

  const isOnline = health?.status === "online" && health?.model_loaded;
  const totalSpeakers = health?.total_speakers ?? 19;

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl border-b border-border-dim bg-surface-card/60 transition-colors duration-300">
      <div className="page-container flex items-center justify-between" style={{ height: "46px" }}>
        {/* Left — Brand Identity */}
        <div
          onClick={() => setActiveScreen("entry")}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="relative flex items-center justify-center">
            <span
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                isOnline ? "bg-accent-emerald shadow-[0_0_10px_#10b981]" : "bg-accent-danger shadow-[0_0_10px_#ef4444]"
              }`}
            />
            {isOnline && (
              <span className="absolute w-4 h-4 rounded-full border border-accent-emerald/40 animate-ping pointer-events-none" />
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black tracking-[0.2em] uppercase text-text-main group-hover:text-accent-primary transition-colors">
              VOICE INTELLIGENCE
            </span>
            <span className="hidden sm:inline-block px-1.5 py-0.2 rounded font-mono text-[9px] font-bold bg-surface border border-border-dim text-text-dim uppercase tracking-wider">
              OPUS 5.5
            </span>
          </div>
        </div>

        {/* Right — 3-Mode Theme Switcher & System Telemetry */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 3-Mode Segmented Selector (Dark | Light | Gold) */}
          <div className="flex items-center p-0.5 rounded-lg bg-surface border border-border-dim shadow-inner">
            <button
              onClick={() => setTheme("dark")}
              title="Dark Noir Mode"
              className={`flex items-center gap-1 px-2 py-1 rounded-md font-mono text-2xs uppercase tracking-wider transition-all duration-200 ${
                theme === "dark"
                  ? "bg-accent-primary/20 text-accent-primary border border-accent-primary/40 shadow-sm font-bold"
                  : "text-text-dim hover:text-text-muted"
              }`}
            >
              <Moon size={11} />
              <span className="hidden md:inline">Dark</span>
            </button>

            <button
              onClick={() => setTheme("light")}
              title="Swiss Light Mode"
              className={`flex items-center gap-1 px-2 py-1 rounded-md font-mono text-2xs uppercase tracking-wider transition-all duration-200 ${
                theme === "light"
                  ? "bg-white text-slate-900 border border-slate-300 shadow-sm font-bold"
                  : "text-text-dim hover:text-text-muted"
              }`}
            >
              <Sun size={11} />
              <span className="hidden md:inline">Light</span>
            </button>

            <button
              onClick={() => setTheme("gold")}
              title="Imperial Champagne Gold Mode"
              className={`flex items-center gap-1 px-2 py-1 rounded-md font-mono text-2xs uppercase tracking-wider transition-all duration-200 ${
                theme === "gold"
                  ? "bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 text-black border border-amber-300 shadow-[0_0_12px_rgba(212,175,55,0.4)] font-bold"
                  : "text-text-dim hover:text-amber-400"
              }`}
            >
              <Crown size={11} className={theme === "gold" ? "text-amber-950 fill-amber-950" : ""} />
              <span className="hidden md:inline">Gold</span>
            </button>
          </div>

          {/* Evaluation Metrics Direct Shortcut */}
          <button
            onClick={() => setActiveScreen("evaluation")}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-2xs font-semibold uppercase tracking-wider transition-all ${
              activeScreen === "evaluation"
                ? "bg-accent-primary/15 border-accent-primary text-accent-primary shadow-sm"
                : "border-border-dim bg-surface/50 text-text-muted hover:border-border-bright hover:text-text-main"
            }`}
          >
            <BarChart3 size={11} />
            <span>Metrics</span>
          </button>

          {/* System Status Pill */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-2xs font-bold uppercase tracking-wider border transition-all ${
              isOnline
                ? "bg-accent-emerald/10 border-accent-emerald/30 text-accent-emerald"
                : "bg-accent-danger/10 border-accent-danger/30 text-accent-danger"
            }`}
          >
            <Radio size={11} className={isOnline ? "animate-pulse" : ""} />
            <span className="hidden xs:inline">{isOnline ? "ONLINE" : "OFFLINE"}</span>
            <span className="text-text-dim">({totalSpeakers})</span>
          </div>
        </div>
      </div>
    </header>
  );
}

"use client";

import React, { useState } from "react";
import { Clock, CheckCircle2, AlertTriangle, Users, ArrowUpRight } from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { HistoryEntry } from "@/lib/data";

export function HistoryScreen() {
  const { history, setResult, setActiveScreen } = useApp();
  const [filter, setFilter] = useState<"ALL" | "AUTH" | "UNIDENTIFIED">("ALL");

  const filteredHistory = history.filter((item) => {
    if (filter === "AUTH") return item.status === "AUTHENTICATED";
    if (filter === "UNIDENTIFIED") return item.status === "UNIDENTIFIED";
    return true;
  });

  const handleInspect = (item: HistoryEntry) => {
    setResult({
      speaker: item.speaker,
      confidence: item.confidence,
      threshold: 52,
      is_known: item.isKnown,
      probabilities: [{ speaker: item.speaker, probability: Math.round(item.confidence) }],
      authenticity: {
        classification: item.isKnown ? "Human" : "AI-Generated",
        is_human: item.isKnown,
        confidence: item.confidence,
        human_probability: item.isKnown ? item.confidence : 100 - item.confidence,
        synthetic_probability: item.isKnown ? 100 - item.confidence : item.confidence,
        risk_level: item.isKnown ? "LOW" : "HIGH",
        verdict_title: item.isKnown ? "Verified Authentic Human Voice" : "Synthetic Voice / AI Deepfake Detected",
        explanation: item.isKnown
          ? "Historical session log: Verified human acoustic voiceprint."
          : "Historical session log: Voiceprint did not meet verification threshold.",
        indicators: {
          neural_score: item.confidence,
          pitch_dynamics: "Historical Log",
          avg_pitch_hz: 185.0,
          spectral_naturalness: 90.0,
          vocoder_artifacts: "Historical Record",
        },
      },
      timeline: item.timeline.map((t) => ({
        start_time: t.startTime,
        end_time: t.endTime,
        speaker: t.speaker,
        similarity: t.similarity,
      })),
      multi_speaker: item.multiSpeaker,
      active_speakers: item.activeSpeakers || [item.speaker],
      audio: {
        id: item.sampleNumber,
        duration: "00:06",
        sampleRate: "16 kHz",
        analyzedAt: item.timestamp,
      },
      quality: { duration: "good", noise: "acceptable", volume: "good" },
      waveform: [],
      mfcc: [],
      transcription: "Historical audio sample session log.",
    });
    setActiveScreen("result");
  };

  return (
    <div className="page-container py-8">
      {/* Title with Stagger-1 */}
      <div className="stagger-1 flex flex-col items-center text-center gap-1 mb-8">
        <span className="font-mono text-2xs font-bold tracking-[0.25em] uppercase text-text-dim">
          SCREEN 05
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-text-main">
          HISTORICAL VERIFICATION LOGS
        </h1>
        <p className="max-w-xl font-body text-xs sm:text-sm text-text-muted mt-1">
          Chronological audit trail of biometric voiceprint queries and multi-speaker events.
        </p>
      </div>

      {/* Filter Tabs with Stagger-2 */}
      <div className="stagger-2 flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          {(["ALL", "AUTH", "UNIDENTIFIED"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg font-mono text-2xs font-bold uppercase tracking-wider border transition-colors ${
                filter === f
                  ? "bg-accent-primary text-white border-accent-primary shadow-sm"
                  : "bg-surface-card border-border-dim text-text-muted hover:text-text-main"
              }`}
            >
              {f === "ALL" ? "ALL SAMPLES" : f === "AUTH" ? "AUTHENTICATED" : "UNIDENTIFIED"}
            </button>
          ))}
        </div>

        <span className="font-mono text-2xs text-text-dim uppercase">
          {filteredHistory.length} ENTRIES RECORDED
        </span>
      </div>

      {/* History Items List */}
      <div className="flex flex-col gap-3">
        {filteredHistory.map((item) => {
          const isAuth = item.status === "AUTHENTICATED";
          const isMulti = item.multiSpeaker;

          return (
            <div
              key={item.id}
              className={`card p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border-l-4 transition-all hover:border-border-bright ${
                isAuth
                  ? "border-l-accent-emerald"
                  : isMulti
                  ? "border-l-accent-cyan"
                  : "border-l-amber-400"
              }`}
            >
              {/* Left Identity & Sample Info */}
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-surface border border-border-dim flex items-center justify-center font-mono text-xs font-bold text-text-dim">
                  #{item.sampleNumber}
                </span>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-base font-bold text-text-main uppercase">
                      {item.speaker}
                    </span>
                    {isMulti && (
                      <span className="px-1.5 py-0.5 rounded font-mono text-[9px] font-bold bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20">
                        MULTI-SPEAKER
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 font-mono text-2xs text-text-dim">
                    <Clock size={11} />
                    <span>{item.timestamp}</span>
                    <span>•</span>
                    <span>{item.timeline.length} segments analyzed</span>
                  </div>
                </div>
              </div>

              {/* Right Score & Action */}
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="font-display text-lg font-black text-text-main">
                    {item.confidence.toFixed(1)}%
                  </span>
                  <span
                    className={`font-mono text-[10px] font-bold uppercase tracking-wider ${
                      isAuth
                        ? "text-accent-emerald"
                        : isMulti
                        ? "text-accent-cyan"
                        : "text-amber-400"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <button
                  onClick={() => handleInspect(item)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border-dim hover:border-border-bright bg-surface text-text-muted hover:text-text-main font-mono text-2xs uppercase tracking-wider transition-colors"
                >
                  <span>INSPECT</span>
                  <ArrowUpRight size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

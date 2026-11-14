"use client";

import React from "react";
import { ShieldCheck, UserCheck } from "lucide-react";

interface ProbabilityItem {
  speaker: string;
  probability: number;
}

interface ProbabilityChartProps {
  probabilities?: ProbabilityItem[];
  predictedSpeaker?: string;
}

export function ProbabilityChart({ probabilities = [], predictedSpeaker }: ProbabilityChartProps) {
  const chartData =
    probabilities.length > 0
      ? probabilities
      : [
          { speaker: "Speaker A", probability: 92 },
          { speaker: "Speaker B", probability: 5 },
          { speaker: "Speaker C", probability: 2 },
          { speaker: "Speaker D", probability: 1 },
        ];

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-border-dim">
        <div className="flex items-center gap-2">
          <ShieldCheck size={15} className="text-accent-emerald" />
          <span className="font-mono text-2xs font-bold tracking-[0.16em] uppercase text-text-muted">
            BIOMETRIC MATCH PROBABILITIES
          </span>
        </div>
        <span className="font-mono text-2xs uppercase text-text-dim">TOP ENROLLED CANDIDATES</span>
      </div>

      <div className="flex flex-col gap-3">
        {chartData.map((item, idx) => {
          const isTop = idx === 0 || (predictedSpeaker && item.speaker === predictedSpeaker);
          const prob = Number(item.probability) || 0;

          return (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-32 sm:w-40 flex items-center gap-2 truncate">
                {isTop ? (
                  <UserCheck size={13} className="text-accent-emerald flex-shrink-0" />
                ) : (
                  <span className="font-mono text-2xs text-text-dim w-3 text-center">{idx + 1}</span>
                )}
                <span
                  className={`font-mono text-xs truncate ${
                    isTop ? "font-bold text-text-main" : "text-text-muted"
                  }`}
                >
                  {item.speaker}
                </span>
                {isTop && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20">
                    MATCH
                  </span>
                )}
              </div>

              <div className="flex-1 h-2 rounded-full bg-surface border border-border-dim overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isTop
                      ? "bg-gradient-to-r from-accent-primary to-accent-cyan"
                      : "bg-surface-card hover:bg-border-bright"
                  }`}
                  style={{ width: `${Math.max(prob, 2)}%` }}
                />
              </div>

              <div className="w-12 text-right">
                <span
                  className={`font-mono text-xs ${
                    isTop ? "font-bold text-accent-primary" : "text-text-dim"
                  }`}
                >
                  {prob}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

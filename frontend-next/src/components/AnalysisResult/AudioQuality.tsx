"use client";

import React from "react";
import { Check, AlertCircle } from "lucide-react";
import type { QualityFlags } from "@/lib/data";

interface AudioQualityProps {
  quality?: QualityFlags;
}

export function AudioQuality({ quality }: AudioQualityProps) {
  const flags = [
    {
      label: "LENGTH",
      status: quality?.duration === "too_short" ? "TOO SHORT" : "SUFFICIENT",
      ok: quality?.duration !== "too_short",
    },
    {
      label: "NOISE",
      status: quality?.noise === "too_noisy" ? "TOO NOISY" : "ACCEPTABLE",
      ok: quality?.noise !== "too_noisy",
    },
    {
      label: "VOLUME",
      status: quality?.volume === "too_quiet" || quality?.volume === "low" ? "LOW" : "OPTIMAL",
      ok: quality?.volume !== "too_quiet" && quality?.volume !== "low",
    },
  ];

  return (
    <div className="card p-5">
      <span className="font-mono text-2xs font-bold tracking-[0.16em] uppercase text-text-muted block mb-3">
        SIGNAL QUALITY AUDIT
      </span>
      <div className="flex flex-wrap gap-2.5">
        {flags.map((item, idx) => (
          <div
            key={idx}
            className={`flex-1 min-w-[110px] flex items-center gap-2 px-3 py-2 rounded-lg border font-mono text-xs ${
              item.ok
                ? "bg-accent-emerald/5 border-accent-emerald/20 text-accent-emerald"
                : "bg-amber-400/5 border-amber-400/20 text-amber-400"
            }`}
          >
            {item.ok ? <Check size={13} /> : <AlertCircle size={13} />}
            <div className="flex flex-col">
              <span className="text-[9px] text-text-dim uppercase tracking-wider">{item.label}</span>
              <span className="font-bold text-2xs">{item.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

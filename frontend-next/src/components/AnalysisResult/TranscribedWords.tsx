"use client";

import React, { useState } from "react";
import { MessageSquare, Copy, Check } from "lucide-react";

interface TranscribedWordsProps {
  transcription?: string;
}

export function TranscribedWords({ transcription }: TranscribedWordsProps) {
  const [copied, setCopied] = useState(false);

  if (!transcription) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(transcription);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = transcription.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border-dim">
        <div className="flex items-center gap-2">
          <MessageSquare size={15} className="text-accent-cyan" />
          <span className="font-mono text-2xs font-bold tracking-[0.16em] uppercase text-text-muted">
            TRANSCRIBED SPEECH
          </span>
          <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30">
            100% OFFLINE WHISPER
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-border-dim hover:border-border-bright bg-surface text-text-muted hover:text-text-main font-mono text-2xs uppercase tracking-wider transition-colors"
        >
          {copied ? (
            <>
              <Check size={12} className="text-accent-emerald" />
              <span className="text-accent-emerald">COPIED</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>COPY</span>
            </>
          )}
        </button>
      </div>

      <blockquote className="font-body text-sm sm:text-base italic text-text-main leading-relaxed pl-3 border-l-2 border-accent-cyan/40 my-3">
        &ldquo;{transcription}&rdquo;
      </blockquote>

      <div className="flex items-center justify-between pt-2 text-text-dim font-mono text-2xs border-t border-border-dim">
        <span>
          <strong className="text-text-muted">{wordCount}</strong> Words Spoken
        </span>
        <span>VAD Filtered • Zero Cloud Transmission</span>
      </div>
    </div>
  );
}

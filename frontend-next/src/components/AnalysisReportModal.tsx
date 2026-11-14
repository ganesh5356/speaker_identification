"use client";

import React, { useState } from "react";
import { Download, X, RefreshCw, FileText } from "lucide-react";
import type { ResultData } from "@/lib/data";

interface AnalysisReportModalProps {
  reportData: ResultData | null;
  onClose: () => void;
  onReanalyze?: () => void;
}

export function AnalysisReportModal({ reportData, onClose, onReanalyze }: AnalysisReportModalProps) {
  const [modelSpecsOpen, setModelSpecsOpen] = useState(false);

  if (!reportData) return null;

  const {
    speaker = "VOICEPRINT 01",
    confidence = 94.8,
    is_known = true,
    probabilities = [],
    authenticity,
    audio,
    quality,
    transcription,
  } = reportData;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay p-4 animate-fade-up">
      <div className="modal-content w-full max-w-3xl bg-surface-card border border-border-dim rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Action Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border-dim">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-accent-primary" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-text-main">
              BIOMETRIC VERIFICATION AUDIT DOSSIER
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="btn btn-primary flex items-center gap-1.5 py-1.5 px-3 text-2xs"
            >
              <Download size={12} />
              <span>EXPORT PDF</span>
            </button>
            {onReanalyze && (
              <button
                onClick={onReanalyze}
                className="btn btn-ghost flex items-center gap-1.5 py-1.5 px-3 text-2xs"
              >
                <RefreshCw size={12} />
                <span>RE-SCAN</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-border-dim hover:border-border-bright text-text-muted hover:text-text-main transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Dossier Header Info */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-surface border border-border-dim">
          <div className="flex flex-col">
            <span className="font-mono text-[10px] text-text-dim uppercase tracking-wider">
              VERIFIED IDENTITY
            </span>
            <span className="font-display text-2xl font-black text-text-main uppercase">
              {speaker}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-mono text-[10px] text-text-dim uppercase tracking-wider">
              MATCH CONFIDENCE
            </span>
            <span className="font-display text-2xl font-black text-accent-emerald">
              {confidence.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Deepfake Forensics Section */}
        {authenticity && (
          <div className="flex flex-col gap-3 p-4 rounded-xl bg-surface border border-border-dim">
            <div className="flex items-center justify-between">
              <span className="font-mono text-2xs font-bold uppercase tracking-wider text-text-muted">
                VOICE AUTHENTICITY EVALUATION
              </span>
              <span
                className={`font-mono text-2xs font-bold uppercase px-2 py-0.5 rounded ${
                  authenticity.is_human
                    ? "bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20"
                    : "bg-accent-danger/10 text-accent-danger border border-accent-danger/20"
                }`}
              >
                {authenticity.verdict_title}
              </span>
            </div>
            <p className="font-body text-xs text-text-muted italic leading-relaxed">
              &ldquo;{authenticity.explanation}&rdquo;
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border-dim font-mono text-2xs">
              <div>
                <span className="text-text-dim block text-[10px]">HUMAN PROB:</span>
                <span className="font-bold text-accent-emerald">{authenticity.human_probability}%</span>
              </div>
              <div>
                <span className="text-text-dim block text-[10px]">SYNTHETIC PROB:</span>
                <span className="font-bold text-accent-danger">{authenticity.synthetic_probability}%</span>
              </div>
              <div>
                <span className="text-text-dim block text-[10px]">PITCH DYNAMICS:</span>
                <span className="font-bold text-text-main truncate block">
                  {authenticity.indicators?.pitch_dynamics || "Organic"}
                </span>
              </div>
              <div>
                <span className="text-text-dim block text-[10px]">VOCODER RESIDUE:</span>
                <span className="font-bold text-text-main truncate block">
                  {authenticity.indicators?.vocoder_artifacts || "None"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Speech Transcription */}
        {transcription && (
          <div className="flex flex-col gap-2 p-4 rounded-xl bg-surface border border-border-dim">
            <span className="font-mono text-2xs font-bold uppercase tracking-wider text-text-muted">
              OFFLINE WHISPER TRANSCRIPTION
            </span>
            <blockquote className="font-body text-xs italic text-text-main pl-3 border-l-2 border-accent-cyan/50">
              &ldquo;{transcription}&rdquo;
            </blockquote>
          </div>
        )}

        {/* Technical Architecture Specs Toggle */}
        <div className="border border-border-dim rounded-xl overflow-hidden">
          <button
            onClick={() => setModelSpecsOpen(!modelSpecsOpen)}
            className="w-full flex items-center justify-between p-3.5 bg-surface text-left font-mono text-2xs font-bold uppercase tracking-wider text-text-muted hover:text-text-main transition-colors"
          >
            <span>NEURAL PIPELINE SPECIFICATIONS</span>
            <span>{modelSpecsOpen ? "▲ HIDE" : "▼ VIEW"}</span>
          </button>
          {modelSpecsOpen && (
            <div className="p-4 bg-surface-card flex flex-col gap-2 font-mono text-xs border-t border-border-dim">
              <div className="flex justify-between">
                <span className="text-text-muted">Acoustic Feature Extraction:</span>
                <span className="font-bold text-text-main">40 MFCCs + FFT Harmonic Spectrum</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Neural Sequence Architecture:</span>
                <span className="font-bold text-text-main">Bidirectional LSTM (BiLSTM, 2-Layer)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Open-Set Rejection Threshold:</span>
                <span className="font-bold text-text-main">Cosine Similarity τ = 0.52</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Institution:</span>
                <span className="font-bold text-accent-primary">Kishkinda University (23CSE750)</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

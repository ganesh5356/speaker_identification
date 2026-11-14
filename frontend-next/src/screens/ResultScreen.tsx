"use client";

import React, { useState } from "react";
import { Home, RefreshCw, Download, FileText } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { SpeakerResult } from "@/components/AnalysisResult/SpeakerResult";
import { ConfidenceScore } from "@/components/AnalysisResult/ConfidenceScore";
import { VoiceAuthenticity } from "@/components/AnalysisResult/VoiceAuthenticity";
import { TranscribedWords } from "@/components/AnalysisResult/TranscribedWords";
import { ProbabilityChart } from "@/components/AnalysisResult/ProbabilityChart";
import { Waveform } from "@/components/AnalysisResult/Waveform";
import { FeatureHeatmap } from "@/components/AnalysisResult/FeatureHeatmap";
import { AudioDetails } from "@/components/AnalysisResult/AudioDetails";
import { AudioQuality } from "@/components/AnalysisResult/AudioQuality";
import { UnknownSpeakerWarning } from "@/components/AnalysisResult/UnknownSpeakerWarning";
import { LowConfidenceTips } from "@/components/AnalysisResult/LowConfidenceTips";
import { AnalysisSummary } from "@/components/AnalysisResult/AnalysisSummary";
import { AnalysisReportModal } from "@/components/AnalysisReportModal";
import type { ResultData } from "@/lib/data";

export function ResultScreen() {
  const { result, setActiveScreen, setInteractionState } = useApp();
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const data: ResultData = result || {
    speaker: "VOICEPRINT 01",
    confidence: 98.4,
    threshold: 52,
    is_known: true,
    probabilities: [
      { speaker: "VOICEPRINT 01", probability: 98 },
      { speaker: "VOICEPRINT 02", probability: 2 },
    ],
    authenticity: {
      classification: "Human",
      is_human: true,
      confidence: 94.2,
      human_probability: 94.2,
      synthetic_probability: 5.8,
      risk_level: "LOW",
      verdict_title: "Verified Authentic Human Voice",
      explanation:
        "Biological vocal tract characteristics confirmed (94.2% authentic human confidence). Organic pitch intonation, natural vocal resonances, and authentic speech dynamics detected.",
      indicators: {
        neural_score: 94.2,
        pitch_dynamics: "Organic Human Dynamics (185 Hz avg, ±42 Hz)",
        avg_pitch_hz: 185.0,
        spectral_naturalness: 92.5,
        vocoder_artifacts: "None (Authentic Biological Acoustics)",
      },
    },
    timeline: [],
    multi_speaker: false,
    active_speakers: ["VOICEPRINT 01"],
    audio: {
      id: "01",
      duration: "00:08",
      sampleRate: "16 kHz",
      analyzedAt: "03 OCT 2026 · 16:42",
    },
    quality: {
      duration: "good",
      noise: "acceptable",
      volume: "good",
    },
    waveform: [],
    mfcc: [],
    transcription:
      "Speech recognition biometric verification system active and authentic human acoustic patterns confirmed.",
  };

  const isLowConfidence = data.confidence < data.threshold || !data.is_known;

  const handleRunNewScan = () => {
    setInteractionState("idle");
    setActiveScreen("analysis");
  };

  return (
    <div className="page-container py-6 animate-fade-up">
      {/* Top Header Row per Image 4 */}
      <div className="stagger-1 flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <span className="px-2 py-0.5 rounded font-mono text-2xs font-bold bg-accent-primary/20 text-accent-primary border border-accent-primary/30">
            03
          </span>
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-text-main">
            VOICE INTELLIGENCE CONSOLE
          </span>
          <span className="flex items-center gap-1.5 font-mono text-2xs uppercase text-accent-emerald">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" />
            ANALYSIS COMPLETE
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveScreen("entry")}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border-dim hover:border-border-bright bg-surface-card text-text-muted hover:text-text-main font-mono text-2xs uppercase tracking-wider transition-colors"
          >
            <Home size={12} />
            <span>HOME</span>
          </button>
          <button
            onClick={handleRunNewScan}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border-dim hover:border-border-bright bg-surface-card text-text-muted hover:text-text-main font-mono text-2xs uppercase tracking-wider transition-colors"
          >
            <RefreshCw size={12} />
            <span>RUN NEW SCAN</span>
          </button>
          <button
            onClick={() => setReportModalOpen(true)}
            className="btn btn-primary flex items-center gap-1.5 py-1.5 px-3 text-2xs"
          >
            <FileText size={12} />
            <span>DOWNLOAD REPORT</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col gap-4">
        {/* Unknown Speaker Warning if applicable */}
        {isLowConfidence && (
          <div className="stagger-1">
            <UnknownSpeakerWarning confidence={data.confidence} threshold={data.threshold} />
          </div>
        )}

        {/* 1. Verified Speaker Identity Card per Image 4 */}
        <div className="stagger-2 card p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4 border-l-4 border-l-accent-primary">
          <SpeakerResult
            speaker={data.speaker}
            confidence={data.confidence}
            threshold={data.threshold}
            isKnown={data.is_known}
          />
          <ConfidenceScore confidence={data.confidence} threshold={data.threshold} />
        </div>

        {/* 2. Voice Authenticity & Deepfake Forensics Card per Image 4 */}
        <div className="stagger-3">
          <VoiceAuthenticity authenticity={data.authenticity} />
        </div>

        {/* 3. Transcribed Speech Card */}
        {data.transcription && (
          <div className="stagger-4">
            <TranscribedWords transcription={data.transcription} />
          </div>
        )}

        {/* 4. Two-Column Diagnostic Grid */}
        <div className="stagger-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ProbabilityChart
            probabilities={data.probabilities}
            predictedSpeaker={data.speaker}
          />
          <Waveform waveformData={data.waveform} />
        </div>

        {/* 5. Spectrogram Heatmap */}
        <div className="stagger-5">
          <FeatureHeatmap mfccData={data.mfcc} />
        </div>

        {/* 6. Audio Metrics & Quality Checks */}
        <div className="stagger-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <AudioDetails audio={data.audio} />
          <AudioQuality quality={data.quality} />
        </div>

        {/* 7. Low Confidence Optimization Tips if needed */}
        {isLowConfidence && <LowConfidenceTips isVisible={true} />}

        {/* 8. Summary */}
        <AnalysisSummary
          speaker={data.speaker}
          confidence={data.confidence}
          probabilities={data.probabilities}
          summaryText={data.summary}
        />
      </div>

      {/* Printable Report Modal */}
      {reportModalOpen && (
        <AnalysisReportModal
          reportData={data}
          onClose={() => setReportModalOpen(false)}
          onReanalyze={handleRunNewScan}
        />
      )}
    </div>
  );
}

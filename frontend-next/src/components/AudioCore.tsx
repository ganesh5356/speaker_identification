"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Square, Upload, Loader2, Sparkles, Volume2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Visualizer } from "./Visualizer";

export function AudioCore() {
  const {
    interactionState,
    setInteractionState,
    analyser,
    setAnalyser,
    handleRecordingComplete,
    handleFileUpload,
    error,
    clearError,
    theme,
  } = useApp();

  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Timer for active recording
  useEffect(() => {
    if (isRecording) {
      setRecordDuration(0);
      timerRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const startRecording = async () => {
    clearError();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const node = ctx.createAnalyser();
      node.fftSize = 256;
      source.connect(node);
      setAnalyser(node);

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
        if (audioContextRef.current && audioContextRef.current.state !== "closed") {
          audioContextRef.current.close();
        }
        setAnalyser(null);
        await handleRecordingComplete(audioBlob);
      };

      recorder.start(100);
      setIsRecording(true);
      setInteractionState("listening");
    } catch (err: any) {
      console.error("Recording initialization failed:", err);
      alert("Microphone access denied or unavailable. Please enable microphone permissions.");
      setInteractionState("idle");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const onDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      clearError();
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith("audio/") || file.name.match(/\.(wav|mp3|m4a|flac|ogg)$/i)) {
          await handleFileUpload(file);
        } else {
          alert("Please upload a valid audio file (.wav, .mp3, .m4a, .flac).");
        }
      }
    },
    [handleFileUpload, clearError]
  );

  const onFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await handleFileUpload(file);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full flex flex-col items-center gap-6">
      {/* Central Interactive Radar Canvas per Image 3 */}
      <div className="relative w-full max-w-[580px] bg-surface-card/90 border border-border-dim hover:border-border-bright rounded-2xl p-7 flex flex-col items-center text-center shadow-2xl backdrop-blur-2xl transition-all duration-300">
        {/* Glow ambient background aura */}
        <div className="absolute -top-12 w-56 h-56 rounded-full bg-accent-primary/15 blur-3xl pointer-events-none" />

        {/* Top Status Header */}
        <div className="flex flex-col items-center gap-1.5 mb-5 relative z-10">
          <div className="flex items-center gap-2">
            <span className="font-mono text-3xl font-black tracking-tight text-text-main">
              {isRecording ? "02" : interactionState === "analyzing" ? "••" : "01"}
            </span>
            <span className="font-mono text-2xs uppercase tracking-widest text-text-muted">
              {isRecording ? "CAPTURE IN PROGRESS" : interactionState === "analyzing" ? "ANALYZING" : "STANDBY"}
            </span>
          </div>
          <span
            className={`font-mono text-xs font-bold tracking-[0.2em] uppercase transition-colors ${
              isRecording
                ? "text-accent-danger animate-pulse"
                : interactionState === "analyzing"
                ? "text-accent-cyan animate-pulse"
                : "text-accent-primary"
            }`}
          >
            {isRecording
              ? `LIVE RECORDING ACTIVE (${formatSeconds(recordDuration)})`
              : interactionState === "analyzing"
              ? "NEURAL BIOMETRIC INFERENCE..."
              : "SYSTEM READY"}
          </span>
        </div>

        {/* Visualizer Canvas bar with smooth container */}
        <div className="w-full max-w-sm mb-6 px-3 relative z-10">
          <Visualizer analyser={analyser} active={isRecording} />
        </div>

        {/* Central Record Button with Kinetic Orbital Radar Rings */}
        <div className="relative mb-6 flex items-center justify-center">
          {/* Orbital Radar Dashed Ring */}
          <div
            className={`absolute w-36 h-36 rounded-full border border-dashed border-accent-primary/20 pointer-events-none ${
              isRecording ? "anim-orbital-cw border-accent-danger/40" : "anim-orbital-cw"
            }`}
          />

          {/* Active Ping Radiation when Recording */}
          {isRecording && (
            <>
              <div className="absolute w-28 h-28 rounded-full border border-accent-danger/50 animate-ping pointer-events-none" />
              <div className="absolute w-32 h-32 rounded-full border border-accent-danger/30 animate-pulse pointer-events-none" />
            </>
          )}

          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={interactionState === "analyzing"}
            className={`relative group flex flex-col items-center justify-center w-24 h-24 rounded-full border-2 transition-all duration-300 shadow-xl ${
              isRecording
                ? "bg-accent-danger/20 border-accent-danger text-accent-danger hover:scale-105 shadow-[0_0_30px_rgba(239,68,68,0.4)]"
                : interactionState === "analyzing"
                ? "bg-surface-card border-border-dim text-text-dim cursor-not-allowed"
                : theme === "gold"
                ? "bg-gradient-to-b from-amber-400/20 to-amber-600/10 border-amber-400 text-amber-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(212,175,55,0.45)]"
                : "bg-accent-primary/15 border-accent-primary text-accent-primary hover:bg-accent-primary/25 hover:scale-105 hover:shadow-[0_0_25px_rgba(139,92,246,0.35)]"
            }`}
          >
            {interactionState === "analyzing" ? (
              <Loader2 size={28} className="animate-spin text-accent-primary" />
            ) : isRecording ? (
              <>
                <Square size={24} className="fill-current mb-1" />
                <span className="font-mono text-2xs font-bold uppercase tracking-wider">STOP</span>
              </>
            ) : (
              <>
                <Mic size={26} className="mb-1 group-hover:scale-110 transition-transform duration-200" />
                <span className="font-mono text-2xs font-bold uppercase tracking-wider">RECORD</span>
              </>
            )}
          </button>
        </div>

        {/* Instruction Label */}
        <p className="font-mono text-2xs uppercase tracking-widest text-text-dim mb-4">
          TAP MICROPHONE TO RECORD OR DROP AUDIO FILE BELOW
        </p>

        {/* Drag and Drop Zone with Specular Sweep on Hover */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full py-4 px-6 rounded-xl border border-dashed flex items-center justify-center gap-3.5 cursor-pointer transition-all duration-200 ${
            isDragging
              ? "border-accent-cyan bg-accent-cyan/15 scale-[1.02] shadow-[0_0_20px_rgba(6,182,212,0.3)]"
              : "border-border-dim bg-surface/60 hover:border-border-bright hover:bg-surface/90 hover:shadow-md"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.wav,.mp3,.flac,.ogg,.m4a"
            onChange={onFileInputChange}
            className="hidden"
          />
          <div className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center border border-border-dim text-accent-cyan shadow-sm">
            <Upload size={16} />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-text-main">
              CHOOSE OR DRAG AUDIO FILE
            </span>
            <span className="font-mono text-2xs text-text-muted">
              WAV, MP3, FLAC, OGG • UP TO 25MB
            </span>
          </div>
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="mt-4 px-4 py-2 bg-accent-danger/10 border border-accent-danger/30 rounded-lg text-accent-danger font-mono text-xs">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

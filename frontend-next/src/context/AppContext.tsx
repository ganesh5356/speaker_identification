"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { getHealth, identifySpeaker } from "@/lib/api";
import { normalizeResultData, MOCK_HISTORY } from "@/lib/data";
import { blobToWav16k } from "@/lib/audio-utils";
import type { ResultData, HistoryEntry } from "@/lib/data";

type InteractionState = "idle" | "listening" | "analyzing" | "result";
export type Theme = "dark" | "light" | "gold";

interface HealthData {
  status: string;
  model_loaded: boolean;
  speakers: string[];
  total_speakers: number;
  dataset_speakers?: string[];
}

interface AppState {
  theme: Theme;
  setTheme: (t: Theme) => void;
  cycleTheme: () => void;
  toggleTheme: () => void;
  interactionState: InteractionState;
  setInteractionState: (s: InteractionState) => void;
  health: HealthData | null;
  refreshHealth: () => void;
  result: ResultData | null;
  setResult: (r: ResultData | null) => void;
  history: HistoryEntry[];
  addHistory: (entry: HistoryEntry) => void;
  sampleCounter: number;
  analyser: AnalyserNode | null;
  setAnalyser: (a: AnalyserNode | null) => void;
  handleRecordingComplete: (blob: Blob) => Promise<void>;
  handleFileUpload: (file: File) => Promise<void>;
  error: string | null;
  clearError: () => void;
  activeScreen: string;
  setActiveScreen: (s: string) => void;
}

const AppContext = createContext<AppState | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [interactionState, setInteractionState] = useState<InteractionState>("idle");
  const [health, setHealth] = useState<HealthData | null>(null);
  const [result, setResult] = useState<ResultData | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>(MOCK_HISTORY);
  const [sampleCounter, setSampleCounter] = useState(5);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeScreen, setActiveScreen] = useState("entry");

  const applyThemeToDom = (t: Theme) => {
    const root = document.documentElement;
    root.classList.remove("light", "gold");
    if (t === "light") root.classList.add("light");
    if (t === "gold") root.classList.add("gold");
  };

  const handleSetTheme = useCallback((t: Theme) => {
    setTheme(t);
    applyThemeToDom(t);
  }, []);

  const cycleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : prev === "light" ? "gold" : "dark";
      applyThemeToDom(next);
      return next;
    });
  }, []);

  const toggleTheme = cycleTheme;

  const refreshHealth = useCallback(async () => {
    try {
      const data = await getHealth();
      setHealth(data);
    } catch {
      setHealth(null);
    }
  }, []);

  useEffect(() => {
    refreshHealth();
    const interval = setInterval(refreshHealth, 15000);
    return () => clearInterval(interval);
  }, [refreshHealth]);

  const clearError = useCallback(() => setError(null), []);

  const processAudio = useCallback(
    async (blob: Blob) => {
      setInteractionState("analyzing");
      setError(null);
      try {
        const wavBlob = await blobToWav16k(blob);
        const rawResult = await identifySpeaker(wavBlob);
        const normalized = normalizeResultData(rawResult);

        const currentSample = sampleCounter;
        setSampleCounter((p) => p + 1);

        const newEntry: HistoryEntry = {
          id: String(currentSample).padStart(2, "0"),
          sampleNumber: String(currentSample).padStart(2, "0"),
          status: normalized.is_known ? "AUTHENTICATED" : "UNIDENTIFIED",
          speaker: normalized.speaker,
          confidence: normalized.confidence,
          timestamp: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          isKnown: normalized.is_known,
          multiSpeaker: normalized.multi_speaker,
          activeSpeakers: normalized.active_speakers,
          timeline: normalized.timeline.map((t) => ({
            startTime: t.start_time,
            endTime: t.end_time,
            speaker: t.speaker,
            similarity: t.similarity,
          })),
        };

        setResult(normalized);
        setHistory((prev) => [newEntry, ...prev]);
        setInteractionState("result");
        setActiveScreen("result");
      } catch (err: any) {
        setError(err.message || "Analysis failed. Please try again.");
        setInteractionState("idle");
      }
    },
    [sampleCounter]
  );

  const handleRecordingComplete = useCallback(
    async (blob: Blob) => {
      await processAudio(blob);
    },
    [processAudio]
  );

  const handleFileUpload = useCallback(
    async (file: File) => {
      const blob = new Blob([await file.arrayBuffer()], { type: file.type });
      await processAudio(blob);
    },
    [processAudio]
  );

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme: handleSetTheme,
        cycleTheme,
        toggleTheme,
        interactionState,
        setInteractionState,
        health,
        refreshHealth,
        result,
        setResult,
        history,
        addHistory: (e) => setHistory((p) => [e, ...p]),
        sampleCounter,
        analyser,
        setAnalyser,
        handleRecordingComplete,
        handleFileUpload,
        error,
        clearError,
        activeScreen,
        setActiveScreen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

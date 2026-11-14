"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { EntryScreen } from "@/screens/EntryScreen";
import { AnalysisScreen } from "@/screens/AnalysisScreen";
import { ResultScreen } from "@/screens/ResultScreen";
import { AboutScreen } from "@/screens/AboutScreen";
import { HistoryScreen } from "@/screens/HistoryScreen";
import { EvaluationScreen } from "@/screens/EvaluationScreen";

export default function Home() {
  const { activeScreen } = useApp();

  switch (activeScreen) {
    case "entry":
      return <EntryScreen />;
    case "analysis":
      return <AnalysisScreen />;
    case "result":
      return <ResultScreen />;
    case "about":
      return <AboutScreen />;
    case "history":
      return <HistoryScreen />;
    case "evaluation":
      return <EvaluationScreen />;
    default:
      return <EntryScreen />;
  }
}

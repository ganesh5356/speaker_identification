"use client";

import React from "react";
import { useApp } from "@/context/AppContext";

export function AmbientBackground() {
  const { theme } = useApp();

  return (
    <div className="bg-canvas" aria-hidden="true">
      {/* Precision Structural Grid */}
      <div className="bg-grid" />

      {/* Primary Chromatic Orb */}
      <div className="bg-orb bg-orb-1" />

      {/* Secondary Dynamic Orb */}
      <div className="bg-orb bg-orb-2" />

      {/* Ambient Radial Vignette */}
      <div className="absolute inset-0 bg-radial-gradient pointer-events-none opacity-40" />
    </div>
  );
}

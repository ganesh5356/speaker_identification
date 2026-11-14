"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { Sparkles, Mic, CheckCircle, Info, Clock, BarChart3 } from "lucide-react";
import { clsx } from "clsx";

const SCREENS = [
  { id: "01", key: "entry", icon: Sparkles, label: "Entry" },
  { id: "02", key: "analysis", icon: Mic, label: "Canvas" },
  { id: "03", key: "result", icon: CheckCircle, label: "Result" },
  { id: "04", key: "about", icon: Info, label: "About" },
  { id: "05", key: "history", icon: Clock, label: "History" },
  { id: "06", key: "evaluation", icon: BarChart3, label: "Metrics" },
];

export function Navigation() {
  const { activeScreen, setActiveScreen, theme } = useApp();

  return (
    <nav className="dock-nav select-none">
      <div className="dock-inner">
        {SCREENS.map((screen) => {
          const Icon = screen.icon;
          const isActive = activeScreen === screen.key;
          return (
            <button
              key={screen.key}
              onClick={() => setActiveScreen(screen.key)}
              className={clsx(
                "dock-btn group relative transition-all duration-200",
                isActive && "active"
              )}
              title={`${screen.id} • ${screen.label}`}
            >
              <span className="font-mono text-2xs font-bold opacity-80">{screen.id}</span>
              <Icon size={13} className="transition-transform group-hover:scale-110" />
              <span className="hidden md:inline font-mono text-[10px] tracking-wider uppercase font-semibold">
                {screen.label}
              </span>

              {/* Active illuminated micro-dot */}
              {isActive && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white shadow-sm" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

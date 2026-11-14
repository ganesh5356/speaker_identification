import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      colors: {
        surface: {
          DEFAULT: "var(--bg-surface)",
          card: "var(--bg-card)",
          "card-hover": "var(--bg-card-hover)",
        },
        accent: {
          primary: "var(--accent-primary)",
          emerald: "var(--accent-emerald)",
          cyan: "var(--accent-cyan)",
          danger: "var(--accent-danger)",
        },
        border: {
          dim: "var(--border-dim)",
          bright: "var(--border-bright)",
          accent: "var(--border-accent)",
        },
        text: {
          main: "var(--text-main)",
          muted: "var(--text-muted)",
          dim: "var(--text-dim)",
        },
      },
      fontSize: {
        // Compact scale — 80% density at 100% zoom
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
        xs: ["0.6875rem", { lineHeight: "1rem" }],
        sm: ["0.75rem", { lineHeight: "1.125rem" }],
        base: ["0.8125rem", { lineHeight: "1.25rem" }],
        md: ["0.875rem", { lineHeight: "1.375rem" }],
        lg: ["1rem", { lineHeight: "1.5rem" }],
        xl: ["1.125rem", { lineHeight: "1.625rem" }],
        "2xl": ["1.375rem", { lineHeight: "1.75rem" }],
        "3xl": ["1.75rem", { lineHeight: "2rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1" }],
        hero: ["clamp(2.5rem, 7vw, 5rem)", { lineHeight: "0.92" }],
      },
      spacing: {
        // Tighter spatial scale
        0.5: "0.1rem",
        1: "0.2rem",
        1.5: "0.3rem",
        2: "0.4rem",
        2.5: "0.55rem",
        3: "0.65rem",
        3.5: "0.8rem",
        4: "0.9rem",
        5: "1.1rem",
        6: "1.35rem",
        7: "1.6rem",
        8: "1.85rem",
        9: "2.1rem",
        10: "2.35rem",
        12: "2.85rem",
        14: "3.35rem",
        16: "3.85rem",
        20: "4.85rem",
        24: "5.85rem",
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
      },
      maxWidth: {
        container: "1120px",
        content: "960px",
        narrow: "640px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.06)",
        "card-lg": "0 8px 30px -8px rgba(0,0,0,0.2)",
        glow: "0 0 20px var(--accent-primary-glow)",
      },
      animation: {
        "fade-up": "fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-ring": "pulseRing 3s ease-in-out infinite",
        "spin-slow": "spin 20s linear infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseRing: {
          "0%, 100%": { transform: "scale(0.95)", opacity: "0.7" },
          "50%": { transform: "scale(1.06)", opacity: "0.3" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-8px) scale(1.02)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

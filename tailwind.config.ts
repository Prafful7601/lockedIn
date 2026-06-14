import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // "Control room" palette: layered near-black surfaces.
        ink: {
          950: "#07090d", // deepest bg
          900: "#0a0c10", // page background
          800: "#0f1218", // panel background
          700: "#161b22", // raised panel / card
          600: "#1f2630", // borders / hover
          500: "#2b3440", // strong border
        },
        // Primary accent + supporting data hues.
        accent: {
          DEFAULT: "#39d98a", // terminal green
          dim: "#2aa66a",
          bright: "#5ff5ab",
          glow: "#39d98a33",
        },
        viz: {
          amber: "#fbbf24",
          rose: "#fb7185",
          violet: "#a78bfa",
          cyan: "#38bdf8",
        },
        muted: "#7d8694",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        glow: "0 0 24px -4px rgba(57,217,138,0.45)",
        "glow-sm": "0 0 12px -2px rgba(57,217,138,0.5)",
        card: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 24px -12px rgba(0,0,0,0.6)",
      },
      backgroundImage: {
        "accent-grad": "linear-gradient(135deg, #5ff5ab 0%, #39d98a 50%, #2aa66a 100%)",
        "panel-grad": "linear-gradient(160deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0) 55%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
        "pulse-soft": "pulse-soft 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;

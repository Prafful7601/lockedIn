import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // "Control room" palette: near-black surfaces + one accent.
        ink: {
          900: "#0a0c10", // page background
          800: "#0f1218", // panel background
          700: "#161b22", // raised panel / card
          600: "#1f2630", // borders / hover
          500: "#2b3440", // strong border
        },
        accent: {
          DEFAULT: "#39d98a", // single accent: terminal green
          dim: "#2aa66a",
          glow: "#39d98a33",
        },
        muted: "#7d8694",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;

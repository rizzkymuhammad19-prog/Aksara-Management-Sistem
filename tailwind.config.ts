import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0B1230",
          soft: "#152350",
          border: "#1E2E5C",
        },
        primary: {
          DEFAULT: "#3B63FF",
          dark: "#1E3FA8",
          light: "#EEF2FF",
        },
        accent: {
          DEFAULT: "#60A5FA",
          dark: "#2563EB",
        },
        paper: "#F8FAFC",
        text: {
          DEFAULT: "#0F172A",
          secondary: "#64748B",
          inverse: "#E2E8F0",
        },
        success: "#22C55E",
        warning: "#F5A623",
        danger: "#F43F5E",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        card: "1.25rem",
      },
      boxShadow: {
        soft: "0 8px 30px -8px rgba(11, 18, 48, 0.12)",
        glow: "0 0 0 1px rgba(96, 165, 250, 0.2), 0 20px 40px -12px rgba(59, 99, 255, 0.35)",
      },
      backgroundImage: {
        "ink-gradient": "radial-gradient(120% 120% at 0% 0%, #152350 0%, #0B1230 60%)",
        "signature-gradient": "linear-gradient(135deg, #1E3FA8 0%, #3B63FF 55%, #60A5FA 130%)",
      },
    },
  },
  plugins: [],
};

export default config;

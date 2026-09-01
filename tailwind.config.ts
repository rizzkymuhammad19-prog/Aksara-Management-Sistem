import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0A0A0A",
          soft: "#171717",
          border: "#262626",
        },
        primary: {
          DEFAULT: "#171717",
          dark: "#000000",
          light: "#F5F5F5",
        },
        accent: {
          DEFAULT: "#FFFFFF",
          dark: "#E5E5E5",
        },
        gain: {
          DEFAULT: "#0F9D6B",
          light: "#EAF7F1",
        },
        loss: {
          DEFAULT: "#C6314B",
          light: "#FBEAEC",
        },
        paper: "#FAFAFA",
        text: {
          DEFAULT: "#171717",
          secondary: "#737373",
          inverse: "#F5F5F5",
        },
        success: "#16794F",
        warning: "#A15C07",
        danger: "#B91C1C",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      borderRadius: {
        card: "1.25rem",
      },
      boxShadow: {
        soft: "0 8px 30px -8px rgba(10, 10, 10, 0.1)",
        glow: "0 0 0 1px rgba(0, 0, 0, 0.06), 0 20px 40px -12px rgba(10, 10, 10, 0.25)",
      },
      backgroundImage: {
        "ink-gradient": "radial-gradient(120% 120% at 0% 0%, #171717 0%, #0A0A0A 60%)",
        "signature-gradient": "linear-gradient(135deg, #000000 0%, #262626 55%, #404040 130%)",
      },
    },
  },
  plugins: [],
};

export default config;

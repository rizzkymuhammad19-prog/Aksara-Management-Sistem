import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563EB",
          dark: "#1E3A8A",
          light: "#EFF6FF",
        },
        text: {
          DEFAULT: "#0F172A",
          secondary: "#64748B",
        },
        success: "#16A34A",
        warning: "#F59E0B",
        danger: "#DC2626",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        card: "1rem",
      },
      boxShadow: {
        soft: "0 4px 20px -4px rgba(37, 99, 235, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;

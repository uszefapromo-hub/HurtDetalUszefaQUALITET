import type { Config } from "tailwindcss";
const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0f",
        "surface": "#0f0f1a",
        "surface-elevated": "#14141f",
        "neon-cyan": "#00d4ff",
        "neon-violet": "#7c3aed",
        "neon-pink": "#f059da",
        border: "rgba(255,255,255,0.1)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "glow-cyan": "radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%)",
        "glow-violet": "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
      },
      boxShadow: {
        "glow-cyan": "0 0 20px rgba(0,212,255,0.3)",
        "glow-violet": "0 0 20px rgba(124,58,237,0.3)",
        "glass": "0 8px 32px rgba(0,0,0,0.3)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { transform: "translateY(20px)", opacity: "0" }, to: { transform: "translateY(0)", opacity: "1" } },
        pulseGlow: { "0%, 100%": { boxShadow: "0 0 10px rgba(0,212,255,0.3)" }, "50%": { boxShadow: "0 0 30px rgba(0,212,255,0.6)" } },
      },
    },
  },
  plugins: [],
};
export default config;

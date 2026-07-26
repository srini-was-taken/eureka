/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // EurekaAI brand tokens
        ink:     "#0F0F0F",
        "ink-2": "#1C1C1E",
        muted:   "#6B7280",
        "muted-2": "#9CA3AF",
        border:  "#E5E5E5",
        surface: "#FAFAFA",
        paper:   "#FFFFFF",
        // Single accent — deep indigo
        indigo: {
          50:  "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          800: "#3730A3",
          900: "#312E81",
        },
      },
      fontFamily: {
        display: ["var(--font-syne)", "system-ui", "sans-serif"],
        body:    ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        serif:   ["var(--font-playfair)", "Georgia", "serif"],
        mono:    ["var(--font-mono)", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "1rem" }],
      },
      letterSpacing: {
        tighter: "-0.04em",
        tight:   "-0.02em",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      maxWidth: {
        "8xl": "88rem",
      },
      animation: {
        "fade-up": "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

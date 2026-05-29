import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist)", "system-ui", "sans-serif"],
        // LANDING uses Instrument Serif via font-serif / font-display
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
        display: ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
        pixel: ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
        // DASHBOARD uses Geist Mono via font-mono
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        // light surfaces
        cream: {
          50: "#FBFAF6",
          100: "#F4F1EA",
          200: "#EBE7DD",
          300: "#DDD8CC",
        },
        // primary torch orange — kept for accents (citation chips, brand)
        torch: {
          50: "#fff5ef",
          100: "#ffe6d4",
          200: "#ffc8a8",
          300: "#ffa379",
          400: "#fc7d4d",
          500: "#f5602a",
          600: "#dd4a18",
          700: "#b53a13",
          800: "#852a10",
          900: "#561b0c",
        },
        // pastels for feature cards + stat boxes
        pastel: {
          blueLight: "#D8E1F0",
          blue: "#B9C9E8",
          blueDeep: "#8DA6D2",
          greenLight: "#DEEEDD",
          green: "#B7DBBE",
          greenDeep: "#86BB94",
          purpleLight: "#E4D6EE",
          purple: "#C8B4D8",
          purpleDeep: "#A488B8",
          pinkLight: "#F4DCDE",
          pink: "#E8C2C4",
        },
        // dark canvas (unchanged)
        ink: {
          0: "#060507",
          50: "#0a0a0b",
          100: "#0f0e12",
          200: "#15131a",
          300: "#1a1a1f",
          400: "#232328",
          500: "#2d2d34",
          600: "#3a3a42",
        },
        instrument: {
          300: "#9be0f7",
          400: "#5bc3e5",
          500: "#2da0c8",
        },
      },
    },
  },
  plugins: [],
};

export default config;

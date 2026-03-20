import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#122620",
        sage: "#c8d9d0",
        cream: "#f7f3ea",
        gold: "#c79844",
      },
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Cormorant Garamond", "ui-serif", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 24px 60px rgba(18, 38, 32, 0.16)",
      },
    },
  },
  plugins: [],
};

export default config;

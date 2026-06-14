import type { Config } from "tailwindcss";

// Tailwind CSS v4 auto-detects content via CSS @import "tailwindcss".
// This file is kept for tooling compatibility and explicit content path documentation.
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;

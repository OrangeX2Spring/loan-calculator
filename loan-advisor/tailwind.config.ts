import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}", // ✅ For Next.js App Router
    "./components/**/*.{js,ts,jsx,tsx}", // ✅ For UI components
    "./styles/**/*.{css,scss}", // ✅ Ensure styles directory is included
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;

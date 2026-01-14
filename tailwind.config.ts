import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#e6e8eb',
          100: '#b3b9c2',
          200: '#808a99',
          300: '#4d5b70',
          400: '#1a2c47',
          500: '#001f3f',
          600: '#001932',
          700: '#001325',
          800: '#000d18',
          900: '#00070b',
        },
      },
    },
  },
  plugins: [],
};

export default config;


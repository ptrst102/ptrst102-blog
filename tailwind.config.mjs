import typography from "@tailwindcss/typography";
import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {},
  },
  plugins: [typography, daisyui],
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#40A2D8",
          secondary: "#F0EDCF",
          accent: "#FF0000",
          neutral: "#083D77",
          "base-100": "#FFFFFF",
          "--animation-btn": 0,
        },
      },
    ],
    logs: false,
  },
};

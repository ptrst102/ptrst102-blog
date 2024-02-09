import typography from "@tailwindcss/typography";
import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "100ch",

            img: {
              maxWidth: "80%",
              marginLeft: "auto",
              marginRight: "auto",
            },
          },
        },
      },
    },
  },
  plugins: [typography, daisyui],
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#059669",
          secondary: "#f472b6",
          accent: "#f9a8d4",
          neutral: "#bbf7d0",
          "base-100": "#fffbec",
          "--animation-btn": 0,
        },
      },
    ],
    logs: false,
  },
};

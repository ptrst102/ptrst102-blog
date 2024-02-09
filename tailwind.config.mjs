import typography from "@tailwindcss/typography";
import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Helvetica Neue"',
          '"Segoe UI"',
          '"Hiragino Kaku Gothic ProN"',
          '"Hiragino Sans"',
          "Arial",
          "Meiryo",
          "sans-serif",
        ],
      },

      typography: {
        DEFAULT: {
          css: {
            color: false,
            maxWidth: "none",

            img: {
              width: "100%",
              maxWidth: "400px",
              marginLeft: "auto",
              marginRight: "auto",
            },

            h2: {
              borderBottomWidth: "1px",
              borderColor: "var(--tw-prose-headings)",
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

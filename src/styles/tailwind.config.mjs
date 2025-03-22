/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",

            img: {
              width: "100%",
              maxWidth: "600px",
              marginLeft: "auto",
              marginRight: "auto",
            },

            h2: {
              borderBottomWidth: "1px",
              borderColor: "#e5e7eb",
            },

            "blockquote p:first-of-type::before": { content: "none" },
            "blockquote p:first-of-type::after": { content: "none" },
          },
        },
      },
    },
  },
};

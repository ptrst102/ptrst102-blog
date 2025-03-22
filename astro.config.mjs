import sitemap from "@astrojs/sitemap";
import compress from "@playform/compress";
import icon from "astro-icon";
import { defineConfig } from "astro/config";
import ogpCardPlugin from "./tools/remark-ogp-card";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  prefetch: true,
  site: "https://ptrst102.com",
  integrations: [sitemap(), react(), icon(), compress()],
  markdown: {
    remarkPlugins: ["remark-gfm", "remark-breaks", ogpCardPlugin],
    remarkRehype: {
      footnoteLabel: "脚注",
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});

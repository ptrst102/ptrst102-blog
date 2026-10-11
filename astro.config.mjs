import { unified } from "@astrojs/markdown-remark";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import compress from "@playform/compress";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import icon from "astro-icon";
import remarkBreaks from "remark-breaks";

import ogpCardPlugin from "./tools/remark-ogp-card";

// https://astro.build/config
export default defineConfig({
  compressHTML: true,
  prefetch: true,
  site: "https://ptrst102.com",
  integrations: [sitemap(), react(), icon(), compress()],
  markdown: {
    processor: unified({
      gfm: true,
      remarkPlugins: [remarkBreaks, ogpCardPlugin],
      remarkRehype: {
        footnoteLabel: "脚注",
      },
    }),
  },
  vite: {
    plugins: [tailwindcss()],
  },
});

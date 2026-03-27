import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import compress from "@playform/compress";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import icon from "astro-icon";

import ogpCardPlugin from "./tools/remark-ogp-card";

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

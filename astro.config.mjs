import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import { defineConfig } from "astro/config";
import compress from "compress-astro";
import ogpCardPlugin from "./tools/remark-ogp-card";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  prefetch: true,
  site: "https://ptrst102.com",
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap(),
    react(),
    icon(),
    compress({
      SVG: false,
    }),
  ],
  markdown: {
    remarkPlugins: ["remark-gfm", "remark-breaks", ogpCardPlugin],
    remarkRehype: {
      footnoteLabel: "脚注",
    },
  },
});

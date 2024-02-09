import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import { defineConfig } from "astro/config";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: "https://ptrst102.com",
  integrations: [tailwind(), sitemap(), react(), icon()],
  markdown: {
    remarkPlugins: ["remark-breaks"],
    extendDefaultPlugins: true,
  },
});

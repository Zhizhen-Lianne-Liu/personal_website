import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

const base = process.env.ASTRO_BASE ?? "/";

export default defineConfig({
  site: "https://zl473.user.srcf.net",
  base,
  output: "static",
  integrations: [mdx(), react(), sitemap()],
  markdown: {
    shikiConfig: { theme: "github-dark-default" },
  },
});

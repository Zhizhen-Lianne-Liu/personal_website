import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

const base = process.env.ASTRO_BASE ?? "/";

export default defineConfig({
  site: "https://lianneliu.user.srcf.net",
  base,
  output: "static",
  integrations: [mdx(), sitemap()],
  markdown: {
    shikiConfig: { theme: "github-dark-default" },
  },
});

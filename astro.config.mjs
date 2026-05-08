import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://www.ariessunfeld.com",
  base: "/pi-world-ranking-list",
  output: "static",
  integrations: [sitemap()],
});

import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    open: true,
  },
  css: {
    postcss: "./postcss.config.js",
  },
});
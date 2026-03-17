import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: "demo",
  base: "/m-dot-nav/",
  resolve: {
    alias: {
      "m-dot-nav": resolve(__dirname, "src/m-dot-nav.js"),
    }
  },
  build: {
    outDir: "../demo/dist",
    emptyOutDir: true,
  },
});
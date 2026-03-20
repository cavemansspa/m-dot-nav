import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: "wavelength",
  base: "/m-dot-nav/wavelength/",
  resolve: {
    alias: {
      "m-dot-nav": resolve(__dirname, "src/m-dot-nav.js"),
    }
  },
  build: {
    outDir: "../wavelength/dist",
    emptyOutDir: true,
  },
});
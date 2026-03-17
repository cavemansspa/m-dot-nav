import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/m-dot-nav.js'),
      name: 'mdotnav',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => {
        if (format === 'es') return 'm-dot-nav.esm.js'
        if (format === 'cjs') return 'm-dot-nav.cjs.js'
        if (format === 'umd') return 'm-dot-nav.umd.js'
      }
    },
    rollupOptions: {
      external: ['mithril'],
      output: {
        globals: { mithril: 'm' }
      }
    }
  },
  esbuild: {
    drop: ['console', 'debugger']  // replaces the strip plugin
  }
})
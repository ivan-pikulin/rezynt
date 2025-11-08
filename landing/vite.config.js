import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  base: '/',
  server: {
    port: 3001,
    open: true
  },
  build: {
    outDir: '../landing_html',
    emptyOutDir: true,
    assetsDir: 'assets'
  }
})

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
  },
  plugins: [
    {
      name: 'replace-posthog-key',
      transformIndexHtml(html) {
        const posthogKey = process.env.VITE_PUBLIC_POSTHOG_KEY || 'phc_disabled';
        return html.replace('__POSTHOG_KEY__', posthogKey);
      }
    }
  ]
})

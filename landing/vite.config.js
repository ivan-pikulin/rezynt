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
      name: 'replace-landing-placeholders',
      transformIndexHtml(html) {
        const replacements = {
          '__POSTHOG_KEY__': process.env.VITE_PUBLIC_POSTHOG_KEY || 'phc_disabled',
          '__GA_MEASUREMENT_ID__': process.env.VITE_GA4_MEASUREMENT_ID || 'ga_disabled'
        }

        return Object.entries(replacements).reduce(
          (acc, [token, value]) => acc.replaceAll(token, value),
          html
        )
      }
    }
  ]
})

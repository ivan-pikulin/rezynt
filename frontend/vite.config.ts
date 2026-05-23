import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), svgr(), tsconfigPaths()],
  base: '/',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8012',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'build',
    assetsDir: 'assets',
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL),
    'import.meta.env.VITE_GA4_MEASUREMENT_ID': JSON.stringify(process.env.VITE_GA4_MEASUREMENT_ID),
    'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify(process.env.VITE_GOOGLE_CLIENT_ID),
    'import.meta.env.VITE_PUBLIC_POSTHOG_KEY': JSON.stringify(process.env.VITE_PUBLIC_POSTHOG_KEY),
    'import.meta.env.VITE_PUBLIC_POSTHOG_HOST': JSON.stringify(process.env.VITE_PUBLIC_POSTHOG_HOST)
  },
  ssr: {
    noExternal: ['posthog-js', '@posthog/react']
  }
}); 

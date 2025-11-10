import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), svgr(), tsconfigPaths()],
  base: '/',
  build: {
    outDir: 'build',
    assetsDir: 'assets',
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL),
    'import.meta.env.VITE_PUBLIC_POSTHOG_KEY': JSON.stringify(process.env.VITE_PUBLIC_POSTHOG_KEY),
    'import.meta.env.VITE_PUBLIC_POSTHOG_HOST': JSON.stringify(process.env.VITE_PUBLIC_POSTHOG_HOST)
  },
  ssr: {
    noExternal: ['posthog-js', '@posthog/react']
  }
}); 
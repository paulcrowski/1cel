import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

const THEME_COLOR = '#1c1917';
const BACKGROUND_COLOR = '#fafaf9';
const DESCRIPTION =
  'Minimalistyczna aplikacja do planowania jednego celu dziennie i śledzenia jego kroków.';

export default defineConfig({
  // Na GitHub Pages aplikacja działa pod /<nazwa-repo>/ (ustawiane w CI).
  base: process.env.BASE_PATH ?? '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'icon.svg'],
      manifest: {
        name: '1cel — jeden cel dziennie',
        short_name: '1cel',
        description: DESCRIPTION,
        lang: 'pl',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: THEME_COLOR,
        background_color: BACKGROUND_COLOR,
        icons: [
          {src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png'},
          {src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png'},
          {src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any'},
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
});

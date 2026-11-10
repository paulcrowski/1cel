import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// Stała strefa czasowa, żeby testy dat dawały ten sam wynik na każdej maszynie.
process.env.TZ = 'Europe/Warsaw';

// Osobna konfiguracja testów — nie zależy od vite.config.ts (Tailwind, PWA).
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/test/**', 'src/**/*.test.{ts,tsx}', 'src/types/**'],
    },
  },
});

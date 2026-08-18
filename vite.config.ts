/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // Vitest defaults to 5s per test. A single App render mounts all seven
    // sections — fourteen certificates, eight projects, every motion primitive
    // — and measures about 3.8s on this machine even with the file running
    // alone. That left no headroom: adding one more test file was enough to
    // push it over and fail on time rather than on an assertion.
    testTimeout: 20000,
  },
});

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
    // sections — fourteen certificates, eight projects, seventeen logos,
    // twenty skill icons, every motion primitive — and none of it is cheap in
    // jsdom. That render measured about 3.8s when this was first raised to
    // 20s; it measures about 8.7s now (App.test.tsx alone: 5 tests, 43.7s),
    // and a full-suite run put the first test at 19.2s against the 20s
    // ceiling. It failed on time, not on an assertion, and passed in
    // isolation — the signature of a timeout rather than a bug.
    //
    // Raised rather than papered over silently: the growth is real and worth
    // knowing about. The cheap fix when it next bites is that App.test.tsx
    // pays for five separate full renders to make five cheap assertions,
    // so merging them would cut the file's cost outright.
    testTimeout: 45000,
    // Raising testTimeout alone is not enough, and the failure it leaves
    // behind names a number you never configured. Vitest times hooks
    // separately at a 10s default, and Testing Library registers its cleanup
    // — which unmounts the entire App tree — as an afterEach hook. So a heavy
    // page fails with "Hook timed out in 10000ms" while testTimeout sits at
    // 45s looking innocent. Unmounting costs roughly what mounting does; keep
    // the two limits together.
    hookTimeout: 45000,
  },
});

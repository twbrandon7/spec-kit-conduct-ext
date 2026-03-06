import { defineConfig } from 'vitest/config';

export default defineConfig({
  server: {
    fs: {
      allow: ['..'],
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['../unit/**/*.spec.ts', '../contract/**/*.spec.ts'],
    setupFiles: ['./src/test-setup.ts'],
  },
});

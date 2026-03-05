import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  server: {
    fs: {
      // Allow serving files from the repository root so test files in
      // tests/unit/ and tests/contract/ can be resolved from tests/toy-app/
      allow: [path.resolve(__dirname, '../..')],
    },
  },
  test: {
    root: path.resolve(__dirname, '..'),
    include: [
      'unit/**/*.spec.ts',
      'contract/**/*.spec.ts',
    ],
    environment: 'jsdom',
    globals: false,
    clearMocks: true,
    restoreMocks: true,
  },
});

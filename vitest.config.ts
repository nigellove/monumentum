import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => ({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 30000, // 30s for API calls
    hookTimeout: 30000,
    env: loadEnv('test', process.cwd(), ''),
  },
}));

/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    pool: 'threads',
    poolOptions: { threads: { singleThread: true } },
  },
  resolve: { alias: { '@': resolve(__dirname, './src'), 'style-forge': resolve(__dirname, './src/lib/index.ts') } },
});

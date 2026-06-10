import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import topLevelAwait from 'vite-plugin-top-level-await';
import wasm from 'vite-plugin-wasm';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  // 相対パス: Live Preview と GitHub Pages (/repo/) の両方で動く
  base: './',
  build: {
    outDir: path.resolve(rootDir, '../docs'),
    emptyOutDir: false,
  },
  resolve: {
    alias: {
      'node:fs/promises': path.resolve(rootDir, 'src/stubs/node-fs-promises.ts'),
      'node:path': path.resolve(rootDir, 'src/stubs/node-path.ts'),
      sqldesc: path.resolve(rootDir, '../src/index.ts'),
    },
  },
  plugins: [wasm(), topLevelAwait()],
  optimizeDeps: {
    exclude: ['@polyglot-sql/sdk'],
  },
});

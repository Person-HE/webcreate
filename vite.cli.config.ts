import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: path.resolve(__dirname, 'cli'),
  base: './',
  build: {
    outDir: path.resolve(__dirname, 'dist', 'cli'),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'cli', 'render.html'),
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});

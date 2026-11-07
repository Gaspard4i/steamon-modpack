import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  root: import.meta.dirname,
  build: { outDir: 'dist', emptyOutDir: true, target: 'es2020', chunkSizeWarningLimit: 600 },
  resolve: { alias: { '@shared': path.resolve(import.meta.dirname, '../shared') } },
  server: {
    port: 5173,
    fs: { allow: [path.resolve(import.meta.dirname, '..')] },
    proxy: { '/socket.io': { target: 'http://127.0.0.1:3210', ws: true }, '/status': 'http://127.0.0.1:3210' },
  },
});

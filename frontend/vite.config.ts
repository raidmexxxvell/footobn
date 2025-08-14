import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // publicDir по умолчанию — 'public', так что можно даже не указывать,
  // но я оставлю для наглядности
  publicDir: 'public',
  root: '.', // корень проекта (там, где index.html)
  build: {
    outDir: 'dist', // куда складывать билд
    emptyOutDir: true
  }
});
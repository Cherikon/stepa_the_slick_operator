import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: false,
    target: 'es2020'
  },
  esbuild: {
    legalComments: 'none'
  }
});

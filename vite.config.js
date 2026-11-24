import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Retain the browser targets used by the previous production build.
  build: { target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'] },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8080',
      '/panel-photo': 'http://localhost:8080'
    }
  },
  preview: {
    port: 4173
  }
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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

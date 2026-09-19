import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

declare const process: { env: Record<string, string | undefined> };

export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_PATH || '/',
  server: { port: 5196, host: '127.0.0.1', strictPort: true },
  preview: { port: 5196, host: '127.0.0.1' },
  build: { target: 'es2020', sourcemap: true },
});

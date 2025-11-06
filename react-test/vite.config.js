import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      'firebase/app',
      'firebase/auth',
      'firebase/firestore' // ← ここを追加
    ],
  },
  build: {
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
      external: [], // Firebase を外部化しない
    },
  },
});

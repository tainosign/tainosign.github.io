import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
      // Firebase を外部化せずバンドル
      external: [],
    },
    commonjsOptions: {
      include: [/node_modules/],
      extensions: ['.js', '.cjs'],
    },
  },
  optimizeDeps: {
    include: [
      'firebase/app',
      'firebase/auth',
      'firebase/firestore', // ← ここを追加
    ],
  },
});

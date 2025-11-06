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
    },
    // Firebaseの深いインポートを解決するために、CommonJSオプションを含める
    commonjsOptions: {
      include: [/node_modules/], 
    },
  },
  // 開発時およびビルド時にFirebaseのモジュールパス解決を助けるための設定
  optimizeDeps: {
    include: [
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
    ],
  },
});

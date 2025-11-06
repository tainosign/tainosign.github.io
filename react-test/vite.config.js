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
      // Rollupのexternal設定を削除: Firebaseがバンドルに含まれるようにします。
    },
    // Firebaseのディープインポート（CommonJS形式）を正しく処理するため、commonjsOptionsを再度有効にします。
    commonjsOptions: {
      include: [/node_modules/], 
    },
  },
  // 開発時（dev server）の最適化設定は維持
  optimizeDeps: {
    include: [
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
    ],
  },
});

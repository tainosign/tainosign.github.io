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
      // Firebaseのディープインポートパスを解決するため、外部依存関係として明示的にマークします。
      external: [
        'firebase/app',
        'firebase/auth',
        'firebase/firestore',
      ],
    },
    // commonjsOptionsはexternal設定により不要となるため削除しました。
  },
  // 開発環境での依存関係解決を助けるための設定は維持します。
  optimizeDeps: {
    include: [
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
    ],
  },
});

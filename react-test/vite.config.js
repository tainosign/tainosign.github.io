import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react({
        // JSXをサポートするために、.js拡張子も含めて処理対象に明示的に追加
        include: /\.(jsx|js|ts|tsx)$/, 
    }),
  ],
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
      // 🚨 RollupにFirebaseのディープインポートを外部依存関係として処理するよう指示
      // これがモジュール解決エラーを回避する最も重要な設定です。
      external: [/^firebase\//], 
    },
    // Firebaseのディープインポート（CommonJS形式）をESMに正しく変換するために必要
    commonjsOptions: {
      include: [/node_modules/],
      // CommonJSの解決時に検索する拡張子を明示的に指定
      extensions: ['.js', '.cjs'],
    },
  },
  // 開発時の依存関係の最適化設定はそのまま維持
  optimizeDeps: {
    include: [
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
    ],
  },
});

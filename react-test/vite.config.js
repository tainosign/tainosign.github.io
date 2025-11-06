import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Firebase v8 は CJS なので optimizeDeps に書かなくてOK
  // もしビルド時に警告が出る場合は external にする方法もあり
  build: {
    rollupOptions: {
      external: [
        // 'firebase' を外部化する場合はこちらに追加
      ]
    }
  }
});

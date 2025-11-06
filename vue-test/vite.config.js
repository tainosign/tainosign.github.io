import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  root: 'vue-test', // ここで Vite のルートを指定
  plugins: [vue()],
  build: {
    outDir: '../dist', // ビルド後の出力先を調整
  },
});

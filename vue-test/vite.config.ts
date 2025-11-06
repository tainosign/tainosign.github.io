import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  root: 'vue-test',          // ここでビルド対象を vue-test に
  plugins: [vue()],
  build: {
    outDir: '../dist',       // ビルド成果物を project-root/dist に
    emptyOutDir: true
  }
});

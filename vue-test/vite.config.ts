import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: '../dist',       // ビルド成果物を project-root/dist に
    emptyOutDir: true
  }
});

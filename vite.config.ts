import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/global-share/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});

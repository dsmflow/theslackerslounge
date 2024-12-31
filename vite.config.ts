import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:10000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2015',
    chunkSizeWarningLimit: 4000,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        arcade: resolve(__dirname, 'arcade/index.html'),
        'ai-pong': resolve(__dirname, 'arcade/ai-pong/index.html'),
        'snake': resolve(__dirname, 'arcade/snake/index.html'),
        'tower-defense': resolve(__dirname, 'arcade/tower-defense/index.html')
      },
      output: {
        manualChunks: (id) => {
          // React vendor chunk
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') || 
              id.includes('node_modules/react-router-dom')) {
            return 'react-vendor';
          }
          // Monaco editor chunk
          if (id.includes('node_modules/@monaco-editor') || 
              id.includes('node_modules/monaco-editor')) {
            return 'monaco-vendor';
          }
          // Arcade games chunks
          if (id.includes('/arcade/snake/')) {
            return 'game-snake';
          }
          if (id.includes('/arcade/ai-pong/')) {
            return 'game-ai-pong';
          }
          if (id.includes('/arcade/tower-defense/')) {
            return 'game-tower-defense';
          }
        },
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return 'assets/[name]-[hash][extname]';
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (['ttf', 'otf', 'woff', 'woff2'].includes(ext)) {
            return `assets/ttf/[name]-[hash].[ext]`;
          }
          if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) {
            return `assets/img/[name]-[hash].[ext]`;
          }
          if (['css'].includes(ext)) {
            return `assets/css/[name]-[hash].[ext]`;
          }
          if (['js', 'ts'].includes(ext) && (assetInfo.name.includes('td-pkg') || assetInfo.name.includes('game'))) {
            return `[name].[ext]`; // Keep original name for game files
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      }
    },
    cssCodeSplit: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    }
  }
});

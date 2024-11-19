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
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'monaco-vendor': ['@monaco-editor/react', 'monaco-editor']
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
          if (['js'].includes(ext) && assetInfo.name.includes('td-pkg')) {
            return `[name].[ext]`; // Keep original name for game files
          }
          return `assets/[name]-[hash].[ext]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      }
    },
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020'
    },
    exclude: ['@monaco-editor/react']
  },
  publicDir: 'public'
});

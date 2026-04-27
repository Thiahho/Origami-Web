import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import compression from 'vite-plugin-compression';
import { resolve } from 'path';

export default defineConfig({
  root: './',
  base: '/',

  plugins: [
    react(),
    tailwindcss(),
    compression({ algorithm: 'gzip', ext: '.gz', threshold: 1024 }),
    compression({ algorithm: 'brotliCompress', ext: '.br', threshold: 1024 }),
  ],

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    minify: 'esbuild',
    target: 'es2015',
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-axios': ['axios'],
        },
        entryFileNames: 'assets/js/[name]-[hash].js',
        chunkFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name.split('.').pop();
          if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp|avif/i.test(extType)) return 'assets/img/[name]-[hash][extname]';
          if (/css/i.test(extType)) return 'assets/css/[name]-[hash][extname]';
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
  },

  server: {
    port: 3000,
    strictPort: true,
    open: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5015',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  assetsInlineLimit: 4096,
  css: { devSourcemap: false },
});

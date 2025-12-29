import { defineConfig } from 'vite';
import { resolve } from 'path';
import compression from 'vite-plugin-compression';

export default defineConfig({
  root: './',
  base: '/',

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,

    // Optimizaciones de build
    minify: 'esbuild',
    target: 'es2015',

    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        home: resolve(__dirname, 'Home.html'),
        tienda: resolve(__dirname, 'Tienda.html'),
        detalle: resolve(__dirname, 'DetalleProducto.html'),
        nosotros: resolve(__dirname, 'Nosotros/nosotros.html'),
        adminLogin: resolve(__dirname, 'admin/auth/login.html'),
        adminDashboard: resolve(__dirname, 'admin/dashboard.html'),
        adminProducts: resolve(__dirname, 'admin/products.html'),
        adminCategories: resolve(__dirname, 'admin/categories.html'),
        adminMarcas: resolve(__dirname, 'admin/marcas.html'),
        adminVariants: resolve(__dirname, 'admin/variants.html'),
        adminOrders: resolve(__dirname, 'admin/orders.html'),
        adminCondiciones: resolve(__dirname, 'admin/condiciones.html'),
      },
      output: {
        // Separar chunks para mejor caching
        manualChunks: {
          'vendor-axios': ['axios'],
        },
        // Naming con hash para cache busting
        entryFileNames: 'assets/js/[name]-[hash].js',
        chunkFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          let extType = assetInfo.name.split('.').pop();
          if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp|avif/i.test(extType)) {
            return 'assets/img/[name]-[hash][extname]';
          } else if (/css/i.test(extType)) {
            return 'assets/css/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },

    // Chunk size warnings
    chunkSizeWarningLimit: 1000,

    // Source maps solo en desarrollo
    sourcemap: false,
  },

  // Optimizaciones del servidor de desarrollo
  server: {
    port: 3000,
    open: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // Optimizaciones de assets
  assetsInlineLimit: 4096, // 4kb - inline assets más pequeños como base64

  plugins: [
    // Compresión gzip/brotli
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024, // Solo comprimir archivos > 1kb
    }),
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
    }),
  ],

  // Optimizaciones de dependencies
  optimizeDeps: {
    include: ['axios'],
  },

  // CSS optimizations
  css: {
    devSourcemap: false,
  },
});

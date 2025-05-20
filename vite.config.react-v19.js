import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';
import { visualizer } from 'rollup-plugin-visualizer';
import vitePluginImp from 'vite-plugin-imp';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh
      fastRefresh: true,
      // Enable React Server Components (RSC) - set to false for client-only app
      rsc: false,
      // Enable React compiler
      jsxImportSource: 'react',
    }),
    legacy({
      // Target browsers that need legacy support
      targets: ['defaults', 'not IE 11'],
    }),
    vitePluginImp({
      // For optimizing imports from libraries like Ant Design
      libList: [
        {
          libName: 'antd',
          style: (name) => `antd/es/${name}/style`,
        },
      ],
    }),
    // Uncomment to generate bundle visualization
    // visualizer({
    //   open: true,
    //   gzipSize: true,
    //   brotliSize: true,
    // }),
  ],
  // Configure server
  server: {
    port: 5173,
    proxy: {
      // Proxy API requests to backend
      '/api': {
        target: 'http://localhost:16686',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  // Configure build
  build: {
    outDir: 'build',
    sourcemap: true,
    // Optimize chunks
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material', '@mui/lab'],
          vendor: [
            '@tanstack/react-query',
            'zustand',
            'react-router-dom',
            'recharts',
          ],
        },
      },
    },
  },
  // Configure resolve
  resolve: {
    alias: {
      // Add any path aliases here
      '@': '/src',
    },
  },
  // Configure CSS
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  // Configure esbuild
  esbuild: {
    // Enable JSX in .js files
    jsx: 'automatic',
    // Drop console.log in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
});
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { bundleMonitor } from './vite-plugins/bundle-monitor'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    bundleMonitor({
      performanceBudget: {
        maxBundleSize: 2000, // 2MB
        maxChunkSize: 500,   // 500KB
        maxAssetSize: 250,   // 250KB
        maxJSSize: 1500,     // 1.5MB
        maxCSSSize: 100,     // 100KB
        maxImageSize: 500    // 500KB per image
      },
      enableReport: true,
      failOnError: false // Set to true in CI to fail builds that exceed budget
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@game': path.resolve(__dirname, './src/game'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@store': path.resolve(__dirname, './src/store'),
    },
  },
  optimizeDeps: {
    // Remove Three.js from pre-bundling to allow for dynamic loading
    include: [
      'framer-motion',
      'zustand',
    ],
    exclude: [
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      '@react-spring/three'
    ],
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      external: ['vitest', '@testing-library/react', '@testing-library/jest-dom', '@testing-library/user-event'],
      output: {
        manualChunks: (id) => {
          // Skip test files completely
          if (id.includes('__tests__') || id.includes('test.') || id.includes('.test.') || id.includes('vitest')) {
            return undefined;
          }

          // Ultra-granular Three.js chunking for dynamic loading
          if (id.includes('three/examples/jsm/loaders/')) {
            return 'three-loaders';
          }
          if (id.includes('three/examples/jsm/controls/')) {
            return 'three-controls';
          }
          if (id.includes('three/examples/jsm/postprocessing/')) {
            return 'three-postprocessing';
          }
          if (id.includes('three/examples/jsm/geometries/')) {
            return 'three-geometries';
          }
          if (id.includes('three/examples/jsm/materials/')) {
            return 'three-materials';
          }
          if (id.includes('three/examples/jsm/objects/')) {
            return 'three-objects';
          }
          if (id.includes('three/examples/jsm/utils/')) {
            return 'three-utils';
          }
          if (id.includes('three/examples/jsm/helpers/')) {
            return 'three-helpers';
          }
          if (id.includes('three/examples/jsm/')) {
            return 'three-extras';
          }

          // Core Three.js - split into smaller pieces
          if (id.includes('three/src/geometries/')) {
            return 'three-core-geometries';
          }
          if (id.includes('three/src/materials/')) {
            return 'three-core-materials';
          }
          if (id.includes('three/src/lights/')) {
            return 'three-core-lights';
          }
          if (id.includes('three/src/cameras/')) {
            return 'three-core-cameras';
          }
          if (id.includes('three/src/renderers/')) {
            return 'three-core-renderers';
          }
          if (id.includes('three') && !id.includes('@react-three')) {
            return 'three-core';
          }

          // React Three ecosystem
          if (id.includes('@react-three/fiber')) {
            return 'three-fiber';
          }
          if (id.includes('@react-three/drei')) {
            return 'three-drei';
          }
          if (id.includes('@react-spring/three')) {
            return 'three-spring';
          }

          // Vendor chunks
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          if (id.includes('framer-motion')) {
            return 'ui-animation';
          }
          if (id.includes('react-router')) {
            return 'routing';
          }
          if (id.includes('zustand')) {
            return 'state';
          }
          if (id.includes('@heroicons')) {
            return 'icons';
          }

          // Game and 3D components - separate chunks for lazy loading
          if (id.includes('src/game/') && id.includes('levels/')) {
            return 'game-levels';
          }
          if (id.includes('src/game/') && id.includes('entities/')) {
            return 'game-entities';
          }
          if (id.includes('src/game/')) {
            return 'game-core';
          }
          if (id.includes('src/components/3d/')) {
            return 'components-3d';
          }
          if (id.includes('src/shaders/')) {
            return 'shaders';
          }

          // Keep monitoring separate
          if (id.includes('src/monitoring/')) {
            return 'monitoring';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log'],
        passes: 2,
      },
      format: {
        comments: false,
      },
    },
    chunkSizeWarningLimit: 500,
    reportCompressedSize: false,
  },
  server: {
    port: 5173,
    host: true,
    open: false,
    allowedHosts: ['lightbrush.moestradamus.art', 'localhost', '88.216.197.40'],
  },
  preview: {
    port: 8175,
    host: true,
    strictPort: true,
    cors: true,
  },
})

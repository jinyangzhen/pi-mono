import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import federation from '@originjs/vite-plugin-federation'

// Single config for ChatApp - supports both standalone and federation modes
// FEDERATION=true → exposes ChatApp as remote for host consumption
// FEDERATION=false or unset → runs as standalone SPA

const isFederation = process.env.FEDERATION === 'true'

export default defineConfig({
  plugins: [
    react(),
    isFederation && federation({
      name: 'chat',
      filename: 'remoteEntry.js',
      exposes: {
        './ChatApp': './src/apps/chat/ChatApp.tsx',
      },
      remotes: {},
      shared: ['react', 'react-dom', 'zustand'],
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Only scan chat.html entry, exclude host-specific files
  optimizeDeps: {
    entries: ['chat.html'],
  },
  server: {
    port: 4001,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:5000',
        ws: true,
      },
    },
  },
  preview: {
    port: 4001,
    cors: true,
  },
  build: {
    outDir: 'dist-chat',
    sourcemap: true,
    target: 'esnext',
    minify: false,
    modulePreload: false,
    rollupOptions: isFederation
      ? {
          input: [], // Only federation artifacts when building for remote
          preserveEntrySignatures: 'strict',
        }
      : {
          input: ['chat.html'], // Standalone SPA build
        },
  },
})

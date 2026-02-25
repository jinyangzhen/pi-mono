import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'chat',
      filename: 'remoteEntry.js',
      exposes: {
        './ChatApp': './src/apps/chat/ChatApp.tsx',
      },
      remotes: {},
      shared: ['react', 'react-dom', 'zustand'],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
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
    port: 3001,
    cors: true,
  },
  build: {
    outDir: 'dist-chat',
    sourcemap: true,
    target: 'esnext',
    minify: false,
    modulePreload: false,
    rollupOptions: {
      input: [],
      // Only build federation artifacts, no HTML entry needed
      preserveEntrySignatures: 'strict',
    },
  },
})

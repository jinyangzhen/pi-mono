import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'tian_gong_host',
      filename: 'remoteEntry.js',
      exposes: {
        './ChatApp': './src/apps/chat/ChatApp.tsx',
        './TerminalApp': './src/apps/terminal/TerminalApp.tsx',
      },
      remotes: {
        chat: 'http://localhost:3001/remoteEntry.js',
        terminal: 'http://localhost:3002/remoteEntry.js',
      },
      shared: ['react', 'react-dom', 'zustand'],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
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
    middlewareMode: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'esnext',
  },
})

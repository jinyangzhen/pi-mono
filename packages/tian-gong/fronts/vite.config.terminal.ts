import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'terminal',
      filename: 'remoteEntry.js',
      exposes: {
        './TerminalApp': './src/apps/terminal/TerminalApp.tsx',
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
    port: 3002,
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
    port: 3002,
    cors: true,
  },
  build: {
    outDir: 'dist-terminal',
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

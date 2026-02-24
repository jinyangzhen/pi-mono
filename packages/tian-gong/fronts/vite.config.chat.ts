import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'chat_remote',
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
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:3000',
        ws: true,
      },
    },
  },
  preview: {
    port: 3001,
  },
  build: {
    outDir: 'dist-chat',
    sourcemap: true,
    target: 'esnext',
    minify: false,
    modulePreload: false,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'src/apps/chat/main.tsx'),
      },
    },
  },
})

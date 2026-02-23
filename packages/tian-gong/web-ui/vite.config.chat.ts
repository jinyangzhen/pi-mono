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
  },
  build: {
    outDir: 'dist-chat',
    sourcemap: true,
    target: 'esnext',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'src/apps/chat/index.ts'),
      },
    },
  },
})

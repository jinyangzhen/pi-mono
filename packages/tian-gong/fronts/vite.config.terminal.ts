import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'terminal_remote',
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
  },
  build: {
    outDir: 'dist-terminal',
    sourcemap: true,
    target: 'esnext',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'src/apps/terminal/index.ts'),
      },
    },
  },
})

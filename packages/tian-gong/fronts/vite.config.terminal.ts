import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import federation from '@originjs/vite-plugin-federation'

// Single config for TerminalApp - supports both standalone and federation modes
// FEDERATION=true → exposes TerminalApp as remote for host consumption
// FEDERATION=false or unset → runs as standalone SPA

const isFederation = process.env.FEDERATION === 'true'

export default defineConfig({
  plugins: [
    react(),
    isFederation && federation({
      name: 'terminal',
      filename: 'remoteEntry.js',
      exposes: {
        './TerminalApp': './src/apps/terminal/TerminalApp.tsx',
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
  // Only scan terminal.html entry, exclude host-specific files
  optimizeDeps: {
    entries: ['terminal.html'],
  },
  server: {
    port: 4002,
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
    port: 4002,
    cors: true,
  },
  build: {
    outDir: 'dist-terminal',
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
          input: ['terminal.html'], // Standalone SPA build
        },
      }
})

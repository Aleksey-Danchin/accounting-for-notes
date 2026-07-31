import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  envDir: path.resolve(import.meta.dirname, '../..'),

  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    tailwindcss(),
    react(),
  ],

  resolve: {
    alias: {
      __frontend: path.resolve(import.meta.dirname, 'src'),
      __backend: path.resolve(import.meta.dirname, '../backend'),
      __prisma: path.resolve(import.meta.dirname, '../prisma'),
    },
  },

  server: {
    host: '0.0.0.0',
    port: 5173,
  },
})

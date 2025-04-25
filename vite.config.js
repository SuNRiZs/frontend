import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url)
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    // прокси для API-запросов
    proxy: {
      // всё, что идёт на /api/* будет уходить на бэкенд
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        secure: false,
        // опционально, если нужны проксирование ws
        // ws: true,
      },
    }
  }
})

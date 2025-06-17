import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
      host: '0.0.0.0',  // теперь слушаем IPv4 и IPv6
      port: 3000
    },
    resolve: { alias: { '@': '/src' } },
  });
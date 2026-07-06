import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        configure: (proxy) => {
          proxy.on('error', (err, req) => {
            console.error(`[proxy] ${req.method} ${req.url} — ${err.code}: ${err.message}`);
          });
          proxy.on('proxyReq', (_, req) => {
            console.log(`[proxy] --> ${req.method} ${req.url}`);
          });
          proxy.on('proxyRes', (res, req) => {
            console.log(`[proxy] <-- ${req.method} ${req.url} ${res.statusCode}`);
          });
        }
      }
    }
  }
})

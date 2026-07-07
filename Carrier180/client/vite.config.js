import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        headers: { connection: 'close' },
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            console.error(`[proxy] ${req.method} ${req.url} — ${err.code}: ${err.message}`);
            if (res && !res.headersSent) {
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Backend unavailable', code: err.code }));
            }
          });
          proxy.on('proxyReq', (_, req) => {
            console.log(`[proxy] --> ${req.method} ${req.url}`);
          });
          proxy.on('proxyRes', (res, req) => {
            console.log(`[proxy] <-- ${req.method} ${req.url} ${res.statusCode}`);
          });
        },
        proxyTimeout: 35000
      }
    }
  }
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { autoSavePlugin } from './vite-plugin-autosave'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), autoSavePlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/pump-api': {
        target: 'https://frontend-api.pump.fun',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/pump-api/, ''),
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, _req, _res) => {
            proxyReq.setHeader('Origin', 'https://pump.fun');
            proxyReq.setHeader('Referer', 'https://pump.fun/');
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
          });
        },
      },
    },
  },
})

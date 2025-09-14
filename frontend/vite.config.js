// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '^/(api|sanctum|storage)': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        // secure: false, // only needed if your backend is HTTPS with self-signed cert
      },
    },
  },
})

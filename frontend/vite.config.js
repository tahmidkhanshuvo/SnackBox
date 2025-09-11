import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // This single, more robust rule will forward any request starting with
      // '/api' or '/sanctum' to your Laravel backend. This is less prone to
      // errors than multiple, separate rules.
      '^/(api|sanctum)': {
        target: 'http://localhost:8000', // Your Laravel backend URL
        changeOrigin: true,
      },
    }
  }
})


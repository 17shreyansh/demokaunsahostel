import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  define: {
    __API_BASE_URL__: JSON.stringify(process.env.VITE_API_BASE_URL || 'http://localhost:5000/api'),
    __UPLOADS_BASE_URL__: JSON.stringify(process.env.VITE_UPLOADS_BASE_URL || 'http://localhost:5000/uploads')
  }
})
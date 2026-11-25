import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// VITE_BASE bisa diisi jika situs di-deploy di subfolder (default '/').
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || '/',
  build: { chunkSizeWarningLimit: 900 },
})

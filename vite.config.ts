import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
  plugins: [react(),tailwindcss()], // Ya no necesitas importar 'tailwindcss' aquí
  base: '/chess-control-time/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})

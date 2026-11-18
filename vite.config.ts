import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Las rutas son reales (/carta, /admin), así que los assets se sirven desde la raíz.
// public/_redirects hace que Cloudflare Pages devuelva index.html en cualquier ruta.
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
})

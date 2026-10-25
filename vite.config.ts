import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base './' hace que el sitio funcione igual en usuario.github.io/<repo>/ o con dominio propio
// (las rutas internas van después del #, así que index.html siempre está en la misma carpeta).
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})

import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// Vite es la herramienta que corre tu página en el navegador mientras programas.
// Aquí le decimos que use React y Tailwind.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Proxy: cuando el frontend pide "/api/...", Vite lo reenvía a tu API de Python en el puerto 8000.
  server: {
    proxy: { '/api': 'http://localhost:8000' },
  },
})

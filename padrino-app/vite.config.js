// Configuracion de Vite para el frontend

import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  root: path.resolve(process.cwd(), 'padrino-app'),
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: path.resolve(process.cwd(), 'dist/padrino-app'),
    emptyOutDir: true
  }
})
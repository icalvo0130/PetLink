// Configuracion de Vite para admin-app

import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  root: path.resolve(process.cwd(), 'admin-app'),
  server: {
    port: 5174,
    open: true,
    proxy: {
      // Proxy para las peticiones al backend
      '/api': {
        target: 'http://localhost:5050',
        changeOrigin: true,
        secure: false,
      },
      // Proxy para websockets
      '/socket.io': {
        target: 'http://localhost:5050',
        changeOrigin: true,
        ws: true,
      }
    }
  },
  build: {
    outDir: path.resolve(process.cwd(), 'dist/admin-app'),
    emptyOutDir: true
  }
})


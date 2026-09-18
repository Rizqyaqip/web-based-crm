import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'

function copyAssetsPlugin() {
  return {
    name: 'copy-src-assets',
    closeBundle() {
      const srcDir = fileURLToPath(new URL('./src/assets', import.meta.url))
      const distSrc = fileURLToPath(new URL('./dist/src/assets', import.meta.url))
      if (fs.existsSync(srcDir)) {
        fs.mkdirSync(path.dirname(distSrc), { recursive: true })
        fs.cpSync(srcDir, distSrc, { recursive: true, force: true })
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), copyAssetsPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react'
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons'
            }
            return 'vendor'
          }
        }
      }
    }
  }
})

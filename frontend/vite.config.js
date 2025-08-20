import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Custom plugin to handle SPA routing for dashboard routes only
const spaFallbackPlugin = () => {
  return {
    name: 'spa-fallback',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Skip Vite internal files, API routes, and static files
        if (req.url.startsWith('/@') ||           // Vite internal files
            req.url.startsWith('/api') ||         // API routes
            req.url.includes('.') ||              // Static files
            req.url === '/') {                    // Root
          return next()
        }
        
        // Only handle dashboard routes that need SPA fallback
        const dashboardRoutes = ['/patient', '/doctor', '/admin']
        const isDashboardRoute = dashboardRoutes.some(route => req.url.startsWith(route))
        
        // Only redirect dashboard routes and only for HTML requests
        if (isDashboardRoute && req.headers.accept?.includes('text/html')) {
          req.url = '/'
        }
        next()
      })
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), spaFallbackPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
    fs: {
      strict: false
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable sourcemaps in production for smaller bundle
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react', 'framer-motion'],
          forms: ['react-hook-form', 'react-select'],
          utils: ['axios', 'date-fns', 'js-cookie']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  preview: {
    port: 4173,
    host: true
  }
})

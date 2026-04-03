import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setupTests.js'
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React y router en un chunk separado
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // FullCalendar es pesado: va solo
          'vendor-calendar': [
            '@fullcalendar/core',
            '@fullcalendar/react',
            '@fullcalendar/timegrid',
            '@fullcalendar/interaction'
          ],
          // Resto de dependencias externas
          'vendor-misc': ['axios', 'sonner', 'zustand']
        }
      }
    }
  }
})


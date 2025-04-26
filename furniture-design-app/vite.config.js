import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  optimizeDeps: {
    exclude: ['three'], // ⚡ Important to avoid three.js pre-bundling errors
  },
  server: {
    open: true, // Optional: automatically open browser on npm run dev
  },
})

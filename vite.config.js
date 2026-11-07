import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Three.js (~500 kB) is loaded on demand by the hero (see features/hero/Hero.jsx), so the size warning
    // for that single lazy chunk is expected; the initial bundle stays well below this limit.
    chunkSizeWarningLimit: 650,
  },
})

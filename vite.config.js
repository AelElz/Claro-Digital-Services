import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Pinned so the preview URL never moves under the person watching it.
  // strictPort fails loudly instead of silently drifting to 5174.
  server: { port: 5173, strictPort: true },
  preview: { port: 5173, strictPort: true },
})

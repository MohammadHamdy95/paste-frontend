import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Inner-loop dev: `npm run dev` + a locally running paste-backend.
    // Same-origin /v1 calls proxy to Spring on 8080 — no CORS involved.
    proxy: {
      '/v1': 'http://localhost:8080',
    },
  },
})

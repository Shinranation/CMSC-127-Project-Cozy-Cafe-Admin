import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load env from repo root (admin .env next to backend) and expose SUPABASE_* for this app.
export default defineConfig({
  plugins: [react()],
  envDir: path.resolve(__dirname, '..'),
  envPrefix: ['VITE_', 'SUPABASE_'],
})

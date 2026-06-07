import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base:
    process.env.GITHUB_PAGES === 'true'
      ? `/${process.env.GITHUB_REPOSITORY_NAME || 'review-paper-writer'}/`
      : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})

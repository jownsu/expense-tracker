import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { codeInspectorPlugin } from 'code-inspector-plugin'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // codeInspectorPlugin: dev server only; Option+Shift + click an element to open its source
  plugins: [command === 'serve' && codeInspectorPlugin({ bundler: 'vite' }), react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}))

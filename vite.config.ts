import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { apiDevPlugin } from './vite.dev-api-plugin.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), apiDevPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    // Alguns testes esperam o primeiro import() dinâmico de chunks pesados
    // (ECharts/Monaco via ExecutionHistoryDialog) resolver; em máquinas mais
    // lentas isso passa do padrão de 5s.
    testTimeout: 20000,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['e2e/**', 'api/**', '**/*.config.*', 'src/test/**'],
    },
    exclude: ['e2e/**', 'node_modules/**'],
  },
})

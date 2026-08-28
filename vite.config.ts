import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'
import { apiDevPlugin } from './vite.dev-api-plugin.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Vite só injeta variáveis prefixadas com VITE_ no bundle do cliente
  // (import.meta.env) — nunca carrega o .env em `process.env` do processo
  // Node que roda o próprio Vite. O AI Copilot (api/copilot.ts via
  // vite.dev-api-plugin.ts) lê `process.env.GROQ_API_KEY` diretamente, então
  // sem isso o dev server nunca "vê" a chave, mesmo com o .env preenchido.
  // Em produção (Vercel) isso não é necessário: a plataforma injeta as
  // env vars do dashboard direto em process.env do runtime da function.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))

  return {
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
      // (ECharts/Monaco via ExecutionHistoryDialog) resolver; em máquinas
      // mais lentas isso passa do padrão de 5s.
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
  }
})

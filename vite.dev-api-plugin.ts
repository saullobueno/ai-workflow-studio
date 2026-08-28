import type { IncomingMessage } from 'node:http'
import type { Plugin } from 'vite'
import {
  handleCopilotRequest,
  toCopilotErrorResponse,
} from './src/server/copilot-handler.js'

function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (chunk: Buffer) => {
      raw += chunk.toString()
    })
    req.on('end', () => {
      if (raw === '') {
        resolve({})
        return
      }
      try {
        resolve(JSON.parse(raw))
      } catch (error: unknown) {
        reject(error instanceof Error ? error : new Error('JSON inválido'))
      }
    })
    req.on('error', reject)
  })
}

/**
 * Reproduz `api/copilot.ts` (a Vercel Function real) como middleware do
 * servidor de dev do Vite, reusando a mesma lógica de `copilot-handler.ts`
 * — assim `npm run dev` funciona sem precisar da CLI/login da Vercel.
 */
export function apiDevPlugin(): Plugin {
  return {
    name: 'api-dev-plugin',
    configureServer(server) {
      server.middlewares.use('/api/copilot', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              error: { title: 'Método não permitido', detail: 'Use POST.' },
            }),
          )
          return
        }

        readJsonBody(req)
          .then((body) => handleCopilotRequest(body))
          .then((result) => {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(result))
          })
          .catch((error: unknown) => {
            const { status, body } = toCopilotErrorResponse(error)
            res.statusCode = status
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(body))
          })
      })
    },
  }
}

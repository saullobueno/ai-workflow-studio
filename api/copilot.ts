import type { VercelRequest, VercelResponse } from '@vercel/node'
// Import relativo (não o alias @/*) de propósito: o runtime Node.js da
// Vercel para funções em /api NÃO suporta path mapping do tsconfig (ver
// docs.vercel.com/docs/functions/runtimes/node-js) — o alias resolve em dev
// (Vite) e no typecheck, mas quebraria em produção. Ver ADR 0009.
import {
  handleCopilotRequest,
  toCopilotErrorResponse,
} from '../src/server/copilot-handler.js'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({
      error: { title: 'Método não permitido', detail: 'Use POST.' },
    })
    return
  }

  try {
    const result = await handleCopilotRequest(req.body)
    res.status(200).json(result)
  } catch (error) {
    const { status, body } = toCopilotErrorResponse(error)
    res.status(status).json(body)
  }
}

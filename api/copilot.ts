import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  handleCopilotRequest,
  toCopilotErrorResponse,
} from '@/server/copilot-handler'

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

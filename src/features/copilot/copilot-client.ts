import { postJson } from '@/core/http-client'
import { copilotResponseSchema, type CopilotResponse } from '@/schemas/copilot'

export function generateWorkflowFromPrompt(
  prompt: string,
): Promise<CopilotResponse> {
  return postJson('/api/copilot', { prompt }, copilotResponseSchema, {
    timeoutMs: 60_000,
  })
}

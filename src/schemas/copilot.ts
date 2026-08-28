import { z } from 'zod'
import { workflowSchema } from './workflow.js'

export const copilotRequestSchema = z.object({
  prompt: z
    .string()
    .min(1, 'Descreva o workflow que você quer criar')
    .max(2000, 'Máx. 2000 caracteres'),
})
export type CopilotRequest = z.infer<typeof copilotRequestSchema>

/**
 * O que o LLM precisa gerar: um Workflow sem os campos que a aplicação
 * atribui na criação (id do workflow e timestamps). Nodes e variáveis ainda
 * carregam `id` porque as edges do próprio rascunho referenciam esses ids.
 */
export const copilotWorkflowDraftSchema = workflowSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})
export type CopilotWorkflowDraft = z.infer<typeof copilotWorkflowDraftSchema>

export const copilotResponseSchema = z.object({
  workflow: copilotWorkflowDraftSchema,
})
export type CopilotResponse = z.infer<typeof copilotResponseSchema>

export const copilotErrorResponseSchema = z.object({
  error: z.object({
    title: z.string(),
    detail: z.string(),
  }),
})
export type CopilotErrorResponse = z.infer<typeof copilotErrorResponseSchema>

import { z } from 'zod'

export const workflowEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  sourceHandle: z.string().nullable().optional(),
  targetHandle: z.string().nullable().optional(),
  label: z.string().max(40).optional(),
})
export type WorkflowEdge = z.infer<typeof workflowEdgeSchema>

import { z } from 'zod'
import { workflowEdgeSchema } from './edge'
import { workflowNodeSchema } from './node'
import { workflowVariableSchema } from './variable'

export const workflowSchema = z.object({
  id: z.string().min(1),
  // Permissivo com string vazia: o nome é editado por um <input> ligado
  // direto ao autosave (ver schemas/node.ts para o motivo completo).
  name: z.string().max(120, 'Máx. 120 caracteres'),
  description: z.string().max(500).default(''),
  variables: z.array(workflowVariableSchema).max(50).default([]),
  nodes: z.array(workflowNodeSchema).max(200).default([]),
  edges: z.array(workflowEdgeSchema).max(400).default([]),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})
export type Workflow = z.infer<typeof workflowSchema>

export const workflowSummarySchema = workflowSchema
  .pick({
    id: true,
    name: true,
    description: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    nodeCount: z.number().int().min(0),
  })
export type WorkflowSummary = z.infer<typeof workflowSummarySchema>

export function toWorkflowSummary(workflow: Workflow): WorkflowSummary {
  return {
    id: workflow.id,
    name: workflow.name,
    description: workflow.description,
    createdAt: workflow.createdAt,
    updatedAt: workflow.updatedAt,
    nodeCount: workflow.nodes.length,
  }
}

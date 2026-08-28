import { z } from 'zod'

export const nodeKindSchema = z.enum([
  'trigger',
  'ai-classify',
  'condition',
  'loop',
  'action',
])
export type NodeKind = z.infer<typeof nodeKindSchema>

const positionSchema = z.object({ x: z.number(), y: z.number() })

/**
 * Nodes ficam persistidos em `localStorage` a cada tecla digitada (autosave
 * — ver `features/workflow-editor/store.ts`), então um node "pela metade"
 * (campo de template ainda vazio, por exemplo) tem que continuar sendo um
 * valor válido para o schema — senão o autosave grava um estado que a
 * próxima leitura rejeita, e o workflow inteiro "desaparece" silenciosamente.
 *
 * Por isso estes schemas são propositalmente permissivos com string vazia.
 * "Esse node está pronto para rodar?" é responsabilidade do motor de
 * execução (`features/execution`), não do schema de persistência.
 */
const labelSchema = z.string().max(80, 'Máx. 80 caracteres')
const templateSchema = z.string().max(2000, 'Máx. 2000 caracteres')
const identifierSchema = z
  .string()
  .max(60)
  .refine(
    (value) => value === '' || /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value),
    'Use letras, números e "_", começando por uma letra',
  )

export const triggerFieldSchema = z.object({
  name: identifierSchema,
  sampleValue: z.string().max(500),
})
export type TriggerField = z.infer<typeof triggerFieldSchema>

export const triggerNodeDataSchema = z.object({
  kind: z.literal('trigger'),
  label: labelSchema,
  eventName: z.string().max(80),
  fields: z.array(triggerFieldSchema).max(20).default([]),
})
export type TriggerNodeData = z.infer<typeof triggerNodeDataSchema>

export const aiClassifyNodeDataSchema = z.object({
  kind: z.literal('ai-classify'),
  label: labelSchema,
  instructions: templateSchema,
  inputTemplate: templateSchema,
  categories: z
    .array(z.string().min(1).max(40))
    .min(2, 'Defina ao menos 2 categorias')
    .max(8, 'Máx. 8 categorias'),
  outputVariable: identifierSchema,
})
export type AiClassifyNodeData = z.infer<typeof aiClassifyNodeDataSchema>

export const conditionOperatorSchema = z.enum([
  'equals',
  'not-equals',
  'contains',
])
export type ConditionOperator = z.infer<typeof conditionOperatorSchema>

export const conditionNodeDataSchema = z.object({
  kind: z.literal('condition'),
  label: labelSchema,
  fieldTemplate: templateSchema,
  operator: conditionOperatorSchema,
  value: z.string().max(200),
})
export type ConditionNodeData = z.infer<typeof conditionNodeDataSchema>

export const loopNodeDataSchema = z.object({
  kind: z.literal('loop'),
  label: labelSchema,
  listTemplate: templateSchema,
  itemVariable: identifierSchema,
  maxIterations: z.number().int().min(1).max(50).default(10),
})
export type LoopNodeData = z.infer<typeof loopNodeDataSchema>

export const slackActionDataSchema = z.object({
  kind: z.literal('action'),
  actionKind: z.literal('slack'),
  label: labelSchema,
  channel: z.string().max(80),
  message: templateSchema,
})
export type SlackActionData = z.infer<typeof slackActionDataSchema>

export const emailActionDataSchema = z.object({
  kind: z.literal('action'),
  actionKind: z.literal('email'),
  label: labelSchema,
  to: templateSchema,
  subject: templateSchema,
  body: templateSchema,
})
export type EmailActionData = z.infer<typeof emailActionDataSchema>

export const createTaskActionDataSchema = z.object({
  kind: z.literal('action'),
  actionKind: z.literal('create-task'),
  label: labelSchema,
  title: templateSchema,
  assignee: templateSchema,
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
})
export type CreateTaskActionData = z.infer<typeof createTaskActionDataSchema>

export const actionNodeDataSchema = z.union([
  slackActionDataSchema,
  emailActionDataSchema,
  createTaskActionDataSchema,
])
export type ActionNodeData = z.infer<typeof actionNodeDataSchema>

export const nodeDataSchema = z.union([
  triggerNodeDataSchema,
  aiClassifyNodeDataSchema,
  conditionNodeDataSchema,
  loopNodeDataSchema,
  slackActionDataSchema,
  emailActionDataSchema,
  createTaskActionDataSchema,
])
export type NodeData = z.infer<typeof nodeDataSchema>

export const workflowNodeSchema = z.object({
  id: z.string().min(1),
  type: nodeKindSchema,
  position: positionSchema,
  data: nodeDataSchema,
})
export type WorkflowNode = z.infer<typeof workflowNodeSchema>

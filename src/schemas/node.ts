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

const labelSchema = z
  .string()
  .min(1, 'Obrigatório')
  .max(80, 'Máx. 80 caracteres')
const templateSchema = z
  .string()
  .min(1, 'Obrigatório')
  .max(2000, 'Máx. 2000 caracteres')

export const triggerFieldSchema = z.object({
  name: z
    .string()
    .min(1, 'Obrigatório')
    .regex(
      /^[a-zA-Z_][a-zA-Z0-9_]*$/,
      'Use letras, números e "_", começando por uma letra',
    ),
  sampleValue: z.string(),
})
export type TriggerField = z.infer<typeof triggerFieldSchema>

export const triggerNodeDataSchema = z.object({
  kind: z.literal('trigger'),
  label: labelSchema,
  eventName: z.string().min(1, 'Obrigatório').max(80),
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
  outputVariable: z
    .string()
    .min(1, 'Obrigatório')
    .regex(
      /^[a-zA-Z_][a-zA-Z0-9_]*$/,
      'Use letras, números e "_", começando por uma letra',
    ),
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
  value: z.string().min(1, 'Obrigatório').max(200),
})
export type ConditionNodeData = z.infer<typeof conditionNodeDataSchema>

export const loopNodeDataSchema = z.object({
  kind: z.literal('loop'),
  label: labelSchema,
  listTemplate: templateSchema,
  itemVariable: z
    .string()
    .min(1, 'Obrigatório')
    .regex(
      /^[a-zA-Z_][a-zA-Z0-9_]*$/,
      'Use letras, números e "_", começando por uma letra',
    ),
  maxIterations: z.number().int().min(1).max(50).default(10),
})
export type LoopNodeData = z.infer<typeof loopNodeDataSchema>

export const slackActionDataSchema = z.object({
  kind: z.literal('action'),
  actionKind: z.literal('slack'),
  label: labelSchema,
  channel: z.string().min(1, 'Obrigatório').max(80),
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

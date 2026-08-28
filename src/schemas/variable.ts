import { z } from 'zod'

export const workflowVariableTypeSchema = z.enum([
  'string',
  'number',
  'boolean',
])
export type WorkflowVariableType = z.infer<typeof workflowVariableTypeSchema>

export const workflowVariableSchema = z.object({
  id: z.string().min(1),
  name: z
    .string()
    .min(1, 'Obrigatório')
    .regex(
      /^[a-zA-Z_][a-zA-Z0-9_]*$/,
      'Use letras, números e "_", começando por uma letra',
    ),
  type: workflowVariableTypeSchema,
  defaultValue: z.string(),
})
export type WorkflowVariable = z.infer<typeof workflowVariableSchema>

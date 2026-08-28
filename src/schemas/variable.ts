import { z } from 'zod'

export const workflowVariableTypeSchema = z.enum([
  'string',
  'number',
  'boolean',
])
export type WorkflowVariableType = z.infer<typeof workflowVariableTypeSchema>

// Permissivo com nome vazio pelo mesmo motivo dos schemas de node (ver
// comentário em schemas/node.ts): precisa continuar válido enquanto o
// autosave grava o estado a cada tecla digitada.
export const workflowVariableSchema = z.object({
  id: z.string().min(1),
  name: z
    .string()
    .max(60)
    .refine(
      (value) => value === '' || /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value),
      'Use letras, números e "_", começando por uma letra',
    ),
  type: workflowVariableTypeSchema,
  defaultValue: z.string().max(500),
})
export type WorkflowVariable = z.infer<typeof workflowVariableSchema>

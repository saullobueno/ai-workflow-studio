import { z } from 'zod'

export const executionStatusSchema = z.enum(['success', 'error', 'skipped'])
export type ExecutionStatus = z.infer<typeof executionStatusSchema>

export const executionStepSchema = z.object({
  nodeId: z.string().min(1),
  nodeLabel: z.string(),
  status: executionStatusSchema,
  startedAt: z.iso.datetime(),
  finishedAt: z.iso.datetime(),
  input: z.record(z.string(), z.unknown()),
  output: z.record(z.string(), z.unknown()),
  logs: z.array(z.string()),
})
export type ExecutionStep = z.infer<typeof executionStepSchema>

export const executionRecordSchema = z.object({
  id: z.string().min(1),
  workflowId: z.string().min(1),
  workflowName: z.string(),
  status: executionStatusSchema,
  startedAt: z.iso.datetime(),
  finishedAt: z.iso.datetime(),
  steps: z.array(executionStepSchema),
})
export type ExecutionRecord = z.infer<typeof executionRecordSchema>

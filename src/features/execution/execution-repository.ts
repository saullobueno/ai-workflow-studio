import { z } from 'zod'
import { readFromStorage, writeToStorage } from '@/core/storage'
import {
  executionRecordSchema,
  type ExecutionRecord,
} from '@/schemas/execution'

const MAX_RECORDS_PER_WORKFLOW = 20

const executionListSchema = z.array(executionRecordSchema)

function historyKey(workflowId: string): string {
  return `executions:${workflowId}`
}

export function listExecutions(workflowId: string): ExecutionRecord[] {
  return readFromStorage(historyKey(workflowId), executionListSchema) ?? []
}

export function saveExecution(record: ExecutionRecord): void {
  const existing = listExecutions(record.workflowId)
  const next = [record, ...existing].slice(0, MAX_RECORDS_PER_WORKFLOW)
  writeToStorage(historyKey(record.workflowId), next)
}

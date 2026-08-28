import { nanoid } from 'nanoid'
import { z } from 'zod'
import {
  readFromStorage,
  removeFromStorage,
  writeToStorage,
} from '@/core/storage'
import {
  toWorkflowSummary,
  workflowSchema,
  workflowSummarySchema,
  type Workflow,
  type WorkflowSummary,
} from '@/schemas/workflow'

const INDEX_KEY = 'workflows:index'
const workflowKey = (id: string) => `workflows:${id}`

const indexSchema = z.array(workflowSummarySchema)

function readIndex(): WorkflowSummary[] {
  return readFromStorage(INDEX_KEY, indexSchema) ?? []
}

function writeIndex(summaries: WorkflowSummary[]): void {
  writeToStorage(INDEX_KEY, summaries)
}

function upsertIndex(summary: WorkflowSummary): void {
  const index = readIndex()
  const nextIndex = [
    summary,
    ...index.filter((entry) => entry.id !== summary.id),
  ].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  writeIndex(nextIndex)
}

export function listWorkflows(): WorkflowSummary[] {
  return readIndex()
}

export function loadWorkflow(id: string): Workflow | undefined {
  return readFromStorage(workflowKey(id), workflowSchema)
}

export function saveWorkflow(workflow: Workflow): void {
  writeToStorage(workflowKey(workflow.id), workflow)
  upsertIndex(toWorkflowSummary(workflow))
}

export function deleteWorkflow(id: string): void {
  writeIndex(readIndex().filter((entry) => entry.id !== id))
  removeFromStorage(workflowKey(id))
}

export function createEmptyWorkflow(name: string): Workflow {
  const now = new Date().toISOString()
  return {
    id: nanoid(),
    name,
    description: '',
    variables: [],
    nodes: [],
    edges: [],
    createdAt: now,
    updatedAt: now,
  }
}

export function duplicateWorkflow(source: Workflow, name: string): Workflow {
  const now = new Date().toISOString()
  return {
    ...source,
    id: nanoid(),
    name,
    createdAt: now,
    updatedAt: now,
  }
}

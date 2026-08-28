import { beforeEach, describe, expect, it } from 'vitest'
import type { ExecutionRecord } from '@/schemas/execution'
import { listExecutions, saveExecution } from './execution-repository'

function buildRecord(
  overrides: Partial<ExecutionRecord> = {},
): ExecutionRecord {
  const now = new Date().toISOString()
  return {
    id: overrides.id ?? Math.random().toString(36),
    workflowId: 'wf-1',
    workflowName: 'Workflow de teste',
    status: 'success',
    startedAt: now,
    finishedAt: now,
    steps: [],
    ...overrides,
  }
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('execution-repository', () => {
  it('salva e lista execuções de um workflow, mais recente primeiro', () => {
    saveExecution(buildRecord({ id: 'a' }))
    saveExecution(buildRecord({ id: 'b' }))

    expect(listExecutions('wf-1').map((r) => r.id)).toEqual(['b', 'a'])
  })

  it('não mistura o histórico de workflows diferentes', () => {
    saveExecution(buildRecord({ id: 'a', workflowId: 'wf-1' }))
    saveExecution(buildRecord({ id: 'b', workflowId: 'wf-2' }))

    expect(listExecutions('wf-1').map((r) => r.id)).toEqual(['a'])
    expect(listExecutions('wf-2').map((r) => r.id)).toEqual(['b'])
  })

  it('limita o histórico às 20 execuções mais recentes', () => {
    for (let i = 0; i < 25; i++) {
      saveExecution(buildRecord({ id: `run-${String(i)}` }))
    }

    const history = listExecutions('wf-1')
    expect(history).toHaveLength(20)
    expect(history[0]?.id).toBe('run-24')
  })
})

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createEmptyWorkflow,
  loadWorkflow as loadWorkflowFromRepository,
} from '@/features/workflows/workflow-repository'
import type { WorkflowNode } from '@/schemas/node'
import { AUTOSAVE_DEBOUNCE_MS, useWorkflowEditorStore } from './store'

function buildNode(id: string): WorkflowNode {
  return {
    id,
    type: 'trigger',
    position: { x: 0, y: 0 },
    data: { kind: 'trigger', label: 'Gatilho', eventName: 'evt', fields: [] },
  }
}

beforeEach(() => {
  window.localStorage.clear()
  useWorkflowEditorStore.getState().closeWorkflow()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useWorkflowEditorStore', () => {
  it('carrega um workflow e reseta o histórico de undo', () => {
    const workflow = createEmptyWorkflow('Teste')
    useWorkflowEditorStore.getState().loadWorkflow(workflow)

    expect(useWorkflowEditorStore.getState().workflowId).toBe(workflow.id)
    expect(useWorkflowEditorStore.getState().autosaveStatus).toBe('saved')
    expect(useWorkflowEditorStore.temporal.getState().pastStates).toHaveLength(
      0,
    )
  })

  it('marca autosaveStatus como "unsaved" ao editar', () => {
    useWorkflowEditorStore.getState().loadWorkflow(createEmptyWorkflow('Teste'))
    useWorkflowEditorStore.getState().setName('Novo nome')

    expect(useWorkflowEditorStore.getState().autosaveStatus).toBe('unsaved')
    expect(useWorkflowEditorStore.getState().name).toBe('Novo nome')
  })

  it('remove um node e as edges que o referenciam', () => {
    useWorkflowEditorStore.getState().loadWorkflow(createEmptyWorkflow('Teste'))
    useWorkflowEditorStore.getState().addNode(buildNode('n1'))
    useWorkflowEditorStore.getState().addNode(buildNode('n2'))
    useWorkflowEditorStore
      .getState()
      .setEdges([{ id: 'e1', source: 'n1', target: 'n2' }])

    useWorkflowEditorStore.getState().removeNode('n1')

    const state = useWorkflowEditorStore.getState()
    expect(state.nodes.map((n) => n.id)).toEqual(['n2'])
    expect(state.edges).toEqual([])
  })

  it('agrupa mudanças rápidas (ex.: drag) em um único passo de undo', () => {
    vi.useFakeTimers()
    useWorkflowEditorStore.getState().loadWorkflow(createEmptyWorkflow('Teste'))
    useWorkflowEditorStore.getState().addNode(buildNode('n1'))

    // Simula várias atualizações de posição durante um único gesto de drag.
    for (let x = 0; x < 5; x++) {
      useWorkflowEditorStore
        .getState()
        .setNodes((nodes) =>
          nodes.map((n) =>
            n.id === 'n1' ? { ...n, position: { x, y: 0 } } : n,
          ),
        )
    }

    vi.advanceTimersByTime(500)

    expect(useWorkflowEditorStore.temporal.getState().pastStates.length).toBe(1)
  })

  it('salva automaticamente no repositório depois do debounce', () => {
    vi.useFakeTimers()
    const workflow = createEmptyWorkflow('Teste')
    useWorkflowEditorStore.getState().loadWorkflow(workflow)

    useWorkflowEditorStore.getState().setName('Nome atualizado')
    vi.advanceTimersByTime(AUTOSAVE_DEBOUNCE_MS + 100)

    expect(loadWorkflowFromRepository(workflow.id)?.name).toBe(
      'Nome atualizado',
    )
    expect(useWorkflowEditorStore.getState().autosaveStatus).toBe('saved')
  })
})

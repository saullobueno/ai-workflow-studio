import { beforeEach, describe, expect, it } from 'vitest'
import {
  createEmptyWorkflow,
  deleteWorkflow,
  duplicateWorkflow,
  listWorkflows,
  loadWorkflow,
  saveWorkflow,
} from './workflow-repository'

beforeEach(() => {
  window.localStorage.clear()
})

describe('workflow-repository', () => {
  it('salva e recarrega um workflow completo', () => {
    const workflow = createEmptyWorkflow('Meu workflow')
    saveWorkflow(workflow)

    expect(loadWorkflow(workflow.id)).toEqual(workflow)
  })

  it('mantém o índice de resumos em sincronia ao salvar', () => {
    const workflow = createEmptyWorkflow('Meu workflow')
    saveWorkflow(workflow)

    const summaries = listWorkflows()
    expect(summaries).toHaveLength(1)
    expect(summaries[0]).toMatchObject({
      id: workflow.id,
      name: 'Meu workflow',
      nodeCount: 0,
    })
  })

  it('remove o workflow e o resumo correspondente', () => {
    const workflow = createEmptyWorkflow('Meu workflow')
    saveWorkflow(workflow)

    deleteWorkflow(workflow.id)

    expect(loadWorkflow(workflow.id)).toBeUndefined()
    expect(listWorkflows()).toHaveLength(0)
  })

  it('duplica um workflow com um novo id e nome, preservando nodes/edges', () => {
    const original = createEmptyWorkflow('Original')
    const copy = duplicateWorkflow(original, 'Cópia')

    expect(copy.id).not.toBe(original.id)
    expect(copy.name).toBe('Cópia')
    expect(copy.nodes).toEqual(original.nodes)
  })

  it('ordena o índice do workflow mais recentemente atualizado para o mais antigo', () => {
    const older = createEmptyWorkflow('Mais antigo')
    saveWorkflow(older)

    const newer = {
      ...createEmptyWorkflow('Mais novo'),
      updatedAt: new Date(Date.now() + 1000).toISOString(),
    }
    saveWorkflow(newer)

    expect(listWorkflows().map((entry) => entry.name)).toEqual([
      'Mais novo',
      'Mais antigo',
    ])
  })
})

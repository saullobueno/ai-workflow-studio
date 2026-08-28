import { describe, expect, it } from 'vitest'
import { buildVipTicketTemplate } from '@/features/workflows/starter-templates'
import type { WorkflowEdge } from '@/schemas/edge'
import type { WorkflowNode } from '@/schemas/node'
import type { Workflow } from '@/schemas/workflow'
import { runWorkflow } from './engine'

function buildWorkflow(nodes: WorkflowNode[], edges: WorkflowEdge[]): Workflow {
  const now = new Date().toISOString()
  return {
    id: 'wf-test',
    name: 'Workflow de teste',
    description: '',
    variables: [],
    nodes,
    edges,
    createdAt: now,
    updatedAt: now,
  }
}

function triggerNode(
  id: string,
  fields: { name: string; sampleValue: string }[] = [],
): WorkflowNode {
  return {
    id,
    type: 'trigger',
    position: { x: 0, y: 0 },
    data: { kind: 'trigger', label: 'Gatilho', eventName: 'evt', fields },
  }
}

describe('runWorkflow', () => {
  it('retorna status "error" e uma mensagem clara quando não há gatilho', () => {
    const workflow = buildWorkflow([], [])
    const record = runWorkflow(workflow)

    expect(record.status).toBe('error')
    expect(record.steps[0]?.logs[0]).toMatch(/nenhum node de gatilho/i)
  })

  it('executa um trigger isolado com sucesso', () => {
    const workflow = buildWorkflow([triggerNode('t1')], [])
    const record = runWorkflow(workflow)

    expect(record.status).toBe('success')
    expect(record.steps).toHaveLength(1)
    expect(record.steps[0]?.nodeId).toBe('t1')
  })

  it('marca o passo como erro quando um campo obrigatório está vazio', () => {
    const workflow = buildWorkflow(
      [
        triggerNode('t1'),
        {
          id: 'a1',
          type: 'action',
          position: { x: 0, y: 100 },
          data: {
            kind: 'action',
            actionKind: 'slack',
            label: 'Slack',
            channel: '',
            message: 'oi',
          },
        },
      ],
      [{ id: 'e1', source: 't1', target: 'a1' }],
    )
    const record = runWorkflow(workflow)

    expect(record.status).toBe('error')
    const actionStep = record.steps.find((step) => step.nodeId === 'a1')
    expect(actionStep?.status).toBe('error')
    expect(actionStep?.logs[0]).toMatch(/channel/)
  })

  it('resolve templates com variáveis do trigger em uma ação', () => {
    const workflow = buildWorkflow(
      [
        triggerNode('t1', [
          { name: 'subject', sampleValue: 'Pedido atrasado' },
        ]),
        {
          id: 'a1',
          type: 'action',
          position: { x: 0, y: 100 },
          data: {
            kind: 'action',
            actionKind: 'slack',
            label: 'Slack',
            channel: '#geral',
            message: 'Assunto: {{subject}}',
          },
        },
      ],
      [{ id: 'e1', source: 't1', target: 'a1' }],
    )
    const record = runWorkflow(workflow)

    const actionStep = record.steps.find((step) => step.nodeId === 'a1')
    expect(actionStep?.status).toBe('success')
    expect(actionStep?.logs[0]).toContain('Assunto: Pedido atrasado')
  })

  it('segue só o branch verdadeiro de uma condition e pula o outro', () => {
    const workflow = buildWorkflow(
      [
        triggerNode('t1', [{ name: 'tier', sampleValue: 'vip' }]),
        {
          id: 'c1',
          type: 'condition',
          position: { x: 0, y: 100 },
          data: {
            kind: 'condition',
            label: 'É VIP?',
            fieldTemplate: '{{tier}}',
            operator: 'equals',
            value: 'vip',
          },
        },
        {
          id: 'a-true',
          type: 'action',
          position: { x: -100, y: 200 },
          data: {
            kind: 'action',
            actionKind: 'slack',
            label: 'Slack',
            channel: '#vip',
            message: 'vip!',
          },
        },
        {
          id: 'a-false',
          type: 'action',
          position: { x: 100, y: 200 },
          data: {
            kind: 'action',
            actionKind: 'slack',
            label: 'Slack',
            channel: '#geral',
            message: 'normal',
          },
        },
      ],
      [
        { id: 'e1', source: 't1', target: 'c1' },
        { id: 'e2', source: 'c1', target: 'a-true', sourceHandle: 'true' },
        { id: 'e3', source: 'c1', target: 'a-false', sourceHandle: 'false' },
      ],
    )
    const record = runWorkflow(workflow)

    const executedIds = record.steps.map((step) => step.nodeId)
    expect(executedIds).toContain('a-true')
    expect(executedIds).not.toContain('a-false')
  })

  it('executa o node do corpo do loop uma vez por item da lista', () => {
    const workflow = buildWorkflow(
      [
        triggerNode('t1', [{ name: 'items', sampleValue: 'a, b, c' }]),
        {
          id: 'l1',
          type: 'loop',
          position: { x: 0, y: 100 },
          data: {
            kind: 'loop',
            label: 'Loop',
            listTemplate: '{{items}}',
            itemVariable: 'item',
            maxIterations: 10,
          },
        },
        {
          id: 'a1',
          type: 'action',
          position: { x: 0, y: 200 },
          data: {
            kind: 'action',
            actionKind: 'slack',
            label: 'Slack',
            channel: '#geral',
            message: 'item: {{item}}',
          },
        },
      ],
      [
        { id: 'e1', source: 't1', target: 'l1' },
        { id: 'e2', source: 'l1', target: 'a1' },
      ],
    )
    const record = runWorkflow(workflow)

    const iterationSteps = record.steps.filter((step) =>
      step.nodeId.startsWith('a1#'),
    )
    expect(iterationSteps).toHaveLength(3)
    expect(iterationSteps.map((step) => step.logs[0])).toEqual([
      expect.stringContaining('item: a'),
      expect.stringContaining('item: b'),
      expect.stringContaining('item: c'),
    ])
  })

  it('classifica de forma determinística: a mesma entrada sempre dá a mesma categoria', () => {
    const workflow = buildWorkflow(
      [
        triggerNode('t1', [{ name: 'text', sampleValue: 'texto qualquer' }]),
        {
          id: 'ai1',
          type: 'ai-classify',
          position: { x: 0, y: 100 },
          data: {
            kind: 'ai-classify',
            label: 'Classificar',
            instructions: 'classifique',
            inputTemplate: '{{text}}',
            categories: ['urgent', 'normal'],
            outputVariable: 'result',
          },
        },
      ],
      [{ id: 'e1', source: 't1', target: 'ai1' }],
    )

    const first = runWorkflow(workflow)
    const second = runWorkflow(workflow)

    expect(first.steps.find((s) => s.nodeId === 'ai1')?.output.result).toBe(
      second.steps.find((s) => s.nodeId === 'ai1')?.output.result,
    )
  })

  it('roda o template do briefing (ticket VIP) de ponta a ponta com sucesso', () => {
    const workflow = buildVipTicketTemplate()
    const record = runWorkflow(workflow)

    expect(record.status).toBe('success')
    // trigger + classify + condition + exatamente uma das ações (slack ou email)
    expect(record.steps.length).toBe(4)
  })
})

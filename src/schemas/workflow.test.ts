import { describe, expect, it } from 'vitest'
import { workflowSchema } from './workflow'

function buildVipTicketWorkflow() {
  return {
    id: 'wf-1',
    name: 'Ticket VIP com sentimento negativo',
    description:
      'Quando chegar um ticket de cliente VIP com sentimento negativo, envia para Slack e cria uma tarefa.',
    variables: [
      {
        id: 'var-1',
        name: 'slackChannel',
        type: 'string' as const,
        defaultValue: '#suporte-vip',
      },
    ],
    nodes: [
      {
        id: 'n1',
        type: 'trigger' as const,
        position: { x: 0, y: 0 },
        data: {
          kind: 'trigger' as const,
          label: 'Novo ticket',
          eventName: 'ticket.created',
          fields: [
            { name: 'customerTier', sampleValue: 'vip' },
            { name: 'sentiment', sampleValue: 'negative' },
            { name: 'subject', sampleValue: 'Meu pedido não chegou' },
          ],
        },
      },
      {
        id: 'n2',
        type: 'condition' as const,
        position: { x: 0, y: 150 },
        data: {
          kind: 'condition' as const,
          label: 'Cliente VIP?',
          fieldTemplate: '{{customerTier}}',
          operator: 'equals' as const,
          value: 'vip',
        },
      },
      {
        id: 'n3',
        type: 'action' as const,
        position: { x: 0, y: 300 },
        data: {
          kind: 'action' as const,
          actionKind: 'slack' as const,
          label: 'Enviar para Slack',
          channel: '{{slackChannel}}',
          message: 'Ticket VIP com sentimento negativo: {{subject}}',
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2' },
      { id: 'e2', source: 'n2', target: 'n3', sourceHandle: 'true' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

describe('workflowSchema', () => {
  it('aceita o workflow de exemplo do briefing (ticket VIP -> condição -> Slack)', () => {
    const result = workflowSchema.safeParse(buildVipTicketWorkflow())
    expect(result.success).toBe(true)
  })

  it('rejeita um node com kind desconhecido', () => {
    const workflow = buildVipTicketWorkflow()
    workflow.nodes[0] = {
      ...workflow.nodes[0],
      // @ts-expect-error -- testando um kind inválido de propósito
      type: 'not-a-real-kind',
    }
    const result = workflowSchema.safeParse(workflow)
    expect(result.success).toBe(false)
  })

  it('rejeita uma edge cujo campo obrigatório está ausente', () => {
    const workflow = buildVipTicketWorkflow()
    // @ts-expect-error -- omitindo `target` de propósito
    workflow.edges[0] = { id: 'e1', source: 'n1' }
    const result = workflowSchema.safeParse(workflow)
    expect(result.success).toBe(false)
  })

  it('rejeita uma variável com nome inválido como identificador', () => {
    const workflow = buildVipTicketWorkflow()
    const [firstVariable] = workflow.variables
    if (!firstVariable) throw new Error('fixture sem variáveis')
    firstVariable.name = '1 nome inválido'
    const result = workflowSchema.safeParse(workflow)
    expect(result.success).toBe(false)
  })

  it('preenche defaults de arrays quando omitidos', () => {
    const {
      variables: _variables,
      edges: _edges,
      ...rest
    } = buildVipTicketWorkflow()
    const result = workflowSchema.parse({ ...rest, nodes: [] })
    expect(result.variables).toEqual([])
    expect(result.edges).toEqual([])
  })
})

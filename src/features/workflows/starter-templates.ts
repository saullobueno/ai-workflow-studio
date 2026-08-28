import { nanoid } from 'nanoid'
import type { Workflow } from '@/schemas/workflow'

/**
 * O workflow de exemplo do próprio briefing do produto, usado como template
 * de partida. Não é dado inventado: reproduz literalmente o diagrama e o
 * prompt de exemplo do AI Copilot descritos no pedido original.
 */
export function buildVipTicketTemplate(): Workflow {
  const now = new Date().toISOString()
  const triggerId = nanoid()
  const classifyId = nanoid()
  const conditionId = nanoid()
  const slackId = nanoid()
  const emailId = nanoid()

  return {
    id: nanoid(),
    name: 'Ticket VIP com sentimento negativo',
    description:
      'Quando chegar um ticket de cliente VIP com sentimento negativo, classifica a urgência com IA e envia para o Slack (urgente) ou por e-mail (normal).',
    variables: [
      {
        id: nanoid(),
        name: 'slackChannel',
        type: 'string',
        defaultValue: '#suporte-vip',
      },
    ],
    nodes: [
      {
        id: triggerId,
        type: 'trigger',
        position: { x: 0, y: 0 },
        data: {
          kind: 'trigger',
          label: 'Novo ticket de suporte',
          eventName: 'ticket.created',
          fields: [
            { name: 'customerTier', sampleValue: 'vip' },
            { name: 'sentiment', sampleValue: 'negative' },
            { name: 'subject', sampleValue: 'Meu pedido não chegou' },
            {
              name: 'message',
              sampleValue: 'Já é a terceira vez que escrevo sobre isso.',
            },
          ],
        },
      },
      {
        id: classifyId,
        type: 'ai-classify',
        position: { x: 0, y: 160 },
        data: {
          kind: 'ai-classify',
          label: 'Classificar urgência com IA',
          instructions:
            'Classifique a urgência combinando o nível do cliente (customerTier) e o sentimento (sentiment).',
          inputTemplate: '{{subject}} — {{message}}',
          categories: ['urgent', 'normal'],
          outputVariable: 'urgency',
        },
      },
      {
        id: conditionId,
        type: 'condition',
        position: { x: 0, y: 320 },
        data: {
          kind: 'condition',
          label: 'É urgente?',
          fieldTemplate: '{{urgency}}',
          operator: 'equals',
          value: 'urgent',
        },
      },
      {
        id: slackId,
        type: 'action',
        position: { x: -180, y: 480 },
        data: {
          kind: 'action',
          actionKind: 'slack',
          label: 'Avisar no Slack',
          channel: '{{slackChannel}}',
          message: 'Ticket urgente de cliente VIP: {{subject}}',
        },
      },
      {
        id: emailId,
        type: 'action',
        position: { x: 180, y: 480 },
        data: {
          kind: 'action',
          actionKind: 'email',
          label: 'Enviar por e-mail',
          to: 'suporte@empresa.com',
          subject: 'Novo ticket: {{subject}}',
          body: 'Ticket recebido: {{message}}',
        },
      },
    ],
    edges: [
      { id: nanoid(), source: triggerId, target: classifyId },
      { id: nanoid(), source: classifyId, target: conditionId },
      {
        id: nanoid(),
        source: conditionId,
        target: slackId,
        sourceHandle: 'true',
        label: 'urgente',
      },
      {
        id: nanoid(),
        source: conditionId,
        target: emailId,
        sourceHandle: 'false',
        label: 'normal',
      },
    ],
    createdAt: now,
    updatedAt: now,
  }
}

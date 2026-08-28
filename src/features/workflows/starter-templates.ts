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

/**
 * Condição simples (sem classificação por IA) com duas ações diferentes nos
 * dois branches — mostra que "condition" não depende de "ai-classify".
 */
export function buildExpenseApprovalTemplate(): Workflow {
  const now = new Date().toISOString()
  const triggerId = nanoid()
  const conditionId = nanoid()
  const taskId = nanoid()
  const slackId = nanoid()

  return {
    id: nanoid(),
    name: 'Aprovação de despesa corporativa',
    description:
      'Quando chega um pedido de reembolso pendente de aprovação, cria uma tarefa para o gestor financeiro; se já estiver aprovado, só avisa no Slack.',
    variables: [
      {
        id: nanoid(),
        name: 'financeChannel',
        type: 'string',
        defaultValue: '#financeiro',
      },
    ],
    nodes: [
      {
        id: triggerId,
        type: 'trigger',
        position: { x: 0, y: 0 },
        data: {
          kind: 'trigger',
          label: 'Novo pedido de reembolso',
          eventName: 'expense.submitted',
          fields: [
            { name: 'requester', sampleValue: 'Ana Souza' },
            {
              name: 'description',
              sampleValue: 'Passagem aérea para conferência',
            },
            { name: 'approvalStatus', sampleValue: 'pending' },
          ],
        },
      },
      {
        id: conditionId,
        type: 'condition',
        position: { x: 0, y: 160 },
        data: {
          kind: 'condition',
          label: 'Precisa de aprovação?',
          fieldTemplate: '{{approvalStatus}}',
          operator: 'equals',
          value: 'pending',
        },
      },
      {
        id: taskId,
        type: 'action',
        position: { x: -180, y: 320 },
        data: {
          kind: 'action',
          actionKind: 'create-task',
          label: 'Criar tarefa de aprovação',
          title: 'Aprovar despesa de {{requester}}',
          assignee: 'gestor-financeiro',
          priority: 'medium',
        },
      },
      {
        id: slackId,
        type: 'action',
        position: { x: 180, y: 320 },
        data: {
          kind: 'action',
          actionKind: 'slack',
          label: 'Avisar aprovação automática',
          channel: '{{financeChannel}}',
          message:
            'Despesa de {{requester}} aprovada automaticamente: {{description}}',
        },
      },
    ],
    edges: [
      { id: nanoid(), source: triggerId, target: conditionId },
      {
        id: nanoid(),
        source: conditionId,
        target: taskId,
        sourceHandle: 'true',
        label: 'pendente',
      },
      {
        id: nanoid(),
        source: conditionId,
        target: slackId,
        sourceHandle: 'false',
        label: 'aprovado',
      },
    ],
    createdAt: now,
    updatedAt: now,
  }
}

/**
 * Loop: notifica uma lista de canais do Slack, um por um — único template
 * que exercita o node "loop".
 */
export function buildLaunchAnnouncementTemplate(): Workflow {
  const now = new Date().toISOString()
  const triggerId = nanoid()
  const loopId = nanoid()
  const slackId = nanoid()

  return {
    id: nanoid(),
    name: 'Lançamento de produto (multi-canal)',
    description:
      'Quando um novo recurso é lançado, notifica uma lista de canais do Slack, um de cada vez.',
    variables: [],
    nodes: [
      {
        id: triggerId,
        type: 'trigger',
        position: { x: 0, y: 0 },
        data: {
          kind: 'trigger',
          label: 'Novo recurso lançado',
          eventName: 'feature.launched',
          fields: [
            { name: 'featureName', sampleValue: 'Modo escuro' },
            {
              name: 'channels',
              sampleValue: '#geral, #produto, #suporte',
            },
          ],
        },
      },
      {
        id: loopId,
        type: 'loop',
        position: { x: 0, y: 160 },
        data: {
          kind: 'loop',
          label: 'Para cada canal',
          listTemplate: '{{channels}}',
          itemVariable: 'channel',
          maxIterations: 10,
        },
      },
      {
        id: slackId,
        type: 'action',
        position: { x: 0, y: 320 },
        data: {
          kind: 'action',
          actionKind: 'slack',
          label: 'Avisar no canal',
          channel: '{{channel}}',
          message: 'Novo recurso disponível: {{featureName}} 🎉',
        },
      },
    ],
    edges: [
      { id: nanoid(), source: triggerId, target: loopId },
      { id: nanoid(), source: loopId, target: slackId },
    ],
    createdAt: now,
    updatedAt: now,
  }
}

/**
 * Classificação por IA com um único branch conectado (o "false" fica sem
 * saída) — mostra que nem todo branch precisa de uma ação.
 */
export function buildNegativeReviewTemplate(): Workflow {
  const now = new Date().toISOString()
  const triggerId = nanoid()
  const classifyId = nanoid()
  const conditionId = nanoid()
  const taskId = nanoid()

  return {
    id: nanoid(),
    name: 'Review negativo vira tarefa',
    description:
      'Quando chega uma nova avaliação, classifica o sentimento com IA; se for negativa, cria uma tarefa para o time de atendimento responder.',
    variables: [],
    nodes: [
      {
        id: triggerId,
        type: 'trigger',
        position: { x: 0, y: 0 },
        data: {
          kind: 'trigger',
          label: 'Nova avaliação recebida',
          eventName: 'review.created',
          fields: [
            { name: 'customerName', sampleValue: 'Carlos Lima' },
            { name: 'rating', sampleValue: '2' },
            {
              name: 'comment',
              sampleValue:
                'Produto chegou danificado e o suporte demorou pra responder.',
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
          label: 'Classificar sentimento com IA',
          instructions: 'Classifique o sentimento do comentário do cliente.',
          inputTemplate: '{{comment}}',
          categories: ['positive', 'negative'],
          outputVariable: 'sentiment',
        },
      },
      {
        id: conditionId,
        type: 'condition',
        position: { x: 0, y: 320 },
        data: {
          kind: 'condition',
          label: 'É negativa?',
          fieldTemplate: '{{sentiment}}',
          operator: 'equals',
          value: 'negative',
        },
      },
      {
        id: taskId,
        type: 'action',
        position: { x: -180, y: 480 },
        data: {
          kind: 'action',
          actionKind: 'create-task',
          label: 'Criar tarefa de resposta',
          title: 'Responder review negativo de {{customerName}}',
          assignee: 'atendimento',
          priority: 'high',
        },
      },
    ],
    edges: [
      { id: nanoid(), source: triggerId, target: classifyId },
      { id: nanoid(), source: classifyId, target: conditionId },
      {
        id: nanoid(),
        source: conditionId,
        target: taskId,
        sourceHandle: 'true',
        label: 'negativa',
      },
      // O branch "false" (positiva) fica sem node — nem todo caminho de uma
      // condition precisa levar a uma ação.
    ],
    createdAt: now,
    updatedAt: now,
  }
}

/**
 * O template mais simples (trigger → condition → 1 ação) e o único que usa
 * o operador "contains".
 */
export function buildOverduePaymentTemplate(): Workflow {
  const now = new Date().toISOString()
  const triggerId = nanoid()
  const conditionId = nanoid()
  const emailId = nanoid()

  return {
    id: nanoid(),
    name: 'Lembrete de pagamento em atraso',
    description:
      'Quando uma fatura fica em atraso, envia um lembrete por e-mail ao cliente.',
    variables: [],
    nodes: [
      {
        id: triggerId,
        type: 'trigger',
        position: { x: 0, y: 0 },
        data: {
          kind: 'trigger',
          label: 'Status da fatura atualizado',
          eventName: 'invoice.updated',
          fields: [
            { name: 'customerName', sampleValue: 'Marina Alves' },
            { name: 'invoiceStatus', sampleValue: 'atrasado' },
            { name: 'amount', sampleValue: 'R$ 450,00' },
            { name: 'email', sampleValue: 'marina@example.com' },
          ],
        },
      },
      {
        id: conditionId,
        type: 'condition',
        position: { x: 0, y: 160 },
        data: {
          kind: 'condition',
          label: 'Está atrasada?',
          fieldTemplate: '{{invoiceStatus}}',
          operator: 'contains',
          value: 'atrasado',
        },
      },
      {
        id: emailId,
        type: 'action',
        position: { x: 0, y: 320 },
        data: {
          kind: 'action',
          actionKind: 'email',
          label: 'Enviar lembrete por e-mail',
          to: '{{email}}',
          subject: 'Fatura em atraso — {{customerName}}',
          body: 'Identificamos que sua fatura de {{amount}} está em atraso. Por favor, regularize o pagamento.',
        },
      },
    ],
    edges: [
      { id: nanoid(), source: triggerId, target: conditionId },
      {
        id: nanoid(),
        source: conditionId,
        target: emailId,
        sourceHandle: 'true',
        label: 'atrasada',
      },
      // O branch "false" (em dia) fica sem node.
    ],
    createdAt: now,
    updatedAt: now,
  }
}

export interface StarterTemplate {
  id: string
  label: string
  description: string
  build: () => Workflow
}

/** Registro usado pelo seletor de exemplos na lista de workflows. */
export const STARTER_TEMPLATES: readonly StarterTemplate[] = [
  {
    id: 'vip-ticket',
    label: 'Ticket VIP com sentimento negativo',
    description: 'Classificação por IA + branch para Slack ou e-mail.',
    build: buildVipTicketTemplate,
  },
  {
    id: 'expense-approval',
    label: 'Aprovação de despesa corporativa',
    description: 'Condição simples com duas ações diferentes.',
    build: buildExpenseApprovalTemplate,
  },
  {
    id: 'launch-announcement',
    label: 'Lançamento de produto (multi-canal)',
    description: 'Loop notificando vários canais do Slack.',
    build: buildLaunchAnnouncementTemplate,
  },
  {
    id: 'negative-review',
    label: 'Review negativo vira tarefa',
    description: 'Classificação por IA com um único branch conectado.',
    build: buildNegativeReviewTemplate,
  },
  {
    id: 'overdue-payment',
    label: 'Lembrete de pagamento em atraso',
    description: 'O exemplo mais simples: trigger → condição → e-mail.',
    build: buildOverduePaymentTemplate,
  },
]

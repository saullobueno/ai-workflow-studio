import {
  GitBranch,
  ListChecks,
  Mail,
  MessageSquare,
  Repeat,
  Sparkles,
  Webhook,
  type LucideIcon,
} from 'lucide-react'
import { nanoid } from 'nanoid'
import type {
  ActionNodeData,
  NodeData,
  NodeKind,
  WorkflowNode,
} from '@/schemas/node'

export type ActionKind = ActionNodeData['actionKind']

export interface NodeKindMeta {
  kind: NodeKind
  label: string
  description: string
  icon: LucideIcon
}

export const NODE_KIND_ORDER: NodeKind[] = [
  'trigger',
  'ai-classify',
  'condition',
  'loop',
  'action',
]

export const NODE_KIND_META: Record<NodeKind, NodeKindMeta> = {
  trigger: {
    kind: 'trigger',
    label: 'Gatilho',
    description: 'Inicia o workflow quando um evento acontece',
    icon: Webhook,
  },
  'ai-classify': {
    kind: 'ai-classify',
    label: 'Classificar com IA',
    description: 'Categoriza o dado de entrada usando IA',
    icon: Sparkles,
  },
  condition: {
    kind: 'condition',
    label: 'Condição',
    description: 'Cria dois caminhos (verdadeiro/falso) a partir de um teste',
    icon: GitBranch,
  },
  loop: {
    kind: 'loop',
    label: 'Loop',
    description: 'Repete o próximo passo para cada item de uma lista',
    icon: Repeat,
  },
  action: {
    kind: 'action',
    label: 'Ação',
    description: 'Executa uma ação: Slack, e-mail ou criar tarefa',
    icon: MessageSquare,
  },
}

export const ACTION_KIND_ORDER: ActionKind[] = ['slack', 'email', 'create-task']

export const ACTION_KIND_META: Record<
  ActionKind,
  { label: string; icon: LucideIcon }
> = {
  slack: { label: 'Slack', icon: MessageSquare },
  email: { label: 'E-mail', icon: Mail },
  'create-task': { label: 'Criar tarefa', icon: ListChecks },
}

export function createDefaultActionData(
  actionKind: ActionKind,
): ActionNodeData {
  switch (actionKind) {
    case 'slack':
      return {
        kind: 'action',
        actionKind: 'slack',
        label: 'Enviar Slack',
        channel: '',
        message: '',
      }
    case 'email':
      return {
        kind: 'action',
        actionKind: 'email',
        label: 'Enviar e-mail',
        to: '',
        subject: '',
        body: '',
      }
    case 'create-task':
      return {
        kind: 'action',
        actionKind: 'create-task',
        label: 'Criar tarefa',
        title: '',
        assignee: '',
        priority: 'medium',
      }
  }
}

export function createDefaultNodeData(kind: NodeKind): NodeData {
  switch (kind) {
    case 'trigger':
      return {
        kind: 'trigger',
        label: 'Novo gatilho',
        eventName: 'event.created',
        fields: [],
      }
    case 'ai-classify':
      return {
        kind: 'ai-classify',
        label: 'Classificar com IA',
        instructions: '',
        inputTemplate: '',
        categories: ['categoria-a', 'categoria-b'],
        outputVariable: 'classification',
      }
    case 'condition':
      return {
        kind: 'condition',
        label: 'Condição',
        fieldTemplate: '',
        operator: 'equals',
        value: '',
      }
    case 'loop':
      return {
        kind: 'loop',
        label: 'Loop',
        listTemplate: '',
        itemVariable: 'item',
        maxIterations: 10,
      }
    case 'action':
      return createDefaultActionData('slack')
  }
}

export function createNode(
  kind: NodeKind,
  position: { x: number; y: number },
): WorkflowNode {
  return {
    id: nanoid(),
    type: kind,
    position,
    data: createDefaultNodeData(kind),
  }
}

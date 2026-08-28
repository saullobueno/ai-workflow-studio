import { nanoid } from 'nanoid'
import type { ConditionOperator, NodeData, WorkflowNode } from '@/schemas/node'
import type { ExecutionRecord, ExecutionStep } from '@/schemas/execution'
import type { Workflow } from '@/schemas/workflow'
import { resolveTemplate, type ExecutionContext } from './template'

const MAX_STEPS = 200
const MAX_LOOP_ITERATIONS_HARD_CAP = 50

function buildInitialContext(workflow: Workflow): ExecutionContext {
  const context: ExecutionContext = {}
  for (const variable of workflow.variables) {
    if (variable.name === '') continue
    context[variable.name] =
      variable.type === 'number'
        ? Number(variable.defaultValue)
        : variable.type === 'boolean'
          ? variable.defaultValue === 'true'
          : variable.defaultValue
  }
  return context
}

/** Nome do primeiro campo obrigatório vazio, ou null se o node está pronto. */
function findEmptyRequiredField(data: NodeData): string | null {
  switch (data.kind) {
    case 'trigger':
      return data.eventName.trim() === '' ? 'eventName' : null
    case 'ai-classify':
      if (data.instructions.trim() === '') return 'instructions'
      if (data.inputTemplate.trim() === '') return 'inputTemplate'
      if (data.outputVariable.trim() === '') return 'outputVariable'
      return null
    case 'condition':
      if (data.fieldTemplate.trim() === '') return 'fieldTemplate'
      if (data.value.trim() === '') return 'value'
      return null
    case 'loop':
      if (data.listTemplate.trim() === '') return 'listTemplate'
      if (data.itemVariable.trim() === '') return 'itemVariable'
      return null
    case 'action':
      switch (data.actionKind) {
        case 'slack':
          if (data.channel.trim() === '') return 'channel'
          if (data.message.trim() === '') return 'message'
          return null
        case 'email':
          if (data.to.trim() === '') return 'to'
          if (data.subject.trim() === '') return 'subject'
          if (data.body.trim() === '') return 'body'
          return null
        case 'create-task':
          if (data.title.trim() === '') return 'title'
          if (data.assignee.trim() === '') return 'assignee'
          return null
      }
  }
}

function evaluateCondition(
  fieldValue: string,
  operator: ConditionOperator,
  compareValue: string,
): boolean {
  switch (operator) {
    case 'equals':
      return fieldValue === compareValue
    case 'not-equals':
      return fieldValue !== compareValue
    case 'contains':
      return fieldValue.includes(compareValue)
  }
}

/**
 * "Classificador" determinístico e transparente — não é uma chamada real de
 * IA (essa fica só no AI Copilot, que transforma texto em workflow; ver
 * ADR sobre execução simulada). Primeiro tenta achar o nome da categoria no
 * texto resolvido; se nenhuma bater, cai num hash estável do texto, para que
 * a mesma entrada sempre produza a mesma categoria.
 */
function simulateClassification(
  resolvedInput: string,
  categories: string[],
): string {
  const haystack = resolvedInput.toLowerCase()
  const directMatch = categories.find((category) =>
    haystack.includes(category.toLowerCase()),
  )
  if (directMatch) return directMatch

  let hash = 7
  for (const char of haystack) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  }
  return categories[hash % categories.length] ?? categories[0] ?? ''
}

function parseListTemplate(resolved: string): string[] {
  return resolved
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

interface EngineState {
  workflow: Workflow
  nodesById: Map<string, WorkflowNode>
  steps: ExecutionStep[]
  stepCount: number
}

function now(): string {
  return new Date().toISOString()
}

function runStep(
  state: EngineState,
  node: WorkflowNode,
  context: ExecutionContext,
  stepIdSuffix = '',
): { status: ExecutionStep['status']; context: ExecutionContext } {
  const startedAt = now()
  const input = { ...context }
  const logs: string[] = []
  let output: ExecutionContext = {}
  let status: ExecutionStep['status'] = 'success'

  const missingField = findEmptyRequiredField(node.data)
  if (missingField) {
    status = 'error'
    logs.push(`Campo obrigatório vazio: "${missingField}".`)
  } else {
    switch (node.data.kind) {
      case 'trigger': {
        logs.push(`Evento recebido: ${node.data.eventName}`)
        for (const field of node.data.fields) {
          if (field.name === '') continue
          context = { ...context, [field.name]: field.sampleValue }
        }
        output = { ...context }
        break
      }
      case 'ai-classify': {
        const resolvedInput = resolveTemplate(node.data.inputTemplate, context)
        const result = simulateClassification(
          resolvedInput,
          node.data.categories,
        )
        logs.push(
          `Classificação simulada (sem chamada real de IA) de "${resolvedInput}": ${result}`,
        )
        context = { ...context, [node.data.outputVariable]: result }
        output = { [node.data.outputVariable]: result }
        break
      }
      case 'condition': {
        const fieldValue = resolveTemplate(node.data.fieldTemplate, context)
        const result = evaluateCondition(
          fieldValue,
          node.data.operator,
          node.data.value,
        )
        logs.push(
          `"${fieldValue}" ${node.data.operator} "${node.data.value}" → ${result ? 'verdadeiro' : 'falso'}`,
        )
        output = { result }
        break
      }
      case 'loop': {
        const resolvedList = resolveTemplate(node.data.listTemplate, context)
        const items = parseListTemplate(resolvedList)
        const limit = Math.min(
          node.data.maxIterations,
          MAX_LOOP_ITERATIONS_HARD_CAP,
          items.length,
        )
        logs.push(
          `Lista resolvida: [${items.join(', ')}] — ${String(limit)} iteração(ões)`,
        )
        output = { items: items.slice(0, limit) }
        break
      }
      case 'action': {
        switch (node.data.actionKind) {
          case 'slack': {
            const channel = resolveTemplate(node.data.channel, context)
            const message = resolveTemplate(node.data.message, context)
            logs.push(
              `[simulado] Enviaria no Slack, canal ${channel}: "${message}"`,
            )
            output = { channel, message }
            break
          }
          case 'email': {
            const to = resolveTemplate(node.data.to, context)
            const subject = resolveTemplate(node.data.subject, context)
            logs.push(
              `[simulado] Enviaria e-mail para ${to} com assunto "${subject}"`,
            )
            output = { to, subject }
            break
          }
          case 'create-task': {
            const title = resolveTemplate(node.data.title, context)
            const assignee = resolveTemplate(node.data.assignee, context)
            logs.push(
              `[simulado] Criaria a tarefa "${title}" para ${assignee} (prioridade ${node.data.priority})`,
            )
            output = { title, assignee }
            break
          }
        }
        break
      }
    }
  }

  state.steps.push({
    nodeId: `${node.id}${stepIdSuffix}`,
    nodeLabel: node.data.label || node.type,
    status,
    startedAt,
    finishedAt: now(),
    input,
    output,
    logs,
  })

  return { status, context }
}

function outgoingEdges(workflow: Workflow, nodeId: string, handle?: string) {
  return workflow.edges.filter(
    (edge) =>
      edge.source === nodeId &&
      (handle === undefined || (edge.sourceHandle ?? null) === handle),
  )
}

function traverse(
  state: EngineState,
  nodeId: string,
  context: ExecutionContext,
): void {
  if (state.stepCount >= MAX_STEPS) {
    state.steps.push({
      nodeId: `${nodeId}-limite`,
      nodeLabel: 'Limite de execução',
      status: 'error',
      startedAt: now(),
      finishedAt: now(),
      input: {},
      output: {},
      logs: [
        `Limite de ${String(MAX_STEPS)} passos excedido (possível ciclo no workflow).`,
      ],
    })
    return
  }

  const node = state.nodesById.get(nodeId)
  if (!node) return
  state.stepCount += 1

  const { status, context: nextContext } = runStep(state, node, context)
  if (status === 'error') return

  if (node.data.kind === 'condition') {
    const conditionOutput = state.steps.at(-1)?.output.result === true
    const handle = conditionOutput ? 'true' : 'false'
    for (const edge of outgoingEdges(state.workflow, node.id, handle)) {
      traverse(state, edge.target, nextContext)
    }
    return
  }

  if (node.data.kind === 'loop') {
    const items =
      (state.steps.at(-1)?.output.items as string[] | undefined) ?? []
    const downstreamEdges = outgoingEdges(state.workflow, node.id)
    for (const edge of downstreamEdges) {
      const bodyNode = state.nodesById.get(edge.target)
      if (!bodyNode) continue

      let loopContext = nextContext
      items.forEach((item, index) => {
        if (state.stepCount >= MAX_STEPS) return
        state.stepCount += 1
        const iterationContext = {
          ...loopContext,
          [node.data.kind === 'loop' ? node.data.itemVariable : 'item']: item,
        }
        const result = runStep(
          state,
          bodyNode,
          iterationContext,
          `#${String(index + 1)}`,
        )
        loopContext = result.context
      })

      // Depois do loop, o resto do grafo continua a partir do node do corpo
      // do loop, uma única vez (não repetido por iteração) — simplificação
      // documentada em docs/decisions.
      for (const nextEdge of outgoingEdges(state.workflow, bodyNode.id)) {
        traverse(state, nextEdge.target, loopContext)
      }
    }
    return
  }

  for (const edge of outgoingEdges(state.workflow, node.id)) {
    traverse(state, edge.target, nextContext)
  }
}

export function runWorkflow(workflow: Workflow): ExecutionRecord {
  const startedAt = now()
  const triggerNode = workflow.nodes.find((node) => node.type === 'trigger')

  const state: EngineState = {
    workflow,
    nodesById: new Map(workflow.nodes.map((node) => [node.id, node])),
    steps: [],
    stepCount: 0,
  }

  if (!triggerNode) {
    return {
      id: nanoid(),
      workflowId: workflow.id,
      workflowName: workflow.name,
      status: 'error',
      startedAt,
      finishedAt: now(),
      steps: [
        {
          nodeId: 'sem-gatilho',
          nodeLabel: 'Nenhum gatilho',
          status: 'error',
          startedAt,
          finishedAt: now(),
          input: {},
          output: {},
          logs: [
            'O workflow não tem nenhum node de gatilho para iniciar a execução.',
          ],
        },
      ],
    }
  }

  traverse(state, triggerNode.id, buildInitialContext(workflow))

  const status = state.steps.some((step) => step.status === 'error')
    ? 'error'
    : 'success'

  return {
    id: nanoid(),
    workflowId: workflow.id,
    workflowName: workflow.name,
    status,
    startedAt,
    finishedAt: now(),
    steps: state.steps,
  }
}

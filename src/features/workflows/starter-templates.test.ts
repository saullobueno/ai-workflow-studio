import { describe, expect, it } from 'vitest'
import { runWorkflow } from '@/features/execution/engine'
import { workflowSchema } from '@/schemas/workflow'
import {
  buildExpenseApprovalTemplate,
  buildLaunchAnnouncementTemplate,
  buildNegativeReviewTemplate,
  buildOverduePaymentTemplate,
  buildVipTicketTemplate,
  STARTER_TEMPLATES,
} from './starter-templates'

describe('buildVipTicketTemplate', () => {
  it('produz um workflow válido conforme o schema', () => {
    const result = workflowSchema.safeParse(buildVipTicketTemplate())
    expect(result.success).toBe(true)
  })

  it('reproduz o diagrama do briefing: trigger -> classify -> condition -> slack/email', () => {
    const workflow = buildVipTicketTemplate()
    const kinds = workflow.nodes.map((node) => node.type)
    expect(kinds).toEqual([
      'trigger',
      'ai-classify',
      'condition',
      'action',
      'action',
    ])
    expect(workflow.edges).toHaveLength(4)

    const branchEdges = workflow.edges.filter((edge) => edge.sourceHandle)
    expect(branchEdges.map((edge) => edge.sourceHandle).sort()).toEqual([
      'false',
      'true',
    ])
  })

  it('gera um id novo a cada chamada, para permitir múltiplas instâncias do template', () => {
    const first = buildVipTicketTemplate()
    const second = buildVipTicketTemplate()
    expect(first.id).not.toBe(second.id)
  })
})

describe('STARTER_TEMPLATES', () => {
  it('tem 5 templates com ids e labels únicos', () => {
    expect(STARTER_TEMPLATES).toHaveLength(5)
    expect(new Set(STARTER_TEMPLATES.map((t) => t.id)).size).toBe(5)
    expect(new Set(STARTER_TEMPLATES.map((t) => t.label)).size).toBe(5)
  })

  it.each(
    STARTER_TEMPLATES.map((template) => [template.id, template] as const),
  )(
    'template "%s" produz um workflow válido que roda sem erro',
    (_id, template) => {
      const workflow = template.build()

      const parsed = workflowSchema.safeParse(workflow)
      expect(parsed.success).toBe(true)
      expect(workflow.nodes.some((node) => node.type === 'trigger')).toBe(true)

      const record = runWorkflow(workflow)
      expect(record.status).toBe('success')
    },
  )
})

describe('templates individuais', () => {
  it('buildExpenseApprovalTemplate: condition sem ai-classify, com dois branches', () => {
    const workflow = buildExpenseApprovalTemplate()
    expect(workflow.nodes.map((n) => n.type)).toEqual([
      'trigger',
      'condition',
      'action',
      'action',
    ])
  })

  it('buildLaunchAnnouncementTemplate: usa um node loop', () => {
    const workflow = buildLaunchAnnouncementTemplate()
    expect(workflow.nodes.some((n) => n.type === 'loop')).toBe(true)
  })

  it('buildNegativeReviewTemplate: branch "false" fica sem node conectado', () => {
    const workflow = buildNegativeReviewTemplate()
    const conditionNode = workflow.nodes.find((n) => n.type === 'condition')
    expect(conditionNode).toBeDefined()
    const outgoing = workflow.edges.filter(
      (e) => e.source === conditionNode?.id,
    )
    expect(outgoing.map((e) => e.sourceHandle)).toEqual(['true'])
  })

  it('buildOverduePaymentTemplate: único template com operador "contains"', () => {
    const workflow = buildOverduePaymentTemplate()
    const conditionNode = workflow.nodes.find((n) => n.type === 'condition')
    expect(conditionNode?.data).toMatchObject({ operator: 'contains' })
  })
})

import { describe, expect, it } from 'vitest'
import { workflowSchema } from '@/schemas/workflow'
import { buildVipTicketTemplate } from './starter-templates'

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

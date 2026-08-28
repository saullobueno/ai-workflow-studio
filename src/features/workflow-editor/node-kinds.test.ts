import { describe, expect, it } from 'vitest'
import { nodeDataSchema, nodeKindSchema } from '@/schemas/node'
import {
  ACTION_KIND_ORDER,
  NODE_KIND_ORDER,
  createDefaultActionData,
  createNode,
} from './node-kinds'

describe('createNode', () => {
  it.each(NODE_KIND_ORDER)(
    'cria um node "%s" com dados válidos pelo schema',
    (kind) => {
      const node = createNode(kind, { x: 0, y: 0 })
      expect(nodeKindSchema.parse(node.type)).toBe(kind)
      expect(() => nodeDataSchema.parse(node.data)).not.toThrow()
    },
  )

  it('gera ids diferentes a cada chamada', () => {
    const a = createNode('trigger', { x: 0, y: 0 })
    const b = createNode('trigger', { x: 0, y: 0 })
    expect(a.id).not.toBe(b.id)
  })
})

describe('createDefaultActionData', () => {
  it.each(ACTION_KIND_ORDER)(
    'cria dados válidos para a ação "%s"',
    (actionKind) => {
      const data = createDefaultActionData(actionKind)
      expect(() => nodeDataSchema.parse(data)).not.toThrow()
      expect(data.actionKind).toBe(actionKind)
    },
  )
})

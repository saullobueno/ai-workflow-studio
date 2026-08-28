import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import type { LoopNodeData } from '@/schemas/node'
import { NODE_KIND_META } from '../node-kinds'
import { NodeShell } from './NodeShell'

export type LoopFlowNode = Node<LoopNodeData, 'loop'>

export function LoopNode({ data, selected }: NodeProps<LoopFlowNode>) {
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <NodeShell
        icon={NODE_KIND_META.loop.icon}
        label={data.label || NODE_KIND_META.loop.label}
        selected={selected}
      >
        para cada {data.itemVariable || 'item'} em{' '}
        {data.listTemplate || '{{lista}}'} (máx. {data.maxIterations})
      </NodeShell>
      <Handle type="source" position={Position.Bottom} />
    </>
  )
}

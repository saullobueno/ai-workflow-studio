import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import type { AiClassifyNodeData } from '@/schemas/node'
import { NODE_KIND_META } from '../node-kinds'
import { NodeShell } from './NodeShell'

export type AiClassifyFlowNode = Node<AiClassifyNodeData, 'ai-classify'>

export function AiClassifyNode({
  data,
  selected,
}: NodeProps<AiClassifyFlowNode>) {
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <NodeShell
        icon={NODE_KIND_META['ai-classify'].icon}
        label={data.label || NODE_KIND_META['ai-classify'].label}
        selected={selected}
      >
        {data.categories.join(' · ')}
      </NodeShell>
      <Handle type="source" position={Position.Bottom} />
    </>
  )
}

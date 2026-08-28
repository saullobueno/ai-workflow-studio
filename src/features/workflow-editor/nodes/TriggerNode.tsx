import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import type { TriggerNodeData } from '@/schemas/node'
import { NODE_KIND_META } from '../node-kinds'
import { NodeShell } from './NodeShell'

export type TriggerFlowNode = Node<TriggerNodeData, 'trigger'>

export function TriggerNode({ data, selected }: NodeProps<TriggerFlowNode>) {
  return (
    <>
      <NodeShell
        icon={NODE_KIND_META.trigger.icon}
        label={data.label || NODE_KIND_META.trigger.label}
        selected={selected}
      >
        {data.eventName || 'defina o nome do evento'}
      </NodeShell>
      <Handle type="source" position={Position.Bottom} />
    </>
  )
}

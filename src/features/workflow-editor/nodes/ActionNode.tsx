import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import type { ActionNodeData } from '@/schemas/node'
import { ACTION_KIND_META } from '../node-kinds'
import { NodeShell } from './NodeShell'

export type ActionFlowNode = Node<ActionNodeData, 'action'>

function ActionSummary({ data }: { data: ActionNodeData }) {
  switch (data.actionKind) {
    case 'slack':
      return <>{data.channel || '#canal'}</>
    case 'email':
      return <>{data.to || 'destinatario@empresa.com'}</>
    case 'create-task':
      return <>{data.title || 'título da tarefa'}</>
  }
}

export function ActionNode({ data, selected }: NodeProps<ActionFlowNode>) {
  const meta = ACTION_KIND_META[data.actionKind]
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <NodeShell
        icon={meta.icon}
        label={data.label || meta.label}
        selected={selected}
      >
        <ActionSummary data={data} />
      </NodeShell>
      <Handle type="source" position={Position.Bottom} />
    </>
  )
}

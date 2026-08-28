import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import type { ConditionNodeData } from '@/schemas/node'
import { NODE_KIND_META } from '../node-kinds'
import { NodeShell } from './NodeShell'

export type ConditionFlowNode = Node<ConditionNodeData, 'condition'>

const OPERATOR_LABEL: Record<ConditionNodeData['operator'], string> = {
  equals: '=',
  'not-equals': '≠',
  contains: 'contém',
}

export function ConditionNode({
  data,
  selected,
}: NodeProps<ConditionFlowNode>) {
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <NodeShell
        icon={NODE_KIND_META.condition.icon}
        label={data.label || NODE_KIND_META.condition.label}
        selected={selected}
      >
        {data.fieldTemplate || '{{campo}}'} {OPERATOR_LABEL[data.operator]}{' '}
        {data.value || '""'}
      </NodeShell>
      <Handle
        type="source"
        id="true"
        position={Position.Bottom}
        style={{ left: '25%' }}
      />
      <span className="text-success absolute bottom-[-18px] left-[15%] text-[10px] font-medium">
        verdadeiro
      </span>
      <Handle
        type="source"
        id="false"
        position={Position.Bottom}
        style={{ left: '75%' }}
      />
      <span className="text-destructive absolute right-[10%] bottom-[-18px] text-[10px] font-medium">
        falso
      </span>
    </>
  )
}

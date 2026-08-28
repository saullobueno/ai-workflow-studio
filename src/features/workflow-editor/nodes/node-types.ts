import type { NodeTypes } from '@xyflow/react'
import { ActionNode } from './ActionNode'
import { AiClassifyNode } from './AiClassifyNode'
import { ConditionNode } from './ConditionNode'
import { LoopNode } from './LoopNode'
import { TriggerNode } from './TriggerNode'

export const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  'ai-classify': AiClassifyNode,
  condition: ConditionNode,
  loop: LoopNode,
  action: ActionNode,
}

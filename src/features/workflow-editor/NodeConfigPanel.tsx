import { Trash2, X } from 'lucide-react'
import { Button } from '@/design/ui/button'
import type { NodeData } from '@/schemas/node'
import { AiClassifyNodeForm } from './node-forms/AiClassifyNodeForm'
import { ActionNodeForm } from './node-forms/ActionNodeForm'
import { ConditionNodeForm } from './node-forms/ConditionNodeForm'
import { LoopNodeForm } from './node-forms/LoopNodeForm'
import { TriggerNodeForm } from './node-forms/TriggerNodeForm'
import { NODE_KIND_META } from './node-kinds'
import { useWorkflowEditorStore } from './store'

interface NodeConfigPanelProps {
  nodeId: string
  onClose: () => void
}

export function NodeConfigPanel({ nodeId, onClose }: NodeConfigPanelProps) {
  const node = useWorkflowEditorStore((state) =>
    state.nodes.find((n) => n.id === nodeId),
  )
  const updateNodeData = useWorkflowEditorStore((state) => state.updateNodeData)
  const removeNode = useWorkflowEditorStore((state) => state.removeNode)

  if (!node) return null

  function handleChange(data: NodeData) {
    updateNodeData(nodeId, data)
  }

  function handleDelete() {
    removeNode(nodeId)
    onClose()
  }

  const meta = NODE_KIND_META[node.type]

  return (
    <aside className="flex w-80 shrink-0 flex-col overflow-y-auto border-l">
      <header className="flex items-center gap-2 border-b p-3">
        <meta.icon className="text-muted-foreground size-4" aria-hidden />
        <h2 className="flex-1 text-sm font-semibold">{meta.label}</h2>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Excluir node"
          onClick={handleDelete}
        >
          <Trash2 />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Fechar painel de configuração"
          onClick={onClose}
        >
          <X />
        </Button>
      </header>
      <div className="p-4">
        {node.data.kind === 'trigger' && (
          <TriggerNodeForm data={node.data} onChange={handleChange} />
        )}
        {node.data.kind === 'ai-classify' && (
          <AiClassifyNodeForm data={node.data} onChange={handleChange} />
        )}
        {node.data.kind === 'condition' && (
          <ConditionNodeForm data={node.data} onChange={handleChange} />
        )}
        {node.data.kind === 'loop' && (
          <LoopNodeForm data={node.data} onChange={handleChange} />
        )}
        {node.data.kind === 'action' && (
          <ActionNodeForm data={node.data} onChange={handleChange} />
        )}
      </div>
    </aside>
  )
}

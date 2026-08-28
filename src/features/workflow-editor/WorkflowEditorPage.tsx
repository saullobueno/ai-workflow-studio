import { ArrowLeft } from 'lucide-react'
import { useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Button } from '@/design/ui/button'
import { Input } from '@/design/ui/input'
import { loadWorkflow } from '@/features/workflows/workflow-repository'
import { useWorkflowEditorStore } from './store'

interface WorkflowEditorPageProps {
  workflowId: string
}

export function WorkflowEditorPage({ workflowId }: WorkflowEditorPageProps) {
  const navigate = useNavigate()
  const storeWorkflowId = useWorkflowEditorStore((state) => state.workflowId)
  const name = useWorkflowEditorStore((state) => state.name)
  const autosaveStatus = useWorkflowEditorStore((state) => state.autosaveStatus)
  const setName = useWorkflowEditorStore((state) => state.setName)
  const loadIntoStore = useWorkflowEditorStore((state) => state.loadWorkflow)
  const closeWorkflow = useWorkflowEditorStore((state) => state.closeWorkflow)

  const workflow = loadWorkflow(workflowId)

  useEffect(() => {
    if (workflow) loadIntoStore(workflow)
    return () => {
      closeWorkflow()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- carrega só quando o id muda
  }, [workflowId])

  if (!workflow) {
    return <Navigate to="/" replace />
  }

  if (storeWorkflowId !== workflowId) {
    return null
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center gap-3 border-b p-3">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Voltar para a lista de workflows"
          onClick={() => {
            void navigate('/')
          }}
        >
          <ArrowLeft />
        </Button>
        <Input
          value={name}
          onChange={(event) => {
            setName(event.target.value)
          }}
          aria-label="Nome do workflow"
          className="max-w-sm font-medium"
        />
        <span className="text-muted-foreground ml-auto text-xs" role="status">
          {autosaveStatus === 'saved' ? 'Salvo' : 'Salvando…'}
        </span>
      </header>

      <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
        Canvas do editor ({workflow.nodes.length} nodes, {workflow.edges.length}{' '}
        edges) — em construção.
      </div>
    </div>
  )
}

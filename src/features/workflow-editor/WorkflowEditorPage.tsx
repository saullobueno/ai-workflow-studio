import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Command, History, Play } from 'lucide-react'
import { lazy, Suspense, useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/design/ui/button'
import { Input } from '@/design/ui/input'
import { runWorkflow } from '@/features/execution/engine'
import { saveExecution } from '@/features/execution/execution-repository'
import { loadWorkflow } from '@/features/workflows/workflow-repository'
import { CommandPalette } from './CommandPalette'
import { NodeConfigPanel } from './NodeConfigPanel'
import { NodePalette } from './NodePalette'
import { getCurrentWorkflowSnapshot, useWorkflowEditorStore } from './store'
import { WorkflowCanvas } from './WorkflowCanvas'

// ECharts (gráfico de duração) e o wrapper do Monaco (JSON inspector) só
// entram no bundle quando o usuário efetivamente abre o histórico.
const ExecutionHistoryDialog = lazy(() =>
  import('@/features/execution/ExecutionHistoryDialog').then((module) => ({
    default: module.ExecutionHistoryDialog,
  })),
)

interface WorkflowEditorPageProps {
  workflowId: string
}

export function WorkflowEditorPage({ workflowId }: WorkflowEditorPageProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyEverOpened, setHistoryEverOpened] = useState(false)
  const [selectedExecutionId, setSelectedExecutionId] = useState<string | null>(
    null,
  )
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
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

  function openHistory(executionId: string | null) {
    setSelectedExecutionId(executionId)
    setHistoryEverOpened(true)
    setHistoryOpen(true)
  }

  function handleRun() {
    const snapshot = getCurrentWorkflowSnapshot()
    if (!snapshot) return

    const record = runWorkflow(snapshot)
    saveExecution(record)
    void queryClient.invalidateQueries({ queryKey: ['executions', workflowId] })

    openHistory(record.id)

    if (record.status === 'success') {
      toast.success('Execução simulada concluída', {
        description: `${String(record.steps.length)} node(s) executado(s).`,
      })
    } else {
      toast.error('Execução simulada terminou com erro', {
        description: 'Veja o histórico para os detalhes de cada node.',
      })
    }
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
        <span className="text-muted-foreground text-xs" role="status">
          {autosaveStatus === 'saved' ? 'Salvo' : 'Salvando…'}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCommandPaletteOpen(true)
            }}
          >
            <Command /> Comandos
            <kbd className="bg-muted ml-1 rounded px-1 text-[10px]">Ctrl K</kbd>
          </Button>
          <Button variant="outline" size="sm" onClick={handleRun}>
            <Play /> Executar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              openHistory(null)
            }}
          >
            <History /> Histórico
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <NodePalette />
        <WorkflowCanvas
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
        />
        {selectedNodeId && (
          <NodeConfigPanel
            nodeId={selectedNodeId}
            onClose={() => {
              setSelectedNodeId(null)
            }}
          />
        )}
      </div>

      {historyEverOpened && (
        <Suspense fallback={null}>
          <ExecutionHistoryDialog
            workflowId={workflowId}
            open={historyOpen}
            onOpenChange={setHistoryOpen}
            selectedExecutionId={selectedExecutionId}
            onSelectExecution={setSelectedExecutionId}
          />
        </Suspense>
      )}

      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        onRun={handleRun}
        onOpenHistory={() => {
          openHistory(null)
        }}
      />
    </div>
  )
}

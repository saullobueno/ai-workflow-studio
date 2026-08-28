import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CheckCircle2, ChevronDown, ChevronRight, XCircle } from 'lucide-react'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/design/ui/dialog'
import { cn } from '@/lib/utils'
import type { ExecutionRecord, ExecutionStatus } from '@/schemas/execution'
import { ExecutionDurationChart } from './ExecutionDurationChart'
import { listExecutions } from './execution-repository'
import { JsonInspector } from './JsonInspector'

interface ExecutionHistoryDialogProps {
  workflowId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedExecutionId: string | null
  onSelectExecution: (id: string) => void
}

function StatusIcon({ status }: { status: ExecutionStatus }) {
  if (status === 'error') {
    return <XCircle className="text-destructive size-4 shrink-0" aria-hidden />
  }
  return <CheckCircle2 className="text-success size-4 shrink-0" aria-hidden />
}

function ExecutionStepRow({
  step,
}: {
  step: ExecutionRecord['steps'][number]
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <li className="rounded-md border">
      <button
        type="button"
        className="hover:bg-accent flex w-full items-center gap-2 p-2 text-left text-sm"
        onClick={() => {
          setExpanded((current) => !current)
        }}
        aria-expanded={expanded}
      >
        {expanded ? (
          <ChevronDown className="size-4 shrink-0" aria-hidden />
        ) : (
          <ChevronRight className="size-4 shrink-0" aria-hidden />
        )}
        <StatusIcon status={step.status} />
        <span className="font-medium">{step.nodeLabel}</span>
        <span className="text-muted-foreground ml-auto font-mono text-xs">
          {step.nodeId}
        </span>
      </button>
      {expanded && (
        <div className="flex flex-col gap-3 border-t p-3">
          {step.logs.length > 0 && (
            <ul className="text-muted-foreground flex flex-col gap-1 font-mono text-xs">
              {step.logs.map((log, index) => (
                <li key={index}>{log}</li>
              ))}
            </ul>
          )}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-muted-foreground mb-1 text-xs font-medium">
                Entrada
              </p>
              <JsonInspector value={step.input} height="160px" />
            </div>
            <div>
              <p className="text-muted-foreground mb-1 text-xs font-medium">
                Saída
              </p>
              <JsonInspector value={step.output} height="160px" />
            </div>
          </div>
        </div>
      )}
    </li>
  )
}

export function ExecutionHistoryDialog({
  workflowId,
  open,
  onOpenChange,
  selectedExecutionId,
  onSelectExecution,
}: ExecutionHistoryDialogProps) {
  const { data: executions = [] } = useQuery({
    queryKey: ['executions', workflowId],
    queryFn: () => listExecutions(workflowId),
    enabled: open,
  })

  const selected =
    executions.find((execution) => execution.id === selectedExecutionId) ??
    executions[0]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[85vh] max-w-5xl overflow-hidden p-0"
        showCloseButton
      >
        <div className="flex h-[80vh] flex-col">
          <DialogHeader className="border-b p-4">
            <DialogTitle>Histórico de execução</DialogTitle>
          </DialogHeader>
          {executions.length === 0 ? (
            <p className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
              Nenhuma execução ainda. Clique em "Executar" para simular o
              workflow.
            </p>
          ) : (
            <div className="flex flex-1 overflow-hidden">
              <aside className="w-64 shrink-0 overflow-y-auto border-r p-3">
                <ul className="flex flex-col gap-1">
                  {executions.map((execution) => (
                    <li key={execution.id}>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectExecution(execution.id)
                        }}
                        className={cn(
                          'flex w-full items-center gap-2 rounded-md p-2 text-left text-sm',
                          selected?.id === execution.id
                            ? 'bg-accent'
                            : 'hover:bg-accent/50',
                        )}
                      >
                        <StatusIcon status={execution.status} />
                        {format(
                          new Date(execution.startedAt),
                          'dd/MM HH:mm:ss',
                          {
                            locale: ptBR,
                          },
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </aside>
              <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
                <ExecutionDurationChart executions={executions} />
                {selected && (
                  <ul className="flex flex-col gap-2">
                    {selected.steps.map((step, index) => (
                      <ExecutionStepRow
                        key={`${step.nodeId}-${String(index)}`}
                        step={step}
                      />
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  LayoutTemplate,
  Plus,
  Sparkles,
  Trash2,
  Workflow as WorkflowIcon,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/design/ui/button'
import { CopilotDialog } from '@/features/copilot/CopilotDialog'
import { buildVipTicketTemplate } from '@/features/workflows/starter-templates'
import {
  createEmptyWorkflow,
  deleteWorkflow,
  listWorkflows,
  saveWorkflow,
} from '@/features/workflows/workflow-repository'

const WORKFLOWS_QUERY_KEY = ['workflows'] as const

export function WorkflowListPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [copilotOpen, setCopilotOpen] = useState(false)

  const { data: workflows = [] } = useQuery({
    queryKey: WORKFLOWS_QUERY_KEY,
    queryFn: () => listWorkflows(),
  })

  const createMutation = useMutation({
    mutationFn: (workflow: ReturnType<typeof createEmptyWorkflow>) => {
      saveWorkflow(workflow)
      return Promise.resolve(workflow)
    },
    onSuccess: async (workflow) => {
      await queryClient.invalidateQueries({ queryKey: WORKFLOWS_QUERY_KEY })
      void navigate(`/workflows/${workflow.id}`)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      deleteWorkflow(id)
      return Promise.resolve()
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: WORKFLOWS_QUERY_KEY }),
  })

  function handleCreateBlank() {
    createMutation.mutate(createEmptyWorkflow('Novo workflow'))
  }

  function handleCreateFromTemplate() {
    createMutation.mutate(buildVipTicketTemplate())
  }

  function handleDelete(id: string, name: string) {
    if (
      window.confirm(
        `Excluir o workflow "${name}"? Essa ação não pode ser desfeita.`,
      )
    ) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 p-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">AI Workflow Studio</h1>
        <p className="text-muted-foreground text-sm">
          Editor visual para construir workflows de IA — gatilhos,
          classificação, condições e ações.
        </p>
      </header>

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleCreateBlank}>
          <Plus /> Novo workflow
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setCopilotOpen(true)
          }}
        >
          <Sparkles /> Criar com IA
        </Button>
        <Button variant="outline" onClick={handleCreateFromTemplate}>
          <LayoutTemplate /> Começar com o exemplo (ticket VIP)
        </Button>
      </div>

      <CopilotDialog open={copilotOpen} onOpenChange={setCopilotOpen} />

      {workflows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-12 text-center">
          <WorkflowIcon className="text-muted-foreground size-8" aria-hidden />
          <p className="font-medium">Nenhum workflow ainda</p>
          <p className="text-muted-foreground text-sm">
            Crie um workflow em branco ou comece a partir do exemplo do ticket
            VIP.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {workflows.map((workflow) => (
            <li
              key={workflow.id}
              className="flex items-center justify-between gap-4 rounded-lg border p-4"
            >
              <button
                type="button"
                onClick={() => {
                  void navigate(`/workflows/${workflow.id}`)
                }}
                className="flex-1 text-left"
              >
                <p className="font-medium">{workflow.name}</p>
                {workflow.description && (
                  <p className="text-muted-foreground line-clamp-1 text-sm">
                    {workflow.description}
                  </p>
                )}
                <p className="text-muted-foreground mt-1 text-xs">
                  {workflow.nodeCount} node{workflow.nodeCount === 1 ? '' : 's'}{' '}
                  · atualizado{' '}
                  {formatDistanceToNow(new Date(workflow.updatedAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </p>
              </button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Excluir workflow "${workflow.name}"`}
                onClick={() => {
                  handleDelete(workflow.id, workflow.name)
                }}
              >
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

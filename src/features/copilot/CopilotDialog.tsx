import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Sparkles } from 'lucide-react'
import { useState, type SyntheticEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/design/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/design/ui/dialog'
import { Textarea } from '@/design/ui/textarea'
import { HttpError } from '@/core/http-client'
import {
  createWorkflowFromDraft,
  saveWorkflow,
} from '@/features/workflows/workflow-repository'
import { generateWorkflowFromPrompt } from './copilot-client'

interface CopilotDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const EXAMPLE_PROMPT =
  'Quando chegar um ticket de cliente VIP com sentimento negativo, envie para o Slack e crie uma tarefa.'

export function CopilotDialog({ open, onOpenChange }: CopilotDialogProps) {
  const [prompt, setPrompt] = useState('')
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: generateWorkflowFromPrompt,
    onSuccess: async (response) => {
      const workflow = createWorkflowFromDraft(response.workflow)
      saveWorkflow(workflow)
      await queryClient.invalidateQueries({ queryKey: ['workflows'] })
      setPrompt('')
      onOpenChange(false)
      void navigate(`/workflows/${workflow.id}`)
    },
  })

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!prompt.trim() || mutation.isPending) return
    mutation.mutate(prompt)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!mutation.isPending) onOpenChange(nextOpen)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4" aria-hidden /> AI Copilot
          </DialogTitle>
          <DialogDescription>
            Descreva o workflow que você quer em português e a IA monta a
            estrutura (gatilho, condições e ações) pra você.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Textarea
            rows={4}
            placeholder={EXAMPLE_PROMPT}
            value={prompt}
            onChange={(event) => {
              setPrompt(event.target.value)
            }}
            disabled={mutation.isPending}
            aria-label="Descrição do workflow"
          />
          {mutation.isError && (
            <p className="text-destructive text-sm" role="alert">
              {mutation.error instanceof HttpError
                ? mutation.error.message
                : 'Não foi possível gerar o workflow. Tente novamente.'}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={mutation.isPending}
              onClick={() => {
                onOpenChange(false)
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending || !prompt.trim()}
            >
              {mutation.isPending ? 'Gerando…' : 'Gerar workflow'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

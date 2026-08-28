import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ExecutionRecord } from '@/schemas/execution'
import { ExecutionHistoryDialog } from './ExecutionHistoryDialog'
import { saveExecution } from './execution-repository'

function buildRecord(): ExecutionRecord {
  const now = new Date().toISOString()
  return {
    id: 'exec-1',
    workflowId: 'wf-1',
    workflowName: 'Teste',
    status: 'success',
    startedAt: now,
    finishedAt: now,
    steps: [
      {
        nodeId: 'n1',
        nodeLabel: 'Novo ticket',
        status: 'success',
        startedAt: now,
        finishedAt: now,
        input: {},
        output: { subject: 'oi' },
        logs: ['Evento recebido: ticket.created'],
      },
    ],
  }
}

function renderDialog(open: boolean) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <ExecutionHistoryDialog
        workflowId="wf-1"
        open={open}
        onOpenChange={vi.fn()}
        selectedExecutionId={null}
        onSelectExecution={vi.fn()}
      />
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('ExecutionHistoryDialog', () => {
  it('mostra a mensagem de estado vazio quando não há execuções', async () => {
    renderDialog(true)
    expect(
      await screen.findByText(/nenhuma execução ainda/i),
    ).toBeInTheDocument()
  })

  it('mostra os passos da execução mais recente por padrão', async () => {
    saveExecution(buildRecord())
    renderDialog(true)

    expect(await screen.findByText('Novo ticket')).toBeInTheDocument()
  })

  it('expande um passo para ver os logs', async () => {
    saveExecution(buildRecord())
    const user = userEvent.setup()
    renderDialog(true)

    const stepButton = await screen.findByRole('button', {
      name: /novo ticket/i,
    })
    await user.click(stepButton)

    expect(
      screen.getByText('Evento recebido: ticket.created'),
    ).toBeInTheDocument()
  })
})

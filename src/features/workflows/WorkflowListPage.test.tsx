import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { WorkflowListPage } from './WorkflowListPage'
import { createEmptyWorkflow, saveWorkflow } from './workflow-repository'

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<WorkflowListPage />} />
          <Route
            path="/workflows/:workflowId"
            element={<div>Editor aberto</div>}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('WorkflowListPage', () => {
  it('mostra o estado vazio quando não há workflows', async () => {
    renderPage()
    expect(await screen.findByText('Nenhum workflow ainda')).toBeInTheDocument()
  })

  it('lista workflows já salvos', async () => {
    saveWorkflow(createEmptyWorkflow('Workflow existente'))
    renderPage()
    expect(await screen.findByText('Workflow existente')).toBeInTheDocument()
  })

  it('cria um workflow em branco e navega para o editor', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /novo workflow/i }))

    expect(await screen.findByText('Editor aberto')).toBeInTheDocument()
  })

  it('lista os 5 exemplos no seletor de templates', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(
      screen.getByRole('combobox', { name: /começar com um exemplo/i }),
    )

    for (const label of [
      'Ticket VIP com sentimento negativo',
      'Aprovação de despesa corporativa',
      'Lançamento de produto (multi-canal)',
      'Review negativo vira tarefa',
      'Lembrete de pagamento em atraso',
    ]) {
      expect(screen.getByRole('option', { name: label })).toBeInTheDocument()
    }
  })

  it('cria o workflow a partir do template escolhido no seletor', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(
      screen.getByRole('combobox', { name: /começar com um exemplo/i }),
    )
    await user.click(
      screen.getByRole('option', {
        name: 'Lançamento de produto (multi-canal)',
      }),
    )

    expect(await screen.findByText('Editor aberto')).toBeInTheDocument()
  })

  it('remove um workflow após confirmação', async () => {
    saveWorkflow(createEmptyWorkflow('Para excluir'))
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('Para excluir')
    await user.click(
      screen.getByRole('button', { name: /excluir workflow "para excluir"/i }),
    )

    await waitFor(() => {
      expect(screen.queryByText('Para excluir')).not.toBeInTheDocument()
    })
  })
})

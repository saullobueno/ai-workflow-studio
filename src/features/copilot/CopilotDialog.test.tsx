import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { buildVipTicketTemplate } from '@/features/workflows/starter-templates'
import { listWorkflows } from '@/features/workflows/workflow-repository'
import { CopilotDialog } from './CopilotDialog'

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function renderDialog() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const onOpenChange = vi.fn()
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path="/"
            element={<CopilotDialog open onOpenChange={onOpenChange} />}
          />
          <Route path="/workflows/:id" element={<div>Editor aberto</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
  return { onOpenChange }
}

function draftFromTemplate() {
  const {
    id: _id,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    ...draft
  } = buildVipTicketTemplate()
  return draft
}

beforeEach(() => {
  window.localStorage.clear()
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('CopilotDialog', () => {
  it('gera um workflow, salva no repositório e navega para o editor', async () => {
    const draft = draftFromTemplate()
    vi.mocked(fetch).mockResolvedValue(jsonResponse(200, { workflow: draft }))
    const user = userEvent.setup()
    renderDialog()

    await user.type(
      screen.getByLabelText('Descrição do workflow'),
      'ticket vip com sentimento negativo',
    )
    await user.click(screen.getByRole('button', { name: /gerar workflow/i }))

    expect(await screen.findByText('Editor aberto')).toBeInTheDocument()
    expect(listWorkflows()).toHaveLength(1)
    expect(listWorkflows()[0]?.name).toBe(draft.name)
  })

  it('mostra uma mensagem de erro quando o servidor recusa o prompt', async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(422, {
        error: { title: 'Prompt inválido', detail: 'Descreva o workflow.' },
      }),
    )
    const user = userEvent.setup()
    renderDialog()

    await user.type(screen.getByLabelText('Descrição do workflow'), 'x')
    await user.click(screen.getByRole('button', { name: /gerar workflow/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Descreva o workflow.',
    )
    expect(listWorkflows()).toHaveLength(0)
  })

  it('não envia o formulário com o prompt vazio', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('button', { name: /gerar workflow/i }))

    expect(fetch).not.toHaveBeenCalled()
  })

  it('desabilita o botão de cancelar enquanto a geração está em andamento', async () => {
    let resolveFetch: (value: Response) => void = () => undefined
    vi.mocked(fetch).mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve
      }),
    )
    const user = userEvent.setup()
    renderDialog()

    await user.type(screen.getByLabelText('Descrição do workflow'), 'algo')
    await user.click(screen.getByRole('button', { name: /gerar workflow/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cancelar/i })).toBeDisabled()
    })

    resolveFetch(jsonResponse(200, { workflow: draftFromTemplate() }))
  })
})

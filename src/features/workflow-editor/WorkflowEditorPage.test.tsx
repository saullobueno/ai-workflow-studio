import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { buildVipTicketTemplate } from '@/features/workflows/starter-templates'
import { saveWorkflow } from '@/features/workflows/workflow-repository'
import { WorkflowEditorPage } from './WorkflowEditorPage'

function renderEditor(workflowId: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/workflows/${workflowId}`]}>
        <Routes>
          <Route
            path="/workflows/:id"
            element={<WorkflowEditorPage workflowId={workflowId} />}
          />
          <Route path="/" element={<div>Lista de workflows</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('WorkflowEditorPage', () => {
  it('renderiza os nodes do workflow carregado no canvas', async () => {
    const workflow = buildVipTicketTemplate()
    saveWorkflow(workflow)
    renderEditor(workflow.id)

    expect(
      await screen.findByText('Novo ticket de suporte'),
    ).toBeInTheDocument()
    expect(screen.getByText('Classificar urgência com IA')).toBeInTheDocument()
    expect(screen.getByText('Avisar no Slack')).toBeInTheDocument()
    expect(screen.getByText('Enviar por e-mail')).toBeInTheDocument()
  })

  it('redireciona para a lista quando o workflow não existe', async () => {
    renderEditor('id-inexistente')
    expect(await screen.findByText('Lista de workflows')).toBeInTheDocument()
  })

  it('executa o workflow e abre o histórico com o resultado', async () => {
    const workflow = buildVipTicketTemplate()
    saveWorkflow(workflow)
    const user = userEvent.setup()
    renderEditor(workflow.id)

    await screen.findByText('Novo ticket de suporte')
    await user.click(screen.getByRole('button', { name: /executar/i }))

    // O ExecutionHistoryDialog é carregado via import() dinâmico (para não
    // engordar o bundle do editor com ECharts/Monaco) — a primeira vez que
    // esse chunk é resolvido no ambiente de teste pode passar do timeout padrão.
    const dialog = await screen.findByRole('dialog', {}, { timeout: 45000 })
    expect(
      within(dialog).getByText('Histórico de execução'),
    ).toBeInTheDocument()
    // O passo do node de classificação aparece na lista de passos do dialog
    // (o mesmo texto também existe no canvas, por isso a busca é escopada).
    expect(
      within(dialog).getByText('Classificar urgência com IA'),
    ).toBeVisible()
  }, 50000)
})

import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { buildVipTicketTemplate } from '@/features/workflows/starter-templates'
import { saveWorkflow } from '@/features/workflows/workflow-repository'
import { WorkflowEditorPage } from './WorkflowEditorPage'

function renderEditor(workflowId: string) {
  return render(
    <MemoryRouter initialEntries={[`/workflows/${workflowId}`]}>
      <Routes>
        <Route
          path="/workflows/:id"
          element={<WorkflowEditorPage workflowId={workflowId} />}
        />
        <Route path="/" element={<div>Lista de workflows</div>} />
      </Routes>
    </MemoryRouter>,
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
})

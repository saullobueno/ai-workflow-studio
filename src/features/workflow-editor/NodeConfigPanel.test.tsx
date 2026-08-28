import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createEmptyWorkflow } from '@/features/workflows/workflow-repository'
import type { WorkflowNode } from '@/schemas/node'
import { NodeConfigPanel } from './NodeConfigPanel'
import { useWorkflowEditorStore } from './store'

function buildTriggerNode(): WorkflowNode {
  return {
    id: 'n1',
    type: 'trigger',
    position: { x: 0, y: 0 },
    data: {
      kind: 'trigger',
      label: 'Novo ticket',
      eventName: 'ticket.created',
      fields: [],
    },
  }
}

beforeEach(() => {
  window.localStorage.clear()
  const workflow = createEmptyWorkflow('Teste')
  useWorkflowEditorStore.getState().loadWorkflow(workflow)
  useWorkflowEditorStore.getState().addNode(buildTriggerNode())
})

describe('NodeConfigPanel', () => {
  it('edita um campo e reflete a mudança na store', async () => {
    const user = userEvent.setup()
    render(<NodeConfigPanel nodeId="n1" onClose={vi.fn()} />)

    const eventNameInput = screen.getByLabelText(/nome do evento/i)
    expect(eventNameInput).toHaveValue('ticket.created')

    await user.clear(eventNameInput)
    await user.type(eventNameInput, 'ticket.updated')

    const node = useWorkflowEditorStore
      .getState()
      .nodes.find((n) => n.id === 'n1')
    expect(node?.data).toMatchObject({ eventName: 'ticket.updated' })
  })

  it('exclui o node e chama onClose', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<NodeConfigPanel nodeId="n1" onClose={onClose} />)

    await user.click(screen.getByRole('button', { name: 'Excluir node' }))

    expect(useWorkflowEditorStore.getState().nodes).toHaveLength(0)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('não renderiza nada quando o node não existe mais', () => {
    const { container } = render(
      <NodeConfigPanel nodeId="node-inexistente" onClose={vi.fn()} />,
    )
    expect(container).toBeEmptyDOMElement()
  })
})

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createEmptyWorkflow } from '@/features/workflows/workflow-repository'
import { CommandPalette } from './CommandPalette'
import { useWorkflowEditorStore } from './store'

beforeEach(() => {
  window.localStorage.clear()
  useWorkflowEditorStore.getState().loadWorkflow(createEmptyWorkflow('Teste'))
})

describe('CommandPalette', () => {
  it('chama onOpenChange(true) ao pressionar Ctrl+K', async () => {
    const onOpenChange = vi.fn()
    const user = userEvent.setup()
    render(
      <CommandPalette
        open={false}
        onOpenChange={onOpenChange}
        onRun={vi.fn()}
        onOpenHistory={vi.fn()}
      />,
    )

    await user.keyboard('{Control>}k{/Control}')

    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('adiciona um node ao selecionar "Gatilho" na paleta', async () => {
    const user = userEvent.setup()
    render(
      <CommandPalette
        open
        onOpenChange={vi.fn()}
        onRun={vi.fn()}
        onOpenHistory={vi.fn()}
      />,
    )

    await user.click(screen.getByText('Gatilho'))

    expect(useWorkflowEditorStore.getState().nodes).toHaveLength(1)
    expect(useWorkflowEditorStore.getState().nodes[0]?.type).toBe('trigger')
  })

  it('chama onRun ao selecionar "Executar workflow"', async () => {
    const onRun = vi.fn()
    const user = userEvent.setup()
    render(
      <CommandPalette
        open
        onOpenChange={vi.fn()}
        onRun={onRun}
        onOpenHistory={vi.fn()}
      />,
    )

    await user.click(screen.getByText('Executar workflow'))

    expect(onRun).toHaveBeenCalledOnce()
  })

  it('chama onOpenHistory ao selecionar "Ver histórico de execução"', async () => {
    const onOpenHistory = vi.fn()
    const user = userEvent.setup()
    render(
      <CommandPalette
        open
        onOpenChange={vi.fn()}
        onRun={vi.fn()}
        onOpenHistory={onOpenHistory}
      />,
    )

    await user.click(screen.getByText('Ver histórico de execução'))

    expect(onOpenHistory).toHaveBeenCalledOnce()
  })
})

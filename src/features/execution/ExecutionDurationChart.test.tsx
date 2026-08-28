import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { ExecutionRecord } from '@/schemas/execution'
import { ExecutionDurationChart } from './ExecutionDurationChart'

function buildRecord(
  overrides: Partial<ExecutionRecord> = {},
): ExecutionRecord {
  const startedAt = new Date('2026-01-01T10:00:00.000Z')
  const finishedAt = new Date(startedAt.getTime() + 120)
  return {
    id: 'r1',
    workflowId: 'wf-1',
    workflowName: 'Teste',
    status: 'success',
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    steps: [],
    ...overrides,
  }
}

describe('ExecutionDurationChart', () => {
  it('não renderiza nada com menos de 2 execuções', () => {
    const { container } = render(
      <ExecutionDurationChart executions={[buildRecord()]} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renderiza a legenda com 2 ou mais execuções', () => {
    // jsdom não faz layout real (clientWidth/Height ficam 0), então o
    // ECharts não desenha o <canvas> — isso só é verificável de verdade no
    // E2E (browser real). Aqui garantimos que o componente monta sem
    // quebrar e que a legenda (sucesso/erro) aparece.
    render(
      <ExecutionDurationChart
        executions={[
          buildRecord({ id: 'r1', status: 'error' }),
          buildRecord({ id: 'r2', status: 'success' }),
        ]}
      />,
    )
    expect(screen.getByText('Sucesso')).toBeInTheDocument()
    expect(screen.getByText('Erro')).toBeInTheDocument()
  })
})

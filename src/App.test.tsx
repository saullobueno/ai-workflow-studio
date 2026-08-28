import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.history.pushState({}, '', '/')
  })

  it('renderiza a lista de workflows na rota inicial', async () => {
    render(<App />)
    expect(
      await screen.findByRole('heading', { name: 'AI Workflow Studio' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /novo workflow/i }),
    ).toBeInTheDocument()
  })
})

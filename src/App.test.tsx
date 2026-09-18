import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.history.pushState({}, '', '/')
  })

  it('sem sessão, redireciona a rota inicial para o login', async () => {
    render(<App />)
    expect(
      await screen.findByRole('heading', { name: 'AI Workflow Studio' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /^entrar$/i }),
    ).toBeInTheDocument()
  })
})

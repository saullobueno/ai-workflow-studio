import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { beforeEach, describe, expect, it } from 'vitest'
import { DEMO_CREDENTIALS, isAuthenticated } from './auth-storage'
import { LoginPage } from './LoginPage'

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<div>Lista de workflows</div>} />
      </Routes>
      <Toaster />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('LoginPage', () => {
  it('já vem com as credenciais de demonstração preenchidas', () => {
    renderPage()
    expect(screen.getByLabelText('E-mail')).toHaveValue(DEMO_CREDENTIALS.email)
    expect(screen.getByLabelText('Senha')).toHaveValue(
      DEMO_CREDENTIALS.password,
    )
  })

  it('mostra as credenciais de demonstração no rodapé do card', () => {
    renderPage()
    expect(
      screen.getByText(
        `${DEMO_CREDENTIALS.email} / ${DEMO_CREDENTIALS.password}`,
      ),
    ).toBeInTheDocument()
  })

  it('autentica e navega para a lista ao submeter com as credenciais padrão', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /^entrar$/i }))

    expect(await screen.findByText('Lista de workflows')).toBeInTheDocument()
    expect(isAuthenticated()).toBe(true)
  })

  it('mostra um erro e não navega com credenciais incorretas', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.clear(screen.getByLabelText('Senha'))
    await user.type(screen.getByLabelText('Senha'), 'senha-errada')
    await user.click(screen.getByRole('button', { name: /^entrar$/i }))

    expect(await screen.findByText('Credenciais inválidas')).toBeInTheDocument()
    expect(isAuthenticated()).toBe(false)
  })
})

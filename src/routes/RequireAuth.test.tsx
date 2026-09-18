import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { DEMO_CREDENTIALS, login } from '@/features/auth/auth-storage'
import { RequireAuth } from './RequireAuth'

function renderGuarded() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<RequireAuth />}>
          <Route path="/" element={<div>Área protegida</div>} />
        </Route>
        <Route path="/login" element={<div>Tela de login</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('RequireAuth', () => {
  it('redireciona para o login quando não há sessão', () => {
    renderGuarded()
    expect(screen.getByText('Tela de login')).toBeInTheDocument()
  })

  it('renderiza a rota protegida quando há sessão', () => {
    login(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password)
    renderGuarded()
    expect(screen.getByText('Área protegida')).toBeInTheDocument()
  })
})

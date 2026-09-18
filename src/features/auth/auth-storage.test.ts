import { beforeEach, describe, expect, it } from 'vitest'
import {
  DEMO_CREDENTIALS,
  isAuthenticated,
  login,
  logout,
} from './auth-storage'

beforeEach(() => {
  window.localStorage.clear()
})

describe('auth-storage', () => {
  it('não está autenticado por padrão', () => {
    expect(isAuthenticated()).toBe(false)
  })

  it('autentica com as credenciais de demonstração', () => {
    expect(login(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password)).toBe(
      true,
    )
    expect(isAuthenticated()).toBe(true)
  })

  it('aceita o e-mail com variação de caixa e espaços', () => {
    expect(
      login(`  ${DEMO_CREDENTIALS.email.toUpperCase()}  `, DEMO_CREDENTIALS.password),
    ).toBe(true)
  })

  it('rejeita credenciais incorretas e não autentica', () => {
    expect(login('outro@exemplo.com', 'senha-errada')).toBe(false)
    expect(isAuthenticated()).toBe(false)
  })

  it('logout encerra a sessão', () => {
    login(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password)
    logout()
    expect(isAuthenticated()).toBe(false)
  })
})

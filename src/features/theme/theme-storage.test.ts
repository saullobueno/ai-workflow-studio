import { beforeEach, describe, expect, it } from 'vitest'
import {
  applyTheme,
  getPreferredTheme,
  getStoredTheme,
  setStoredTheme,
} from './theme-storage'

beforeEach(() => {
  window.localStorage.clear()
  document.documentElement.classList.remove('dark')
})

describe('theme-storage', () => {
  it('não há tema persistido por padrão', () => {
    expect(getStoredTheme()).toBeUndefined()
  })

  it('persiste e lê o tema escolhido', () => {
    setStoredTheme('dark')
    expect(getStoredTheme()).toBe('dark')
  })

  it('cai para o tema claro do sistema quando não há preferência salva (jsdom não tem matchMedia)', () => {
    expect(getPreferredTheme()).toBe('light')
  })

  it('aplica a classe "dark" no elemento raiz', () => {
    applyTheme('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    applyTheme('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})

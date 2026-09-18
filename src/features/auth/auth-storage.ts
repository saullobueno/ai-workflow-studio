import { readFromStorage, removeFromStorage, writeToStorage } from '@/core/storage'
import { authSessionSchema } from '@/schemas/auth'

const SESSION_KEY = 'auth:session'

/**
 * Credenciais fixas de demonstração — este projeto não tem backend de
 * autenticação (é um portfólio, sem dados reais). O login existe só para
 * demonstrar o fluxo de tela; por isso as credenciais ficam visíveis no
 * próprio card de login, já preenchidas.
 */
export const DEMO_CREDENTIALS = {
  email: 'demo@ai-workflow.studio',
  password: 'demo1234',
}

export function isAuthenticated(): boolean {
  return readFromStorage(SESSION_KEY, authSessionSchema) !== undefined
}

export function login(email: string, password: string): boolean {
  const matches =
    email.trim().toLowerCase() === DEMO_CREDENTIALS.email &&
    password === DEMO_CREDENTIALS.password
  if (!matches) return false

  writeToStorage(SESSION_KEY, { email: DEMO_CREDENTIALS.email })
  return true
}

export function logout(): void {
  removeFromStorage(SESSION_KEY)
}

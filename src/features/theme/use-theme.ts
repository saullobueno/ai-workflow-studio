import { useSyncExternalStore } from 'react'
import type { Theme } from '@/schemas/theme'
import { applyTheme, getPreferredTheme, setStoredTheme } from './theme-storage'

/**
 * Estado do tema é compartilhado entre todos os componentes que chamam
 * `useTheme()` (ex.: o toggle no header e o canvas do React Flow, que
 * precisa saber o tema atual pra aplicar a classe "dark" que o próprio
 * @xyflow/react exige pro seu tema escuro nativo) — por isso vive num
 * módulo, não num `useState` local por componente.
 */
let currentTheme: Theme = getPreferredTheme()
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  return currentTheme
}

function setTheme(next: Theme) {
  currentTheme = next
  applyTheme(next)
  setStoredTheme(next)
  listeners.forEach((listener) => {
    listener()
  })
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot)

  function toggleTheme() {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return { theme, toggleTheme }
}

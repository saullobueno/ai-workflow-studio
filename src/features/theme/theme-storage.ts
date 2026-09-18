import { readFromStorage, writeToStorage } from '@/core/storage'
import { themeSchema, type Theme } from '@/schemas/theme'

const THEME_KEY = 'theme'

export function getStoredTheme(): Theme | undefined {
  return readFromStorage(THEME_KEY, themeSchema)
}

export function setStoredTheme(theme: Theme): void {
  writeToStorage(THEME_KEY, theme)
}

function getSystemTheme(): Theme {
  const prefersDark = window.matchMedia(
    '(prefers-color-scheme: dark)',
  ).matches
  return prefersDark ? 'dark' : 'light'
}

/** Tema persistido, ou o tema do sistema operacional se o usuário nunca escolheu um. */
export function getPreferredTheme(): Theme {
  return getStoredTheme() ?? getSystemTheme()
}

export function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

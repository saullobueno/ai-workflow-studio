import { z } from 'zod'

/**
 * Única porta de acesso a `localStorage` do app. Nenhum outro módulo deve
 * tocar em `window.localStorage` diretamente (regra de segurança do
 * projeto) — isso mantém a serialização, o versionamento de schema e o
 * tratamento de erro (quota excedida, JSON corrompido, modo privado sem
 * storage) centralizados em um só lugar.
 */

const STORAGE_PREFIX = 'ai-workflow-studio'

function buildKey(key: string): string {
  return `${STORAGE_PREFIX}:${key}`
}

function isStorageAvailable(): boolean {
  try {
    const probeKey = buildKey('__probe__')
    window.localStorage.setItem(probeKey, '1')
    window.localStorage.removeItem(probeKey)
    return true
  } catch {
    return false
  }
}

export function readFromStorage<T>(
  key: string,
  schema: z.ZodType<T>,
): T | undefined {
  if (!isStorageAvailable()) return undefined

  const raw = window.localStorage.getItem(buildKey(key))
  if (raw === null) return undefined

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return undefined
  }

  const result = schema.safeParse(parsed)
  return result.success ? result.data : undefined
}

export function writeToStorage(key: string, value: unknown): boolean {
  if (!isStorageAvailable()) return false

  try {
    window.localStorage.setItem(buildKey(key), JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeFromStorage(key: string): void {
  if (!isStorageAvailable()) return
  window.localStorage.removeItem(buildKey(key))
}

/** Lista as chaves lógicas (sem o prefixo) já usadas por este app no storage. */
export function listStorageKeys(): string[] {
  if (!isStorageAvailable()) return []

  const keys: string[] = []
  for (let i = 0; i < window.localStorage.length; i++) {
    const rawKey = window.localStorage.key(i)
    if (rawKey?.startsWith(`${STORAGE_PREFIX}:`)) {
      keys.push(rawKey.slice(STORAGE_PREFIX.length + 1))
    }
  }
  return keys
}

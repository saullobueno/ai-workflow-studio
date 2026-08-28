import { z } from 'zod'

/**
 * Única porta de saída para chamadas de rede do app (regra do projeto:
 * nenhuma outra parte do código chama `fetch` diretamente). Hoje só existe
 * um endpoint (`/api/copilot`), mas centralizar aqui evita espalhar
 * tratamento de erro/timeout/parsing por várias features.
 */

export class HttpError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}

const DEFAULT_TIMEOUT_MS = 30_000

interface PostJsonOptions {
  timeoutMs?: number
  signal?: AbortSignal
}

export async function postJson<TResponse>(
  path: string,
  body: unknown,
  responseSchema: z.ZodType<TResponse>,
  options: PostJsonOptions = {},
): Promise<TResponse> {
  const controller = new AbortController()
  const timeout = setTimeout(() => {
    controller.abort()
  }, options.timeoutMs ?? DEFAULT_TIMEOUT_MS)

  if (options.signal) {
    options.signal.addEventListener('abort', () => {
      controller.abort()
    })
  }

  let response: Response
  try {
    response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
  } catch (error) {
    const isAbort =
      typeof error === 'object' &&
      error !== null &&
      'name' in error &&
      error.name === 'AbortError'
    if (isAbort) {
      throw new HttpError('A requisição demorou demais e foi cancelada.', 0)
    }
    throw new HttpError('Não foi possível conectar ao servidor.', 0)
  } finally {
    clearTimeout(timeout)
  }

  const rawBody: unknown = await response.json().catch(() => undefined)

  if (!response.ok) {
    const detail =
      typeof rawBody === 'object' &&
      rawBody !== null &&
      'error' in rawBody &&
      typeof rawBody.error === 'object' &&
      rawBody.error !== null &&
      'detail' in rawBody.error &&
      typeof rawBody.error.detail === 'string'
        ? rawBody.error.detail
        : `Erro inesperado do servidor (HTTP ${String(response.status)}).`
    throw new HttpError(detail, response.status)
  }

  const parsed = responseSchema.safeParse(rawBody)
  if (!parsed.success) {
    throw new HttpError(
      'A resposta do servidor não teve o formato esperado.',
      response.status,
    )
  }

  return parsed.data
}

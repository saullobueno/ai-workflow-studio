import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { HttpError, postJson } from './http-client'

const responseSchema = z.object({ value: z.string() })

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('postJson', () => {
  it('retorna os dados validados quando a resposta é 2xx e bate com o schema', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse(200, { value: 'ok' }))

    const result = await postJson(
      '/api/copilot',
      { prompt: 'x' },
      responseSchema,
    )

    expect(result).toEqual({ value: 'ok' })
  })

  it('lança HttpError com o detail do problem+json quando a resposta não é ok', async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(422, {
        error: { title: 'Inválido', detail: 'Prompt vazio' },
      }),
    )

    await expect(
      postJson('/api/copilot', { prompt: '' }, responseSchema),
    ).rejects.toMatchObject({ message: 'Prompt vazio', status: 422 })
  })

  it('lança HttpError genérico quando a resposta de erro não tem o formato problem+json', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse(500, { oops: true }))

    await expect(
      postJson('/api/copilot', { prompt: 'x' }, responseSchema),
    ).rejects.toBeInstanceOf(HttpError)
  })

  it('lança HttpError quando a resposta não bate com o schema esperado', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse(200, { value: 42 }))

    await expect(
      postJson('/api/copilot', { prompt: 'x' }, responseSchema),
    ).rejects.toThrow('formato esperado')
  })

  it('lança HttpError quando o fetch falha (rede indisponível)', async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError('Failed to fetch'))

    await expect(
      postJson('/api/copilot', { prompt: 'x' }, responseSchema),
    ).rejects.toThrow('Não foi possível conectar')
  })

  it('cancela e lança HttpError quando o tempo limite é excedido', async () => {
    vi.useFakeTimers()
    vi.mocked(fetch).mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(new DOMException('aborted', 'AbortError'))
          })
        }),
    )

    const promise = postJson('/api/copilot', { prompt: 'x' }, responseSchema, {
      timeoutMs: 1000,
    })
    const expectation = expect(promise).rejects.toThrow('demorou demais')
    await vi.advanceTimersByTimeAsync(1000)
    await expectation
  })
})

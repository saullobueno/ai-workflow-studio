import { generateText, NoOutputGeneratedError } from 'ai'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { buildVipTicketTemplate } from '@/features/workflows/starter-templates'
import {
  CopilotError,
  handleCopilotRequest,
  toCopilotErrorResponse,
} from './copilot-handler'

vi.mock('ai', async (importOriginal) => {
  const actual = await importOriginal<typeof import('ai')>()
  return { ...actual, generateText: vi.fn() }
})

const mockedGenerateText = vi.mocked(generateText)

function draftFromTemplate() {
  const {
    id: _id,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    ...draft
  } = buildVipTicketTemplate()
  return draft
}

beforeEach(() => {
  vi.stubEnv('GROQ_API_KEY', 'test-key')
  mockedGenerateText.mockReset()
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('handleCopilotRequest', () => {
  it('rejeita um prompt vazio antes de chamar o provedor de IA', async () => {
    await expect(handleCopilotRequest({ prompt: '' })).rejects.toMatchObject({
      status: 422,
    })
    expect(mockedGenerateText).not.toHaveBeenCalled()
  })

  it('retorna erro 503 quando GROQ_API_KEY não está configurada', async () => {
    vi.stubEnv('GROQ_API_KEY', '')

    await expect(
      handleCopilotRequest({ prompt: 'crie um workflow' }),
    ).rejects.toMatchObject({ status: 503 })
    expect(mockedGenerateText).not.toHaveBeenCalled()
  })

  it('retorna o workflow gerado quando a resposta da IA é válida', async () => {
    const draft = draftFromTemplate()
    // @ts-expect-error -- mock parcial, só o campo que o handler lê
    mockedGenerateText.mockResolvedValue({ output: draft })

    const result = await handleCopilotRequest({
      prompt: 'ticket vip com sentimento negativo',
    })

    expect(result.workflow.name).toBe(draft.name)
    expect(result.workflow.nodes).toHaveLength(draft.nodes.length)
  })

  it('retorna erro 502 quando o modelo não gera um output estruturado', async () => {
    mockedGenerateText.mockRejectedValue(
      new NoOutputGeneratedError({ message: 'sem output' }),
    )

    await expect(
      handleCopilotRequest({ prompt: 'crie um workflow' }),
    ).rejects.toMatchObject({ status: 502 })
  })

  it('retorna erro 502 quando a chamada ao provedor falha', async () => {
    mockedGenerateText.mockRejectedValue(new Error('network error'))

    await expect(
      handleCopilotRequest({ prompt: 'crie um workflow' }),
    ).rejects.toMatchObject({ status: 502 })
  })

  it('retorna erro 502 quando o objeto gerado não bate com o schema', async () => {
    // @ts-expect-error -- forçando um shape inválido de propósito
    mockedGenerateText.mockResolvedValue({ output: { nodes: 'not-an-array' } })

    await expect(
      handleCopilotRequest({ prompt: 'crie um workflow' }),
    ).rejects.toMatchObject({ status: 502 })
  })
})

describe('toCopilotErrorResponse', () => {
  it('mapeia um CopilotError para status e corpo problem+json', () => {
    const error = new CopilotError('Título', 'Detalhe', 422)
    const { status, body } = toCopilotErrorResponse(error)

    expect(status).toBe(422)
    expect(body).toEqual({ error: { title: 'Título', detail: 'Detalhe' } })
  })

  it('mapeia um erro desconhecido para 500 genérico', () => {
    const { status, body } = toCopilotErrorResponse(new Error('boom'))

    expect(status).toBe(500)
    expect(body.error.title).toBe('Erro inesperado')
  })
})

import { createGroq } from '@ai-sdk/groq'
import { generateText, NoOutputGeneratedError, Output } from 'ai'
// Import relativo (não o alias @/*) de propósito: este arquivo é
// compilado tanto pelo projeto da API (moduleResolution "bundler") quanto,
// transitivamente, pelo projeto Node do Vite dev plugin (moduleResolution
// "nodenext") — só o import relativo com extensão resolve nos dois.
import {
  copilotErrorResponseSchema,
  copilotRequestSchema,
  copilotResponseSchema,
  copilotWorkflowDraftSchema,
  type CopilotErrorResponse,
  type CopilotResponse,
} from '../schemas/copilot.js'

// llama-3.3-70b-versatile foi descontinuado pela Groq (ver ADR 0008).
const GROQ_MODEL = 'openai/gpt-oss-120b'

export class CopilotError extends Error {
  status: number
  title: string

  constructor(title: string, detail: string, status: number) {
    super(detail)
    this.name = 'CopilotError'
    this.title = title
    this.status = status
  }
}

const SYSTEM_PROMPT = `Você transforma uma descrição em linguagem natural em um workflow estruturado para o "AI Workflow Studio", um editor visual de automações no estilo n8n.

Gere um objeto com "name", "description", "variables", "nodes" e "edges".

Tipos de node (o campo "type" do node e "data.kind" devem ser sempre o mesmo valor):
- "trigger": inicia o workflow. "data.fields" é a lista de campos que o evento carrega (ex.: subject, sentiment, customerTier) — cada um vira uma variável disponível como {{nome}} nos nodes seguintes.
- "ai-classify": classifica um texto em uma das "data.categories". O resultado fica disponível como {{data.outputVariable}}.
- "condition": compara "data.fieldTemplate" com "data.value" usando "data.operator" (equals | not-equals | contains). As edges que saem desse node PRECISAM ter "sourceHandle" igual a "true" (caminho quando a condição é verdadeira) ou "false" (caminho quando é falsa) — nunca deixe em branco.
- "loop": repete o próximo node para cada item de "data.listTemplate" (uma lista separada por vírgula). "data.itemVariable" é o nome usado para cada item, ex.: {{item}}.
- "action": "data.actionKind" é "slack" (channel, message), "email" (to, subject, body) ou "create-task" (title, assignee, priority).

Regras gerais:
- Todo texto de configuração (message, subject, body, fieldTemplate, value, title, assignee etc.) pode referenciar variáveis com a sintaxe {{nomeDaVariavel}} — campos do trigger, o resultado de um ai-classify, ou uma variável do workflow.
- Cada node tem um "id" curto e único (ex.: "n1", "n2"). As edges referenciam esses ids em "source"/"target". Cada edge também precisa de um "id" único (ex.: "e1").
- "position.x"/"position.y": distribua os nodes de cima para baixo (y crescente a cada nível); quando houver ramificação (condition), afaste os dois lados no eixo x (ex.: -180 e 180 a partir do node pai).
- O workflow sempre começa com exatamente um node "trigger".
- Escreva labels e mensagens em português do Brasil.
- Isto é sempre uma simulação — não existe integração real por trás. Não invente credenciais, URLs ou nomes de sistemas externos específicos além do que a descrição do usuário pedir.`

export async function handleCopilotRequest(
  body: unknown,
): Promise<CopilotResponse> {
  const parsedRequest = copilotRequestSchema.safeParse(body)
  if (!parsedRequest.success) {
    throw new CopilotError(
      'Prompt inválido',
      parsedRequest.error.issues[0]?.message ?? 'Descrição inválida.',
      422,
    )
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new CopilotError(
      'AI Copilot indisponível',
      'O servidor não tem uma GROQ_API_KEY configurada. Veja o README para obter uma chave gratuita.',
      503,
    )
  }

  const groq = createGroq({ apiKey })

  let generated: unknown
  try {
    const result = await generateText({
      model: groq(GROQ_MODEL),
      system: SYSTEM_PROMPT,
      prompt: parsedRequest.data.prompt,
      output: Output.object({ schema: copilotWorkflowDraftSchema }),
      // strictJsonSchema:false é necessário porque nosso schema tem campos
      // opcionais/com default (ex.: edges[].label, trigger.fields) — no modo
      // estrito da Groq (OpenAI-compatible), TODO campo do JSON Schema
      // precisa estar em `required`, inclusive os opcionais. Sem isso a
      // chamada falha com 400 antes mesmo de gerar qualquer coisa. Ver ADR 0008.
      providerOptions: { groq: { strictJsonSchema: false } },
    })
    generated = { workflow: result.output }
  } catch (error) {
    // Só sai no log do servidor, nunca na resposta ao cliente — ajuda a
    // diagnosticar falhas reais do provedor (ex.: modelo descontinuado,
    // JSON Schema rejeitado) sem precisar reproduzir o erro às cegas.
    console.error('[copilot-handler] erro na chamada ao provedor de IA:', error)
    if (error instanceof NoOutputGeneratedError) {
      throw new CopilotError(
        'Não foi possível gerar o workflow',
        'O modelo não retornou um resultado estruturado válido. Tente descrever o workflow de outra forma.',
        502,
      )
    }
    throw new CopilotError(
      'Erro ao chamar o provedor de IA',
      'Não foi possível completar a geração do workflow agora. Tente novamente em instantes.',
      502,
    )
  }

  const parsedResponse = copilotResponseSchema.safeParse(generated)
  if (!parsedResponse.success) {
    throw new CopilotError(
      'Resposta da IA em formato inesperado',
      'O modelo gerou um resultado que não corresponde ao formato esperado de workflow.',
      502,
    )
  }

  return parsedResponse.data
}

export function toCopilotErrorResponse(error: unknown): {
  status: number
  body: CopilotErrorResponse
} {
  if (error instanceof CopilotError) {
    return {
      status: error.status,
      body: copilotErrorResponseSchema.parse({
        error: { title: error.title, detail: error.message },
      }),
    }
  }
  return {
    status: 500,
    body: {
      error: {
        title: 'Erro inesperado',
        detail: 'Tente novamente em instantes.',
      },
    },
  }
}

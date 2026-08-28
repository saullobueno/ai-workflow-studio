# 0007 — AI Copilot: geração estruturada, modelo e arquitetura do endpoint

**Data:** 2026-08-28

## Contexto

O AI Copilot (texto em linguagem natural → workflow estruturado) é a única chamada de IA real do produto (a "classificação" dentro da execução simulada é só heurística — ver ADR [0006](./0006-motor-de-execucao-simulada.md)). Algumas decisões de implementação não vieram do briefing.

## Decisões

1. **`generateText` + `Output.object({ schema })` em vez de `generateObject`.** A versão instalada do Vercel AI SDK (`ai@7.0.83`) marca `generateObject` como `@deprecated` (a mensagem do próprio pacote aponta para `generateText` com a opção `output`). Usamos a API não depreciada desde o início em vez de construir sobre algo já sinalizado para remoção.

2. **Modelo: `llama-3.3-70b-versatile` via Groq.** Entre os modelos gratuitos disponíveis no provedor (ADR [0004](./0004-provedor-ia-gratuito.md)), é o que tem melhor equilíbrio entre qualidade de instruction-following (necessário para respeitar o schema com campos semânticos como `sourceHandle: "true"/"false"`) e velocidade.

3. **Schema de persistência (permissivo) é o mesmo schema usado para validar a saída do LLM** (`copilotWorkflowDraftSchema` = `workflowSchema` sem id/timestamps). Isso significa que a validação da resposta da IA não é tão estrita quanto poderia ser (ex.: aceita `label` vazio) — um trade-off deliberado para não duplicar uma árvore de schemas só para esse caso. Se o modelo devolver um node com campo vazio, o usuário vê isso no formulário do node (e o motor de execução sinaliza no log, se tentar rodar).

4. **Toda a lógica fica em `src/server/copilot-handler.ts`, framework-agnostic**, com dois adaptadores finos: `api/copilot.ts` (Vercel Function real, req/res do Node) e `vite.dev-api-plugin.ts` (middleware do Vite dev server). Isso evita duplicar a integração com o provedor de IA e o tratamento de erro entre os dois ambientes — só a "casca" HTTP muda. Ver ADR [0001](./0001-arquitetura-spa-serverless.md).

5. **Erros são uma única classe (`CopilotError`) carregando seu próprio status HTTP e título**, em vez de subclasses por tipo de erro. Mais simples de mapear para `problem+json` (`toCopilotErrorResponse`) e suficiente para os 3 casos reais (prompt inválido → 422, chave não configurada → 503, provedor falhou/saída malformada → 502).

6. **`src/server/` fica fora do projeto TypeScript do browser** (`tsconfig.app.json` exclui `src/server`; `tsconfig.api.json` o inclui junto com `api/`) — evita que globals de Node (`process.env`) vazem para o autocomplete/typecheck do código de frontend. Isso exigiu ajustar alguns imports internos de `src/schemas/*.ts` para usar caminho relativo com extensão `.js` explícita (em vez do alias `@/*`), porque esses arquivos acabam sendo compilados tanto pelo projeto do browser (`moduleResolution: "bundler"`) quanto, transitivamente, pelo projeto Node do Vite (`moduleResolution: "nodenext"`, que exige extensão explícita em imports relativos) — só o import relativo com `.js` resolve nos dois.

## Consequências

- Sem uma `GROQ_API_KEY` configurada, o AI Copilot retorna 503 com uma mensagem clara; o resto do produto (canvas, execução simulada, histórico) continua funcionando normalmente.
- Testes (`copilot-handler.test.ts`) mockam `generateText` do pacote `ai` — nunca fazem uma chamada de rede real, então rodam sem chave de API e sem gastar cota gratuita do Groq.

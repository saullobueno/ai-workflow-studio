# 0008 — AI Copilot: duas correções descobertas só com uma chave real

**Data:** 2026-08-28

## Contexto

Até agora o AI Copilot só tinha sido testado com `generateText` mockado (`copilot-handler.test.ts`) — nunca com uma `GROQ_API_KEY` de verdade, porque não existia uma disponível durante a Fase 3. Assim que o usuário configurou uma chave real e testou pela interface, duas falhas reais apareceram, nenhuma delas visível nos testes mockados nem detectável sem uma chamada de rede de verdade.

## Falha 1 — `.env` não chegava ao `process.env` do dev server

**Sintoma:** erro 503 "GROQ_API_KEY não configurada" mesmo com o `.env` preenchido.

**Causa:** Vite só injeta variáveis prefixadas com `VITE_` no bundle do cliente (`import.meta.env`) — nunca carrega o `.env` em `process.env` do processo Node que roda o próprio Vite. `vite.dev-api-plugin.ts` (e, por baixo, `copilot-handler.ts`) lê `process.env.GROQ_API_KEY` diretamente, então a chave nunca "aparecia" ali.

**Correção:** `vite.config.ts` agora usa `loadEnv(mode, process.cwd(), '')` do próprio Vite e faz `Object.assign(process.env, ...)` antes de montar a configuração. Em produção (Vercel) isso não é necessário — a plataforma já injeta as env vars do dashboard direto em `process.env` do runtime da function.

## Falha 2 — modelo descontinuado + modo estrito de JSON Schema

**Sintoma:** depois de corrigir a Falha 1, a chamada real ainda falhava com 502.

**Causa raiz 1:** `llama-3.3-70b-versatile` (o modelo escolhido na ADR 0007) foi descontinuado pela Groq — `/openai/v1/models` não lista mais esse id. Trocado para `openai/gpt-oss-120b`, que está ativo e lida bem com geração estruturada complexa (testado com o schema completo do workflow, não só um exemplo trivial).

**Causa raiz 2, mais sutil:** mesmo depois de trocar o modelo, a chamada falhava com `invalid JSON schema for response_format` — a Groq (seguindo a convenção "structured outputs" da OpenAI) exige que **todo** campo apareça no array `required` do JSON Schema, inclusive os opcionais (que precisariam virar `required + nullable` em vez de simplesmente omitidos). Nosso schema (`copilotWorkflowDraftSchema`, derivado de `workflowSchema`) tem vários campos `.optional()`/`.default()` (`edges[].label`, `trigger.fields`, etc.) — corretos para o resto do app (schemas permissivos por design, ver `src/schemas/node.ts`), mas incompatíveis com o modo estrito da Groq.

**Correção:** `providerOptions: { groq: { strictJsonSchema: false } }` na chamada de `generateText`. Antes de chegar nessa solução, tentamos reescrever uma variante "estrita" do schema (campos opcionais virando `required + nullable`) — funcionou para o primeiro campo que travava (`edges`) mas o mesmo erro reapareceria campo por campo (`trigger.fields`, depois o próximo, etc.), porque o problema não era um campo específico, era o modo estrito em si. Desligar `strictJsonSchema` resolveu de uma vez, sem precisar duplicar a árvore de schemas.

## Consequências

- **Testes mockados não pegam esse tipo de falha.** `copilot-handler.test.ts` mocka `generateText` inteiro, então nunca exercitou a validação real de JSON Schema da Groq nem a disponibilidade do modelo. Isso é aceitável (não dá pra gastar cota de API em CI), mas significa que qualquer mudança em `copilotWorkflowDraftSchema`, no modelo, ou nas opções do provider precisa ser validada manualmente com uma chave real antes de ser considerada "funcionando" — os testes automatizados garantem que o _código_ está certo, não que a _integração_ com a Groq continua compatível.
- Se a Groq descontinuar `openai/gpt-oss-120b` no futuro, o sintoma será o mesmo da Falha 2 (erro 404/`model_not_found`) — checar `GET https://api.groq.com/openai/v1/models` com a chave real antes de trocar de modelo às cegas.
- `console.error` foi adicionado ao `catch` de `copilot-handler.ts` (só loga no servidor, nunca na resposta ao cliente) — sem isso, o erro real da Groq ficava invisível atrás da mensagem genérica "Erro ao chamar o provedor de IA", o que tornou esse diagnóstico bem mais lento do que precisava ser.

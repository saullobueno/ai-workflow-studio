---
name: copilot-prompt-and-schema
description: Use ao editar o system prompt do AI Copilot, o schema de saída que a IA precisa preencher, ou ao trocar o modelo/provedor usado em src/server/copilot-handler.ts. A geração estruturada aqui depende de o prompt e o schema Zod contarem a mesma história — mudar um sem o outro quebra a geração de forma silenciosa (o modelo produz um workflow inválido ou incoerente).
---

# Editando o AI Copilot (prompt, schema, modelo)

O AI Copilot transforma uma frase em português num `Workflow` estruturado via `generateText` + `Output.object({ schema })` do Vercel AI SDK (`src/server/copilot-handler.ts`). O schema (`copilotWorkflowDraftSchema`, em `src/schemas/copilot.ts`) garante a **forma** da resposta; o `SYSTEM_PROMPT` é quem ensina a **semântica** que o schema sozinho não consegue expressar.

## Por que não basta o schema

Zod consegue forçar "todo node tem um `id` string" e "`operator` é `'equals' | 'not-equals' | 'contains'`", mas não consegue forçar relações entre campos como:

- edges que saem de um node `condition` precisam ter `sourceHandle: "true"` ou `"false"` (não vazio, não outro valor) para o motor de execução saber qual branch seguir;
- `id`s de node/edge precisam ser consistentes entre si (uma edge referenciando um `source`/`target` que não existe em `nodes` gera um workflow "quebrado" silenciosamente — o motor de execução (`engine.ts`) simplesmente não encontra o node e para ali);
- todo workflow gerado precisa começar com exatamente um node `trigger` (o motor de execução procura o primeiro e ignora o resto se houver mais de um).

Essas regras vivem só no `SYSTEM_PROMPT`. Se você adicionar um node kind novo (ver skill `adding-node-type`) ou mudar o significado de um campo existente, **o prompt precisa ser atualizado junto** — o schema vai continuar validando (ele é propositalmente permissivo, ver `docs/decisions`), mas o resultado vai ficar semanticamente errado sem avisar.

## Ao adicionar um node/action kind novo ao Copilot

1. Depois de seguir o checklist da skill `adding-node-type`, adicione um parágrafo no `SYSTEM_PROMPT` (`copilot-handler.ts`) descrevendo o novo `kind`/`actionKind` no mesmo formato dos existentes: o que ele faz, quais campos tem, e qualquer regra de referência cruzada (tipo o `sourceHandle` do `condition`).
2. Rode manualmente (com uma `GROQ_API_KEY` de verdade) alguns prompts de teste cobrindo o node novo e inspecione o JSON gerado — não existe teste automatizado que verifique a **qualidade semântica** da geração real (os testes em `copilot-handler.test.ts` mockam `generateText`, então não pegam esse tipo de regressão).

## Trocando o modelo (`GROQ_MODEL`)

Antes de trocar, confirme no registry/documentação do provedor que o modelo suporta saída estruturada (tool calling ou JSON mode) com qualidade suficiente para respeitar um schema com ~7 variantes de node — modelos pequenos tendem a "esquecer" regras do prompt em prompts longos como este. Veja ADR 0007 para o porquê de `llama-3.3-70b-versatile` ter sido escolhido.

## Erros e status HTTP

Todo erro de negócio (prompt inválido, chave ausente, provedor falhou, saída fora do schema) deve continuar passando por `CopilotError` (`title`, `detail`, `status`) e `toCopilotErrorResponse` — é o que garante que `api/copilot.ts` (produção) e `vite.dev-api-plugin.ts` (dev local) respondem com o mesmo formato `problem+json`. Não lance um `Error` genérico direto de dentro de `handleCopilotRequest`.

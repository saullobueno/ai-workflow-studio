---
description: Implementa uma feature já planejada, seguindo as convenções do projeto e rodando os gates de qualidade no final
argument-hint: [descrição da feature ou referência ao plano]
---

Implemente: $ARGUMENTS

Regras deste projeto a seguir (não repita explicações genéricas, só aplique):

- Schemas de node/variável/workflow são permissivos com string vazia (ver `src/schemas/node.ts`) — nunca adicione `.min(1)` num campo de texto livre.
- Sem barrel exports — importe do caminho real do arquivo.
- `src/server/` fica fora do projeto TS do browser; imports de lá para `src/schemas/*` usam caminho relativo com `.js` explícito, não o alias `@/*`.
- Todo código com lógica não trivial ganha teste (Vitest, ou Playwright se for uma interação que jsdom não simula — canvas do React Flow, cmdk, drag and drop real).

Ao terminar a implementação:

1. Rode `npm run typecheck && npm run lint && npm run test` e cole a saída real — nunca afirme que passou sem ter rodado.
2. Se a mudança tocou arquitetura/domínio sem instrução explícita do usuário para aquele detalhe específico, registre uma ADR nova em `docs/decisions/`.
3. Se a mudança afeta `README.md`, a lista de scripts, ou a estrutura de pastas descrita em `CLAUDE.md`, atualize esses arquivos também (ou delegue ao agente `docs-maintainer`).
4. Rode `npm run build` para confirmar que o bundle continua saudável — se uma dependência nova pesada entrou, considere `lazy()` seguindo o padrão de `WorkflowEditorPage.tsx`/`router.tsx`.

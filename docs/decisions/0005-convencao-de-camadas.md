# 0005 — Convenção de pastas e camadas do frontend

**Data:** 2026-08-28

## Contexto

O prompt-base pede uma separação de camadas explícita (fundação, design system, features por domínio, rotas finas), mas deixa os nomes de pasta livres. Como o projeto tem vários agentes/sessões trabalhando nele ao longo do tempo, a convenção precisa estar escrita em algum lugar, não só implícita nos diretórios já criados.

## Decisão

```
src/
  core/utils.ts          fundação técnica: storage.ts (única porta para localStorage),
                          http-client.ts (única porta para fetch)
  lib/                    utilitário genérico e não coesivo o bastante para "core"
                          (hoje só cn(), de src/lib/utils.ts — convenção do shadcn/ui)
  schemas/                Zod: única fonte de verdade de validação + tipos do domínio.
                          Sem lógica de negócio além de defaults/derivações triviais
                          (ex.: toWorkflowSummary). Importado tanto por src/ quanto por api/.
  design/ui/               primitivos shadcn/ui (Button, Input...) — sem regra de negócio.
  features/<dominio>/      uma pasta por domínio (workflows, workflow-editor, execution,
                          copilot, command-palette). Cada feature pode ter store,
                          repository, componentes e testes próprios.
  routes/                 componentes de rota finos: extraem params, fazem guard de
                          navegação (redirect quando não encontrado) e delegam para o
                          componente de página da feature. Nunca têm lógica de domínio.
  test/setup.ts           setup global do Vitest.
```

Regras de importação (reforçadas em revisão de código, não por lint de boundaries — ver limitação abaixo):

- `schemas/` não importa de `core/`, `features/` ou `design/` (é a camada mais de baixo nível).
- `core/` não importa de `features/` nem `design/`.
- `features/*` pode importar `core/`, `lib/`, `schemas/` e `design/ui/`, mas não de outra `features/*` a não ser que a dependência seja genuinamente de domínio (ex.: `workflow-editor` pode importar `workflows/workflow-repository`, já que edita workflows que a feature `workflows` persiste).
- `routes/` só importa componentes de página de `features/*`.

Sem re-exports "barril" (`index.ts` agregando exports de uma pasta inteira): cada módulo é importado pelo caminho real. Motivo: evita ciclos de import difíceis de rastrear e deixa a árvore de dependência explícita nos próprios imports.

## Consequências

- Não há hoje um plugin de ESLint de boundaries (`eslint-plugin-boundaries` ou similar) reforçando essas regras automaticamente — ficam documentadas aqui e checadas em revisão. Se o projeto crescer, vale revisitar.
- `api/copilot.ts` (Fase 3) importa `schemas/` via o alias `@/*` — está fora de `src/`, mas usa a mesma convenção de schemas como fonte única de verdade entre cliente e servidor (ver ADR [0001](./0001-arquitetura-spa-serverless.md)).

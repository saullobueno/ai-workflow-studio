# CLAUDE.md

Ponto de partida para agentes de código trabalhando neste repositório. **Leia o código real antes de editar** — este arquivo envelhece mais rápido que o código.

## O que é

AI Workflow Studio: editor visual de workflows de IA (estilo n8n/React Flow), projeto de portfólio. Não é um produto real — sem dados reais, sem integrações externas de verdade, sem serviço pago. Ver `README.md` para a visão geral e `docs/decisions/` para o histórico de decisões de arquitetura.

## Stack

React 19 + TypeScript (modo estrito) + Vite · React Flow (`@xyflow/react`) · Zustand + `zundo` · TanStack Query · Zod · Tailwind v4 + shadcn/ui (Radix) · Monaco Editor · ECharts · Vercel AI SDK + Groq · Vitest + Testing Library · Playwright.

Arquitetura: SPA servida como estático + uma função serverless (`api/copilot.ts`, padrão Vercel) para o único ponto que precisa de uma chave de API (o AI Copilot). Sem banco de dados — tudo em `localStorage`. Execução de workflow é sempre simulada.

## Estrutura

```
api/copilot.ts          Vercel Function real (adapter fino sobre src/server)
src/server/              lógica do AI Copilot, framework-agnostic — FORA do
                          projeto TS do browser (ver tsconfig.api.json)
src/core/                 fundação: storage.ts (única porta pro localStorage),
                          http-client.ts (única porta pro fetch)
src/lib/utils.ts          cn() — utilitário genérico (convenção shadcn/ui)
src/schemas/               Zod: fonte única de validação/tipos do domínio,
                          compartilhada entre src/ e api/ via @/schemas/*
src/design/ui/             primitivos shadcn/ui, sem regra de negócio
src/features/<domínio>/    workflows, workflow-editor, execution, copilot —
                          cada uma com seus próprios componentes/store/testes
src/routes/                componentes de rota finos (guard + delegação)
vite.dev-api-plugin.ts    reproduz api/copilot.ts como middleware do Vite dev
                          server, pra `npm run dev` funcionar sem CLI da Vercel
e2e/                       Playwright — interações que jsdom não simula bem
                          (canvas do React Flow, cmdk, drag and drop)
docs/decisions/           uma ADR por decisão de arquitetura/domínio não
                          especificada explicitamente pelo usuário
```

Convenção completa de camadas e regras de import: [`docs/decisions/0005-convencao-de-camadas.md`](./docs/decisions/0005-convencao-de-camadas.md).

## Comandos

| Comando                                         | O que faz                                                              |
| ----------------------------------------------- | ---------------------------------------------------------------------- |
| `npm run dev`                                   | Servidor de dev (Vite + `/api/copilot` via middleware)                 |
| `npm run build`                                 | Typecheck + build de produção                                          |
| `npm run lint` / `lint:fix`                     | ESLint                                                                 |
| `npm run format` / `format:check`               | Prettier                                                               |
| `npm run typecheck`                             | `tsc -b --noEmit` (3 projetos: app, node, api)                         |
| `npm run test` / `test:watch` / `test:coverage` | Vitest                                                                 |
| `npm run test:e2e`                              | Playwright (precisa `npx playwright install chromium` na primeira vez) |

**Sempre rode `typecheck` + `lint` + `test` antes de considerar uma mudança pronta.** Nunca afirme que um comando passou sem tê-lo executado de fato.

## Convenções específicas deste repo

- **Schemas de node/variável/workflow são permissivos com string vazia** (sem `.min(1)` em campos de texto livre) — autosave grava a cada tecla digitada, e um schema estrito rejeitaria o estado intermediário no próximo load. "Pronto pra rodar" é responsabilidade do motor de execução (`src/features/execution/engine.ts`), não do schema. Ver comentário em `src/schemas/node.ts`.
- **Sem barrel exports** (`index.ts` reexportando uma pasta inteira). Importe do caminho real.
- **`src/server/` nunca importa via alias `@/*` de arquivos que também são usados pelo projeto Node do Vite** (`vite.dev-api-plugin.ts`) — use import relativo com extensão `.js` explícita nesses casos. Ver ADR [0007](./docs/decisions/0007-ai-copilot.md) para o porquê.
- **Testes de canvas/drag**: `userEvent.click()` num node do React Flow quebra em jsdom (o d3-drag do `@xyflow/react` lança em cima da sequência completa de eventos de mouse). Use `fireEvent.click()` para esses casos, ou teste a interação real no E2E.
- **jsdom precisa de mocks globais** em `src/test/setup.ts` para `ResizeObserver` (React Flow) e `scrollIntoView` (cmdk) — se um teste novo quebrar com "X is not a function/not defined", provavelmente falta um mock aí, não um bug no componente.
- Nunca adicione uma dependência ao `package.json` sem checar a versão atual no registry (não resolva de memória) — ver ADR [0002](./docs/decisions/0002-versoes-toolchain.md) para um caso real onde a versão "latest" não era compatível com o resto da toolchain.

## Workspace de agente

- **Subagents** (`.claude/agents/`): `architecture-reviewer`, `security-reviewer`, `performance-reviewer`, `test-engineer`, `accessibility-reviewer`, `code-reviewer`, `docs-maintainer` — cada um com checklist específico deste repositório, não genérico.
- **Skills** (`.claude/skills/`): `adding-node-type` (checklist dos 5 lugares que mudam juntos ao criar um node/action kind novo), `canvas-testing-patterns` (workarounds de jsdom já descobertos), `copilot-prompt-and-schema` (como editar o AI Copilot sem quebrar a geração estruturada).
- **Commands** (`.claude/commands/`): `/plan-feature`, `/implement-feature`, `/security-audit`, `/performance-audit`, `/test-plan`, `/update-docs`, `/architecture-check`, `/consistency-check`.
- **Hooks** (`.claude/settings.json` + `.claude/hooks/*.js`): bloqueiam comandos destrutivos (`rm -rf`, `git push --force`, `git reset --hard`) e escrita de segredo real fora do `.env`; sugerem (nunca rodam sozinhos) `typecheck`/`lint` depois de editar um `.ts`/`.tsx` em `src/` ou `api/`.
- **MCP** (`.mcp.json`): Context7 (docs de bibliotecas atualizadas) e GitHub (precisa de `GITHUB_PERSONAL_ACCESS_TOKEN` no ambiente — nunca no arquivo). Nenhum dos dois é necessário pra instalar/rodar/testar/buildar o projeto.

## Antes de editar

1. Leia o ADR relevante em `docs/decisions/` se a mudança tocar arquitetura, schema ou uma decisão já documentada.
2. Rode a suíte de qualidade completa depois de qualquer mudança (`npm run typecheck && npm run lint && npm run test`).
3. Se a mudança for de arquitetura ou domínio e não veio de uma instrução explícita do usuário, registre uma nova ADR em `docs/decisions/` (formato: `NNNN-titulo-curto.md`, seguindo os existentes).

# AI Workflow Studio

Editor visual para construir workflows de IA (gatilhos → classificação → condições → ações), inspirado em n8n + React Flow + agentes de IA. Projeto de portfólio focado em demonstrar interfaces altamente interativas, estado complexo, drag & drop e integração de IA — não é um produto real, não há dados nem integrações de verdade por trás.

## Stack

- React 19 + TypeScript (modo estrito) + Vite
- [React Flow](https://reactflow.dev/) (`@xyflow/react`) para o canvas do editor
- Zustand + `zundo` (undo/redo) para o estado do editor
- TanStack Query para o estado assíncrono do AI Copilot
- Zod para todos os schemas (validação de formulário e do endpoint de IA)
- Tailwind CSS v4 + shadcn/ui (Radix UI)
- Monaco Editor (JSON Inspector) e ECharts (estatísticas de execução)
- Vercel AI SDK + Anthropic Claude (AI Copilot), rodando atrás de uma função serverless
- Vitest + Testing Library (unitário/integração) e Playwright (E2E)

Arquitetura: SPA (Vite) com uma única função serverless (`api/copilot.ts`, padrão Vercel) fazendo proxy da chamada ao provedor de IA — a chave de API nunca chega ao navegador. Não há banco de dados: workflows e histórico de execução ficam no `localStorage`, atrás de uma camada de abstração central. Execução de workflow é sempre simulada (sem integrações reais com Slack/e-mail/etc.).

Decisões de arquitetura e domínio que não vieram de uma especificação explícita estão documentadas em [`docs/decisions/`](./docs/decisions/).

## Pré-requisitos

- Node.js 24+
- Uma chave de API da Anthropic (opcional para rodar o editor; necessária só para usar o AI Copilot) — veja `.env.example`

## Como rodar

```bash
npm install
cp .env.example .env   # preencha ANTHROPIC_API_KEY se for usar o AI Copilot
npm run dev
```

## Scripts

| Comando                 | O que faz                                            |
| ----------------------- | ---------------------------------------------------- |
| `npm run dev`           | Servidor de desenvolvimento (Vite + proxy do `/api`) |
| `npm run build`         | Typecheck + build de produção                        |
| `npm run preview`       | Serve o build de produção localmente                 |
| `npm run lint`          | ESLint                                               |
| `npm run lint:fix`      | ESLint com autofix                                   |
| `npm run format`        | Prettier (escreve)                                   |
| `npm run format:check`  | Prettier (só verifica)                               |
| `npm run typecheck`     | `tsc` sem emitir arquivos                            |
| `npm run test`          | Testes unitários/integração (Vitest)                 |
| `npm run test:watch`    | Vitest em modo watch                                 |
| `npm run test:coverage` | Vitest com cobertura                                 |
| `npm run test:e2e`      | Testes end-to-end (Playwright)                       |

## Deploy

Alvo de deploy: [Vercel](https://vercel.com) — a SPA é servida como estático e `api/copilot.ts` roda como Vercel Function (runtime Node.js). Configure `ANTHROPIC_API_KEY` nas variáveis de ambiente do projeto na Vercel.

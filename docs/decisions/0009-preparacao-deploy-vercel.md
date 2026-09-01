# 0009 — Duas correções encontradas na preparação do deploy na Vercel

**Data:** 2026-09-01

## Contexto

Antes do primeiro deploy real na Vercel, revisamos `api/copilot.ts` (a Vercel
Function) e o roteamento client-side (`src/routes/router.tsx`, com
`react-router-dom` e uma rota dinâmica `workflows/:workflowId`) contra a
documentação atual da Vercel. Duas incompatibilidades foram encontradas —
nenhuma delas visível localmente (`npm run dev`, `npm run build`, typecheck,
testes), porque nenhuma reproduz o ambiente real da Vercel.

## Falha 1 — alias `@/*` não é suportado no runtime das Vercel Functions

**Sintoma em potencial:** a função `/api/copilot` falharia ao buildar ou ao
executar na Vercel (import não resolvido), mesmo com `npm run typecheck` e
`npm run build` passando localmente.

**Causa:** `api/copilot.ts` importava `handleCopilotRequest` de
`@/server/copilot-handler` usando o alias de path do tsconfig. Isso resolve
normalmente no `tsc` (que lê `paths` de `tsconfig.api.json`) e no dev local
(via Vite/`vite.dev-api-plugin.ts`), mas a documentação da Vercel
(`docs.vercel.com/docs/functions/runtimes/node-js`) afirma explicitamente
que o runtime Node.js para arquivos em `/api` **não suporta path mappings
nem project references** — cada function é compilada isoladamente.

**Correção:** trocado para import relativo com extensão `.js` explícita
(`../src/server/copilot-handler.js`), o mesmo padrão que
`vite.dev-api-plugin.ts` já usava e que o `CLAUDE.md` já documentava para
arquivos dentro de `src/server/` — a regra vale igualmente para o
consumidor em `api/`.

## Falha 2 — sem rewrite de SPA, rotas profundas dão 404 na Vercel

**Sintoma em potencial:** recarregar a página em `/workflows/<id>` (ou
compartilhar esse link direto) resultaria em 404 na Vercel — o servidor
estático da Vercel não faz fallback automático para `index.html` em rotas
desconhecidas, diferente do `npm run preview`/Vite dev, que sempre serve o
`index.html` para qualquer rota.

**Correção:** criado `vercel.json` com o rewrite catch-all documentado pela
própria Vercel para SPAs feitas com Vite (`"/(.*)" → "/index.html"`). A
Vercel prioriza arquivos estáticos e Vercel Functions existentes sobre
rewrites, então isso não interfere com `/api/copilot`.

## Consequência adicional

Sem um `engines.node` em `package.json`, a Vercel usaria o Node configurado
nas Project Settings do dashboard (que pode divergir do Node 24 que o resto
do projeto já assume — README, CI). Adicionado `"engines": { "node": "24.x" }`
para que a versão seja explícita no repositório, não implícita no dashboard.

## Consequências gerais

- Nenhum desses três problemas seria pego por `npm run build`, typecheck ou
  pelos testes — todos passam porque simulam um ambiente diferente do
  runtime real da Vercel para functions e do servidor estático dela para a
  SPA. O primeiro deploy real continua sendo o único jeito de validar isso
  de ponta a ponta (mesmo padrão já visto na ADR 0008, agora para a
  plataforma de deploy em vez do provedor de IA).
- Se um novo endpoint for adicionado em `api/`, ele deve seguir o mesmo
  padrão de import relativo — nunca `@/*` — por este mesmo motivo.

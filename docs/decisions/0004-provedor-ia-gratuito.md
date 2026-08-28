# 0004 — Groq no lugar de Anthropic Claude para o AI Copilot

**Data:** 2026-08-28

## Contexto

Na ADR [0001](./0001-arquitetura-spa-serverless.md) e nas perguntas iniciais, o provedor de LLM escolhido para o AI Copilot foi Anthropic Claude. O usuário depois esclareceu uma restrição que não tinha sido colocada antes: este é um projeto de portfólio que **não deve depender de nenhum serviço pago** — só serviços com tier gratuito real.

A API da Anthropic é paga por uso (sem tier gratuito permanente), então deixou de ser uma opção válida.

## Decisão

Trocar o provedor do AI Copilot para **Groq** (`@ai-sdk/groq`), que oferece uma API gratuita (sem cartão de crédito) rodando modelos open-weight (Llama etc.) com latência muito baixa — o que também favorece a UX de streaming do Copilot. Chave obtida em https://console.groq.com/keys.

A interface entre o front e o endpoint de IA já era isolada atrás de `api/copilot.ts` e de um módulo próprio de lógica (`src/server/copilot-handler.ts` — ver ADR sobre AI Copilot), então a troca de provedor não vaza para o resto do código: só o adapter do provedor muda.

## Consequências

- `.env.example` passa a pedir `GROQ_API_KEY` em vez de `ANTHROPIC_API_KEY`.
- O Vercel Functions (Hobby, gratuito) continua sendo o alvo de deploy — nenhum outro custo é introduzido.
- Groq tem limites de taxa no tier gratuito (variam por modelo). Isso é aceitável para uma demo de portfólio; documentado aqui para não ser confundido com omissão caso o Copilot retorne erro de rate limit sob uso intenso.
- Sem a chave configurada, o AI Copilot deve falhar de forma clara e tratada (nunca quebrar o editor) — o resto do produto (canvas, execução simulada, histórico) funciona inteiramente sem ela.

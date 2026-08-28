# 0001 — SPA Vite + função serverless isolada, sem banco de dados

**Data:** 2026-08-28

## Contexto

O produto é um editor visual de workflows (portfólio). Precisa de um AI Copilot que chama um LLM — e a chave de API desse provedor nunca pode ficar exposta no navegador. Ao mesmo tempo, o projeto não tem stakeholder real nem necessidade de persistência multi-dispositivo.

## Decisão

- Frontend: SPA React (Vite), sem framework fullstack (Next.js) e sem backend Node separado.
- Uma única função serverless (`api/copilot.ts`, padrão Vercel Functions runtime Node.js) faz proxy da chamada ao provedor de IA. É o único lugar do sistema com acesso à chave de API do provedor (ver ADR [0004](./0004-provedor-ia-gratuito.md) sobre a escolha do provedor gratuito).
- Sem banco de dados. Workflows e histórico de execução ficam em `localStorage`, atrás de uma camada de abstração central (regra do prompt-base, §9).
- Execução de workflow é sempre simulada — nenhuma integração real com Slack/e-mail/etc.
- Gerenciador de pacotes: npm (pnpm não está disponível no ambiente de desenvolvimento).

## Consequências

- Deploy-alvo é a Vercel (SPA estática + Vercel Function). Rodar `api/copilot.ts` localmente sem depender da CLI/login da Vercel exige um plugin de dev do Vite que monta a mesma lógica como middleware (ver ADR 0004).
- Não há autenticação de usuário nem múltiplos dispositivos — cada navegador tem seu próprio estado. Aceitável para portfólio; documentado aqui para não ser confundido com omissão.
- Se o projeto crescer para precisar de persistência real, a camada de storage já está isolada atrás de uma interface própria — trocar de local para remoto não deve exigir reescrever as features.

---
description: Revisão de consistência ponta a ponta — o que está implementado bate com o que está documentado em docs/decisions/ e no README?
---

Faça uma revisão de consistência ponta a ponta deste repositório:

1. Para cada ADR em `docs/decisions/`, confirme que a decisão descrita ainda reflete o código atual (ex.: a ADR 0004 diz que o provedor é Groq — confirme que `src/server/copilot-handler.ts` ainda usa Groq; a ADR 0001 diz que não há banco de dados — confirme que nada em `src/` chama uma API de banco).
2. Confirme que `README.md` → "Funcionalidades" e "Stack" batem com o que existe de verdade (rode `npm ls --depth=0` para comparar com o `package.json` real).
3. Confirme que `CLAUDE.md` → árvore de pastas bate com `src/` real.
4. Rode `npm run typecheck && npm run lint && npm run test && npm run build` — uma "revisão de consistência" que não termina com a suíte verde não é confiável.

Liste qualquer divergência encontrada como um achado concreto (arquivo + o que diverge), e diga explicitamente quando tudo está consistente — não invente achados para preencher espaço.

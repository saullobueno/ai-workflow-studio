---
description: Planeja uma feature nova para o AI Workflow Studio antes de implementar
argument-hint: [descrição breve da feature]
---

Planeje a implementação de: $ARGUMENTS

Antes de propor um plano:

1. Leia `CLAUDE.md` e os ADRs relevantes em `docs/decisions/` (especialmente 0005 sobre camadas, e qualquer ADR que já tenha decidido algo relacionado).
2. Se a feature tocar um node/action kind novo, releia a skill `adding-node-type` — ela lista os 5 lugares que precisam mudar juntos.
3. Identifique o que já existe e pode ser reusado (não proponha recriar `http-client.ts`, `storage.ts`, o padrão de `Field.tsx` nos formulários, etc.).
4. Se a feature envolver uma decisão de domínio, UX ou arquitetura que **não** foi especificada no pedido do usuário, pare e pergunte em vez de assumir — não invente regra de negócio.

Entregue um plano com: arquivos a criar/editar, ordem de implementação, e quais gates rodar no final (`npm run typecheck && npm run lint && npm run test`, mais `npm run test:e2e` se a feature envolver uma interação que jsdom não simula — ver skill `canvas-testing-patterns`). Não implemente ainda — use o modo de planejamento se disponível.

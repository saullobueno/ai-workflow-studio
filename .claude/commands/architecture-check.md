---
description: Verifica se o código atual respeita a convenção de camadas do projeto (docs/decisions/0005)
---

Use o agente `architecture-reviewer` para auditar o repositório inteiro (não só um diff) contra `docs/decisions/0005-convencao-de-camadas.md`: direção de dependência entre `core/`, `schemas/`, `design/`, `features/*` e `routes/`, ausência de barrel exports, e se todo node/action kind em `src/schemas/node.ts` tem os 4 lugares correspondentes completos (componente visual, formulário, entrada no motor de execução, metadados em `node-kinds.ts`).

Reporte violações concretas (arquivo + regra quebrada), não uma revisão de estilo genérica.

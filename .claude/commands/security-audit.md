---
description: Roda uma auditoria de segurança focada neste projeto (chave de API, storage, fetch, dependências)
---

Use o agente `security-reviewer` para auditar o estado atual do repositório (não só o diff em andamento — a árvore inteira, com foco em `api/copilot.ts`, `src/server/`, `src/core/storage.ts`, `src/core/http-client.ts`, e o `package.json`).

Depois do relatório do agente, rode `npm audit --omit=dev` e confirme que não há vulnerabilidade de produção sem uma ADR justificando por que foi aceita (ver `docs/decisions/0003-vulnerabilidades-dependencias-aceitas.md` como exemplo do formato esperado).

Reporte os achados priorizados por severidade real (o que um atacante conseguiria fazer), não uma lista genérica de checklist OWASP.

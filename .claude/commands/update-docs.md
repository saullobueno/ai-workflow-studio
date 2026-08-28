---
description: Sincroniza README.md, CLAUDE.md e docs/decisions/ com o estado real do código
---

Use o agente `docs-maintainer` para verificar se a documentação está sincronizada com o código atual:

- `README.md`: seção "Scripts" bate com `package.json`? Seção "Stack" reflete só dependências realmente usadas? Seção "Funcionalidades" reflete o que existe de verdade?
- `CLAUDE.md`: a árvore de pastas no topo ainda bate com a estrutura real de `src/`?
- `docs/decisions/`: alguma decisão de arquitetura/domínio recente ficou sem ADR?

Depois de qualquer correção, rode `npm run format:check` (a documentação também passa pelo Prettier neste projeto).

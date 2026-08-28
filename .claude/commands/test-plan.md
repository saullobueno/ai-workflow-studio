---
description: Planeja a cobertura de teste para uma mudança (o que vai em Vitest vs Playwright, e o que já existe de padrão a seguir)
argument-hint: [o que foi ou vai ser implementado]
---

Use o agente `test-engineer` para planejar (ou revisar) a cobertura de teste de: $ARGUMENTS

O agente já conhece as armadilhas específicas deste projeto (clique em node do canvas quebra com `userEvent` em jsdom, mocks necessários em `src/test/setup.ts`, etc. — ver skill `canvas-testing-patterns`). Peça um plano com:

- Quais casos vão em Vitest (lógica pura ou componente) vs Playwright (`e2e/`) — e por quê.
- Caminho feliz + pelo menos um caminho de erro para qualquer lógica não trivial.
- Se a mudança tocou o motor de execução (`src/features/execution/engine.ts`), confirme que o caso novo está coberto em `engine.test.ts` seguindo o padrão dos testes existentes (branch de condition, iteração de loop, campo obrigatório vazio).

Depois de escrever os testes, rode `npm run test` (e `npm run test:e2e` se aplicável) e cole a saída real.

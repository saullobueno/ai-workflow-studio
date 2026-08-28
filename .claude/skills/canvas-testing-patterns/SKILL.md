---
name: canvas-testing-patterns
description: Use ao escrever ou depurar um teste Vitest/Testing Library que renderiza o canvas do React Flow (@xyflow/react), a command palette (cmdk), ou qualquer Dialog do Radix neste projeto. jsdom não simula essas bibliotecas do jeito que `userEvent` espera — este skill documenta os workarounds já descobertos, para não redescobri-los a cada teste novo.
---

# Testando canvas, command palette e dialogs neste projeto

jsdom não é um browser real — não tem layout engine, não implementa `ResizeObserver`, `scrollIntoView`, nem processa a sequência completa de eventos de mouse do jeito que bibliotecas de drag esperam. Isto quebra três coisas específicas neste projeto.

## 1. Clicar num node do canvas quebra com `userEvent.click()`

`@xyflow/react` usa `d3-drag` internamente para tornar nodes arrastáveis. `userEvent.click()` simula a sequência completa `pointerdown → mousedown → mouseup → click`, e o listener de `mousedown` do d3-drag lança `TypeError: Cannot read properties of null (reading 'document')` em jsdom.

**Solução**: use `fireEvent.click(node)` (de `@testing-library/react`) para selecionar um node — ele dispara só o evento `click`, sem passar pelo `mousedown` que quebra. Formulários e botões normais (fora do canvas) continuam usando `userEvent` normalmente.

```ts
import { fireEvent, render, screen } from '@testing-library/react'

const node = await screen.findByText('Novo ticket de suporte')
fireEvent.click(node) // não use userEvent.click aqui
```

**Alternativa mais robusta para testar edição/exclusão de node**: monte `NodeConfigPanel` isolado, sem precisar do canvas nem do clique nele:

```ts
useWorkflowEditorStore.getState().loadWorkflow(createEmptyWorkflow('Teste'))
useWorkflowEditorStore.getState().addNode(buildTriggerNode())
render(<NodeConfigPanel nodeId="n1" onClose={vi.fn()} />)
```

Isso testa exatamente a mesma lógica de formulário/store com muito menos fragilidade — veja `NodeConfigPanel.test.tsx`.

## 2. `ResizeObserver is not defined` / `scrollIntoView is not a function`

Já mockados globalmente em `src/test/setup.ts` — não adicione o mock de novo no arquivo de teste. Se aparecer um erro parecido para outra API de DOM que jsdom não implementa (ex.: `IntersectionObserver`), o mock entra em `src/test/setup.ts`, não no teste individual.

Atenção ao mockar `ResizeObserver`: precisa ser uma `class`/`function` de verdade (React Flow faz `new ResizeObserver(...)`), não um `vi.fn(() => ({...}))` — isso falha com "not a constructor". O padrão usado:

```ts
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverMock
```

## 3. Gráficos ECharts não renderizam de verdade em jsdom

`ExecutionDurationChart` não desenha um `<canvas>` real em jsdom porque `clientWidth`/`clientHeight` do container ficam `0` (sem layout engine). Não teste a presença do `<canvas>` — teste o que está ao redor dele (legenda, texto condicional de "menos de 2 execuções"). A renderização visual de verdade só é verificável no E2E.

## 4. Import dinâmico lento na primeira resolução

Componentes carregados via `lazy()` (`ExecutionHistoryDialog`, que puxa ECharts + Monaco) podem demorar mais que os 5s padrão do Vitest para resolver na primeira vez, em máquinas mais lentas. O timeout global já foi ajustado (`testTimeout: 20000` em `vite.config.ts`); para um teste específico que ainda estoura isso, passe um timeout maior na própria query (`findByRole('dialog', {}, { timeout: 45000 })`) e no `it(...)` (terceiro argumento). Isso é lentidão de ambiente, não um bug — não tente "corrigir" reduzindo o que o teste espera.

## Quando desistir e usar Playwright

Se a interação depende de posição real na tela (drag and drop de verdade, não o fallback de clique), de medidas de layout reais, ou do comportamento real do navegador com atalhos de teclado — é candidato a E2E (`e2e/`), não a mais um workaround em jsdom. Veja `e2e/workflow-lifecycle.spec.ts` para os fluxos já cobertos lá (incluindo drag/seleção de node e Ctrl+K da command palette).

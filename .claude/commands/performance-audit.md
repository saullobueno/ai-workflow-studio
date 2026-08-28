---
description: Roda uma auditoria de performance de bundle e runtime neste projeto
---

Rode `npm run build` e use o agente `performance-reviewer` para analisar a saída (tamanho de cada chunk) contra o que é esperado:

- Rota do editor (`WorkflowEditorRoute`) carregada via `lazy` do react-router.
- `ExecutionHistoryDialog` (ECharts + Monaco) carregada via `lazy()`/`Suspense` só quando o histórico é aberto.
- ECharts importado via `echarts/core` + módulos específicos, nunca `echarts-for-react` puro.

Se algum chunk cresceu de forma inesperada, identifique a dependência responsável (`npm run build` já mostra o tamanho; se precisar investigar o que está dentro de um chunk, pode rodar o build com `--mode development` ou inspecionar os imports do arquivo que cresceu).

Reporte números concretos (tamanho antes/depois, ou tamanho absoluto se não houver baseline) — não avisos genéricos de "isso pode ser lento".

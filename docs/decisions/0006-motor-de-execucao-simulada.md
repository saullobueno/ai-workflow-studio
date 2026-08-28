# 0006 — Motor de execução simulada: simplificações assumidas

**Data:** 2026-08-28

## Contexto

A execução de workflow é sempre simulada (ADR [0001](./0001-arquitetura-spa-serverless.md)). Implementar o motor (`src/features/execution/engine.ts`) exigiu algumas decisões de design que não estavam no briefing.

## Decisões

1. **Classificação do node "Classificar com IA" não chama nenhum provedor de IA.** Usa um heurística determinística e transparente (substring match contra o nome da categoria; se nada bater, um hash estável do texto de entrada) e o log da execução deixa isso explícito ("Classificação simulada, sem chamada real de IA"). A única chamada real de IA do produto é o AI Copilot (texto → workflow). Isso evita inventar uma regra de negócio de "como uma IA classificaria isso" e mantém a execução 100% offline/gratuita.

2. **Loop executa o node seguinte imediato uma vez por item da lista, mas o resto do grafo depois do loop roda só uma vez** (não uma vez por iteração). É uma simplificação deliberada — um motor de re-entrância completa (subgrafo inteiro repetido por iteração, com convergência) é bem mais complexo e não foi pedido. Documentado aqui para não ser confundido com bug.

3. **Node incompleto (campo obrigatório vazio) não trava a aplicação** — vira um passo com `status: "error"` e uma mensagem clara (`Campo obrigatório visio: "x"`), e a execução não segue adiante a partir desse node. Isso é a contrapartida direta de schemas de persistência permissivos (ver comentário em `schemas/node.ts`): "pronto para rodar" é responsabilidade do motor, não do schema.

4. **Limite de 200 passos totais** (`MAX_STEPS`) como guarda contra ciclos no grafo — o editor não impede o usuário de criar um ciclo, e sem esse limite uma execução assim rodaria para sempre.

5. **JSON Inspector usa `@monaco-editor/react` com o loader padrão (CDN, não bundlado)** — mantém o bundle da aplicação pequeno; a função de baixar o Monaco só é chamada quando o usuário abre o histórico de execução e expande um passo. Exige rede disponível para essa funcionalidade específica (o resto do produto funciona offline). Aceitável para uma demo de portfólio hospedada na Vercel.

## Consequências

Se o produto evoluir para precisar de execução "de verdade" (chamando Slack/e-mail reais, ou um provedor de IA real no node de classificação), essas simplificações precisam ser revisitadas — mas isso está fora do escopo definido pelo usuário (frontend, sem serviços pagos, execução sempre simulada).

---
name: adding-node-type
description: Use ao adicionar um node kind novo (ex.: "delay", "webhook-out") ou um action kind novo (ex.: "discord", ao lado de slack/email/create-task) ao AI Workflow Studio. Um node/action novo precisa tocar 5 lugares que não têm nenhuma checagem automática de "esqueceu um" — este skill é o checklist.
---

# Adicionando um node kind (ou action kind) novo

Um node novo neste projeto não é um arquivo — é uma mudança coordenada em 5 lugares. Esquecer um deles produz um bug silencioso (o node existe no schema mas não aparece na paleta, ou aparece mas não executa). Siga esta ordem.

## 1. Schema (`src/schemas/node.ts`)

Adicione o schema do novo `data` shape com `kind: z.literal('seu-kind')`. Siga a convenção de permissividade já estabelecida: campos de texto livre **sem** `.min(1)` (só `.max()`), identificadores validados com `.refine((v) => v === '' || /regex/.test(v))`. Leia o comentário no topo do arquivo antes de desviar disso — é proposital, não descuido (autosave grava a cada tecla digitada; um schema estrito rejeitaria o estado intermediário no próximo load).

Adicione o novo literal em `nodeKindSchema` (ou, para um action kind novo, no union `actionNodeDataSchema`) e no union `nodeDataSchema`.

Se for um action kind novo, siga o padrão de `slackActionDataSchema`/`emailActionDataSchema`/`createTaskActionDataSchema` — sempre `kind: z.literal('action')` + `actionKind: z.literal('seu-tipo')`.

## 2. Metadados e fábrica (`src/features/workflow-editor/node-kinds.ts`)

- Adicione uma entrada em `NODE_KIND_META` (ícone do `lucide-react`, label, descrição) ou em `ACTION_KIND_META` para um action kind.
- Adicione o novo kind em `NODE_KIND_ORDER` (ou `ACTION_KIND_ORDER`) — é essa lista que a paleta e o command palette iteram.
- Adicione um `case` em `createDefaultNodeData` (ou `createDefaultActionData`) com valores padrão sensatos.

## 3. Componente visual (`src/features/workflow-editor/nodes/`)

Crie `SeuKindNode.tsx` seguindo `TriggerNode.tsx` como referência mais simples (um `Handle` de entrada + um de saída) ou `ConditionNode.tsx` se o node precisar de múltiplos handles de saída com lógica de branching. Registre o componente em `nodes/node-types.ts` (`nodeTypes` — a chave precisa bater exatamente com o `type`/`kind`).

## 4. Formulário de configuração (`src/features/workflow-editor/node-forms/`)

Crie `SeuKindNodeForm.tsx` usando o componente `Field` (`node-forms/Field.tsx`) para cada campo — ele já cuida de label associado + indicador de obrigatório. Registre o formulário em `NodeConfigPanel.tsx` (o bloco `{node.data.kind === '...' && <SeuKindNodeForm .../>}`).

## 5. Motor de execução (`src/features/execution/engine.ts`)

Dois pontos, ambos obrigatórios:

- `findEmptyRequiredField`: adicione um `case` retornando o nome do primeiro campo obrigatório vazio (isso é o que faz um node incompleto falhar com uma mensagem clara em vez de quebrar a execução).
- O `switch (node.data.kind)` dentro de `runStep`: implemente a simulação do node (resolver templates via `resolveTemplate`, gerar `logs`, popular `output`). Deixe claro no log se algo é simulado (siga o padrão `[simulado] ...` das actions, ou "Classificação simulada..." do ai-classify) — nunca finja que uma integração real está acontecendo.

## 6. Testes

- `node-kinds.test.ts`: o teste `it.each(NODE_KIND_ORDER)` já cobre automaticamente um kind novo assim que ele entra em `NODE_KIND_ORDER` — confirme que passa.
- `engine.test.ts`: adicione um caso cobrindo o caminho feliz e o caminho de campo vazio do node novo, seguindo os testes existentes para `condition`/`loop`/`action`.
- Se o node tiver uma interação de UI não trivial no formulário (lista dinâmica, seletor com sub-tipos), adicione um teste em `NodeConfigPanel.test.tsx` ou um arquivo de teste dedicado ao form.

## Checklist final

Rode `npm run typecheck && npm run lint && npm run test` — o `switch` exaustivo em `findEmptyRequiredField` e no motor de execução vai falhar o typecheck se você esquecer um `case` (TypeScript reclama de "not all code paths return a value" em modo estrito), o que ajuda a pegar o esquecimento cedo.

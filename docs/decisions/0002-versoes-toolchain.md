# 0002 — TypeScript 6.x e ESLint 9.x em vez das versões "latest" absolutas

**Data:** 2026-08-28

## Contexto

Ao resolver versões via registry do npm (nunca de memória), as tags `latest` de `typescript` (7.0.2) e `eslint` (10.9.1) apontavam para majors muito recentes. Antes de fixá-las, verificamos compatibilidade com o resto da toolchain:

- `@typescript-eslint/eslint-plugin@8.68.0` declara `peerDependencies.typescript: ">=4.8.4 <6.1.0"` — TypeScript 7 não é suportado ainda.
- `eslint-plugin-jsx-a11y@6.10.2` (essencial para a regra de acessibilidade do prompt-base, §8) declara `peerDependencies.eslint: "^3 || ... || ^9.0.0"` — ESLint 10 não é suportado ainda. `npm install` falhou com `ERESOLVE` antes de eu fixar a versão.

## Decisão

- `typescript`: `~6.0.3` (última 6.x estável), não `7.0.2`.
- `eslint` / `@eslint/js`: `^9.39.5` (última 9.x estável), não `10.9.1`.

## Consequências

- Deixamos de usar o compilador nativo (Go) do TypeScript 7 por ora. Revisitar quando `typescript-eslint` publicar suporte.
- `eslint@9.39.5` já aparece como "no longer supported" no aviso de deprecação do próprio pacote (a linha 9.x foi descontinuada quando a 10.x saiu), mas é a única linha compatível com `eslint-plugin-jsx-a11y` hoje. Revisitar quando o jsx-a11y suportar ESLint 10.

# 0003 — Vulnerabilidades de dependências transitivas: uma corrigida, uma aceita

**Data:** 2026-08-28

## Contexto

`npm audit` apontou dois grupos de vulnerabilidades transitivas após a instalação inicial.

### 1. `dompurify` via `monaco-editor` (produção) — corrigida

`monaco-editor@0.56.0` (mais recente disponível) depende de `dompurify@3.4.8`, vulnerável a múltiplos CVEs de XSS (bypass de `CUSTOM_ELEMENT_HANDLING`, poluição de `ALLOWED_ATTR`, etc.). Como `dompurify` é usado por Monaco para sanitizar conteúdo (ex.: hovers/markdown), e é uma dependência de produção real, corrigimos via `overrides` no `package.json`:

```json
"overrides": { "dompurify": "^3.4.14" }
```

`npm audit --omit=dev` confirma 0 vulnerabilidades após o override.

### 2. `undici` / `ajv` / `path-to-regexp` via `@vercel/node` (dev, apenas tipos) — aceita

`@vercel/node@9.0.1` é usado só como `devDependency`, exclusivamente para os tipos `VercelRequest`/`VercelResponse` em `api/copilot.ts`. Nenhum código desse pacote roda em desenvolvimento, build ou produção — não é bundlado no `dist/`. O próprio `npm audit fix --force` só resolveria isso rebaixando `@vercel/node` para `3.0.1`, uma versão mais antiga e com uma API de tipos diferente.

## Decisão

Aceitar essas vulnerabilidades de dev como risco desprezível (superfície de ataque nula: código nunca executado, nunca distribuído) em vez de rebaixar `@vercel/node`.

## Consequências

Reavaliar quando `@vercel/node` publicar uma versão mais nova que resolva o `undici` vulnerável — checar com `npm audit` periodicamente.

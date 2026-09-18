# 0010 — Login simulado (sem backend) e paleta de dark mode derivada de #27272A

**Data:** 2026-09-17

## Contexto

O pedido foi: adicionar uma opção de dark mode partindo de `#27272A` como a
cor mais escura da interface, e adicionar uma tela de login — com usuário e
senha já preenchidos nos campos e também expostos no rodapé do card — já que
o projeto não tinha nenhuma delas. O "o quê" veio explícito; o "como"
(mecanismo de autenticação, forma de derivar a paleta) não.

## Decisão — login

Este projeto não tem backend, banco de dados nem serviço de autenticação de
verdade (ver `README.md` e ADR [0001](./0001-arquitetura-spa-serverless.md))
— então um login "real" não é possível nem coerente com o resto do domínio.
`src/features/auth/` implementa uma sessão simulada:

- Credenciais fixas (`DEMO_CREDENTIALS` em `auth-storage.ts`), comparadas no
  cliente. Não é um mecanismo de segurança — é uma demonstração de fluxo de
  tela para portfólio, por isso as credenciais ficam visíveis no rodapé do
  próprio card de login e os campos já vêm preenchidos com elas.
- Sessão persistida em `localStorage` (via `core/storage.ts`, a única porta
  já existente) sob a chave `auth:session`, sem token, sem expiração.
- `src/routes/RequireAuth.tsx` faz o guard: sem sessão, redireciona para
  `/login` (mesmo padrão de "guard de navegação" que `routes/` já usa para
  workflow inexistente).

## Decisão — dark mode

`#27272A` é exatamente o "zinc-800" da escala de cinza do Tailwind. Em vez de
inventar uma paleta nova, o dark mode inteiro (`.dark` em `src/index.css`)
usa graus da mesma escala zinc (zinc-700, zinc-600, zinc-500, zinc-200,
convertidos para oklch), sempre iguais ou mais claros que `#27272A` — nenhuma
superfície da UI fica mais escura do que a cor pedida. Cores semânticas
(`--destructive`, `--success`, `--warning`) não fazem parte dessa derivação
e continuam com os mesmos tons de antes.

## Consequências

- Guard de autenticação muda o comportamento de `/` e `/workflows/:id`: sem
  sessão, ambos redirecionam para `/login`. Os testes que renderizavam essas
  rotas diretamente (`App.test.tsx`, `e2e/*.spec.ts`) precisaram autenticar
  antes (via `login()` direto no Vitest, via clique em "Entrar" — campos já
  preenchidos — no Playwright).
- Se este projeto um dia precisar de autenticação real, `src/features/auth/`
  é o único lugar a substituir — nada em `schemas/`, `core/` ou nas páginas
  protegidas depende da forma como a sessão é validada, só de
  `isAuthenticated()`/`login()`/`logout()`.

#!/usr/bin/env node
// PreToolUse hook (matcher: Write|Edit). Evita que um valor de segredo real
// (chave de API, token) va parar em um arquivo versionado — o unico lugar
// legitimo para isso neste projeto e o .env (gitignored, nunca commitado).

let raw = ''
process.stdin.on('data', (chunk) => {
  raw += chunk
})
process.stdin.on('end', () => {
  let file = ''
  let content = ''
  try {
    const input = JSON.parse(raw)
    file = input.tool_input?.file_path ?? ''
    content = input.tool_input?.content ?? input.tool_input?.new_string ?? ''
  } catch {
    process.exit(0)
  }

  // .env é o destino correto de um segredo real — nunca bloqueia esse arquivo.
  if (/(^|[\\/])\.env$/.test(file)) process.exit(0)
  if (!content) process.exit(0)

  // Prefixos de chave de API conhecidos, baixo risco de falso positivo.
  const knownKeyPrefixes =
    /gsk_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[A-Z0-9]{16}|xox[baprs]-[A-Za-z0-9-]{10,}/
  if (knownKeyPrefixes.test(content)) {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'deny',
          permissionDecisionReason: `Isso parece uma chave de API real sendo gravada em ${file}, fora do .env. Segredos reais só podem existir em .env (gitignored) — nunca em .env.example, README, código-fonte ou docs. Se for um valor de exemplo/placeholder, torne isso óbvio (ex.: "sk-..." ou vazio) em vez de um valor que parece real.`,
        },
      }),
    )
    return
  }

  // Heurística mais genérica (NOME_QUE_PARECE_SEGREDO = valor longo) — pede
  // confirmação em vez de bloquear, pra não travar dev legítimo em falso positivo.
  const genericSecretAssignment =
    /(API_KEY|SECRET|TOKEN|PASSWORD)\s*[:=]\s*["']?[A-Za-z0-9_/+=-]{20,}["']?/i
  if (genericSecretAssignment.test(content)) {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'ask',
          permissionDecisionReason: `Isso se parece com um segredo real (chave/token/senha) sendo gravado em ${file}. Confirme que não é um valor real antes de continuar.`,
        },
      }),
    )
  }
})

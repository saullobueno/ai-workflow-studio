#!/usr/bin/env node
// PreToolUse hook (matcher: Bash|PowerShell). Bloqueia comandos destrutivos
// comuns antes de rodarem. Guarda de projeto, nao substitui julgamento — so
// cobre os padroes mais obvios e de baixo risco de falso positivo.
// Usa Node (nao jq) de proposito: jq nao esta garantido no ambiente do
// usuario, Node ja e uma dependencia obrigatoria deste projeto.

let raw = ''
process.stdin.on('data', (chunk) => {
  raw += chunk
})
process.stdin.on('end', () => {
  let cmd = ''
  try {
    cmd = JSON.parse(raw).tool_input?.command ?? ''
  } catch {
    process.exit(0)
  }
  if (!cmd) process.exit(0)

  const checks = [
    {
      pattern: /\brm\s+(-[a-z]*r[a-z]*f[a-z]*|-[a-z]*f[a-z]*r[a-z]*)(\s|$)/i,
      reason:
        'rm -rf (ou equivalente) apaga arquivos permanentemente, sem lixeira.',
    },
    {
      pattern: /\bgit\s+push(.*\s)?(--force(\s|$)|-f(\s|$))/i,
      reason:
        'git push --force pode sobrescrever/perder commits no remoto. Use --force-with-lease ou peça confirmação explícita do usuário.',
    },
    {
      pattern: /\bgit\s+reset\s+--hard\b/i,
      reason:
        'git reset --hard descarta mudanças locais não commitadas sem chance de recuperação.',
    },
    {
      pattern:
        /\b(del|rd)\s+(\/f\s+\/s\s+\/q|\/s\s+\/q(\s+\/f)?|\/q\s+(\/f\s+)?\/s)/i,
      reason:
        'Exclusão recursiva forçada (del/rd /f /s /q) é destrutiva e irreversível.',
    },
  ]

  // git push --force-with-lease é seguro por design — não deixa o check de
  // --force acima bloquear isso (a regex de --force não casa porque depois
  // de "--force" vem "-", não espaço/fim de string).
  for (const { pattern, reason } of checks) {
    if (pattern.test(cmd)) {
      process.stdout.write(
        JSON.stringify({
          hookSpecificOutput: {
            hookEventName: 'PreToolUse',
            permissionDecision: 'deny',
            permissionDecisionReason: `Comando destrutivo bloqueado pelo hook de proteção do projeto: ${reason} Se isso for genuinamente necessário, peça autorização explícita ao usuário antes de rodar (ou rode manualmente fora do Claude Code).`,
          },
        }),
      )
      return
    }
  }
})

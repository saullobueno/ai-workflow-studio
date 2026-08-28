#!/usr/bin/env node
// PostToolUse hook (matcher: Write|Edit). Só sugere — nunca executa nada
// automaticamente. Dispara apenas para .ts/.tsx dentro de src/ ou api/ (não
// para markdown/config, que geraria ruído a cada edição de doc).

let raw = ''
process.stdin.on('data', (chunk) => {
  raw += chunk
})
process.stdin.on('end', () => {
  let file = ''
  try {
    const input = JSON.parse(raw)
    file = input.tool_input?.file_path ?? input.tool_response?.filePath ?? ''
  } catch {
    process.exit(0)
  }
  if (!file) process.exit(0)

  if (/[\\/](src|api)[\\/].*\.tsx?$/.test(file)) {
    process.stdout.write(
      JSON.stringify({
        systemMessage:
          'Arquivo TypeScript alterado em src/ ou api/ — considere rodar `npm run typecheck` e `npm run lint` antes de finalizar (não a suíte de testes inteira, a menos que a mudança tenha lógica não trivial).',
      }),
    )
  }
})

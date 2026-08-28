export type ExecutionContext = Record<string, unknown>

const TEMPLATE_PATTERN = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g

/**
 * Resolve variáveis `{{nome}}` contra o contexto de execução. Uma variável
 * sem valor no contexto é deixada como está (em vez de virar string vazia)
 * — isso torna óbvio, no log da execução, qual variável não foi resolvida.
 */
export function resolveTemplate(
  template: string,
  context: ExecutionContext,
): string {
  return template.replace(TEMPLATE_PATTERN, (match, name: string) => {
    const value = context[name]
    switch (typeof value) {
      case 'string':
        return value
      case 'number':
      case 'boolean':
        return String(value)
      default:
        // undefined, objeto, etc. — deixa o placeholder como está em vez de
        // arriscar "[object Object]" no lugar de um valor de verdade.
        return match
    }
  })
}

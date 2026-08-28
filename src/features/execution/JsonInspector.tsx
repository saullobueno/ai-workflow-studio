import Editor from '@monaco-editor/react'

interface JsonInspectorProps {
  value: unknown
  height?: string
}

/**
 * @monaco-editor/react carrega o motor do Monaco via CDN sob demanda (não
 * entra no bundle da aplicação) — só é buscado quando este componente
 * realmente monta, ou seja, quando o usuário abre o histórico de execução.
 * Ver docs/decisions sobre essa escolha.
 */
export function JsonInspector({ value, height = '240px' }: JsonInspectorProps) {
  return (
    <Editor
      height={height}
      defaultLanguage="json"
      value={JSON.stringify(value, null, 2)}
      theme="vs-dark"
      options={{
        readOnly: true,
        minimap: { enabled: false },
        fontSize: 12,
        scrollBeyondLastLine: false,
        wordWrap: 'on',
      }}
    />
  )
}

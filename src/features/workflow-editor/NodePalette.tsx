import type { DragEvent } from 'react'
import { NODE_KIND_META, NODE_KIND_ORDER, createNode } from './node-kinds'
import { useWorkflowEditorStore } from './store'

export const NODE_KIND_DATA_TRANSFER_TYPE = 'application/x-node-kind'

export function NodePalette() {
  const addNode = useWorkflowEditorStore((state) => state.addNode)
  const nodeCount = useWorkflowEditorStore((state) => state.nodes.length)

  function handleDragStart(
    event: DragEvent<HTMLButtonElement>,
    kind: (typeof NODE_KIND_ORDER)[number],
  ) {
    event.dataTransfer.setData(NODE_KIND_DATA_TRANSFER_TYPE, kind)
    event.dataTransfer.effectAllowed = 'move'
  }

  function handleAddViaClick(kind: (typeof NODE_KIND_ORDER)[number]) {
    // Fallback acessível para quem não usa drag and drop (teclado/leitor de
    // tela): adiciona o node em cascata para não empilhar tudo no mesmo lugar.
    addNode(
      createNode(kind, { x: 80 + nodeCount * 24, y: 80 + nodeCount * 24 }),
    )
  }

  return (
    <aside className="w-56 shrink-0 overflow-y-auto border-r p-3">
      <h2 className="text-muted-foreground mb-2 px-1 text-xs font-semibold tracking-wide uppercase">
        Nodes
      </h2>
      <ul className="flex flex-col gap-2">
        {NODE_KIND_ORDER.map((kind) => {
          const meta = NODE_KIND_META[kind]
          const Icon = meta.icon
          return (
            <li key={kind}>
              <button
                type="button"
                draggable
                onDragStart={(event) => {
                  handleDragStart(event, kind)
                }}
                onClick={() => {
                  handleAddViaClick(kind)
                }}
                className="bg-card hover:bg-accent flex w-full cursor-grab items-start gap-2 rounded-md border p-2 text-left text-sm active:cursor-grabbing"
                title={`Arraste para o canvas ou clique para adicionar "${meta.label}"`}
              >
                <Icon
                  className="text-muted-foreground mt-0.5 size-4 shrink-0"
                  aria-hidden
                />
                <span>
                  <span className="block font-medium">{meta.label}</span>
                  <span className="text-muted-foreground block text-xs">
                    {meta.description}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}

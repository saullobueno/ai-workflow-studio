import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Connection,
  type EdgeChange,
  type NodeChange,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { nanoid } from 'nanoid'
import { useCallback, type DragEvent } from 'react'
import type { WorkflowEdge } from '@/schemas/edge'
import type { NodeKind, WorkflowNode } from '@/schemas/node'
import { useTheme } from '@/features/theme/use-theme'
import { NODE_KIND_ORDER, createNode } from './node-kinds'
import { NODE_KIND_DATA_TRANSFER_TYPE } from './NodePalette'
import { nodeTypes } from './nodes/node-types'
import { useWorkflowEditorStore } from './store'

interface WorkflowCanvasProps {
  selectedNodeId: string | null
  onSelectNode: (nodeId: string | null) => void
}

function isNodeKind(value: string): value is NodeKind {
  return (NODE_KIND_ORDER as string[]).includes(value)
}

function WorkflowCanvasInner({
  selectedNodeId,
  onSelectNode,
}: WorkflowCanvasProps) {
  const nodes = useWorkflowEditorStore((state) => state.nodes)
  const edges = useWorkflowEditorStore((state) => state.edges)
  const setNodes = useWorkflowEditorStore((state) => state.setNodes)
  const setEdges = useWorkflowEditorStore((state) => state.setEdges)
  const addNode = useWorkflowEditorStore((state) => state.addNode)
  const { screenToFlowPosition } = useReactFlow()
  const { theme } = useTheme()

  const onNodesChange = useCallback(
    (changes: NodeChange<WorkflowNode>[]) => {
      setNodes((current) => applyNodeChanges(changes, current))
    },
    [setNodes],
  )

  const onEdgesChange = useCallback(
    (changes: EdgeChange<WorkflowEdge>[]) => {
      setEdges((current) => applyEdgeChanges(changes, current))
    },
    [setEdges],
  )

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((current) => addEdge({ ...connection, id: nanoid() }, current))
    },
    [setEdges],
  )

  const onNodesDelete = useCallback(
    (deleted: WorkflowNode[]) => {
      const deletedIds = new Set(deleted.map((node) => node.id))
      setEdges((current) =>
        current.filter(
          (edge) =>
            !deletedIds.has(edge.source) && !deletedIds.has(edge.target),
        ),
      )
      if (selectedNodeId && deletedIds.has(selectedNodeId)) {
        onSelectNode(null)
      }
    },
    [setEdges, selectedNodeId, onSelectNode],
  )

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      const kind = event.dataTransfer.getData(NODE_KIND_DATA_TRANSFER_TYPE)
      if (!isNodeKind(kind)) return

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })
      addNode(createNode(kind, position))
    },
    [addNode, screenToFlowPosition],
  )

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  return (
    <div className="flex-1" onDrop={onDrop} onDragOver={onDragOver}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodesDelete={onNodesDelete}
        onSelectionChange={({ nodes: selected }) => {
          onSelectNode(selected[0]?.id ?? null)
        }}
        onPaneClick={() => {
          onSelectNode(null)
        }}
        // @xyflow/react só aplica seu próprio tema escuro (minimap, controles,
        // handles) com a classe "dark" no elemento .react-flow em si — ser
        // descendente de <html class="dark"> não é suficiente (ver style.css
        // da lib: seletor é `.react-flow.dark`, não `.dark .react-flow`).
        className={theme === 'dark' ? 'dark' : undefined}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap
          pannable
          zoomable
          // A classe "dark" no .react-flow (acima) cobre o resto do tema
          // nativo (controles, handles), mas o fundo/nodes do minimap ficam
          // brancos mesmo assim se não vierem via prop — cores literais
          // (não tokens oklch/var(), que o SVG do minimap não resolve),
          // mesmo caso já documentado em ExecutionDurationChart.tsx.
          bgColor={theme === 'dark' ? '#27272a' : undefined}
          maskColor={theme === 'dark' ? 'rgba(9, 9, 11, 0.6)' : undefined}
          nodeColor={theme === 'dark' ? '#71717a' : undefined}
        />
      </ReactFlow>
    </div>
  )
}

export function WorkflowCanvas(props: WorkflowCanvasProps) {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner {...props} />
    </ReactFlowProvider>
  )
}

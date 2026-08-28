import { temporal } from 'zundo'
import { create } from 'zustand'
import { saveWorkflow } from '@/features/workflows/workflow-repository'
import type { WorkflowEdge } from '@/schemas/edge'
import type { NodeData, WorkflowNode } from '@/schemas/node'
import type { WorkflowVariable } from '@/schemas/variable'
import type { Workflow } from '@/schemas/workflow'

export type NodesOrUpdater =
  WorkflowNode[] | ((nodes: WorkflowNode[]) => WorkflowNode[])
export type EdgesOrUpdater =
  WorkflowEdge[] | ((edges: WorkflowEdge[]) => WorkflowEdge[])

export type AutosaveStatus = 'saved' | 'unsaved'

interface EditorState {
  workflowId: string | null
  name: string
  description: string
  variables: WorkflowVariable[]
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  createdAt: string | null
  autosaveStatus: AutosaveStatus
}

interface EditorActions {
  loadWorkflow: (workflow: Workflow) => void
  closeWorkflow: () => void
  setName: (name: string) => void
  setDescription: (description: string) => void
  setVariables: (variables: WorkflowVariable[]) => void
  setNodes: (updater: NodesOrUpdater) => void
  setEdges: (updater: EdgesOrUpdater) => void
  addNode: (node: WorkflowNode) => void
  updateNodeData: (nodeId: string, data: NodeData) => void
  removeNode: (nodeId: string) => void
}

export type EditorStore = EditorState & EditorActions

const initialState: EditorState = {
  workflowId: null,
  name: '',
  description: '',
  variables: [],
  nodes: [],
  edges: [],
  createdAt: null,
  autosaveStatus: 'saved',
}

function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delayMs: number,
) {
  let timeout: ReturnType<typeof setTimeout> | undefined
  return (...args: Args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      fn(...args)
    }, delayMs)
  }
}

export const useWorkflowEditorStore = create<EditorStore>()(
  temporal(
    (set) => ({
      ...initialState,
      loadWorkflow: (workflow) => {
        set({
          workflowId: workflow.id,
          name: workflow.name,
          description: workflow.description,
          variables: workflow.variables,
          nodes: workflow.nodes,
          edges: workflow.edges,
          createdAt: workflow.createdAt,
          autosaveStatus: 'saved',
        })
        useWorkflowEditorStore.temporal.getState().clear()
      },
      closeWorkflow: () => {
        set({ ...initialState })
        useWorkflowEditorStore.temporal.getState().clear()
      },
      setName: (name) => {
        set({ name, autosaveStatus: 'unsaved' })
      },
      setDescription: (description) => {
        set({ description, autosaveStatus: 'unsaved' })
      },
      setVariables: (variables) => {
        set({ variables, autosaveStatus: 'unsaved' })
      },
      setNodes: (updater) => {
        set((state) => ({
          nodes: typeof updater === 'function' ? updater(state.nodes) : updater,
          autosaveStatus: 'unsaved',
        }))
      },
      setEdges: (updater) => {
        set((state) => ({
          edges: typeof updater === 'function' ? updater(state.edges) : updater,
          autosaveStatus: 'unsaved',
        }))
      },
      addNode: (node) => {
        set((state) => ({
          nodes: [...state.nodes, node],
          autosaveStatus: 'unsaved',
        }))
      },
      updateNodeData: (nodeId, data) => {
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === nodeId ? { ...node, data } : node,
          ),
          autosaveStatus: 'unsaved',
        }))
      },
      removeNode: (nodeId) => {
        set((state) => ({
          nodes: state.nodes.filter((node) => node.id !== nodeId),
          edges: state.edges.filter(
            (edge) => edge.source !== nodeId && edge.target !== nodeId,
          ),
          autosaveStatus: 'unsaved',
        }))
      },
    }),
    {
      limit: 50,
      partialize: (state) => ({
        name: state.name,
        description: state.description,
        variables: state.variables,
        nodes: state.nodes,
        edges: state.edges,
      }),
      // Drag de node no canvas dispara dezenas de `setNodes` por gesto; sem
      // debounce, um Ctrl+Z desfaria só 1px do movimento em vez do gesto inteiro.
      handleSet: (handleSet) => debounce(handleSet, 400),
    },
  ),
)

export const AUTOSAVE_DEBOUNCE_MS = 800

let autosaveTimeout: ReturnType<typeof setTimeout> | undefined

useWorkflowEditorStore.subscribe((state, previousState) => {
  if (!state.workflowId || !state.createdAt) return
  if (
    state.name === previousState.name &&
    state.description === previousState.description &&
    state.variables === previousState.variables &&
    state.nodes === previousState.nodes &&
    state.edges === previousState.edges
  ) {
    return
  }

  clearTimeout(autosaveTimeout)
  autosaveTimeout = setTimeout(() => {
    const current = useWorkflowEditorStore.getState()
    if (!current.workflowId || !current.createdAt) return

    saveWorkflow({
      id: current.workflowId,
      name: current.name,
      description: current.description,
      variables: current.variables,
      nodes: current.nodes,
      edges: current.edges,
      createdAt: current.createdAt,
      updatedAt: new Date().toISOString(),
    })
    useWorkflowEditorStore.setState({ autosaveStatus: 'saved' })
  }, AUTOSAVE_DEBOUNCE_MS)
})

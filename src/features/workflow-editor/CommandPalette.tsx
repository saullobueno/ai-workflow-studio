import { History, Play, Redo2, Undo2, type LucideIcon } from 'lucide-react'
import { useEffect } from 'react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/design/ui/command'
import { NODE_KIND_META, NODE_KIND_ORDER, createNode } from './node-kinds'
import { useWorkflowEditorStore } from './store'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRun: () => void
  onOpenHistory: () => void
}

interface ActionItem {
  key: string
  label: string
  icon: LucideIcon
  onSelect: () => void
}

export function CommandPalette({
  open,
  onOpenChange,
  onRun,
  onOpenHistory,
}: CommandPaletteProps) {
  const addNode = useWorkflowEditorStore((state) => state.addNode)
  const nodeCount = useWorkflowEditorStore((state) => state.nodes.length)
  const undo = useWorkflowEditorStore.temporal.getState().undo
  const redo = useWorkflowEditorStore.temporal.getState().redo

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onOpenChange])

  function runCommand(action: () => void) {
    onOpenChange(false)
    action()
  }

  const workflowActions: ActionItem[] = [
    { key: 'run', label: 'Executar workflow', icon: Play, onSelect: onRun },
    {
      key: 'history',
      label: 'Ver histórico de execução',
      icon: History,
      onSelect: onOpenHistory,
    },
    {
      key: 'undo',
      label: 'Desfazer',
      icon: Undo2,
      onSelect: () => {
        undo()
      },
    },
    {
      key: 'redo',
      label: 'Refazer',
      icon: Redo2,
      onSelect: () => {
        redo()
      },
    },
  ]

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Command palette"
      description="Adicione nodes ou execute ações no workflow"
    >
      <CommandInput placeholder="Buscar uma ação ou node…" />
      <CommandList>
        <CommandEmpty>Nada encontrado.</CommandEmpty>
        <CommandGroup heading="Adicionar node">
          {NODE_KIND_ORDER.map((kind) => {
            const meta = NODE_KIND_META[kind]
            const Icon = meta.icon
            return (
              <CommandItem
                key={kind}
                value={`adicionar node ${meta.label}`}
                onSelect={() => {
                  runCommand(() => {
                    addNode(
                      createNode(kind, {
                        x: 80 + nodeCount * 24,
                        y: 80 + nodeCount * 24,
                      }),
                    )
                  })
                }}
              >
                <Icon /> {meta.label}
              </CommandItem>
            )
          })}
        </CommandGroup>
        <CommandGroup heading="Workflow">
          {workflowActions.map((action) => (
            <CommandItem
              key={action.key}
              value={action.label}
              onSelect={() => {
                runCommand(action.onSelect)
              }}
            >
              <action.icon /> {action.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}

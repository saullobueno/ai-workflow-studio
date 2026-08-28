import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface NodeShellProps {
  icon: LucideIcon
  label: string
  selected?: boolean
  invalid?: boolean
  children?: ReactNode
}

export function NodeShell({
  icon: Icon,
  label,
  selected,
  invalid,
  children,
}: NodeShellProps) {
  return (
    <div
      className={cn(
        'bg-card text-card-foreground w-56 rounded-lg border shadow-sm',
        selected && 'ring-ring ring-2',
        invalid && 'border-destructive',
      )}
    >
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <Icon className="text-muted-foreground size-4 shrink-0" aria-hidden />
        <span className="truncate text-sm font-medium">{label}</span>
      </div>
      {children && (
        <div className="text-muted-foreground truncate px-3 py-2 text-xs">
          {children}
        </div>
      )}
    </div>
  )
}

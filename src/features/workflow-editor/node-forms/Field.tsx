import type { ReactNode } from 'react'
import { Label } from '@/design/ui/label'

interface FieldProps {
  label: string
  htmlFor: string
  required?: boolean
  hint?: string
  children: ReactNode
}

export function Field({
  label,
  htmlFor,
  required,
  hint,
  children,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
    </div>
  )
}

import { Input } from '@/design/ui/input'
import type { LoopNodeData } from '@/schemas/node'
import { Field } from './Field'

interface LoopNodeFormProps {
  data: LoopNodeData
  onChange: (data: LoopNodeData) => void
}

export function LoopNodeForm({ data, onChange }: LoopNodeFormProps) {
  return (
    <div className="flex flex-col gap-4">
      <Field label="Nome do node" htmlFor="loop-label">
        <Input
          id="loop-label"
          value={data.label}
          onChange={(event) => {
            onChange({ ...data, label: event.target.value })
          }}
        />
      </Field>
      <Field
        label="Lista"
        htmlFor="loop-list"
        hint="Suporta variáveis, ex.: {{items}}"
        required
      >
        <Input
          id="loop-list"
          value={data.listTemplate}
          onChange={(event) => {
            onChange({ ...data, listTemplate: event.target.value })
          }}
        />
      </Field>
      <Field
        label="Nome da variável do item"
        htmlFor="loop-item-variable"
        hint="Como cada item fica disponível dentro do loop, ex.: {{item}}"
        required
      >
        <Input
          id="loop-item-variable"
          value={data.itemVariable}
          onChange={(event) => {
            onChange({ ...data, itemVariable: event.target.value })
          }}
        />
      </Field>
      <Field label="Máximo de iterações" htmlFor="loop-max-iterations">
        <Input
          id="loop-max-iterations"
          type="number"
          min={1}
          max={50}
          value={data.maxIterations}
          onChange={(event) => {
            const parsed = Number.parseInt(event.target.value, 10)
            onChange({
              ...data,
              maxIterations: Number.isNaN(parsed)
                ? data.maxIterations
                : Math.min(50, Math.max(1, parsed)),
            })
          }}
        />
      </Field>
    </div>
  )
}

import { Plus, X } from 'lucide-react'
import { Button } from '@/design/ui/button'
import { Input } from '@/design/ui/input'
import { Label } from '@/design/ui/label'
import type { TriggerField, TriggerNodeData } from '@/schemas/node'
import { Field } from './Field'

interface TriggerNodeFormProps {
  data: TriggerNodeData
  onChange: (data: TriggerNodeData) => void
}

export function TriggerNodeForm({ data, onChange }: TriggerNodeFormProps) {
  function updateField(index: number, patch: Partial<TriggerField>) {
    onChange({
      ...data,
      fields: data.fields.map((field, i) =>
        i === index ? { ...field, ...patch } : field,
      ),
    })
  }

  function addField() {
    onChange({
      ...data,
      fields: [...data.fields, { name: '', sampleValue: '' }],
    })
  }

  function removeField(index: number) {
    onChange({ ...data, fields: data.fields.filter((_, i) => i !== index) })
  }

  return (
    <div className="flex flex-col gap-4">
      <Field label="Nome do node" htmlFor="trigger-label">
        <Input
          id="trigger-label"
          value={data.label}
          onChange={(event) => {
            onChange({ ...data, label: event.target.value })
          }}
        />
      </Field>
      <Field
        label="Nome do evento"
        htmlFor="trigger-event"
        hint="Ex.: ticket.created"
        required
      >
        <Input
          id="trigger-event"
          value={data.eventName}
          onChange={(event) => {
            onChange({ ...data, eventName: event.target.value })
          }}
        />
      </Field>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label>Campos do evento</Label>
          <Button type="button" size="sm" variant="outline" onClick={addField}>
            <Plus /> Adicionar
          </Button>
        </div>
        {data.fields.length === 0 && (
          <p className="text-muted-foreground text-xs">
            Nenhum campo ainda — os campos definem quais dados o evento carrega
            (ex.: subject, sentiment) e ficam disponíveis como {'{{nome}}'} nos
            nodes seguintes.
          </p>
        )}
        {data.fields.map((field, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              aria-label={`Nome do campo ${String(index + 1)}`}
              placeholder="nome"
              value={field.name}
              onChange={(event) => {
                updateField(index, { name: event.target.value })
              }}
            />
            <Input
              aria-label={`Valor de exemplo do campo ${String(index + 1)}`}
              placeholder="valor de exemplo"
              value={field.sampleValue}
              onChange={(event) => {
                updateField(index, { sampleValue: event.target.value })
              }}
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label={`Remover campo ${String(index + 1)}`}
              onClick={() => {
                removeField(index)
              }}
            >
              <X />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

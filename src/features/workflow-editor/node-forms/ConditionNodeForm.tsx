import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/design/ui/select'
import { Input } from '@/design/ui/input'
import type { ConditionNodeData, ConditionOperator } from '@/schemas/node'
import { Field } from './Field'

interface ConditionNodeFormProps {
  data: ConditionNodeData
  onChange: (data: ConditionNodeData) => void
}

const OPERATOR_OPTIONS: { value: ConditionOperator; label: string }[] = [
  { value: 'equals', label: 'é igual a' },
  { value: 'not-equals', label: 'é diferente de' },
  { value: 'contains', label: 'contém' },
]

export function ConditionNodeForm({ data, onChange }: ConditionNodeFormProps) {
  return (
    <div className="flex flex-col gap-4">
      <Field label="Nome do node" htmlFor="condition-label">
        <Input
          id="condition-label"
          value={data.label}
          onChange={(event) => {
            onChange({ ...data, label: event.target.value })
          }}
        />
      </Field>
      <Field
        label="Campo"
        htmlFor="condition-field"
        hint="Suporta variáveis, ex.: {{urgency}}"
        required
      >
        <Input
          id="condition-field"
          value={data.fieldTemplate}
          onChange={(event) => {
            onChange({ ...data, fieldTemplate: event.target.value })
          }}
        />
      </Field>
      <Field label="Operador" htmlFor="condition-operator">
        <Select
          value={data.operator}
          onValueChange={(value: ConditionOperator) => {
            onChange({ ...data, operator: value })
          }}
        >
          <SelectTrigger id="condition-operator">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {OPERATOR_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Valor" htmlFor="condition-value" required>
        <Input
          id="condition-value"
          value={data.value}
          onChange={(event) => {
            onChange({ ...data, value: event.target.value })
          }}
        />
      </Field>
    </div>
  )
}

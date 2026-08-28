import { Plus, X } from 'lucide-react'
import { Button } from '@/design/ui/button'
import { Input } from '@/design/ui/input'
import { Label } from '@/design/ui/label'
import { Textarea } from '@/design/ui/textarea'
import type { AiClassifyNodeData } from '@/schemas/node'
import { Field } from './Field'

interface AiClassifyNodeFormProps {
  data: AiClassifyNodeData
  onChange: (data: AiClassifyNodeData) => void
}

const MIN_CATEGORIES = 2
const MAX_CATEGORIES = 8

export function AiClassifyNodeForm({
  data,
  onChange,
}: AiClassifyNodeFormProps) {
  function updateCategory(index: number, value: string) {
    onChange({
      ...data,
      categories: data.categories.map((category, i) =>
        i === index ? value : category,
      ),
    })
  }

  function addCategory() {
    if (data.categories.length >= MAX_CATEGORIES) return
    onChange({ ...data, categories: [...data.categories, ''] })
  }

  function removeCategory(index: number) {
    if (data.categories.length <= MIN_CATEGORIES) return
    onChange({
      ...data,
      categories: data.categories.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <Field label="Nome do node" htmlFor="classify-label">
        <Input
          id="classify-label"
          value={data.label}
          onChange={(event) => {
            onChange({ ...data, label: event.target.value })
          }}
        />
      </Field>
      <Field
        label="Instruções para a IA"
        htmlFor="classify-instructions"
        hint="O que a IA deve levar em conta para classificar (ex.: nível do cliente e sentimento)."
        required
      >
        <Textarea
          id="classify-instructions"
          rows={3}
          value={data.instructions}
          onChange={(event) => {
            onChange({ ...data, instructions: event.target.value })
          }}
        />
      </Field>
      <Field
        label="Texto de entrada"
        htmlFor="classify-input"
        hint="Suporta variáveis, ex.: {{subject}} — {{message}}"
        required
      >
        <Input
          id="classify-input"
          value={data.inputTemplate}
          onChange={(event) => {
            onChange({ ...data, inputTemplate: event.target.value })
          }}
        />
      </Field>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label>Categorias</Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={data.categories.length >= MAX_CATEGORIES}
            onClick={addCategory}
          >
            <Plus /> Adicionar
          </Button>
        </div>
        {data.categories.map((category, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              aria-label={`Categoria ${String(index + 1)}`}
              value={category}
              onChange={(event) => {
                updateCategory(index, event.target.value)
              }}
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label={`Remover categoria ${String(index + 1)}`}
              disabled={data.categories.length <= MIN_CATEGORIES}
              onClick={() => {
                removeCategory(index)
              }}
            >
              <X />
            </Button>
          </div>
        ))}
      </div>
      <Field
        label="Salvar resultado na variável"
        htmlFor="classify-output"
        hint="Nome usado para referenciar o resultado, ex.: {{classification}}"
        required
      >
        <Input
          id="classify-output"
          value={data.outputVariable}
          onChange={(event) => {
            onChange({ ...data, outputVariable: event.target.value })
          }}
        />
      </Field>
    </div>
  )
}

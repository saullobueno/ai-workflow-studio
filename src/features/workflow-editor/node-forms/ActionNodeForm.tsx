import { Input } from '@/design/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/design/ui/select'
import { Textarea } from '@/design/ui/textarea'
import type { ActionNodeData } from '@/schemas/node'
import {
  ACTION_KIND_META,
  ACTION_KIND_ORDER,
  type ActionKind,
} from '../node-kinds'
import { createDefaultActionData } from '../node-kinds'
import { Field } from './Field'

interface ActionNodeFormProps {
  data: ActionNodeData
  onChange: (data: ActionNodeData) => void
}

export function ActionNodeForm({ data, onChange }: ActionNodeFormProps) {
  function handleActionKindChange(actionKind: ActionKind) {
    if (actionKind === data.actionKind) return
    onChange({ ...createDefaultActionData(actionKind), label: data.label })
  }

  return (
    <div className="flex flex-col gap-4">
      <Field label="Nome do node" htmlFor="action-label">
        <Input
          id="action-label"
          value={data.label}
          onChange={(event) => {
            onChange({ ...data, label: event.target.value })
          }}
        />
      </Field>
      <Field label="Tipo de ação" htmlFor="action-kind">
        <Select value={data.actionKind} onValueChange={handleActionKindChange}>
          <SelectTrigger id="action-kind">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ACTION_KIND_ORDER.map((kind) => (
              <SelectItem key={kind} value={kind}>
                {ACTION_KIND_META[kind].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {data.actionKind === 'slack' && (
        <>
          <Field label="Canal" htmlFor="action-channel" required>
            <Input
              id="action-channel"
              placeholder="#suporte-vip"
              value={data.channel}
              onChange={(event) => {
                onChange({ ...data, channel: event.target.value })
              }}
            />
          </Field>
          <Field
            label="Mensagem"
            htmlFor="action-message"
            hint="Suporta variáveis, ex.: {{subject}}"
            required
          >
            <Textarea
              id="action-message"
              rows={3}
              value={data.message}
              onChange={(event) => {
                onChange({ ...data, message: event.target.value })
              }}
            />
          </Field>
        </>
      )}

      {data.actionKind === 'email' && (
        <>
          <Field label="Para" htmlFor="action-to" required>
            <Input
              id="action-to"
              placeholder="suporte@empresa.com"
              value={data.to}
              onChange={(event) => {
                onChange({ ...data, to: event.target.value })
              }}
            />
          </Field>
          <Field label="Assunto" htmlFor="action-subject" required>
            <Input
              id="action-subject"
              value={data.subject}
              onChange={(event) => {
                onChange({ ...data, subject: event.target.value })
              }}
            />
          </Field>
          <Field label="Corpo" htmlFor="action-body" required>
            <Textarea
              id="action-body"
              rows={4}
              value={data.body}
              onChange={(event) => {
                onChange({ ...data, body: event.target.value })
              }}
            />
          </Field>
        </>
      )}

      {data.actionKind === 'create-task' && (
        <>
          <Field label="Título da tarefa" htmlFor="action-title" required>
            <Input
              id="action-title"
              value={data.title}
              onChange={(event) => {
                onChange({ ...data, title: event.target.value })
              }}
            />
          </Field>
          <Field label="Responsável" htmlFor="action-assignee" required>
            <Input
              id="action-assignee"
              value={data.assignee}
              onChange={(event) => {
                onChange({ ...data, assignee: event.target.value })
              }}
            />
          </Field>
          <Field label="Prioridade" htmlFor="action-priority">
            <Select
              value={data.priority}
              onValueChange={(value: 'low' | 'medium' | 'high') => {
                onChange({ ...data, priority: value })
              }}
            >
              <SelectTrigger id="action-priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </>
      )}
    </div>
  )
}

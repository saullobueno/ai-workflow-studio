import { Navigate, useParams } from 'react-router-dom'
import { WorkflowEditorPage } from '@/features/workflow-editor/WorkflowEditorPage'

export function WorkflowEditorRoute() {
  const { workflowId } = useParams<{ workflowId: string }>()
  if (!workflowId) return <Navigate to="/" replace />
  // key={workflowId}: remonta a página ao trocar de workflow, resetando o
  // estado local (ex.: node selecionado) sem precisar de um effect para isso.
  return <WorkflowEditorPage key={workflowId} workflowId={workflowId} />
}

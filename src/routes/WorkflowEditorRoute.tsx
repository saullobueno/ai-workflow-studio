import { Navigate, useParams } from 'react-router-dom'
import { WorkflowEditorPage } from '@/features/workflow-editor/WorkflowEditorPage'

export function WorkflowEditorRoute() {
  const { workflowId } = useParams<{ workflowId: string }>()
  if (!workflowId) return <Navigate to="/" replace />
  return <WorkflowEditorPage workflowId={workflowId} />
}

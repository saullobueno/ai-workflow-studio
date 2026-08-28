import { createBrowserRouter } from 'react-router-dom'
import { WorkflowListPage } from '@/features/workflows/WorkflowListPage'
import { NotFoundRoute } from './NotFoundRoute'
import { RootLayout } from './RootLayout'
import { WorkflowEditorRoute } from './WorkflowEditorRoute'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <WorkflowListPage /> },
      { path: 'workflows/:workflowId', element: <WorkflowEditorRoute /> },
      { path: '*', element: <NotFoundRoute /> },
    ],
  },
])

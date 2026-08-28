import { createBrowserRouter } from 'react-router-dom'
import { WorkflowListPage } from '@/features/workflows/WorkflowListPage'
import { NotFoundRoute } from './NotFoundRoute'
import { RootLayout } from './RootLayout'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <WorkflowListPage /> },
      {
        path: 'workflows/:workflowId',
        // Rota com code-splitting: o editor puxa @xyflow/react e (mais à
        // frente) Monaco/ECharts, pesados demais para entrar no bundle da
        // lista de workflows.
        lazy: () =>
          import('./WorkflowEditorRoute').then((module) => ({
            Component: module.WorkflowEditorRoute,
          })),
      },
      { path: '*', element: <NotFoundRoute /> },
    ],
  },
])

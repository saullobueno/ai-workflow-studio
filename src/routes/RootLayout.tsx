import { Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'

export function RootLayout() {
  return (
    <div className="flex h-svh flex-col">
      <Outlet />
      <Toaster richColors position="bottom-right" />
    </div>
  )
}

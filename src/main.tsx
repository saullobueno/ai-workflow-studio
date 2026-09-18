import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { applyTheme, getPreferredTheme } from './features/theme/theme-storage'

// Aplicado antes do render pra evitar flash de tema claro em quem já
// escolheu o escuro (ou cujo sistema operacional prefere escuro).
applyTheme(getPreferredTheme())

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('#root element not found in index.html')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ui/ErrorBoundary.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary
      title="Application Error"
      message="A critical error occurred. Please refresh the page or contact support if the problem persists."
    >
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import './styles/globals.css'
import App from './App.jsx'
import { ThemeProvider } from './hooks/useTheme'
import { queryClient } from './lib/react-query'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="crm-theme">
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)

/**
 * ═══════════════════════════════════════════════════════════════
 * HOOK: useTheme
 * Gerenciamento de temas (dark/light mode)
 * ═══════════════════════════════════════════════════════════════
 */

import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({
  theme: 'dark',
  setTheme: () => null,
  toggleTheme: () => null,
})

export function ThemeProvider({ children, defaultTheme = 'dark', storageKey = 'crm-theme' }) {
  const [theme, setTheme] = useState(() => {
    // Tentar ler do localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey)
      if (stored) return stored
    }
    return defaultTheme
  })

  useEffect(() => {
    const root = window.document.documentElement

    // Remover classes anteriores
    root.classList.remove('light', 'dark')

    // Adicionar nova classe
    root.classList.add(theme)

    // Atualizar data-theme
    root.setAttribute('data-theme', theme)

    // Salvar no localStorage
    localStorage.setItem(storageKey, theme)
  }, [theme, storageKey])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const value = {
    theme,
    setTheme,
    toggleTheme,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}

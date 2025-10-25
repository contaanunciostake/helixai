import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  console.log('[ProtectedRoute] Estado:', { isAuthenticated, loading })

  if (loading) {
    console.log('[ProtectedRoute] Mostrando tela de carregamento...')
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    console.log('[ProtectedRoute] ❌ Não autenticado - Redirecionando para /login')
    return <Navigate to="/login" replace />
  }

  console.log('[ProtectedRoute] ✅ Autenticado - Renderizando página protegida')
  return children
}

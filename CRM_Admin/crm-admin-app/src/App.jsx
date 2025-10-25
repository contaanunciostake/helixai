import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminLayout } from './components/layout/AdminLayout'
import { Login } from './pages/Login/Login'
import { AdminDashboard } from './pages/Dashboard/AdminDashboard'
import { CompanyManagement } from './pages/Companies/CompanyManagement'
import './App.css'

// Placeholder para páginas que serão implementadas
function PlaceholderPage({ title }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-gray-400">Em desenvolvimento...</p>
      </div>
    </div>
  )
}

function AppContent() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [user] = useState({ nome: 'Admin Master', email: 'admin@aira.com' })

  const handleLogout = () => {
    // Implementar logout
    window.location.href = '/login'
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <AdminDashboard />
      case 'analytics':
        return <PlaceholderPage title="Analytics" />
      case 'activity':
        return <PlaceholderPage title="Atividade do Sistema" />
      case 'empresas':
        return <CompanyManagement />
      case 'usuarios':
        return <PlaceholderPage title="Gestão de Usuários" />
      case 'afiliados':
        return <PlaceholderPage title="Gestão de Afiliados" />
      case 'assinaturas':
        return <PlaceholderPage title="Assinaturas" />
      case 'pagamentos':
        return <PlaceholderPage title="Pagamentos" />
      case 'comissoes':
        return <PlaceholderPage title="Comissões" />
      case 'bots':
        return <PlaceholderPage title="Monitor de Bots" />
      case 'logs':
        return <PlaceholderPage title="Logs do Sistema" />
      case 'database':
        return <PlaceholderPage title="Gestão de Banco de Dados" />
      case 'configuracoes':
        return <PlaceholderPage title="Configurações Globais" />
      default:
        return <AdminDashboard />
    }
  }

  return (
    <AdminLayout
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      user={user}
      onLogout={handleLogout}
    >
      {renderPage()}
    </AdminLayout>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rota de Login */}
          <Route path="/login" element={<Login />} />

          {/* Redirect raiz para dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Todas as rotas admin usam o mesmo layout */}
          <Route path="*" element={<ProtectedRoute><AppContent /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App


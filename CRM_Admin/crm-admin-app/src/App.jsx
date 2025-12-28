import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminLayout } from './components/layout/AdminLayout'
import { Login } from './pages/Login/Login'
import { AdminDashboard } from './pages/Dashboard/AdminDashboard'
import { CompanyManagement } from './pages/Companies/CompanyManagement'
import { Analytics } from './pages/Analytics/Analytics'
import { Activity } from './pages/Activity/Activity'
import { EmpresasAdmin } from './pages/Empresas/EmpresasAdmin'
import { UsuariosAdmin } from './pages/Usuarios/UsuariosAdmin'
import { AfiliadosAdmin } from './pages/Afiliados/AfiliadosAdmin'
import { AssinaturasAdmin } from './pages/Assinaturas/AssinaturasAdmin'
import { PagamentosAdmin } from './pages/Pagamentos/PagamentosAdmin'
import { ComissoesAdmin } from './pages/Comissoes/ComissoesAdmin'
import { BotsAdmin } from './pages/Bots/BotsAdmin'
import { WhatsAppConnection } from './pages/WhatsApp/WhatsAppConnection'
import { LogsAdmin } from './pages/Logs/LogsAdmin'
import { DatabaseAdmin } from './pages/Database/DatabaseAdmin'
import { ConfiguracoesAdmin } from './pages/Configuracoes/ConfiguracoesAdmin'
import './App.css'

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
        return <Analytics />
      case 'activity':
        return <Activity />
      case 'empresas':
        return <EmpresasAdmin />
      case 'usuarios':
        return <UsuariosAdmin />
      case 'afiliados':
        return <AfiliadosAdmin />
      case 'assinaturas':
        return <AssinaturasAdmin />
      case 'pagamentos':
        return <PagamentosAdmin />
      case 'comissoes':
        return <ComissoesAdmin />
      case 'bots':
        return <BotsAdmin />
      case 'whatsapp':
        return <WhatsAppConnection />
      case 'logs':
        return <LogsAdmin />
      case 'database':
        return <DatabaseAdmin />
      case 'configuracoes':
        return <ConfiguracoesAdmin />
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


import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AfiliadoDashboard } from './components/AfiliadoDashboard'
import { AfiliadoComissoes } from './components/AfiliadoComissoes'
import { AfiliadoSaques } from './components/AfiliadoSaques'
import { AfiliadoPerfil } from './components/AfiliadoPerfil'
import { AfiliadoLayout } from './components/AfiliadoLayout'

function App() {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/afiliados/meu-perfil', {
        credentials: 'include'
      })

      const data = await res.json()

      if (data.success) {
        setUser(data.afiliado)
      } else {
        navigate('/login')
      }
    } catch (error) {
      console.error('[ERRO] Ao verificar autenticação:', error)
      navigate('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      navigate('/login')
    } catch (error) {
      console.error('[ERRO] Ao fazer logout:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
      </div>
    )
  }

  return (
    <AfiliadoLayout
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      user={user}
      onLogout={handleLogout}
    >
      {currentPage === 'dashboard' && <AfiliadoDashboard />}
      {currentPage === 'comissoes' && <AfiliadoComissoes />}
      {currentPage === 'saques' && <AfiliadoSaques />}
      {currentPage === 'perfil' && <AfiliadoPerfil user={user} onUpdate={checkAuth} />}
    </AfiliadoLayout>
  )
}

export default App

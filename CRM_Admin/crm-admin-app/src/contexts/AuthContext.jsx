import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Ler dados do localStorage SINCRONAMENTE antes de renderizar
  const getInitialUser = () => {
    console.log('[AuthContext] 🔍 Verificando autenticação inicial...')

    // PRIMEIRO: Verificar se há dados na URL (vindos da Landing Page)
    const urlParams = new URLSearchParams(window.location.search)
    const authParam = urlParams.get('auth')

    if (authParam) {
      try {
        console.log('[AuthContext] 📨 Dados recebidos via URL da Landing Page')
        console.log('[AuthContext] 🔑 Auth param (encoded):', authParam.substring(0, 50) + '...')
        // Decodificar dados da URL (primeiro decodeURIComponent, depois atob)
        const decodedParam = decodeURIComponent(authParam)
        const userData = JSON.parse(atob(decodedParam))
        console.log('[AuthContext] ✅ Dados decodificados:', userData)
        console.log('[AuthContext] 👤 tipo:', userData.tipo)

        // Salvar no localStorage DESTA porta (5175)
        localStorage.setItem('admin_user', JSON.stringify(userData))
        localStorage.setItem('admin_isLoggedIn', 'true')
        console.log('[AuthContext] 💾 Dados salvos no localStorage da porta 5175')

        // Limpar a URL (remover o parâmetro auth)
        window.history.replaceState({}, document.title, window.location.pathname)

        return userData
      } catch (error) {
        console.error('[AuthContext] ❌ Erro ao processar dados da URL:', error)
      }
    }

    // SEGUNDO: Verificar localStorage normal (para refreshs ou login direto)
    try {
      const storedUser = localStorage.getItem('admin_user')
      const isLoggedIn = localStorage.getItem('admin_isLoggedIn')

      console.log('[AuthContext] 📦 Dados do localStorage:', {
        admin_user: storedUser ? 'Existe' : 'Não existe',
        admin_isLoggedIn: isLoggedIn
      })

      if (storedUser && isLoggedIn === 'true') {
        const userData = JSON.parse(storedUser)
        console.log('[AuthContext] ✅ Usuário já autenticado no carregamento:', userData.email)
        return userData
      }
    } catch (error) {
      console.error('[AuthContext] ❌ Erro ao carregar dados iniciais:', error)
      localStorage.removeItem('admin_user')
      localStorage.removeItem('admin_isLoggedIn')
    }

    console.log('[AuthContext] ❌ Nenhum usuário autenticado')
    return null
  }

  const [user, setUser] = useState(getInitialUser)
  const [loading, setLoading] = useState(false) // Já não precisa de loading inicial

  // Listener para mudanças no localStorage (opcional, para detectar login em outra aba)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'admin_user' || e.key === 'admin_isLoggedIn') {
        console.log('[AuthContext] Detectada mudança no localStorage')
        const storedUser = localStorage.getItem('admin_user')
        const isLoggedIn = localStorage.getItem('admin_isLoggedIn')

        if (storedUser && isLoggedIn === 'true') {
          try {
            setUser(JSON.parse(storedUser))
          } catch (error) {
            console.error('[AuthContext] Erro ao processar mudança:', error)
            setUser(null)
          }
        } else {
          setUser(null)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Login
  const login = (userData) => {
    const adminData = {
      id: userData.id,
      nome: userData.nome || 'Administrador',
      email: userData.email,
      tipo: userData.tipo || 'super_admin',
      funcao: userData.funcao || 'Super Administrador',
      avatar: userData.avatar || null,
      token: userData.token,
      loginTime: userData.loginTime || new Date().toISOString()
    }

    setUser(adminData)
    localStorage.setItem('admin_user', JSON.stringify(adminData))
    localStorage.setItem('admin_token', adminData.token || '')
    localStorage.setItem('admin_isLoggedIn', 'true')
  }

  // Logout
  const logout = () => {
    setUser(null)
    localStorage.removeItem('admin_user')
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_isLoggedIn')
    // Redirecionar para a landing page
    window.location.href = 'http://localhost:5174'
  }

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

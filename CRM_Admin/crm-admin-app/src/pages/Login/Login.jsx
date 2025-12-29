import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { ShieldCheck, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/auth'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha: password })
      })

      const result = await response.json()

      if (result.success) {
        const userData = {
          ...result.usuario,
          token: result.token,
          loginTime: new Date().toISOString()
        }

        // Verificar se e super_admin
        if (userData.tipo !== 'super_admin') {
          // Nao e admin - redirecionar para painel cliente
          localStorage.setItem('crm_user', JSON.stringify(userData))
          localStorage.setItem('crm_token', result.token)
          localStorage.setItem('crm_isLoggedIn', 'true')
          setError('Acesso negado. Este painel e exclusivo para administradores.')
          setLoading(false)

          // Redirecionar para painel cliente apos 2 segundos
          setTimeout(() => {
            window.location.replace('http://localhost:5177')
          }, 2000)
          return
        }

        // E super_admin - pode acessar
        localStorage.setItem('admin_user', JSON.stringify(userData))
        localStorage.setItem('admin_token', result.token)
        localStorage.setItem('admin_isLoggedIn', 'true')

        login(userData)
        navigate('/dashboard')
      } else {
        setError(result.message || 'Email ou senha incorretos')
      }
    } catch (err) {
      console.error('[Admin Login] Erro:', err)
      setError('Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  // Login rapido com credenciais demo (para testes)
  const loginDemo = async () => {
    setEmail('admin@aira.com')
    setPassword('Admin@123')

    // Simular submit
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@aira.com', senha: 'Admin@123' })
      })

      const result = await response.json()

      if (result.success) {
        const userData = {
          ...result.usuario,
          token: result.token,
          loginTime: new Date().toISOString()
        }

        if (userData.tipo !== 'super_admin') {
          setError('Usuario demo nao e administrador')
          setLoading(false)
          return
        }

        localStorage.setItem('admin_user', JSON.stringify(userData))
        localStorage.setItem('admin_token', result.token)
        localStorage.setItem('admin_isLoggedIn', 'true')

        login(userData)
        navigate('/dashboard')
      } else {
        setError(result.message || 'Credenciais demo invalidas')
      }
    } catch (err) {
      setError('Erro ao conectar. Verifique se o backend esta rodando.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a2332] to-[#0f1419] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo e Titulo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl mb-4 shadow-lg shadow-purple-500/50">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            AIra Admin
          </h1>
          <p className="text-gray-400 mt-2">
            Painel de Administracao Master
          </p>
        </div>

        {/* Card de Login */}
        <Card className="shadow-xl border-[#2d3748] bg-[#1a2332]">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-white">
              Acesso Restrito
            </CardTitle>
            <CardDescription className="text-center text-gray-400">
              Entre com suas credenciais de super administrador
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@aira.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0f1419] border border-[#2d3748] rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-white placeholder:text-gray-600"
                    required
                  />
                </div>
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-2.5 bg-[#0f1419] border border-[#2d3748] rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-white placeholder:text-gray-600"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Mensagem de Erro */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              {/* Botao de Login */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-2.5 rounded-lg transition-all shadow-lg hover:shadow-xl"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Verificando...
                  </div>
                ) : (
                  'Entrar no Painel Admin'
                )}
              </Button>

              {/* Divisor */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#2d3748]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[#1a2332] text-gray-500">ou</span>
                </div>
              </div>

              {/* Login Demo */}
              <Button
                type="button"
                onClick={loginDemo}
                variant="outline"
                className="w-full border-2 border-[#2d3748] bg-transparent hover:bg-[#253447] text-white font-medium py-2.5 rounded-lg transition-all"
                disabled={loading}
              >
                Entrar como Admin Demo
              </Button>
            </form>

            {/* Aviso */}
            <div className="mt-6 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
              <p className="text-sm text-yellow-400 font-medium mb-2">
                ⚠️ Acesso Restrito
              </p>
              <p className="text-xs text-yellow-300">
                Este painel e exclusivo para super administradores.
                Usuarios comuns serao redirecionados para o painel cliente.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>AIra CRM Admin © 2025 - Powered by Helix AI</p>
        </div>
      </div>
    </div>
  )
}

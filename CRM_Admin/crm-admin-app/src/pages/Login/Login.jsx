import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { ShieldCheck, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

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

    // Simular delay de autenticação
    await new Promise(resolve => setTimeout(resolve, 500))

    // Verificar credenciais
    if (email === 'admin@vendeai.com' && password === 'admin123') {
      const userData = {
        nome: 'Pauline Seitz',
        email: email,
        funcao: 'Web Designer',
        avatar: null
      }

      login(userData)
      setLoading(false)
      navigate('/dashboard')
    } else {
      setError('Email ou senha incorretos')
      setLoading(false)
    }
  }

  // Login rápido com credenciais demo
  const loginDemo = async () => {
    setEmail('admin@vendeai.com')
    setPassword('admin123')
    setLoading(true)

    await new Promise(resolve => setTimeout(resolve, 300))

    const userData = {
      nome: 'Pauline Seitz',
      email: 'admin@vendeai.com',
      funcao: 'Web Designer',
      avatar: null
    }

    login(userData)
    setLoading(false)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a2332] to-[#0f1419] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl mb-4 shadow-lg shadow-purple-500/50">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            CRM Admin
          </h1>
          <p className="text-gray-400 mt-2">
            Painel de Administração
          </p>
        </div>

        {/* Card de Login */}
        <Card className="shadow-xl border-[#2d3748] bg-[#1a2332]">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-white">
              Bem-vindo
            </CardTitle>
            <CardDescription className="text-center text-gray-400">
              Entre com suas credenciais de administrador
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
                    placeholder="admin@vendeai.com"
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
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Botão de Login */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-2.5 rounded-lg transition-all shadow-lg hover:shadow-xl"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Entrando...
                  </div>
                ) : (
                  'Entrar'
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

              {/* Login Rápido */}
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

            {/* Informações */}
            <div className="mt-6 p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
              <p className="text-sm text-purple-400 font-medium mb-2">
                💡 Credenciais de Teste
              </p>
              <p className="text-xs text-purple-300">
                Email: admin@vendeai.com<br />
                Senha: admin123
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>VendeAI CRM Admin © 2025 - Powered by Helix AI</p>
        </div>
      </div>
    </div>
  )
}

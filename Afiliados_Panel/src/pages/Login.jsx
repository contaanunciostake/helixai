import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Award, Mail, Lock, ArrowRight } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', senha: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // ✅ Usar endpoint específico de afiliados
      const res = await fetch('http://localhost:5000/api/afiliados/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (data.success) {
        // Salvar token e dados do afiliado no localStorage
        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('afiliado', JSON.stringify(data.afiliado))

        console.log('[LOGIN] Afiliado autenticado:', data.afiliado)

        // Redirecionar para dashboard
        navigate('/')
      } else {
        setError(data.message || 'Erro ao fazer login')
      }
    } catch (error) {
      console.error('[ERRO] Login:', error)
      setError('Erro ao conectar ao servidor. Verifique se o backend está rodando.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              width: `${Math.random() * 3}px`,
              height: `${Math.random() * 3}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.3,
            }}
          />
        ))}

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 mb-4">
            <Award className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Painel do Afiliado</h1>
          <p className="text-gray-400">Acesse sua conta AIRA Afiliados</p>
        </div>

        {/* Form */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-black/40 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  className="w-full bg-black/40 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg font-semibold text-white shadow-lg shadow-green-500/50 hover:shadow-green-500/70 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Entrando...' : (
                <>
                  Entrar
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Ainda não é afiliado?{' '}
              <a href="http://localhost:5173/afiliados" className="text-green-400 hover:text-green-300 font-semibold">
                Cadastre-se
              </a>
            </p>
          </div>

          {/* Credenciais de Teste */}
          <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-green-400 font-semibold text-sm mb-2">🧪 Credenciais de Teste:</p>
            <div className="space-y-1 text-xs">
              <p className="text-gray-300">
                <span className="text-gray-500">Email:</span>{' '}
                <code className="text-green-400 bg-black/40 px-2 py-1 rounded">afiliado@teste.com</code>
              </p>
              <p className="text-gray-300">
                <span className="text-gray-500">Senha:</span>{' '}
                <code className="text-green-400 bg-black/40 px-2 py-1 rounded">123456</code>
              </p>
            </div>
            <p className="text-gray-500 text-xs mt-2">
              Execute o SQL: <code className="text-gray-400">criar_afiliado_teste.sql</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

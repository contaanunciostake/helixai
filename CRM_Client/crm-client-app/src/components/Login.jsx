import { useState, useEffect } from 'react'

const API_URL = 'http://localhost:5000/api/auth'

export function Login({ onLogin }) {
  // Estados gerais
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Estados para criar senha (primeira vez)
  const [isFirstTime, setIsFirstTime] = useState(false)
  const [token, setToken] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', color: '' })

  // Detectar se veio de pagamento (precisa criar senha)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const emailParam = urlParams.get('email')
    const tokenParam = urlParams.get('token')
    const fromPayment = urlParams.get('from') === 'payment'

    if (emailParam && tokenParam && fromPayment) {
      setIsFirstTime(true)
      setEmail(emailParam)
      setToken(tokenParam)
    }
  }, [])

  // Avaliar força da senha
  useEffect(() => {
    if (!password) {
      setPasswordStrength({ score: 0, text: '', color: '' })
      return
    }

    let score = 0
    if (password.length >= 8) score++
    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^a-zA-Z0-9]/.test(password)) score++

    const strength = [
      { score: 1, text: 'Muito fraca', color: '#ef4444' },
      { score: 2, text: 'Fraca', color: '#f97316' },
      { score: 3, text: 'Média', color: '#eab308' },
      { score: 4, text: 'Forte', color: '#10b981' },
      { score: 5, text: 'Muito forte', color: '#059669' }
    ][score - 1] || { score: 0, text: '', color: '' }

    setPasswordStrength(strength)
  }, [password])

  // Criar senha (primeira vez após pagamento)
  const handleCreatePassword = async (e) => {
    e.preventDefault()
    setError('')

    // Validações
    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    if (password.length < 8) {
      setError('Senha deve ter no mínimo 8 caracteres')
      return
    }

    if (!/[A-Z]/.test(password)) {
      setError('Senha deve conter pelo menos 1 letra maiúscula')
      return
    }

    if (!/[a-z]/.test(password)) {
      setError('Senha deve conter pelo menos 1 letra minúscula')
      return
    }

    if (!/[0-9]/.test(password)) {
      setError('Senha deve conter pelo menos 1 número')
      return
    }

    if (!/[^a-zA-Z0-9]/.test(password)) {
      setError('Senha deve conter pelo menos 1 caractere especial (!@#$%...)')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/definir-senha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          senha: password,
          confirmar_senha: confirmPassword,
          token
        })
      })

      const result = await response.json()

      if (result.success) {
        // Senha criada! Agora fazer login automaticamente
        try {
          const loginResponse = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha: password })
          })

          const loginResult = await loginResponse.json()

          if (loginResult.success) {
            const userData = {
              ...loginResult.usuario,
              token: loginResult.token,
              loginTime: new Date().toISOString()
            }

            localStorage.setItem('crm_user', JSON.stringify(userData))
            localStorage.setItem('crm_token', loginResult.token)
            localStorage.setItem('crm_isLoggedIn', 'true')

            // Limpar URL
            window.history.replaceState({}, document.title, window.location.pathname)

            // Chamar onLogin - o App.jsx vai verificar se precisa setup
            onLogin(userData)
          } else {
            // Se login automático falhar, mostrar tela de login
            setIsFirstTime(false)
            setPassword('')
            setError('Senha criada! Faça login para continuar')
          }
        } catch (loginErr) {
          // Se login automático falhar, mostrar tela de login
          setIsFirstTime(false)
          setPassword('')
          setError('Senha criada! Faça login para continuar')
        }
      } else {
        setError(result.message || 'Erro ao criar senha')
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  // Login normal
  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

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

        localStorage.setItem('crm_user', JSON.stringify(userData))
        localStorage.setItem('crm_token', result.token)
        localStorage.setItem('crm_isLoggedIn', 'true')

        onLogin(userData)
      } else {
        setError(result.message || 'Email ou senha incorretos')
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  // Renderizar formulário de criar senha (primeira vez)
  if (isFirstTime) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-black">
        {/* Grid pattern */}
        <div className="fixed inset-0 z-0" style={{
          backgroundImage: `
            linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '4rem 4rem',
          maskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, #000 70%, transparent 110%)'
        }}></div>

        {/* Stars */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          {Array.from({ length: 100 }).map((_, i) => (
            <div
              key={i}
              className="star"
              style={{
                position: 'absolute',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: '2px',
                height: '2px',
                background: 'white',
                borderRadius: '50%',
                animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite ${Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        {/* Container principal - LAYOUT DE DUAS COLUNAS */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
          <div className="w-full max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">

              {/* COLUNA ESQUERDA - Mensagem de Boas-Vindas e Compra Finalizada */}
              <div className="space-y-8 animate-fade-in">
                {/* Ícone de Sucesso GIGANTE com animação */}
                <div className="relative inline-block">
                  {/* Anéis pulsantes */}
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute inset-0 rounded-full border-4 border-green-400"
                      style={{
                        animation: `pulse-ring ${2 + i * 0.5}s ease-out infinite ${i * 0.3}s`,
                        opacity: 0
                      }}
                    />
                  ))}

                  {/* Ícone principal */}
                  <div className="relative w-40 h-40 flex items-center justify-center rounded-full animate-bounce-slow" style={{
                    background: 'linear-gradient(135deg, #10b981, #34d399, #6ee7b7)',
                    boxShadow: '0 20px 60px rgba(16, 185, 129, 0.6), 0 0 100px rgba(16, 185, 129, 0.4)'
                  }}>
                    <span className="text-8xl animate-scale-pulse">✓</span>
                  </div>
                </div>

                {/* Badge "Pagamento Aprovado" */}
                <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl animate-slide-down" style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(52, 211, 153, 0.2))',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid rgba(16, 185, 129, 0.5)',
                  boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)'
                }}>
                  <span className="text-2xl font-black tracking-wider" style={{
                    background: 'linear-gradient(135deg, #10b981, #34d399, #6ee7b7)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textShadow: '0 0 30px rgba(16, 185, 129, 0.5)'
                  }}>
                    ✨ PAGAMENTO APROVADO! ✨
                  </span>
                </div>

                {/* Título Principal GIGANTE */}
                <div className="space-y-4">
                  <h1 className="text-6xl lg:text-7xl font-black animate-fade-in" style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textShadow: '0 0 60px rgba(16, 185, 129, 0.4)',
                    letterSpacing: '-0.02em',
                    lineHeight: '1.1'
                  }}>
                    Bem-vindo ao AIra!
                  </h1>

                  <h2 className="text-3xl font-bold animate-fade-in-delay" style={{
                    color: '#10b981',
                    textShadow: '0 0 20px rgba(16, 185, 129, 0.3)'
                  }}>
                    Compra Finalizada com Sucesso
                  </h2>
                </div>

                {/* Info da Compra */}
                <div className="space-y-4 animate-fade-in-delay-2">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(52, 211, 153, 0.2))',
                      border: '2px solid rgba(16, 185, 129, 0.3)'
                    }}>
                      <span className="text-2xl">🎉</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1" style={{ color: 'white' }}>
                        Sua conta foi criada!
                      </h3>
                      <p className="text-lg" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Agora você tem acesso ao sistema de automação mais completo para o seu negócio.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(52, 211, 153, 0.2))',
                      border: '2px solid rgba(16, 185, 129, 0.3)'
                    }}>
                      <span className="text-2xl">🤖</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1" style={{ color: 'white' }}>
                        Próximos Passos
                      </h3>
                      <p className="text-lg" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Configure seu bot de atendimento, escolha seu nicho e comece a automatizar suas vendas.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Barra de Progresso */}
                <div className="space-y-3 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold" style={{ color: '#10b981' }}>
                      Progresso da Configuração
                    </span>
                    <span className="text-sm font-bold" style={{ color: '#10b981' }}>
                      50%
                    </span>
                  </div>
                  <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full w-1/2 rounded-full animate-progress" style={{
                      background: 'linear-gradient(90deg, #10b981, #34d399, #6ee7b7)',
                      boxShadow: '0 0 20px rgba(16, 185, 129, 0.6)'
                    }}></div>
                  </div>
                  <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    Passo 1 de 2: Definir senha para acessar o painel
                  </p>
                </div>
              </div>

              {/* COLUNA DIREITA - Formulário de Criação de Senha */}
              <div className="rounded-3xl p-10 transition-all duration-300 animate-slide-left" style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(30px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)'
              }}>
                <div className="mb-8">
                  <h2 className="text-3xl font-black mb-2" style={{ color: 'white' }}>
                    Crie sua Senha
                  </h2>
                  <p className="text-base" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    Proteja sua conta com uma senha forte e segura
                  </p>
                </div>

                <form onSubmit={handleCreatePassword} className="space-y-6">
                {/* Email (readonly) */}
                <div>
                  <label className="block mb-2 text-sm font-semibold" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    readOnly
                    className="w-full px-4 py-3 rounded-xl transition-all"
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '2px solid rgba(255, 255, 255, 0.1)',
                      color: 'rgba(255, 255, 255, 0.6)'
                    }}
                  />
                </div>

                {/* Nova Senha */}
                <div>
                  <label className="block mb-2 text-sm font-semibold" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                    Nova Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className="w-full px-4 py-3 pr-12 rounded-xl transition-all"
                      style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '2px solid rgba(255, 255, 255, 0.1)',
                        color: 'white'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#10b981'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2"
                      style={{ color: 'rgba(255, 255, 255, 0.4)' }}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>

                  {/* Indicador de força */}
                  {password && (
                    <div className="mt-3 space-y-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className="h-1 flex-1 rounded transition-all"
                            style={{
                              background: i <= passwordStrength.score ? passwordStrength.color : 'rgba(255, 255, 255, 0.1)'
                            }}
                          />
                        ))}
                      </div>
                      <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                        Força: <span className="font-semibold" style={{ color: passwordStrength.color }}>
                          {passwordStrength.text}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirmar Senha */}
                <div>
                  <label className="block mb-2 text-sm font-semibold" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                    Confirmar Senha
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Digite a senha novamente"
                    className="w-full px-4 py-3 rounded-xl transition-all"
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '2px solid rgba(255, 255, 255, 0.1)',
                      color: 'white'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#10b981'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                    required
                  />
                </div>

                {/* Erro */}
                {error && (
                  <div className="p-4 rounded-xl flex items-center gap-3 animate-slideIn" style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '2px solid rgba(239, 68, 68, 0.4)',
                    color: '#ef4444'
                  }}>
                    <span>⚠</span>
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                {/* Botão */}
                <button
                  type="submit"
                  className="w-full py-4 rounded-xl font-bold text-lg transition-all relative overflow-hidden group"
                  style={{
                    background: 'linear-gradient(135deg, #059669, #10b981, #34d399)',
                    boxShadow: '0 10px 40px rgba(16, 185, 129, 0.4)'
                  }}
                  disabled={loading}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 20px 60px rgba(16, 185, 129, 0.6)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 10px 40px rgba(16, 185, 129, 0.4)'}
                >
                  <span className="relative z-10">
                    {loading ? 'Criando...' : 'Criar Senha e Acessar'}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity" />
                </button>

                {/* Requisitos */}
                <div className="p-4 rounded-xl" style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.2)'
                }}>
                  <p className="text-sm font-semibold mb-2" style={{ color: '#10b981' }}>
                    Requisitos da senha:
                  </p>
                  <ul className="text-xs space-y-1" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    <li>• Mínimo 8 caracteres</li>
                    <li>• Letra maiúscula (A-Z)</li>
                    <li>• Letra minúscula (a-z)</li>
                    <li>• Número (0-9)</li>
                    <li>• Caractere especial (!@#$%...)</li>
                  </ul>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos CSS inline para animações */}
      <style>{`
          @keyframes twinkle {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.5); }
          }

          @keyframes slideIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .animate-slideIn {
            animation: slideIn 0.3s ease;
          }

          /* NOVAS ANIMAÇÕES SUPER CHAMATIVAS */
          @keyframes pulse-ring {
            0% {
              transform: scale(1);
              opacity: 0.8;
            }
            50% {
              transform: scale(1.5);
              opacity: 0.4;
            }
            100% {
              transform: scale(2);
              opacity: 0;
            }
          }

          @keyframes bounce-slow {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-20px);
            }
          }

          .animate-bounce-slow {
            animation: bounce-slow 2s ease-in-out infinite;
          }

          @keyframes scale-pulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
          }

          .animate-scale-pulse {
            animation: scale-pulse 1.5s ease-in-out infinite;
          }

          @keyframes slide-down {
            from {
              opacity: 0;
              transform: translateY(-30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-slide-down {
            animation: slide-down 0.8s ease-out;
          }

          @keyframes slide-left {
            from {
              opacity: 0;
              transform: translateX(50px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          .animate-slide-left {
            animation: slide-left 0.8s ease-out;
          }

          @keyframes fade-in {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          .animate-fade-in {
            animation: fade-in 1s ease-out;
          }

          .animate-fade-in-delay {
            animation: fade-in 1s ease-out 0.3s both;
          }

          .animate-fade-in-delay-2 {
            animation: fade-in 1s ease-out 0.6s both;
          }

          @keyframes progress {
            from {
              width: 0%;
            }
            to {
              width: 100%;
            }
          }

          .animate-progress {
            animation: progress 2s ease-out;
          }

          input::placeholder {
            color: rgba(255, 255, 255, 0.4);
          }
        `}</style>
      </div>
    )
  }

  // Renderizar login normal
  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Grid pattern */}
      <div className="fixed inset-0 z-0" style={{
        backgroundImage: `
          linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '4rem 4rem',
        maskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, #000 70%, transparent 110%)'
      }}></div>

      {/* Stars */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: '2px',
              height: '2px',
              background: 'white',
              borderRadius: '50%',
              animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite ${Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Container principal */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo e header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 rounded-2xl" style={{
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}>
              <div className="w-10 h-10 flex items-center justify-center rounded-lg" style={{
                background: 'rgba(255, 255, 255, 0.1)'
              }}>
                <span className="text-2xl">◆</span>
              </div>
              <span className="text-xl font-bold" style={{
                background: 'linear-gradient(135deg, #10b981, #34d399)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                AIra
              </span>
            </div>
            <h1 className="text-4xl font-extrabold mb-3" style={{
              background: 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Bem-vindo de Volta
            </h1>
            <p className="text-lg" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Sistema de Gestão de Vendas com IA
            </p>
          </div>

          {/* Card */}
          <div className="rounded-3xl p-8 transition-all duration-300" style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)'
          }}>
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block mb-2 text-sm font-semibold" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 rounded-xl transition-all"
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                    color: 'white'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#10b981'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                  required
                />
              </div>

              {/* Senha */}
              <div>
                <label className="block mb-2 text-sm font-semibold" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-12 rounded-xl transition-all"
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '2px solid rgba(255, 255, 255, 0.1)',
                      color: 'white'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#10b981'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2"
                    style={{ color: 'rgba(255, 255, 255, 0.4)' }}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {/* Erro */}
              {error && (
                <div className="p-4 rounded-xl flex items-center gap-3 animate-slideIn" style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '2px solid rgba(239, 68, 68, 0.4)',
                  color: '#ef4444'
                }}>
                  <span>⚠</span>
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Botão */}
              <button
                type="submit"
                className="w-full py-4 rounded-xl font-bold text-lg transition-all relative overflow-hidden group"
                style={{
                  background: 'linear-gradient(135deg, #059669, #10b981, #34d399)',
                  boxShadow: '0 10px 40px rgba(16, 185, 129, 0.4)'
                }}
                disabled={loading}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 20px 60px rgba(16, 185, 129, 0.6)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 10px 40px rgba(16, 185, 129, 0.4)'}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Entrando...</span>
                  </div>
                ) : (
                  <span className="relative z-10">Entrar</span>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity" />
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center text-sm" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              <p>AIra CRM © 2025 - Powered by Helix AI</p>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos CSS inline para animações */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease;
        }

        input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  )
}

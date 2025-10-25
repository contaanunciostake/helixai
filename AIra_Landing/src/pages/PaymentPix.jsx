import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { QrCode, Copy, CheckCircle, Clock, AlertCircle, ArrowLeft } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

function PaymentPix() {
  const navigate = useNavigate()
  const location = useLocation()
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutos em segundos
  const [paymentStatus, setPaymentStatus] = useState('pending') // pending, checking, approved, expired

  // Dados do PIX vindos da navegação
  const pixData = location.state?.pixData || {}
  const {
    qr_code,
    qr_code_base64,
    payment_id,
    status,
    transaction_amount
  } = pixData

  // Verificar se tem dados do PIX
  useEffect(() => {
    if (!qr_code && !qr_code_base64) {
      console.error('[PIX] Nenhum dado de PIX encontrado')
      // Redirecionar para home se não tiver dados
      setTimeout(() => navigate('/'), 2000)
    }
  }, [qr_code, qr_code_base64, navigate])

  // Timer do PIX (10 minutos)
  useEffect(() => {
    if (timeLeft <= 0) {
      setPaymentStatus('expired')
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setPaymentStatus('expired')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  // Verificar status do pagamento a cada 5 segundos
  useEffect(() => {
    if (!payment_id || paymentStatus !== 'pending') return

    const checkPayment = async () => {
      try {
        setPaymentStatus('checking')

        // Chamar API para verificar status
        const response = await fetch(`http://localhost:5000/api/assinatura/status/pagamento/${payment_id}`)
        const data = await response.json()

        if (data.success && data.status === 'approved') {
          setPaymentStatus('approved')
          // Redirecionar para página de sucesso
          setTimeout(() => {
            navigate('/pagamento/sucesso', {
              state: {
                fromPix: true,
                payment_id
              }
            })
          }, 2000)
        } else {
          setPaymentStatus('pending')
        }
      } catch (error) {
        console.error('[PIX] Erro ao verificar status:', error)
        setPaymentStatus('pending')
      }
    }

    // Verificar a cada 5 segundos
    const interval = setInterval(checkPayment, 5000)

    return () => clearInterval(interval)
  }, [payment_id, paymentStatus, navigate])

  // Copiar código PIX
  const handleCopyPixCode = () => {
    if (qr_code) {
      navigator.clipboard.writeText(qr_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

  // Formatar tempo restante
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute bg-white rounded-full"
            style={{
              width: `${Math.random() * 3}px`,
              height: `${Math.random() * 3}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3
            }}
          />
        ))}

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

        {/* Gradient Orbs - Cores do PIX */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Botão Voltar */}
          <motion.button
            onClick={() => navigate(-1)}
            className="absolute top-0 left-0 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            whileHover={{ x: -5 }}
          >
            <ArrowLeft className="h-5 w-5" />
            Voltar
          </motion.button>

          {/* Status Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center mb-8"
          >
            <div className="relative">
              <div className={`absolute inset-0 rounded-full blur-2xl opacity-60 animate-pulse ${
                paymentStatus === 'approved' ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
                paymentStatus === 'expired' ? 'bg-gradient-to-br from-red-500 to-orange-500' :
                'bg-gradient-to-br from-cyan-500 to-teal-500'
              }`} />
              <div className={`relative w-32 h-32 rounded-full flex items-center justify-center ${
                paymentStatus === 'approved' ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
                paymentStatus === 'expired' ? 'bg-gradient-to-br from-red-500 to-orange-500' :
                'bg-gradient-to-br from-cyan-500 to-teal-500'
              }`}>
                {paymentStatus === 'approved' ? (
                  <CheckCircle className="h-20 w-20 text-white" strokeWidth={2.5} />
                ) : paymentStatus === 'expired' ? (
                  <AlertCircle className="h-20 w-20 text-white" strokeWidth={2.5} />
                ) : (
                  <QrCode className="h-20 w-20 text-white" strokeWidth={2.5} />
                )}
              </div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-4">
              <span className={`bg-gradient-to-r bg-clip-text text-transparent ${
                paymentStatus === 'approved' ? 'from-green-400 via-emerald-400 to-blue-400' :
                paymentStatus === 'expired' ? 'from-red-400 via-orange-400 to-yellow-400' :
                'from-cyan-400 via-teal-400 to-blue-400'
              }`}>
                {paymentStatus === 'approved' ? 'Pagamento Aprovado!' :
                 paymentStatus === 'expired' ? 'QR Code Expirado' :
                 'Pague com PIX'}
              </span>
            </h1>
            <p className="text-2xl text-gray-300 mb-8">
              {paymentStatus === 'approved' ? 'Seu pagamento foi confirmado' :
               paymentStatus === 'expired' ? 'Solicite um novo código' :
               transaction_amount ? `R$ ${transaction_amount.toFixed(2)}` : 'Escaneie o QR Code abaixo'}
            </p>
          </motion.div>

          {/* PIX Card */}
          {paymentStatus !== 'approved' && paymentStatus !== 'expired' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative mb-8"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-3xl blur-xl" />
              <div className="relative bg-black/40 backdrop-blur-xl border border-cyan-500/50 p-8 rounded-3xl">

                {/* Timer */}
                <div className="mb-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="h-5 w-5 text-cyan-400" />
                    <p className="text-cyan-400 font-mono text-2xl font-bold">
                      {formatTime(timeLeft)}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Tempo restante para pagamento</p>
                </div>

                {/* Instruções de Escaneamento */}
                <div className="mb-4 p-3 bg-gradient-to-r from-cyan-500/20 to-green-500/20 border border-cyan-500/30 rounded-xl">
                  <div className="flex items-center gap-2 justify-center">
                    <QrCode className="h-5 w-5 text-cyan-400" />
                    <p className="text-sm font-semibold text-cyan-300">
                      Aponte a câmera do seu celular para o QR Code abaixo
                    </p>
                  </div>
                </div>

                {/* QR Code - TAMANHO AUMENTADO PARA FACILITAR ESCANEAMENTO */}
                {qr_code_base64 && (
                  <div className="mb-8 flex justify-center">
                    <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-2xl">
                      <img
                        src={`data:image/png;base64,${qr_code_base64}`}
                        alt="QR Code PIX"
                        className="w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96"
                      />
                    </div>
                  </div>
                )}

                {/* Código PIX Copia e Cola */}
                {qr_code && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-400 mb-2">Ou copie o código PIX:</p>
                    <div className="relative">
                      <input
                        type="text"
                        value={qr_code}
                        readOnly
                        className="w-full bg-gray-900/50 border border-cyan-500/30 rounded-xl px-4 py-3 text-gray-300 font-mono text-sm pr-12"
                      />
                      <button
                        onClick={handleCopyPixCode}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-cyan-500/20 rounded-lg transition-colors"
                      >
                        {copied ? (
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        ) : (
                          <Copy className="h-5 w-5 text-cyan-400" />
                        )}
                      </button>
                    </div>
                    {copied && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-green-400 mt-2"
                      >
                        ✓ Código copiado!
                      </motion.p>
                    )}
                  </div>
                )}

                {/* Instruções */}
                <div className="text-left">
                  <h3 className="text-lg font-bold text-white mb-3">Como pagar:</h3>
                  <ol className="space-y-2 text-gray-300 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="bg-cyan-500/20 text-cyan-400 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-xs">1</span>
                      <span>Abra o app do seu banco</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-cyan-500/20 text-cyan-400 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-xs">2</span>
                      <span>Escolha pagar com PIX</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-cyan-500/20 text-cyan-400 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-xs">3</span>
                      <span>Escaneie o QR Code ou cole o código</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-cyan-500/20 text-cyan-400 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-xs">4</span>
                      <span>Confirme o pagamento</span>
                    </li>
                  </ol>
                </div>

                {/* Status de verificação */}
                {paymentStatus === 'checking' && (
                  <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                      <p className="text-sm text-blue-400">Verificando pagamento...</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Informações de Suporte */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center"
          >
            <p className="text-gray-400">
              Após o pagamento, você receberá a confirmação automaticamente
            </p>
            <p className="text-gray-400 mt-2">
              Problemas?{' '}
              <a href="mailto:suporte@aira.com.br" className="text-cyan-400 hover:text-cyan-300 underline">
                Entre em contato com o suporte
              </a>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default PaymentPix

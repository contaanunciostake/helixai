import { motion } from 'framer-motion'
import { XCircle, RefreshCw, ArrowLeft, HelpCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function PaymentFailure() {
  const navigate = useNavigate()

  const handleTryAgain = () => {
    navigate('/')
    setTimeout(() => {
      // Scroll to pricing section
      const pricingSection = document.getElementById('pricing')
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
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

        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Error Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center mb-8"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-pink-500 rounded-full blur-2xl opacity-60 animate-pulse" />
              <div className="relative bg-gradient-to-br from-red-500 to-pink-500 w-32 h-32 rounded-full flex items-center justify-center">
                <XCircle className="h-20 w-20 text-white" strokeWidth={2.5} />
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
              <span className="bg-gradient-to-r from-red-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
                Pagamento Não Aprovado
              </span>
            </h1>
            <p className="text-2xl text-gray-300 mb-8">
              Não foi possível processar seu pagamento
            </p>
          </motion.div>

          {/* Error Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative mb-8"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-3xl blur-xl" />
            <div className="relative bg-black/40 backdrop-blur-xl border border-red-500/50 p-8 rounded-3xl">
              <div className="flex items-start gap-3 mb-6">
                <HelpCircle className="h-6 w-6 text-red-400 flex-shrink-0 mt-1" />
                <div className="text-left">
                  <h2 className="text-xl font-bold text-white mb-2">Por que isso aconteceu?</h2>
                  <p className="text-gray-300 mb-4">
                    Existem alguns motivos comuns para o pagamento ser recusado:
                  </p>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0 mt-2" />
                      <span>Cartão com saldo insuficiente</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0 mt-2" />
                      <span>Dados do cartão incorretos ou expirados</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0 mt-2" />
                      <span>Bloqueio de segurança do banco/operadora</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0 mt-2" />
                      <span>Limite do cartão atingido</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <p className="text-sm text-gray-400 text-center">
                  💡 Tente usar outro cartão ou forma de pagamento
                </p>
              </div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              onClick={handleTryAgain}
              className="px-8 py-4 bg-gradient-to-r from-red-600 via-pink-600 to-rose-600 hover:from-red-700 hover:via-pink-700 hover:to-rose-700 rounded-xl font-bold text-lg transition-all shadow-2xl shadow-red-500/50 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className="h-5 w-5" />
              Tentar Novamente
            </motion.button>
            <motion.button
              onClick={() => navigate('/')}
              className="px-8 py-4 border-2 border-red-500 hover:bg-red-500/10 rounded-xl font-bold text-lg transition-all backdrop-blur-sm flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="h-5 w-5" />
              Voltar à Home
            </motion.button>
          </motion.div>

          {/* Support */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl backdrop-blur-sm">
              <p className="text-gray-300 mb-2">
                Precisa de ajuda?
              </p>
              <a
                href="mailto:suporte@aira.com.br"
                className="text-purple-400 hover:text-purple-300 underline font-semibold"
              >
                Entre em contato com nosso suporte
              </a>
              <p className="text-sm text-gray-500 mt-2">
                WhatsApp: (11) 99999-9999
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default PaymentFailure

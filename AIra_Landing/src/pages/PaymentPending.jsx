import { motion } from 'framer-motion'
import { Clock, Mail, AlertCircle, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function PaymentPending() {
  const navigate = useNavigate()

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
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
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
          {/* Pending Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center mb-8"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full blur-2xl opacity-60 animate-pulse" />
              <div className="relative bg-gradient-to-br from-yellow-500 to-orange-500 w-32 h-32 rounded-full flex items-center justify-center">
                <Clock className="h-20 w-20 text-white" strokeWidth={2.5} />
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
              <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
                Pagamento em Análise
              </span>
            </h1>
            <p className="text-2xl text-gray-300 mb-8">
              Estamos processando sua compra
            </p>
          </motion.div>

          {/* Pending Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative mb-8"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-3xl blur-xl" />
            <div className="relative bg-black/40 backdrop-blur-xl border border-yellow-500/50 p-8 rounded-3xl">
              <div className="flex items-start gap-3 mb-6">
                <AlertCircle className="h-6 w-6 text-yellow-400 flex-shrink-0 mt-1" />
                <div className="text-left">
                  <h2 className="text-xl font-bold text-white mb-2">O que significa isso?</h2>
                  <p className="text-gray-300 mb-4">
                    Seu pagamento está sendo processado. Isso geralmente acontece quando:
                  </p>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0 mt-2" />
                      <span>Você escolheu pagar com boleto bancário</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0 mt-2" />
                      <span>Pagamento com cartão de crédito em análise</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0 mt-2" />
                      <span>Pix ainda não foi confirmado</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl mb-4">
                <div className="flex items-start gap-2">
                  <Mail className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="text-left">
                    <p className="text-sm text-yellow-400 font-semibold mb-1">Você receberá um email</p>
                    <p className="text-xs text-gray-400">
                      Assim que o pagamento for confirmado, enviaremos as instruções de acesso para seu email.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <p className="text-sm text-gray-400 text-center">
                  💡 Tempo médio de processamento: 1-3 dias úteis (boleto) ou 24h (cartão)
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
              onClick={() => navigate('/')}
              className="px-8 py-4 bg-gradient-to-r from-yellow-600 via-orange-600 to-amber-600 hover:from-yellow-700 hover:via-orange-700 hover:to-amber-700 rounded-xl font-bold text-lg transition-all shadow-2xl shadow-yellow-500/50 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Voltar à Home
              <ArrowRight className="h-5 w-5" />
            </motion.button>
          </motion.div>

          {/* Support */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center"
          >
            <p className="text-gray-400">
              Problemas com o pagamento?{' '}
              <a href="mailto:suporte@aira.com.br" className="text-yellow-400 hover:text-yellow-300 underline">
                Entre em contato com o suporte
              </a>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default PaymentPending

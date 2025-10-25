/**
 * ════════════════════════════════════════════════════════════════
 * ANIMAÇÃO 03: Venda no Piloto Automático
 * Conceito: Múltiplas conversas simultâneas + vendas 24/7
 * ════════════════════════════════════════════════════════════════
 */

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Clock } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function AutoPilotAnimation() {
  const [salesCount, setSalesCount] = useState(0)
  const [messages, setMessages] = useState([])

  useEffect(() => {
    // Incrementar vendas
    const salesInterval = setInterval(() => {
      setSalesCount((prev) => (prev >= 15 ? 0 : prev + 1))
    }, 300)

    // Adicionar mensagens
    const messageInterval = setInterval(() => {
      const newMessage = {
        id: Date.now(),
        avatar: ['👨', '👩', '🧑', '👴', '👵', '🧔'][Math.floor(Math.random() * 6)],
        text: ['Tenho interesse!', 'Qual o preço?', 'Pode enviar proposta?', 'Vamos fechar!'][Math.floor(Math.random() * 4)]
      }

      setMessages((prev) => {
        const updated = [...prev, newMessage]
        return updated.slice(-6) // Manter apenas 6 mensagens
      })
    }, 1500)

    return () => {
      clearInterval(salesInterval)
      clearInterval(messageInterval)
    }
  }, [])

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
      {/* Interface de Chat */}
      <motion.div
        className="relative w-full max-w-sm bg-black/60 backdrop-blur-xl border-2 border-green-500/50 rounded-3xl p-6 h-[400px] overflow-hidden"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header do Chat */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-green-500/30">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-gray-400">Online 24/7</span>
          </div>
          <Clock className="w-5 h-5 text-green-400 animate-spin" style={{ animationDuration: '10s' }} />
        </div>

        {/* Mensagens com Scroll */}
        <div className="space-y-3 h-[280px] overflow-hidden">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, x: -30, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 30, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="flex items-start gap-3"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-xl flex-shrink-0">
                  {message.avatar}
                </div>

                {/* Bubble */}
                <div className="bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-2xl rounded-tl-sm px-4 py-2 flex-1">
                  <p className="text-white text-sm">{message.text}</p>

                  {/* Typing Indicator */}
                  <motion.div
                    className="flex gap-1 mt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-green-400"
                        animate={{
                          y: [0, -5, 0],
                          opacity: [0.3, 1, 0.3]
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: i * 0.2
                        }}
                      />
                    ))}
                  </motion.div>
                </div>

                {/* Checkmark - Venda Concluída */}
                {Math.random() > 0.5 && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.5, type: 'spring', bounce: 0.6 }}
                  >
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Contador de Vendas */}
      <motion.div
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl px-6 py-3 shadow-2xl shadow-green-500/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-white" />
          <div>
            <div className="text-xs text-white/80">Vendas Hoje</div>
            <motion.div
              className="text-3xl font-black text-white"
              key={salesCount}
              initial={{ scale: 1.5, color: '#ffffff' }}
              animate={{ scale: 1, color: '#ffffff' }}
              transition={{ duration: 0.3, type: 'spring' }}
            >
              {salesCount}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Notificação de Venda */}
      <AnimatePresence>
        {salesCount % 3 === 0 && salesCount > 0 && (
          <motion.div
            className="absolute top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2"
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            transition={{ duration: 0.5 }}
          >
            <CheckCircle className="w-5 h-5" />
            <span className="font-bold">Venda realizada!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Relógio 24/7 no Fundo */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        <div className="text-9xl font-black text-green-500">24/7</div>
      </motion.div>
    </div>
  )
}

/**
 * ════════════════════════════════════════════════════════════════
 * COMPONENTE: LevelUnlock
 * Transição rápida e fluida de desbloqueio de nível
 * ════════════════════════════════════════════════════════════════
 */

import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Brain } from 'lucide-react'
import { useEffect } from 'react'

export default function LevelUnlock({ level, show, onComplete, motivationalPhrase }) {
  useEffect(() => {
    if (show) {
      // Som de desbloqueio
      const unlockSound = new Audio('https://www.soundjay.com/mechanical/sounds/lock-unlock-1.mp3')
      unlockSound.volume = 0.2
      unlockSound.play().catch(() => {})

      // Completar rapidamente
      const timer = setTimeout(onComplete, 800) // 800ms total
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  if (!show) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        {/* Background Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-green-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [0, 1.5, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: Math.random() * 0.5,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <motion.div
          className="relative text-center px-6 max-w-2xl"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2, type: 'spring', stiffness: 200 }}
        >
          {/* Icon */}
          <motion.div
            className="mb-6 inline-block"
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: { duration: 0.8, ease: 'easeInOut' },
              scale: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' },
            }}
          >
            <div className="relative w-24 h-24 mx-auto">
              <Brain className="w-full h-full text-green-400" />

              {/* Glow Effect */}
              <motion.div
                className="absolute inset-0 rounded-full blur-2xl bg-green-500/50"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </div>
          </motion.div>

          {/* Level Badge */}
          <motion.div
            className="inline-block mb-4 px-6 py-2 bg-green-500/20 border-2 border-green-500 rounded-full"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-green-400" />
              <span className="text-xl font-bold text-green-400">
                NÍVEL {level}
              </span>
              <Sparkles className="w-5 h-5 text-green-400" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h2
            className="text-3xl md:text-5xl font-black mb-4 bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            {level === 1 ? 'MISSÃO INICIADA!' : 'DESBLOQUEADO!'}
          </motion.h2>

          {/* Motivational Phrase */}
          {motivationalPhrase && (
            <motion.p
              className="text-lg md:text-xl text-gray-300 font-semibold"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {motivationalPhrase}
            </motion.p>
          )}

          {/* Progress Bar - Simples e fluido */}
          <motion.div
            className="mt-6 w-full h-2 bg-gray-800 rounded-full overflow-hidden border border-green-500/30"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-green-500 via-emerald-500 to-cyan-500"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

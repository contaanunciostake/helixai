/**
 * ════════════════════════════════════════════════════════════════
 * COMPONENTE: ScrollCTA
 * Seta animada verticalmente com call-to-action para scroll
 * ════════════════════════════════════════════════════════════════
 */

import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

export default function ScrollCTA({ onClick, nextLevelText = "Desbloquear Próxima Consciência" }) {
  return (
    <motion.div
      className="flex flex-col items-center gap-4 cursor-pointer group"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 1.5 }}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Container da seta com glow */}
      <div className="relative">
        {/* Glow pulsante */}
        <motion.div
          className="absolute inset-0 rounded-full blur-xl"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, transparent 70%)'
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />

        {/* Anel externo animado */}
        <motion.div
          className="relative w-20 h-20 rounded-full border-2 border-green-500/30 flex items-center justify-center"
          animate={{
            borderColor: ['rgba(16, 185, 129, 0.3)', 'rgba(16, 185, 129, 0.8)', 'rgba(16, 185, 129, 0.3)']
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          {/* Anel interno */}
          <motion.div
            className="w-16 h-16 rounded-full border-2 border-green-500/50 flex items-center justify-center"
            animate={{
              scale: [0.9, 1.1, 0.9],
              borderColor: ['rgba(16, 185, 129, 0.5)', 'rgba(16, 185, 129, 1)', 'rgba(16, 185, 129, 0.5)']
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.2
            }}
          >
            {/* Seta com movimento vertical */}
            <motion.div
              animate={{
                y: [0, 8, 0]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: [0.45, 0.05, 0.55, 0.95] // ease-in-out customizado
              }}
            >
              <ChevronDown
                className="w-8 h-8 text-green-400"
                strokeWidth={3}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Partículas caindo */}
      <div className="absolute" style={{ top: '100%' }}>
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 w-1 h-1 bg-green-400 rounded-full"
            style={{
              boxShadow: '0 0 8px rgba(16, 185, 129, 0.8)'
            }}
            animate={{
              y: [0, 100],
              opacity: [1, 0],
              scale: [1, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.4,
              ease: 'easeIn'
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}

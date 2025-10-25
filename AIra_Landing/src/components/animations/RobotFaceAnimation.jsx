/**
 * ════════════════════════════════════════════════════════════════
 * ANIMAÇÃO: Rosto Robô Atendente
 * Conceito: Rosto 3D de robô como atendente de telemarketing
 * ════════════════════════════════════════════════════════════════
 */

import { motion } from 'framer-motion'
import { Headphones, Mic, Radio } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function RobotFaceAnimation() {
  const [isTalking, setIsTalking] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTalking((prev) => !prev)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Ondas de Som - Sinalizando que está falando */}
      {[0, 1, 2].map((ring) => (
        <motion.div
          key={ring}
          className="absolute rounded-full border-2 border-green-400"
          style={{
            width: `${200 + ring * 60}px`,
            height: `${200 + ring * 60}px`
          }}
          animate={{
            scale: isTalking ? [1, 1.3, 1] : 1,
            opacity: isTalking ? [0.5, 0, 0.5] : 0.2
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: ring * 0.3,
            ease: 'easeInOut'
          }}
        />
      ))}

      {/* Cabeça do Robô - Base 3D */}
      <motion.div
        className="relative w-48 h-56 rounded-3xl bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800 shadow-2xl"
        initial={{ rotateY: -180, scale: 0 }}
        animate={{
          rotateY: 0,
          scale: 1,
          boxShadow: [
            '0 20px 60px rgba(16, 185, 129, 0.4)',
            '0 20px 80px rgba(16, 185, 129, 0.6)',
            '0 20px 60px rgba(16, 185, 129, 0.4)'
          ]
        }}
        transition={{
          rotateY: { duration: 1, type: 'spring', bounce: 0.3 },
          scale: { duration: 0.8, delay: 0.2 },
          boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
        }}
        style={{
          transformStyle: 'preserve-3d',
          perspective: '1000px'
        }}
      >
        {/* Brilho Superior 3D */}
        <div className="absolute top-4 left-8 right-8 h-6 bg-gradient-to-b from-white/30 to-transparent rounded-full blur-md" />

        {/* Antena com LED */}
        <motion.div
          className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-2 h-12 bg-gradient-to-t from-gray-600 to-gray-400 rounded-full"
          animate={{ scaleY: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {/* LED na ponta */}
          <motion.div
            className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-green-400"
            animate={{
              boxShadow: [
                '0 0 10px rgba(16, 185, 129, 0.8)',
                '0 0 30px rgba(16, 185, 129, 1)',
                '0 0 10px rgba(16, 185, 129, 0.8)'
              ]
            }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </motion.div>

        {/* Olhos - LEDs Expressivos */}
        <div className="absolute top-16 left-0 right-0 flex justify-center gap-8">
          {[0, 1].map((eye) => (
            <motion.div
              key={eye}
              className="relative"
              animate={{
                scaleY: isTalking ? [1, 0.3, 1] : 1
              }}
              transition={{
                duration: 0.3,
                repeat: isTalking ? Infinity : 0,
                repeatDelay: 1.5
              }}
            >
              {/* Olho - LED Circular */}
              <motion.div
                className="w-12 h-12 rounded-full bg-gradient-to-br from-green-300 to-green-600"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(16, 185, 129, 0.6), inset 0 0 10px rgba(255, 255, 255, 0.3)',
                    '0 0 40px rgba(16, 185, 129, 1), inset 0 0 20px rgba(255, 255, 255, 0.5)',
                    '0 0 20px rgba(16, 185, 129, 0.6), inset 0 0 10px rgba(255, 255, 255, 0.3)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {/* Brilho do olho */}
                <div className="absolute top-2 left-2 w-4 h-4 bg-white/60 rounded-full blur-sm" />
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Fone de Ouvido */}
        <motion.div
          className="absolute -left-6 top-12 w-20 h-2 bg-gradient-to-r from-gray-700 via-gray-500 to-transparent rounded-full"
          animate={{ rotate: [-5, 0, -5] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          {/* Almofada do Fone */}
          <div className="absolute -left-1 -top-3 w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 border-2 border-gray-500 flex items-center justify-center">
            <Headphones className="w-4 h-4 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          className="absolute -right-6 top-12 w-20 h-2 bg-gradient-to-l from-gray-700 via-gray-500 to-transparent rounded-full"
          animate={{ rotate: [5, 0, 5] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          {/* Almofada do Fone */}
          <div className="absolute -right-1 -top-3 w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 border-2 border-gray-500 flex items-center justify-center">
            <Headphones className="w-4 h-4 text-green-400" />
          </div>
        </motion.div>

        {/* Boca - Visualizador de Áudio */}
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-24 h-12 flex items-end justify-center gap-1">
          {[...Array(7)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 bg-gradient-to-t from-green-500 to-green-300 rounded-full"
              animate={{
                height: isTalking
                  ? [
                      `${20 + Math.random() * 30}px`,
                      `${10 + Math.random() * 20}px`,
                      `${20 + Math.random() * 30}px`
                    ]
                  : '8px',
                opacity: isTalking ? [0.5, 1, 0.5] : 0.3
              }}
              transition={{
                duration: 0.5,
                repeat: isTalking ? Infinity : 0,
                delay: i * 0.1,
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>

        {/* Microfone Badge */}
        <motion.div
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/40 backdrop-blur-xl border-2 border-green-500/50 rounded-full px-3 py-1 flex items-center gap-2"
          animate={{
            scale: isTalking ? [1, 1.1, 1] : 1
          }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          <Mic className={`w-3 h-3 ${isTalking ? 'text-green-400' : 'text-gray-400'}`} />
          <motion.div
            className="w-2 h-2 rounded-full"
            animate={{
              backgroundColor: isTalking ? '#10b981' : '#6b7280'
            }}
          />
        </motion.div>
      </motion.div>

      {/* Partículas de Som */}
      {isTalking && (
        <>
          {[...Array(8)].map((_, i) => {
            const angle = (i * 45 * Math.PI) / 180
            const distance = 120
            return (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full bg-green-400"
                style={{
                  left: '50%',
                  top: '50%'
                }}
                animate={{
                  x: Math.cos(angle) * distance,
                  y: Math.sin(angle) * distance,
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: 'easeOut'
                }}
              />
            )
          })}
        </>
      )}

      {/* Status Badge */}
      <motion.div
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-xl border-2 border-green-500/50 rounded-2xl px-6 py-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-green-400" />
          <div className="text-sm text-green-400 font-bold">
            {isTalking ? 'Atendendo Cliente...' : 'Aguardando Chamada'}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

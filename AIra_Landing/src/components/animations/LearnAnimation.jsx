/**
 * ════════════════════════════════════════════════════════════════
 * ANIMAÇÃO 02: IA Aprende Seu Negócio
 * Conceito: Brain neural network absorvendo dados
 * ════════════════════════════════════════════════════════════════
 */

import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function LearnAnimation() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 2))
    }, 50)
    return () => clearInterval(interval)
  }, [])

  // Nós da rede neural
  const nodes = [
    { x: 150, y: 90 },
    { x: 90, y: 150 },
    { x: 210, y: 150 },
    { x: 120, y: 210 },
    { x: 180, y: 210 },
    { x: 150, y: 255 }
  ]

  // Conexões entre nós
  const connections = [
    [0, 1], [0, 2], [1, 3], [1, 4],
    [2, 3], [2, 4], [3, 5], [4, 5]
  ]

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="relative w-[300px] h-[400px]">
        {/* Documento no Topo */}
        <motion.div
          className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-green-500/20 backdrop-blur-sm border-2 border-green-500/50 rounded-xl p-3 z-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: 'spring' }}
        >
          <FileText className="w-10 h-10 text-green-400" />
        </motion.div>

        {/* Stream de Dados Descendo */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-6 bg-gradient-to-b from-green-400 to-transparent rounded-full"
            style={{
              left: `${50 + (i - 2.5) * 8}%`,
              top: '15%'
            }}
            animate={{
              y: [0, 80],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeIn'
            }}
          />
        ))}

        {/* Cérebro/Rede Neural */}
        <svg
          className="absolute"
          width="300"
          height="300"
          viewBox="0 0 300 300"
          style={{ left: '0', top: '50px' }}
        >
          <defs>
            <linearGradient id="neuralGradient">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Conexões */}
          {connections.map((conn, index) => {
            const [startIdx, endIdx] = conn
            const start = nodes[startIdx]
            const end = nodes[endIdx]

            return (
              <motion.line
                key={`conn-${index}`}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke="url(#neuralGradient)"
                strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.6 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
              />
            )
          })}

          {/* Nós */}
          {nodes.map((node, index) => (
            <motion.circle
              key={`node-${index}`}
              cx={node.x}
              cy={node.y}
              r="8"
              fill="#10b981"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: progress > index * 16 ? 1 : 0,
                opacity: progress > index * 16 ? 1 : 0
              }}
              transition={{
                scale: { duration: 0.5, type: 'spring' }
              }}
              style={{
                filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.8))'
              }}
            />
          ))}
        </svg>

        {/* Barra de Progresso */}
        <motion.div
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-64 bg-black/60 backdrop-blur-xl border-2 border-green-500/50 rounded-2xl p-4 z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Aprendendo...</span>
            <span className="text-lg font-bold text-green-400">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </motion.div>

        {/* Ícones de Produtos Aparecem */}
        {progress === 100 && (
          <div className="absolute inset-0 flex items-center justify-center">
            {['👔', '👟', '💼', '📱'].map((emoji, index) => {
              const angle = (index * 90) * (Math.PI / 180)
              const radius = 80

              return (
                <motion.div
                  key={emoji}
                  className="absolute text-2xl z-20"
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{
                    scale: 1,
                    x: Math.cos(angle) * radius,
                    y: Math.sin(angle) * radius
                  }}
                  exit={{ scale: 0 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.5, type: 'spring', bounce: 0.6 }}
                >
                  {emoji}
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

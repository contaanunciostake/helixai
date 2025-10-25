/**
 * ════════════════════════════════════════════════════════════════
 * COMPONENTE: Neon3DObject - Objetos 3D Ultra Realistas com Neon
 * Frames em neon que se constroem progressivamente em 3D
 * ════════════════════════════════════════════════════════════════
 */

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function Neon3DObject({ type, color = 'blue', isActive = true }) {
  const [buildProgress, setBuildProgress] = useState(0)

  useEffect(() => {
    if (isActive) {
      setBuildProgress(0)
      const interval = setInterval(() => {
        setBuildProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 2
        })
      }, 20)
      return () => clearInterval(interval)
    } else {
      setBuildProgress(0)
    }
  }, [isActive, type])

  // Paleta de cores neon
  const colorSchemes = {
    green: {
      primary: '#10b981',
      secondary: '#34d399',
      glow: 'rgba(16, 185, 129, 0.8)',
      shadow: 'rgba(16, 185, 129, 0.4)'
    },
    yellow: {
      primary: '#f59e0b',
      secondary: '#fbbf24',
      glow: 'rgba(245, 158, 11, 0.8)',
      shadow: 'rgba(245, 158, 11, 0.4)'
    },
    purple: {
      primary: '#a855f7',
      secondary: '#c084fc',
      glow: 'rgba(168, 85, 247, 0.8)',
      shadow: 'rgba(168, 85, 247, 0.4)'
    },
    blue: {
      primary: '#3b82f6',
      secondary: '#60a5fa',
      glow: 'rgba(59, 130, 246, 0.8)',
      shadow: 'rgba(59, 130, 246, 0.4)'
    },
    cyan: {
      primary: '#06b6d4',
      secondary: '#22d3ee',
      glow: 'rgba(6, 182, 212, 0.8)',
      shadow: 'rgba(6, 182, 212, 0.4)'
    },
    red: {
      primary: '#ef4444',
      secondary: '#f87171',
      glow: 'rgba(239, 68, 68, 0.8)',
      shadow: 'rgba(239, 68, 68, 0.4)'
    }
  }

  const colors = colorSchemes[color] || colorSchemes.blue

  // Renderizar objeto 3D baseado no tipo
  const render3DObject = () => {
    switch (type) {
      case 'aira':
        return <AIra3D colors={colors} progress={buildProgress} />
      case 'money':
        return <Money3D colors={colors} progress={buildProgress} />
      case 'lightning':
        return <Lightning3D colors={colors} progress={buildProgress} />
      case 'brain':
        return <Brain3D colors={colors} progress={buildProgress} />
      case 'chart':
        return <Chart3D colors={colors} progress={buildProgress} />
      case 'shield':
        return <Shield3D colors={colors} progress={buildProgress} />
      default:
        return null
    }
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center perspective-1000">
      <motion.div
        className="relative"
        initial={{ scale: 0, rotateY: -180 }}
        animate={{ scale: 1, rotateY: 0 }}
        transition={{ duration: 1, type: 'spring', stiffness: 100 }}
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {render3DObject()}
      </motion.div>
    </div>
  )
}

// ===== AIRA 3D - CONSCIÊNCIA ARTIFICIAL =====
function AIra3D({ colors, progress }) {
  return (
    <div className="relative w-96 h-96 flex items-center justify-center">
      {/* Núcleo Central Pulsante */}
      <motion.div
        className="absolute w-32 h-32 rounded-full"
        style={{
          background: `radial-gradient(circle, ${colors.primary}, ${colors.secondary})`,
          boxShadow: `0 0 60px ${colors.glow}, 0 0 120px ${colors.shadow}`,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.8, 1, 0.8]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        {/* Texto "AI" no centro */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className="text-6xl font-black text-white"
            style={{ textShadow: `0 0 20px ${colors.glow}` }}
            animate={{
              textShadow: [
                `0 0 20px ${colors.glow}`,
                `0 0 40px ${colors.glow}`,
                `0 0 20px ${colors.glow}`
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity
            }}
          >
            AI
          </motion.span>
        </div>
      </motion.div>

      {/* Anéis Orbitais */}
      {[0, 1, 2].map((ringIndex) => {
        const radius = 100 + ringIndex * 40
        const duration = 8 + ringIndex * 2

        return (
          <motion.div
            key={`ring-${ringIndex}`}
            className="absolute rounded-full border-2"
            style={{
              width: `${radius * 2}px`,
              height: `${radius * 2}px`,
              borderColor: colors.primary,
              opacity: progress > 30 ? 0.3 : 0
            }}
            animate={{
              rotate: [0, 360],
              borderColor: [colors.primary, colors.secondary, colors.primary]
            }}
            transition={{
              rotate: {
                duration: duration,
                repeat: Infinity,
                ease: 'linear'
              },
              borderColor: {
                duration: 3,
                repeat: Infinity
              }
            }}
          />
        )
      })}

      {/* Partículas de Energia Orbitando */}
      {progress > 40 && [...Array(12)].map((_, i) => {
        const angle = (i * 30) * (Math.PI / 180)
        const radius = 140
        const duration = 6 + (i % 3)

        return (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-3 h-3 rounded-full"
            style={{
              background: `radial-gradient(circle, ${colors.primary}, transparent)`,
              boxShadow: `0 0 10px ${colors.glow}`,
            }}
            animate={{
              x: [
                Math.cos(angle) * radius,
                Math.cos(angle + Math.PI) * radius,
                Math.cos(angle) * radius
              ],
              y: [
                Math.sin(angle) * radius,
                Math.sin(angle + Math.PI) * radius,
                Math.sin(angle) * radius
              ],
              scale: [1, 1.5, 1],
              opacity: [0.6, 1, 0.6]
            }}
            transition={{
              duration: duration,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 0.2
            }}
          />
        )
      })}

      {/* Ondas de Energia Expandindo */}
      {progress > 60 && [0, 1, 2, 3].map((waveIndex) => (
        <motion.div
          key={`wave-${waveIndex}`}
          className="absolute rounded-full border"
          style={{
            borderColor: colors.primary,
            width: '64px',
            height: '64px'
          }}
          animate={{
            scale: [0.5, 4],
            opacity: [0.8, 0],
            borderWidth: ['3px', '1px']
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: waveIndex * 0.7,
            ease: 'easeOut'
          }}
        />
      ))}

      {/* Conexões Neurais */}
      {progress > 70 && (
        <svg className="absolute w-full h-full" style={{ zIndex: -1 }}>
          <defs>
            <linearGradient id="neuralGradientAira" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.primary} stopOpacity="0.6" />
              <stop offset="100%" stopColor={colors.secondary} stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Linhas conectando o centro aos pontos externos */}
          {[...Array(8)].map((_, i) => {
            const angle = (i * 45) * (Math.PI / 180)
            const x2 = 192 + Math.cos(angle) * 150
            const y2 = 192 + Math.sin(angle) * 150

            return (
              <motion.line
                key={`neural-${i}`}
                x1="192"
                y1="192"
                x2={x2}
                y2={y2}
                stroke="url(#neuralGradientAira)"
                strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: 1,
                  opacity: [0.3, 0.7, 0.3]
                }}
                transition={{
                  pathLength: { duration: 1, delay: i * 0.1 },
                  opacity: { duration: 2, repeat: Infinity, delay: i * 0.2 }
                }}
              />
            )
          })}

          {/* Nós nas pontas */}
          {[...Array(8)].map((_, i) => {
            const angle = (i * 45) * (Math.PI / 180)
            const cx = 192 + Math.cos(angle) * 150
            const cy = 192 + Math.sin(angle) * 150

            return (
              <motion.circle
                key={`node-${i}`}
                cx={cx}
                cy={cy}
                r="6"
                fill={colors.primary}
                initial={{ scale: 0 }}
                animate={{
                  scale: [0, 1.5, 1],
                  fill: [colors.primary, colors.secondary, colors.primary]
                }}
                transition={{
                  scale: { duration: 0.5, delay: 1 + i * 0.1 },
                  fill: { duration: 2, repeat: Infinity, delay: i * 0.2 }
                }}
                style={{
                  filter: `drop-shadow(0 0 8px ${colors.glow})`
                }}
              />
            )
          })}
        </svg>
      )}

      {/* Dados Binários Flutuando */}
      {progress > 80 && [...Array(20)].map((_, i) => {
        const randomX = Math.random() * 300 - 150
        const randomY = Math.random() * 300 - 150
        const binary = Math.random() > 0.5 ? '1' : '0'

        return (
          <motion.div
            key={`binary-${i}`}
            className="absolute text-xs font-mono"
            style={{
              color: colors.primary,
              textShadow: `0 0 5px ${colors.glow}`,
              left: '50%',
              top: '50%'
            }}
            initial={{
              x: randomX,
              y: randomY,
              opacity: 0
            }}
            animate={{
              y: [randomY, randomY - 100],
              opacity: [0, 0.7, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.3,
              ease: 'easeOut'
            }}
          >
            {binary}
          </motion.div>
        )
      })}

    </div>
  )
}

// ===== MONEY 3D =====
function Money3D({ colors, progress }) {
  return (
    <div className="relative w-64 h-64" style={{ transformStyle: 'preserve-3d' }}>
      {/* Moeda Principal */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
          boxShadow: `
            0 0 40px ${colors.glow},
            0 0 80px ${colors.shadow},
            inset 0 0 40px rgba(255, 255, 255, 0.2)
          `,
          transform: `rotateY(${progress * 3.6}deg) translateZ(20px)`,
          transformStyle: 'preserve-3d'
        }}
        animate={{
          rotateY: [0, 360],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear'
        }}
      >
        {/* Símbolo $ em 3D */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="text-9xl font-bold text-white relative"
            style={{
              textShadow: `
                0 0 20px ${colors.glow},
                0 0 40px ${colors.glow},
                2px 2px 4px rgba(0, 0, 0, 0.5)
              `,
              transform: 'translateZ(30px)'
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: progress > 50 ? 1 : 0, scale: progress > 50 ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          >
            $
          </motion.div>
        </div>

        {/* Anéis orbitais neon */}
        {[0, 1, 2].map((ring) => (
          <motion.div
            key={ring}
            className="absolute rounded-full border-2"
            style={{
              inset: `${ring * 20}px`,
              borderColor: colors.primary,
              boxShadow: `0 0 20px ${colors.glow}`,
              opacity: progress > ring * 30 ? 1 : 0,
              transform: `rotateX(60deg) translateZ(${ring * 10}px)`
            }}
            animate={{
              rotate: ring % 2 === 0 ? 360 : -360,
            }}
            transition={{
              duration: 4 - ring * 0.5,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
        ))}
      </motion.div>

      {/* Partículas de dinheiro voando */}
      {[...Array(8)].map((_, i) => {
        const angle = (i * 45) * (Math.PI / 180)
        const radius = 140
        return (
          <motion.div
            key={i}
            className="absolute w-4 h-4 rounded-full"
            style={{
              left: `${50 + Math.cos(angle) * radius / 2}%`,
              top: `${50 + Math.sin(angle) * radius / 2}%`,
              background: colors.primary,
              boxShadow: `0 0 15px ${colors.glow}`,
              opacity: progress > 70 ? 1 : 0,
              transform: `translateZ(${Math.sin(i) * 20}px)`
            }}
            animate={{
              scale: [1, 1.5, 1],
              y: [-10, 10, -10],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        )
      })}
    </div>
  )
}

// ===== LIGHTNING 3D =====
function Lightning3D({ colors, progress }) {
  return (
    <div className="relative w-64 h-80" style={{ transformStyle: 'preserve-3d' }}>
      {/* Raio Principal em Zigzag 3D */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 200 300"
        style={{
          filter: `drop-shadow(0 0 20px ${colors.glow}) drop-shadow(0 0 40px ${colors.glow})`,
          transform: `translateZ(30px)`
        }}
      >
        <motion.path
          d="M100 20 L80 100 L120 100 L90 180 L130 180 L100 280"
          fill="none"
          stroke={colors.primary}
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: progress / 100 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        />
        <motion.path
          d="M100 20 L80 100 L120 100 L90 180 L130 180 L100 280"
          fill="none"
          stroke={colors.secondary}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: progress / 100 }}
          transition={{ duration: 1, ease: 'easeInOut', delay: 0.1 }}
        />
      </svg>

      {/* Círculo de energia no topo */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full"
        style={{
          background: `radial-gradient(circle, ${colors.secondary}, ${colors.primary})`,
          boxShadow: `
            0 0 40px ${colors.glow},
            0 0 80px ${colors.shadow}
          `,
          opacity: progress > 20 ? 1 : 0,
          transform: 'translateZ(40px)'
        }}
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity
        }}
      />

      {/* Ondas de choque */}
      {[0, 1, 2].map((wave) => (
        <motion.div
          key={wave}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full border-2"
          style={{
            borderColor: colors.primary,
            opacity: progress > 50 ? 1 : 0,
            transform: `translateZ(${20 - wave * 5}px)`
          }}
          animate={{
            scale: [1, 3, 1],
            opacity: [0.8, 0, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: wave * 0.4
          }}
        />
      ))}

      {/* Faíscas elétricas */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-8 rounded-full"
          style={{
            left: `${30 + Math.random() * 40}%`,
            top: `${20 + i * 20}%`,
            background: colors.secondary,
            boxShadow: `0 0 10px ${colors.glow}`,
            opacity: progress > i * 8 ? 1 : 0,
            transform: `translateZ(${Math.random() * 30}px) rotate(${Math.random() * 60 - 30}deg)`
          }}
          animate={{
            opacity: [1, 0, 1],
            x: [0, Math.random() * 20 - 10, 0],
          }}
          transition={{
            duration: 0.3 + Math.random() * 0.3,
            repeat: Infinity,
            delay: i * 0.1
          }}
        />
      ))}
    </div>
  )
}

// ===== BRAIN 3D =====
function Brain3D({ colors, progress }) {
  // Estrutura wireframe do cérebro - pontos principais
  const brainNodes = [
    // Hemisfério esquerdo - fronte
    { x: -60, y: -40, z: 30 },
    { x: -50, y: -60, z: 20 },
    { x: -70, y: -30, z: 10 },
    { x: -80, y: -20, z: 0 },
    { x: -70, y: 0, z: -10 },
    { x: -60, y: 20, z: 0 },
    { x: -50, y: 40, z: 10 },
    { x: -40, y: 50, z: 20 },

    // Hemisfério direito - fronte
    { x: 60, y: -40, z: 30 },
    { x: 50, y: -60, z: 20 },
    { x: 70, y: -30, z: 10 },
    { x: 80, y: -20, z: 0 },
    { x: 70, y: 0, z: -10 },
    { x: 60, y: 20, z: 0 },
    { x: 50, y: 40, z: 10 },
    { x: 40, y: 50, z: 20 },

    // Topo
    { x: 0, y: -70, z: 15 },
    { x: -30, y: -65, z: 25 },
    { x: 30, y: -65, z: 25 },

    // Base/cerebelo
    { x: 0, y: 60, z: -20 },
    { x: -25, y: 55, z: -15 },
    { x: 25, y: 55, z: -15 },

    // Pontos médios
    { x: 0, y: -30, z: 35 },
    { x: 0, y: 0, z: 30 },
    { x: 0, y: 30, z: 25 }
  ]

  // Conexões entre nós (sinapses)
  const connections = [
    // Hemisfério esquerdo
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7],
    [0, 2], [1, 3], [2, 4], [3, 5], [4, 6], [5, 7],

    // Hemisfério direito
    [8, 9], [9, 10], [10, 11], [11, 12], [12, 13], [13, 14], [14, 15],
    [8, 10], [9, 11], [10, 12], [11, 13], [12, 14], [13, 15],

    // Conexões centrais
    [16, 17], [16, 18], [17, 0], [18, 8],
    [19, 20], [19, 21], [20, 7], [21, 15],

    // Conexões entre hemisférios
    [0, 8], [1, 9], [4, 12], [7, 15],
    [22, 16], [23, 0], [23, 8], [24, 19],

    // Conexões complexas
    [0, 22], [8, 22], [22, 23], [23, 24], [24, 7], [24, 15],
    [2, 23], [10, 23], [5, 24], [13, 24]
  ]

  return (
    <div className="relative w-96 h-96 flex items-center justify-center" style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}>
      <motion.div
        style={{ transformStyle: 'preserve-3d' }}
        animate={{
          rotateY: [0, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear'
        }}
      >
        <svg
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          width="400"
          height="400"
          viewBox="-150 -150 300 300"
          style={{
            filter: `drop-shadow(0 0 20px ${colors.glow}) drop-shadow(0 0 40px ${colors.shadow})`,
          }}
        >
          <defs>
            <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.primary} />
              <stop offset="100%" stopColor={colors.secondary} />
            </linearGradient>
          </defs>

          {/* Conexões wireframe (sinapses) */}
          {connections.map((conn, idx) => {
            const [startIdx, endIdx] = conn
            const start = brainNodes[startIdx]
            const end = brainNodes[endIdx]
            const connectionProgress = (progress / 100) * connections.length
            const isVisible = idx < connectionProgress

            return (
              <motion.line
                key={`conn-${idx}`}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke="url(#brainGradient)"
                strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: isVisible ? 1 : 0,
                  opacity: isVisible ? 0.8 : 0
                }}
                transition={{
                  duration: 0.3,
                  delay: idx * 0.03,
                  ease: 'easeOut'
                }}
                style={{
                  filter: `drop-shadow(0 0 5px ${colors.glow})`
                }}
              />
            )
          })}

          {/* Nodos neurais */}
          {brainNodes.map((node, idx) => {
            const nodeProgress = (progress / 100) * brainNodes.length
            const isVisible = idx < nodeProgress

            return (
              <motion.circle
                key={`node-${idx}`}
                cx={node.x}
                cy={node.y}
                r="4"
                fill={colors.secondary}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: isVisible ? [0, 1.5, 1] : 0,
                  opacity: isVisible ? 1 : 0
                }}
                transition={{
                  duration: 0.5,
                  delay: idx * 0.04,
                  ease: 'easeOut'
                }}
                style={{
                  filter: `drop-shadow(0 0 8px ${colors.glow})`
                }}
              />
            )
          })}
        </svg>

        {/* Partículas de sinapse viajando */}
        {progress > 60 && connections.slice(0, 15).map((conn, idx) => {
          const [startIdx, endIdx] = conn
          const start = brainNodes[startIdx]
          const end = brainNodes[endIdx]

          return (
            <motion.div
              key={`particle-${idx}`}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: '50%',
                top: '50%',
                background: colors.secondary,
                boxShadow: `0 0 15px ${colors.glow}, 0 0 30px ${colors.glow}`,
              }}
              animate={{
                x: [start.x, end.x, start.x],
                y: [start.y, end.y, start.y],
              }}
              transition={{
                duration: 2 + Math.random(),
                repeat: Infinity,
                delay: idx * 0.2,
                ease: 'easeInOut'
              }}
            />
          )
        })}

        {/* Ondas de atividade cerebral */}
        {progress > 80 && [...Array(3)].map((_, i) => (
          <motion.div
            key={`wave-${i}`}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-2 rounded-full"
            style={{
              width: '200px',
              height: '280px',
              borderColor: colors.primary,
            }}
            animate={{
              scale: [0.8, 1.3, 0.8],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 1,
              ease: 'easeInOut'
            }}
          />
        ))}

        {/* Pulsos energéticos nos hemisférios */}
        {progress > 90 && [
          { x: -60, y: 0 },
          { x: 60, y: 0 }
        ].map((pos, i) => (
          <motion.div
            key={`pulse-${i}`}
            className="absolute w-6 h-6 rounded-full"
            style={{
              left: `calc(50% + ${pos.x}px)`,
              top: `calc(50% + ${pos.y}px)`,
              background: colors.secondary,
              boxShadow: `0 0 30px ${colors.glow}`,
            }}
            animate={{
              scale: [1, 1.8, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.75,
            }}
          />
        ))}
      </motion.div>
    </div>
  )
}

// ===== CHART 3D =====
function Chart3D({ colors, progress }) {
  const bars = [60, 80, 95, 75, 90, 100]

  return (
    <div className="relative w-80 h-80" style={{ transformStyle: 'preserve-3d' }}>
      {/* Grid 3D de fundo */}
      <div className="absolute inset-0" style={{ transform: 'rotateX(60deg) translateZ(-50px)' }}>
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-full h-0.5"
            style={{
              top: `${i * 20}%`,
              background: colors.primary,
              boxShadow: `0 0 10px ${colors.glow}`,
              opacity: progress > i * 10 ? 0.3 : 0
            }}
          />
        ))}
      </div>

      {/* Barras 3D do gráfico */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 items-end" style={{ transformStyle: 'preserve-3d' }}>
        {bars.map((height, i) => (
          <motion.div
            key={i}
            className="relative"
            style={{
              width: '40px',
              transformStyle: 'preserve-3d',
              transform: `translateZ(${i * 10}px)`
            }}
          >
            {/* Barra frontal */}
            <motion.div
              className="rounded-t-lg"
              style={{
                width: '100%',
                height: `${height * 2}px`,
                background: `linear-gradient(to top, ${colors.primary}, ${colors.secondary})`,
                boxShadow: `
                  0 0 30px ${colors.glow},
                  inset 0 0 20px rgba(255, 255, 255, 0.2)
                `,
                transformOrigin: 'bottom'
              }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: progress > i * 15 ? 1 : 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />

            {/* Barra lateral (profundidade 3D) */}
            <motion.div
              className="absolute top-0 right-0 rounded-tr-lg"
              style={{
                width: '20px',
                height: `${height * 2}px`,
                background: `linear-gradient(to right, ${colors.primary}cc, ${colors.primary}66)`,
                transform: 'rotateY(90deg) translateX(10px)',
                transformOrigin: 'left',
                opacity: progress > i * 15 ? 1 : 0
              }}
            />

            {/* Topo da barra */}
            <motion.div
              className="absolute top-0 left-0 rounded-lg"
              style={{
                width: '40px',
                height: '20px',
                background: colors.secondary,
                boxShadow: `0 0 20px ${colors.glow}`,
                transform: 'rotateX(90deg) translateZ(10px)',
                opacity: progress > i * 15 ? 1 : 0
              }}
            />

            {/* Valor percentual flutuante */}
            <motion.div
              className="absolute -top-8 left-1/2 -translate-x-1/2 text-white font-bold"
              style={{
                textShadow: `0 0 10px ${colors.glow}`,
                opacity: progress > 80 ? 1 : 0,
                transform: 'translateZ(30px)'
              }}
              animate={{
                y: [-5, 0, -5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2
              }}
            >
              {height}%
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Seta de crescimento */}
      <motion.svg
        className="absolute top-10 right-10 w-24 h-24"
        viewBox="0 0 100 100"
        style={{
          filter: `drop-shadow(0 0 20px ${colors.glow})`,
          opacity: progress > 90 ? 1 : 0,
          transform: 'translateZ(60px)'
        }}
        animate={{
          rotate: [0, 5, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity
        }}
      >
        <path
          d="M20 80 L50 20 L80 80"
          fill="none"
          stroke={colors.primary}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M35 20 L50 20 L50 5"
          fill="none"
          stroke={colors.primary}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.svg>
    </div>
  )
}

// ===== SHIELD 3D =====
function Shield3D({ colors, progress }) {
  return (
    <div className="relative w-64 h-80" style={{ transformStyle: 'preserve-3d' }}>
      {/* Escudo principal */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 200 240"
        style={{
          filter: `drop-shadow(0 0 30px ${colors.glow})`,
          transform: 'translateZ(40px)'
        }}
      >
        {/* Borda externa do escudo */}
        <motion.path
          d="M100 20 L160 50 L160 130 Q160 200 100 220 Q40 200 40 130 L40 50 Z"
          fill={colors.primary}
          stroke={colors.secondary}
          strokeWidth="4"
          initial={{ pathLength: 0, fillOpacity: 0 }}
          animate={{
            pathLength: progress > 20 ? 1 : 0,
            fillOpacity: progress > 40 ? 0.9 : 0
          }}
          transition={{ duration: 1 }}
        />

        {/* Camadas internas */}
        <motion.path
          d="M100 40 L145 62 L145 125 Q145 180 100 195 Q55 180 55 125 L55 62 Z"
          fill="none"
          stroke={colors.secondary}
          strokeWidth="3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: progress > 50 ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />

        {/* Check mark */}
        <motion.path
          d="M75 110 L95 130 L130 85"
          fill="none"
          stroke="white"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: progress > 70 ? 1 : 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          style={{ filter: `drop-shadow(0 0 10px white)` }}
        />
      </svg>

      {/* Hexágonos de proteção orbitando */}
      {[0, 1, 2, 3, 4, 5].map((hex) => {
        const angle = (hex * 60) * (Math.PI / 180)
        const radius = 120
        return (
          <motion.div
            key={hex}
            className="absolute w-8 h-8"
            style={{
              left: `${50 + Math.cos(angle) * radius / 2}%`,
              top: `${50 + Math.sin(angle) * radius / 2}%`,
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              background: colors.secondary,
              boxShadow: `0 0 20px ${colors.glow}`,
              opacity: progress > 60 ? 1 : 0,
              transform: `translateZ(${Math.sin(hex) * 30}px)`
            }}
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'linear',
              delay: hex * 0.2
            }}
          />
        )
      })}

      {/* Ondas de proteção */}
      {[0, 1, 2].map((wave) => (
        <motion.div
          key={wave}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 rounded-full"
          style={{
            width: '180px',
            height: '220px',
            borderColor: colors.primary,
            opacity: progress > 80 ? 1 : 0,
            transform: `translateZ(${30 - wave * 10}px)`
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.6, 0, 0.6],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: wave * 0.6
          }}
        />
      ))}

      {/* Partículas de segurança */}
      {[...Array(16)].map((_, i) => {
        const angle = (i * 22.5) * (Math.PI / 180)
        const radius = 100
        return (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: `${50 + Math.cos(angle) * radius / 2}%`,
              top: `${50 + Math.sin(angle) * radius / 2}%`,
              background: colors.secondary,
              boxShadow: `0 0 15px ${colors.glow}`,
              opacity: progress > 85 ? 1 : 0,
              transform: `translateZ(${20 + Math.sin(i * 2) * 15}px)`
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.05
            }}
          />
        )
      })}
    </div>
  )
}

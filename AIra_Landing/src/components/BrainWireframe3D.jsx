/**
 * ════════════════════════════════════════════════════════════════
 * COMPONENTE: BrainWireframe3D
 * Cérebro wireframe 3D ultra-realista com sinapses animadas
 * Motion graphics de alta qualidade com construção progressiva
 * ════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function BrainWireframe3D() {
  const [synapses, setSynapses] = useState([])
  const [buildComplete, setBuildComplete] = useState(false)

  useEffect(() => {
    // Marcar construção completa após animação
    const timer = setTimeout(() => {
      setBuildComplete(true)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  // Criar sinapse aleatória
  const createSynapse = () => {
    const pathId = Math.floor(Math.random() * 30) // 30 conexões neurais
    const newSynapse = {
      id: Date.now() + Math.random(),
      pathId: pathId
    }
    setSynapses(prev => [...prev, newSynapse])

    // Remover após animação
    setTimeout(() => {
      setSynapses(prev => prev.filter(s => s.id !== newSynapse.id))
    }, 1500)
  }

  // Loop de sinapses
  useEffect(() => {
    if (!buildComplete) return

    const interval = setInterval(() => {
      // Criar 2-3 sinapses simultâneas
      const count = 2 + Math.floor(Math.random() * 2)
      for (let i = 0; i < count; i++) {
        setTimeout(() => createSynapse(), i * 100)
      }
    }, 800)

    return () => clearInterval(interval)
  }, [buildComplete])

  // Easing customizado para construção suave
  const buildEasing = [0.43, 0.13, 0.23, 0.96]

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Container 3D com perspectiva */}
      <motion.div
        className="relative"
        style={{
          transformStyle: 'preserve-3d',
          perspective: '1000px'
        }}
      >
        <svg
          width="500"
          height="500"
          viewBox="0 0 500 500"
          className="relative"
          style={{
            filter: 'drop-shadow(0 0 20px rgba(6, 182, 212, 0.6))',
            transformStyle: 'preserve-3d'
          }}
        >
          <defs>
            {/* Gradientes neon para wireframe */}
            <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="1" />
              <stop offset="50%" stopColor="#22d3ee" stopOpacity="1" />
              <stop offset="100%" stopColor="#67e8f9" stopOpacity="1" />
            </linearGradient>

            <linearGradient id="synapseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="1" />
              <stop offset="50%" stopColor="#34d399" stopOpacity="1" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="1" />
            </linearGradient>

            {/* Filtros de glow */}
            <filter id="brainGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            <filter id="synapseGlow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Grupo principal com rotação 3D */}
          <g transform="translate(250, 250)">
            {/* Hemisfério Esquerdo - Forma de cérebro real */}
            <g>
              {/* Contorno principal do hemisfério esquerdo */}
              <motion.path
                d="M -10 -100
                   C -30 -105, -60 -100, -80 -85
                   C -95 -75, -105 -60, -110 -40
                   C -112 -20, -110 0, -105 20
                   C -100 40, -90 60, -75 75
                   C -60 85, -40 92, -20 95
                   C -10 96, -5 95, 0 90
                   L 0 -100 Z"
                stroke="url(#brainGradient)"
                strokeWidth="3"
                fill="rgba(6, 182, 212, 0.1)"
                filter="url(#brainGlow)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  duration: 1,
                  ease: buildEasing
                }}
              />

              {/* Circunvoluções (dobras) do hemisfério esquerdo */}
              {[
                'M -20 -80 Q -40 -75, -55 -70 Q -70 -68, -80 -60',
                'M -25 -60 Q -45 -58, -60 -50 Q -75 -45, -85 -35',
                'M -30 -40 Q -50 -38, -65 -30 Q -80 -25, -90 -15',
                'M -30 -20 Q -50 -18, -65 -10 Q -80 -5, -88 5',
                'M -25 0 Q -45 3, -60 10 Q -75 15, -85 25',
                'M -20 20 Q -40 25, -55 30 Q -68 35, -75 45',
                'M -15 40 Q -35 48, -50 55 Q -62 62, -68 70',
                'M -10 60 Q -25 68, -40 75 Q -52 80, -58 85',
              ].map((d, i) => (
                <motion.path
                  key={`fold-left-${i}`}
                  d={d}
                  stroke="url(#brainGradient)"
                  strokeWidth="2"
                  fill="none"
                  filter="url(#brainGlow)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.8 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.3 + i * 0.08,
                    ease: buildEasing
                  }}
                />
              ))}

              {/* Circunvoluções menores (detalhes) */}
              {[
                'M -15 -70 Q -25 -68, -35 -65',
                'M -18 -50 Q -28 -48, -38 -45',
                'M -20 -30 Q -30 -28, -40 -25',
                'M -18 -10 Q -28 -8, -38 -5',
                'M -15 10 Q -25 12, -35 15',
                'M -12 30 Q -22 32, -32 35',
                'M -10 50 Q -20 52, -30 55',
              ].map((d, i) => (
                <motion.path
                  key={`detail-left-${i}`}
                  d={d}
                  stroke="url(#brainGradient)"
                  strokeWidth="1.5"
                  fill="none"
                  opacity="0.6"
                  filter="url(#brainGlow)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.6 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.8 + i * 0.05,
                    ease: buildEasing
                  }}
                />
              ))}
            </g>

            {/* Hemisfério Direito - Forma de cérebro real */}
            <g>
              {/* Contorno principal do hemisfério direito */}
              <motion.path
                d="M 10 -100
                   C 30 -105, 60 -100, 80 -85
                   C 95 -75, 105 -60, 110 -40
                   C 112 -20, 110 0, 105 20
                   C 100 40, 90 60, 75 75
                   C 60 85, 40 92, 20 95
                   C 10 96, 5 95, 0 90
                   L 0 -100 Z"
                stroke="url(#brainGradient)"
                strokeWidth="3"
                fill="rgba(6, 182, 212, 0.1)"
                filter="url(#brainGlow)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  duration: 1,
                  ease: buildEasing
                }}
              />

              {/* Circunvoluções (dobras) do hemisfério direito */}
              {[
                'M 20 -80 Q 40 -75, 55 -70 Q 70 -68, 80 -60',
                'M 25 -60 Q 45 -58, 60 -50 Q 75 -45, 85 -35',
                'M 30 -40 Q 50 -38, 65 -30 Q 80 -25, 90 -15',
                'M 30 -20 Q 50 -18, 65 -10 Q 80 -5, 88 5',
                'M 25 0 Q 45 3, 60 10 Q 75 15, 85 25',
                'M 20 20 Q 40 25, 55 30 Q 68 35, 75 45',
                'M 15 40 Q 35 48, 50 55 Q 62 62, 68 70',
                'M 10 60 Q 25 68, 40 75 Q 52 80, 58 85',
              ].map((d, i) => (
                <motion.path
                  key={`fold-right-${i}`}
                  d={d}
                  stroke="url(#brainGradient)"
                  strokeWidth="2"
                  fill="none"
                  filter="url(#brainGlow)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.8 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.3 + i * 0.08,
                    ease: buildEasing
                  }}
                />
              ))}

              {/* Circunvoluções menores (detalhes) */}
              {[
                'M 15 -70 Q 25 -68, 35 -65',
                'M 18 -50 Q 28 -48, 38 -45',
                'M 20 -30 Q 30 -28, 40 -25',
                'M 18 -10 Q 28 -8, 38 -5',
                'M 15 10 Q 25 12, 35 15',
                'M 12 30 Q 22 32, 32 35',
                'M 10 50 Q 20 52, 30 55',
              ].map((d, i) => (
                <motion.path
                  key={`detail-right-${i}`}
                  d={d}
                  stroke="url(#brainGradient)"
                  strokeWidth="1.5"
                  fill="none"
                  opacity="0.6"
                  filter="url(#brainGlow)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.6 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.8 + i * 0.05,
                    ease: buildEasing
                  }}
                />
              ))}
            </g>

            {/* Linha de divisão entre hemisférios */}
            <motion.path
              d="M 0 -100 L 0 90"
              stroke="url(#brainGradient)"
              strokeWidth="2"
              strokeDasharray="4,4"
              fill="none"
              filter="url(#brainGlow)"
              opacity="0.5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.5 }}
              transition={{
                duration: 0.8,
                delay: 0.5,
                ease: buildEasing
              }}
            />

            {/* Cerebelo (parte inferior) */}
            <motion.ellipse
              cx="0"
              cy="100"
              rx="40"
              ry="20"
              stroke="url(#brainGradient)"
              strokeWidth="2"
              fill="rgba(6, 182, 212, 0.08)"
              filter="url(#brainGlow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.8 }}
              transition={{
                duration: 0.6,
                delay: 1,
                ease: buildEasing
              }}
            />

            {/* Conexões neurais (sinapses) - Paths invisíveis para animação */}
            {/* Definir 30 paths de conexão entre pontos do cérebro */}
            {[
              // Conexões internas complexas
              { id: 0, d: 'M -80 -60 Q -40 -80, 0 -70 Q 40 -60, 80 -50' },
              { id: 1, d: 'M -90 -30 Q -50 -40, 0 -35 Q 50 -30, 90 -25' },
              { id: 2, d: 'M -85 0 Q -45 -10, 0 0 Q 45 10, 85 0' },
              { id: 3, d: 'M -90 30 Q -50 40, 0 35 Q 50 30, 90 25' },
              { id: 4, d: 'M -80 60 Q -40 80, 0 70 Q 40 60, 80 50' },
              { id: 5, d: 'M -70 -80 L -70 80' },
              { id: 6, d: 'M -50 -85 L -50 85' },
              { id: 7, d: 'M -30 -90 L -30 90' },
              { id: 8, d: 'M 0 -90 L 0 90' },
              { id: 9, d: 'M 30 -90 L 30 90' },
              { id: 10, d: 'M 50 -85 L 50 85' },
              { id: 11, d: 'M 70 -80 L 70 80' },
              { id: 12, d: 'M -100 -50 Q 0 -30, 100 -50' },
              { id: 13, d: 'M -100 -25 Q 0 -10, 100 -25' },
              { id: 14, d: 'M -100 0 Q 0 15, 100 0' },
              { id: 15, d: 'M -100 25 Q 0 40, 100 25' },
              { id: 16, d: 'M -100 50 Q 0 65, 100 50' },
              { id: 17, d: 'M -60 -70 Q 0 -60, 60 -70' },
              { id: 18, d: 'M -60 70 Q 0 60, 60 70' },
              { id: 19, d: 'M -80 -40 Q -40 0, -80 40' },
              { id: 20, d: 'M 80 -40 Q 40 0, 80 40' },
              { id: 21, d: 'M -90 -20 L 90 -20' },
              { id: 22, d: 'M -90 20 L 90 20' },
              { id: 23, d: 'M -70 -60 L 70 60' },
              { id: 24, d: 'M -70 60 L 70 -60' },
              { id: 25, d: 'M -50 -70 L 50 70' },
              { id: 26, d: 'M -50 70 L 50 -70' },
              { id: 27, d: 'M -40 -80 Q 0 -40, 40 -80' },
              { id: 28, d: 'M -40 80 Q 0 40, 40 80' },
              { id: 29, d: 'M -100 0 Q -50 -50, 0 0 Q 50 50, 100 0' },
            ].map((path) => (
              <path
                key={`synapse-path-${path.id}`}
                id={`synapse-path-${path.id}`}
                d={path.d}
                stroke="transparent"
                fill="none"
              />
            ))}

            {/* Renderizar sinapses ativas */}
            {synapses.map((synapse) => (
              <g key={synapse.id}>
                {/* Pulso de luz viajando pelo path */}
                <motion.circle
                  r="3"
                  fill="url(#synapseGradient)"
                  filter="url(#synapseGlow)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 1.5, ease: 'easeInOut' }}
                >
                  <animateMotion
                    dur="1.5s"
                    repeatCount="1"
                  >
                    <mpath href={`#synapse-path-${synapse.pathId}`} />
                  </animateMotion>
                </motion.circle>

                {/* Trail de partículas */}
                {[0, 1, 2].map((i) => (
                  <motion.circle
                    key={i}
                    r="1.5"
                    fill="#10b981"
                    opacity="0.6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.6, 0] }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.1,
                      ease: 'easeInOut'
                    }}
                  >
                    <animateMotion
                      dur="1.5s"
                      repeatCount="1"
                      begin={`${i * 0.1}s`}
                    >
                      <mpath href={`#synapse-path-${synapse.pathId}`} />
                    </animateMotion>
                  </motion.circle>
                ))}

                {/* Brilho ao longo do path durante sinapse */}
                <motion.path
                  d={`M 0 0`}
                  stroke="url(#synapseGradient)"
                  strokeWidth="2"
                  fill="none"
                  filter="url(#synapseGlow)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{
                    pathLength: [0, 1],
                    opacity: [0, 0.8, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    ease: buildEasing
                  }}
                >
                  <animate
                    attributeName="d"
                    dur="0.01s"
                    repeatCount="1"
                    values={document.getElementById(`synapse-path-${synapse.pathId}`)?.getAttribute('d') || 'M 0 0'}
                  />
                </motion.path>
              </g>
            ))}

            {/* Pontos neurais (nós de conexão) */}
            {buildComplete && [
              { x: -80, y: -60 }, { x: 0, y: -70 }, { x: 80, y: -50 },
              { x: -90, y: -30 }, { x: 0, y: -35 }, { x: 90, y: -25 },
              { x: -85, y: 0 }, { x: 0, y: 0 }, { x: 85, y: 0 },
              { x: -90, y: 30 }, { x: 0, y: 35 }, { x: 90, y: 25 },
              { x: -80, y: 60 }, { x: 0, y: 70 }, { x: 80, y: 50 },
              { x: -70, y: -80 }, { x: -70, y: 80 },
              { x: 70, y: -80 }, { x: 70, y: 80 },
              { x: -50, y: -85 }, { x: 50, y: -85 },
              { x: -50, y: 85 }, { x: 50, y: 85 },
            ].map((point, i) => (
              <motion.circle
                key={`node-${i}`}
                cx={point.x}
                cy={point.y}
                r="2"
                fill="#22d3ee"
                filter="url(#brainGlow)"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{
                  scale: {
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: 'easeInOut'
                  },
                  opacity: {
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: 'easeInOut'
                  }
                }}
              />
            ))}
          </g>
        </svg>
      </motion.div>

      {/* Partículas ao redor do cérebro durante construção */}
      {!buildComplete && Array.from({ length: 30 }).map((_, i) => {
        const angle = (i * 12) * (Math.PI / 180)
        const radius = 200
        return (
          <motion.div
            key={`build-particle-${i}`}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full"
            style={{
              left: '50%',
              top: '50%',
              boxShadow: '0 0 8px rgba(6, 182, 212, 0.8)'
            }}
            initial={{
              x: Math.cos(angle) * radius,
              y: Math.sin(angle) * radius,
              opacity: 0,
              scale: 0
            }}
            animate={{
              x: 0,
              y: 0,
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0]
            }}
            transition={{
              duration: 1,
              delay: i * 0.03,
              ease: buildEasing
            }}
          />
        )
      })}

    </div>
  )
}

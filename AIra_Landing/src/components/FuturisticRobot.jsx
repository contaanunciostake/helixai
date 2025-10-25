/**
 * ════════════════════════════════════════════════════════════════
 * COMPONENTE: FuturisticRobot
 * Robô futurista 3D com animações de construção digital e toque
 * Motion design impecável com spring physics
 * ════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react'
import { motion, useAnimation } from 'framer-motion'

export default function FuturisticRobot() {
  const [buildComplete, setBuildComplete] = useState(false)
  const [touchActive, setTouchActive] = useState(false)
  const [ripples, setRipples] = useState([])
  const armControls = useAnimation()
  const headControls = useAnimation()

  // Partículas de construção digital
  const [buildingParticles, setBuildingParticles] = useState([])

  useEffect(() => {
    // Gerar partículas que formam o robô
    const particles = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      startX: Math.random() * 600 - 300,
      startY: Math.random() * 600 - 300,
      endX: 0,
      endY: 0,
      delay: Math.random() * 0.8
    }))
    setBuildingParticles(particles)

    // Sequência de animação do robô
    const animationSequence = async () => {
      // Aguardar construção
      await new Promise(resolve => setTimeout(resolve, 2000))
      setBuildComplete(true)

      // Aguardar um pouco
      await new Promise(resolve => setTimeout(resolve, 800))

      // Cabeça olha para a tela
      await headControls.start({
        rotateZ: -5,
        x: 20,
        transition: {
          type: 'spring',
          stiffness: 100,
          damping: 15,
          duration: 0.6
        }
      })

      // Aguardar
      await new Promise(resolve => setTimeout(resolve, 500))

      // Braço se estende para tocar
      await armControls.start({
        x: 150,
        y: 80,
        rotateZ: -45,
        transition: {
          type: 'spring',
          stiffness: 80,
          damping: 12,
          duration: 1
        }
      })

      // Criar ondas ripple ao tocar
      setTouchActive(true)
      createRipple()

      // Loop de toque periódico
      setInterval(() => {
        createRipple()
      }, 3000)
    }

    animationSequence()
  }, [])

  const createRipple = () => {
    const newRipple = {
      id: Date.now(),
      x: 400,
      y: 350
    }
    setRipples(prev => [...prev, newRipple])

    // Remover ripple após animação
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id))
    }, 2000)
  }

  // Easing customizado para animações suaves
  const springConfig = {
    type: 'spring',
    stiffness: 120,
    damping: 20
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Partículas de construção digital */}
      {!buildComplete && buildingParticles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-cyan-400"
          style={{
            left: '50%',
            top: '50%',
            boxShadow: '0 0 10px rgba(6, 182, 212, 0.8)'
          }}
          initial={{
            x: particle.startX,
            y: particle.startY,
            opacity: 0,
            scale: 0
          }}
          animate={{
            x: particle.endX,
            y: particle.endY,
            opacity: [0, 1, 1, 0],
            scale: [0, 1.5, 1, 0]
          }}
          transition={{
            duration: 1.5,
            delay: particle.delay,
            ease: [0.43, 0.13, 0.23, 0.96]
          }}
        />
      ))}

      {/* Grid de construção */}
      {!buildComplete && (
        <motion.div
          className="absolute"
          style={{
            width: 400,
            height: 500,
            border: '2px solid rgba(6, 182, 212, 0.3)',
            background: 'linear-gradient(rgba(6, 182, 212, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.05) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0, 1, 0], scale: [0.8, 1.1, 1] }}
          transition={{ duration: 2, ease: 'easeOut' }}
        />
      )}

      {/* SVG do Robô */}
      <svg
        width="500"
        height="600"
        viewBox="0 0 500 600"
        className="relative z-10"
        style={{ filter: 'drop-shadow(0 0 20px rgba(6, 182, 212, 0.5))' }}
      >
        <defs>
          {/* Gradientes neon */}
          <linearGradient id="robotGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="1" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="1" />
          </linearGradient>

          <linearGradient id="visorGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="1" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="1" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="1" />
          </linearGradient>

          {/* Filtros para glow effect */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Corpo do Robô */}
        <motion.g
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: buildComplete ? 1 : 0,
            scale: buildComplete ? 1 : 0
          }}
          transition={{
            duration: 0.8,
            delay: 1.2,
            ...springConfig
          }}
        >
          {/* Torso */}
          <motion.rect
            x="180"
            y="200"
            width="140"
            height="180"
            rx="10"
            fill="url(#robotGradient)"
            stroke="#22d3ee"
            strokeWidth="2"
            filter="url(#glow)"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: buildComplete ? 1 : 0 }}
            transition={{ duration: 0.5, delay: 1.4, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ transformOrigin: 'center' }}
          />

          {/* Detalhes do torso - linhas horizontais */}
          {[0, 1, 2].map((i) => (
            <motion.line
              key={i}
              x1="190"
              y1={220 + i * 50}
              x2="310"
              y2={220 + i * 50}
              stroke="#22d3ee"
              strokeWidth="1"
              opacity="0.6"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: buildComplete ? 1 : 0 }}
              transition={{ duration: 0.4, delay: 1.6 + i * 0.1 }}
            />
          ))}

          {/* Core central - círculo pulsante */}
          <motion.circle
            cx="250"
            cy="290"
            r="20"
            fill="#22d3ee"
            filter="url(#glow)"
            initial={{ scale: 0 }}
            animate={{
              scale: buildComplete ? [1, 1.2, 1] : 0,
            }}
            transition={{
              scale: {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              },
              delay: 1.8
            }}
          />

          {/* Pernas */}
          <motion.rect
            x="190"
            y="380"
            width="50"
            height="120"
            rx="5"
            fill="url(#robotGradient)"
            stroke="#22d3ee"
            strokeWidth="2"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: buildComplete ? 1 : 0 }}
            transition={{ duration: 0.4, delay: 1.5, ease: 'easeOut' }}
            style={{ transformOrigin: 'top' }}
          />
          <motion.rect
            x="260"
            y="380"
            width="50"
            height="120"
            rx="5"
            fill="url(#robotGradient)"
            stroke="#22d3ee"
            strokeWidth="2"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: buildComplete ? 1 : 0 }}
            transition={{ duration: 0.4, delay: 1.5, ease: 'easeOut' }}
            style={{ transformOrigin: 'top' }}
          />

          {/* Pés */}
          <motion.rect
            x="185"
            y="500"
            width="60"
            height="20"
            rx="10"
            fill="#22d3ee"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: buildComplete ? 1 : 0 }}
            transition={{ duration: 0.3, delay: 1.9, ease: 'easeOut' }}
            style={{ transformOrigin: 'center' }}
          />
          <motion.rect
            x="255"
            y="500"
            width="60"
            height="20"
            rx="10"
            fill="#22d3ee"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: buildComplete ? 1 : 0 }}
            transition={{ duration: 0.3, delay: 1.9, ease: 'easeOut' }}
            style={{ transformOrigin: 'center' }}
          />
        </motion.g>

        {/* Cabeça - com animação de olhar */}
        <motion.g
          animate={headControls}
          initial={{ opacity: 0, y: -50 }}
          style={{ transformOrigin: '250px 120px' }}
        >
          <motion.g
            animate={{
              opacity: buildComplete ? 1 : 0,
              y: buildComplete ? 0 : -50
            }}
            transition={{
              duration: 0.6,
              delay: 1.6,
              type: 'spring',
              stiffness: 100
            }}
          >
            {/* Cabeça principal */}
            <rect
              x="200"
              y="80"
              width="100"
              height="100"
              rx="15"
              fill="url(#robotGradient)"
              stroke="#22d3ee"
              strokeWidth="2"
              filter="url(#glow)"
            />

            {/* Antena */}
            <motion.line
              x1="250"
              y1="80"
              x2="250"
              y2="50"
              stroke="#22d3ee"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: buildComplete ? 1 : 0 }}
              transition={{ duration: 0.3, delay: 1.9 }}
            />
            <motion.circle
              cx="250"
              cy="45"
              r="5"
              fill="#22d3ee"
              filter="url(#glow)"
              initial={{ scale: 0 }}
              animate={{
                scale: buildComplete ? [1, 1.5, 1] : 0
              }}
              transition={{
                scale: {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                },
                delay: 2
              }}
            />

            {/* Visor - com efeito de scan */}
            <rect
              x="210"
              y="110"
              width="80"
              height="30"
              rx="5"
              fill="url(#visorGlow)"
              opacity="0.9"
              filter="url(#glow)"
            />

            {/* Linha de scan animada */}
            <motion.line
              x1="210"
              y1="125"
              x2="290"
              y2="125"
              stroke="#ffffff"
              strokeWidth="2"
              opacity="0.8"
              initial={{ x1: 210, x2: 210 }}
              animate={{
                x1: [210, 290],
                x2: [210, 290]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />

            {/* "Olhos" - pontos de luz */}
            <motion.circle
              cx="230"
              cy="125"
              r="3"
              fill="#ffffff"
              filter="url(#glow)"
              animate={{
                opacity: [1, 0.3, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
            <motion.circle
              cx="270"
              cy="125"
              r="3"
              fill="#ffffff"
              filter="url(#glow)"
              animate={{
                opacity: [1, 0.3, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.2
              }}
            />

            {/* Detalhes faciais */}
            <line
              x1="210"
              y1="155"
              x2="230"
              y2="155"
              stroke="#22d3ee"
              strokeWidth="2"
              opacity="0.6"
            />
            <line
              x1="270"
              y1="155"
              x2="290"
              y2="155"
              stroke="#22d3ee"
              strokeWidth="2"
              opacity="0.6"
            />
          </motion.g>
        </motion.g>

        {/* Braço esquerdo - estático */}
        <motion.g
          initial={{ opacity: 0, x: -30 }}
          animate={{
            opacity: buildComplete ? 1 : 0,
            x: buildComplete ? 0 : -30
          }}
          transition={{
            duration: 0.5,
            delay: 1.7,
            ...springConfig
          }}
        >
          <rect
            x="130"
            y="220"
            width="50"
            height="100"
            rx="5"
            fill="url(#robotGradient)"
            stroke="#22d3ee"
            strokeWidth="2"
          />
          <rect
            x="110"
            y="320"
            width="30"
            height="60"
            rx="15"
            fill="#22d3ee"
          />
        </motion.g>

        {/* Braço direito - com animação de toque */}
        <motion.g
          animate={armControls}
          initial={{ opacity: 0, x: 30 }}
          style={{ transformOrigin: '320px 240px' }}
        >
          <motion.g
            animate={{
              opacity: buildComplete ? 1 : 0,
              x: buildComplete ? 0 : 30
            }}
            transition={{
              duration: 0.5,
              delay: 1.7,
              ...springConfig
            }}
          >
            {/* Ombro */}
            <rect
              x="320"
              y="220"
              width="50"
              height="40"
              rx="5"
              fill="url(#robotGradient)"
              stroke="#22d3ee"
              strokeWidth="2"
            />

            {/* Braço */}
            <rect
              x="330"
              y="260"
              width="30"
              height="80"
              rx="5"
              fill="url(#robotGradient)"
              stroke="#22d3ee"
              strokeWidth="2"
            />

            {/* Mão/Dedo apontando */}
            <motion.g
              animate={touchActive ? {
                y: [0, -5, 0]
              } : {}}
              transition={{
                duration: 0.3,
                repeat: touchActive ? Infinity : 0,
                repeatDelay: 2.7
              }}
            >
              <circle
                cx="345"
                cy="350"
                r="15"
                fill="#22d3ee"
                filter="url(#glow)"
              />
              <rect
                x="342"
                y="350"
                width="6"
                height="30"
                rx="3"
                fill="#22d3ee"
                filter="url(#glow)"
              />
            </motion.g>
          </motion.g>
        </motion.g>
      </svg>

      {/* Ondas Ripple ao tocar */}
      {ripples.map((ripple) => (
        <motion.div
          key={ripple.id}
          className="absolute rounded-full border-4 border-cyan-400"
          style={{
            left: ripple.x,
            top: ripple.y,
            transform: 'translate(-50%, -50%)'
          }}
          initial={{
            width: 0,
            height: 0,
            opacity: 1,
            borderColor: 'rgba(6, 182, 212, 1)'
          }}
          animate={{
            width: 400,
            height: 400,
            opacity: 0,
            borderColor: 'rgba(6, 182, 212, 0)'
          }}
          transition={{
            duration: 2,
            ease: [0.43, 0.13, 0.23, 0.96]
          }}
        />
      ))}

      {/* Ondas ripple secundárias */}
      {ripples.map((ripple) => (
        <motion.div
          key={`${ripple.id}-secondary`}
          className="absolute rounded-full border-2 border-blue-400"
          style={{
            left: ripple.x,
            top: ripple.y,
            transform: 'translate(-50%, -50%)'
          }}
          initial={{
            width: 0,
            height: 0,
            opacity: 0.8,
            borderColor: 'rgba(59, 130, 246, 0.8)'
          }}
          animate={{
            width: 500,
            height: 500,
            opacity: 0,
            borderColor: 'rgba(59, 130, 246, 0)'
          }}
          transition={{
            duration: 2.5,
            delay: 0.2,
            ease: [0.43, 0.13, 0.23, 0.96]
          }}
        />
      ))}

      {/* Partículas ao redor do ponto de toque */}
      {touchActive && ripples.slice(-1).map((ripple) => (
        Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30) * (Math.PI / 180)
          const distance = 50
          return (
            <motion.div
              key={`particle-${ripple.id}-${i}`}
              className="absolute w-2 h-2 bg-cyan-400 rounded-full"
              style={{
                left: ripple.x,
                top: ripple.y,
                boxShadow: '0 0 10px rgba(6, 182, 212, 0.8)'
              }}
              initial={{
                x: 0,
                y: 0,
                opacity: 1,
                scale: 1
              }}
              animate={{
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance,
                opacity: 0,
                scale: 0
              }}
              transition={{
                duration: 1,
                ease: 'easeOut'
              }}
            />
          )
        })
      ))}
    </div>
  )
}

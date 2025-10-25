import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const AstronautRocket = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Detectar quando uma seção aparece na viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            setTimeout(() => setIsVisible(false), 4000) // Astronauta atravessa e desaparece
          }
        })
      },
      { threshold: 0.3 }
    )

    // Observar as seções da página
    const sections = document.querySelectorAll('#features, #how-it-works, #pricing')
    sections.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [])

  return (
    <>
      {isVisible && (
        <motion.div
          className="fixed z-50 pointer-events-none"
          initial={{ x: -200, y: '50vh', rotate: -45 }}
          animate={{
            x: ['0vw', '120vw'],
            y: ['50vh', '30vh', '50vh'],
            rotate: [45, 40, 45]
          }}
          transition={{
            duration: 4,
            ease: 'easeInOut',
            times: [0, 0.5, 1]
          }}
          style={{
            top: 0,
            left: 0
          }}
        >
          {/* Foguete */}
          <div className="relative">
            {/* Corpo do foguete */}
            <motion.div
              className="relative"
              animate={{
                y: [0, -8, 0]
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Chamas do foguete */}
              <motion.div
                className="absolute -bottom-16 left-1/2 transform -translate-x-1/2"
                animate={{
                  scaleY: [1, 1.3, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{
                  duration: 0.3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {/* Chama principal - vermelha/laranja */}
                <div className="w-16 h-24 bg-gradient-to-b from-yellow-300 via-orange-500 to-red-600 rounded-full blur-sm" />

                {/* Chama secundária - amarela */}
                <motion.div
                  className="absolute top-0 left-1/2 transform -translate-x-1/2 w-10 h-16 bg-gradient-to-b from-white via-yellow-200 to-orange-400 rounded-full blur-[2px]"
                  animate={{
                    scaleY: [1.2, 1, 1.2],
                    opacity: [1, 0.7, 1]
                  }}
                  transition={{
                    duration: 0.2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                {/* Partículas de fogo */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-orange-400 rounded-full"
                    style={{
                      left: `${20 + Math.random() * 40}%`,
                      top: `${60 + Math.random() * 20}%`
                    }}
                    animate={{
                      y: [0, 30, 60],
                      x: [(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 40],
                      opacity: [1, 0.5, 0],
                      scale: [1, 0.5, 0]
                    }}
                    transition={{
                      duration: 0.5 + Math.random() * 0.5,
                      repeat: Infinity,
                      delay: Math.random() * 0.5
                    }}
                  />
                ))}
              </motion.div>

              {/* Foguete SVG */}
              <svg
                width="80"
                height="120"
                viewBox="0 0 80 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-2xl"
              >
                {/* Corpo do foguete */}
                <path
                  d="M 40 10 L 55 40 L 55 90 L 45 100 L 35 100 L 25 90 L 25 40 Z"
                  fill="url(#rocketGradient)"
                  stroke="#1e40af"
                  strokeWidth="2"
                />

                {/* Janela */}
                <circle cx="40" cy="30" r="8" fill="#60a5fa" opacity="0.8" />
                <circle cx="40" cy="30" r="6" fill="#dbeafe" opacity="0.6" />

                {/* Asa esquerda */}
                <path
                  d="M 25 70 L 10 90 L 25 85 Z"
                  fill="url(#wingGradient)"
                  stroke="#dc2626"
                  strokeWidth="2"
                />

                {/* Asa direita */}
                <path
                  d="M 55 70 L 70 90 L 55 85 Z"
                  fill="url(#wingGradient)"
                  stroke="#dc2626"
                  strokeWidth="2"
                />

                {/* Detalhes */}
                <rect x="35" y="50" width="10" height="30" fill="#1e40af" opacity="0.5" rx="2" />

                {/* Gradientes */}
                <defs>
                  <linearGradient id="rocketGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#1e40af" />
                  </linearGradient>
                  <linearGradient id="wingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#dc2626" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Astronauta no topo do foguete */}
              <motion.div
                className="absolute -top-12 left-1/2 transform -translate-x-1/2"
                animate={{
                  rotate: [-5, 5, -5]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="text-5xl">🧑‍🚀</div>
              </motion.div>

              {/* Brilho do foguete */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-b from-blue-400/30 to-transparent rounded-full blur-xl"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>

            {/* Rastro de fumaça/estrelas */}
            <motion.div
              className="absolute top-0 left-1/2 transform -translate-x-1/2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-blue-300 rounded-full"
                  style={{
                    left: `${(Math.random() - 0.5) * 60}px`,
                    top: `${i * 15}px`
                  }}
                  animate={{
                    opacity: [0, 0.8, 0],
                    scale: [0, 1.5, 0],
                    x: [(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 60]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.1
                  }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </>
  )
}

export default AstronautRocket

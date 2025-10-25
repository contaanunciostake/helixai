/**
 * ════════════════════════════════════════════════════════════════
 * COMPONENTE: GlitchTransition
 * Efeito de glitch violento estilo TV antiga com scan lines
 * ════════════════════════════════════════════════════════════════
 */

import { motion } from 'framer-motion'

export default function GlitchTransition({ isActive = false, onComplete }) {
  if (!isActive) return null

  return (
    <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
      {/* Glitch RGB Split */}
      <motion.div
        className="absolute inset-0 bg-red-500 mix-blend-screen"
        initial={{ opacity: 0, x: 0 }}
        animate={{
          opacity: [0, 0.3, 0, 0.5, 0, 0.2, 0],
          x: [-5, 5, -3, 2, -4, 0],
          y: [0, 2, -2, 1, -1, 0]
        }}
        transition={{
          duration: 0.5,
          times: [0, 0.1, 0.2, 0.4, 0.6, 0.8, 1],
          ease: 'linear'
        }}
      />
      <motion.div
        className="absolute inset-0 bg-cyan-500 mix-blend-screen"
        initial={{ opacity: 0, x: 0 }}
        animate={{
          opacity: [0, 0.3, 0, 0.5, 0, 0.2, 0],
          x: [5, -5, 3, -2, 4, 0],
          y: [0, -2, 2, -1, 1, 0]
        }}
        transition={{
          duration: 0.5,
          times: [0, 0.1, 0.2, 0.4, 0.6, 0.8, 1],
          ease: 'linear'
        }}
      />
      <motion.div
        className="absolute inset-0 bg-green-500 mix-blend-screen"
        initial={{ opacity: 0, x: 0 }}
        animate={{
          opacity: [0, 0.2, 0, 0.4, 0, 0.1, 0],
          x: [2, -2, 4, -3, 2, 0],
          y: [1, -1, 2, -2, 1, 0]
        }}
        transition={{
          duration: 0.5,
          times: [0, 0.1, 0.2, 0.4, 0.6, 0.8, 1],
          ease: 'linear'
        }}
      />

      {/* Scan Lines */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 0, 0.1) 2px, rgba(0, 255, 0, 0.1) 4px)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.6, 0.3, 0.8, 0] }}
        transition={{ duration: 0.5 }}
      />

      {/* Horizontal Glitch Bars */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute left-0 right-0 bg-white"
          style={{
            height: Math.random() * 3 + 1,
            top: `${Math.random() * 100}%`,
            mixBlendMode: 'overlay'
          }}
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{
            opacity: [0, 1, 0, 1, 0],
            scaleX: [0, 1.2, 0.8, 1, 0],
            x: [0, -20, 20, -10, 0]
          }}
          transition={{
            duration: 0.5,
            delay: i * 0.05,
            ease: 'linear'
          }}
        />
      ))}

      {/* Vertical Noise Bars */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`v-${i}`}
          className="absolute top-0 bottom-0 bg-gradient-to-b from-transparent via-white to-transparent"
          style={{
            width: Math.random() * 40 + 10,
            left: `${Math.random() * 100}%`,
            mixBlendMode: 'overlay'
          }}
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{
            opacity: [0, 0.6, 0, 0.4, 0],
            scaleY: [0, 1, 0.8, 1, 0],
            y: [0, 100, -50, 50, 0]
          }}
          transition={{
            duration: 0.5,
            delay: i * 0.04,
            ease: 'linear'
          }}
        />
      ))}

      {/* Digital Noise Overlay */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
          opacity: 0.15
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.3, 0.15, 0.4, 0] }}
        transition={{ duration: 0.5 }}
      />

      {/* Screen Flash */}
      <motion.div
        className="absolute inset-0 bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.8, 0, 0.5, 0] }}
        transition={{
          duration: 0.5,
          times: [0, 0.2, 0.4, 0.7, 1]
        }}
        onAnimationComplete={onComplete}
      />

      {/* CRT Curvature Effect */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.3) 100%)',
          pointerEvents: 'none'
        }}
      />
    </div>
  )
}

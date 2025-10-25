/**
 * ════════════════════════════════════════════════════════════════
 * COMPONENTE: NeuralNetwork - Background 3D de Conexões Neuronais
 * Sistema ultra realista de neurônios conectados com animações 3D
 * ════════════════════════════════════════════════════════════════
 */

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

export default function NeuralNetwork({ intensity = 'medium', color = 'blue' }) {
  const canvasRef = useRef(null)
  const animationFrameRef = useRef(null)
  const [isVisible, setIsVisible] = useState(true)

  // Configurações baseadas na intensidade
  const config = {
    low: { neurons: 30, connections: 50, speed: 0.3 },
    medium: { neurons: 50, connections: 80, speed: 0.5 },
    high: { neurons: 80, connections: 120, speed: 0.8 }
  }[intensity]

  // Paleta de cores baseada no tema
  const colorScheme = {
    blue: {
      neuron: 'rgba(59, 130, 246, 0.9)',      // blue-500
      connection: 'rgba(96, 165, 250, 0.3)',  // blue-400
      pulse: 'rgba(147, 197, 253, 1)',        // blue-300
      glow: 'rgba(59, 130, 246, 0.6)'
    },
    purple: {
      neuron: 'rgba(168, 85, 247, 0.9)',      // purple-500
      connection: 'rgba(192, 132, 252, 0.3)', // purple-400
      pulse: 'rgba(216, 180, 254, 1)',        // purple-300
      glow: 'rgba(168, 85, 247, 0.6)'
    },
    pink: {
      neuron: 'rgba(236, 72, 153, 0.9)',      // pink-500
      connection: 'rgba(244, 114, 182, 0.3)', // pink-400
      pulse: 'rgba(249, 168, 212, 1)',        // pink-300
      glow: 'rgba(236, 72, 153, 0.6)'
    },
    cyan: {
      neuron: 'rgba(6, 182, 212, 0.9)',       // cyan-500
      connection: 'rgba(34, 211, 238, 0.3)',  // cyan-400
      pulse: 'rgba(103, 232, 249, 1)',        // cyan-300
      glow: 'rgba(6, 182, 212, 0.6)'
    }
  }[color]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1

    // Ajustar tamanho do canvas
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
    }

    resize()
    window.addEventListener('resize', resize)

    // Classe Neurônio
    class Neuron {
      constructor(x, y, z) {
        this.x = x
        this.y = y
        this.z = z // Profundidade para efeito 3D
        this.baseX = x
        this.baseY = y
        this.baseZ = z
        this.vx = (Math.random() - 0.5) * config.speed
        this.vy = (Math.random() - 0.5) * config.speed
        this.vz = (Math.random() - 0.5) * 0.2
        this.radius = 2 + Math.random() * 3
        this.pulsePhase = Math.random() * Math.PI * 2
        this.active = Math.random() > 0.5
        this.activationTime = 0
        this.opacity = 0
        this.fadeSpeed = 0.01 + Math.random() * 0.02
      }

      update(time) {
        // Movimento suave com retorno à posição base
        this.x += this.vx
        this.y += this.vy
        this.z += this.vz

        // Força de retorno (como uma mola)
        const dx = this.baseX - this.x
        const dy = this.baseY - this.y
        const dz = this.baseZ - this.z

        this.vx += dx * 0.001
        this.vy += dy * 0.001
        this.vz += dz * 0.001

        // Damping (amortecimento)
        this.vx *= 0.98
        this.vy *= 0.98
        this.vz *= 0.98

        // Pulsação
        this.pulsePhase += 0.02

        // Ativação aleatória
        if (Math.random() < 0.001) {
          this.active = !this.active
          this.activationTime = time
        }

        // Fade in/out suave
        if (this.active) {
          this.opacity = Math.min(1, this.opacity + this.fadeSpeed)
        } else {
          this.opacity = Math.max(0, this.opacity - this.fadeSpeed)
        }
      }

      draw(ctx, time, width, height) {
        // Calcular tamanho baseado na profundidade (perspectiva 3D)
        const scale = 1 + this.z / 500
        const size = this.radius * scale
        const pulse = Math.sin(this.pulsePhase) * 0.5 + 0.5
        const finalSize = size * (1 + pulse * 0.3)

        // Calcular posição 3D projetada
        const perspective = 600
        const projectedX = (this.x - width / 2) * (perspective / (perspective + this.z)) + width / 2
        const projectedY = (this.y - height / 2) * (perspective / (perspective + this.z)) + height / 2

        // Glow externo
        const gradient = ctx.createRadialGradient(
          projectedX, projectedY, 0,
          projectedX, projectedY, finalSize * 3
        )
        gradient.addColorStop(0, colorScheme.glow.replace('0.6', String(this.opacity * 0.6)))
        gradient.addColorStop(0.5, colorScheme.glow.replace('0.6', String(this.opacity * 0.2)))
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

        ctx.beginPath()
        ctx.fillStyle = gradient
        ctx.arc(projectedX, projectedY, finalSize * 3, 0, Math.PI * 2)
        ctx.fill()

        // Núcleo interno
        const coreGradient = ctx.createRadialGradient(
          projectedX, projectedY, 0,
          projectedX, projectedY, finalSize
        )
        coreGradient.addColorStop(0, colorScheme.pulse.replace('1)', `${this.opacity})`))
        coreGradient.addColorStop(0.6, colorScheme.neuron.replace('0.9', String(this.opacity * 0.9)))
        coreGradient.addColorStop(1, colorScheme.neuron.replace('0.9', String(this.opacity * 0.3)))

        ctx.beginPath()
        ctx.fillStyle = coreGradient
        ctx.arc(projectedX, projectedY, finalSize, 0, Math.PI * 2)
        ctx.fill()

        // Anel externo quando ativo
        if (this.active && this.opacity > 0.5) {
          ctx.beginPath()
          ctx.strokeStyle = colorScheme.pulse.replace('1)', `${pulse * this.opacity * 0.8})`)
          ctx.lineWidth = 2
          ctx.arc(projectedX, projectedY, finalSize * 2, 0, Math.PI * 2)
          ctx.stroke()
        }
      }

      getProjectedPos(width, height) {
        const perspective = 600
        return {
          x: (this.x - width / 2) * (perspective / (perspective + this.z)) + width / 2,
          y: (this.y - height / 2) * (perspective / (perspective + this.z)) + height / 2,
          z: this.z
        }
      }
    }

    // Classe Conexão
    class Connection {
      constructor(n1, n2) {
        this.n1 = n1
        this.n2 = n2
        this.pulsePosition = 0
        this.pulseSpeed = 0.01 + Math.random() * 0.02
        this.opacity = 0
        this.fadeSpeed = 0.005 + Math.random() * 0.01
      }

      update() {
        this.pulsePosition += this.pulseSpeed
        if (this.pulsePosition > 1) {
          this.pulsePosition = 0
        }

        // Conexão ativa quando ambos neurônios estão ativos
        const shouldBeActive = this.n1.active && this.n2.active
        if (shouldBeActive) {
          this.opacity = Math.min(1, this.opacity + this.fadeSpeed)
        } else {
          this.opacity = Math.max(0, this.opacity - this.fadeSpeed)
        }
      }

      draw(ctx, width, height) {
        if (this.opacity < 0.1) return

        const pos1 = this.n1.getProjectedPos(width, height)
        const pos2 = this.n2.getProjectedPos(width, height)

        // Linha de conexão com gradiente
        const gradient = ctx.createLinearGradient(pos1.x, pos1.y, pos2.x, pos2.y)
        gradient.addColorStop(0, colorScheme.connection.replace('0.3', String(this.opacity * 0.3)))
        gradient.addColorStop(0.5, colorScheme.connection.replace('0.3', String(this.opacity * 0.5)))
        gradient.addColorStop(1, colorScheme.connection.replace('0.3', String(this.opacity * 0.3)))

        ctx.beginPath()
        ctx.strokeStyle = gradient
        ctx.lineWidth = 1
        ctx.moveTo(pos1.x, pos1.y)
        ctx.lineTo(pos2.x, pos2.y)
        ctx.stroke()

        // Pulso de energia viajando pela conexão
        if (this.opacity > 0.5) {
          const pulseX = pos1.x + (pos2.x - pos1.x) * this.pulsePosition
          const pulseY = pos1.y + (pos2.y - pos1.y) * this.pulsePosition

          const pulseGradient = ctx.createRadialGradient(pulseX, pulseY, 0, pulseX, pulseY, 4)
          pulseGradient.addColorStop(0, colorScheme.pulse)
          pulseGradient.addColorStop(0.5, colorScheme.pulse.replace('1)', '0.6)'))
          pulseGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

          ctx.beginPath()
          ctx.fillStyle = pulseGradient
          ctx.arc(pulseX, pulseY, 4, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    // Criar neurônios
    const neurons = []
    const width = canvas.width / dpr
    const height = canvas.height / dpr

    for (let i = 0; i < config.neurons; i++) {
      neurons.push(new Neuron(
        Math.random() * width,
        Math.random() * height,
        Math.random() * 200 - 100 // Profundidade de -100 a +100
      ))
    }

    // Criar conexões baseadas em distância
    const connections = []
    const maxDistance = 200

    for (let i = 0; i < neurons.length; i++) {
      let connectionCount = 0
      for (let j = i + 1; j < neurons.length; j++) {
        const dx = neurons[i].x - neurons[j].x
        const dy = neurons[i].y - neurons[j].y
        const dz = neurons[i].z - neurons[j].z
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

        if (distance < maxDistance && connectionCount < 4) {
          connections.push(new Connection(neurons[i], neurons[j]))
          connectionCount++
        }
      }
    }

    // Loop de animação
    let time = 0
    const animate = () => {
      time++
      const width = canvas.width / dpr
      const height = canvas.height / dpr

      // Limpar canvas com fade suave
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.fillRect(0, 0, width, height)

      // Atualizar e desenhar conexões
      connections.forEach(conn => {
        conn.update()
        conn.draw(ctx, width, height)
      })

      // Atualizar e desenhar neurônios
      neurons.forEach(neuron => {
        neuron.update(time)
        neuron.draw(ctx, time, width, height)
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    // Cleanup
    return () => {
      window.removeEventListener('resize', resize)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [intensity, color])

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 2 }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          mixBlendMode: 'screen',
          filter: 'blur(0.5px)'
        }}
      />
      {/* Overlay gradient para suavizar */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20 pointer-events-none" />
    </motion.div>
  )
}

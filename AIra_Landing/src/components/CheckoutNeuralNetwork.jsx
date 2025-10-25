/**
 * ════════════════════════════════════════════════════════════════
 * COMPONENTE: CheckoutNeuralNetwork
 * Background neural network idêntico ao checkout.html
 * ════════════════════════════════════════════════════════════════
 */

import { useEffect, useRef } from 'react'

export default function CheckoutNeuralNetwork() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')

    // Ajustar tamanho do canvas
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Classe Neuron (exatamente como no checkout.html)
    class Neuron {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.vx = (Math.random() - 0.5) * 0.5
        this.vy = (Math.random() - 0.5) * 0.5
        this.radius = 2
        this.connections = []
      }

      update() {
        this.x += this.vx
        this.y += this.vy

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1
      }

      draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(16, 185, 129, 0.8)'
        ctx.shadowBlur = 10
        ctx.shadowColor = 'rgba(16, 185, 129, 0.5)'
        ctx.fill()
        ctx.shadowBlur = 0
      }
    }

    // Criar neurônios
    const neurons = Array(50).fill().map(() => new Neuron())

    // Loop de animação
    function animate() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Desenhar conexões
      for (let i = 0; i < neurons.length; i++) {
        for (let j = i + 1; j < neurons.length; j++) {
          const dx = neurons[i].x - neurons[j].x
          const dy = neurons[i].y - neurons[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 150) {
            ctx.beginPath()
            ctx.moveTo(neurons[i].x, neurons[i].y)
            ctx.lineTo(neurons[j].x, neurons[j].y)
            ctx.strokeStyle = `rgba(16, 185, 129, ${0.3 * (1 - distance / 150)})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      }

      // Atualizar e desenhar neurônios
      neurons.forEach(neuron => {
        neuron.update()
        neuron.draw()
      })

      requestAnimationFrame(animate)
    }

    animate()

    // Redimensionar canvas
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      id="neural-canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        mixBlendMode: 'screen'
      }}
    />
  )
}

/**
 * ════════════════════════════════════════════════════════════════
 * COMPONENTE: MatrixRain
 * Efeito Matrix com código caindo estilo hacker
 * ════════════════════════════════════════════════════════════════
 */

import { useEffect, useRef } from 'react'

export default function MatrixRain({ isActive = true, intensity = 1 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!isActive) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')

    // Ajustar tamanho
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Caracteres Matrix (katakana + números + símbolos)
    const matrixChars = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%^&*()_+-=[]{}|;:,.<>?'
    const fontSize = 14
    const columns = Math.floor(canvas.width / fontSize)

    // Array de gotas (uma por coluna)
    const drops = []
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100 // Começar em posições aleatórias
    }

    let animationFrame

    function draw() {
      // Efeito de fade (trail)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Estilo do texto
      ctx.font = `${fontSize}px monospace`

      // Desenhar caracteres
      for (let i = 0; i < drops.length; i++) {
        // Caractere aleatório
        const char = matrixChars[Math.floor(Math.random() * matrixChars.length)]

        // Cor verde neon com variação de intensidade
        const brightness = Math.random() * 0.5 + 0.5
        ctx.fillStyle = `rgba(0, 255, 65, ${brightness * intensity})`

        // Posição
        const x = i * fontSize
        const y = drops[i] * fontSize

        ctx.fillText(char, x, y)

        // Destaque na ponta (caractere mais brilhante)
        if (drops[i] * fontSize > 0 && drops[i] * fontSize < canvas.height) {
          ctx.fillStyle = `rgba(200, 255, 200, ${intensity})`
          ctx.fillText(char, x, y)
        }

        // Resetar quando chegar no fim ou aleatoriamente
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }

        // Incrementar Y
        drops[i] += 0.5 + Math.random() * 0.5
      }

      animationFrame = requestAnimationFrame(draw)
    }

    draw()

    // Resize handler
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [isActive, intensity])

  if (!isActive) return null

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0"
      style={{ opacity: intensity }}
    />
  )
}

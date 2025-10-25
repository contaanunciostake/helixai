/**
 * ════════════════════════════════════════════════════════════════
 * COMPONENTE: NanobotCanvas
 * Renderização otimizada de partículas usando Canvas API
 *
 * PERFORMANCE:
 * - OffscreenCanvas para pre-render (quando disponível)
 * - RequestAnimationFrame para 60fps
 * - Batch rendering de partículas
 * - Clear parcial em vez de full clear
 * ════════════════════════════════════════════════════════════════
 */

import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react'

const NanobotCanvas = forwardRef(({
  width,
  height,
  nanobots = [],
  sparks = [],
  portals = [],
  energyWaves = [],
  phase = 'idle'
}, ref) => {
  const canvasRef = useRef(null)
  const ctxRef = useRef(null)
  const animationFrameRef = useRef(null)

  // Expor métodos para componente pai
  useImperativeHandle(ref, () => ({
    getContext: () => ctxRef.current,
    flash: () => flash(),
    shake: () => shake()
  }))

  // Inicializar canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true // Performance hint
    })

    ctxRef.current = ctx

    // Set resolution
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
  }, [width, height])

  // Main render loop
  useEffect(() => {
    const ctx = ctxRef.current
    if (!ctx) return

    const render = () => {
      // Clear com fade (cria trail effect)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.fillRect(0, 0, width, height)

      // === FASE 1: PORTAIS ===
      if (phase === 'anticipation' || phase === 'invasion') {
        renderPortals(ctx, portals)
      }

      // === FASE 2: ONDAS DE ENERGIA ===
      if (energyWaves.length > 0) {
        renderEnergyWaves(ctx, energyWaves)
      }

      // === FASE 3: NANOBOTS ===
      if (nanobots.length > 0) {
        renderNanobots(ctx, nanobots)
      }

      // === FASE 4: FAÍSCAS ===
      if (sparks.length > 0) {
        renderSparks(ctx, sparks)
      }

      animationFrameRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [nanobots, sparks, portals, energyWaves, phase, width, height])

  /**
   * Renderizar portais de entrada
   * PSICOLOGIA: Anticipação = dopamina pré-recompensa
   */
  const renderPortals = (ctx, portals) => {
    portals.forEach(portal => {
      // Glow externo
      const gradient = ctx.createRadialGradient(
        portal.x, portal.y, 0,
        portal.x, portal.y, portal.radius * 3
      )
      gradient.addColorStop(0, `${portal.color}80`) // 50% opacity
      gradient.addColorStop(0.5, `${portal.color}40`)
      gradient.addColorStop(1, `${portal.color}00`)

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(portal.x, portal.y, portal.radius * 3, 0, Math.PI * 2)
      ctx.fill()

      // Núcleo brilhante
      const coreGradient = ctx.createRadialGradient(
        portal.x, portal.y, 0,
        portal.x, portal.y, portal.radius
      )
      coreGradient.addColorStop(0, '#ffffff')
      coreGradient.addColorStop(0.6, portal.color)
      coreGradient.addColorStop(1, `${portal.color}00`)

      ctx.fillStyle = coreGradient
      ctx.beginPath()
      ctx.arc(portal.x, portal.y, portal.radius, 0, Math.PI * 2)
      ctx.fill()

      // Anel pulsante
      if (portal.pulse) {
        ctx.strokeStyle = `${portal.color}${Math.floor(portal.pulse * 255).toString(16).padStart(2, '0')}`
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(portal.x, portal.y, portal.radius * (1 + portal.pulse * 0.5), 0, Math.PI * 2)
        ctx.stroke()
      }
    })
  }

  /**
   * Renderizar ondas de energia
   */
  const renderEnergyWaves = (ctx, waves) => {
    waves.forEach(wave => {
      ctx.strokeStyle = `${wave.color}${Math.floor((1 - wave.progress) * 100).toString(16).padStart(2, '0')}`
      ctx.lineWidth = 2 * (1 - wave.progress)
      ctx.beginPath()
      ctx.arc(wave.x, wave.y, wave.radius * wave.progress, 0, Math.PI * 2)
      ctx.stroke()
    })
  }

  /**
   * Renderizar nanobots com trails
   * PERFORMANCE: Batch rendering, evitar state changes
   */
  const renderNanobots = (ctx, nanobots) => {
    // Agrupar por cor para batch rendering
    const byColor = {}
    nanobots.forEach(bot => {
      if (!byColor[bot.color]) byColor[bot.color] = []
      byColor[bot.color].push(bot)
    })

    Object.entries(byColor).forEach(([color, bots]) => {
      bots.forEach(bot => {
        // Trail (motion blur)
        if (bot.trail && bot.trail.length > 0) {
          ctx.strokeStyle = color
          ctx.lineWidth = bot.size * 0.5
          ctx.globalAlpha = bot.opacity * 0.3
          ctx.lineCap = 'round'

          ctx.beginPath()
          ctx.moveTo(bot.trail[0].x, bot.trail[0].y)
          bot.trail.forEach((point, i) => {
            ctx.lineTo(point.x, point.y)
            ctx.globalAlpha = bot.opacity * 0.3 * (1 - i / bot.trail.length)
          })
          ctx.stroke()
        }

        // Partícula principal
        ctx.globalAlpha = bot.opacity

        // Glow
        const gradient = ctx.createRadialGradient(
          bot.x, bot.y, 0,
          bot.x, bot.y, bot.size * 2
        )
        gradient.addColorStop(0, '#ffffff')
        gradient.addColorStop(0.4, color)
        gradient.addColorStop(1, `${color}00`)

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(bot.x, bot.y, bot.size * 2, 0, Math.PI * 2)
        ctx.fill()

        // Core
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(bot.x, bot.y, bot.size * 0.5, 0, Math.PI * 2)
        ctx.fill()
      })
    })

    ctx.globalAlpha = 1
  }

  /**
   * Renderizar faíscas de solda
   * PSICOLOGIA: Micro-feedback visual = recompensa
   */
  const renderSparks = (ctx, sparks) => {
    sparks.forEach(spark => {
      ctx.globalAlpha = spark.opacity

      const gradient = ctx.createRadialGradient(
        spark.x, spark.y, 0,
        spark.x, spark.y, spark.size * 2
      )
      gradient.addColorStop(0, '#ffffff')
      gradient.addColorStop(0.5, spark.color)
      gradient.addColorStop(1, `${spark.color}00`)

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(spark.x, spark.y, spark.size * 2, 0, Math.PI * 2)
      ctx.fill()
    })

    ctx.globalAlpha = 1
  }

  /**
   * Flash branco (finalização dramática)
   */
  const flash = () => {
    const ctx = ctxRef.current
    if (!ctx) return

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.fillRect(0, 0, width, height)

    setTimeout(() => {
      ctx.clearRect(0, 0, width, height)
    }, 100)
  }

  /**
   * Shake effect
   */
  const shake = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const originalTransform = canvas.style.transform
    const intensity = 5

    const shakeFrames = [
      `translate(${intensity}px, ${intensity}px)`,
      `translate(-${intensity}px, -${intensity}px)`,
      `translate(${intensity}px, -${intensity}px)`,
      `translate(-${intensity}px, ${intensity}px)`,
      originalTransform
    ]

    let frame = 0
    const shakeInterval = setInterval(() => {
      canvas.style.transform = shakeFrames[frame]
      frame++
      if (frame >= shakeFrames.length) {
        clearInterval(shakeInterval)
      }
    }, 50)
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{
        mixBlendMode: 'screen',
        imageRendering: 'crisp-edges'
      }}
    />
  )
})

NanobotCanvas.displayName = 'NanobotCanvas'

export default NanobotCanvas

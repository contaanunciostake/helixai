/**
 * ════════════════════════════════════════════════════════════════
 * COMPONENTE: NanobotAnimation
 * Animação completa de construção por nanobots
 *
 * EXPERIÊNCIA PSICOLÓGICA:
 * - Anticipação → Invasão → Construção → Finalização → Idle
 * - Gatilhos de dopamina em cada fase
 * - Retenção de atenção através de micro-recompensas visuais
 * - Progress indication para satisfação do usuário
 *
 * USO:
 * <NanobotAnimation
 *   cards={featuresArray}
 *   onComplete={() => console.log('Construção completa!')}
 *   intensity="high" // high | medium | low
 * />
 * ════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import NanobotCanvas from './NanobotCanvas'
import { AnimationOrchestrator } from './AnimationOrchestrator'
import useNanobotPhysics from '../hooks/useNanobotPhysics'

export default function NanobotAnimation({
  cards = [],
  onComplete,
  onPhaseChange,
  intensity = 'high',
  autoStart = false,
  containerWidth = 1200,
  containerHeight = 800
}) {
  // ═══ REFS ═══
  const orchestratorRef = useRef(null)
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const animationFrameRef = useRef(null)
  const observerRef = useRef(null)

  // ═══ PHYSICS HOOK ═══
  const {
    createSwarm,
    updatePhysics,
    assignBuildingPixels,
    generateSparks,
    updateSparks
  } = useNanobotPhysics()

  // ═══ STATE ═══
  const [isVisible, setIsVisible] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [currentPhase, setCurrentPhase] = useState('idle')
  const [progress, setProgress] = useState(0)
  const [nanobots, setNanobots] = useState([])
  const [sparks, setSparks] = useState([])
  const [portals, setPortals] = useState([])
  const [energyWaves, setEnergyWaves] = useState([])
  const [nanobotCount, setNanobotCount] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const [hoveredCardIndex, setHoveredCardIndex] = useState(null)

  // ═══ INITIALIZATION ═══
  useEffect(() => {
    // Criar orquestrador
    const config = {
      nanobotsPerCard: intensity === 'high' ? 150 : intensity === 'medium' ? 100 : 50,
      cardColors: cards.map(card => card.gradient?.split(' ')[1] || '#10B981')
    }

    orchestratorRef.current = new AnimationOrchestrator(config)

    // Registrar callbacks
    orchestratorRef.current
      .on('phase:anticipation', () => handlePhaseChange('anticipation'))
      .on('phase:invasion', () => handlePhaseChange('invasion'))
      .on('phase:construction', () => handlePhaseChange('construction'))
      .on('phase:finalization', () => handlePhaseChange('finalization'))
      .on('phase:idle', () => handlePhaseChange('idle'))
      .on('complete', () => {
        if (onComplete) onComplete()
      })

    // Intersection Observer para auto-start
    if (autoStart && containerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            // Trigger quando 50% da seção está visível
            if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
              setIsVisible(true)
              if (!hasStarted) {
                startAnimation()
              }
            }
          })
        },
        { threshold: [0, 0.5, 1] }
      )

      observerRef.current.observe(containerRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  // ═══ PHASE CHANGE HANDLER ═══
  const handlePhaseChange = useCallback((phase) => {
    setCurrentPhase(phase)
    if (onPhaseChange) onPhaseChange(phase)

    // Executar ações específicas de cada fase
    switch (phase) {
      case 'anticipation':
        startAnticipation()
        break
      case 'invasion':
        startInvasion()
        break
      case 'construction':
        startConstruction()
        break
      case 'finalization':
        startFinalization()
        break
      case 'idle':
        startIdle()
        break
    }
  }, [onPhaseChange])

  // ═══ START ANIMATION ═══
  const startAnimation = useCallback(() => {
    if (hasStarted) return
    setHasStarted(true)

    orchestratorRef.current.start()
    runAnimationLoop()
  }, [hasStarted])

  // ═══ ANIMATION LOOP (60 FPS) ═══
  const runAnimationLoop = useCallback(() => {
    const loop = (currentTime) => {
      const state = orchestratorRef.current.update(currentTime)

      setProgress(state.totalProgress)

      // Atualizar física
      setNanobots(prev => {
        const cardBounds = orchestratorRef.current.calculateCardBounds(
          containerWidth,
          containerHeight,
          0,
          cards.length
        )
        return updatePhysics(prev, 16.67, state.phase, cardBounds) // 16.67ms = 60fps
      })

      // Atualizar faíscas
      setSparks(prev => updateSparks(prev))

      // Atualizar ondas de energia
      setEnergyWaves(prev =>
        prev
          .map(wave => ({
            ...wave,
            progress: wave.progress + 0.02,
            radius: wave.radius + 2
          }))
          .filter(wave => wave.progress < 1)
      )

      animationFrameRef.current = requestAnimationFrame(loop)
    }

    animationFrameRef.current = requestAnimationFrame(loop)
  }, [cards, containerWidth, containerHeight, updatePhysics, updateSparks])

  // ═══ FASE 1: ANTICIPAÇÃO ═══
  const startAnticipation = useCallback(() => {
    // Gerar portais
    const portalPositions = orchestratorRef.current.generatePortalPositions(
      containerWidth,
      containerHeight,
      cards.length
    )

    // Animar pulse dos portais
    let pulseValue = 0
    const pulseInterval = setInterval(() => {
      pulseValue = (pulseValue + 0.1) % 1
      setPortals(prev =>
        prev.map(portal => ({
          ...portal,
          pulse: Math.sin(pulseValue * Math.PI * 2) * 0.5 + 0.5
        }))
      )
    }, 50)

    setPortals(portalPositions)

    // Limpar interval após fase
    setTimeout(() => clearInterval(pulseInterval), 1500)
  }, [cards, containerWidth, containerHeight])

  // ═══ FASE 2: INVASÃO ═══
  const startInvasion = useCallback(() => {
    const newNanobots = []
    const nanobotCount = orchestratorRef.current.getNanobotCount()

    // Criar enxame para cada portal/card
    portals.forEach((portal, cardIndex) => {
      const cardBounds = orchestratorRef.current.calculateCardBounds(
        containerWidth,
        containerHeight,
        cardIndex,
        cards.length
      )

      const swarm = createSwarm(
        { x: portal.x, y: portal.y },
        cardBounds,
        portal.color,
        nanobotCount
      )

      newNanobots.push(...swarm)

      // Criar onda de energia
      setEnergyWaves(prev => [
        ...prev,
        {
          x: cardBounds.centerX,
          y: cardBounds.centerY,
          radius: 10,
          progress: 0,
          color: portal.color
        }
      ])
    })

    setNanobots(newNanobots)
    setNanobotCount(newNanobots.length)
  }, [portals, cards, containerWidth, containerHeight, createSwarm])

  // ═══ FASE 3: CONSTRUÇÃO ═══
  const startConstruction = useCallback(() => {
    // Atribuir pixels para construção
    const interval = setInterval(() => {
      setNanobots(prev => {
        const updated = [...prev]

        cards.forEach((card, cardIndex) => {
          const cardBounds = orchestratorRef.current.calculateCardBounds(
            containerWidth,
            containerHeight,
            cardIndex,
            cards.length
          )

          const constructionMap = orchestratorRef.current.generateConstructionMap(cardBounds)
          const cardNanobots = updated.filter(bot => bot.targetX >= cardBounds.x && bot.targetX <= cardBounds.x + cardBounds.width)

          // Atribuir pixels
          assignBuildingPixels(cardNanobots, cardBounds, {
            getNextPixels: (count) => constructionMap.slice(0, count)
          })

          // Gerar faíscas ocasionalmente
          if (Math.random() < 0.1) {
            const sparkBot = cardNanobots[Math.floor(Math.random() * cardNanobots.length)]
            if (sparkBot && sparkBot.buildingProgress > 0.5) {
              setSparks(prev => [
                ...prev,
                ...generateSparks({ x: sparkBot.x, y: sparkBot.y }, sparkBot.color)
              ])
            }
          }
        })

        return updated
      })
    }, 100)

    // Limpar após 3 segundos
    setTimeout(() => clearInterval(interval), 3000)
  }, [cards, containerWidth, containerHeight, assignBuildingPixels, generateSparks])

  // ═══ FASE 4: FINALIZAÇÃO ═══
  const startFinalization = useCallback(() => {
    // Última volta ao redor dos cards
    setNanobots(prev =>
      prev.map(bot => ({
        ...bot,
        phase: 'dispersing'
      }))
    )

    // Flash dramático
    setTimeout(() => {
      if (canvasRef.current) {
        canvasRef.current.flash()
      }
    }, 800)

    // Breathing effect nos cards (via callback para componente pai)
    setTimeout(() => {
      // Trigger breathing animation
    }, 1000)
  }, [])

  // ═══ FASE 5: IDLE ═══
  const startIdle = useCallback(() => {
    // Limpar nanobots
    setNanobots([])
    setPortals([])
    setEnergyWaves([])

    // Manter 2-3 nanobots por card fazendo patrol
    const idleNanobots = []
    cards.forEach((card, cardIndex) => {
      const cardBounds = orchestratorRef.current.calculateCardBounds(
        containerWidth,
        containerHeight,
        cardIndex,
        cards.length
      )

      for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2
        const radius = 80

        idleNanobots.push({
          id: `idle-${cardIndex}-${i}`,
          x: cardBounds.centerX + Math.cos(angle) * radius,
          y: cardBounds.centerY + Math.sin(angle) * radius,
          vx: Math.cos(angle + Math.PI / 2) * 0.5,
          vy: Math.sin(angle + Math.PI / 2) * 0.5,
          ax: 0,
          ay: 0,
          size: 2,
          color: cards[cardIndex].gradient?.split(' ')[1] || '#10B981',
          opacity: 0.4,
          trail: [],
          trailLength: 3,
          phase: 'idle',
          targetX: cardBounds.centerX,
          targetY: cardBounds.centerY,
          personality: { speed: 0.5, accuracy: 1, errorProne: false },
          buildingProgress: 0,
          assignedPixel: null,
          energy: 100
        })
      }
    })

    setNanobots(idleNanobots)
  }, [cards, containerWidth, containerHeight])

  // ═══ HOVER EFFECTS ═══
  const handleCardHover = useCallback((cardIndex, isEntering) => {
    setIsHovering(isEntering)
    setHoveredCardIndex(isEntering ? cardIndex : null)

    if (isEntering && currentPhase === 'idle') {
      // Mini enxame retorna
      const cardBounds = orchestratorRef.current.calculateCardBounds(
        containerWidth,
        containerHeight,
        cardIndex,
        cards.length
      )

      const hoverSwarm = createSwarm(
        { x: cardBounds.centerX + 100, y: cardBounds.centerY - 100 },
        cardBounds,
        cards[cardIndex].gradient?.split(' ')[1] || '#10B981',
        30
      )

      setNanobots(prev => [...prev, ...hoverSwarm])
    }
  }, [currentPhase, cards, containerWidth, containerHeight, createSwarm])

  // ═══ PUBLIC API ═══
  const start = useCallback(() => {
    startAnimation()
  }, [startAnimation])

  const reset = useCallback(() => {
    orchestratorRef.current.reset()
    setNanobots([])
    setSparks([])
    setPortals([])
    setEnergyWaves([])
    setHasStarted(false)
    setProgress(0)
  }, [])

  // ═══ RENDER ═══
  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      style={{ minHeight: containerHeight }}
    >
      {/* Canvas de Partículas */}
      <NanobotCanvas
        ref={canvasRef}
        width={containerWidth}
        height={containerHeight}
        nanobots={nanobots}
        sparks={sparks}
        portals={portals}
        energyWaves={energyWaves}
        phase={currentPhase}
      />

      {/* Contador de Nanobots (Easter Egg) */}
      <AnimatePresence>
        {currentPhase !== 'idle' && nanobotCount > 0 && (
          <motion.div
            className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg border border-cyan-500/30"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <p className="text-cyan-400 text-sm font-mono">
              <span className="font-bold">{nanobotCount.toLocaleString()}</span> nanobots trabalhando
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar */}
      <AnimatePresence>
        {currentPhase !== 'idle' && currentPhase !== 'anticipation' && (
          <motion.div
            className="absolute top-0 left-0 right-0 h-1 bg-gray-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"
              style={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botão Manual Start (Dev) */}
      {!autoStart && !hasStarted && (
        <motion.button
          onClick={start}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg font-bold text-lg shadow-2xl"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Iniciar Construção por Nanobots
        </motion.button>
      )}
    </div>
  )
}

// Wrapper para cards individuais (detectar hover)
export function NanobotCard({ children, cardIndex, onHover, ...props }) {
  return (
    <div
      onMouseEnter={() => onHover && onHover(cardIndex, true)}
      onMouseLeave={() => onHover && onHover(cardIndex, false)}
      {...props}
    >
      {children}
    </div>
  )
}

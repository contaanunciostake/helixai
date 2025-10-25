/**
 * ════════════════════════════════════════════════════════════════
 * HOOK: useNanobotPhysics
 * Sistema de física para partículas nanobots com comportamento emergente
 *
 * PSICOLOGIA:
 * - Movimento caótico → ordem = satisfação do padrão emergente
 * - Velocidade variável = naturalidade, menos "robotizado"
 * - Erros ocasionais = humanização, autenticidade
 * ════════════════════════════════════════════════════════════════
 */

import { useRef, useCallback } from 'react'

export default function useNanobotPhysics() {
  const nanobotsRef = useRef([])

  /**
   * Criar enxame de nanobots a partir de um portal
   * @param {Object} portal - Posição do portal {x, y}
   * @param {Object} target - Posição alvo {x, y, width, height}
   * @param {string} color - Cor do card destino
   * @param {number} count - Quantidade de nanobots
   */
  const createSwarm = useCallback((portal, target, color, count = 150) => {
    const nanobots = []

    for (let i = 0; i < count; i++) {
      // Posição inicial com spread ao redor do portal
      const angle = Math.random() * Math.PI * 2
      const distance = Math.random() * 30

      nanobots.push({
        id: `${Date.now()}-${i}`,
        // Posição
        x: portal.x + Math.cos(angle) * distance,
        y: portal.y + Math.sin(angle) * distance,
        // Velocidade (caótica inicial)
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        // Aceleração
        ax: 0,
        ay: 0,
        // Propriedades visuais
        size: Math.random() * 2 + 2, // 2-4px
        color: color,
        opacity: 1,
        // Trail (motion blur)
        trail: [],
        trailLength: 5,
        // Comportamento
        phase: 'swarming', // swarming, building, dispersing
        targetX: target.x + Math.random() * target.width,
        targetY: target.y + Math.random() * target.height,
        // Personalidade (cada nanobot é único)
        personality: {
          speed: 0.5 + Math.random() * 1.5, // 0.5-2.0x
          accuracy: 0.7 + Math.random() * 0.3, // 70-100%
          errorProne: Math.random() < 0.15, // 15% erram ocasionalmente
        },
        // Estado
        buildingProgress: 0,
        assignedPixel: null, // Pixel que está construindo
        energy: 100, // Energia para animações
      })
    }

    return nanobots
  }, [])

  /**
   * Atualizar física de todos os nanobots
   * PSICOLOGIA: Movimento fluido = profissionalismo, confiança
   */
  const updatePhysics = useCallback((nanobots, deltaTime, phase, cardBounds) => {
    return nanobots.map(bot => {
      const updated = { ...bot }

      // === FASE 1: SWARMING (Agrupamento) ===
      if (phase === 'swarming') {
        // Força em direção ao alvo (flocking behavior)
        const dx = bot.targetX - bot.x
        const dy = bot.targetY - bot.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance > 5) {
          // Steering force (Craig Reynolds' Boids)
          const desiredVx = (dx / distance) * bot.personality.speed * 3
          const desiredVy = (dy / distance) * bot.personality.speed * 3

          updated.ax = (desiredVx - bot.vx) * 0.1
          updated.ay = (desiredVy - bot.vy) * 0.1

          // Adicionar turbulência (movimento natural)
          updated.ax += (Math.random() - 0.5) * 0.5
          updated.ay += (Math.random() - 0.5) * 0.5
        } else {
          // Chegou perto do alvo, começar a orbitar
          const angle = Math.atan2(dy, dx) + Math.PI / 2
          updated.ax = Math.cos(angle) * 2
          updated.ay = Math.sin(angle) * 2
          updated.phase = 'building'
        }
      }

      // === FASE 2: BUILDING (Construção) ===
      if (phase === 'building') {
        // Nanobots constroem em posições específicas
        if (bot.assignedPixel) {
          const dx = bot.assignedPixel.x - bot.x
          const dy = bot.assignedPixel.y - bot.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance > 2) {
            // Mover para pixel designado
            updated.vx = dx * 0.2
            updated.vy = dy * 0.2
          } else {
            // Chegou! "Soldar" o pixel
            updated.buildingProgress += 0.02

            // Vibração de solda
            updated.x += (Math.random() - 0.5) * 0.5
            updated.y += (Math.random() - 0.5) * 0.5

            if (updated.buildingProgress >= 1) {
              // Procurar novo pixel
              updated.assignedPixel = null
              updated.buildingProgress = 0
            }
          }
        } else {
          // Sem pixel designado, orbitar o card
          const centerX = cardBounds.x + cardBounds.width / 2
          const centerY = cardBounds.y + cardBounds.height / 2
          const angle = Math.atan2(bot.y - centerY, bot.x - centerX)
          const orbitRadius = 100

          updated.targetX = centerX + Math.cos(angle) * orbitRadius
          updated.targetY = centerY + Math.sin(angle) * orbitRadius
        }

        // ERRO OCASIONAL (humanização)
        if (bot.personality.errorProne && Math.random() < 0.01) {
          updated.vx += (Math.random() - 0.5) * 4
          updated.vy += (Math.random() - 0.5) * 4
        }
      }

      // === FASE 3: DISPERSING (Dispersão) ===
      if (phase === 'dispersing') {
        // Acelerar para fora do card
        const centerX = cardBounds.x + cardBounds.width / 2
        const centerY = cardBounds.y + cardBounds.height / 2
        const angle = Math.atan2(bot.y - centerY, bot.x - centerX)

        updated.ax = Math.cos(angle) * 5
        updated.ay = Math.sin(angle) * 5
        updated.opacity -= 0.02
        updated.energy -= 2
      }

      // Atualizar velocidade
      updated.vx += updated.ax
      updated.vy += updated.ay

      // Limite de velocidade (evitar explosão)
      const maxSpeed = 8
      const speed = Math.sqrt(updated.vx * updated.vx + updated.vy * updated.vy)
      if (speed > maxSpeed) {
        updated.vx = (updated.vx / speed) * maxSpeed
        updated.vy = (updated.vy / speed) * maxSpeed
      }

      // Damping (atrito)
      updated.vx *= 0.98
      updated.vy *= 0.98

      // Atualizar posição
      updated.x += updated.vx
      updated.y += updated.vy

      // Atualizar trail (motion blur)
      updated.trail = [
        { x: bot.x, y: bot.y, opacity: bot.opacity },
        ...bot.trail.slice(0, bot.trailLength - 1)
      ]

      return updated
    })
  }, [])

  /**
   * Atribuir pixels de construção para nanobots disponíveis
   */
  const assignBuildingPixels = useCallback((nanobots, cardBounds, constructionMap) => {
    const available = nanobots.filter(bot => !bot.assignedPixel && bot.phase === 'building')
    const pixels = constructionMap.getNextPixels(available.length)

    available.forEach((bot, i) => {
      if (pixels[i]) {
        bot.assignedPixel = {
          x: cardBounds.x + pixels[i].x,
          y: cardBounds.y + pixels[i].y,
          type: pixels[i].type // 'border', 'icon', 'background', 'text'
        }
      }
    })

    return nanobots
  }, [])

  /**
   * Gerar faíscas quando nanobots "soldam" pixels
   * PSICOLOGIA: Micro-recompensas visuais = dopamina
   */
  const generateSparks = useCallback((position, color) => {
    const sparks = []
    const count = 3 + Math.floor(Math.random() * 5) // 3-8 faíscas

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 2 + Math.random() * 3

      sparks.push({
        x: position.x,
        y: position.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1 + Math.random() * 2,
        color: color,
        opacity: 1,
        life: 20 + Math.random() * 20, // frames
        gravity: 0.1
      })
    }

    return sparks
  }, [])

  /**
   * Atualizar faíscas
   */
  const updateSparks = useCallback((sparks) => {
    return sparks
      .map(spark => ({
        ...spark,
        x: spark.x + spark.vx,
        y: spark.y + spark.vy,
        vy: spark.vy + spark.gravity,
        opacity: spark.opacity - (1 / spark.life),
        life: spark.life - 1
      }))
      .filter(spark => spark.life > 0 && spark.opacity > 0)
  }, [])

  return {
    createSwarm,
    updatePhysics,
    assignBuildingPixels,
    generateSparks,
    updateSparks,
    nanobotsRef
  }
}

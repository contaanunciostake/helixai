/**
 * ═══════════════════════════════════════════════════════════════
 * ANIMATIONORCHESTRATOR
 * Orquestrador de fases da animação de nanobots
 *
 * FASES:
 * 1. ANTICIPATION (0-1.5s) - Portais aparecem, usuário antecipa
 * 2. INVASION (1.5-3s) - Nanobots explodem dos portais
 * 3. CONSTRUCTION (3-6s) - Construção frenética dos cards
 * 4. FINALIZATION (6-7.5s) - Última volta e dispersão
 * 5. IDLE (7.5s+) - Estado final com hover interativo
 *
 * PSICOLOGIA IMPLEMENTADA:
 * - Efeito Zeigarnik: Animação progressiva gera curiosidade
 * - Dopamina: Recompensa visual ao completar construção
 * - Flow State: Timing preciso mantém atenção
 * - Progress Indication: Ver progresso = satisfação
 * ═══════════════════════════════════════════════════════════════
 */

export class AnimationOrchestrator {
  constructor(config = {}) {
    this.config = {
      // Cores dos cards (RGB hexadecimal)
      cardColors: [
        '#10B981', // Verde menta - Equipe Completa
        '#F59E0B', // Laranja - Nunca Perde Lead
        '#EC4899', // Rosa - Mais Inteligente
        '#3B82F6', // Azul - Converte Mais
        '#8B5CF6', // Roxo - Atende Todos Canais
        '#EF4444'  // Vermelho/Rosa - Zero Processos
      ],
      // Timing das fases (ms)
      phaseDurations: {
        anticipation: 1500,
        invasion: 1500,
        construction: 3000,
        finalization: 1500
      },
      // Quantidade de nanobots
      nanobotsPerCard: 150,
      reducedNanobots: 75, // Mobile
      // Performance
      targetFPS: 60,
      maxParticles: 1500,
      ...config
    }

    this.currentPhase = 'idle'
    this.phaseStartTime = 0
    this.totalElapsedTime = 0
    this.callbacks = {}
  }

  /**
   * Iniciar sequência de animação
   */
  start() {
    this.currentPhase = 'anticipation'
    this.phaseStartTime = performance.now()
    this.totalElapsedTime = 0

    this.trigger('start')
    this.trigger('phase:anticipation')

    return this
  }

  /**
   * Atualizar estado da animação
   * Chama-se a cada frame (60fps)
   */
  update(currentTime) {
    const elapsed = currentTime - this.phaseStartTime
    this.totalElapsedTime = currentTime - this.phaseStartTime

    // Verificar transição de fase
    const phaseDuration = this.config.phaseDurations[this.currentPhase]

    if (elapsed >= phaseDuration) {
      this.advancePhase()
    }

    // Retornar estado atual
    return {
      phase: this.currentPhase,
      phaseProgress: Math.min(elapsed / phaseDuration, 1),
      totalProgress: this.getTotalProgress(),
      phaseElapsed: elapsed,
      totalElapsed: this.totalElapsedTime
    }
  }

  /**
   * Avançar para próxima fase
   */
  advancePhase() {
    const phases = ['anticipation', 'invasion', 'construction', 'finalization', 'idle']
    const currentIndex = phases.indexOf(this.currentPhase)

    if (currentIndex < phases.length - 1) {
      const nextPhase = phases[currentIndex + 1]
      this.currentPhase = nextPhase
      this.phaseStartTime = performance.now()

      this.trigger(`phase:${nextPhase}`)

      // Callbacks especiais
      if (nextPhase === 'finalization') {
        this.trigger('nearCompletion')
      }
      if (nextPhase === 'idle') {
        this.trigger('complete')
      }
    }
  }

  /**
   * Calcular progresso total (0-1)
   * PSICOLOGIA: Progress bar = dopamina ao ver completar
   */
  getTotalProgress() {
    const totalDuration = Object.values(this.config.phaseDurations).reduce((a, b) => a + b, 0)
    return Math.min(this.totalElapsedTime / totalDuration, 1)
  }

  /**
   * Gerar posições dos portais nas bordas da tela
   */
  generatePortalPositions(width, height, count = 6) {
    const portals = []
    const margin = 50

    // Distribuir portais ao redor da tela
    const positions = [
      { x: margin, y: height * 0.2 },           // Esquerda superior
      { x: margin, y: height * 0.8 },           // Esquerda inferior
      { x: width - margin, y: height * 0.2 },   // Direita superior
      { x: width - margin, y: height * 0.8 },   // Direita inferior
      { x: width * 0.3, y: margin },            // Superior esquerda
      { x: width * 0.7, y: margin }             // Superior direita
    ]

    positions.slice(0, count).forEach((pos, i) => {
      portals.push({
        id: i,
        x: pos.x,
        y: pos.y,
        radius: 15,
        color: this.config.cardColors[i],
        pulse: 0,
        cardIndex: i
      })
    })

    return portals
  }

  /**
   * Calcular bounds dos cards baseado em grid layout
   */
  calculateCardBounds(containerWidth, containerHeight, index, totalCards = 6) {
    // Grid responsivo
    const cols = containerWidth > 1024 ? 3 : (containerWidth > 768 ? 2 : 1)
    const rows = Math.ceil(totalCards / cols)

    const col = index % cols
    const row = Math.floor(index / cols)

    const cardWidth = containerWidth / cols - 32 // gap
    const cardHeight = 200 // altura aproximada

    return {
      x: col * (cardWidth + 32) + 16,
      y: row * (cardHeight + 32) + 16,
      width: cardWidth,
      height: cardHeight,
      centerX: col * (cardWidth + 32) + 16 + cardWidth / 2,
      centerY: row * (cardHeight + 32) + 16 + cardHeight / 2
    }
  }

  /**
   * Gerar mapa de construção (pixels a serem construídos)
   * Ordem: Border → Icon → Background → Text
   */
  generateConstructionMap(cardBounds) {
    const pixels = []

    // 1. BORDER (prioridade máxima)
    // Top border
    for (let x = 0; x < cardBounds.width; x += 4) {
      pixels.push({ x, y: 0, type: 'border', priority: 1 })
    }
    // Bottom border
    for (let x = 0; x < cardBounds.width; x += 4) {
      pixels.push({ x, y: cardBounds.height, type: 'border', priority: 1 })
    }
    // Left border
    for (let y = 0; y < cardBounds.height; y += 4) {
      pixels.push({ x: 0, y, type: 'border', priority: 1 })
    }
    // Right border
    for (let y = 0; y < cardBounds.height; y += 4) {
      pixels.push({ x: cardBounds.width, y, type: 'border', priority: 1 })
    }

    // 2. ÍCONE (centro)
    const iconCenterX = 56 / 2 + 24 // w-14 h-14 = 56px, padding 24px
    const iconCenterY = 56 / 2 + 24

    for (let angle = 0; angle < Math.PI * 2; angle += 0.2) {
      for (let radius = 0; radius < 28; radius += 3) {
        pixels.push({
          x: iconCenterX + Math.cos(angle) * radius,
          y: iconCenterY + Math.sin(angle) * radius,
          type: 'icon',
          priority: 2
        })
      }
    }

    // 3. BACKGROUND (gradiente de dentro pra fora)
    for (let y = 30; y < cardBounds.height - 30; y += 6) {
      for (let x = 30; x < cardBounds.width - 30; x += 6) {
        const distanceFromCenter = Math.sqrt(
          Math.pow(x - cardBounds.width / 2, 2) +
          Math.pow(y - cardBounds.height / 2, 2)
        )
        pixels.push({ x, y, type: 'background', priority: 3 + distanceFromCenter / 100 })
      }
    }

    // 4. TEXT (última coisa)
    for (let y = 100; y < cardBounds.height - 40; y += 8) {
      for (let x = 24; x < cardBounds.width - 24; x += 5) {
        pixels.push({ x, y, type: 'text', priority: 4 })
      }
    }

    // Ordenar por prioridade
    return pixels.sort((a, b) => a.priority - b.priority)
  }

  /**
   * Registrar callback para evento
   */
  on(event, callback) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = []
    }
    this.callbacks[event].push(callback)
    return this
  }

  /**
   * Disparar evento
   */
  trigger(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(cb => cb(data))
    }
  }

  /**
   * Resetar animação
   */
  reset() {
    this.currentPhase = 'idle'
    this.phaseStartTime = 0
    this.totalElapsedTime = 0
    this.trigger('reset')
  }

  /**
   * Detectar se deve usar versão reduzida (mobile)
   */
  shouldUseReducedAnimation() {
    return window.innerWidth < 768 ||
           !window.requestAnimationFrame ||
           navigator.hardwareConcurrency < 4
  }

  /**
   * Obter quantidade de nanobots baseado em performance
   */
  getNanobotCount() {
    return this.shouldUseReducedAnimation()
      ? this.config.reducedNanobots
      : this.config.nanobotsPerCard
  }
}

export default AnimationOrchestrator

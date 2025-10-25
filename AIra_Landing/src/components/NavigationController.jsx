/**
 * ════════════════════════════════════════════════════════════════
 * COMPONENTE: NavigationController
 * Controla navegação programática entre dobras com sistema de níveis
 * ════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react'
import LevelUnlock from './LevelUnlock'

export default function NavigationController({
  currentLevel,
  onLevelChange,
  children
}) {
  const [showUnlock, setShowUnlock] = useState(false)
  const [nextLevel, setNextLevel] = useState(null)
  const [backgroundSound, setBackgroundSound] = useState(null)

  // Frases motivacionais para cada nível
  const levelPhrases = {
    1: "🧠 Missão: Conhecer a Consciência Artificial mais avançada do Brasil!",
    2: "💬 Veja AIra conversando e vendendo em tempo real!",
    3: "⚡ Descubra como ativar em 3 passos simples!",
    4: "💎 Chegou a hora de ECONOMIZAR milhares por mês!",
    5: "✨ Powered by Helix AI | O futuro das vendas está aqui!"
  }

  // Sons ambiente para cada nível (URLs da internet)
  const levelSounds = {
    1: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3', // Futuristic
    2: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3', // Chat/Conversa
    3: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3', // Tech/How it works
    4: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3', // Cash register
    5: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'  // Soft finale
  }

  // Tocar som ambiente quando level muda
  useEffect(() => {
    if (currentLevel && levelSounds[currentLevel]) {
      // Parar som anterior
      if (backgroundSound) {
        backgroundSound.pause()
        backgroundSound.currentTime = 0
      }

      // Tocar novo som
      const sound = new Audio(levelSounds[currentLevel])
      sound.volume = 0.2
      sound.play().catch(err => console.log('Erro ao tocar som:', err))
      setBackgroundSound(sound)
    }

    return () => {
      if (backgroundSound) {
        backgroundSound.pause()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLevel])

  // Função para navegar para próximo nível
  const navigateToLevel = (level) => {
    setNextLevel(level)
    setShowUnlock(true)
  }

  // Completar transição de nível
  const handleUnlockComplete = () => {
    setShowUnlock(false)
    if (nextLevel) {
      onLevelChange(nextLevel)

      // Scroll para seção correspondente
      const sectionIds = {
        1: 'hero',
        2: 'aira-showcase',
        3: 'how-it-works',
        4: 'pricing',
        5: 'footer'
      }

      const sectionId = sectionIds[nextLevel]
      const section = document.getElementById(sectionId)

      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  // Expor função de navegação globalmente
  useEffect(() => {
    window.navigateToLevel = navigateToLevel
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      {children}

      <LevelUnlock
        level={nextLevel}
        show={showUnlock}
        onComplete={handleUnlockComplete}
        motivationalPhrase={levelPhrases[nextLevel]}
      />
    </>
  )
}

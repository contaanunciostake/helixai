/**
 * ════════════════════════════════════════════════════════════════
 * COMPONENTE: AmbientSound
 * Toca sons ambiente para cada seção da landing page
 * ════════════════════════════════════════════════════════════════
 */

import { useEffect, useRef } from 'react'

export default function AmbientSound({ soundUrl, volume = 0.15, loop = false, play = false }) {
  const audioRef = useRef(null)

  useEffect(() => {
    if (!soundUrl) return

    // Criar elemento de áudio
    const audio = new Audio(soundUrl)
    audio.volume = volume
    audio.loop = loop
    audioRef.current = audio

    // Tocar se play estiver true
    if (play) {
      audio.play().catch(err => console.log('Erro ao tocar som ambiente:', err))
    }

    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
    }
  }, [soundUrl, volume, loop])

  // Controlar play/pause
  useEffect(() => {
    if (!audioRef.current) return

    if (play) {
      audioRef.current.play().catch(err => console.log('Erro ao tocar:', err))
    } else {
      audioRef.current.pause()
    }
  }, [play])

  return null // Componente invisível
}

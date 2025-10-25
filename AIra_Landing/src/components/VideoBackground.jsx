/**
 * ════════════════════════════════════════════════════════════════
 * COMPONENTE: VideoBackground
 * Vídeo de fundo otimizado com overlay configurável
 * ════════════════════════════════════════════════════════════════
 */

import { useEffect, useRef, useState } from 'react'

export default function VideoBackground({
  videoUrl,
  overlay = 'gradient',
  overlayOpacity = 0.7,
  blur = 0,
  className = ''
}) {
  const videoRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleCanPlay = () => {
      setIsLoaded(true)
      video.play().catch(() => {
        // Autoplay pode falhar em alguns navegadores
      })
    }

    const handleError = () => {
      setHasError(true)
    }

    const handleLoadStart = () => {
      // Vídeo iniciando carregamento
    }

    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('error', handleError)
    video.addEventListener('loadstart', handleLoadStart)

    return () => {
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('error', handleError)
      video.removeEventListener('loadstart', handleLoadStart)
    }
  }, [])

  // Definir overlay style
  const getOverlayStyle = () => {
    switch (overlay) {
      case 'dark':
        return {
          background: `rgba(0, 0, 0, ${overlayOpacity})`
        }
      case 'gradient':
        return {
          background: `linear-gradient(to bottom, rgba(0, 0, 0, ${overlayOpacity * 0.8}) 0%, rgba(0, 0, 0, ${overlayOpacity}) 50%, rgba(0, 0, 0, ${overlayOpacity * 0.8}) 100%)`
        }
      case 'none':
        return {}
      default:
        return {
          background: `rgba(0, 0, 0, ${overlayOpacity})`
        }
    }
  }

  return (
    <div className={`absolute inset-0 overflow-hidden`}>
      {/* Vídeo de fundo */}
      {!hasError && (
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover ${className}`}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          src={videoUrl}
          style={{
            filter: blur > 0 ? `blur(${blur}px)` : 'none',
            opacity: isLoaded ? 1 : 0.3,
            transition: 'opacity 1s ease-in-out',
            zIndex: 0
          }}
        />
      )}

      {/* Mensagem de erro (debug) */}
      {hasError && (
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          <p className="text-red-400 text-sm">
            Erro ao carregar vídeo. Verifique o console.
          </p>
        </div>
      )}

      {/* Overlay para legibilidade */}
      {overlay !== 'none' && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            ...getOverlayStyle(),
            zIndex: 1
          }}
        />
      )}

      {/* Efeito de brilho nas bordas (vignette) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.3) 100%)',
          zIndex: 1
        }}
      />
    </div>
  )
}


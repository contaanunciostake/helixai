/**
 * ════════════════════════════════════════════════════════════════
 * COMPONENTE: Stars
 * Estrelas piscantes idênticas ao checkout.html
 * ════════════════════════════════════════════════════════════════
 */

import { useEffect, useState } from 'react'

export default function Stars() {
  const [stars, setStars] = useState([])

  useEffect(() => {
    // Criar 100 estrelas com posições e delays aleatórios
    const newStars = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      left: Math.random() * 100 + '%',
      top: Math.random() * 100 + '%',
      animationDelay: Math.random() * 3 + 's'
    }))
    setStars(newStars)
  }, [])

  return (
    <div
      className="stars"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none'
      }}
    >
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            position: 'absolute',
            width: '2px',
            height: '2px',
            background: 'white',
            borderRadius: '50%',
            left: star.left,
            top: star.top,
            animation: 'twinkle 3s ease-in-out infinite',
            animationDelay: star.animationDelay
          }}
        />
      ))}
      <style>{`
        @keyframes twinkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.5);
          }
        }
      `}</style>
    </div>
  )
}

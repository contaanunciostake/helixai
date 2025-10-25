/**
 * ════════════════════════════════════════════════════════════════
 * COMPONENTE: CheckoutBackground
 * Todos os elementos de background do checkout.html em React
 * ════════════════════════════════════════════════════════════════
 */

import CheckoutNeuralNetwork from './CheckoutNeuralNetwork'
import Stars from './Stars'

export default function CheckoutBackground() {
  return (
    <>
      {/* Neural Network Background Canvas */}
      <CheckoutNeuralNetwork />

      {/* Background overlays */}
      <div
        className="bg-overlay"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          background: 'radial-gradient(ellipse at top, transparent 0%, rgba(0, 0, 0, 0.7) 70%)',
          pointerEvents: 'none'
        }}
      />

      {/* Stars */}
      <Stars />

      {/* Grid pattern */}
      <div
        className="grid-pattern"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          backgroundImage: `
            linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '4rem 4rem',
          maskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, #000 70%, transparent 110%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, #000 70%, transparent 110%)',
          pointerEvents: 'none'
        }}
      />
    </>
  )
}

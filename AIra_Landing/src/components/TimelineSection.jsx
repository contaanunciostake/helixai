/**
 * ════════════════════════════════════════════════════════════════
 * COMPONENTE: TimelineSection
 * Timeline vertical interativa com 3 passos e animações laterais
 * ════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Smartphone, Bot, TrendingUp, Sparkles } from 'lucide-react'
import RobotFaceAnimation from './animations/RobotFaceAnimation'
import ConnectAnimation from './animations/ConnectAnimation'
import LearnAnimation from './animations/LearnAnimation'
import AutoPilotAnimation from './animations/AutoPilotAnimation'
import VideoBackground from './VideoBackground'
import ScrollCTA from './ScrollCTA'
import AmbientSound from './AmbientSound'

export default function TimelineSection({
  autoPlay = true,
  autoPlayDelay = 5000
}) {
  const [activeStep, setActiveStep] = useState(0)
  const [hasCompletedCycle, setHasCompletedCycle] = useState(false)

  // Auto-play sequencial
  useEffect(() => {
    if (!autoPlay) return

    const interval = setInterval(() => {
      setActiveStep((prev) => {
        const nextStep = (prev + 1) % 4

        // Se voltou para 0, significa que completou um ciclo
        if (nextStep === 0 && prev === 3) {
          setHasCompletedCycle(true)
        }

        return nextStep
      })
    }, autoPlayDelay)

    return () => clearInterval(interval)
  }, [autoPlay, autoPlayDelay])

  // Ciclo completado (sem auto-scroll)
  useEffect(() => {
    // Lógica futura se necessário
  }, [hasCompletedCycle])

  const steps = [
    {
      number: '01',
      badge: '✨ Melhor Vendedora',
      title: 'Você Está a Um Passo de Ter a Melhor Vendedora do Brasil',
      description: 'Conheça AIra: a vendedora que nunca dorme, nunca erra e converte 300% mais que humanos.',
      icon: Sparkles,
      color: 'from-cyan-500 to-green-500',
      animation: RobotFaceAnimation
    },
    {
      number: '02',
      badge: '✓ Economize tempo',
      title: 'Conecte em 5 Minutos',
      description: 'WhatsApp conectado em segundos. Só escanear o QR code e pronto - sua vendedora IA está online!',
      icon: Smartphone,
      color: 'from-green-500 to-emerald-500',
      animation: ConnectAnimation
    },
    {
      number: '03',
      badge: '✓ Zero treinamento',
      title: 'IA Aprende Seu Negócio',
      description: 'Upload do catálogo, treinamento automático. A IA aprende tudo sobre seus produtos em minutos.',
      icon: Bot,
      color: 'from-emerald-500 to-green-600',
      animation: LearnAnimation
    },
    {
      number: '04',
      badge: '✓ +300% conversão',
      title: 'Venda no Piloto Automático',
      description: 'Atende, qualifica, agenda, vende. 24/7/365. Você só fecha os negócios que a IA trouxe prontos.',
      icon: TrendingUp,
      color: 'from-green-600 to-emerald-600',
      animation: AutoPilotAnimation
    }
  ]

  return (
    <section id="how-it-works" className="min-h-screen flex items-center py-20 px-4 relative overflow-hidden pt-48 md:pt-20 pb-48 md:pb-20">
      {/* Som Ambiente - Tech/Digital */}
      <AmbientSound
        soundUrl="https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3"
        volume={0.1}
        loop={true}
        play={false}
      />

      {/* Vídeo de Fundo */}
      <VideoBackground
        videoUrl="/6973-197914400.mp4"
        overlay="gradient"
        overlayOpacity={0.65}
        blur={1}
      />

      {/* Overlay Verde Animado sobre o vídeo */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 2 }}
        animate={{
          background: [
            'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, transparent 50%, rgba(5, 150, 105, 0.3) 100%)',
            'linear-gradient(225deg, rgba(5, 150, 105, 0.3) 0%, transparent 50%, rgba(16, 185, 129, 0.2) 100%)',
            'linear-gradient(315deg, rgba(16, 185, 129, 0.25) 0%, transparent 50%, rgba(5, 150, 105, 0.25) 100%)',
            'linear-gradient(45deg, rgba(5, 150, 105, 0.3) 0%, transparent 50%, rgba(16, 185, 129, 0.2) 100%)',
            'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, transparent 50%, rgba(5, 150, 105, 0.3) 100%)'
          ]
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      {/* Overlay escuro para contraste */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80 pointer-events-none" style={{ zIndex: 3 }} />

      <div className="max-w-7xl mx-auto relative" style={{ zIndex: 10 }}>
        {/* Header */}
        <div className="text-center mb-8 md:mb-16 mt-28 md:mt-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent">
                Mais Simples que Contratar um Estagiário
              </span>
            </h2>
            <p className="text-xl text-gray-400 mb-3">
              4 passos para ter a melhor vendedora do Brasil
            </p>
            <p className="text-2xl font-bold text-green-400">
              💰 Economia média: R$ 8.500/mês vs CLT
            </p>
          </motion.div>
        </div>

        {/* Carrossel Completo */}
        <div className="relative min-h-[420px] md:min-h-[600px]">
          <AnimatePresence mode="wait">
            {steps.map((step, index) => {
              if (index !== activeStep) return null

              return (
                <motion.div
                  key={index}
                  className="flex flex-col lg:grid lg:grid-cols-[55%_45%] gap-4 lg:gap-8 items-center"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{
                    duration: 0.7,
                    ease: [0.25, 0.1, 0.25, 1.0]
                  }}
                >
                  {/* Animação - Acima do Card no Mobile, Direita no Desktop */}
                  <motion.div
                    className="relative bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl border-2 border-green-500/30 rounded-2xl lg:rounded-3xl p-4 lg:p-8 h-[200px] lg:h-[500px] overflow-hidden w-full lg:order-2"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-transparent rounded-2xl lg:rounded-3xl blur-xl" />

                    {/* Animação Ativa */}
                    <div className="relative h-full">
                      {(() => {
                        const AnimationComponent = step.animation
                        return AnimationComponent ? <AnimationComponent /> : null
                      })()}
                    </div>
                  </motion.div>

                  {/* Card - Abaixo da Animação no Mobile, Esquerda no Desktop */}
                  <div className="w-full lg:order-1">
                    <TimelineCard
                      step={step}
                      index={index}
                      onClick={() => setActiveStep(index)}
                    />
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {/* Indicadores de Navegação */}
          <div className="absolute bottom-4 md:-bottom-12 left-1/2 transform -translate-x-1/2 flex gap-3">
            {steps.map((_, idx) => (
              <motion.button
                key={idx}
                className={`h-3 rounded-full transition-all ${
                  idx === activeStep ? 'w-12 bg-green-500' : 'w-3 bg-green-500/30'
                }`}
                onClick={() => setActiveStep(idx)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>
        </div>

        {/* Scroll CTA para próxima dobra */}
        <motion.div
          className="mt-20 md:mt-16 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <ScrollCTA
            onClick={() => {
              const section = document.getElementById('pricing')
              section?.scrollIntoView({ behavior: 'smooth' })
            }}
            nextLevelText="💎 Desbloquear Consciência: Investimento"
          />
        </motion.div>
      </div>
    </section>
  )
}

// Componente de Card Individual
function TimelineCard({ step, index, onClick }) {
  return (
    <div onClick={onClick} className="relative w-full">
      {/* Card */}
      <motion.div
        className="relative bg-black/40 backdrop-blur-xl border-2 border-green-500 shadow-2xl shadow-green-500/50 p-8 rounded-3xl cursor-pointer"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        {/* Número Grande */}
        <motion.div
          className="text-6xl font-black mb-4 bg-gradient-to-br from-green-400 to-emerald-400 bg-clip-text text-transparent"
          style={{
            textShadow: '0 0 40px rgba(16, 185, 129, 0.6)'
          }}
          animate={{
            textShadow: ['0 0 20px rgba(16, 185, 129, 0.4)', '0 0 40px rgba(16, 185, 129, 0.8)', '0 0 20px rgba(16, 185, 129, 0.4)']
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          {step.number}
        </motion.div>

        {/* Badge */}
        <div className={`inline-block px-4 py-1.5 mb-4 rounded-full text-sm font-bold bg-gradient-to-r ${step.color} bg-opacity-20 border border-green-500/50`}>
          {step.badge}
        </div>

        {/* Título */}
        <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white">
          {step.title}
        </h3>

        {/* Descrição */}
        <p className="text-gray-400 leading-relaxed">
          {step.description}
        </p>

        {/* Ícone */}
        <div className="absolute top-8 right-8 opacity-10">
          {(() => {
            const Icon = step.icon
            return <Icon className="h-20 w-20" />
          })()}
        </div>
      </motion.div>
    </div>
  )
}

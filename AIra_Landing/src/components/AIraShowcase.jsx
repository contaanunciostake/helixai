/**
 * ════════════════════════════════════════════════════════════════
 * COMPONENTE: AIraShowcase
 * Conversa simulada entre AIra e usuário com áudios reais
 * ════════════════════════════════════════════════════════════════
 */

import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, User, Sparkles } from 'lucide-react'
import ScrollCTA from './ScrollCTA'

// Componente de Mensagem de Áudio estilo WhatsApp
function AudioMessage({ duration = "0:15", isPlaying = false, isAira = true, onClick = () => {} }) {
  return (
    <div className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl ${
      isAira
        ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/40'
        : 'bg-gradient-to-br from-gray-700/60 to-gray-800/60 border border-gray-600/40'
    }`}>
      {/* Ícone de Play/Pause */}
      <motion.div
        onClick={onClick}
        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center cursor-pointer ${
          isAira ? 'bg-green-500' : 'bg-gray-600'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
        ) : (
          <Play className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
        )}
      </motion.div>

      {/* Ondas Sonoras Animadas */}
      <div className="flex-1 flex items-center gap-0.5 sm:gap-1 overflow-hidden">
        {[...Array(30)].map((_, i) => {
          const heights = [4, 8, 12, 14, 12, 8, 14, 12, 8, 4, 12, 14, 8, 12, 14, 12, 8, 14, 12, 8, 4, 12, 14, 8, 14, 12, 8, 4, 12, 14]
          return (
            <motion.div
              key={i}
              className={`w-0.5 sm:w-1 rounded-full ${
                isAira ? 'bg-green-400' : 'bg-gray-400'
              }`}
              style={{ height: `${heights[i]}px` }}
              animate={isPlaying ? {
                height: [`${heights[i]}px`, `${heights[i] + 4}px`, `${heights[i]}px`]
              } : {}}
              transition={{
                duration: 0.6,
                repeat: isPlaying ? Infinity : 0,
                delay: i * 0.05,
                ease: 'easeInOut'
              }}
            />
          )
        })}
      </div>

      {/* Duração */}
      <span className={`text-xs sm:text-sm font-medium ${
        isAira ? 'text-green-300' : 'text-gray-300'
      }`}>
        {duration}
      </span>
    </div>
  )
}

export default function AIraShowcase({ startChat = false }) {
  const [messages, setMessages] = useState([])
  const [currentStep, setCurrentStep] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [chatStarted, setChatStarted] = useState(false)
  const [playingAudio, setPlayingAudio] = useState(null)
  const [isManualControl, setIsManualControl] = useState(false) // Rastrear se está em modo manual
  const audioRefs = useRef([])
  const messagesEndRef = useRef(null)
  const sectionRef = useRef(null)

  // Tracking do mouse para efeito parallax invertido
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * -30 // Invertido com negativo
      const y = (e.clientY / window.innerHeight - 0.5) * -30 // Invertido com negativo
      setMousePosition({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Handler para iniciar conversa com interação do usuário
  const handleStartConversation = () => {
    setChatStarted(true)
  }

  // Handler para controlar play/pause do áudio
  const handleAudioClick = (index) => {
    const audio = audioRefs.current[index]
    if (!audio) return

    // Pausar qualquer áudio que esteja tocando (automático ou manual)
    if (playingAudio !== null && playingAudio !== index) {
      const currentAudio = audioRefs.current[playingAudio]
      if (currentAudio) {
        currentAudio.pause()
      }
    }

    // Se o áudio clicado está tocando, pausar
    if (playingAudio === index) {
      audio.pause()
      setPlayingAudio(null)
      // Voltar para modo automático quando pausar manualmente
      setIsManualControl(false)
    } else {
      // Ativar modo manual
      setIsManualControl(true)

      // Tocar o áudio clicado
      audio.currentTime = 0 // Resetar para o início
      audio.play().catch(err => console.log('Erro ao tocar áudio:', err))
      setPlayingAudio(index)

      // Configurar listener para quando o áudio terminar
      audio.onended = () => {
        setPlayingAudio(null)
        // Voltar para modo automático e continuar sequência
        setIsManualControl(false)
        // Se não for o último áudio, continuar a sequência do próximo
        if (index < conversation.length - 1) {
          setTimeout(() => {
            // Se o próximo passo ainda não foi exibido, atualizar currentStep
            if (index >= currentStep) {
              setCurrentStep(index + 1)
            }
          }, 500)
        }
      }
    }
  }

  // Conversa completa com áudios reais - Ordem: AIra, Cliente, AIra, Cliente...
  const conversation = useMemo(() => [
    {
      type: 'aira',
      audioUrl: '/01Aira.mp3',
      duration: '0:10'
    },
    {
      type: 'user',
      audioUrl: '/01Cliente.mp3',
      duration: '0:08'
    },
    {
      type: 'aira',
      audioUrl: '/02Aira.mp3',
      duration: '0:12'
    },
    {
      type: 'user',
      audioUrl: '/02Cliente.mp3',
      duration: '0:07'
    },
    {
      type: 'aira',
      audioUrl: '/03Aira.mp3',
      duration: '0:15'
    },
    {
      type: 'user',
      audioUrl: '/03Cliente.mp3',
      duration: '0:09'
    },
    {
      type: 'aira',
      audioUrl: '/04Aira.mp3',
      duration: '0:14',
      isLast: true // Marca último áudio da AIra
    }
  ], [])

  // Enviar mensagem e tocar áudio - um por vez
  useEffect(() => {
    if (!chatStarted) return
    if (currentStep >= conversation.length) return
    if (isManualControl) return // Pausar sequência automática quando estiver em modo manual

    const message = conversation[currentStep]

    // Delay inicial apenas para a primeira mensagem
    const initialDelay = currentStep === 0 ? 800 : 0

    const timeout = setTimeout(() => {
      // Adicionar mensagem com animação
      setMessages((prev) => [...prev, { ...message, id: currentStep }])

      // Tocar áudio imediatamente após adicionar a mensagem
      setTimeout(() => {
        if (message.audioUrl) {
          const audio = audioRefs.current[currentStep]
          if (audio) {
            setPlayingAudio(currentStep)

            // Resetar o áudio se já foi tocado antes
            audio.currentTime = 0

            audio.play().catch(err => console.log('Erro ao tocar áudio:', err))

            // Quando o áudio terminar
            audio.onended = () => {
              setPlayingAudio(null)

              // Se for o último áudio da AIra, fazer scroll após 1.5s
              if (message.isLast) {
                setTimeout(() => {
                  if (window.navigateToLevel) {
                    window.navigateToLevel(3)
                  }
                }, 1500)
              } else {
                // Aguardar 0.5 segundos e enviar próxima mensagem
                setTimeout(() => {
                  setCurrentStep(prev => prev + 1)
                }, 500)
              }
            }
          }
        }
      }, 100)
    }, initialDelay)

    return () => {
      clearTimeout(timeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, chatStarted, isManualControl])

  return (
    <section ref={sectionRef} id="aira-showcase" className="min-h-screen flex flex-col justify-center py-12 sm:py-16 md:py-24 lg:py-32 px-4 sm:px-6 md:px-8 lg:px-12 relative overflow-visible">
      {/* Background com imagem Luaha2.png - Efeito Parallax Invertido */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/Luaha2.png)',
            scale: 1.2, // Zoom inicial para permitir movimento
          }}
          animate={{
            x: mousePosition.x,
            y: mousePosition.y,
          }}
          transition={{
            type: 'spring',
            stiffness: 50,
            damping: 20,
            mass: 0.5
          }}
        />
        {/* Overlay escuro para contraste */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/75 to-black/90" />
      </div>

      {/* Overlay verde animado */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 2 }}
        animate={{
          background: [
            'radial-gradient(circle at 30% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 60%)',
            'radial-gradient(circle at 70% 50%, rgba(5, 150, 105, 0.2) 0%, transparent 60%)',
            'radial-gradient(circle at 50% 30%, rgba(16, 185, 129, 0.18) 0%, transparent 60%)',
            'radial-gradient(circle at 30% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 60%)'
          ]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      <div className="max-w-5xl mx-auto relative z-10 w-full">
        {/* Header */}
        <motion.div
          className="text-center mb-8 sm:mb-12 md:mb-16 lg:mb-20 px-2 sm:px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 px-2 sm:px-4 py-2"
            animate={{
              textShadow: [
                '0 0 20px rgba(16, 185, 129, 0.5)',
                '0 0 40px rgba(16, 185, 129, 0.8)',
                '0 0 20px rgba(16, 185, 129, 0.5)'
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity
            }}
          >
            <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent inline-block">
              Converse com a AIra
            </span>
          </motion.h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto px-2 sm:px-4">
            Veja como é simples interagir com a inteligência artificial mais avançada do Brasil
          </p>
        </motion.div>

        {/* Chat Container */}
        <motion.div
          className="relative bg-gradient-to-b from-gray-900/80 to-black/80 backdrop-blur-2xl border-2 border-green-500/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 shadow-2xl shadow-green-500/20"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* Chat Header */}
          <div className="flex items-center gap-3 sm:gap-4 pb-4 sm:pb-6 md:pb-8 mb-4 sm:mb-6 md:mb-8 border-b border-green-500/20">
            <motion.div
              className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-green-500"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(16, 185, 129, 0.5)',
                  '0 0 40px rgba(16, 185, 129, 0.8)',
                  '0 0 20px rgba(16, 185, 129, 0.5)'
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity
              }}
            >
              <img
                src="/AiraIcone.png"
                alt="AIra"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect fill="%2310b981" width="64" height="64"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="32" fill="white"%3EAI%3C/text%3E%3C/svg%3E'
                }}
              />
              {/* Indicador online */}
              <div className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-gray-900">
                <motion.div
                  className="absolute inset-0 bg-green-400 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [1, 0, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity
                  }}
                />
              </div>
            </motion.div>
            <div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white flex items-center gap-1.5 sm:gap-2">
                AIra
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
              </h3>
              <p className="text-xs sm:text-sm text-green-400">
                {chatStarted ? 'Online • Digitando...' : 'Online • Aguardando...'}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="space-y-3 sm:space-y-4 max-h-[400px] sm:max-h-[450px] md:max-h-[500px] overflow-y-auto pr-1 sm:pr-2 scrollbar-thin scrollbar-thumb-green-500/30 scrollbar-track-transparent">
            {/* Mensagem inicial quando ainda não iniciou */}
            {!chatStarted && (
              <motion.div
                className="flex flex-col items-center justify-center gap-4 sm:gap-6 py-4 sm:py-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-start gap-2 sm:gap-3 max-w-[90%] sm:max-w-[85%]">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-green-500 flex-shrink-0 shadow-lg shadow-green-500/50">
                    <img
                      src="/AiraIcone.png"
                      alt="AIra"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <motion.div
                      className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-green-500/40 rounded-xl sm:rounded-2xl rounded-tl-sm px-3 sm:px-4 md:px-5 py-2 sm:py-3 shadow-lg"
                      animate={{
                        boxShadow: [
                          '0 0 10px rgba(16, 185, 129, 0.3)',
                          '0 0 20px rgba(16, 185, 129, 0.5)',
                          '0 0 10px rgba(16, 185, 129, 0.3)'
                        ]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity
                      }}
                    >
                      <p className="text-white text-sm sm:text-base leading-relaxed">
                        👋 Olá! Clique no botão abaixo para ouvir uma conversa incrível entre a AIra e um cliente!
                      </p>
                    </motion.div>
                  </div>
                </div>

                {/* Botão para iniciar conversa */}
                <motion.button
                  onClick={handleStartConversation}
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl font-bold text-base sm:text-lg shadow-lg shadow-green-500/50 flex items-center gap-2 sm:gap-3"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(16, 185, 129, 0.5)',
                      '0 0 40px rgba(16, 185, 129, 0.8)',
                      '0 0 20px rgba(16, 185, 129, 0.5)'
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity
                  }}
                >
                  <Play className="h-5 w-5 sm:h-6 sm:w-6" />
                  Iniciar Conversa
                </motion.button>
              </motion.div>
            )}

            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, x: msg.type === 'user' ? 50 : -50, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{
                    duration: 0.5,
                    ease: 'easeIn',
                    type: 'spring',
                    stiffness: 100
                  }}
                >
                  {msg.type === 'aira' ? (
                    // Mensagem de Áudio da AIra
                    <div className="flex items-start gap-2 sm:gap-3 max-w-[90%] sm:max-w-[85%]">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-green-500 flex-shrink-0 shadow-lg shadow-green-500/50">
                        <img
                          src="/AiraIcone.png"
                          alt="AIra"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <motion.div
                        className="rounded-tl-sm"
                        whileHover={{ scale: 1.02 }}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.4, ease: 'easeIn' }}
                      >
                        <AudioMessage
                          duration={msg.duration}
                          isPlaying={playingAudio === msg.id}
                          isAira={true}
                          onClick={() => handleAudioClick(msg.id)}
                        />
                      </motion.div>
                    </div>
                  ) : (
                    // Mensagem de Áudio do Usuário
                    <div className="flex items-start gap-2 sm:gap-3 max-w-[90%] sm:max-w-[85%]">
                      <motion.div
                        className="rounded-tr-sm"
                        whileHover={{ scale: 1.02 }}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.4, ease: 'easeIn' }}
                      >
                        <AudioMessage
                          duration={msg.duration}
                          isPlaying={playingAudio === msg.id}
                          isAira={false}
                          onClick={() => handleAudioClick(msg.id)}
                        />
                      </motion.div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center flex-shrink-0 shadow-lg">
                        <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </motion.div>

        {/* Scroll CTA para próxima dobra */}
        {currentStep >= conversation.length && (
          <motion.div
            className="mt-8 sm:mt-12 md:mt-16 lg:mt-20 mb-4 sm:mb-6 md:mb-8 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
          >
            <ScrollCTA
              onClick={() => {
                const section = document.getElementById('how-it-works')
                section?.scrollIntoView({ behavior: 'smooth' })
              }}
              nextLevelText="⚡ Ativar Consciência: Como Funciona"
            />
          </motion.div>
        )}
      </div>

      {/* Espaçamento extra no final para não cortar a seta */}
      <div className="h-16 sm:h-24 md:h-32"></div>

      {/* Áudios ocultos - Pre-carregados */}
      <div className="hidden">
        {conversation.map((msg, index) => (
          <audio
            key={index}
            ref={(el) => (audioRefs.current[index] = el)}
            src={msg.audioUrl}
            preload="auto"
          />
        ))}
      </div>

    </section>
  )
}

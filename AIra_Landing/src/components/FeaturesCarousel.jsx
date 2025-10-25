/**
 * ════════════════════════════════════════════════════════════════
 * COMPONENTE: FeaturesCarousel
 * Carrossel de features com animações representativas
 * ════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap,
  TrendingUp,
  Shield,
  Users,
  MessageCircle,
  BarChart3,
  ArrowRight
} from 'lucide-react'

export default function FeaturesCarousel({ autoPlay = true, autoPlayDelay = 5000 }) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (!autoPlay) return

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % features.length)
    }, autoPlayDelay)

    return () => clearInterval(interval)
  }, [autoPlay, autoPlayDelay])

  const features = [
    {
      icon: Zap,
      title: 'Respostas em Segundos',
      description: 'Enquanto seu vendedor demora 5 minutos para responder, a IA responde em 2 segundos. 24/7/365.',
      gradient: 'from-yellow-500 to-orange-500',
      animation: 'speed'
    },
    {
      icon: TrendingUp,
      title: '+300% de Conversão',
      description: 'IA nunca esquece de fazer follow-up, nunca perde o timing e nunca deixa lead esfriar.',
      gradient: 'from-green-500 to-emerald-500',
      animation: 'growth'
    },
    {
      icon: Shield,
      title: 'Zero Turnover',
      description: 'Sem férias, sem atestados, sem pedidos de demissão. Seu melhor vendedor nunca sai.',
      gradient: 'from-blue-500 to-cyan-500',
      animation: 'shield'
    },
    {
      icon: Users,
      title: 'Atendimento Simultâneo',
      description: '1 vendedor atende 1 pessoa. A IA atende 1000 ao mesmo tempo sem perder qualidade.',
      gradient: 'from-purple-500 to-pink-500',
      animation: 'users'
    },
    {
      icon: MessageCircle,
      title: 'Qualificação Automática',
      description: 'A IA filtra curiosos e entrega só leads prontos para fechar. Seu time vende, não perde tempo.',
      gradient: 'from-green-500 to-teal-500',
      animation: 'chat'
    },
    {
      icon: BarChart3,
      title: 'Custo 90% Menor',
      description: 'CLT custa R$8.500/mês (salário + encargos). IA custa R$497. Faça as contas.',
      gradient: 'from-emerald-500 to-green-600',
      animation: 'savings'
    }
  ]

  return (
    <div className="relative">
      {/* Header */}
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent">
              Por Que Empresas Estão Demitindo Vendedores CLT
            </span>
          </h2>
          <p className="text-xl text-gray-400">
            E contratando equipes de IA que custam 90% menos e vendem 300% mais
          </p>
        </motion.div>
      </div>

      {/* Carrossel */}
      <div className="relative min-h-[500px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {features.map((feature, index) => {
            if (index !== activeIndex) return null

            return (
              <motion.div
                key={index}
                className="grid lg:grid-cols-2 gap-12 items-center w-full max-w-6xl"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{
                  duration: 0.6,
                  ease: [0.25, 0.1, 0.25, 1.0]
                }}
              >
                {/* Card da Feature */}
                <div className="relative group">
                  {/* Glow Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-30 blur-3xl transition-all duration-300 rounded-3xl`} />

                  <div className="relative bg-black/60 backdrop-blur-2xl border-2 border-green-500/50 p-10 rounded-3xl">
                    {/* Ícone */}
                    <div className={`bg-gradient-to-br ${feature.gradient} w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-2xl`}>
                      <feature.icon className="h-10 w-10 text-white" />
                    </div>

                    {/* Título */}
                    <h3 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                      {feature.title}
                    </h3>

                    {/* Descrição */}
                    <p className="text-lg text-gray-300 leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Número do card */}
                    <div className="absolute top-6 right-6 text-6xl font-black text-green-500/10">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                  </div>
                </div>

                {/* Animação da Feature */}
                <div className="relative h-[400px] bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl border-2 border-green-500/30 rounded-3xl overflow-hidden flex items-center justify-center">
                  {feature.animation === 'speed' && <SpeedAnimation />}
                  {feature.animation === 'growth' && <GrowthAnimation />}
                  {feature.animation === 'shield' && <ShieldAnimation />}
                  {feature.animation === 'users' && <UsersAnimation />}
                  {feature.animation === 'chat' && <ChatAnimation />}
                  {feature.animation === 'savings' && <SavingsAnimation />}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Indicadores */}
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 flex gap-3">
          {features.map((_, idx) => (
            <motion.button
              key={idx}
              className={`h-2 rounded-full transition-all ${
                idx === activeIndex ? 'w-12 bg-green-500' : 'w-2 bg-green-500/30'
              }`}
              onClick={() => setActiveIndex(idx)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
      </div>

      {/* Scroll CTA */}
      <motion.div
        className="absolute bottom-8 right-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <motion.button
          onClick={() => {
            const howItWorks = document.getElementById('how-it-works')
            howItWorks?.scrollIntoView({ behavior: 'smooth' })
          }}
          className="flex items-center gap-2 px-6 py-3 bg-green-500/20 backdrop-blur-sm border border-green-500/50 rounded-full text-green-400 hover:bg-green-500/30 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-sm font-semibold">Ver Como Funciona</span>
          <ArrowRight className="h-4 w-4" />
        </motion.button>
      </motion.div>
    </div>
  )
}

// Animações para cada feature
function SpeedAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Raios de velocidade */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-1 bg-gradient-to-r from-yellow-400 to-transparent rounded-full"
          style={{
            width: `${100 + i * 20}px`,
            left: '20%',
            top: `${40 + i * 5}%`
          }}
          animate={{
            x: [0, 200],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeOut'
          }}
        />
      ))}

      {/* Relógio digital */}
      <motion.div
        className="text-7xl font-black text-green-400"
        animate={{
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 1,
          repeat: Infinity
        }}
      >
        2s
      </motion.div>
    </div>
  )
}

function GrowthAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Barras crescendo */}
      {[30, 50, 75, 100].map((height, i) => (
        <motion.div
          key={i}
          className="w-12 bg-gradient-to-t from-green-500 to-emerald-400 rounded-t-lg mx-2"
          initial={{ height: 0 }}
          animate={{ height: `${height}%` }}
          transition={{
            duration: 1,
            delay: i * 0.2,
            repeat: Infinity,
            repeatDelay: 1
          }}
        />
      ))}

      {/* +300% */}
      <motion.div
        className="absolute top-10 right-10 text-5xl font-black text-green-400"
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          duration: 0.5,
          delay: 0.8,
          repeat: Infinity,
          repeatDelay: 2
        }}
      >
        +300%
      </motion.div>
    </div>
  )
}

function ShieldAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Escudo */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity
        }}
      >
        <Shield className="h-40 w-40 text-blue-400" strokeWidth={1.5} />
      </motion.div>

      {/* Ondas de proteção */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border-2 border-blue-400"
          style={{
            width: '200px',
            height: '200px'
          }}
          animate={{
            scale: [1, 2],
            opacity: [0.5, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.7
          }}
        />
      ))}
    </div>
  )
}

function UsersAnimation() {
  const positions = [
    { x: 0, y: -80 },
    { x: 80, y: -40 },
    { x: 80, y: 40 },
    { x: 0, y: 80 },
    { x: -80, y: 40 },
    { x: -80, y: -40 }
  ]

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Centro */}
      <motion.div
        className="absolute w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
        animate={{
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity
        }}
      >
        <MessageCircle className="h-8 w-8 text-white" />
      </motion.div>

      {/* Usuários ao redor */}
      {positions.map((pos, i) => (
        <motion.div
          key={i}
          className="absolute w-12 h-12 rounded-full bg-green-500/30 border-2 border-green-400 flex items-center justify-center"
          style={{
            x: pos.x,
            y: pos.y
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1
          }}
          transition={{
            duration: 0.5,
            delay: i * 0.2,
            repeat: Infinity,
            repeatDelay: 2
          }}
        >
          <Users className="h-6 w-6 text-green-400" />
        </motion.div>
      ))}
    </div>
  )
}

export function ChatAnimation() {
  const [chats, setChats] = useState([])
  const [nextId, setNextId] = useState(0)

  useEffect(() => {
    // Conversas de exemplo
    const conversations = [
      { name: 'João Silva', question: 'Quanto custa?', answer: 'R$ 299. Envio o link?' },
      { name: 'Maria Santos', question: 'Tem em estoque?', answer: 'Sim! 15 unidades disponíveis!' },
      { name: 'Pedro Costa', question: 'Prazo de entrega?', answer: 'Entrega em 2-3 dias úteis' },
      { name: 'Ana Paula', question: 'Aceita cartão?', answer: 'Sim! Até 12x sem juros' },
      { name: 'Carlos Lima', question: 'Tem garantia?', answer: '12 meses de garantia total!' },
      { name: 'Juliana Souza', question: 'Posso parcelar?', answer: 'Até 12x sem juros no cartão' }
    ]

    const interval = setInterval(() => {
      const randomConv = conversations[Math.floor(Math.random() * conversations.length)]
      const chatId = nextId
      setNextId(prev => prev + 1)

      const newChat = {
        id: chatId,
        clientName: randomConv.name,
        clientMsg: randomConv.question,
        aiMsg: randomConv.answer,
        responded: false
      }

      setChats((prev) => [...prev, newChat].slice(-3))

      // Marca como respondida após 500ms
      setTimeout(() => {
        setChats((current) =>
          current.map((c) => (c.id === chatId ? { ...c, responded: true } : c))
        )
      }, 500)

      // Remove após 2.5 segundos
      setTimeout(() => {
        setChats((current) => current.filter((c) => c.id !== chatId))
      }, 2500)
    }, 900)

    return () => clearInterval(interval)
  }, [nextId])

  return (
    <div className="relative w-full h-full flex flex-col items-start justify-center p-4 gap-2 overflow-hidden">
      <AnimatePresence>
        {chats.map((chat) => (
          <motion.div
            key={chat.id}
            className="w-full bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border-2 border-green-500/30 rounded-2xl p-3 shadow-lg"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ duration: 0.25 }}
          >
            {/* Header do Chat - Nome do Cliente */}
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-green-500/20">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-xs">
                {chat.clientName.charAt(0)}
              </div>
              <span className="text-white font-semibold text-xs">{chat.clientName}</span>
              <div className="ml-auto flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] text-gray-400">online</span>
              </div>
            </div>

            {/* Mensagem do Cliente */}
            <div className="flex justify-start mb-2">
              <div className="bg-gray-700/60 rounded-lg rounded-tl-sm px-3 py-1.5 max-w-[80%]">
                <p className="text-gray-200 text-xs">{chat.clientMsg}</p>
              </div>
            </div>

            {/* Indicador de digitação OU Resposta da IA */}
            {!chat.responded ? (
              <div className="flex justify-end">
                <div className="bg-green-500/20 border border-green-500/40 rounded-lg rounded-tr-sm px-3 py-1.5 flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
                    <div className="w-1 h-1 rounded-full bg-green-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <div className="w-1 h-1 rounded-full bg-green-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </div>
                  <span className="text-[10px] text-green-300">digitando...</span>
                </div>
              </div>
            ) : (
              <div className="flex justify-end">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg rounded-tr-sm px-3 py-1.5 max-w-[85%] shadow-lg shadow-green-500/20">
                  <p className="text-white text-xs font-medium">{chat.aiMsg}</p>
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    <span className="text-[9px] text-green-100">✓✓</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Badge de Estatística */}
      <motion.div
        className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-xl border-2 border-green-500/50 rounded-lg px-3 py-1.5"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
      >
        <p className="text-green-400 font-bold text-sm">
          ⚡ Resposta {'<'}2s
        </p>
      </motion.div>
    </div>
  )
}

function SavingsAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="text-center">
        {/* CLT */}
        <motion.div
          className="mb-8"
          animate={{
            opacity: [1, 0.5, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity
          }}
        >
          <p className="text-gray-400 text-sm mb-2">Vendedor CLT</p>
          <motion.p
            className="text-4xl font-black text-red-400 line-through"
            animate={{
              x: [0, -10, 0]
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatDelay: 2
            }}
          >
            R$ 8.500
          </motion.p>
        </motion.div>

        {/* Seta */}
        <motion.div
          animate={{
            y: [0, 10, 0]
          }}
          transition={{
            duration: 1,
            repeat: Infinity
          }}
        >
          <ArrowRight className="h-8 w-8 text-green-400 mx-auto rotate-90" />
        </motion.div>

        {/* IA */}
        <motion.div
          className="mt-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 0.5,
            delay: 1,
            repeat: Infinity,
            repeatDelay: 3
          }}
        >
          <p className="text-gray-400 text-sm mb-2">IA Aira</p>
          <p className="text-5xl font-black text-green-400">
            R$ 497
          </p>
          <motion.p
            className="text-xl font-bold text-emerald-400 mt-2"
            animate={{
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 0.5,
              delay: 1.5,
              repeat: Infinity,
              repeatDelay: 3
            }}
          >
            90% de economia!
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}

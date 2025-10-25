import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  Zap, TrendingUp, Clock, Users, CheckCircle, Star,
  ArrowRight, Menu, X, Phone, MapPin, Sparkles,
  Brain, Cpu, Network, Rocket, Code, Database
} from 'lucide-react'
import './App.css'
import VideoBackground from './components/VideoBackground'
import AmbientSound from './components/AmbientSound'
import AIraShowcase from './components/AIraShowcase'
import Neon3DObject from './components/Neon3DObject'

function App() {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginType, setLoginType] = useState('client')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [particles, setParticles] = useState([])
  const [current3DIndex, setCurrent3DIndex] = useState(0)
  const [currentPlanIndex, setCurrentPlanIndex] = useState(1) // Começa no plano popular (Professional)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8])

  // Animações 3D disponíveis com textos específicos
  const animations3D = [
    {
      type: 'aira',
      color: 'blue'
    },
    {
      type: 'money',
      color: 'green'
    },
    {
      type: 'brain',
      color: 'purple'
    },
    {
      type: 'chart',
      color: 'cyan'
    },
    {
      type: 'shield',
      color: 'red'
    }
  ]

  // Gerar partículas animadas para o background
  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5
    }))
    setParticles(newParticles)
  }, [])

  // Carrossel automático de animações 3D
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent3DIndex((prev) => (prev + 1) % animations3D.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const credentials = {
    admin: { email: 'admin@aira.com', password: 'admin123' },
    client: { email: 'cliente@empresa.com', password: 'cliente123' }
  }

  const handleLogin = (e) => {
    e.preventDefault()
    setLoginError('')
    const creds = credentials[loginType]
    if (email === creds.email && password === creds.password) {
      if (loginType === 'admin') {
        window.location.href = 'http://localhost:5173'
      } else {
        window.location.href = 'http://localhost:5175'
      }
    } else {
      setLoginError('Email ou senha incorretos')
    }
  }

  const openLoginModal = (type) => {
    setLoginType(type)
    setShowLoginModal(true)
    setEmail('')
    setPassword('')
    setLoginError('')
  }

  // Habilitar som após primeira interação
  const enableSound = () => {
    setSoundEnabled(true)
  }

  const testimonials = [
    {
      name: 'Carlos Silva',
      role: 'Diretor de Vendas - Imobiliária Premium',
      image: '👨‍💼',
      rating: 5,
      text: 'Desde que implementamos a AIra, nossas vendas aumentaram 60%. O bot qualifica os leads automaticamente!'
    },
    {
      name: 'Marina Costa',
      role: 'CEO - AutoCenter Excellence',
      image: '👩‍💼',
      rating: 5,
      text: 'Incrível! Respondemos 10x mais clientes e nossa equipe pode focar no que realmente importa.'
    },
    {
      name: 'Roberto Mendes',
      role: 'Gerente Comercial - Mega Imóveis',
      image: '👨‍💼',
      rating: 5,
      text: 'ROI positivo em menos de 2 meses. A melhor decisão que tomamos para nossa empresa.'
    }
  ]

  const plans = [
    {
      name: 'Starter',
      price: 'R$ 497',
      period: '/mês',
      description: 'Ideal para pequenas empresas',
      features: [
        'Até 500 mensagens/mês',
        '1 Número WhatsApp',
        'Chat Widget para Site',
        'Dashboard com Métricas',
        'Suporte via Email',
        'Relatórios Básicos'
      ],
      popular: false
    },
    {
      name: 'Professional',
      price: 'R$ 997',
      period: '/mês',
      description: 'Mais vendido',
      features: [
        'Até 1.000 mensagens/mês',
        '3 Números WhatsApp',
        'Multi-atendentes',
        'Analytics Avançado',
        'Suporte Prioritário',
        'API de Integração',
        'Relatórios Customizados',
        'Chatbot Personalizado'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'R$ 1.997',
      period: '/mês',
      description: 'Para grandes volumes',
      features: [
        'Até 1.000 mensagens/mês',
        'WhatsApp Ilimitados',
        'Tudo do Professional',
        'White Label Completo',
        'Gerente de Conta Dedicado',
        'SLA Garantido 99.9%',
        'Integrações Customizadas',
        'Treinamento da Equipe'
      ],
      popular: false
    }
  ]

  const stats = [
    { value: '45%', label: 'Aumento Médio em Vendas', icon: TrendingUp },
    { value: '24/7', label: 'Atendimento Contínuo', icon: Clock },
    { value: '1.8s', label: 'Tempo de Resposta', icon: Zap },
    { value: '10x', label: 'Mais Leads Qualificados', icon: Users }
  ]

  const techIcons = [Brain, Cpu, Network, Database, Code, Rocket]

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Trilha Sonora Ambiente */}
      <AmbientSound
        soundUrl="/trilhasonora.mp3"
        volume={0.08}
        loop={true}
        play={soundEnabled}
      />

      {/* Vídeo de Fundo na Hero Section */}
      <div className="fixed inset-0 z-0">
        <VideoBackground
          videoUrl="/robobg.mp4"
          overlay="gradient"
          overlayOpacity={0.85}
          blur={0}
        />

        {/* Animated Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />

        {/* Floating Particles */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-blue-400 rounded-full"
            initial={{ x: `${particle.x}vw`, y: `${particle.y}vh`, opacity: 0 }}
            animate={{
              y: [`${particle.y}vh`, `${particle.y - 100}vh`],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: 'linear'
            }}
            style={{ width: particle.size, height: particle.size }}
          />
        ))}

        {/* Scanline Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_50%,rgba(59,130,246,0.03)_50%)] bg-[length:100%_4px] pointer-events-none" />
      </div>

      {/* Content Container */}
      <div className="relative z-10">
        {/* Header/Navbar */}
        <nav className="fixed top-0 w-full bg-black/50 backdrop-blur-xl border-b border-blue-500/20 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <img
                  src="/AIra_Logotipo.png"
                  alt="AIra Logotipo"
                  className="h-10"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.outerHTML = '<span class="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">AIra</span>'
                  }}
                />
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full border border-blue-500/50">
                  AI Powered
                </span>
              </div>

              {/* Desktop Menu */}
              <div className="hidden md:flex items-center space-x-8">
                <a href="#aira-showcase" className="text-gray-300 hover:text-blue-400 transition-colors">Demo</a>
                <a href="#pricing" className="text-gray-300 hover:text-blue-400 transition-colors">Preços</a>
                <a href="#testimonials" className="text-gray-300 hover:text-blue-400 transition-colors">Depoimentos</a>
                <button
                  onClick={() => openLoginModal('client')}
                  className="px-4 py-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Login Cliente
                </button>
                <button
                  onClick={() => openLoginModal('admin')}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg shadow-purple-500/50"
                >
                  Login Admin
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-white"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden bg-black/90 backdrop-blur-xl border-t border-blue-500/20"
            >
              <div className="px-4 py-4 space-y-3">
                <a href="#aira-showcase" className="block text-gray-300 hover:text-blue-400">Demo</a>
                <a href="#pricing" className="block text-gray-300 hover:text-blue-400">Preços</a>
                <a href="#testimonials" className="block text-gray-300 hover:text-blue-400">Depoimentos</a>
                <button
                  onClick={() => openLoginModal('client')}
                  className="block w-full text-left px-4 py-2 text-blue-400"
                >
                  Login Cliente
                </button>
                <button
                  onClick={() => openLoginModal('admin')}
                  className="block w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold"
                >
                  Login Admin
                </button>
              </div>
            </motion.div>
          )}
        </nav>

        {/* Hero Section */}
        <motion.section
          style={{ opacity, scale }}
          className="pt-20 md:pt-32 pb-10 md:pb-20 px-4 relative min-h-screen flex items-center"
        >
          <div className="max-w-7xl mx-auto w-full">
            {/* Mobile Layout - Stack vertical */}
            <div className="lg:hidden flex flex-col gap-4">
              {/* Tech Badge */}
              <motion.div
                className="inline-flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1 md:py-2 bg-green-500/10 border border-green-500/30 rounded-full mb-2"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-green-400" />
                <span className="text-xs md:text-sm text-green-400 font-semibold">Powered by Advanced AI</span>
              </motion.div>

              {/* Título */}
              <h1 className="text-6xl font-bold mb-3 leading-tight">
                <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  Venda Mais
                </span>
                <br />
                <span className="text-white">com Inteligência</span>
                <br />
                <span className="bg-gradient-to-r from-teal-400 via-green-400 to-emerald-400 bg-clip-text text-transparent">
                  Artificial
                </span>
              </h1>

              {/* Animação 3D - Entre título e descrição */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="relative h-[180px] ml-16 my-4"
              >
                {/* Container das Animações 3D */}
                <div className="relative h-full flex flex-col items-center justify-center">
                  {/* Glow Effect de fundo dinâmico */}
                  <motion.div
                    key={`glow-${current3DIndex}`}
                    className="absolute inset-0 rounded-3xl blur-3xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{
                      background: `radial-gradient(circle, ${
                        animations3D[current3DIndex].color === 'blue' ? 'rgb(59, 130, 246)' :
                        animations3D[current3DIndex].color === 'green' ? 'rgb(16, 185, 129)' :
                        animations3D[current3DIndex].color === 'purple' ? 'rgb(168, 85, 247)' :
                        animations3D[current3DIndex].color === 'cyan' ? 'rgb(6, 182, 212)' :
                        'rgb(239, 68, 68)'
                      }20, transparent 70%)`
                    }}
                  />

                  {/* Animação 3D Neon */}
                  <div className="relative z-10 w-full h-[120px] flex items-center justify-center">
                    <motion.div
                      key={current3DIndex}
                      initial={{ opacity: 0, scale: 0.5, rotateY: -180 }}
                      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                      exit={{ opacity: 0, scale: 0.5, rotateY: 180 }}
                      transition={{ duration: 0.8, type: 'spring', stiffness: 80 }}
                    >
                      <Neon3DObject
                        type={animations3D[current3DIndex].type}
                        color={animations3D[current3DIndex].color}
                        isActive={true}
                      />
                    </motion.div>
                  </div>

                  {/* Animated Rings ao redor */}
                  <motion.div
                    className="absolute inset-0 border border-blue-500/10 rounded-full"
                    animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  />
                  <motion.div
                    className="absolute inset-8 border border-purple-500/10 rounded-full"
                    animate={{ rotate: -360, scale: [1, 1.08, 1] }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                  />
                  <motion.div
                    className="absolute inset-16 border border-pink-500/10 rounded-full"
                    animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  />
                </div>
              </motion.div>

              {/* Descrição */}
              <p className="text-lg text-gray-300 mb-4 max-w-2xl">
                  Robôs inteligentes que <span className="text-green-400 font-semibold">atendem</span>,
                  <span className="text-emerald-400 font-semibold"> qualificam</span> e
                  <span className="text-teal-400 font-semibold"> convertem</span> seus leads
                  automaticamente 24 horas por dia
                </p>

                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6 md:mb-12">
                  <motion.button
                    onClick={() => {
                      enableSound()
                      window.location.href = '/checkout.html'
                    }}
                    className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 rounded-lg font-bold text-base md:text-lg transform hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-2xl shadow-green-500/50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Começar Gratuitamente
                    <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                  </motion.button>
                  <motion.button
                    className="px-6 md:px-8 py-3 md:py-4 border-2 border-green-500 hover:bg-green-500/10 rounded-lg font-bold text-base md:text-lg transition-all backdrop-blur-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const section = document.getElementById('aira-showcase')
                      section?.scrollIntoView({ behavior: 'smooth' })
                    }}
                  >
                    Ver Demonstração
                  </motion.button>
                </div>

            </div>

            {/* Desktop Layout - Grid lado a lado */}
            <div className="hidden lg:grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Side - Text Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                {/* Tech Badge */}
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full mb-6"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Sparkles className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-green-400 font-semibold">Powered by Advanced AI</span>
                </motion.div>

                <h1 className="text-7xl font-bold mb-6 leading-tight">
                  <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    Venda Mais
                  </span>
                  <br />
                  <span className="text-white">com Inteligência</span>
                  <br />
                  <span className="bg-gradient-to-r from-teal-400 via-green-400 to-emerald-400 bg-clip-text text-transparent">
                    Artificial
                  </span>
                </h1>

                <p className="text-2xl text-gray-300 mb-8 max-w-2xl">
                  Robôs inteligentes que <span className="text-green-400 font-semibold">atendem</span>,
                  <span className="text-emerald-400 font-semibold"> qualificam</span> e
                  <span className="text-teal-400 font-semibold"> convertem</span> seus leads
                  automaticamente 24 horas por dia
                </p>

                <div className="flex gap-4 mb-12">
                  <motion.button
                    onClick={() => {
                      enableSound()
                      window.location.href = '/checkout.html'
                    }}
                    className="px-8 py-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 rounded-lg font-bold text-lg transform hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-2xl shadow-green-500/50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Começar Gratuitamente
                    <ArrowRight className="h-5 w-5" />
                  </motion.button>
                  <motion.button
                    className="px-8 py-4 border-2 border-green-500 hover:bg-green-500/10 rounded-lg font-bold text-lg transition-all backdrop-blur-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const section = document.getElementById('aira-showcase')
                      section?.scrollIntoView({ behavior: 'smooth' })
                    }}
                  >
                    Ver Demonstração
                  </motion.button>
                </div>

                {/* Floating Tech Icons */}
                <div className="flex gap-4 flex-wrap">
                  {techIcons.map((Icon, index) => (
                    <motion.div
                      key={index}
                      className="p-3 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg backdrop-blur-sm"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <Icon className="h-5 w-5 text-green-400" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Right Side - 3D Neon Objects Carousel */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="relative h-[550px]"
              >
                {/* Container das Animações 3D */}
                <div className="relative h-full flex flex-col items-center justify-center">
                  {/* Glow Effect de fundo dinâmico */}
                  <motion.div
                    key={`glow-${current3DIndex}`}
                    className="absolute inset-0 rounded-3xl blur-3xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{
                      background: `radial-gradient(circle, ${
                        animations3D[current3DIndex].color === 'blue' ? 'rgb(59, 130, 246)' :
                        animations3D[current3DIndex].color === 'green' ? 'rgb(16, 185, 129)' :
                        animations3D[current3DIndex].color === 'purple' ? 'rgb(168, 85, 247)' :
                        animations3D[current3DIndex].color === 'cyan' ? 'rgb(6, 182, 212)' :
                        'rgb(239, 68, 68)'
                      }20, transparent 70%)`
                    }}
                  />

                  {/* Animação 3D Neon */}
                  <div className="relative z-10 w-full h-[350px] flex items-center justify-center">
                    <motion.div
                      key={current3DIndex}
                      initial={{ opacity: 0, scale: 0.5, rotateY: -180 }}
                      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                      exit={{ opacity: 0, scale: 0.5, rotateY: 180 }}
                      transition={{ duration: 0.8, type: 'spring', stiffness: 80 }}
                    >
                      <Neon3DObject
                        type={animations3D[current3DIndex].type}
                        color={animations3D[current3DIndex].color}
                        isActive={true}
                      />
                    </motion.div>
                  </div>


                  {/* Animated Rings ao redor */}
                  <motion.div
                    className="absolute inset-0 border border-blue-500/10 rounded-full"
                    animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  />
                  <motion.div
                    className="absolute inset-8 border border-purple-500/10 rounded-full"
                    animate={{ rotate: -360, scale: [1, 1.08, 1] }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                  />
                  <motion.div
                    className="absolute inset-16 border border-pink-500/10 rounded-full"
                    animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  />
                </div>

                {/* Indicadores do Carrossel */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {animations3D.map((_, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setCurrent3DIndex(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === current3DIndex
                          ? 'w-8 bg-blue-400 shadow-lg shadow-blue-400/50'
                          : 'w-2 bg-gray-600 hover:bg-gray-500'
                      }`}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    />
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 1 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                  <div className="relative bg-black/40 backdrop-blur-xl border border-blue-500/30 p-6 rounded-2xl text-center group-hover:border-blue-500/50 transition-all">
                    <stat.icon className="h-8 w-8 mx-auto mb-3 text-blue-400" />
                    <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                      {stat.value}
                    </div>
                    <div className="text-gray-400 text-sm md:text-base">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* AIra Showcase Section - Conversa Direta */}
        <AIraShowcase startChat={false} />

        {/* Pricing */}
        <section id="pricing" className="py-20 px-4 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent" />

          <div className="max-w-7xl mx-auto relative">
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl md:text-6xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Você está a 01 passo de ter a AIra!
                  </span>
                </h2>
                <p className="text-xl text-gray-400">
                  A Conscicência Aritificial a seu Favor!
                </p>
              </motion.div>
            </div>

            {/* Mobile: Slide com Card Principal em Destaque */}
            <div className="md:hidden">
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = Math.abs(offset.x) * velocity.x

                  if (swipe < -500) {
                    // Arrastar para esquerda = próximo plano
                    setCurrentPlanIndex((prev) => Math.min(prev + 1, plans.length - 1))
                  } else if (swipe > 500) {
                    // Arrastar para direita = plano anterior
                    setCurrentPlanIndex((prev) => Math.max(prev - 1, 0))
                  }
                }}
                className="relative h-[600px] flex items-center justify-center cursor-grab active:cursor-grabbing"
              >
                {/* Cards */}
                <div className="relative w-full flex items-center justify-center pointer-events-none">
                  {plans.map((plan, index) => {
                    const offset = index - currentPlanIndex
                    const isActive = index === currentPlanIndex

                    return (
                      <motion.div
                        key={index}
                        animate={{
                          x: `${offset * 85}%`,
                          scale: isActive ? 1 : 0.75,
                          opacity: isActive ? 1 : 0.4,
                          zIndex: isActive ? 10 : 0,
                        }}
                        transition={{
                          type: 'spring',
                          stiffness: 300,
                          damping: 30
                        }}
                        onClick={() => setCurrentPlanIndex(index)}
                        className={`absolute w-[320px] pointer-events-auto ${
                          isActive ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
                        }`}
                        style={{
                          filter: isActive ? 'blur(0px)' : 'blur(2px)'
                        }}
                      >
                        {/* Glow Effect for Popular Plan */}
                        {plan.popular && isActive && (
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 opacity-20 blur-2xl rounded-3xl" />
                        )}

                        <div className={`relative bg-black/40 backdrop-blur-xl p-6 rounded-3xl border-2 ${
                          plan.popular ? 'border-purple-500' : 'border-blue-500/30'
                        }`}>
                          {plan.popular && (
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-4 py-1 rounded-full text-xs font-bold shadow-lg whitespace-nowrap">
                                MAIS POPULAR
                              </span>
                            </div>
                          )}
                          <h3 className="text-xl font-bold mb-2 text-white">{plan.name}</h3>
                          <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                          <div className="mb-4">
                            <span className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                              {plan.price}
                            </span>
                            <span className="text-gray-400 text-base">{plan.period}</span>
                          </div>
                          <ul className="space-y-2 mb-6">
                            {plan.features.map((feature, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-300 text-sm">{feature}</span>
                              </li>
                            ))}
                          </ul>
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation()
                              window.location.href = '/checkout.html'
                            }}
                            className={`w-full py-3 rounded-xl font-bold text-base transition-all ${
                              plan.popular
                                ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 shadow-xl shadow-purple-500/50'
                                : 'border-2 border-blue-500 hover:bg-blue-500/10'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Começar Agora
                          </motion.button>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>

              {/* Paginação com Círculos */}
              <div className="flex justify-center gap-3 mt-8">
                {plans.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setCurrentPlanIndex(index)}
                    className={`rounded-full transition-all ${
                      index === currentPlanIndex
                        ? 'w-10 h-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'
                        : 'w-3 h-3 bg-gray-600 hover:bg-gray-500'
                    }`}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    animate={{
                      boxShadow: index === currentPlanIndex
                        ? '0 0 20px rgba(139, 92, 246, 0.6)'
                        : '0 0 0px rgba(0, 0, 0, 0)'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Desktop: Grid tradicional */}
            <div className="hidden md:grid md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                  className={`relative ${plan.popular ? 'md:scale-110 z-10' : ''}`}
                >
                  {/* Glow Effect for Popular Plan */}
                  {plan.popular && (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 opacity-20 blur-2xl rounded-3xl" />
                  )}

                  <div className={`relative bg-black/40 backdrop-blur-xl p-8 rounded-3xl border-2 ${
                    plan.popular ? 'border-purple-500' : 'border-blue-500/30'
                  }`}>
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                          MAIS POPULAR
                        </span>
                      </div>
                    )}
                    <h3 className="text-2xl font-bold mb-2 text-white">{plan.name}</h3>
                    <p className="text-gray-400 mb-4">{plan.description}</p>
                    <div className="mb-6">
                      <span className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        {plan.price}
                      </span>
                      <span className="text-gray-400">{plan.period}</span>
                    </div>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <motion.button
                      onClick={() => window.location.href = '/checkout.html'}
                      className={`w-full py-3 rounded-xl font-bold transition-all ${
                        plan.popular
                          ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/50'
                          : 'border-2 border-blue-500 hover:bg-blue-500/10'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Começar Agora
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl md:text-6xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Resultados Reais
                  </span>
                </h2>
                <p className="text-xl text-gray-400">
                  Empresas que transformaram suas vendas com IA
                </p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all" />
                  <div className="relative bg-black/40 backdrop-blur-xl p-6 rounded-2xl border border-blue-500/30 group-hover:border-blue-500/50 transition-all">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-300 mb-4 italic">"{testimonial.text}"</p>
                    <div className="flex items-center gap-3">
                      <div className="text-4xl bg-gradient-to-br from-blue-500 to-purple-500 p-2 rounded-full">
                        {testimonial.image}
                      </div>
                      <div>
                        <div className="font-bold text-white">{testimonial.name}</div>
                        <div className="text-sm text-gray-400">{testimonial.role}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-blue-500/20 py-12 px-4 bg-black/40 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="mb-4">
                <img
                  src="/AIra_Logotipo.png"
                  alt="AIra"
                  className="h-16"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.outerHTML = '<span class="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">AIra</span>'
                  }}
                />
              </div>
              <p className="text-gray-400">
                Inteligência Artificial para vendas e atendimento automático
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-4 text-white">Produto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#aira-showcase" className="hover:text-blue-400 transition-colors">Demo</a></li>
                <li><a href="#pricing" className="hover:text-blue-400 transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Integrações</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">API</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4 text-white">Empresa</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Carreiras</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Contato</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4 text-white">Contato</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-400" />
                  +55 (42) 9 9930-0611
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-400" />
                  Campo Grande, MS
                </li>
              </ul>
            </div>
          </div>

          <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-blue-500/20 text-center text-gray-400">
            <p>© 2025 AIra. Todos os direitos reservados. Powered by Artificial Intelligence.</p>
          </div>
        </footer>

        {/* Login Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative bg-black/80 backdrop-blur-xl p-8 rounded-3xl border border-blue-500/50 max-w-md w-full"
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl" />

              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {loginType === 'admin' ? 'Login Administrador' : 'Login Cliente'}
                  </h2>
                  <button
                    onClick={() => setShowLoginModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-black/60 border border-blue-500/30 rounded-xl focus:border-blue-500 focus:outline-none text-white backdrop-blur-sm"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Senha
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-black/60 border border-blue-500/30 rounded-xl focus:border-blue-500 focus:outline-none text-white backdrop-blur-sm"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  {loginError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 text-red-400 text-sm"
                    >
                      {loginError}
                    </motion.div>
                  )}

                  <motion.button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Entrar
                  </motion.button>
                </form>

                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl backdrop-blur-sm">
                  <p className="text-sm text-gray-400 mb-2">Credenciais de teste:</p>
                  <p className="text-sm text-blue-400 font-mono">
                    {loginType === 'admin'
                      ? 'Email: admin@aira.com | Senha: admin123'
                      : 'Email: cliente@empresa.com | Senha: cliente123'}
                  </p>
                </div>

                <div className="mt-4 text-center">
                  <button
                    onClick={() => setLoginType(loginType === 'admin' ? 'client' : 'admin')}
                    className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                  >
                    {loginType === 'admin' ? 'Entrar como Cliente' : 'Entrar como Admin'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App

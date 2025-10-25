import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car, Home, ShoppingBag, Wrench, Briefcase,
  Bot, Smartphone, CheckCircle, ArrowRight, ArrowLeft,
  Loader2, Zap, MessageSquare, Settings, Sparkles, Brain,
  Network, Cpu, Orbit, Waves, Hexagon, Star, CircuitBoard
} from 'lucide-react';

const Setup = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [hoveredNicho, setHoveredNicho] = useState(null);

  // Dados do formulário
  const [setupData, setSetupData] = useState({
    nicho: '',
    nomeEmpresa: '',
    nomeBot: '',
    numeroWhatsApp: '',
    conectarAgora: true,
    temCatalogo: false,
    uploadCatalogo: null,
  });

  const nichos = [
    {
      id: 'veiculos',
      nome: 'Veículos',
      descricao: 'Vendas de carros, motos e veículos',
      icon: Car,
      cor: 'from-blue-500 via-cyan-500 to-blue-600',
      glowColor: 'rgba(59, 130, 246, 0.5)',
      disponivel: true,
      exemploBot: 'VendeAI Auto',
      neuronPath: 'M50,50 Q80,30 100,50 T150,50'
    },
    {
      id: 'imoveis',
      nome: 'Imóveis',
      descricao: 'Vendas e locação de imóveis',
      icon: Home,
      cor: 'from-green-500 via-emerald-500 to-teal-600',
      glowColor: 'rgba(34, 197, 94, 0.5)',
      disponivel: false,
      exemploBot: 'AIra Imob',
      emBreve: true,
      neuronPath: 'M50,50 Q60,80 80,90'
    },
    {
      id: 'varejo',
      nome: 'Varejo',
      descricao: 'Lojas e comércio em geral',
      icon: ShoppingBag,
      cor: 'from-purple-500 via-pink-500 to-purple-600',
      glowColor: 'rgba(168, 85, 247, 0.5)',
      disponivel: false,
      emBreve: true,
      neuronPath: 'M50,50 Q120,60 140,80'
    },
    {
      id: 'servicos',
      nome: 'Serviços',
      descricao: 'Prestação de serviços',
      icon: Wrench,
      cor: 'from-orange-500 via-red-500 to-pink-600',
      glowColor: 'rgba(249, 115, 22, 0.5)',
      disponivel: false,
      emBreve: true,
      neuronPath: 'M50,50 Q30,100 60,120'
    },
    {
      id: 'outros',
      nome: 'Outros',
      descricao: 'Outros segmentos',
      icon: Briefcase,
      cor: 'from-gray-500 via-slate-500 to-gray-600',
      glowColor: 'rgba(107, 114, 128, 0.5)',
      disponivel: false,
      emBreve: true,
      neuronPath: 'M50,50 Q100,100 120,100'
    }
  ];

  const totalSteps = 5;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSelectNicho = (nichoId) => {
    const nicho = nichos.find(n => n.id === nichoId);
    if (nicho && nicho.disponivel) {
      setSetupData({ ...setupData, nicho: nichoId });
    }
  };

  const handleFinishSetup = async () => {
    setLoading(true);

    try {
      const userStr = localStorage.getItem('crm_user');
      if (!userStr) {
        throw new Error('Usuário não encontrado. Faça login novamente.');
      }

      const user = JSON.parse(userStr);
      const token = localStorage.getItem('crm_token') || user.token;

      const response = await fetch('http://localhost:5000/api/empresa/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          empresa_id: user.empresa_id,
          nicho: setupData.nicho,
          nome_empresa: setupData.nomeEmpresa,
          nome_bot: setupData.nomeBot,
          numero_whatsapp: setupData.numeroWhatsApp,
          tem_catalogo: setupData.temCatalogo
        })
      });

      const data = await response.json();

      if (data.success) {
        setSetupComplete(true);
        setTimeout(() => {
          if (onComplete) {
            onComplete();
          }
        }, 3000);
      } else {
        alert('Erro ao salvar configurações: ' + (data.error || 'Erro desconhecido'));
      }

    } catch (error) {
      console.error('Erro ao finalizar setup:', error);
      alert('Erro ao salvar configurações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return setupData.nicho !== '';
      case 2:
        return setupData.nomeEmpresa && setupData.nomeBot;
      case 3:
        return setupData.numeroWhatsApp.length >= 10;
      default:
        return true;
    }
  };

  // Floating particles animation
  const FloatingParticles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-emerald-400 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: 0
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );

  // DNA Helix background
  const DNABackground = () => (
    <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
      <svg width="100%" height="100%" className="absolute">
        <defs>
          <linearGradient id="dnaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#34d399" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#6ee7b7" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        {/* DNA Double Helix */}
        {[...Array(8)].map((_, i) => {
          const offset = i * 15;
          return (
            <g key={i}>
              {/* Helix strand 1 */}
              <motion.path
                d={`M ${10 + offset},20 Q ${30 + offset},40 ${10 + offset},60 T ${10 + offset},100 T ${10 + offset},140`}
                stroke="url(#dnaGradient)"
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: [0.3, 0.7, 0.3] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: i * 0.3
                }}
              />
              {/* Helix strand 2 */}
              <motion.path
                d={`M ${10 + offset},40 Q ${30 + offset},20 ${10 + offset},0 T ${10 + offset},80 T ${10 + offset},120`}
                stroke="url(#dnaGradient)"
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: [0.3, 0.7, 0.3] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: i * 0.3 + 0.5
                }}
              />
              {/* Connecting bars */}
              {[0, 1, 2, 3].map((j) => (
                <motion.line
                  key={`bar-${i}-${j}`}
                  x1={`${10 + offset}%`}
                  y1={`${20 + j * 30}%`}
                  x2={`${10 + offset}%`}
                  y2={`${35 + j * 30}%`}
                  stroke="#10b981"
                  strokeWidth="1.5"
                  opacity="0.4"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: [0, 1, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2 + j * 0.3
                  }}
                />
              ))}
              {/* Base pairs circles */}
              <motion.circle
                cx={`${10 + offset}%`}
                cy={`${30 + (i % 4) * 25}%`}
                r="2"
                fill="#10b981"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.4
                }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/50 via-green-950/30 to-teal-950/20"></div>
        <motion.div
          className="absolute top-0 left-0 w-full h-full"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(52, 211, 153, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 80%, rgba(110, 231, 183, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)',
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* DNA Background */}
      <DNABackground />

      {/* Floating Particles */}
      <FloatingParticles />

      {/* Holographic Circles */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
          filter: 'blur(60px)'
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(52,211,153,0.1) 0%, transparent 70%)',
          filter: 'blur(60px)'
        }}
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.3, 0.5]
        }}
        transition={{ duration: 8, repeat: Infinity, delay: 1 }}
      />

      <div className="relative w-full max-w-5xl z-10">
        {/* Header with Brain Icon */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          {/* Animated Brain Icon */}
          <motion.div
            className="relative inline-block mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-full blur-2xl opacity-50"></div>
            <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 flex items-center justify-center mx-auto shadow-2xl">
              <Brain className="h-10 w-10 text-white" />
              {/* Orbiting particles */}
              <motion.div
                className="absolute h-2 w-2 bg-emerald-400 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                style={{ transformOrigin: '0px 40px' }}
              />
              <motion.div
                className="absolute h-2 w-2 bg-teal-400 rounded-full"
                animate={{ rotate: -360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                style={{ transformOrigin: '0px -40px' }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/20 via-green-500/20 to-teal-500/20 border border-emerald-500/30 rounded-full mb-4 backdrop-blur-xl"
          >
            <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" />
            <span className="text-sm text-emerald-400 font-bold">Configuração Inteligente</span>
            <Cpu className="h-4 w-4 text-teal-400 animate-pulse" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 mb-3"
          >
            Configure sua IA de Vendas
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-400 text-lg"
          >
            {setupComplete ? (
              <span className="text-green-400 font-semibold">✨ Sistema configurado com sucesso!</span>
            ) : (
              <>Passo <span className="text-white font-bold">{currentStep}</span> de <span className="text-white font-bold">{totalSteps}</span></>
            )}
          </motion.p>
        </motion.div>

        {/* Holographic Progress Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-10 relative"
        >
          <div className="h-3 bg-gradient-to-r from-slate-800/50 via-slate-700/50 to-slate-800/50 rounded-full overflow-hidden backdrop-blur-xl border border-white/10 shadow-2xl">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 relative"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </div>
          {/* Progress Nodes */}
          <div className="absolute top-0 left-0 w-full h-3 flex justify-between px-1">
            {[...Array(totalSteps)].map((_, i) => (
              <motion.div
                key={i}
                className={`h-3 w-3 rounded-full border-2 ${
                  i + 1 <= currentStep
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 border-white shadow-lg'
                    : 'bg-slate-700 border-slate-600'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                {i + 1 === currentStep && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-emerald-400"
                    animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Main Setup Card - Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl"
        >
          {/* Glass Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-white/[0.02] backdrop-blur-2xl"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-green-500/5 to-teal-500/5"></div>
          <div className="absolute inset-0 border border-white/10 rounded-3xl"></div>

          {/* Content */}
          <div className="relative p-10">
            <AnimatePresence mode="wait">
              {setupComplete ? (
                // Success Screen with Hologram Effect
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-center py-16"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="relative inline-block mb-8"
                  >
                    {/* Holographic rings */}
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute inset-0 border-4 border-green-400 rounded-full"
                        animate={{
                          scale: [1, 1.5, 2],
                          opacity: [0.5, 0.3, 0]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.6
                        }}
                      />
                    ))}
                    <div className="relative h-32 w-32 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-2xl">
                      <CheckCircle className="h-16 w-16 text-white" />
                    </div>
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-4"
                  >
                    Configuração Completa!
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-gray-300 text-lg mb-8"
                  >
                    Sua IA de vendas está pronta para revolucionar seu negócio
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30 rounded-full backdrop-blur-xl"
                  >
                    <Loader2 className="h-5 w-5 text-emerald-400 animate-spin" />
                    <span className="text-emerald-400 font-semibold">Inicializando sistema...</span>
                  </motion.div>
                </motion.div>

              ) : (
                <div>
                  {/* Step 1: Escolha do Nicho com Neurônios Holográficos */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ type: "spring", stiffness: 100 }}
                    >
                      <div className="mb-8 text-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="inline-block p-4 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-2xl mb-4 backdrop-blur-xl border border-emerald-500/30"
                        >
                          <Network className="h-12 w-12 text-emerald-400" />
                        </motion.div>
                        <h2 className="text-3xl font-black text-white mb-2">
                          Escolha seu Segmento
                        </h2>
                        <p className="text-gray-400">
                          Selecione a área de atuação para personalizar sua IA
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {nichos.map((nicho, index) => {
                          const Icon = nicho.icon;
                          const isSelected = setupData.nicho === nicho.id;
                          const isHovered = hoveredNicho === nicho.id;

                          return (
                            <motion.button
                              key={nicho.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              onClick={() => handleSelectNicho(nicho.id)}
                              disabled={!nicho.disponivel}
                              onMouseEnter={() => setHoveredNicho(nicho.id)}
                              onMouseLeave={() => setHoveredNicho(null)}
                              whileHover={nicho.disponivel ? { scale: 1.05, y: -5 } : {}}
                              whileTap={nicho.disponivel ? { scale: 0.95 } : {}}
                              className="relative group"
                            >
                              {/* Holographic Glow */}
                              {(isSelected || isHovered) && nicho.disponivel && (
                                <motion.div
                                  layoutId={`glow-${nicho.id}`}
                                  className="absolute -inset-1 rounded-2xl blur-xl opacity-70"
                                  style={{ background: nicho.glowColor }}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 0.7 }}
                                  transition={{ duration: 0.3 }}
                                />
                              )}

                              {/* Card */}
                              <div className={`relative p-6 rounded-2xl border-2 transition-all backdrop-blur-xl ${
                                isSelected
                                  ? 'border-white/30 bg-gradient-to-br from-white/[0.12] to-white/[0.05]'
                                  : nicho.disponivel
                                  ? 'border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] hover:border-white/20'
                                  : 'border-white/5 bg-white/[0.02] opacity-40 cursor-not-allowed'
                              }`}>
                                {/* Badge */}
                                {nicho.emBreve && (
                                  <div className="absolute top-4 right-4 px-2 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-xs text-yellow-400 font-bold backdrop-blur-xl">
                                    Em Breve
                                  </div>
                                )}

                                {/* Icon with 3D effect */}
                                <motion.div
                                  className={`relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${nicho.cor} rounded-2xl mb-4 shadow-2xl`}
                                  animate={isHovered ? {
                                    rotateY: [0, 10, -10, 0],
                                    rotateX: [0, -10, 10, 0]
                                  } : {}}
                                  transition={{ duration: 0.8 }}
                                  style={{ transformStyle: 'preserve-3d' }}
                                >
                                  <Icon className="h-8 w-8 text-white relative z-10" />
                                  {/* 3D Shadow */}
                                  <div className="absolute inset-0 bg-black/20 rounded-2xl transform translate-y-1 blur-sm"></div>
                                </motion.div>

                                <h3 className="text-xl font-bold text-white mb-2">
                                  {nicho.nome}
                                </h3>
                                <p className="text-sm text-gray-400 mb-3">
                                  {nicho.descricao}
                                </p>

                                {nicho.disponivel && (
                                  <div className={`text-xs font-semibold ${
                                    isSelected ? 'text-emerald-400' : 'text-gray-500'
                                  }`}>
                                    IA: {nicho.exemploBot}
                                  </div>
                                )}

                                {/* Selection Indicator */}
                                {isSelected && (
                                  <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    className="absolute top-4 right-4"
                                  >
                                    <div className="relative">
                                      <div className="absolute inset-0 bg-blue-400 rounded-full blur-md"></div>
                                      <CheckCircle className="relative h-7 w-7 text-emerald-400" />
                                    </div>
                                  </motion.div>
                                )}

                                {/* Neuron connections animation */}
                                {isHovered && nicho.disponivel && (
                                  <motion.svg
                                    className="absolute inset-0 w-full h-full pointer-events-none"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                  >
                                    <motion.circle
                                      cx="50%"
                                      cy="50%"
                                      r="30"
                                      fill="none"
                                      stroke={nicho.glowColor}
                                      strokeWidth="2"
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 2, opacity: 0 }}
                                      transition={{ duration: 1, repeat: Infinity }}
                                    />
                                  </motion.svg>
                                )}
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Personalização com Holograma */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ type: "spring", stiffness: 100 }}
                    >
                      <div className="mb-8 text-center">
                        <motion.div
                          animate={{ rotateY: 360 }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                          className="inline-block p-4 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-2xl mb-4 backdrop-blur-xl border border-green-500/30"
                          style={{ transformStyle: 'preserve-3d' }}
                        >
                          <Bot className="h-12 w-12 text-teal-400" />
                        </motion.div>
                        <h2 className="text-3xl font-black text-white mb-2">
                          Configure sua IA
                        </h2>
                        <p className="text-gray-400">
                          Personalize a identidade do seu assistente virtual
                        </p>
                      </div>

                      <div className="space-y-6 max-w-2xl mx-auto">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          <label className="block text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-emerald-400" />
                            Nome da Empresa
                          </label>
                          <input
                            type="text"
                            value={setupData.nomeEmpresa}
                            onChange={(e) => setSetupData({ ...setupData, nomeEmpresa: e.target.value })}
                            placeholder="Ex: AutoPeças Premium"
                            className="w-full px-6 py-4 bg-gradient-to-r from-white/[0.05] to-white/[0.02] border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all backdrop-blur-xl text-lg"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <label className="block text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
                            <Bot className="h-4 w-4 text-teal-400" />
                            Nome da IA
                          </label>
                          <input
                            type="text"
                            value={setupData.nomeBot}
                            onChange={(e) => setSetupData({ ...setupData, nomeBot: e.target.value })}
                            placeholder="Ex: Luna, Max, Assistente Virtual..."
                            className="w-full px-6 py-4 bg-gradient-to-r from-white/[0.05] to-white/[0.02] border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all backdrop-blur-xl text-lg"
                          />
                          <p className="text-xs text-gray-500 mt-2 ml-2">
                            Este nome aparecerá nas conversas com seus clientes
                          </p>
                        </motion.div>

                        {/* Live Preview Hologram */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 }}
                          className="relative p-6 bg-gradient-to-br from-emerald-500/10 via-green-500/10 to-teal-500/10 border border-emerald-500/30 rounded-2xl backdrop-blur-xl overflow-hidden"
                        >
                          {/* Animated background */}
                          <motion.div
                            className="absolute inset-0 opacity-20"
                            animate={{
                              background: [
                                'radial-gradient(circle at 0% 0%, #3b82f6 0%, transparent 50%)',
                                'radial-gradient(circle at 100% 100%, #a855f7 0%, transparent 50%)',
                                'radial-gradient(circle at 0% 0%, #3b82f6 0%, transparent 50%)',
                              ]
                            }}
                            transition={{ duration: 5, repeat: Infinity }}
                          />

                          <div className="relative flex items-center gap-4">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                              className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 flex items-center justify-center shadow-2xl"
                            >
                              <Bot className="h-8 w-8 text-white" />
                            </motion.div>
                            <div>
                              <p className="text-sm text-emerald-400 font-bold mb-1 flex items-center gap-2">
                                <Sparkles className="h-4 w-4 animate-pulse" />
                                Preview do Assistente
                              </p>
                              <p className="text-lg text-white font-bold">
                                {setupData.nomeBot || 'Sua IA'} • {setupData.nomeEmpresa || 'Sua Empresa'}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: WhatsApp com Efeito de Ondas */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ type: "spring", stiffness: 100 }}
                    >
                      <div className="mb-8 text-center">
                        <motion.div
                          className="inline-block p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl mb-4 backdrop-blur-xl border border-green-500/30 relative"
                        >
                          <Smartphone className="h-12 w-12 text-green-400" />
                          {/* Signal waves */}
                          {[...Array(3)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute top-0 right-0 h-3 w-3 border-2 border-green-400 rounded-full"
                              animate={{
                                scale: [1, 2, 3],
                                opacity: [1, 0.5, 0]
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.6
                              }}
                            />
                          ))}
                        </motion.div>
                        <h2 className="text-3xl font-black text-white mb-2">
                          Conecte o WhatsApp
                        </h2>
                        <p className="text-gray-400">
                          Configure o número para atendimento automático
                        </p>
                      </div>

                      <div className="max-w-2xl mx-auto space-y-6">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <label className="block text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-green-400" />
                            Número do WhatsApp Business
                          </label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                              <Smartphone className="h-6 w-6 text-gray-500 group-focus-within:text-green-400 transition-colors" />
                            </div>
                            <input
                              type="tel"
                              value={setupData.numeroWhatsApp}
                              onChange={(e) => setSetupData({ ...setupData, numeroWhatsApp: e.target.value.replace(/\D/g, '') })}
                              placeholder="5511999999999"
                              className="w-full pl-16 pr-6 py-4 bg-gradient-to-r from-white/[0.05] to-white/[0.02] border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/50 transition-all backdrop-blur-xl text-lg font-mono"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-2 ml-2">
                            Formato: Código do país + DDD + Número (Ex: 5511999999999)
                          </p>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-6 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 rounded-2xl backdrop-blur-xl"
                        >
                          <div className="flex items-start gap-4">
                            <div className="relative">
                              <MessageSquare className="h-6 w-6 text-yellow-400" />
                              <motion.div
                                className="absolute -top-1 -right-1 h-3 w-3 bg-yellow-400 rounded-full"
                                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              />
                            </div>
                            <div>
                              <p className="text-sm text-yellow-400 font-bold mb-1">
                                Próxima Etapa
                              </p>
                              <p className="text-sm text-gray-300">
                                Após finalizar, você irá escanear um QR Code para vincular seu WhatsApp ao sistema de IA
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: Catálogo com Circuit Board */}
                  {currentStep === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ type: "spring", stiffness: 100 }}
                    >
                      <div className="mb-8 text-center">
                        <motion.div
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="inline-block p-4 bg-gradient-to-br from-teal-500/20 to-green-500/20 rounded-2xl mb-4 backdrop-blur-xl border border-teal-500/30"
                        >
                          <CircuitBoard className="h-12 w-12 text-teal-400" />
                        </motion.div>
                        <h2 className="text-3xl font-black text-white mb-2">
                          Catálogo de Produtos
                        </h2>
                        <p className="text-gray-400">
                          Configure o inventário da sua IA
                        </p>
                      </div>

                      <div className="max-w-3xl mx-auto">
                        <div className="grid grid-cols-2 gap-6">
                          <motion.button
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => setSetupData({ ...setupData, temCatalogo: false })}
                            whileHover={{ scale: 1.03, y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            className="relative group"
                          >
                            <div className={`relative p-8 rounded-2xl border-2 transition-all backdrop-blur-xl ${
                              !setupData.temCatalogo
                                ? 'border-emerald-500/50 bg-gradient-to-br from-emerald-500/20 to-green-500/10'
                                : 'border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] hover:border-white/20'
                            }`}>
                              {!setupData.temCatalogo && (
                                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/50 to-green-500/50 rounded-2xl blur-xl"></div>
                              )}
                              <div className="relative text-center">
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl mb-4 shadow-2xl"
                                >
                                  <Zap className="h-8 w-8 text-white" />
                                </motion.div>
                                <p className="text-white font-bold text-lg mb-2">Começar do Zero</p>
                                <p className="text-xs text-gray-400">Adicionar produtos manualmente depois</p>
                              </div>
                            </div>
                          </motion.button>

                          <motion.button
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => setSetupData({ ...setupData, temCatalogo: true })}
                            whileHover={{ scale: 1.03, y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            className="relative group"
                          >
                            <div className={`relative p-8 rounded-2xl border-2 transition-all backdrop-blur-xl ${
                              setupData.temCatalogo
                                ? 'border-green-500/50 bg-gradient-to-br from-green-500/20 to-teal-500/10'
                                : 'border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] hover:border-white/20'
                            }`}>
                              {setupData.temCatalogo && (
                                <div className="absolute -inset-1 bg-gradient-to-r from-green-500/50 to-teal-500/50 rounded-2xl blur-xl"></div>
                              )}
                              <div className="relative text-center">
                                <motion.div
                                  animate={{ rotate: -360 }}
                                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl mb-4 shadow-2xl"
                                >
                                  <Settings className="h-8 w-8 text-white" />
                                </motion.div>
                                <p className="text-white font-bold text-lg mb-2">Importar Catálogo</p>
                                <p className="text-xs text-gray-400">Upload de planilha Excel/CSV</p>
                              </div>
                            </div>
                          </motion.button>
                        </div>

                        {setupData.temCatalogo && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-6 p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-green-500/30 rounded-2xl backdrop-blur-xl text-center"
                          >
                            <Settings className="h-12 w-12 text-teal-400 mx-auto mb-3" />
                            <p className="text-sm text-gray-300 mb-2 font-semibold">
                              Importação disponível no dashboard
                            </p>
                            <p className="text-xs text-gray-500">
                              Configure após a ativação do sistema
                            </p>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 5: Review com Holographic Display */}
                  {currentStep === 5 && (
                    <motion.div
                      key="step5"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ type: "spring", stiffness: 100 }}
                    >
                      <div className="mb-8 text-center">
                        <motion.div
                          animate={{
                            rotateY: [0, 180, 360],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ duration: 4, repeat: Infinity }}
                          className="inline-block p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl mb-4 backdrop-blur-xl border border-green-500/30"
                          style={{ transformStyle: 'preserve-3d' }}
                        >
                          <CheckCircle className="h-12 w-12 text-green-400" />
                        </motion.div>
                        <h2 className="text-3xl font-black text-white mb-2">
                          Confirme as Configurações
                        </h2>
                        <p className="text-gray-400">
                          Revise antes de ativar sua IA
                        </p>
                      </div>

                      <div className="max-w-2xl mx-auto space-y-4">
                        {[
                          { label: 'Segmento', value: nichos.find(n => n.id === setupData.nicho)?.nome, icon: Network, color: 'blue' },
                          { label: 'Empresa', value: setupData.nomeEmpresa, icon: Briefcase, color: 'purple' },
                          { label: 'Nome da IA', value: setupData.nomeBot, icon: Bot, color: 'pink' },
                          { label: 'WhatsApp', value: `+${setupData.numeroWhatsApp}`, icon: Smartphone, color: 'green' },
                        ].map((item, index) => {
                          const Icon = item.icon;
                          return (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="relative group"
                            >
                              <div className="relative p-6 bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-xl hover:border-white/20 transition-all">
                                <div className="flex items-center gap-4">
                                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 flex items-center justify-center shadow-lg`}>
                                    <Icon className="h-6 w-6 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm text-gray-400 mb-1">{item.label}</p>
                                    <p className="text-white font-bold text-lg">{item.value}</p>
                                  </div>
                                  <CheckCircle className={`h-6 w-6 text-${item.color}-400`} />
                                </div>
                              </div>
                              {/* Shine effect on hover */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 rounded-2xl"></div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons with Futuristic Design */}
            {!setupComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between mt-10 pt-8 border-t border-white/10"
              >
                <motion.button
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  whileHover={currentStep !== 1 ? { scale: 1.05, x: -5 } : {}}
                  whileTap={currentStep !== 1 ? { scale: 0.95 } : {}}
                  className="group relative inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-white/[0.05] to-white/[0.02] border border-white/10 rounded-xl text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all backdrop-blur-xl"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="font-semibold">Voltar</span>
                </motion.button>

                {currentStep < totalSteps ? (
                  <motion.button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    whileHover={canProceed() ? { scale: 1.05, x: 5 } : {}}
                    whileTap={canProceed() ? { scale: 0.95 } : {}}
                    className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-700 hover:via-green-700 hover:to-teal-700 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-2xl overflow-hidden"
                  >
                    {/* Animated gradient overlay */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                    <span className="relative z-10">Próximo</span>
                    <ArrowRight className="h-5 w-5 relative z-10" />
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={handleFinishSetup}
                    disabled={loading || !canProceed()}
                    whileHover={!loading && canProceed() ? { scale: 1.05 } : {}}
                    whileTap={!loading && canProceed() ? { scale: 0.95 } : {}}
                    className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-700 hover:via-green-700 hover:to-teal-700 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-2xl overflow-hidden"
                  >
                    {/* Pulse effect */}
                    {!loading && (
                      <motion.div
                        className="absolute inset-0 bg-white/20"
                        animate={{ scale: [1, 1.5, 1.5], opacity: [0.5, 0, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin relative z-10" />
                        <span className="relative z-10">Ativando Sistema...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="h-5 w-5 relative z-10" />
                        <span className="relative z-10">Ativar IA Agora</span>
                      </>
                    )}
                  </motion.button>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Setup;

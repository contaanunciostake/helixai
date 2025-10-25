import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Award, TrendingUp, DollarSign, Users, Gift, Zap,
  CheckCircle, Star, ArrowRight, BarChart3, Share2,
  Target, Rocket, Crown
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function AfiliadosLanding() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    como_divulgar: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Redirecionar para página de registro do Painel de Afiliados
    window.location.href = 'http://localhost:5178/registro?nome=' + encodeURIComponent(formData.nome) + '&email=' + encodeURIComponent(formData.email) + '&telefone=' + encodeURIComponent(formData.telefone)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        {/* Stars */}
        {Array.from({ length: 100 }).map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute bg-white rounded-full"
            style={{
              width: `${Math.random() * 3}px`,
              height: `${Math.random() * 3}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3
            }}
          />
        ))}

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-cyan-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <nav className="fixed top-0 w-full bg-black/30 backdrop-blur-2xl border-b border-green-500/30 z-50">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center space-x-4">
                <img src="/AIra_Logotipo.png" alt="AIRA Logo" className="h-12" />
                <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1.5 rounded-full border border-green-500/50">
                  Programa de Afiliados
                </span>
              </div>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2.5 text-gray-300 hover:text-white transition-all"
              >
                ← Voltar
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full px-6 py-2 mb-6">
                <Crown className="h-5 w-5 text-green-400" />
                <span className="text-green-400 font-semibold">Seja um Parceiro AIRA</span>
              </div>

              {/* Title */}
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Ganhe Até 30%
                </span>
                <br />
                <span className="text-white">de Comissão</span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Indique clientes para a AIRA e receba <span className="text-green-400 font-bold">comissões recorrentes vitalícias</span>
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mb-12">
                <div>
                  <p className="text-4xl font-bold text-green-400 mb-2">30%</p>
                  <p className="text-sm text-gray-400">1ª Venda</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-green-400 mb-2">20%</p>
                  <p className="text-sm text-gray-400">Recorrente</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-green-400 mb-2">R$ 500</p>
                  <p className="text-sm text-gray-400">Bônus Meta</p>
                </div>
              </div>

              {/* CTA */}
              <motion.a
                href="#cadastro"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-bold text-lg shadow-2xl shadow-green-500/50 hover:shadow-green-500/70 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Quero Ser Afiliado
                <ArrowRight className="h-5 w-5" />
              </motion.a>
            </motion.div>
          </div>
        </section>

        {/* Benefícios */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Por Que Ser Afiliado AIRA?
              </h2>
              <p className="text-xl text-gray-400">
                Os melhores benefícios do mercado
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: DollarSign,
                  title: 'Comissões Altas',
                  description: '30% na primeira venda + 20% recorrente vitalício enquanto o cliente mantiver a assinatura'
                },
                {
                  icon: Rocket,
                  title: 'Saques Rápidos',
                  description: 'Saque via PIX instantâneo a partir de R$ 50,00 em comissões aprovadas'
                },
                {
                  icon: BarChart3,
                  title: 'Dashboard Completo',
                  description: 'Acompanhe clicks, conversões, comissões e ganhos em tempo real'
                },
                {
                  icon: Gift,
                  title: 'Bônus por Meta',
                  description: 'R$ 100 (5 vendas) | R$ 250 (10 vendas) | R$ 500 (20 vendas) por mês'
                },
                {
                  icon: Share2,
                  title: 'Link Personalizado',
                  description: 'Receba um link exclusivo para compartilhar e rastrear suas indicações'
                },
                {
                  icon: Target,
                  title: 'Cookie de 30 Dias',
                  description: 'Qualquer compra feita em até 30 dias após o clique no seu link gera comissão'
                }
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:border-green-500/50 transition-all group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-green-500/20 mb-4 group-hover:bg-green-500/30 transition-colors">
                      <benefit.icon className="h-7 w-7 text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
                    <p className="text-gray-400">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Como Funciona */}
        <section className="py-20 px-6 bg-white/5">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Como Funciona?
              </h2>
              <p className="text-xl text-gray-400">
                Simples e rápido em 4 passos
              </p>
            </motion.div>

            <div className="space-y-6">
              {[
                {
                  step: '01',
                  title: 'Cadastre-se Gratuitamente',
                  description: 'Preencha o formulário abaixo com seus dados e informações bancárias para receber as comissões'
                },
                {
                  step: '02',
                  title: 'Receba Seu Link',
                  description: 'Assim que aprovado, você receberá um link exclusivo de afiliado para compartilhar'
                },
                {
                  step: '03',
                  title: 'Divulgue e Indique',
                  description: 'Compartilhe nas redes sociais, blog, email ou onde preferir. Cada clique é rastreado por 30 dias'
                },
                {
                  step: '04',
                  title: 'Ganhe Comissões',
                  description: 'Receba 30% na primeira venda + 20% recorrente todo mês enquanto o cliente permanecer ativo'
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="flex items-start gap-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
                >
                  <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center font-bold text-2xl">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-gray-400">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Calculadora de Ganhos */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Quanto Você Pode Ganhar?
              </h2>
              <p className="text-xl text-gray-400">
                Veja o potencial de ganhos com o programa de afiliados
              </p>
            </motion.div>

            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-8">
              <div className="space-y-6">
                {[
                  { vendas: 5, comissao_mes: 2985, recorrente: 1990, total_ano: 27895 },
                  { vendas: 10, comissao_mes: 5970, recorrente: 3980, total_ano: 57540, bonus: 250 },
                  { vendas: 20, comissao_mes: 11940, recorrente: 7960, total_ano: 116580, bonus: 500 }
                ].map((calc, index) => (
                  <div key={index} className="bg-black/40 rounded-xl p-6 border border-green-500/20">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-2xl font-bold text-white">{calc.vendas} vendas/mês</h3>
                      {calc.bonus && (
                        <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-semibold border border-yellow-500/30">
                          + Bônus R$ {calc.bonus}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-gray-400 text-sm mb-1">1º Mês</p>
                        <p className="text-2xl font-bold text-green-400">
                          R$ {calc.comissao_mes.toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm mb-1">Recorrente/mês</p>
                        <p className="text-2xl font-bold text-green-400">
                          R$ {calc.recorrente.toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm mb-1">Potencial/ano</p>
                        <p className="text-2xl font-bold text-green-400">
                          R$ {calc.total_ano.toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-6 text-center">
                *Valores calculados com base no plano Professional (R$ 997/mês)
              </p>
            </div>
          </div>
        </section>

        {/* Formulário de Cadastro */}
        <section id="cadastro" className="py-20 px-6 bg-white/5">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 mb-6">
                <Award className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Comece Agora
              </h2>
              <p className="text-xl text-gray-400">
                Preencha o formulário e comece a ganhar comissões
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Como pretende divulgar?
                </label>
                <select
                  name="como_divulgar"
                  value={formData.como_divulgar}
                  onChange={handleChange}
                  className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors"
                  required
                >
                  <option value="">Selecione uma opção</option>
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="youtube">YouTube</option>
                  <option value="blog">Blog/Site</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email Marketing</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-bold text-lg shadow-2xl shadow-green-500/50 hover:shadow-green-500/70 transition-all hover:scale-[1.02]"
              >
                Quero Me Cadastrar Agora
              </button>

              <p className="text-xs text-gray-400 text-center">
                Ao se cadastrar, você concorda com nossos termos de uso e política de privacidade
              </p>
            </form>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-white mb-12">
              Perguntas Frequentes
            </h2>

            <div className="space-y-4">
              {[
                {
                  q: 'Quanto tempo leva para ser aprovado?',
                  a: 'Normalmente aprovamos novos afiliados em até 24 horas úteis.'
                },
                {
                  q: 'Qual o valor mínimo para saque?',
                  a: 'O valor mínimo para solicitar saque é de R$ 50,00.'
                },
                {
                  q: 'Como recebo os pagamentos?',
                  a: 'Os pagamentos são feitos via PIX instantâneo após aprovação do saque.'
                },
                {
                  q: 'Por quanto tempo recebo as comissões recorrentes?',
                  a: 'Você recebe 20% de comissão recorrente vitalícia enquanto o cliente mantiver a assinatura ativa.'
                },
                {
                  q: 'Posso indicar quantos clientes quiser?',
                  a: 'Sim! Não há limite de indicações. Quanto mais você indica, mais ganha.'
                }
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-6"
                >
                  <h3 className="text-lg font-bold text-white mb-2 flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    {faq.q}
                  </h3>
                  <p className="text-gray-400 ml-7">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-3xl p-12"
            >
              <Award className="h-16 w-16 text-green-400 mx-auto mb-6" />
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Pronto para Começar?
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Junte-se aos nossos afiliados e comece a ganhar comissões hoje mesmo
              </p>
              <motion.a
                href="#cadastro"
                className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-bold text-xl shadow-2xl shadow-green-500/50 hover:shadow-green-500/70 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cadastrar Agora
                <Rocket className="h-6 w-6" />
              </motion.a>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 py-8 px-6">
          <div className="max-w-6xl mx-auto text-center text-gray-400 text-sm">
            <p>© 2025 AIRA - Todos os direitos reservados</p>
            <p className="mt-2">
              Dúvidas? <a href="mailto:afiliados@aira.com.br" className="text-green-400 hover:text-green-300">afiliados@aira.com.br</a>
            </p>
          </div>
        </footer>
      </div>

      {/* Animação de Blob */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 20s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}

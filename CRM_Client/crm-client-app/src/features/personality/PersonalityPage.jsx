/**
 * ═══════════════════════════════════════════════════════════════
 * PÁGINA: PERSONALIDADE DO BOT
 * Configuração de tom de voz e personalidade com preview
 * ═══════════════════════════════════════════════════════════════
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Bot, MessageSquare, Save, RotateCcw, Sparkles, Smile } from 'lucide-react'

export default function PersonalityPage({ user, showNotification }) {
  const [config, setConfig] = useState({
    nome: 'VendeBot',
    avatar: '🤖',
    formalidade: 50, // 0 = muito casual, 100 = muito formal
    entusiasmo: 70, // 0 = neutro, 100 = muito entusiasmado
    objetividade: 60, // 0 = mais detalhado, 100 = muito objetivo
    empatia: 80, // 0 = direto, 100 = muito empático
    humor: 30, // 0 = sério, 100 = descontraído
    proatividade: 75, // 0 = reativo, 100 = muito proativo
  })

  const [tempConfig, setTempConfig] = useState(config)

  // Exemplos de conversas baseados na configuração
  const getExemploSaudacao = () => {
    const { formalidade, entusiasmo, empatia } = tempConfig

    if (formalidade > 70 && entusiasmo < 40) {
      return `Bom dia. Sou o ${tempConfig.nome}, assistente virtual da ${user?.empresa_nome}. Como posso auxiliá-lo?`
    }

    if (formalidade < 30 && entusiasmo > 60) {
      return `Opa! ${tempConfig.avatar} Tudo bem? Eu sou o ${tempConfig.nome}! Tô aqui pra te ajudar a encontrar o veículo perfeito! Bora lá?`
    }

    if (empatia > 70 && entusiasmo > 50) {
      return `Olá! ${tempConfig.avatar} Que bom ter você aqui! Sou o ${tempConfig.nome} e vou te ajudar a encontrar exatamente o que você precisa. Como posso te auxiliar hoje?`
    }

    return `Olá! Sou o ${tempConfig.nome} da ${user?.empresa_nome}. Prazer em conhecê-lo! Em que posso te ajudar hoje?`
  }

  const getExemploApresentacao = () => {
    const { objetividade, entusiasmo, proatividade } = tempConfig

    if (objetividade > 70) {
      return `🚗 Corolla XEI 2023\n\nPreço: R$ 145.900\nKm: 15.000\nCor: Prata\n\nDisponível para test drive.`
    }

    if (entusiasmo > 70 && proatividade > 70) {
      return `Olha só que achado incrível! 😍\n\n🚗 Corolla XEI 2023 - Praticamente zero!\n\n💰 R$ 145.900\n📏 Apenas 15.000 km rodados\n✨ Cor prata, lindo demais!\n\nE aí, que tal agendar um test drive agora mesmo? Tenho horários disponíveis hoje à tarde!`
    }

    return `Tenho uma ótima opção para você!\n\n🚗 Toyota Corolla XEI 2023\n💰 R$ 145.900\n📏 15.000 km\n🎨 Cor Prata\n\nVeículo em excelente estado, revisado e pronto para test drive. Gostaria de agendar uma visita?`
  }

  const getExemploNegociacao = () => {
    const { empatia, objetividade, formalidade } = tempConfig

    if (empatia > 70 && objetividade < 40) {
      return `Entendo perfeitamente sua situação! Sei que é um investimento importante e quero te ajudar a fazer a melhor escolha.\n\nVamos encontrar a melhor forma de pagamento para você. Posso apresentar algumas opções de financiamento com parcelas que cabem no seu bolso. O que acha?`
    }

    if (objetividade > 70) {
      return `Valores:\n- À vista: R$ 145.900\n- Entrada: R$ 30.000\n- Parcelas: 48x de R$ 3.200\n\nAceita proposta de troca.`
    }

    return `Temos opções flexíveis de pagamento:\n\n💵 À vista: R$ 145.900\n📊 Financiamento: Entrada de R$ 30.000 + 48x de R$ 3.200\n🚗 Aceitamos seu usado na troca!\n\nQual opção se encaixa melhor para você?`
  }

  const saveConfig = () => {
    setConfig(tempConfig)
    showNotification?.('Personalidade salva com sucesso!')
  }

  const resetConfig = () => {
    setTempConfig(config)
    showNotification?.('Alterações descartadas')
  }

  const aplicarPreset = (preset) => {
    const presets = {
      profissional: {
        ...tempConfig,
        formalidade: 80,
        entusiasmo: 40,
        objetividade: 70,
        empatia: 60,
        humor: 20,
        proatividade: 50,
      },
      amigavel: {
        ...tempConfig,
        formalidade: 30,
        entusiasmo: 80,
        objetividade: 40,
        empatia: 90,
        humor: 70,
        proatividade: 80,
      },
      direto: {
        ...tempConfig,
        formalidade: 50,
        entusiasmo: 30,
        objetividade: 90,
        empatia: 40,
        humor: 10,
        proatividade: 60,
      },
    }

    setTempConfig(presets[preset])
    showNotification?.(`Preset "${preset}" aplicado!`)
  }

  return (
    <div className="min-h-screen bg-black p-6 space-y-6 relative">
      {/* Stars Background */}
      {Array.from({ length: 100 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full pointer-events-none"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite ${Math.random() * 3}s`
          }}
        />
      ))}

      {/* Header com identidade visual do Dashboard */}
      <div className="relative overflow-hidden rounded-2xl card-glass">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
        <div className="relative p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                <Smile className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Personalidade do Bot
                </h1>
                <p className="text-white/60 mt-1 text-sm">Configure o tom de voz e comportamento do assistente</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={resetConfig} variant="outline" className="border-white/20 text-white/70 hover:bg-white/5">
                <RotateCcw className="h-4 w-4 mr-2" />
                Descartar
              </Button>
              <Button
                onClick={saveConfig}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/30"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações */}
        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card className="relative overflow-hidden rounded-2xl card-glass border-white/10">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
            <CardHeader className="relative">
              <CardTitle className="text-white">Informações Básicas</CardTitle>
              <CardDescription className="text-white/60">Nome e avatar do bot</CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <div>
                <Label htmlFor="nome" className="text-white">Nome do Bot</Label>
                <Input
                  id="nome"
                  value={tempConfig.nome}
                  onChange={(e) => setTempConfig({ ...tempConfig, nome: e.target.value })}
                  className="mt-2 bg-black/30 border-white/10 text-white placeholder:text-white/40"
                />
              </div>

              <div>
                <Label htmlFor="avatar" className="text-white">Emoji/Avatar</Label>
                <Input
                  id="avatar"
                  value={tempConfig.avatar}
                  onChange={(e) => setTempConfig({ ...tempConfig, avatar: e.target.value })}
                  className="mt-2 bg-black/30 border-white/10 text-white text-2xl text-center placeholder:text-white/40"
                  maxLength={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Presets Rápidos */}
          <Card className="relative overflow-hidden rounded-2xl card-glass border-white/10">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
            <CardHeader className="relative">
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                Presets Rápidos
              </CardTitle>
              <CardDescription className="text-white/60">Aplique configurações predefinidas</CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-3">
              <Button
                onClick={() => aplicarPreset('profissional')}
                variant="outline"
                className="w-full border-blue-600 text-blue-400 hover:bg-blue-900/20"
              >
                🎩 Profissional & Formal
              </Button>
              <Button
                onClick={() => aplicarPreset('amigavel')}
                variant="outline"
                className="w-full border-green-600 text-green-400 hover:bg-green-900/20"
              >
                😊 Amigável & Descontraído
              </Button>
              <Button
                onClick={() => aplicarPreset('direto')}
                variant="outline"
                className="w-full border-purple-600 text-purple-400 hover:bg-purple-900/20"
              >
                🎯 Direto & Objetivo
              </Button>
            </CardContent>
          </Card>

          {/* Sliders de Personalidade */}
          <Card className="relative overflow-hidden rounded-2xl card-glass border-white/10">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
            <CardHeader className="relative">
              <CardTitle className="text-white">Tom de Voz</CardTitle>
              <CardDescription className="text-white/60">Ajuste as características da personalidade</CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-6">
              {/* Formalidade */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-white">Formalidade</Label>
                  <Badge variant="outline" className="text-blue-400">{tempConfig.formalidade}%</Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-white/50">
                  <span>Casual</span>
                  <Slider
                    value={[tempConfig.formalidade]}
                    onValueChange={([value]) => setTempConfig({ ...tempConfig, formalidade: value })}
                    max={100}
                    step={5}
                    className="flex-1"
                  />
                  <span>Formal</span>
                </div>
              </div>

              {/* Entusiasmo */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-white">Entusiasmo</Label>
                  <Badge variant="outline" className="text-green-400">{tempConfig.entusiasmo}%</Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-white/50">
                  <span>Neutro</span>
                  <Slider
                    value={[tempConfig.entusiasmo]}
                    onValueChange={([value]) => setTempConfig({ ...tempConfig, entusiasmo: value })}
                    max={100}
                    step={5}
                    className="flex-1"
                  />
                  <span>Animado</span>
                </div>
              </div>

              {/* Objetividade */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-white">Objetividade</Label>
                  <Badge variant="outline" className="text-purple-400">{tempConfig.objetividade}%</Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-white/50">
                  <span>Detalhado</span>
                  <Slider
                    value={[tempConfig.objetividade]}
                    onValueChange={([value]) => setTempConfig({ ...tempConfig, objetividade: value })}
                    max={100}
                    step={5}
                    className="flex-1"
                  />
                  <span>Objetivo</span>
                </div>
              </div>

              {/* Empatia */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-white">Empatia</Label>
                  <Badge variant="outline" className="text-pink-400">{tempConfig.empatia}%</Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-white/50">
                  <span>Direto</span>
                  <Slider
                    value={[tempConfig.empatia]}
                    onValueChange={([value]) => setTempConfig({ ...tempConfig, empatia: value })}
                    max={100}
                    step={5}
                    className="flex-1"
                  />
                  <span>Empático</span>
                </div>
              </div>

              {/* Humor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-white">Humor</Label>
                  <Badge variant="outline" className="text-yellow-400">{tempConfig.humor}%</Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-white/50">
                  <span>Sério</span>
                  <Slider
                    value={[tempConfig.humor]}
                    onValueChange={([value]) => setTempConfig({ ...tempConfig, humor: value })}
                    max={100}
                    step={5}
                    className="flex-1"
                  />
                  <span>Descontraído</span>
                </div>
              </div>

              {/* Proatividade */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-white">Proatividade</Label>
                  <Badge variant="outline" className="text-orange-400">{tempConfig.proatividade}%</Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-white/50">
                  <span>Reativo</span>
                  <Slider
                    value={[tempConfig.proatividade]}
                    onValueChange={([value]) => setTempConfig({ ...tempConfig, proatividade: value })}
                    max={100}
                    step={5}
                    className="flex-1"
                  />
                  <span>Proativo</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview ao Vivo */}
        <div className="space-y-6 relative z-10">
          <Card className="relative overflow-hidden rounded-2xl card-glass border-white/10">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
            <CardHeader className="relative">
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-500" />
                Preview ao Vivo
              </CardTitle>
              <CardDescription className="text-white/60">Veja como o bot se comporta</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <Tabs defaultValue="saudacao">
                <TabsList className="grid w-full grid-cols-3 bg-black/30 border border-white/10">
                  <TabsTrigger value="saudacao">Saudação</TabsTrigger>
                  <TabsTrigger value="apresentacao">Apresentação</TabsTrigger>
                  <TabsTrigger value="negociacao">Negociação</TabsTrigger>
                </TabsList>

                <TabsContent value="saudacao" className="mt-4">
                  <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-4xl">{tempConfig.avatar}</div>
                      <div className="flex-1 bg-[#0f172a] rounded-lg p-4">
                        <div className="text-xs text-gray-400 mb-2">{tempConfig.nome}</div>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">
                          {getExemploSaudacao()}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="apresentacao" className="mt-4">
                  <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-4xl">{tempConfig.avatar}</div>
                      <div className="flex-1 bg-[#0f172a] rounded-lg p-4">
                        <div className="text-xs text-gray-400 mb-2">{tempConfig.nome}</div>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">
                          {getExemploApresentacao()}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="negociacao" className="mt-4">
                  <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-4xl">{tempConfig.avatar}</div>
                      <div className="flex-1 bg-[#0f172a] rounded-lg p-4">
                        <div className="text-xs text-gray-400 mb-2">{tempConfig.nome}</div>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">
                          {getExemploNegociacao()}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Análise da Configuração */}
          <Card className="relative overflow-hidden rounded-2xl card-glass border-white/10">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
            <CardHeader className="relative">
              <CardTitle className="text-white">Análise da Configuração</CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-3 text-sm">
              <div className="flex items-center justify-between p-3 bg-black/20 border border-white/10 rounded-lg">
                <span className="text-white/70">Tom Geral</span>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {tempConfig.formalidade > 60 ? 'Formal' : tempConfig.formalidade < 40 ? 'Casual' : 'Neutro'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-black/20 border border-white/10 rounded-lg">
                <span className="text-white/70">Energia</span>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  {tempConfig.entusiasmo > 60 ? 'Alta' : tempConfig.entusiasmo < 40 ? 'Baixa' : 'Média'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-black/20 border border-white/10 rounded-lg">
                <span className="text-white/70">Estilo de Comunicação</span>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                  {tempConfig.objetividade > 60 ? 'Objetivo' : 'Detalhado'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-black/20 border border-white/10 rounded-lg">
                <span className="text-white/70">Abordagem</span>
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                  {tempConfig.proatividade > 60 ? 'Proativa' : 'Reativa'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

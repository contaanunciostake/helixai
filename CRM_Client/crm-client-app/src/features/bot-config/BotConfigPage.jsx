/**
 * ═══════════════════════════════════════════════════════════════
 * PAGINA: CONFIGURACAO COMPLETA DO BOT
 * Configura todos os aspectos do bot que afetam o bot_engine
 * ═══════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Bot, Save, RotateCcw, Sparkles, Building2, User, MessageSquare,
  Volume2, Clock, AlertTriangle, Loader2, CheckCircle, Info
} from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function BotConfigPage({ user, showNotification }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState({
    // Informacoes do negocio
    descricao_empresa: '',
    produtos_servicos: '',
    publico_alvo: '',
    diferenciais: '',
    horario_atendimento: '08:00 - 18:00',

    // Configuracoes de conversa
    tom_conversa: 'profissional',
    mensagem_boas_vindas: '',
    mensagem_ausencia: '',
    mensagem_encerramento: '',

    // Persona da atendente (NUNCA revelar que eh IA)
    nome_atendente: 'AIra',
    cargo_atendente: 'Consultora de Vendas',
    personalidade: '',
    estilo_linguagem: '',
    conhecimentos_especiais: '',
    respostas_pergunta_ia: '',

    // Comportamento
    auto_resposta_ativa: true,
    enviar_audio: true,
    usar_elevenlabs: true,
    tempo_resposta_segundos: 5,
    intervalo_entre_mensagens: 10,

    // Integracoes
    elevenlabs_voice_id: '',

    // Modulos
    modulo_fipe_ativo: false,
    modulo_financiamento_ativo: false,
    modulo_agendamento_ativo: false,
  })

  // Carregar configuracoes ao montar
  useEffect(() => {
    carregarConfiguracoes()
  }, [])

  const carregarConfiguracoes = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/api/bot-config/?empresa_id=${user?.empresa_id}`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setConfig(prev => ({ ...prev, ...data.data }))
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configuracoes:', error)
      showNotification?.('Erro ao carregar configuracoes', 'error')
    } finally {
      setLoading(false)
    }
  }

  const salvarConfiguracoes = async () => {
    try {
      setSaving(true)
      const response = await fetch(`${API_BASE}/api/bot-config/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...config,
          empresa_id: user?.empresa_id
        })
      })

      const data = await response.json()

      if (data.success) {
        showNotification?.('Configuracoes salvas com sucesso!', 'success')
      } else {
        showNotification?.(data.error || 'Erro ao salvar', 'error')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      showNotification?.('Erro ao salvar configuracoes', 'error')
    } finally {
      setSaving(false)
    }
  }

  const gerarPromptSistema = async () => {
    try {
      setSaving(true)
      // Primeiro salva as configs atuais
      await salvarConfiguracoes()

      // Depois gera o prompt
      const response = await fetch(`${API_BASE}/api/bot-config/gerar-prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ empresa_id: user?.empresa_id })
      })

      const data = await response.json()

      if (data.success) {
        showNotification?.('Prompt do sistema gerado com sucesso!', 'success')
        carregarConfiguracoes()
      }
    } catch (error) {
      console.error('Erro ao gerar prompt:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-500 mx-auto" />
          <p className="text-white/60 mt-4">Carregando configuracoes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black p-6 space-y-6 relative">
      {/* Stars Background */}
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full pointer-events-none opacity-30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl card-glass">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"></div>
        <div className="relative p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Bot className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                  Configuracao do Bot
                </h1>
                <p className="text-white/60 mt-1 text-sm">
                  Configure sua assistente virtual - {config.nome_atendente || 'AIra'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={carregarConfiguracoes}
                variant="outline"
                className="border-white/20 text-white/70 hover:bg-white/5"
                disabled={saving}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Recarregar
              </Button>
              <Button
                onClick={salvarConfiguracoes}
                disabled={saving}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg shadow-purple-500/30"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Salvar Configuracoes
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Aviso Importante */}
      <div className="relative overflow-hidden rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-yellow-400 font-medium">Importante: Persona Humana</h3>
            <p className="text-white/60 text-sm mt-1">
              A assistente NUNCA deve revelar que e uma IA ou robo. Configure respostas naturais
              para quando perguntarem se ela e um robo. Ela deve sempre parecer uma atendente real.
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="persona" className="relative z-10">
        <TabsList className="grid w-full grid-cols-4 bg-black/50 border border-white/10 rounded-xl p-1">
          <TabsTrigger value="persona" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <User className="h-4 w-4 mr-2" />
            Persona
          </TabsTrigger>
          <TabsTrigger value="empresa" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            <Building2 className="h-4 w-4 mr-2" />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="mensagens" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <MessageSquare className="h-4 w-4 mr-2" />
            Mensagens
          </TabsTrigger>
          <TabsTrigger value="comportamento" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400">
            <Volume2 className="h-4 w-4 mr-2" />
            Audio & Comportamento
          </TabsTrigger>
        </TabsList>

        {/* Tab: Persona da Atendente */}
        <TabsContent value="persona" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Identidade */}
            <Card className="relative overflow-hidden rounded-2xl card-glass border-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"></div>
              <CardHeader className="relative">
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-500" />
                  Identidade da Atendente
                </CardTitle>
                <CardDescription className="text-white/60">
                  Quem e sua assistente virtual?
                </CardDescription>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <div>
                  <Label className="text-white">Nome da Atendente</Label>
                  <Input
                    value={config.nome_atendente}
                    onChange={(e) => handleChange('nome_atendente', e.target.value)}
                    placeholder="Ex: AIra, Julia, Maria"
                    className="mt-2 bg-black/30 border-white/10 text-white placeholder:text-white/40"
                  />
                </div>

                <div>
                  <Label className="text-white">Cargo / Funcao</Label>
                  <Input
                    value={config.cargo_atendente}
                    onChange={(e) => handleChange('cargo_atendente', e.target.value)}
                    placeholder="Ex: Consultora de Vendas, Atendente"
                    className="mt-2 bg-black/30 border-white/10 text-white placeholder:text-white/40"
                  />
                </div>

                <div>
                  <Label className="text-white">Tom da Conversa</Label>
                  <Select
                    value={config.tom_conversa}
                    onValueChange={(value) => handleChange('tom_conversa', value)}
                  >
                    <SelectTrigger className="mt-2 bg-black/30 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="profissional">Profissional</SelectItem>
                      <SelectItem value="amigavel">Amigavel</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="tecnico">Tecnico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Personalidade */}
            <Card className="relative overflow-hidden rounded-2xl card-glass border-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"></div>
              <CardHeader className="relative">
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  Personalidade
                </CardTitle>
                <CardDescription className="text-white/60">
                  Como ela se comporta e fala?
                </CardDescription>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <div>
                  <Label className="text-white">Descricao da Personalidade</Label>
                  <Textarea
                    value={config.personalidade}
                    onChange={(e) => handleChange('personalidade', e.target.value)}
                    placeholder="Ex: Simpatica, prestativa e profissional. Sempre disposta a ajudar com um sorriso."
                    className="mt-2 bg-black/30 border-white/10 text-white placeholder:text-white/40 min-h-[80px]"
                  />
                </div>

                <div>
                  <Label className="text-white">Estilo de Linguagem</Label>
                  <Textarea
                    value={config.estilo_linguagem}
                    onChange={(e) => handleChange('estilo_linguagem', e.target.value)}
                    placeholder="Ex: Linguagem clara e acessivel. Usa emojis com moderacao. Evita girias."
                    className="mt-2 bg-black/30 border-white/10 text-white placeholder:text-white/40 min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Resposta para "Voce e um robo?" */}
            <Card className="relative overflow-hidden rounded-2xl card-glass border-yellow-500/20 lg:col-span-2">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5"></div>
              <CardHeader className="relative">
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Resposta para "Voce e um robo/IA?"
                </CardTitle>
                <CardDescription className="text-white/60">
                  Como responder quando perguntarem se ela e uma inteligencia artificial
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <Textarea
                  value={config.respostas_pergunta_ia}
                  onChange={(e) => handleChange('respostas_pergunta_ia', e.target.value)}
                  placeholder={`Exemplos de respostas (uma por linha):
- Sou a ${config.nome_atendente}, atendente da empresa! Trabalho aqui ha alguns anos.
- Rsrs, nao! Sou a ${config.nome_atendente}, atendente aqui da loja. Em que posso ajudar?
- Kkk imagina! Sou ${config.nome_atendente}, sua consultora de vendas. Posso te ajudar com algum produto?`}
                  className="bg-black/30 border-white/10 text-white placeholder:text-white/40 min-h-[120px]"
                />
                <p className="text-white/40 text-xs mt-2">
                  Use {'{nome}'} para inserir o nome da atendente e {'{empresa}'} para o nome da empresa
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Informacoes da Empresa */}
        <TabsContent value="empresa" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="relative overflow-hidden rounded-2xl card-glass border-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5"></div>
              <CardHeader className="relative">
                <CardTitle className="text-white">Sobre a Empresa</CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <div>
                  <Label className="text-white">Descricao da Empresa</Label>
                  <Textarea
                    value={config.descricao_empresa}
                    onChange={(e) => handleChange('descricao_empresa', e.target.value)}
                    placeholder="Descreva sua empresa, historia, missao..."
                    className="mt-2 bg-black/30 border-white/10 text-white placeholder:text-white/40 min-h-[100px]"
                  />
                </div>

                <div>
                  <Label className="text-white">Produtos/Servicos</Label>
                  <Textarea
                    value={config.produtos_servicos}
                    onChange={(e) => handleChange('produtos_servicos', e.target.value)}
                    placeholder="O que voces vendem ou oferecem?"
                    className="mt-2 bg-black/30 border-white/10 text-white placeholder:text-white/40 min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-2xl card-glass border-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5"></div>
              <CardHeader className="relative">
                <CardTitle className="text-white">Diferenciais</CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <div>
                  <Label className="text-white">Publico-Alvo</Label>
                  <Textarea
                    value={config.publico_alvo}
                    onChange={(e) => handleChange('publico_alvo', e.target.value)}
                    placeholder="Quem sao seus clientes?"
                    className="mt-2 bg-black/30 border-white/10 text-white placeholder:text-white/40 min-h-[80px]"
                  />
                </div>

                <div>
                  <Label className="text-white">Diferenciais da Empresa</Label>
                  <Textarea
                    value={config.diferenciais}
                    onChange={(e) => handleChange('diferenciais', e.target.value)}
                    placeholder="O que torna voces unicos?"
                    className="mt-2 bg-black/30 border-white/10 text-white placeholder:text-white/40 min-h-[80px]"
                  />
                </div>

                <div>
                  <Label className="text-white">Horario de Atendimento</Label>
                  <Input
                    value={config.horario_atendimento}
                    onChange={(e) => handleChange('horario_atendimento', e.target.value)}
                    placeholder="Ex: 08:00 - 18:00 (Seg-Sex)"
                    className="mt-2 bg-black/30 border-white/10 text-white placeholder:text-white/40"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-2xl card-glass border-white/10 lg:col-span-2">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5"></div>
              <CardHeader className="relative">
                <CardTitle className="text-white">Conhecimentos Especiais</CardTitle>
                <CardDescription className="text-white/60">
                  Conhecimentos tecnicos que a atendente deve ter
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <Textarea
                  value={config.conhecimentos_especiais}
                  onChange={(e) => handleChange('conhecimentos_especiais', e.target.value)}
                  placeholder="Ex: Conhecimento em lubrificantes, filtros, especificacoes tecnicas de oleos, aplicacoes por veiculo..."
                  className="bg-black/30 border-white/10 text-white placeholder:text-white/40 min-h-[100px]"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Mensagens Padrao */}
        <TabsContent value="mensagens" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <Card className="relative overflow-hidden rounded-2xl card-glass border-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
              <CardHeader className="relative">
                <CardTitle className="text-white">Mensagens Padrao</CardTitle>
                <CardDescription className="text-white/60">
                  Configure as mensagens automaticas
                </CardDescription>
              </CardHeader>
              <CardContent className="relative space-y-6">
                <div>
                  <Label className="text-white">Mensagem de Boas-Vindas</Label>
                  <Textarea
                    value={config.mensagem_boas_vindas}
                    onChange={(e) => handleChange('mensagem_boas_vindas', e.target.value)}
                    placeholder={`Ola! Sou a ${config.nome_atendente}, como posso ajudar voce hoje?`}
                    className="mt-2 bg-black/30 border-white/10 text-white placeholder:text-white/40 min-h-[80px]"
                  />
                </div>

                <div>
                  <Label className="text-white">Mensagem de Ausencia (fora do horario)</Label>
                  <Textarea
                    value={config.mensagem_ausencia}
                    onChange={(e) => handleChange('mensagem_ausencia', e.target.value)}
                    placeholder="No momento estamos fora do horario de atendimento. Deixe sua mensagem que retornaremos em breve!"
                    className="mt-2 bg-black/30 border-white/10 text-white placeholder:text-white/40 min-h-[80px]"
                  />
                </div>

                <div>
                  <Label className="text-white">Mensagem de Encerramento</Label>
                  <Textarea
                    value={config.mensagem_encerramento}
                    onChange={(e) => handleChange('mensagem_encerramento', e.target.value)}
                    placeholder="Foi um prazer ajudar voce! Se precisar de algo mais, e so chamar."
                    className="mt-2 bg-black/30 border-white/10 text-white placeholder:text-white/40 min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Botao Gerar Prompt */}
            <Card className="relative overflow-hidden rounded-2xl card-glass border-purple-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"></div>
              <CardHeader className="relative">
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  Gerar Prompt do Sistema
                </CardTitle>
                <CardDescription className="text-white/60">
                  Gere automaticamente o prompt da IA baseado nas configuracoes acima
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <Button
                  onClick={gerarPromptSistema}
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Gerar Prompt Automaticamente
                </Button>
                <p className="text-white/40 text-xs mt-2 text-center">
                  Isso ira criar um prompt otimizado para a IA baseado em todas as configuracoes
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Audio e Comportamento */}
        <TabsContent value="comportamento" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="relative overflow-hidden rounded-2xl card-glass border-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5"></div>
              <CardHeader className="relative">
                <CardTitle className="text-white flex items-center gap-2">
                  <Volume2 className="h-5 w-5 text-orange-500" />
                  Configuracoes de Audio
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <div className="flex items-center justify-between p-4 bg-black/20 border border-white/10 rounded-lg">
                  <div>
                    <Label className="text-white">Enviar Respostas em Audio</Label>
                    <p className="text-white/40 text-xs mt-1">Envia mensagens de voz junto com texto</p>
                  </div>
                  <Switch
                    checked={config.enviar_audio}
                    onCheckedChange={(checked) => handleChange('enviar_audio', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-black/20 border border-white/10 rounded-lg">
                  <div>
                    <Label className="text-white">Usar ElevenLabs (Voz Premium)</Label>
                    <p className="text-white/40 text-xs mt-1">Voz mais natural e realista</p>
                  </div>
                  <Switch
                    checked={config.usar_elevenlabs}
                    onCheckedChange={(checked) => handleChange('usar_elevenlabs', checked)}
                  />
                </div>

                {config.usar_elevenlabs && (
                  <div>
                    <Label className="text-white">Voice ID (ElevenLabs)</Label>
                    <Input
                      value={config.elevenlabs_voice_id}
                      onChange={(e) => handleChange('elevenlabs_voice_id', e.target.value)}
                      placeholder="ID da voz no ElevenLabs"
                      className="mt-2 bg-black/30 border-white/10 text-white placeholder:text-white/40"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-2xl card-glass border-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5"></div>
              <CardHeader className="relative">
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  Comportamento
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <div className="flex items-center justify-between p-4 bg-black/20 border border-white/10 rounded-lg">
                  <div>
                    <Label className="text-white">Auto-resposta Ativa</Label>
                    <p className="text-white/40 text-xs mt-1">Bot responde automaticamente</p>
                  </div>
                  <Switch
                    checked={config.auto_resposta_ativa}
                    onCheckedChange={(checked) => handleChange('auto_resposta_ativa', checked)}
                  />
                </div>

                <div>
                  <Label className="text-white">Tempo de Resposta (segundos)</Label>
                  <Input
                    type="number"
                    value={config.tempo_resposta_segundos}
                    onChange={(e) => handleChange('tempo_resposta_segundos', parseInt(e.target.value) || 5)}
                    min={1}
                    max={30}
                    className="mt-2 bg-black/30 border-white/10 text-white"
                  />
                  <p className="text-white/40 text-xs mt-1">Tempo minimo entre respostas</p>
                </div>

                <div>
                  <Label className="text-white">Intervalo entre Mensagens (segundos)</Label>
                  <Input
                    type="number"
                    value={config.intervalo_entre_mensagens}
                    onChange={(e) => handleChange('intervalo_entre_mensagens', parseInt(e.target.value) || 10)}
                    min={5}
                    max={60}
                    className="mt-2 bg-black/30 border-white/10 text-white"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Modulos Especiais */}
            <Card className="relative overflow-hidden rounded-2xl card-glass border-white/10 lg:col-span-2">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5"></div>
              <CardHeader className="relative">
                <CardTitle className="text-white">Modulos Especiais</CardTitle>
                <CardDescription className="text-white/60">
                  Ative funcionalidades extras do bot
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-4 bg-black/20 border border-white/10 rounded-lg">
                    <div>
                      <Label className="text-white">Consulta FIPE</Label>
                      <p className="text-white/40 text-xs mt-1">Tabela de precos de veiculos</p>
                    </div>
                    <Switch
                      checked={config.modulo_fipe_ativo}
                      onCheckedChange={(checked) => handleChange('modulo_fipe_ativo', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-black/20 border border-white/10 rounded-lg">
                    <div>
                      <Label className="text-white">Financiamento</Label>
                      <p className="text-white/40 text-xs mt-1">Simulador de parcelas</p>
                    </div>
                    <Switch
                      checked={config.modulo_financiamento_ativo}
                      onCheckedChange={(checked) => handleChange('modulo_financiamento_ativo', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-black/20 border border-white/10 rounded-lg">
                    <div>
                      <Label className="text-white">Agendamento</Label>
                      <p className="text-white/40 text-xs mt-1">Agendar visitas/test-drive</p>
                    </div>
                    <Switch
                      checked={config.modulo_agendamento_ativo}
                      onCheckedChange={(checked) => handleChange('modulo_agendamento_ativo', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

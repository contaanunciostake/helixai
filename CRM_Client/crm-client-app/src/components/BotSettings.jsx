/**
 * ════════════════════════════════════════════════════════════════════════════
 * COMPONENTE: Configurações do Bot - Verde Neon
 * Design futurista com tema verde neon (identidade visual do Dashboard)
 * ════════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import {
  Save, Bot, MessageSquare, Clock, Zap, Globe, Sparkles,
  Volume2, VolumeX, Brain, Settings2,
  Bell, ToggleLeft, ToggleRight,
  Loader2, AlertCircle, RefreshCw, Briefcase
} from 'lucide-react';

export default function BotSettings({ user, showNotification }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('messages');

  // Configurações do Bot
  const [config, setConfig] = useState({
    // Mensagens
    mensagemBoasVindas: 'Olá! 👋 Sou a AIra, assistente virtual. Como posso ajudá-lo?',
    mensagemAusencia: 'No momento estamos fora do horário de atendimento. Retornaremos em breve!',
    mensagemEncerramento: 'Foi um prazer atendê-lo! Até breve! 😊',

    // Personalidade
    personalidade: 'profissional',
    tom: 'neutro',
    emoji: true,

    // Comportamento
    respostaAutomatica: true,
    tempoResposta: 3,
    enviarAudio: false,

    // Horário
    horario24h: true,
    horarioInicio: '08:00',
    horarioFim: '18:00',
    diasSemana: ['seg', 'ter', 'qua', 'qui', 'sex'],

    // IA
    modeloIA: 'gpt-4',
    temperatura: 0.7,
    usarRAG: true,
    usarMemoria: true,

    // Notificações
    notificarNovoLead: true,
    notificarErros: true,

    // Negócio
    nomeEmpresa: user?.empresa_nome || '',
    nicho: 'veiculos',
    descricaoNegocio: '',
    diferenciais: '',
    ofertas: ''
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const empresaId = user?.empresa_id || 1;

      const response = await fetch(`http://localhost:5000/api/bot/config/${empresaId}`);
      const result = await response.json();

      if (result.success && result.data) {
        setConfig(prev => ({
          ...prev,
          mensagemBoasVindas: result.data.mensagemBoasVindas || prev.mensagemBoasVindas,
          nomeEmpresa: result.data.empresaNome || prev.nomeEmpresa,
          nicho: result.data.nicho || prev.nicho,
          personalidade: result.data.personalidadeBot || prev.personalidade,
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const empresaId = user?.empresa_id || 1;

      const response = await fetch(`http://localhost:5000/api/bot/config/${empresaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensagemBoasVindas: config.mensagemBoasVindas,
          nicho: config.nicho,
          personalidadeBot: config.personalidade,
          usaAudio: config.enviarAudio,
          horarioAtendimento: config.horario24h ? '24/7 (24 horas)' : `${config.horarioInicio}-${config.horarioFim}`,
          dadosAdicionais: {
            ofertas_especiais: config.ofertas,
            diferenciais: config.diferenciais,
            informacoes_extras: config.descricaoNegocio
          }
        })
      });

      const result = await response.json();
      if (result.success) {
        showNotification('✅ Configurações salvas com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      showNotification('❌ Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const toggleDiaSemana = (dia) => {
    setConfig(prev => ({
      ...prev,
      diasSemana: prev.diasSemana.includes(dia)
        ? prev.diasSemana.filter(d => d !== dia)
        : [...prev.diasSemana, dia]
    }));
  };

  const tabs = [
    { id: 'messages', label: 'Mensagens', icon: MessageSquare },
    { id: 'personality', label: 'Personalidade', icon: Sparkles },
    { id: 'behavior', label: 'Comportamento', icon: Bot },
    { id: 'schedule', label: 'Horários', icon: Clock },
    { id: 'business', label: 'Negócio', icon: Globe }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black relative overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '4rem 4rem'
        }}></div>

        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite ${Math.random() * 3}s`
            }}
          />
        ))}

        <div className="text-center relative z-10">
          <div className="relative">
            <div className="h-20 w-20 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin mx-auto" />
            <Settings2 className="h-8 w-8 text-green-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-white/70 mt-6 text-sm font-medium">Carregando configurações...</p>
        </div>
      </div>
    );
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

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl card-glass">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5"></div>
        <div className="relative p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                <Settings2 className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-green-400" />
                  Configurações do Bot
                </h1>
                <p className="text-white/60 text-sm mt-1">
                  Personalize o comportamento e a personalidade da sua assistente virtual
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={loadConfig}
                className="bg-white/5 hover:bg-white/10 text-white border border-white/10"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Recarregar
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary-neon text-white px-8 py-6 text-base"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Salvar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'btn-primary-neon text-white'
                  : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              <Icon className="h-5 w-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="relative">
        {/* MENSAGENS */}
        {activeTab === 'messages' && (
          <div className="relative overflow-hidden rounded-xl card-glass">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
            <div className="relative">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-green-400" />
                  Mensagens Automatizadas
                </h2>
                <p className="text-white/60 text-sm mt-1">
                  Configure as mensagens padrão do bot
                </p>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <Label className="text-white mb-2 block font-medium">Mensagem de Boas-Vindas</Label>
                  <Textarea
                    value={config.mensagemBoasVindas}
                    onChange={(e) => updateConfig('mensagemBoasVindas', e.target.value)}
                    className="bg-black/30 border-green-500/20 text-white min-h-24 focus:border-green-500"
                    placeholder="Digite a mensagem de boas-vindas..."
                  />
                  <p className="text-xs text-green-400/70 mt-1 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Primeira mensagem enviada quando um novo contato inicia uma conversa
                  </p>
                </div>

                <div>
                  <Label className="text-white mb-2 block font-medium">Mensagem de Ausência</Label>
                  <Textarea
                    value={config.mensagemAusencia}
                    onChange={(e) => updateConfig('mensagemAusencia', e.target.value)}
                    className="bg-black/30 border-green-500/20 text-white min-h-20 focus:border-green-500"
                  />
                </div>

                <div>
                  <Label className="text-white mb-2 block font-medium">Mensagem de Encerramento</Label>
                  <Textarea
                    value={config.mensagemEncerramento}
                    onChange={(e) => updateConfig('mensagemEncerramento', e.target.value)}
                    className="bg-black/30 border-green-500/20 text-white min-h-20 focus:border-green-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PERSONALIDADE */}
        {activeTab === 'personality' && (
          <div className="relative overflow-hidden rounded-xl card-glass">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
            <div className="relative">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-pink-400" />
                  Personalidade do Bot
                </h2>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <Label className="text-white mb-3 block font-medium">Estilo de Personalidade</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { value: 'profissional', label: 'Profissional', icon: '💼' },
                      { value: 'amigavel', label: 'Amigável', icon: '😊' },
                      { value: 'formal', label: 'Formal', icon: '🎩' },
                      { value: 'casual', label: 'Casual', icon: '🤙' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updateConfig('personalidade', option.value)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          config.personalidade === option.value
                            ? 'border-green-500 bg-green-500/20'
                            : 'border-white/10 bg-white/5 hover:border-green-500/50'
                        }`}
                      >
                        <div className="text-3xl mb-2">{option.icon}</div>
                        <p className="text-white font-semibold">{option.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-green-400" />
                    <div>
                      <p className="text-white font-semibold">Usar Emojis</p>
                      <p className="text-xs text-white/60">Adiciona emojis nas respostas</p>
                    </div>
                  </div>
                  <button onClick={() => updateConfig('emoji', !config.emoji)}>
                    {config.emoji ? (
                      <ToggleRight className="h-8 w-8 text-green-400" />
                    ) : (
                      <ToggleLeft className="h-8 w-8 text-white/40" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COMPORTAMENTO */}
        {activeTab === 'behavior' && (
          <div className="relative overflow-hidden rounded-xl card-glass">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
            <div className="relative">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Bot className="h-5 w-5 text-cyan-400" />
                  Comportamento do Bot
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-green-400" />
                    <div>
                      <p className="text-white font-semibold">Resposta Automática</p>
                      <p className="text-xs text-white/60">Responde automaticamente às mensagens</p>
                    </div>
                  </div>
                  <button onClick={() => updateConfig('respostaAutomatica', !config.respostaAutomatica)}>
                    {config.respostaAutomatica ? (
                      <ToggleRight className="h-8 w-8 text-green-400" />
                    ) : (
                      <ToggleLeft className="h-8 w-8 text-white/40" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3">
                    {config.enviarAudio ? (
                      <Volume2 className="h-5 w-5 text-green-400" />
                    ) : (
                      <VolumeX className="h-5 w-5 text-white/40" />
                    )}
                    <div>
                      <p className="text-white font-semibold">Enviar Áudios</p>
                      <p className="text-xs text-white/60">Converte respostas em áudio (ElevenLabs)</p>
                    </div>
                  </div>
                  <button onClick={() => updateConfig('enviarAudio', !config.enviarAudio)}>
                    {config.enviarAudio ? (
                      <ToggleRight className="h-8 w-8 text-green-400" />
                    ) : (
                      <ToggleLeft className="h-8 w-8 text-white/40" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HORÁRIOS */}
        {activeTab === 'schedule' && (
          <div className="relative overflow-hidden rounded-xl card-glass">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
            <div className="relative">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-400" />
                  Horário de Atendimento
                </h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-green-400" />
                    <div>
                      <p className="text-white font-semibold">Atendimento 24/7</p>
                      <p className="text-xs text-white/60">Bot sempre ativo</p>
                    </div>
                  </div>
                  <button onClick={() => updateConfig('horario24h', !config.horario24h)}>
                    {config.horario24h ? (
                      <ToggleRight className="h-8 w-8 text-green-400" />
                    ) : (
                      <ToggleLeft className="h-8 w-8 text-white/40" />
                    )}
                  </button>
                </div>

                {!config.horario24h && (
                  <div className="space-y-4 bg-black/30 rounded-lg p-4 border border-green-500/20">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white mb-2 block">Horário Início</Label>
                        <Input
                          type="time"
                          value={config.horarioInicio}
                          onChange={(e) => updateConfig('horarioInicio', e.target.value)}
                          className="bg-black/50 border-green-500/20 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-white mb-2 block">Horário Fim</Label>
                        <Input
                          type="time"
                          value={config.horarioFim}
                          onChange={(e) => updateConfig('horarioFim', e.target.value)}
                          className="bg-black/50 border-green-500/20 text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* NEGÓCIO */}
        {activeTab === 'business' && (
          <div className="relative overflow-hidden rounded-xl card-glass">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
            <div className="relative">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-400" />
                  Informações do Negócio
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <Label className="text-white mb-2 block">Nome da Empresa</Label>
                  <Input
                    value={config.nomeEmpresa}
                    onChange={(e) => updateConfig('nomeEmpresa', e.target.value)}
                    className="bg-black/30 border-green-500/20 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white mb-2 block">Nicho de Negócio</Label>
                  <select
                    value={config.nicho}
                    onChange={(e) => updateConfig('nicho', e.target.value)}
                    className="w-full p-3 bg-black/30 border border-green-500/20 rounded-lg text-white focus:border-green-500"
                  >
                    <option value="veiculos">🚗 Veículos</option>
                    <option value="imoveis">🏢 Imóveis</option>
                    <option value="outros">🛍️ Outros</option>
                  </select>
                </div>

                <div>
                  <Label className="text-white mb-2 block">Descrição do Negócio</Label>
                  <Textarea
                    value={config.descricaoNegocio}
                    onChange={(e) => updateConfig('descricaoNegocio', e.target.value)}
                    className="bg-black/30 border-green-500/20 text-white min-h-24"
                  />
                </div>

                <div>
                  <Label className="text-white mb-2 block">Diferenciais</Label>
                  <Textarea
                    value={config.diferenciais}
                    onChange={(e) => updateConfig('diferenciais', e.target.value)}
                    className="bg-black/30 border-green-500/20 text-white min-h-20"
                  />
                </div>

                <div>
                  <Label className="text-white mb-2 block">Ofertas Atuais</Label>
                  <Textarea
                    value={config.ofertas}
                    onChange={(e) => updateConfig('ofertas', e.target.value)}
                    className="bg-black/30 border-green-500/20 text-white min-h-20"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="relative overflow-hidden rounded-xl border border-green-500/30 bg-green-500/10">
        <div className="p-4 flex items-start gap-3">
          <Zap className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-green-400 text-sm font-semibold mb-1">
              Sincronização Automática
            </p>
            <p className="text-white/70 text-sm">
              As configurações são aplicadas imediatamente após salvar e refletem no comportamento do bot VendeAI.
            </p>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }

        .card-glass {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .btn-primary-neon {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
          transition: all 0.3s ease;
        }

        .btn-primary-neon:hover {
          box-shadow: 0 0 30px rgba(16, 185, 129, 0.6);
          transform: translateY(-2px);
        }

        .btn-primary-neon:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
      `}</style>
    </div>
  );
}

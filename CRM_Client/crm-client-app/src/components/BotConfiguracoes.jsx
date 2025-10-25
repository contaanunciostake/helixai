/**
 * ════════════════════════════════════════════════════════════════════════════
 * COMPONENTE: Configurações do Bot - Verde Neon
 * Design futurista com tema verde neon (identidade visual do Dashboard)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Permite configurar personalização do bot por empresa:
 * - Mensagem de boas-vindas
 * - Horário de atendimento
 * - Nicho de negócio
 * - Personalidade do bot
 * - Informações adicionais
 *
 * ✅ SINCRONIZA COM BOT VENDEAI via API: /api/bot/config/<empresa_id>
 * ════════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import {
  Save, Clock, MessageSquare, Briefcase, Bot, Info, Sparkles,
  AlertCircle, CheckCircle2, RefreshCw, Settings, Zap
} from 'lucide-react';

export default function BotConfiguracoes({ user, botConfig, showNotification }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estados do formulário
  const [config, setConfig] = useState({
    mensagemBoasVindas: 'Olá! Sou a AIra, assistente virtual. Como posso ajudá-lo?',
    horarioAtendimento: '24/7',
    horarioInicio: '08:00',
    horarioFim: '18:00',
    diasSemana: 'seg-sex',
    foraHorarioMsg: 'No momento estamos fora do horário de atendimento. Retornaremos em breve!',
    nicho: 'veiculos',
    personalidadeBot: 'profissional',
    usaAudio: false,
    dadosAdicionais: {
      ofertas_especiais: '',
      diferenciais: '',
      informacoes_extras: ''
    }
  });

  const [horarioPersonalizado, setHorarioPersonalizado] = useState(false);

  // Carregar configurações ao montar
  useEffect(() => {
    carregarConfiguracoes();
  }, [user]);

  const carregarConfiguracoes = async () => {
    try {
      setLoading(true);
      const empresaId = user?.empresa_id || 1;

      console.log('[CONFIG] Carregando configurações da empresa:', empresaId);

      const response = await fetch(`http://localhost:5000/api/bot/config/${empresaId}`);
      const result = await response.json();

      console.log('[CONFIG] Resposta:', result);

      if (result.success && result.data) {
        const data = result.data;

        setConfig({
          mensagemBoasVindas: data.mensagemBoasVindas || 'Olá! Sou a AIra, assistente virtual. Como posso ajudá-lo?',
          horarioAtendimento: data.horarioAtendimento || '24/7 (24 horas)',
          horarioInicio: data.horarioInicio || '08:00',
          horarioFim: data.horarioFim || '18:00',
          diasSemana: data.diasSemana || 'seg-sex',
          foraHorarioMsg: data.foraHorarioMsg || 'No momento estamos fora do horário de atendimento.',
          nicho: data.nicho || 'veiculos',
          personalidadeBot: data.personalidadeBot || 'profissional',
          usaAudio: data.usaAudio || false,
          dadosAdicionais: data.dadosAdicionais || {
            ofertas_especiais: '',
            diferenciais: '',
            informacoes_extras: ''
          }
        });

        setHorarioPersonalizado(data.horarioAtendimento !== '24/7 (24 horas)' && data.horarioAtendimento !== '24/7');

        console.log('[CONFIG] ✅ Configurações carregadas com sucesso');
      } else {
        console.warn('[CONFIG] ⚠️ Nenhuma configuração encontrada, usando padrão');
      }
    } catch (error) {
      console.error('[CONFIG] ❌ Erro ao carregar:', error);
      showNotification('⚠️ Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const salvarConfiguracoes = async () => {
    try {
      setSaving(true);
      const empresaId = user?.empresa_id || 1;

      console.log('[CONFIG] 💾 Salvando configurações da empresa:', empresaId);

      // Preparar dados para envio
      const dadosEnvio = {
        mensagemBoasVindas: config.mensagemBoasVindas,
        horarioAtendimento: horarioPersonalizado
          ? `${config.diasSemana} ${config.horarioInicio}-${config.horarioFim}`
          : '24/7 (24 horas)',
        horarioInicio: horarioPersonalizado ? config.horarioInicio : null,
        horarioFim: horarioPersonalizado ? config.horarioFim : null,
        diasSemana: horarioPersonalizado ? config.diasSemana : null,
        foraHorarioMsg: config.foraHorarioMsg,
        nicho: config.nicho,
        personalidadeBot: config.personalidadeBot,
        usaAudio: config.usaAudio,
        dadosAdicionais: config.dadosAdicionais
      };

      console.log('[CONFIG] Dados:', dadosEnvio);

      const response = await fetch(`http://localhost:5000/api/bot/config/${empresaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosEnvio)
      });

      const result = await response.json();

      if (result.success) {
        showNotification('✅ Configurações salvas com sucesso! O bot já está usando as novas configurações.');
        console.log('[CONFIG] ✅ Salvo com sucesso!');

        // Recarregar para confirmar
        setTimeout(() => carregarConfiguracoes(), 1000);
      } else {
        throw new Error(result.error || 'Erro ao salvar');
      }
    } catch (error) {
      console.error('[CONFIG] ❌ Erro ao salvar:', error);
      showNotification('❌ Erro ao salvar configurações: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black relative overflow-hidden">
        {/* Grid pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '4rem 4rem'
        }}></div>

        {/* Stars */}
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
            <Settings className="h-8 w-8 text-green-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
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
                <Bot className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-green-400" />
                  Configurações do Bot
                </h2>
                <p className="text-white/60 text-sm mt-1">
                  Personalize o comportamento e mensagens do seu assistente virtual
                </p>
              </div>
            </div>
            <Button
              onClick={() => carregarConfiguracoes()}
              disabled={loading}
              className="bg-white/5 hover:bg-white/10 text-white border border-white/10"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Recarregar
            </Button>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div className="space-y-6 relative">

        {/* Mensagem de Boas-Vindas */}
        <div className="relative overflow-hidden rounded-xl card-glass">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
          <div className="relative p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-400" />
              Mensagem de Boas-Vindas
            </h3>
            <textarea
              value={config.mensagemBoasVindas}
              onChange={(e) => setConfig({ ...config, mensagemBoasVindas: e.target.value })}
              className="w-full bg-black/30 text-white rounded-lg p-4 border border-green-500/20 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
              rows={3}
              placeholder="Digite a mensagem inicial que o bot enviará..."
            />
            <p className="text-green-400/70 text-xs mt-2 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Dica: Use {'{nome}'} para incluir o nome do cliente na mensagem
            </p>
          </div>
        </div>

        {/* Horário de Atendimento */}
        <div className="relative overflow-hidden rounded-xl card-glass">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
          <div className="relative p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-400" />
              Horário de Atendimento
            </h3>

            {/* Toggle 24/7 ou Personalizado */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <input
                    type="radio"
                    checked={!horarioPersonalizado}
                    onChange={() => setHorarioPersonalizado(false)}
                    className="w-4 h-4 text-green-500 accent-green-500"
                  />
                  <span className="text-white">24/7 (24 horas)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <input
                    type="radio"
                    checked={horarioPersonalizado}
                    onChange={() => setHorarioPersonalizado(true)}
                    className="w-4 h-4 text-green-500 accent-green-500"
                  />
                  <span className="text-white">Horário Personalizado</span>
                </label>
              </div>

              {/* Campos de horário personalizado */}
              {horarioPersonalizado && (
                <div className="bg-black/30 rounded-lg p-4 space-y-4 border border-green-500/20">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-white/70 text-sm mb-2 block">Horário Início</label>
                      <input
                        type="time"
                        value={config.horarioInicio}
                        onChange={(e) => setConfig({ ...config, horarioInicio: e.target.value })}
                        className="w-full bg-black/50 text-white rounded-lg p-3 border border-green-500/20 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                      />
                    </div>

                    <div>
                      <label className="text-white/70 text-sm mb-2 block">Horário Fim</label>
                      <input
                        type="time"
                        value={config.horarioFim}
                        onChange={(e) => setConfig({ ...config, horarioFim: e.target.value })}
                        className="w-full bg-black/50 text-white rounded-lg p-3 border border-green-500/20 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                      />
                    </div>

                    <div>
                      <label className="text-white/70 text-sm mb-2 block">Dias da Semana</label>
                      <select
                        value={config.diasSemana}
                        onChange={(e) => setConfig({ ...config, diasSemana: e.target.value })}
                        className="w-full bg-black/50 text-white rounded-lg p-3 border border-green-500/20 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                      >
                        <option value="seg-sex">Segunda a Sexta</option>
                        <option value="seg-sab">Segunda a Sábado</option>
                        <option value="todos">Todos os dias</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-white/70 text-sm mb-2 block">Mensagem Fora do Horário</label>
                    <textarea
                      value={config.foraHorarioMsg}
                      onChange={(e) => setConfig({ ...config, foraHorarioMsg: e.target.value })}
                      className="w-full bg-black/50 text-white rounded-lg p-3 border border-green-500/20 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                      rows={2}
                      placeholder="Mensagem enviada quando cliente mandar mensagem fora do horário..."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Nicho e Personalidade */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nicho */}
          <div className="relative overflow-hidden rounded-xl card-glass">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
            <div className="relative p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-cyan-400" />
                Nicho de Negócio
              </h3>
              <select
                value={config.nicho}
                onChange={(e) => setConfig({ ...config, nicho: e.target.value })}
                className="w-full bg-black/30 text-white rounded-lg p-3 border border-cyan-500/20 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              >
                <option value="veiculos">🚗 Veículos</option>
                <option value="imoveis">🏢 Imóveis</option>
                <option value="outros">🛍️ Outros</option>
              </select>
              <p className="text-cyan-400/70 text-xs mt-2 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                O bot usará conhecimento específico do nicho selecionado
              </p>
            </div>
          </div>

          {/* Personalidade */}
          <div className="relative overflow-hidden rounded-xl card-glass">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
            <div className="relative p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-pink-400" />
                Personalidade do Bot
              </h3>
              <select
                value={config.personalidadeBot}
                onChange={(e) => setConfig({ ...config, personalidadeBot: e.target.value })}
                className="w-full bg-black/30 text-white rounded-lg p-3 border border-pink-500/20 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
              >
                <option value="profissional">💼 Profissional</option>
                <option value="amigavel">😊 Amigável</option>
                <option value="descontraido">😎 Descontraído</option>
              </select>
              <p className="text-pink-400/70 text-xs mt-2">
                Define o tom das conversas com os clientes
              </p>
            </div>
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="relative overflow-hidden rounded-xl card-glass">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
          <div className="relative p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-400" />
              Informações Adicionais
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-white/70 text-sm mb-2 block">Ofertas Especiais</label>
                <input
                  type="text"
                  value={config.dadosAdicionais.ofertas_especiais || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    dadosAdicionais: { ...config.dadosAdicionais, ofertas_especiais: e.target.value }
                  })}
                  className="w-full bg-black/30 text-white rounded-lg p-3 border border-blue-500/20 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Ex: Financiamento com taxa zero"
                />
              </div>

              <div>
                <label className="text-white/70 text-sm mb-2 block">Diferenciais</label>
                <input
                  type="text"
                  value={config.dadosAdicionais.diferenciais || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    dadosAdicionais: { ...config.dadosAdicionais, diferenciais: e.target.value }
                  })}
                  className="w-full bg-black/30 text-white rounded-lg p-3 border border-blue-500/20 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Ex: Maior estoque da região"
                />
              </div>

              <div>
                <label className="text-white/70 text-sm mb-2 block">Informações Extras</label>
                <textarea
                  value={config.dadosAdicionais.informacoes_extras || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    dadosAdicionais: { ...config.dadosAdicionais, informacoes_extras: e.target.value }
                  })}
                  className="w-full bg-black/30 text-white rounded-lg p-3 border border-blue-500/20 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  rows={2}
                  placeholder="Ex: Aceitamos troca, Parcelamos entrada"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Botão Salvar */}
        <div className="flex justify-end gap-4">
          <Button
            onClick={salvarConfiguracoes}
            disabled={saving}
            className="btn-primary-neon text-white px-8 py-6 text-base font-semibold"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>

        {/* Informação */}
        <div className="relative overflow-hidden rounded-xl border border-green-500/30 bg-green-500/10">
          <div className="p-4 flex items-start gap-3">
            <Zap className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-green-400 text-sm font-semibold mb-1">
                Sincronização Automática
              </p>
              <p className="text-white/70 text-sm">
                As configurações serão aplicadas imediatamente após salvar.
                O bot VendeAI utilizará essas informações em todas as conversas futuras automaticamente.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Style for animations */}
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

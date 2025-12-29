/**
 * ════════════════════════════════════════════════════════════════
 * COMPONENTE: WhatsApp Connection Verde Neon - AIra CRM
 * Design futurista com tema verde neon (padronizado com Dashboard)
 * ════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import {
  QrCode, Smartphone, CheckCircle2, XCircle, Loader2, RefreshCw,
  Wifi, WifiOff, Power, AlertCircle, PhoneCall, MessageSquare,
  Zap, Eye, EyeOff, Copy, LogOut, Phone, Bot, Sparkles
} from 'lucide-react';

// Detectar URL do backend dinamicamente
const getBackendUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  if (typeof window !== 'undefined' &&
      (window.location.hostname.includes('onrender.com') || window.location.hostname.includes('render.com'))) {
    return 'https://vendefacil-backend.onrender.com'
  }
  return 'http://localhost:5000'
}

// Detectar URL do bot dinamicamente
const getBotApiUrl = () => {
  if (import.meta.env.VITE_BOT_API_URL) {
    return import.meta.env.VITE_BOT_API_URL
  }
  if (typeof window !== 'undefined' &&
      (window.location.hostname.includes('onrender.com') || window.location.hostname.includes('render.com'))) {
    return 'https://vendefacil-whatsapp.onrender.com'
  }
  return 'http://localhost:3010'
}

// Detectar URL do WebSocket dinamicamente
const getWsUrl = () => {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL
  }
  if (typeof window !== 'undefined' &&
      (window.location.hostname.includes('onrender.com') || window.location.hostname.includes('render.com'))) {
    return 'wss://vendefacil-whatsapp.onrender.com/ws'
  }
  return 'ws://localhost:3010/ws'
}

// URLs padrão (usadas se botConfig não for passado)
const BACKEND_API_URL = getBackendUrl();
const DEFAULT_BOT_API_URL = getBotApiUrl();
const DEFAULT_WS_URL = getWsUrl();

export default function WhatsAppConnection({ user, showNotification, botConfig }) {
  // Usar URLs do botConfig se disponível, senão usar padrão
  const BOT_API_URL = botConfig?.apiUrl || DEFAULT_BOT_API_URL;
  const WS_URL = botConfig?.wsUrl || DEFAULT_WS_URL;
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [qrCode, setQrCode] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [loading, setLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [stats, setStats] = useState({
    mensagensHoje: 0,
    conversasAtivas: 0,
    ultimaAtividade: null
  });
  const [botAtivo, setBotAtivo] = useState(false);
  const [togglingBot, setTogglingBot] = useState(false);

  // Estados para Notificações do Gerente
  const [numeroGerente, setNumeroGerente] = useState('');
  const [notificarVendas, setNotificarVendas] = useState(true);
  const [notificarLeads, setNotificarLeads] = useState(true);
  const [notificarEntregas, setNotificarEntregas] = useState(true);
  const [notificarEstoque, setNotificarEstoque] = useState(false);
  const [salvandoNotificacoes, setSalvandoNotificacoes] = useState(false);
  const [testandoNotificacao, setTestandoNotificacao] = useState(false);

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // ══════════════════════════════════════════════════════════════
  // WEBSOCKET - Conexão em tempo real
  // ══════════════════════════════════════════════════════════════

  useEffect(() => {
    connectWebSocket();
    fetchStatus();
    fetchBotActiveStatus();
    fetchRealStats();
    fetchNotificacoesGerente();

    // Auto-refresh status e estatísticas a cada 5 segundos
    const statusInterval = setInterval(() => {
      fetchStatus();
      fetchRealStats();
    }, 5000);

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      clearInterval(statusInterval);
    };
  }, []);

  const connectWebSocket = () => {
    try {
      const empresaId = user?.empresa_id || 9;
      console.log('[WS] Conectando ao WebSocket com empresa_id:', empresaId);
      const ws = new WebSocket(`${WS_URL}?empresa_id=${empresaId}`);

      ws.onopen = () => {
        console.log('[WS] ✅ Conectado!');
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('[WS] 📨 Mensagem recebida:', message.type, message.data);

          if (message.type === 'status') {
            // Só processar status se NÃO estiver já conectado (evita sobrescrever)
            if (connectionStatus !== 'connected' || message.data?.connected === true) {
              handleStatusUpdate(message.data);
            }
          } else if (message.type === 'qr') {
            setQrCode(message.data.qrCode);
            setConnectionStatus('connecting');
            console.log('[WS] QR Code recebido, exibindo...');
          } else if (message.type === 'qr_scanned') {
            // QR Code foi lido, mostrar "conectando" mas manter QR visível por mais 2 segundos
            console.log('[WS] QR Code escaneado! Aguardando autenticação...');
            setConnectionStatus('authenticating');
            setQrCode(null); // Remover QR imediatamente
            showNotification('📱 QR Code lido! Aguarde a autenticação...');
          } else if (message.type === 'connected') {
            console.log('[WS] ✅ Conectado!', message.data);
            setConnectionStatus('connected');
            setQrCode(null);
            setPhoneNumber(message.data?.phoneNumber || null);
            setSessionInfo(message.data);
            showNotification('✅ WhatsApp conectado com sucesso!');
            // Buscar estatísticas após conectar
            fetchRealStats();
            fetchBotActiveStatus();
          } else if (message.type === 'disconnected') {
            handleDisconnection();
          }
        } catch (error) {
          console.error('[WS] Erro ao processar mensagem:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('[WS] ❌ Erro:', error);
        setWsConnected(false);
      };

      ws.onclose = () => {
        console.log('[WS] ❌ Desconectado');
        setWsConnected(false);

        // Tentar reconectar imediatamente
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('[WS] 🔄 Tentando reconectar...');
          connectWebSocket();
        }, 2000); // Reduzido para 2 segundos
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('[WS] Erro ao criar WebSocket:', error);
      setWsConnected(false);
    }
  };

  const handleStatusUpdate = (data) => {
    console.log('[STATUS-UPDATE] Dados recebidos:', data);

    // Se dados indicam conectado, atualizar tudo
    if (data.connected === true || data.connectionStatus === 'connected') {
      console.log('[STATUS-UPDATE] ✅ Detectado CONECTADO');
      setConnectionStatus('connected');
      setPhoneNumber(data.phoneNumber || null);
      setQrCode(null);
      setSessionInfo(data);
      fetchRealStats();
      return;
    }

    // Determinar novo status com base nos dados
    let newStatus = 'disconnected';

    if (data.qrCode) {
      newStatus = 'connecting';
      setQrCode(data.qrCode);
    } else if (data.connectionStatus === 'connecting' || data.connectionStatus === 'qr_generated') {
      newStatus = 'connecting';
    } else if (data.connectionStatus === 'authenticating') {
      newStatus = 'authenticating';
      setQrCode(null);
    } else if (data.connectionStatus === 'reconnecting') {
      newStatus = 'connecting';
    }

    console.log('[STATUS-UPDATE] Novo status:', newStatus);
    setConnectionStatus(newStatus);
    setSessionInfo(data.sessionInfo || data);

    // Atualizar estatísticas se disponíveis
    if (data.mensagensHoje !== undefined || data.conversasAtivas !== undefined) {
      setStats({
        mensagensHoje: data.mensagensHoje || 0,
        conversasAtivas: data.conversasAtivas || 0,
        ultimaAtividade: data.ultimaAtividade || null
      });
    }
  };

  const handleDisconnection = () => {
    setConnectionStatus('disconnected');
    setQrCode(null);
    setPhoneNumber(null);
    setSessionInfo(null);
    showNotification('⚠️ WhatsApp desconectado');
  };

  // ══════════════════════════════════════════════════════════════
  // API CALLS
  // ══════════════════════════════════════════════════════════════

  const fetchStatus = async () => {
    try {
      const empresaId = user?.empresa_id || 9;
      const response = await fetch(`${BOT_API_URL}/api/bot/status/${empresaId}`);
      const result = await response.json();
      console.log('[API] Status recebido:', result);

      // API retorna { success: true, data: { ... } }
      if (result.success && result.data) {
        handleStatusUpdate(result.data);
      } else {
        handleStatusUpdate(result);
      }
    } catch (error) {
      console.error('[API] Erro ao buscar status:', error);
    }
  };

  const fetchBotActiveStatus = async () => {
    try {
      const empresaId = user?.empresa_id || 9;
      // Usar backend Flask (localhost:5000), não o bot server
      const backendApiUrl = BACKEND_API_URL;
      console.log('[WhatsApp] Buscando status do bot para empresa:', empresaId);
      const response = await fetch(`${backendApiUrl}/api/bot-config/${empresaId}`);
      const data = await response.json();

      console.log('[WhatsApp] Status do bot recebido:', data);
      if (data.success && data.data) {
        setBotAtivo(data.data.bot_ativo || false);
        console.log('[WhatsApp] Bot ativo definido como:', data.data.bot_ativo);
      }
    } catch (error) {
      console.error('[API] Erro ao buscar status ativo do bot:', error);
    }
  };

  // Buscar estatísticas reais da API
  const fetchRealStats = async () => {
    try {
      const empresaId = user?.empresa_id || 9;
      const response = await fetch(`${BACKEND_API_URL}/api/stats/${empresaId}`);

      if (response.ok) {
        const data = await response.json();
        console.log('[WhatsApp] Estatísticas recebidas:', data);

        if (data.success && data.data) {
          setStats(prevStats => ({
            mensagensHoje: prevStats.mensagensHoje, // Manter o valor do WebSocket
            conversasAtivas: data.data.conversas?.ativas || 0, // Usar dado real da API
            ultimaAtividade: new Date().toISOString()
          }));
        }
      }
    } catch (error) {
      console.error('[API] Erro ao buscar estatísticas:', error);
    }
  };

  // ══════════════════════════════════════════════════════════════
  // NOTIFICAÇÕES DO GERENTE
  // ══════════════════════════════════════════════════════════════

  const fetchNotificacoesGerente = async () => {
    try {
      const empresaId = user?.empresa_id || 9;
      const backendApiUrl = BACKEND_API_URL;
      const response = await fetch(`${backendApiUrl}/api/empresa/notificacoes/${empresaId}`);
      const data = await response.json();

      if (data.success && data.data) {
        setNumeroGerente(data.data.numero_gerente || '');
        setNotificarVendas(data.data.notificar_vendas ?? true);
        setNotificarLeads(data.data.notificar_leads ?? true);
        setNotificarEntregas(data.data.notificar_entregas ?? true);
        setNotificarEstoque(data.data.notificar_estoque ?? false);
        console.log('[WhatsApp] Configurações de notificação carregadas');
      }
    } catch (error) {
      console.error('[API] Erro ao buscar configurações de notificação:', error);
    }
  };

  const salvarNotificacoesGerente = async () => {
    setSalvandoNotificacoes(true);
    try {
      const empresaId = user?.empresa_id || 9;
      const backendApiUrl = BACKEND_API_URL;

      const response = await fetch(`${backendApiUrl}/api/empresa/notificacoes/${empresaId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numero_gerente: numeroGerente,
          notificar_vendas: notificarVendas,
          notificar_leads: notificarLeads,
          notificar_entregas: notificarEntregas,
          notificar_estoque: notificarEstoque
        })
      });

      const data = await response.json();

      if (data.success) {
        showNotification('✅ Configurações de notificação salvas!');
      } else {
        showNotification(`❌ ${data.error || 'Erro ao salvar'}`);
      }
    } catch (error) {
      console.error('[API] Erro ao salvar notificações:', error);
      showNotification('❌ Erro ao salvar configurações');
    } finally {
      setSalvandoNotificacoes(false);
    }
  };

  const testarNotificacao = async () => {
    if (!numeroGerente) {
      showNotification('⚠️ Configure o número do gerente primeiro');
      return;
    }

    setTestandoNotificacao(true);
    try {
      const empresaId = user?.empresa_id || 9;
      const backendApiUrl = BACKEND_API_URL;

      const response = await fetch(`${backendApiUrl}/api/empresa/notificacoes/enviar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresa_id: empresaId,
          tipo: 'venda',
          dados: {
            cliente_nome: 'Cliente Teste',
            cliente_telefone: '(11) 99999-9999',
            produtos_texto: '• 2x Tinta Branca 18L - R$ 89,90\n• 1x Rolo de Pintura - R$ 29,90',
            valor_total: '209,70',
            forma_pagamento: 'PIX',
            tipo_entrega: 'Entrega em domicílio'
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        showNotification('✅ Notificação de teste enviada!');
      } else {
        showNotification(`❌ ${data.error || 'Erro ao enviar teste'}`);
      }
    } catch (error) {
      console.error('[API] Erro ao testar notificação:', error);
      showNotification('❌ Erro ao enviar notificação de teste');
    } finally {
      setTestandoNotificacao(false);
    }
  };

  const toggleBot = async () => {
    setTogglingBot(true);
    try {
      const empresaId = user?.empresa_id || 9;
      const novoStatus = !botAtivo;
      const backendApiUrl = BACKEND_API_URL;

      console.log('[WhatsApp] Toggle bot - empresa_id:', empresaId, 'novo status:', novoStatus);

      const response = await fetch(`${backendApiUrl}/api/empresa/bot/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          empresa_id: empresaId,
          bot_ativo: novoStatus
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[WhatsApp] Resposta toggle:', data);

      if (data.success) {
        setBotAtivo(novoStatus);
        showNotification(`✅ Bot ${novoStatus ? 'ativado' : 'desativado'} com sucesso!`);
      } else {
        showNotification(`❌ ${data.message || 'Erro ao alterar status do bot'}`);
      }
    } catch (error) {
      console.error('[API] Erro ao fazer toggle do bot:', error);
      showNotification('❌ Erro ao conectar com o servidor');
    } finally {
      setTogglingBot(false);
    }
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      // Mudar para "connecting" imediatamente para mostrar tela de aguardo
      setConnectionStatus('connecting');

      const empresaId = user?.empresa_id || 9;
      console.log('[CONNECT] Tentando conectar empresa:', empresaId);

      const response = await fetch(`${BOT_API_URL}/api/bot/connect/${empresaId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      console.log('[CONNECT] Resposta:', data);

      if (data.success) {
        showNotification('🔄 Gerando QR Code...');
        // Iniciar polling de status a cada 2 segundos durante a conexão
        const pollInterval = setInterval(() => {
          fetchStatus();
        }, 2000);

        // Parar polling após 60 segundos
        setTimeout(() => clearInterval(pollInterval), 60000);
      } else {
        throw new Error(data.error || 'Erro ao conectar');
      }
    } catch (error) {
      console.error('[API] Erro ao conectar:', error);
      showNotification('❌ Erro ao gerar QR Code');
      setConnectionStatus('disconnected'); // Voltar para desconectado em caso de erro
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('⚠️ Tem certeza que deseja desconectar este número?\n\nIsso fará logout no WhatsApp do seu celular e você precisará escanear um novo QR Code para reconectar.')) {
      return;
    }

    try {
      setLoading(true);
      const empresaId = user?.empresa_id || 9;

      // Desconectar WhatsApp com logout completo
      const response = await fetch(`${BOT_API_URL}/api/bot/disconnect/${empresaId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (data.success) {
        // Limpar todos os estados
        handleDisconnection();
        showNotification('✅ WhatsApp desconectado! O logout foi feito no seu celular também.');
      } else {
        throw new Error(data.error || 'Erro ao desconectar');
      }
    } catch (error) {
      console.error('[API] Erro ao desconectar:', error);
      showNotification('❌ Erro ao desconectar');
    } finally {
      setLoading(false);
    }
  };

  const copyPhoneNumber = () => {
    if (phoneNumber) {
      navigator.clipboard.writeText(phoneNumber);
      showNotification('📋 Número copiado!');
    }
  };

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
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
        <div className="relative p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                <Smartphone className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Conexão WhatsApp
                </h1>
                <p className="text-white/60 text-sm mt-1">
                  Conecte sua conta WhatsApp para iniciar o atendimento automatizado
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Bot Active Status */}
              <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                botAtivo
                  ? 'bg-green-500/20 border border-green-500/30'
                  : 'bg-white/5 border border-white/10'
              }`}>
                <div className={`h-2 w-2 rounded-full ${
                  botAtivo ? 'bg-green-400 shadow-lg shadow-green-400/50 animate-pulse' : 'bg-white/40'
                }`} />
                <span className={`text-xs font-semibold ${
                  botAtivo ? 'text-green-400' : 'text-white/60'
                }`}>
                  {botAtivo ? '✓ Bot Ativo' : '⏸ Bot Pausado'}
                </span>
              </div>

              {/* WebSocket Status */}
              <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                wsConnected
                  ? 'bg-cyan-500/20 border border-cyan-500/30'
                  : 'bg-red-500/20 border border-red-500/30'
              }`}>
                <div className={`h-2 w-2 rounded-full ${
                  wsConnected ? 'bg-cyan-400 shadow-lg shadow-cyan-400/50 animate-pulse' : 'bg-red-400'
                }`} />
                <span className={`text-xs font-semibold ${
                  wsConnected ? 'text-cyan-400' : 'text-red-400'
                }`}>
                  {wsConnected ? 'WebSocket Ativo' : 'WebSocket Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status da Conexão - Card Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status e Controles */}
        <div className="relative overflow-hidden rounded-2xl card-glass">
          <div className={`absolute inset-0 ${
            connectionStatus === 'connected'
              ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/5'
              : connectionStatus === 'connecting'
              ? qrCode
                ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/5'
                : 'bg-gradient-to-br from-cyan-500/10 to-blue-500/5'
              : 'bg-gradient-to-br from-white/5 to-white/2'
          }`} />
          <div className="relative">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {connectionStatus === 'connected' ? (
                  <CheckCircle2 className="h-6 w-6 text-green-400" />
                ) : connectionStatus === 'connecting' ? (
                  <Loader2 className="h-6 w-6 text-cyan-400 animate-spin" />
                ) : (
                  <XCircle className="h-6 w-6 text-white/40" />
                )}
                Status da Conexão
              </h2>
              <p className="text-white/60 text-sm mt-1">
                {connectionStatus === 'connected'
                  ? 'WhatsApp conectado e pronto para uso'
                  : connectionStatus === 'connecting'
                  ? qrCode ? 'Escaneie o QR Code no seu WhatsApp' : 'Aguardando geração do QR Code...'
                  : 'WhatsApp não conectado'}
              </p>
            </div>
            <div className="p-6 space-y-6">
              {/* Indicador de Status */}
              <div className="flex items-center justify-center p-8 card-glass rounded-2xl">
                <div className="text-center">
                  {connectionStatus === 'connected' ? (
                    <div className="relative">
                      <div className="h-32 w-32 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto shadow-2xl shadow-green-500/50">
                        <Smartphone className="h-16 w-16 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 h-10 w-10 bg-green-400 rounded-full border-4 border-black shadow-lg shadow-green-400/50 flex items-center justify-center animate-pulse">
                        <CheckCircle2 className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  ) : connectionStatus === 'authenticating' ? (
                    <div className="relative">
                      <div className="h-32 w-32 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto animate-pulse shadow-2xl shadow-amber-500/50">
                        <Loader2 className="h-16 w-16 text-white animate-spin" />
                      </div>
                      {/* Círculos animados ao redor */}
                      <div className="absolute inset-0 rounded-full border-4 border-amber-400/30 animate-ping" />
                      <div className="absolute inset-0 rounded-full border-4 border-amber-400/20" style={{ animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
                    </div>
                  ) : connectionStatus === 'connecting' ? (
                    <div className="relative">
                      <div className="h-32 w-32 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto animate-pulse shadow-2xl shadow-cyan-500/50">
                        <Loader2 className="h-16 w-16 text-white animate-spin" />
                      </div>
                      {/* Círculos animados ao redor */}
                      <div className="absolute inset-0 rounded-full border-4 border-cyan-400/30 animate-ping" />
                      <div className="absolute inset-0 rounded-full border-4 border-cyan-400/20" style={{ animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
                    </div>
                  ) : (
                    <div className="h-32 w-32 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center mx-auto">
                      <WifiOff className="h-16 w-16 text-white/40" />
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-white mt-6">
                    {connectionStatus === 'connected'
                      ? 'Conectado'
                      : connectionStatus === 'authenticating'
                      ? 'Conectando...'
                      : connectionStatus === 'connecting'
                      ? qrCode ? 'Aguardando QR Code' : 'Preparando conexão...'
                      : 'Desconectado'}
                  </h3>
                  <p className="text-white/60 mt-2">
                    {connectionStatus === 'connected' && phoneNumber ? (
                      <span className="font-mono text-green-400">{phoneNumber}</span>
                    ) : connectionStatus === 'authenticating' ? (
                      <span className="text-amber-400 animate-pulse">
                        ⏳ Autenticando seu WhatsApp... Não clique em conectar novamente!
                      </span>
                    ) : connectionStatus === 'connecting' ? (
                      <span className="text-cyan-400 animate-pulse">
                        {qrCode ? '📱 Escaneie o QR Code no seu celular' : '⏳ Iniciando conexão com WhatsApp...'}
                      </span>
                    ) : null}
                  </p>
                </div>
              </div>

              {/* Bot Ativo/Inativo Toggle */}
              <div className="card-glass rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-white font-semibold mb-1 flex items-center gap-2">
                      <Bot className="h-4 w-4 text-green-400" />
                      Status do Bot
                    </p>
                    <p className="text-white/60 text-xs">
                      {botAtivo ? 'Bot ativo e respondendo mensagens automaticamente' : 'Bot pausado, não responderá mensagens'}
                    </p>
                  </div>
                  <button
                    onClick={toggleBot}
                    disabled={togglingBot}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-black ${
                      botAtivo ? 'bg-green-500' : 'bg-white/20'
                    } ${togglingBot ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                        botAtivo ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                {togglingBot && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-white/60">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Atualizando status...
                  </div>
                )}
              </div>

              {/* Notificações do Gerente */}
              <div className="card-glass rounded-2xl p-4 space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Phone className="h-5 w-5 text-green-400" />
                  <h3 className="text-white font-semibold">Alertas para Gerente</h3>
                </div>

                <div>
                  <label className="text-white/60 text-xs block mb-1">WhatsApp do Gerente</label>
                  <input
                    type="text"
                    value={numeroGerente}
                    onChange={(e) => setNumeroGerente(e.target.value)}
                    placeholder="(42) 99930-0611"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 text-sm"
                  />
                  <p className="text-white/40 text-xs mt-1">Receba alertas de vendas, leads e entregas</p>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificarVendas}
                      onChange={(e) => setNotificarVendas(e.target.checked)}
                      className="w-4 h-4 rounded bg-white/10 border-white/20 text-green-500 focus:ring-green-500"
                    />
                    <span className="text-white/80 text-sm">Notificar novas vendas</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificarLeads}
                      onChange={(e) => setNotificarLeads(e.target.checked)}
                      className="w-4 h-4 rounded bg-white/10 border-white/20 text-green-500 focus:ring-green-500"
                    />
                    <span className="text-white/80 text-sm">Notificar novos leads</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificarEntregas}
                      onChange={(e) => setNotificarEntregas(e.target.checked)}
                      className="w-4 h-4 rounded bg-white/10 border-white/20 text-green-500 focus:ring-green-500"
                    />
                    <span className="text-white/80 text-sm">Notificar status de entregas</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificarEstoque}
                      onChange={(e) => setNotificarEstoque(e.target.checked)}
                      className="w-4 h-4 rounded bg-white/10 border-white/20 text-green-500 focus:ring-green-500"
                    />
                    <span className="text-white/80 text-sm">Alertar estoque baixo</span>
                  </label>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={salvarNotificacoesGerente}
                    disabled={salvandoNotificacoes}
                    className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {salvandoNotificacoes ? 'Salvando...' : 'Salvar'}
                  </button>
                  <button
                    onClick={testarNotificacao}
                    disabled={testandoNotificacao || !numeroGerente}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
                  >
                    {testandoNotificacao ? 'Enviando...' : 'Testar'}
                  </button>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="space-y-3">
                {connectionStatus === 'disconnected' && (
                  <Button
                    onClick={handleConnect}
                    disabled={loading}
                    className="w-full h-14 btn-primary-neon text-white text-lg shadow-lg shadow-green-500/30"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Gerando QR Code...
                      </>
                    ) : (
                      <>
                        <QrCode className="h-5 w-5 mr-2" />
                        Conectar WhatsApp
                      </>
                    )}
                  </Button>
                )}

                {connectionStatus === 'connected' && (
                  <>
                    <Button
                      onClick={copyPhoneNumber}
                      className="w-full h-12 bg-white/5 hover:bg-white/10 text-white border border-white/10"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar Número
                    </Button>
                    <Button
                      onClick={handleDisconnect}
                      disabled={loading}
                      className="w-full h-12 bg-red-600/80 hover:bg-red-600 text-white"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Desconectando...
                        </>
                      ) : (
                        <>
                          <LogOut className="h-4 w-4 mr-2" />
                          Desconectar WhatsApp
                        </>
                      )}
                    </Button>
                  </>
                )}

                {connectionStatus === 'authenticating' && (
                  <div className="card-glass rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-5 w-5 text-amber-400 animate-spin" />
                      <div className="flex-1 text-left">
                        <p className="text-white font-semibold">Autenticando...</p>
                        <p className="text-white/60 text-sm">Aguarde, não clique em conectar novamente</p>
                      </div>
                    </div>
                  </div>
                )}

                {(connectionStatus === 'connecting' || connectionStatus === 'authenticating') && (
                  <Button
                    onClick={fetchStatus}
                    className="w-full h-12 bg-white/5 hover:bg-white/10 text-white border border-white/10"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar Status
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* QR Code ou Estatísticas */}
        <div className="relative overflow-hidden rounded-2xl card-glass">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
          <div className="relative">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {connectionStatus === 'connecting' ? (
                  qrCode ? (
                    <>
                      <QrCode className="h-5 w-5 text-amber-400" />
                      QR Code
                    </>
                  ) : (
                    <>
                      <Loader2 className="h-5 w-5 text-cyan-400 animate-spin" />
                      Aguardando
                    </>
                  )
                ) : (
                  <>
                    <Zap className="h-5 w-5 text-green-400" />
                    Estatísticas
                  </>
                )}
              </h2>
              <p className="text-white/60 text-sm mt-1">
                {connectionStatus === 'connecting'
                  ? qrCode
                    ? 'Escaneie com seu WhatsApp'
                    : 'Preparando QR Code...'
                  : 'Atividade da conta conectada'}
              </p>
            </div>
            <div className="p-6">
              {connectionStatus === 'connecting' && !qrCode && (
                <div className="text-center py-12">
                  <div className="relative inline-block mb-6">
                    <Loader2 className="h-24 w-24 text-cyan-400 animate-spin mx-auto" />
                    <div className="absolute inset-0 rounded-full border-4 border-cyan-400/20 animate-ping" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Preparando conexão...</h3>
                  <p className="text-white/60 mb-6">
                    Aguarde enquanto geramos seu QR Code
                  </p>
                  <div className="flex items-center justify-center gap-2 text-cyan-400 text-sm">
                    <div className="h-2 w-2 bg-cyan-400 rounded-full animate-pulse" />
                    <span>Conectando ao servidor WhatsApp</span>
                  </div>
                </div>
              )}

              {connectionStatus === 'connecting' && qrCode && (
                <div className="flex items-center justify-center p-8 card-glass rounded-2xl">
                  <img
                    src={qrCode}
                    alt="QR Code WhatsApp"
                    className="w-full max-w-sm rounded-xl"
                  />
                </div>
              )}

              {connectionStatus === 'connected' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative overflow-hidden rounded-xl card-glass p-4 text-center hover:bg-white/5 transition-colors">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-2 shadow-lg shadow-green-500/30">
                        <MessageSquare className="h-5 w-5 text-white" />
                      </div>
                      <p className="text-2xl font-bold text-white">{stats.mensagensHoje}</p>
                      <p className="text-xs text-white/60 mt-1">Mensagens Hoje</p>
                    </div>
                    <div className="relative overflow-hidden rounded-xl card-glass p-4 text-center hover:bg-white/5 transition-colors">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center mx-auto mb-2 shadow-lg shadow-emerald-500/30">
                        <Phone className="h-5 w-5 text-white" />
                      </div>
                      <p className="text-2xl font-bold text-white">{stats.conversasAtivas}</p>
                      <p className="text-xs text-white/60 mt-1">Conversas Ativas</p>
                    </div>
                  </div>

                  {sessionInfo && (
                    <div className="card-glass rounded-xl p-4 space-y-3">
                      <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-green-400" />
                        Informações da Sessão
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                          <span className="text-white/60">Nome:</span>
                          <span className="text-white font-medium">{sessionInfo.pushname || 'Não definido'}</span>
                        </div>
                        <div className="flex justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                          <span className="text-white/60">Número:</span>
                          <span className="text-white font-mono">{phoneNumber}</span>
                        </div>
                        {stats.ultimaAtividade && (
                          <div className="flex justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                            <span className="text-white/60">Última atividade:</span>
                            <span className="text-white">
                              {new Date(stats.ultimaAtividade).toLocaleString('pt-BR')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {connectionStatus === 'disconnected' && (
                <div className="text-center py-12">
                  <AlertCircle className="h-16 w-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60">
                    Conecte seu WhatsApp para ver as estatísticas
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Instruções */}
      <div className="relative overflow-hidden rounded-2xl card-glass">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
        <div className="relative">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-green-400" />
              Como Conectar
            </h2>
          </div>
          <div className="p-6">
            <ol className="space-y-3 text-white/80">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400 text-sm font-bold">
                  1
                </span>
                <span>Clique no botão "Conectar WhatsApp" acima</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400 text-sm font-bold">
                  2
                </span>
                <span>Abra o WhatsApp no seu celular</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400 text-sm font-bold">
                  3
                </span>
                <span>Toque em Menu (⋮) ou Configurações e selecione "Aparelhos conectados"</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400 text-sm font-bold">
                  4
                </span>
                <span>Toque em "Conectar um aparelho" e escaneie o QR Code exibido na tela</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-green-500/50">
                  ✓
                </span>
                <span className="text-green-400 font-semibold">Pronto! Seu WhatsApp está conectado ao bot</span>
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* Style for animations */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
      `}</style>
    </div>
  );
}

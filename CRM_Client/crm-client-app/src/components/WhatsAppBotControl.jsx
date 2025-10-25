/**
 * ════════════════════════════════════════════════════════════════════════════
 * COMPONENTE: WhatsApp Bot Control
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Componente React para controlar o bot WhatsApp VendeAI
 *
 * FUNCIONALIDADES:
 * - Exibe QR code para conexão do WhatsApp
 * - Mostra status da conexão em tempo real (WebSocket)
 * - Permite ativar/desativar o bot
 * - Conectar/desconectar WhatsApp
 * - Informações sobre a conta conectada
 *
 * ════════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useRef } from 'react';
import { QrCode, Power, Wifi, WifiOff, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';

const BOT_API_URL = 'http://localhost:3010';
const WS_URL = 'ws://localhost:3010/ws';

export default function WhatsAppBotControl({ user, botConfig }) {
  // Estados
  const [botStatus, setBotStatus] = useState({
    connected: false,
    connectionStatus: 'disconnected', // 'connecting' | 'connected' | 'disconnected'
    qrCode: null,
    phoneNumber: null,
    lastUpdate: null,
    error: null
  });

  const [loading, setLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [botAtivo, setBotAtivo] = useState(false); // Estado do bot (ativo/inativo)
  const [togglingBot, setTogglingBot] = useState(false); // Loading do toggle
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // ══════════════════════════════════════════════════════════════
  // WEBSOCKET - Conexão em tempo real
  // ══════════════════════════════════════════════════════════════

  const connectWebSocket = () => {
    try {
      console.log('🔌 Conectando ao WebSocket do bot...');
      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log('✅ WebSocket conectado!');
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('📨 Mensagem do bot:', message);

          if (message.type === 'status') {
            setBotStatus(message.data);
          } else if (message.type === 'qr') {
            setBotStatus(prev => ({
              ...prev,
              qrCode: message.data.qrCode,
              connectionStatus: 'connecting'
            }));
          } else if (message.type === 'qr_cleared') {
            setBotStatus(prev => ({
              ...prev,
              qrCode: null
            }));
          }
        } catch (error) {
          console.error('❌ Erro ao processar mensagem do WebSocket:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ Erro no WebSocket:', error);
        setWsConnected(false);
      };

      ws.onclose = () => {
        console.log('❌ WebSocket desconectado');
        setWsConnected(false);

        // Tentar reconectar após 3 segundos
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('🔄 Tentando reconectar ao WebSocket...');
          connectWebSocket();
        }, 3000);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('❌ Erro ao criar WebSocket:', error);
      setWsConnected(false);
    }
  };

  // ══════════════════════════════════════════════════════════════
  // FETCH STATUS - Buscar status inicial via API REST
  // ══════════════════════════════════════════════════════════════

  const fetchBotStatus = async () => {
    try {
      const response = await fetch(`${BOT_API_URL}/api/bot/status`);
      const data = await response.json();

      if (data.success) {
        setBotStatus(data.data);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar status do bot:', error);
    }
  };

  // Buscar status de ativo/inativo do banco de dados
  const fetchBotActiveStatus = async () => {
    try {
      const empresaId = user?.empresa_id || 5;
      const response = await fetch(`${botConfig.apiUrl}/api/bot-config/${empresaId}`);
      const data = await response.json();

      if (data.success && data.data) {
        setBotAtivo(data.data.bot_ativo || false);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar status ativo do bot:', error);
    }
  };

  // Ativar/Desativar o bot no banco de dados
  const toggleBot = async () => {
    setTogglingBot(true);
    try {
      const empresaId = user?.empresa_id || 5;
      const novoStatus = !botAtivo;

      const response = await fetch(`${botConfig.apiUrl}/api/bot-config/${empresaId}/toggle`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bot_ativo: novoStatus
        })
      });

      const data = await response.json();

      if (data.success) {
        setBotAtivo(novoStatus);
        console.log(`✅ Bot ${novoStatus ? 'ativado' : 'desativado'} com sucesso!`);
        alert(`Bot ${novoStatus ? 'ativado' : 'desativado'} com sucesso!`);
      } else {
        console.error('❌ Erro ao alterar status do bot:', data.error);
        alert('Erro ao alterar status do bot. Tente novamente.');
      }
    } catch (error) {
      console.error('❌ Erro ao fazer toggle do bot:', error);
      alert('Erro ao conectar com o servidor. Verifique se a API está rodando.');
    } finally {
      setTogglingBot(false);
    }
  };

  // ══════════════════════════════════════════════════════════════
  // AÇÕES DO BOT
  // ══════════════════════════════════════════════════════════════

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BOT_API_URL}/api/bot/disconnect`, {
        method: 'POST'
      });

      const data = await response.json();
      if (data.success) {
        console.log('✅ Bot desconectado');
      }
    } catch (error) {
      console.error('❌ Erro ao desconectar bot:', error);
      alert('Erro ao desconectar o bot. Verifique se o servidor está rodando.');
    } finally {
      setLoading(false);
    }
  };

  const handleReconnect = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BOT_API_URL}/api/bot/reconnect`, {
        method: 'POST'
      });

      const data = await response.json();
      if (data.success) {
        console.log('✅ Bot reconectando...');
      }
    } catch (error) {
      console.error('❌ Erro ao reconectar bot:', error);
      alert('Erro ao reconectar o bot. Verifique se o servidor está rodando.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshQR = () => {
    fetchBotStatus();
  };

  // ══════════════════════════════════════════════════════════════
  // LIFECYCLE - Conectar WebSocket ao montar
  // ══════════════════════════════════════════════════════════════

  useEffect(() => {
    // Buscar status inicial do WhatsApp
    fetchBotStatus();

    // Buscar status de ativo/inativo do banco de dados
    fetchBotActiveStatus();

    // Conectar WebSocket
    connectWebSocket();

    // Cleanup ao desmontar
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  // ══════════════════════════════════════════════════════════════
  // RENDER - Status Badge
  // ══════════════════════════════════════════════════════════════

  const renderStatusBadge = () => {
    if (botStatus.connectionStatus === 'connected') {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-400" />
          <span className="text-green-400 font-semibold">Conectado</span>
        </div>
      );
    } else if (botStatus.connectionStatus === 'connecting') {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <Loader2 className="h-5 w-5 text-yellow-400 animate-spin" />
          <span className="text-yellow-400 font-semibold">Aguardando QR Code</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
          <XCircle className="h-5 w-5 text-red-400" />
          <span className="text-red-400 font-semibold">Desconectado</span>
        </div>
      );
    }
  };

  // ══════════════════════════════════════════════════════════════
  // RENDER - Component
  // ══════════════════════════════════════════════════════════════

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-xl border border-gray-200/50 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-gray-100/30"></div>
        <div className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                <Wifi className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  WhatsApp Bot - AIra
                </h2>
                <p className="text-slate-600 text-sm mt-1">
                  Conecte seu WhatsApp para ativar o bot de vendas
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Bot Active Status */}
              <div className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
                botAtivo
                  ? 'bg-green-500/10 text-green-600 border-green-500/30'
                  : 'bg-gray-500/10 text-gray-600 border-gray-500/30'
              }`}>
                {botAtivo ? '✓ Bot Ativo' : '⏸ Bot Pausado'}
              </div>

              {/* WebSocket Status */}
              <div className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
                wsConnected
                  ? 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                  : 'bg-red-500/10 text-red-600 border-red-500/30'
              }`}>
                {wsConnected ? '● Tempo Real' : '● Offline'}
              </div>
            </div>
          </div>

          {/* Status Section */}
          <div className="mb-4">
            {renderStatusBadge()}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Code Section */}
        <div className="relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-xl border border-gray-200/50 shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-gray-100/30"></div>
          <div className="relative">
            <div className="p-6 border-b border-gray-200/50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <QrCode className="h-5 w-5 text-green-600" />
                QR Code de Conexão
              </h3>
            </div>
            <div className="p-6">

          {botStatus.connectionStatus === 'connected' ? (
            <div className="flex flex-col items-center justify-center py-8">
              <CheckCircle className="h-16 w-16 text-green-400 mb-4" />
              <p className="text-green-400 font-semibold text-lg">WhatsApp Conectado!</p>
              {botStatus.phoneNumber && (
                <p className="text-gray-400 text-sm mt-2">
                  Número: {botStatus.phoneNumber}
                </p>
              )}
            </div>
          ) : botStatus.qrCode ? (
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-xl">
                <img
                  src={botStatus.qrCode}
                  alt="QR Code WhatsApp"
                  className="w-64 h-64"
                />
              </div>
              <p className="text-gray-400 text-sm mt-4 text-center">
                Escaneie este QR code com seu WhatsApp
              </p>
              <button
                onClick={handleRefreshQR}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all shadow-lg shadow-green-500/30"
              >
                <RefreshCw className="h-4 w-4" />
                Atualizar QR
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-slate-600">
              <QrCode className="h-16 w-16 mb-4 opacity-50" />
              <p className="text-center">
                Aguardando QR code...
                <br />
                <span className="text-sm">Certifique-se de que o bot está rodando</span>
              </p>
              <button
                onClick={handleRefreshQR}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-slate-700 rounded-lg transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Verificar Status
              </button>
            </div>
          )}
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-xl border border-gray-200/50 shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-gray-100/30"></div>
          <div className="relative">
            <div className="p-6 border-b border-gray-200/50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Power className="h-5 w-5 text-green-600" />
                Controles do Bot
              </h3>
            </div>
            <div className="p-6">

              <div className="space-y-4">
                {/* Connection Info */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-slate-600 text-sm mb-2">Status da Conexão</p>
                  <p className="text-slate-900 font-semibold">
                    {botStatus.connectionStatus === 'connected' ? 'Conectado e Ativo' :
                     botStatus.connectionStatus === 'connecting' ? 'Conectando...' :
                     'Desconectado'}
                  </p>
                  {botStatus.lastUpdate && (
                    <p className="text-slate-500 text-xs mt-2">
                      Última atualização: {new Date(botStatus.lastUpdate).toLocaleString('pt-BR')}
                    </p>
                  )}
                </div>

                {/* Bot Ativo/Inativo Toggle */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-slate-900 font-semibold mb-1">Status do Bot</p>
                      <p className="text-slate-600 text-xs">
                        {botAtivo ? 'Bot ativo e respondendo mensagens' : 'Bot pausado, não responde mensagens'}
                      </p>
                    </div>
                    <button
                      onClick={toggleBot}
                      disabled={togglingBot}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                        botAtivo ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gray-300'
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
                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Atualizando...
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {botStatus.connectionStatus === 'connected' ? (
                    <button
                      onClick={handleDisconnect}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors shadow-lg shadow-red-500/30"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Desconectando...
                        </>
                      ) : (
                        <>
                          <WifiOff className="h-5 w-5" />
                          Desconectar WhatsApp
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleReconnect}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-all shadow-lg shadow-green-500/30"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Conectando...
                        </>
                      ) : (
                        <>
                          <Wifi className="h-5 w-5" />
                          Conectar WhatsApp
                        </>
                      )}
                    </button>
                  )}

                  <button
                    onClick={fetchBotStatus}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-slate-700 rounded-lg font-semibold transition-colors"
                  >
                    <RefreshCw className="h-5 w-5" />
                    Atualizar Status
                  </button>
                </div>

                {/* Error Display */}
                {botStatus.error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <p className="text-red-600 text-sm font-semibold mb-1">Erro:</p>
                    <p className="text-red-500 text-sm">{botStatus.error}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-xl border border-green-200/50 shadow-md">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/30"></div>
        <div className="relative p-6">
          <h4 className="text-green-600 font-semibold mb-3 flex items-center gap-2 text-lg">
            <span>ℹ️</span> Como conectar
          </h4>
          <ol className="text-slate-700 text-sm space-y-2 ml-4 list-decimal">
            <li>Certifique-se de que o bot está rodando (node main.js)</li>
            <li>Aguarde o QR code aparecer acima</li>
            <li>Abra o WhatsApp no seu celular</li>
            <li>Vá em Configurações → Aparelhos conectados</li>
            <li>Clique em "Conectar um aparelho"</li>
            <li>Escaneie o QR code</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

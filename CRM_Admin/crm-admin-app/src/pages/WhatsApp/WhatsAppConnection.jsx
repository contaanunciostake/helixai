import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Smartphone, QrCode, Wifi, WifiOff, Power, PowerOff,
  RefreshCw, CheckCircle, XCircle, AlertCircle, Loader2,
  MessageSquare, Zap, Building2, Settings, Phone,
  Bot, Plug, Unplug, RotateCcw
} from 'lucide-react';
import { whatsappApi } from '../../services/whatsappApi';
import { adminApi } from '../../services/adminApi';

export function WhatsAppConnection() {
  // Estado principal
  const [empresas, setEmpresas] = useState([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverOnline, setServerOnline] = useState(false);

  // Estado da conexao
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [qrCode, setQrCode] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [nicho, setNicho] = useState(null);
  const [botType, setBotType] = useState(null);
  const [error, setError] = useState(null);

  // Estado de acoes
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  // WebSocket
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Carregar empresas ao montar
  useEffect(() => {
    carregarEmpresas();
    checkServerHealth();

    const healthInterval = setInterval(checkServerHealth, 30000);
    return () => clearInterval(healthInterval);
  }, []);

  // Conectar WebSocket quando empresa for selecionada
  useEffect(() => {
    if (selectedEmpresa && serverOnline) {
      connectWebSocket();
      carregarStatusEmpresa();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [selectedEmpresa, serverOnline]);

  const checkServerHealth = async () => {
    try {
      await whatsappApi.healthCheck();
      setServerOnline(true);
    } catch (error) {
      console.error('[WhatsApp] Servidor offline:', error);
      setServerOnline(false);
    }
  };

  const carregarEmpresas = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getEmpresas({ per_page: 100 });
      if (response.success) {
        setEmpresas(response.data.empresas);
        // Auto-selecionar primeira empresa se houver apenas uma
        if (response.data.empresas.length === 1) {
          setSelectedEmpresa(response.data.empresas[0]);
        }
      }
    } catch (error) {
      console.error('[WhatsApp] Erro ao carregar empresas:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarStatusEmpresa = async () => {
    if (!selectedEmpresa) return;

    try {
      const response = await whatsappApi.getStatus(selectedEmpresa.id);
      if (response.success) {
        const { connected, connectionStatus: status, phoneNumber: phone, qrCode: qr, nicho: n, botType: bt, error: err } = response.data;

        setConnectionStatus(status || (connected ? 'connected' : 'disconnected'));
        setQrCode(qr);
        setPhoneNumber(phone);
        setNicho(n);
        setBotType(bt);
        setError(err);
      }
    } catch (error) {
      console.error('[WhatsApp] Erro ao carregar status:', error);
    }
  };

  const connectWebSocket = useCallback(() => {
    if (!selectedEmpresa || wsRef.current) return;

    try {
      console.log('[WhatsApp] Conectando WebSocket...');
      const ws = whatsappApi.createWebSocket(selectedEmpresa.id);

      ws.onopen = () => {
        console.log('[WhatsApp] WebSocket conectado');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[WhatsApp] Mensagem WS:', data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('[WhatsApp] Erro ao parsear mensagem:', error);
        }
      };

      ws.onclose = () => {
        console.log('[WhatsApp] WebSocket desconectado');
        wsRef.current = null;

        // Reconectar automaticamente
        if (selectedEmpresa) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, 3000);
        }
      };

      ws.onerror = (error) => {
        console.error('[WhatsApp] Erro WebSocket:', error);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('[WhatsApp] Erro ao criar WebSocket:', error);
    }
  }, [selectedEmpresa]);

  const disconnectWebSocket = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'status':
        setConnectionStatus(data.data.connectionStatus || (data.data.connected ? 'connected' : 'disconnected'));
        setPhoneNumber(data.data.phoneNumber);
        setNicho(data.data.nicho);
        setBotType(data.data.botType);
        setError(data.data.error);
        if (!data.data.qrCode) {
          setQrCode(null);
        }
        break;

      case 'qr':
        console.log('[WhatsApp] QR Code recebido');
        setQrCode(data.data.qrCode);
        setConnectionStatus('qr_generated');
        setConnecting(false);
        break;

      case 'qr_scanned':
        console.log('[WhatsApp] QR Code escaneado');
        setConnectionStatus('authenticating');
        setQrCode(null);
        break;

      case 'connected':
        console.log('[WhatsApp] Conectado!');
        setConnectionStatus('connected');
        setPhoneNumber(data.data.phoneNumber);
        setNicho(data.data.nicho);
        setBotType(data.data.botType);
        setQrCode(null);
        setConnecting(false);
        setError(null);
        break;

      case 'disconnected':
        console.log('[WhatsApp] Desconectado');
        setConnectionStatus('disconnected');
        setPhoneNumber(null);
        setQrCode(null);
        setDisconnecting(false);
        break;

      default:
        console.log('[WhatsApp] Mensagem desconhecida:', data);
    }
  };

  const handleConnect = async () => {
    if (!selectedEmpresa) return;

    try {
      setConnecting(true);
      setError(null);
      setQrCode(null);
      setConnectionStatus('connecting');

      const response = await whatsappApi.connect(selectedEmpresa.id);
      console.log('[WhatsApp] Resposta connect:', response);

      if (!response.success) {
        throw new Error(response.error);
      }

      // QR code sera recebido via WebSocket
    } catch (error) {
      console.error('[WhatsApp] Erro ao conectar:', error);
      setError(error.message);
      setConnectionStatus('disconnected');
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!selectedEmpresa) return;

    try {
      setDisconnecting(true);
      setError(null);

      const response = await whatsappApi.disconnect(selectedEmpresa.id, true);
      console.log('[WhatsApp] Resposta disconnect:', response);

      if (response.success) {
        setConnectionStatus('disconnected');
        setPhoneNumber(null);
        setQrCode(null);
      }
    } catch (error) {
      console.error('[WhatsApp] Erro ao desconectar:', error);
      setError(error.message);
    } finally {
      setDisconnecting(false);
    }
  };

  const handleToggleBot = async () => {
    if (!selectedEmpresa) return;

    try {
      await adminApi.toggleBot(selectedEmpresa.id);
      await carregarEmpresas();
    } catch (error) {
      console.error('[WhatsApp] Erro ao toggle bot:', error);
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-400';
      case 'connecting':
      case 'authenticating':
      case 'qr_generated':
        return 'text-yellow-400';
      case 'reconnecting':
        return 'text-orange-400';
      default:
        return 'text-red-400';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Conectado';
      case 'connecting':
        return 'Iniciando...';
      case 'qr_generated':
        return 'Escaneie o QR Code';
      case 'authenticating':
        return 'Autenticando...';
      case 'reconnecting':
        return 'Reconectando...';
      default:
        return 'Desconectado';
    }
  };

  const getBotTypeInfo = () => {
    switch (botType) {
      case 'vendeai':
        return { name: 'VendeAI Bot', desc: 'IA avanvada para veiculos', color: 'text-blue-400' };
      case 'aira_imob':
        return { name: 'AIra Imob Bot', desc: 'IA para imoveis', color: 'text-purple-400' };
      case 'generic':
        return { name: 'Bot Generico', desc: 'Respostas basicas', color: 'text-gray-400' };
      default:
        return { name: 'Nenhum', desc: 'Bot nao inicializado', color: 'text-gray-500' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  const botInfo = getBotTypeInfo();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Conexao WhatsApp</h2>
          <p className="text-gray-400">Conecte e gerencie o bot WhatsApp</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status do Servidor */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
            serverOnline ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'
          }`}>
            <div className={`h-2 w-2 rounded-full ${serverOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            <span className={`text-xs font-medium ${serverOnline ? 'text-green-400' : 'text-red-400'}`}>
              {serverOnline ? 'Servidor Online' : 'Servidor Offline'}
            </span>
          </div>

          <button
            onClick={() => { carregarEmpresas(); checkServerHealth(); }}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10"
          >
            <RefreshCw className="h-5 w-5" />
            Atualizar
          </button>
        </div>
      </div>

      {/* Seletor de Empresa */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-purple-400" />
          Selecionar Empresa
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {empresas.map((empresa) => (
            <button
              key={empresa.id}
              onClick={() => setSelectedEmpresa(empresa)}
              className={`p-4 rounded-lg border text-left transition-all ${
                selectedEmpresa?.id === empresa.id
                  ? 'bg-purple-500/20 border-purple-500/50'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Building2 className={`h-5 w-5 ${selectedEmpresa?.id === empresa.id ? 'text-purple-400' : 'text-gray-400'}`} />
                <span className="font-medium text-white">{empresa.nome}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {empresa.whatsapp_conectado ? (
                  <span className="flex items-center gap-1 text-green-400">
                    <Wifi className="h-3 w-3" /> Conectado
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-gray-400">
                    <WifiOff className="h-3 w-3" /> Desconectado
                  </span>
                )}
                <span className="text-gray-500">|</span>
                <span className={`px-1.5 py-0.5 rounded ${
                  empresa.nicho === 'veiculos' ? 'bg-blue-500/20 text-blue-400' :
                  empresa.nicho === 'imoveis' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {empresa.nicho || 'Generico'}
                </span>
              </div>
            </button>
          ))}

          {empresas.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-400">
              Nenhuma empresa cadastrada
            </div>
          )}
        </div>
      </div>

      {/* Painel de Conexao */}
      {selectedEmpresa && serverOnline && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* QR Code / Status */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <QrCode className="h-5 w-5 text-purple-400" />
              Status da Conexao
            </h3>

            <div className="flex flex-col items-center py-6">
              {/* Status Indicator */}
              <div className={`flex items-center gap-2 mb-4 ${getStatusColor()}`}>
                {connectionStatus === 'connected' ? (
                  <CheckCircle className="h-6 w-6" />
                ) : connectionStatus === 'disconnected' ? (
                  <XCircle className="h-6 w-6" />
                ) : (
                  <Loader2 className="h-6 w-6 animate-spin" />
                )}
                <span className="text-lg font-medium">{getStatusText()}</span>
              </div>

              {/* QR Code */}
              {qrCode && (
                <div className="mb-6">
                  <div className="bg-white p-4 rounded-xl">
                    <img src={qrCode} alt="QR Code WhatsApp" className="w-64 h-64" />
                  </div>
                  <p className="text-center text-sm text-gray-400 mt-3">
                    Abra o WhatsApp no celular e escaneie o codigo
                  </p>
                </div>
              )}

              {/* Numero Conectado */}
              {phoneNumber && connectionStatus === 'connected' && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/30 mb-4">
                  <Phone className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="text-xs text-gray-400">Numero conectado</p>
                    <p className="text-lg font-bold text-white">+{phoneNumber}</p>
                  </div>
                </div>
              )}

              {/* Erro */}
              {error && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/30 mb-4 w-full">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Botoes */}
              <div className="flex items-center gap-4 w-full mt-4">
                {connectionStatus === 'disconnected' ? (
                  <button
                    onClick={handleConnect}
                    disabled={connecting}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                  >
                    {connecting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Plug className="h-5 w-5" />
                    )}
                    Conectar WhatsApp
                  </button>
                ) : connectionStatus === 'connected' ? (
                  <button
                    onClick={handleDisconnect}
                    disabled={disconnecting}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                  >
                    {disconnecting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Unplug className="h-5 w-5" />
                    )}
                    Desconectar
                  </button>
                ) : qrCode ? (
                  <button
                    onClick={handleConnect}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all"
                  >
                    <RotateCcw className="h-5 w-5" />
                    Gerar Novo QR Code
                  </button>
                ) : (
                  <div className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white/5 text-gray-400 rounded-lg">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Aguardando...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info do Bot */}
          <div className="space-y-6">
            {/* Bot Info */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Bot className="h-5 w-5 text-purple-400" />
                Informacoes do Bot
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <span className="text-sm text-gray-400">Empresa</span>
                  <span className="text-sm font-medium text-white">{selectedEmpresa.nome}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <span className="text-sm text-gray-400">Nicho</span>
                  <span className={`text-sm font-medium px-2 py-0.5 rounded ${
                    nicho === 'veiculos' ? 'bg-blue-500/20 text-blue-400' :
                    nicho === 'imoveis' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {nicho || selectedEmpresa.nicho || 'Generico'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <span className="text-sm text-gray-400">Tipo de Bot</span>
                  <span className={`text-sm font-medium ${botInfo.color}`}>
                    {botInfo.name}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <span className="text-sm text-gray-400">Descricao</span>
                  <span className="text-sm text-gray-300">{botInfo.desc}</span>
                </div>
              </div>
            </div>

            {/* Controle do Bot */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-400" />
                Controle do Bot
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Bot Ativo</p>
                    <p className="text-xs text-gray-400">Ativar/desativar respostas automaticas</p>
                  </div>
                  <button
                    onClick={handleToggleBot}
                    className={`relative w-14 h-7 rounded-full transition-colors ${
                      selectedEmpresa.bot_ativo ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
                        selectedEmpresa.bot_ativo ? 'translate-x-8' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                    <Zap className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-sm font-medium text-white">Dica</p>
                      <p className="text-xs text-gray-400">
                        {connectionStatus === 'connected' && selectedEmpresa.bot_ativo
                          ? 'Bot esta conectado e respondendo automaticamente!'
                          : connectionStatus === 'connected'
                          ? 'Conectado mas bot desativado. Ative para respostas automaticas.'
                          : 'Conecte o WhatsApp para iniciar o bot.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mensagem quando servidor offline */}
      {!serverOnline && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-6">
          <div className="flex items-center gap-4">
            <AlertCircle className="h-8 w-8 text-red-400" />
            <div>
              <h3 className="text-lg font-bold text-white">Servidor Offline</h3>
              <p className="text-gray-400">
                O servidor de bot WhatsApp nao esta respondendo. Verifique se o servico esta rodando na porta 3010.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WhatsAppConnection;

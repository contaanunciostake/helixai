/**
 * ════════════════════════════════════════════════════════════════
 * COMPONENTE: Conversas - Kanban Arrastável (Green Neon Design)
 * ════════════════════════════════════════════════════════════════
 *
 * ATUALIZADO: Integração com WebSocket para tempo real
 * - Conecta ao Bot Server (porta 3010) via WebSocket
 * - Recebe atualizações de novas mensagens em tempo real
 * - Busca conversas reais do banco de dados
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, RefreshCw, AlertTriangle, X, Phone, Clock, MapPin, User, Mail, Wifi, WifiOff } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button.jsx';

export default function Conversations({ user, botConfig, showNotification }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [conversas, setConversas] = useState({
    novo: [],
    emAtendimento: [],
    proposta: [],
    fechado: []
  });

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // ═══════════════════════════════════════════════════════════════
  // WEBSOCKET CONNECTION
  // ═══════════════════════════════════════════════════════════════
  const connectWebSocket = useCallback(() => {
    const empresaId = user?.empresa_id || 9;
    const wsUrl = `ws://localhost:3010/ws?empresa_id=${empresaId}`;

    console.log('[WS] Conectando ao WebSocket:', wsUrl);

    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('[WS] Conectado!');
        setWsConnected(true);
        showNotification && showNotification('Conectado em tempo real', 'success');
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('[WS] Mensagem recebida:', message.type);

          if (message.type === 'new_message') {
            // Nova mensagem recebida - atualizar conversas
            handleNewMessage(message.data);
          } else if (message.type === 'status') {
            console.log('[WS] Status:', message.data);
          }
        } catch (e) {
          console.error('[WS] Erro ao processar mensagem:', e);
        }
      };

      wsRef.current.onclose = () => {
        console.log('[WS] Desconectado');
        setWsConnected(false);

        // Reconectar após 5 segundos
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('[WS] Tentando reconectar...');
          connectWebSocket();
        }, 5000);
      };

      wsRef.current.onerror = (error) => {
        console.error('[WS] Erro:', error);
        setWsConnected(false);
      };
    } catch (error) {
      console.error('[WS] Erro ao criar conexão:', error);
    }
  }, [user, showNotification]);

  // Handler para nova mensagem via WebSocket
  const handleNewMessage = useCallback((data) => {
    console.log('[WS] Nova mensagem:', data);

    // Recarregar conversas para obter dados atualizados
    loadConversations(true);

    // Notificar usuário
    if (!data.enviada_por_bot) {
      showNotification && showNotification(
        `Nova mensagem de ${data.nome}: ${data.mensagem.substring(0, 50)}...`,
        'info'
      );
    }
  }, [showNotification]);

  useEffect(() => {
    loadConversations();
    connectWebSocket();

    // Auto-refresh a cada 30 segundos (backup caso WS falhe)
    const interval = setInterval(() => {
      loadConversations(true);
    }, 30000);

    return () => {
      clearInterval(interval);
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [user, connectWebSocket]);

  const loadConversations = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const empresaId = user?.empresa_id || 9;
      const apiUrl = botConfig?.apiUrl || 'http://localhost:5000';

      // Buscar conversas reais da API
      console.log(`[CONVERSATIONS] Buscando conversas da empresa ${empresaId}...`);

      const response = await fetch(`${apiUrl}/conversas/api/conversations/${empresaId}`);

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log(`[CONVERSATIONS] ${Object.values(data.data).flat().length} conversas carregadas`);
          setConversas(data.data);
          return;
        }
      }

      // Se API falhar, manter estado atual (não usar dados fake)
      console.log('[CONVERSATIONS] API retornou erro ou está indisponível');

      // Definir estado vazio se não houver dados
      if (!conversas.novo.length && !conversas.emAtendimento.length) {
        setConversas({
          novo: [],
          emAtendimento: [],
          proposta: [],
          fechado: []
        });
      }

    } catch (error) {
      console.error('[CONVERSATIONS] Erro ao carregar:', error);

      // Manter dados existentes em caso de erro de rede
      if (!silent) {
        showNotification && showNotification('Erro ao carregar conversas. Tentando novamente...', 'error');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleWhatsApp = (telefone, nome) => {
    const mensagem = `Olá ${nome}! Tudo bem?`;
    const url = `https://wa.me/${telefone.replace(/\D/g, '')}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  const openDetails = (conv) => {
    setSelectedConversation(conv);
  };

  const closeDetails = () => {
    setSelectedConversation(null);
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;

    // Se não há destino (solto fora)
    if (!destination) {
      return;
    }

    // Se não mudou de posição (mesma coluna e mesmo índice)
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    // Copiar estado atual
    const newConversas = {
      novo: [...conversas.novo],
      emAtendimento: [...conversas.emAtendimento],
      proposta: [...conversas.proposta],
      fechado: [...conversas.fechado]
    };

    const sourceColumn = source.droppableId;
    const destColumn = destination.droppableId;

    // Se mover dentro da mesma coluna
    if (sourceColumn === destColumn) {
      const items = Array.from(newConversas[sourceColumn]);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);
      newConversas[sourceColumn] = items;
      setConversas(newConversas);
      showNotification('Conversa reordenada');
      return;
    }

    // Se mover entre colunas diferentes
    const [movedItem] = newConversas[sourceColumn].splice(source.index, 1);
    newConversas[destColumn].splice(destination.index, 0, movedItem);
    setConversas(newConversas);

    // TODO: Aqui você pode fazer uma chamada à API para salvar a mudança de status no banco
    // updateConversationStatus(movedItem.id, destination.droppableId);

    showNotification(`Conversa movida para ${getStatusLabel(destColumn)}`);
  };

  const getStatusLabel = (status) => {
    const labels = {
      novo: 'Novo',
      emAtendimento: 'Em Atendimento',
      proposta: 'Proposta',
      fechado: 'Fechado'
    };
    return labels[status] || status;
  };

  const getTemperaturaColor = (temperatura) => {
    const colors = {
      FRIO: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      MORNO: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      QUENTE: 'bg-red-500/20 text-red-300 border-red-500/30',
      CONVERTIDO: 'bg-green-500/20 text-green-300 border-green-500/30'
    };
    return colors[temperatura] || colors.MORNO;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-12">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-green-400">Carregando conversas...</p>
        </div>
      </div>
    );
  }

  const totalConversas = conversas.novo.length + conversas.emAtendimento.length +
                         conversas.proposta.length + conversas.fechado.length;

  return (
    <div className="min-h-screen bg-black p-6 space-y-6 relative">
      {/* Animated Stars Background */}
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

      {/* Main Card */}
      <div className="relative overflow-hidden rounded-2xl card-glass">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5"></div>

        {/* Header */}
        <div className="relative p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Conversas - Visão Kanban
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-gray-400 text-sm">
                  Gerencie o funil de vendas - Arraste os cards entre as colunas
                  {totalConversas > 0 && ` • ${totalConversas} conversas ativas`}
                </p>
                {/* Indicador WebSocket */}
                <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                  wsConnected
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {wsConnected ? (
                    <>
                      <Wifi className="h-3 w-3" />
                      Tempo Real
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-3 w-3" />
                      Offline
                    </>
                  )}
                </span>
              </div>
            </div>
            <Button
              onClick={() => loadConversations()}
              disabled={refreshing}
              className="btn-primary-neon"
            >
              {refreshing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Atualizando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="relative p-6">
          {totalConversas === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <p className="text-gray-300 text-lg mb-2">Nenhuma conversa encontrada</p>
              <p className="text-gray-500 text-sm">
                As conversas aparecerão aqui quando clientes entrarem em contato
              </p>
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Coluna Novo */}
                <div>
                  <div className="glass-header-novo rounded-lg p-3 mb-3">
                    <h3 className="text-gray-100 font-semibold text-sm">
                      🆕 Novo ({conversas.novo.length})
                    </h3>
                  </div>
                  <Droppable droppableId="novo" isDropDisabled={false}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-3 min-h-[200px] rounded-lg transition-all ${
                          snapshot.isDraggingOver ? 'bg-gray-800/50 p-2 border-2 border-dashed border-gray-600' : ''
                        }`}
                      >
                        {conversas.novo.map((conv, index) => (
                          <Draggable key={conv.id} draggableId={String(conv.id)} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => openDetails(conv)}
                                className={`relative overflow-hidden card-glass-small rounded-lg p-3 hover:border-gray-500 cursor-pointer transition-all ${
                                  snapshot.isDragging ? 'shadow-lg shadow-green-500/20 rotate-2 scale-105' : ''
                                }`}
                              >
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-800/30 to-gray-900/20"></div>
                                <div className="relative">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-gray-100 font-medium text-sm">{conv.nome}</h4>
                                    <span className="text-xs text-gray-400">{conv.hora}</span>
                                  </div>
                                  <p className="text-xs text-gray-400 mb-2 line-clamp-2">{conv.mensagem}</p>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded border border-gray-700">
                                      {conv.origem}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleWhatsApp(conv.telefone, conv.nome);
                                      }}
                                      className="text-green-500 hover:text-green-400"
                                    >
                                      <MessageSquare className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>

                {/* Coluna Em Atendimento */}
                <div>
                  <div className="glass-header-atendimento rounded-lg p-3 mb-3">
                    <h3 className="text-gray-100 font-semibold text-sm">
                      🔄 Em Atendimento ({conversas.emAtendimento.length})
                    </h3>
                  </div>
                  <Droppable droppableId="emAtendimento" isDropDisabled={false}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-3 min-h-[200px] rounded-lg transition-all ${
                          snapshot.isDraggingOver ? 'bg-yellow-900/20 p-2 border-2 border-dashed border-yellow-600' : ''
                        }`}
                      >
                        {conversas.emAtendimento.map((conv, index) => (
                          <Draggable key={conv.id} draggableId={String(conv.id)} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => openDetails(conv)}
                                className={`relative overflow-hidden card-glass-small rounded-lg p-3 hover:border-yellow-500 cursor-pointer transition-all ${
                                  snapshot.isDragging ? 'shadow-lg shadow-yellow-500/20 rotate-2 scale-105' : ''
                                }`}
                              >
                                <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/20 to-orange-900/10"></div>
                                <div className="relative">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-gray-100 font-medium text-sm">{conv.nome}</h4>
                                    <span className="text-xs text-gray-400">{conv.hora}</span>
                                  </div>
                                  <p className="text-xs text-gray-400 mb-2 line-clamp-2">{conv.mensagem}</p>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs bg-yellow-900/30 text-yellow-300 px-2 py-1 rounded border border-yellow-700/50">
                                      {conv.origem}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleWhatsApp(conv.telefone, conv.nome);
                                      }}
                                      className="text-green-500 hover:text-green-400"
                                    >
                                      <MessageSquare className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>

                {/* Coluna Proposta */}
                <div>
                  <div className="glass-header-proposta rounded-lg p-3 mb-3">
                    <h3 className="text-gray-100 font-semibold text-sm">
                      📋 Proposta ({conversas.proposta.length})
                    </h3>
                  </div>
                  <Droppable droppableId="proposta" isDropDisabled={false}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-3 min-h-[200px] rounded-lg transition-all ${
                          snapshot.isDraggingOver ? 'bg-blue-900/20 p-2 border-2 border-dashed border-blue-600' : ''
                        }`}
                      >
                        {conversas.proposta.map((conv, index) => (
                          <Draggable key={conv.id} draggableId={String(conv.id)} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => openDetails(conv)}
                                className={`relative overflow-hidden card-glass-small rounded-lg p-3 hover:border-blue-500 cursor-pointer transition-all ${
                                  snapshot.isDragging ? 'shadow-lg shadow-blue-500/20 rotate-2 scale-105' : ''
                                }`}
                              >
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-indigo-900/10"></div>
                                <div className="relative">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-gray-100 font-medium text-sm">{conv.nome}</h4>
                                    <span className="text-xs text-gray-400">{conv.hora}</span>
                                  </div>
                                  <p className="text-xs text-gray-400 mb-2 line-clamp-2">{conv.mensagem}</p>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs bg-blue-900/30 text-blue-300 px-2 py-1 rounded border border-blue-700/50">
                                      {conv.origem}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleWhatsApp(conv.telefone, conv.nome);
                                      }}
                                      className="text-green-500 hover:text-green-400"
                                    >
                                      <MessageSquare className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>

                {/* Coluna Fechado */}
                <div>
                  <div className="glass-header-fechado rounded-lg p-3 mb-3">
                    <h3 className="text-gray-100 font-semibold text-sm">
                      ✅ Fechado ({conversas.fechado.length})
                    </h3>
                  </div>
                  <Droppable droppableId="fechado" isDropDisabled={false}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-3 min-h-[200px] rounded-lg transition-all ${
                          snapshot.isDraggingOver ? 'bg-green-900/20 p-2 border-2 border-dashed border-green-600' : ''
                        }`}
                      >
                        {conversas.fechado.map((conv, index) => (
                          <Draggable key={conv.id} draggableId={String(conv.id)} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => openDetails(conv)}
                                className={`relative overflow-hidden card-glass-small rounded-lg p-3 hover:border-green-500 cursor-pointer transition-all ${
                                  snapshot.isDragging ? 'shadow-lg shadow-green-500/20 rotate-2 scale-105' : ''
                                }`}
                              >
                                <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-emerald-900/10"></div>
                                <div className="relative">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-gray-100 font-medium text-sm">{conv.nome}</h4>
                                    <span className="text-xs text-gray-400">{conv.hora}</span>
                                  </div>
                                  <p className="text-xs text-gray-400 mb-2 line-clamp-2">{conv.mensagem}</p>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs bg-green-900/30 text-green-300 px-2 py-1 rounded border border-green-700/50">
                                      {conv.origem}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleWhatsApp(conv.telefone, conv.nome);
                                      }}
                                      className="text-green-500 hover:text-green-400"
                                    >
                                      <MessageSquare className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>
            </DragDropContext>
          )}
        </div>
      </div>

      {/* Modal de Detalhes */}
      {selectedConversation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-auto rounded-2xl card-glass">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5"></div>

            {/* Modal Header */}
            <div className="relative p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                  Detalhes da Conversa
                </h3>
                <p className="text-gray-400 text-sm mt-1">Informações completas do contato</p>
              </div>
              <button
                onClick={closeDetails}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="relative p-6 space-y-6">
              {/* Informações Principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card-glass-small rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="h-5 w-5 text-green-400" />
                    <span className="text-gray-400 text-sm">Nome</span>
                  </div>
                  <p className="text-white font-medium">{selectedConversation.nome}</p>
                </div>

                <div className="card-glass-small rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Phone className="h-5 w-5 text-green-400" />
                    <span className="text-gray-400 text-sm">Telefone</span>
                  </div>
                  <p className="text-white font-medium">{selectedConversation.telefone}</p>
                </div>

                <div className="card-glass-small rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="h-5 w-5 text-green-400" />
                    <span className="text-gray-400 text-sm">Email</span>
                  </div>
                  <p className="text-white font-medium">{selectedConversation.email || 'Não informado'}</p>
                </div>

                <div className="card-glass-small rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin className="h-5 w-5 text-green-400" />
                    <span className="text-gray-400 text-sm">Localização</span>
                  </div>
                  <p className="text-white font-medium">{selectedConversation.localizacao || 'Não informado'}</p>
                </div>

                <div className="card-glass-small rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="h-5 w-5 text-green-400" />
                    <span className="text-gray-400 text-sm">Origem</span>
                  </div>
                  <p className="text-white font-medium">{selectedConversation.origem}</p>
                </div>

                <div className="card-glass-small rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-gray-400 text-sm">Temperatura</span>
                  </div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getTemperaturaColor(selectedConversation.temperatura)}`}>
                    {selectedConversation.temperatura}
                  </span>
                </div>
              </div>

              {/* Histórico de Mensagens */}
              <div className="card-glass-small rounded-lg p-4">
                <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-green-400" />
                  Histórico de Mensagens
                </h4>
                <div className="space-y-3 max-h-60 overflow-auto">
                  {selectedConversation.historico && selectedConversation.historico.map((item, index) => (
                    <div key={index} className="border-l-2 border-green-500/30 pl-4 py-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-medium ${
                          item.tipo === 'entrada' ? 'text-gray-400' :
                          item.tipo === 'mensagem' ? 'text-blue-400' :
                          item.tipo === 'resposta' ? 'text-green-400' :
                          'text-emerald-400'
                        }`}>
                          {item.tipo === 'entrada' ? '📥 Entrada' :
                           item.tipo === 'mensagem' ? '💬 Cliente' :
                           item.tipo === 'resposta' ? '🤖 Bot' :
                           '✅ Venda'}
                        </span>
                        <span className="text-xs text-gray-500">{item.hora}</span>
                      </div>
                      <p className="text-sm text-gray-300">{item.mensagem}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleWhatsApp(selectedConversation.telefone, selectedConversation.nome)}
                  className="flex-1 btn-primary-neon py-3 rounded-lg font-medium"
                >
                  <MessageSquare className="h-5 w-5 inline mr-2" />
                  Abrir no WhatsApp
                </button>
                <button
                  onClick={closeDetails}
                  className="px-6 py-3 rounded-lg font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        .card-glass {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .card-glass-small {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(5px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .btn-primary-neon {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
          color: white;
          transition: all 0.3s ease;
        }

        .btn-primary-neon:hover {
          box-shadow: 0 0 30px rgba(16, 185, 129, 0.6);
          transform: translateY(-2px);
        }

        .glass-header-novo {
          background: linear-gradient(135deg, rgba(107, 114, 128, 0.2), rgba(75, 85, 99, 0.1));
          border: 1px solid rgba(156, 163, 175, 0.3);
        }

        .glass-header-atendimento {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.1));
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .glass-header-proposta {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.1));
          border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .glass-header-fechado {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.1));
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }

        /* Scrollbar personalizada */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #059669, #047857);
        }
      `}</style>
    </div>
  );
}

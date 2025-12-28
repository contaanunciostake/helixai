import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook para conexao WebSocket com atualizacoes em tempo real
 * Conecta ao Bot API Server na porta 3010
 */
export function useWebSocket(empresaId = null) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [connectionError, setConnectionError] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const WS_URL = empresaId
    ? `ws://localhost:3010/ws?empresa_id=${empresaId}`
    : 'ws://localhost:3010/ws';

  const connect = useCallback(() => {
    try {
      // Limpar conexao anterior se existir
      if (wsRef.current) {
        wsRef.current.close();
      }

      console.log('[WebSocket] Conectando a:', WS_URL);
      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log('[WebSocket] Conectado com sucesso');
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[WebSocket] Mensagem recebida:', data);
          setLastMessage(data);
        } catch (error) {
          console.error('[WebSocket] Erro ao parsear mensagem:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('[WebSocket] Conexao fechada:', event.code, event.reason);
        setIsConnected(false);

        // Tentar reconectar automaticamente
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          console.log(`[WebSocket] Tentando reconectar em ${delay}ms...`);

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        } else {
          setConnectionError('Nao foi possivel conectar ao servidor');
        }
      };

      ws.onerror = (error) => {
        console.error('[WebSocket] Erro:', error);
        setConnectionError('Erro na conexao WebSocket');
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('[WebSocket] Erro ao criar conexao:', error);
      setConnectionError(error.message);
    }
  }, [WS_URL]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const data = typeof message === 'string' ? message : JSON.stringify(message);
      wsRef.current.send(data);
      return true;
    }
    console.warn('[WebSocket] Nao conectado, mensagem nao enviada');
    return false;
  }, []);

  // Conectar automaticamente ao montar
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    connectionError,
    sendMessage,
    connect,
    disconnect
  };
}

/**
 * Hook para polling de dados com atualizacao automatica
 * Alternativa ao WebSocket para quando ele nao esta disponivel
 */
export function usePolling(fetchFn, interval = 10000, enabled = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const result = await fetchFn();
      setData(result);
      setError(null);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('[Polling] Erro:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    if (!enabled) return;

    // Fetch inicial
    fetchData();

    // Setup do intervalo
    const intervalId = setInterval(fetchData, interval);

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchData, interval, enabled]);

  return {
    data,
    loading,
    error,
    lastUpdate,
    refetch: fetchData
  };
}

/**
 * Hook combinado - tenta WebSocket, fallback para polling
 */
export function useRealTimeData(fetchFn, wsConfig = {}) {
  const { empresaId, pollingInterval = 15000 } = wsConfig;

  const ws = useWebSocket(empresaId);
  const polling = usePolling(fetchFn, pollingInterval, !ws.isConnected);

  return {
    data: ws.lastMessage || polling.data,
    isConnected: ws.isConnected,
    isPolling: !ws.isConnected && !polling.loading,
    loading: polling.loading,
    error: ws.connectionError || polling.error,
    lastUpdate: polling.lastUpdate,
    refetch: polling.refetch
  };
}

export default useWebSocket;

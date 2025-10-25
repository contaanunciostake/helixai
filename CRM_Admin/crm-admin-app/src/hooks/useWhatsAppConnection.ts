/**
 * Hook customizado para gerenciar conexão WhatsApp
 */

import { useState, useEffect, useCallback } from 'react';
import { whatsappService, WhatsAppStatus } from '../services/whatsappService';

export interface WhatsAppConnectionState {
  connected: boolean;
  qrCode: string | null;
  phoneNumber: string | null;
  loading: boolean;
  error: string | null;
  message: string | null;
  botAtivo: boolean;
}

export interface WhatsAppConnectionActions {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  refresh: () => Promise<void>;
  clearSession: () => Promise<void>;
  toggleBot: (ativar: boolean) => Promise<void>;
}

export function useWhatsAppConnection(empresaId: number) {
  const [state, setState] = useState<WhatsAppConnectionState>({
    connected: false,
    qrCode: null,
    phoneNumber: null,
    loading: false,
    error: null,
    message: null,
    botAtivo: false,
  });

  // Atualizar estado
  const updateState = useCallback((updates: Partial<WhatsAppConnectionState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Conectar ao Socket.io e configurar listeners
  useEffect(() => {
    console.log(`[useWhatsAppConnection] Montando para empresa ${empresaId}`);

    // Conectar ao Socket.io
    whatsappService.connectSocket(empresaId, {
      // Callback: Status atual
      onCurrentStatus: (status: WhatsAppStatus) => {
        console.log('[useWhatsAppConnection] Status atual:', status);
        updateState({
          connected: status.connected,
          qrCode: status.qr,
          phoneNumber: status.numero,
          loading: false,
          message: status.connected ? 'Conectado ao WhatsApp' : 'Aguardando conexão',
        });
      },

      // Callback: QR Code gerado
      onQRGenerated: (data) => {
        console.log('[useWhatsAppConnection] QR Code gerado');
        updateState({
          qrCode: data.qr,
          connected: false,
          loading: false,
          message: data.message,
          error: null,
        });
      },

      // Callback: Conexão estabelecida
      onConnectionSuccess: (data) => {
        console.log('[useWhatsAppConnection] Conexão estabelecida!');
        updateState({
          connected: true,
          phoneNumber: data.numero,
          qrCode: null,
          loading: false,
          message: data.message,
          error: null,
        });
      },

      // Callback: Conexão perdida
      onConnectionLost: (data) => {
        console.log('[useWhatsAppConnection] Conexão perdida');
        updateState({
          connected: false,
          phoneNumber: null,
          qrCode: null,
          loading: false,
          message: data.message,
          error: 'Conexão perdida',
        });
      },
    });

    // Buscar status inicial via HTTP
    const fetchInitialStatus = async () => {
      updateState({ loading: true });
      const status = await whatsappService.getConnectionStatus(empresaId);
      if (status) {
        updateState({
          connected: status.connected,
          qrCode: status.qr,
          phoneNumber: status.numero,
          loading: false,
        });
      } else {
        updateState({ loading: false });
      }
    };

    fetchInitialStatus();

    // Cleanup: Desconectar Socket.io ao desmontar
    return () => {
      console.log(`[useWhatsAppConnection] Desmontando para empresa ${empresaId}`);
      whatsappService.disconnectSocket();
    };
  }, [empresaId, updateState]);

  // Ação: Conectar (gerar QR Code)
  const connect = useCallback(async () => {
    try {
      updateState({ loading: true, error: null, message: 'Gerando QR Code...' });
      const result = await whatsappService.generateQRCode(empresaId);

      if (result.success) {
        updateState({
          qrCode: result.qr,
          loading: false,
          message: result.message,
          error: null,
        });
      } else {
        updateState({
          loading: false,
          error: result.message,
          message: null,
        });
      }
    } catch (error: any) {
      updateState({
        loading: false,
        error: error.message || 'Erro ao gerar QR Code',
        message: null,
      });
    }
  }, [empresaId, updateState]);

  // Ação: Desconectar (logout)
  const disconnect = useCallback(async () => {
    try {
      updateState({ loading: true, error: null, message: 'Desconectando...' });
      const result = await whatsappService.disconnect(empresaId);

      if (result.success) {
        updateState({
          connected: false,
          phoneNumber: null,
          qrCode: null,
          loading: false,
          message: result.message,
          error: null,
        });
      } else {
        updateState({
          loading: false,
          error: result.message,
        });
      }
    } catch (error: any) {
      updateState({
        loading: false,
        error: error.message || 'Erro ao desconectar',
      });
    }
  }, [empresaId, updateState]);

  // Ação: Atualizar status
  const refresh = useCallback(async () => {
    try {
      updateState({ loading: true, error: null });
      const status = await whatsappService.getConnectionStatus(empresaId);

      if (status) {
        updateState({
          connected: status.connected,
          qrCode: status.qr,
          phoneNumber: status.numero,
          loading: false,
        });
      } else {
        updateState({
          loading: false,
          error: 'Erro ao atualizar status',
        });
      }
    } catch (error: any) {
      updateState({
        loading: false,
        error: error.message || 'Erro ao atualizar status',
      });
    }
  }, [empresaId, updateState]);

  // Ação: Limpar sessão (forçar novo QR Code)
  const clearSession = useCallback(async () => {
    try {
      updateState({ loading: true, error: null, message: 'Limpando sessão...' });
      const result = await whatsappService.clearSession(empresaId);

      if (result.success) {
        updateState({
          connected: false,
          phoneNumber: null,
          qrCode: null,
          loading: false,
          message: result.message,
          error: null,
        });
        // Automaticamente gerar novo QR Code
        await connect();
      } else {
        updateState({
          loading: false,
          error: result.message,
        });
      }
    } catch (error: any) {
      updateState({
        loading: false,
        error: error.message || 'Erro ao limpar sessão',
      });
    }
  }, [empresaId, updateState, connect]);

  // Ação: Ativar/Desativar bot
  const toggleBot = useCallback(async (ativar: boolean) => {
    try {
      updateState({ loading: true, error: null, message: ativar ? 'Ativando bot...' : 'Desativando bot...' });
      const result = await whatsappService.toggleBot(ativar, empresaId);

      if (result.success) {
        updateState({
          botAtivo: result.bot_ativo ?? ativar,
          loading: false,
          message: result.message,
          error: null,
        });
      } else {
        updateState({
          loading: false,
          error: result.message,
        });
      }
    } catch (error: any) {
      updateState({
        loading: false,
        error: error.message || 'Erro ao ativar/desativar bot',
      });
    }
  }, [updateState, empresaId]);

  // Buscar status do bot do backend Flask (atualizar botAtivo)
  useEffect(() => {
    const fetchBotStatus = async () => {
      const result = await whatsappService.getStatus(empresaId);
      if (result.success && result.status) {
        updateState({
          botAtivo: result.status.bot_ativo ?? false,
          connected: result.status.conectado ?? false,
          phoneNumber: result.status.numero ?? null,
        });
      }
    };

    fetchBotStatus();
    // Atualizar a cada 10 segundos
    const interval = setInterval(fetchBotStatus, 10000);

    return () => clearInterval(interval);
  }, [updateState, empresaId]);

  return {
    ...state,
    connect,
    disconnect,
    refresh,
    clearSession,
    toggleBot,
  };
}

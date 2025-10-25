/**
 * ════════════════════════════════════════════════════════════════════════════
 * INTEGRATED BOT SERVER - Servidor Multi-Tenant com Seleção Automática de Bot
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Servidor Express + WebSocket que:
 * - Gerencia múltiplas sessões WhatsApp simultaneamente
 * - Seleciona automaticamente o bot correto baseado no nicho da empresa
 * - Integra VendeAI Bot (veículos), AIra Imob Bot (imóveis) e bot genérico
 * - Fornece API REST para controle pelo CRM
 *
 * ENDPOINTS:
 * - GET  /api/bot/status/:empresaId          - Status da conexão
 * - POST /api/bot/connect/:empresaId         - Conectar/gerar QR code
 * - POST /api/bot/disconnect/:empresaId      - Desconectar bot
 * - GET  /api/bot/sessions                   - Listar todas as sessões
 * - GET  /api/bot/nicho/:empresaId           - Ver nicho e tipo de bot
 *
 * WEBSOCKET:
 * - ws://localhost:3010/ws?empresa_id=X     - Recebe QR code e status
 *
 * ════════════════════════════════════════════════════════════════════════════
 */

import express from 'express';
import { WebSocketServer } from 'ws';
import http from 'http';
import cors from 'cors';
import url from 'url';
import 'dotenv/config';
import integratedSessionManager from './integrated-session-manager.js';
import botSelector from './bot-selector-by-niche.js';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

const PORT = process.env.WHATSAPP_PORT || 3010;

// Middlewares
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// Log middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ══════════════════════════════════════════════════════════════
// WEBSOCKET - Comunicação em tempo real
// ══════════════════════════════════════════════════════════════
wss.on('connection', (ws, req) => {
  try {
    const params = url.parse(req.url, true).query;
    const empresaId = parseInt(params.empresa_id);

    if (!empresaId || isNaN(empresaId)) {
      console.warn('⚠️ [WS] Conexão sem empresa_id válido');
      ws.close();
      return;
    }

    console.log(`✅ [WS] Cliente conectado - Empresa ${empresaId}`);

    // Adicionar à sessão
    integratedSessionManager.addWebSocketClient(empresaId, ws);

    // Enviar estado atual
    const sessionState = integratedSessionManager.getSessionState(empresaId);
    ws.send(JSON.stringify({
      type: 'status',
      data: sessionState
    }));

    // Se já tem QR code, enviar
    if (sessionState.qrCode) {
      ws.send(JSON.stringify({
        type: 'qr',
        data: { qrCode: sessionState.qrCode }
      }));
    }

    ws.on('close', () => {
      console.log(`❌ [WS] Cliente desconectado - Empresa ${empresaId}`);
      integratedSessionManager.removeWebSocketClient(empresaId, ws);
    });

    ws.on('error', (error) => {
      console.error(`❌ [WS] Erro - Empresa ${empresaId}:`, error.message);
      integratedSessionManager.removeWebSocketClient(empresaId, ws);
    });

  } catch (error) {
    console.error('❌ [WS] Erro ao processar conexão:', error);
    ws.close();
  }
});

// ══════════════════════════════════════════════════════════════
// API REST ENDPOINTS
// ══════════════════════════════════════════════════════════════

/**
 * GET /health - Health check
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/bot/status/:empresaId - Status da conexão
 */
app.get('/api/bot/status/:empresaId', async (req, res) => {
  try {
    const empresaId = parseInt(req.params.empresaId);

    if (isNaN(empresaId)) {
      return res.status(400).json({
        success: false,
        error: 'empresa_id inválido'
      });
    }

    const sessionState = integratedSessionManager.getSessionState(empresaId);

    res.json({
      success: true,
      data: sessionState
    });

  } catch (error) {
    console.error('❌ [STATUS] Erro:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter status'
    });
  }
});

/**
 * POST /api/bot/connect/:empresaId - Conectar bot
 */
const connectingEmpresas = new Set();

app.post('/api/bot/connect/:empresaId', async (req, res) => {
  try {
    const empresaId = parseInt(req.params.empresaId);

    if (isNaN(empresaId)) {
      return res.status(400).json({
        success: false,
        error: 'empresa_id inválido'
      });
    }

    // Evitar múltiplas requisições simultâneas
    if (connectingEmpresas.has(empresaId)) {
      return res.json({
        success: true,
        message: 'Conexão já está em andamento',
        data: { connectionStatus: 'connecting' }
      });
    }

    connectingEmpresas.add(empresaId);
    setTimeout(() => connectingEmpresas.delete(empresaId), 10000);

    console.log(`\n[CONNECT] ======================================`);
    console.log(`[CONNECT] Conectando empresa ${empresaId}...`);

    // Verificar se já está conectado
    if (integratedSessionManager.hasSession(empresaId)) {
      const session = integratedSessionManager.getSession(empresaId);

      if (session.connected) {
        connectingEmpresas.delete(empresaId);
        return res.json({
          success: true,
          message: 'WhatsApp já conectado',
          data: {
            connected: true,
            phoneNumber: session.phoneNumber,
            nicho: session.nicho,
            botType: session.botInstance?.type
          }
        });
      }
    }

    // Criar nova sessão
    await integratedSessionManager.createSession(empresaId);

    connectingEmpresas.delete(empresaId);

    res.json({
      success: true,
      message: 'Sessão iniciada. QR Code será enviado via WebSocket.',
      data: {
        connectionStatus: 'connecting',
        empresaId
      }
    });

  } catch (error) {
    console.error('❌ [CONNECT] Erro:', error);
    connectingEmpresas.delete(parseInt(req.params.empresaId));

    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao conectar bot'
    });
  }
});

/**
 * POST /api/bot/disconnect/:empresaId - Desconectar bot
 */
app.post('/api/bot/disconnect/:empresaId', async (req, res) => {
  try {
    const empresaId = parseInt(req.params.empresaId);

    if (isNaN(empresaId)) {
      return res.status(400).json({
        success: false,
        error: 'empresa_id inválido'
      });
    }

    console.log(`[DISCONNECT] Desconectando empresa ${empresaId}...`);

    const keepAuth = req.body.keepAuth !== false; // Manter auth por padrão

    await integratedSessionManager.destroySession(empresaId, { keepAuth });

    res.json({
      success: true,
      message: 'Bot desconectado com sucesso'
    });

  } catch (error) {
    console.error('❌ [DISCONNECT] Erro:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao desconectar bot'
    });
  }
});

/**
 * GET /api/bot/sessions - Listar todas as sessões
 */
app.get('/api/bot/sessions', (req, res) => {
  try {
    const sessions = integratedSessionManager.getAllSessions();

    res.json({
      success: true,
      data: {
        total: sessions.length,
        sessions
      }
    });

  } catch (error) {
    console.error('❌ [SESSIONS] Erro:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao listar sessões'
    });
  }
});

/**
 * GET /api/bot/nicho/:empresaId - Ver nicho e tipo de bot
 */
app.get('/api/bot/nicho/:empresaId', async (req, res) => {
  try {
    const empresaId = parseInt(req.params.empresaId);

    if (isNaN(empresaId)) {
      return res.status(400).json({
        success: false,
        error: 'empresa_id inválido'
      });
    }

    const nicho = await botSelector.getNichoEmpresa(empresaId);
    const session = integratedSessionManager.getSession(empresaId);

    res.json({
      success: true,
      data: {
        empresaId,
        nicho: nicho || 'generic',
        botType: session?.botInstance?.type || 'none',
        connected: session?.connected || false,
        description: getBotDescription(nicho)
      }
    });

  } catch (error) {
    console.error('❌ [NICHO] Erro:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter nicho'
    });
  }
});

/**
 * POST /api/bot/send-message - Enviar mensagem manual
 */
app.post('/api/bot/send-message', async (req, res) => {
  try {
    const { empresaId, telefone, mensagem } = req.body;

    if (!empresaId || !telefone || !mensagem) {
      return res.status(400).json({
        success: false,
        error: 'Parâmetros faltando (empresaId, telefone, mensagem)'
      });
    }

    const session = integratedSessionManager.getSession(parseInt(empresaId));

    if (!session || !session.connected) {
      return res.status(400).json({
        success: false,
        error: 'Bot não está conectado'
      });
    }

    const jid = telefone.includes('@') ? telefone : `${telefone}@s.whatsapp.net`;

    await session.sock.sendMessage(jid, { text: mensagem });

    res.json({
      success: true,
      message: 'Mensagem enviada com sucesso'
    });

  } catch (error) {
    console.error('❌ [SEND-MESSAGE] Erro:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao enviar mensagem'
    });
  }
});

/**
 * POST /api/bot/clear-cache/:empresaId - Limpar cache de nicho
 */
app.post('/api/bot/clear-cache/:empresaId', (req, res) => {
  try {
    const empresaId = parseInt(req.params.empresaId);

    if (isNaN(empresaId)) {
      return res.status(400).json({
        success: false,
        error: 'empresa_id inválido'
      });
    }

    botSelector.clearNicheCache(empresaId);

    res.json({
      success: true,
      message: 'Cache limpo com sucesso'
    });

  } catch (error) {
    console.error('❌ [CLEAR-CACHE] Erro:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao limpar cache'
    });
  }
});

// ══════════════════════════════════════════════════════════════
// FUNÇÕES AUXILIARES
// ══════════════════════════════════════════════════════════════

function getBotDescription(nicho) {
  const descriptions = {
    veiculos: 'VendeAI Bot - Assistente inteligente para venda de veículos com IA avançada, integração FIPE, simulador de financiamento e agendamento de visitas',
    imoveis: 'AIra Imob Bot - Assistente para venda de imóveis (em desenvolvimento)',
    null: 'Bot Genérico - Respostas automáticas básicas',
    generic: 'Bot Genérico - Respostas automáticas básicas'
  };

  return descriptions[nicho] || descriptions.generic;
}

// ══════════════════════════════════════════════════════════════
// INICIALIZAÇÃO DO SERVIDOR
// ══════════════════════════════════════════════════════════════

server.listen(PORT, () => {
  console.log('\n' + '═'.repeat(70));
  console.log('🚀 INTEGRATED BOT SERVER - MULTI-TENANT COM SELEÇÃO DE BOT');
  console.log('═'.repeat(70));
  console.log(`\n✅ Servidor rodando na porta ${PORT}`);
  console.log(`\n📡 Endpoints disponíveis:`);
  console.log(`   - GET  http://localhost:${PORT}/health`);
  console.log(`   - GET  http://localhost:${PORT}/api/bot/status/:empresaId`);
  console.log(`   - POST http://localhost:${PORT}/api/bot/connect/:empresaId`);
  console.log(`   - POST http://localhost:${PORT}/api/bot/disconnect/:empresaId`);
  console.log(`   - GET  http://localhost:${PORT}/api/bot/sessions`);
  console.log(`   - GET  http://localhost:${PORT}/api/bot/nicho/:empresaId`);
  console.log(`   - POST http://localhost:${PORT}/api/bot/send-message`);
  console.log(`   - POST http://localhost:${PORT}/api/bot/clear-cache/:empresaId`);
  console.log(`\n🔌 WebSocket:`);
  console.log(`   - ws://localhost:${PORT}/ws?empresa_id=X`);
  console.log(`\n🤖 Bots disponíveis:`);
  console.log(`   - VendeAI Bot (veículos) - IA avançada com FIPE, financiamento e áudio`);
  console.log(`   - AIra Imob Bot (imóveis) - Em desenvolvimento`);
  console.log(`   - Bot Genérico (outros nichos) - Respostas básicas`);
  console.log('\n' + '═'.repeat(70) + '\n');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Encerrando servidor...');

  const sessions = integratedSessionManager.getAllSessions();
  for (const session of sessions) {
    await integratedSessionManager.destroySession(session.empresaId, { keepAuth: true });
  }

  server.close(() => {
    console.log('✅ Servidor encerrado');
    process.exit(0);
  });
});

export default app;

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
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Carregar .env da raiz do projeto
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

console.log('[ENV] Carregando variáveis de ambiente...');
console.log('[ENV] ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? '✅ Configurada' : '❌ Não configurada');
console.log('[ENV] OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Configurada' : '❌ Não configurada');
console.log('[ENV] ELEVENLABS_API_KEY:', process.env.ELEVENLABS_API_KEY ? '✅ Configurada' : '❌ Não configurada');
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
 * GET /api/status - Health check (alias para Render.com)
 */
app.get(['/health', '/api/status'], (req, res) => {
  res.json({
    status: 'ok',
    service: 'vendefacil-whatsapp',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    sessions: Object.keys(activeBots).length
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
// ENDPOINT DE TESTE - Simular mensagens e ver respostas
// ══════════════════════════════════════════════════════════════

/**
 * POST /api/bot/test-message - Testar bot sem enviar mensagem real
 * Simula uma mensagem recebida e retorna a resposta da IA
 *
 * Body: { empresaId: number, mensagem: string, telefone?: string }
 */
app.post('/api/bot/test-message', async (req, res) => {
  try {
    const { empresaId, mensagem, telefone = '5500000000000' } = req.body;

    if (!empresaId || !mensagem) {
      return res.status(400).json({
        success: false,
        error: 'empresaId e mensagem são obrigatórios'
      });
    }

    console.log('\n[TEST-MESSAGE] ════════════════════════════════════════════');
    console.log(`[TEST-MESSAGE] Empresa: ${empresaId}`);
    console.log(`[TEST-MESSAGE] Mensagem: ${mensagem}`);
    console.log('[TEST-MESSAGE] ════════════════════════════════════════════\n');

    // Obter sessão completa com bot instance
    const session = integratedSessionManager.getSession(empresaId);

    if (!session || !session.connected) {
      return res.status(400).json({
        success: false,
        error: 'Bot não está conectado. Conecte primeiro via /api/bot/connect/:empresaId'
      });
    }

    // Obter instância do bot da sessão
    const bot = session.botInstance;

    if (!bot) {
      return res.status(400).json({
        success: false,
        error: 'Instância do bot não encontrada na sessão'
      });
    }

    // Verificar se tem a instância AIra com método processar
    if (!bot.aira || !bot.aira.processar) {
      return res.status(400).json({
        success: false,
        error: 'Bot não suporta método de teste (aira.processar não encontrado)'
      });
    }

    // Processar mensagem diretamente pela IA (sem enviar ao WhatsApp)
    const startTime = Date.now();
    const resposta = await bot.aira.processar(telefone, mensagem, 'Cliente Teste');
    const tempoProcessamento = Date.now() - startTime;

    console.log('[TEST-MESSAGE] ════════════════════════════════════════════');
    console.log(`[TEST-MESSAGE] ✅ Resposta gerada em ${tempoProcessamento}ms`);
    console.log(`[TEST-MESSAGE] Resposta: ${resposta?.substring(0, 200)}...`);
    console.log('[TEST-MESSAGE] ════════════════════════════════════════════\n');

    // === DETECTAR E REGISTRAR VENDA ===
    let vendaRegistrada = null;
    let entregaRegistrada = null;

    if (bot.aira.detectarVenda && bot.aira.detectarVenda(mensagem)) {
      console.log('[TEST-MESSAGE] 💰 Detectada confirmacao de venda!');

      try {
        const produtos = bot.aira.produtosInteresse?.get(telefone) || [];
        if (produtos.length > 0) {
          const produtosVenda = produtos.map(p => ({
            produto_id: p.id,
            nome: p.nome,
            quantidade: 1,
            preco: parseFloat(p.preco || 0)
          }));

          const resultadoVenda = await bot.aira.registrarVenda(telefone, {
            nome: 'Cliente Teste',
            produtos: produtosVenda,
            forma_pagamento: 'a_combinar'
          });

          if (resultadoVenda) {
            console.log(`[TEST-MESSAGE] ✅ Venda #${resultadoVenda.pedido_id} registrada automaticamente`);
            vendaRegistrada = resultadoVenda;
          }
        } else {
          console.log('[TEST-MESSAGE] ⚠️ Nenhum produto no interesse para registrar venda');
        }
      } catch (vendaError) {
        console.error('[TEST-MESSAGE] ❌ Erro ao registrar venda:', vendaError.message);
      }
    }

    // === DETECTAR E REGISTRAR DELIVERY ===
    if (bot.aira.detectarDelivery && bot.aira.detectarDelivery(mensagem)) {
      console.log('[TEST-MESSAGE] 🚚 Detectado pedido de delivery!');

      try {
        const historico = bot.aira.getHistorico ? bot.aira.getHistorico(telefone) : [];
        const infoEndereco = bot.aira.extrairEnderecoIA ?
          await bot.aira.extrairEnderecoIA(mensagem, historico) :
          { tem_endereco: false };

        if (infoEndereco.tem_endereco) {
          console.log('[TEST-MESSAGE] 📍 Endereco detectado:', JSON.stringify(infoEndereco));

          const produtos = bot.aira.produtosInteresse?.get(telefone) || [];
          const produtosStr = produtos.map(p => `${p.nome} - R$ ${parseFloat(p.preco || 0).toFixed(2)}`).join(', ');
          const valorTotal = produtos.reduce((acc, p) => acc + parseFloat(p.preco || 0), 0);

          const resultadoEntrega = await bot.aira.registrarEntrega(telefone, {
            nome: 'Cliente Teste',
            endereco: infoEndereco.endereco_completo,
            numero: infoEndereco.numero,
            complemento: infoEndereco.complemento,
            bairro: infoEndereco.bairro,
            cidade: infoEndereco.cidade,
            estado: infoEndereco.estado,
            cep: infoEndereco.cep,
            ponto_referencia: infoEndereco.ponto_referencia,
            descricao_itens: produtosStr || 'Produtos solicitados via WhatsApp',
            valor_total: valorTotal,
            forma_pagamento: 'a_combinar'
          });

          if (resultadoEntrega) {
            console.log(`[TEST-MESSAGE] ✅ Entrega #${resultadoEntrega.entrega_id} registrada automaticamente`);
            entregaRegistrada = resultadoEntrega;
          }
        } else {
          console.log('[TEST-MESSAGE] ⚠️ Endereco nao detectado na mensagem');
        }
      } catch (entregaError) {
        console.error('[TEST-MESSAGE] ❌ Erro ao registrar entrega:', entregaError.message);
      }
    }

    // Obter informações do bot
    const botConfig = bot.aira.botConfig || {};
    const stats = bot.getStats ? bot.getStats() : {};

    res.json({
      success: true,
      data: {
        empresaId,
        nicho: bot.nicho,
        botType: bot.type,
        nomeBot: botConfig.nome_atendente || 'AIra',
        cargo: botConfig.cargo_atendente || 'Atendente',
        mensagemRecebida: mensagem,
        respostaBot: resposta,
        tempoProcessamentoMs: tempoProcessamento,
        conversasAtivas: stats.conversasAtivas || 0,
        audioHabilitado: botConfig.enviar_audio || false,
        vendaRegistrada,
        entregaRegistrada
      }
    });

  } catch (error) {
    console.error('❌ [TEST-MESSAGE] Erro:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao processar mensagem de teste'
    });
  }
});


// ══════════════════════════════════════════════════════════════
// ENDPOINT DE NOTIFICAÇÕES - Enviar mensagens para o gerente
// ══════════════════════════════════════════════════════════════

/**
 * POST /api/bot/send-notification - Enviar notificação para gerente via WhatsApp
 *
 * Body: { empresaId: number, telefone: string, mensagem: string }
 */
app.post('/api/bot/send-notification', async (req, res) => {
  try {
    const { empresaId, telefone, mensagem } = req.body;

    if (!empresaId || !telefone || !mensagem) {
      return res.status(400).json({
        success: false,
        error: 'empresaId, telefone e mensagem são obrigatórios'
      });
    }

    console.log('\n[NOTIFICATION] ════════════════════════════════════════════');
    console.log(`[NOTIFICATION] Empresa: ${empresaId}`);
    console.log(`[NOTIFICATION] Destino: ${telefone}`);
    console.log(`[NOTIFICATION] Mensagem: ${mensagem.substring(0, 100)}...`);
    console.log('[NOTIFICATION] ════════════════════════════════════════════\n');

    // Obter sessão do WhatsApp
    const session = integratedSessionManager.getSession(empresaId);

    if (!session || !session.connected) {
      return res.status(400).json({
        success: false,
        error: 'WhatsApp não está conectado'
      });
    }

    // Obter socket do WhatsApp (Baileys)
    const sock = session.sock;

    if (!sock) {
      return res.status(400).json({
        success: false,
        error: 'Socket WhatsApp não encontrado na sessão'
      });
    }

    // Formatar número para Baileys (usar @s.whatsapp.net)
    let numeroFormatado = telefone.replace(/\D/g, '');
    if (!numeroFormatado.startsWith('55')) {
      numeroFormatado = '55' + numeroFormatado;
    }
    const jid = `${numeroFormatado}@s.whatsapp.net`;

    // Enviar mensagem via Baileys
    try {
      await sock.sendMessage(jid, { text: mensagem });

      console.log(`[NOTIFICATION] ✅ Mensagem enviada para ${telefone}`);

      res.json({
        success: true,
        message: 'Notificação enviada com sucesso!',
        data: {
          telefone,
          empresaId,
          enviado_em: new Date().toISOString()
        }
      });

    } catch (sendError) {
      console.error(`[NOTIFICATION] ❌ Erro ao enviar: ${sendError.message}`);
      res.status(500).json({
        success: false,
        error: `Erro ao enviar mensagem: ${sendError.message}`
      });
    }

  } catch (error) {
    console.error('❌ [NOTIFICATION] Erro geral:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao enviar notificação'
    });
  }
});


/**
 * GET /api/bot/test-produtos/:empresaId - Testar busca de produtos
 * Busca produtos usando a IA do bot
 *
 * Query: ?q=termo de busca
 */
app.get('/api/bot/test-produtos/:empresaId', async (req, res) => {
  try {
    const empresaId = parseInt(req.params.empresaId);
    const query = req.query.q || 'tinta branca';

    if (isNaN(empresaId)) {
      return res.status(400).json({
        success: false,
        error: 'empresaId inválido'
      });
    }

    // Obter sessão com bot
    const session = integratedSessionManager.getSession(empresaId);

    if (!session || !session.botInstance) {
      return res.status(400).json({
        success: false,
        error: 'Bot não está conectado'
      });
    }

    const bot = session.botInstance;

    // Verificar se tem IA Master com busca de produtos
    if (!bot.aira || !bot.aira.iaMaster) {
      return res.status(400).json({
        success: false,
        error: 'Bot não tem IA Master configurada'
      });
    }

    // Buscar produtos usando o módulo de busca
    const iaMaster = bot.aira.iaMaster;
    let produtos = [];

    if (iaMaster.modulos && iaMaster.modulos.buscadorProdutos) {
      produtos = await iaMaster.modulos.buscadorProdutos.buscarProdutos(query, empresaId);
    } else if (iaMaster.buscarProdutos) {
      produtos = await iaMaster.buscarProdutos(query);
    }

    res.json({
      success: true,
      data: {
        empresaId,
        query,
        totalEncontrados: produtos.length,
        produtos: produtos.slice(0, 10).map(p => ({
          id: p.id,
          nome: p.nome,
          preco: p.preco,
          categoria: p.categoria,
          marca: p.marca
        }))
      }
    });

  } catch (error) {
    console.error('❌ [TEST-PRODUTOS] Erro:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao buscar produtos'
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
    atacado_varejo: 'AIra Atacado/Varejo - Assistente inteligente para distribuidoras e lojas com IA avançada, busca de produtos, consulta de estoque e preços',
    ATACADO_VAREJO: 'AIra Atacado/Varejo - Assistente inteligente para distribuidoras e lojas com IA avançada, busca de produtos, consulta de estoque e preços',
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
  console.log(`   - AIra Atacado/Varejo (atacado_varejo) - IA para distribuidoras e lojas`);
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

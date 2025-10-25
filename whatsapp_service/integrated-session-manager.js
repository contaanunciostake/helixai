/**
 * ════════════════════════════════════════════════════════════════════════════
 * INTEGRATED SESSION MANAGER - Gerenciador Multi-Sessão com Seleção de Bot
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Gerencia múltiplas sessões WhatsApp e seleciona o bot correto por nicho:
 * - VEICULOS → VendeAI Bot (IA avançada)
 * - IMOVEIS → AIra Imob Bot
 * - Outros → Bot Genérico
 *
 * RECURSOS:
 * - ✅ Multi-tenant (múltiplas empresas)
 * - ✅ Seleção automática de bot por nicho
 * - ✅ Isolamento completo entre empresas
 * - ✅ Gerenciamento de QR Codes
 * - ✅ Reconexão automática
 *
 * ════════════════════════════════════════════════════════════════════════════
 */

import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import path from 'path';
import fs from 'fs';
import QRCode from 'qrcode';
import mysql from 'mysql2/promise';
import botSelector from './bot-selector-by-niche.js';
import VendeAIBotWrapper from './vendeai-bot-wrapper.js';

class IntegratedSessionManager {
  constructor() {
    this.sessions = new Map(); // empresa_id → SessionData
    this.pendingWsClients = new Map(); // empresa_id → Set<WebSocket>
    this.authBaseDir = 'auth_info_baileys';
    this.logger = pino({ level: 'silent' });

    // Pool de banco de dados
    this.dbPool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'helixai_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    console.log('✅ [INTEGRATED-SESSION-MANAGER] Inicializado');
  }

  /**
   * Obter todas as sessões ativas
   */
  getAllSessions() {
    const sessionsInfo = [];
    for (const [empresaId, session] of this.sessions.entries()) {
      sessionsInfo.push({
        empresaId,
        connected: session.connected,
        phoneNumber: session.phoneNumber,
        connectionStatus: session.connectionStatus,
        nicho: session.nicho,
        botType: session.botInstance?.type
      });
    }
    return sessionsInfo;
  }

  /**
   * Verificar se sessão existe
   */
  hasSession(empresaId) {
    return this.sessions.has(empresaId);
  }

  /**
   * Obter sessão específica
   */
  getSession(empresaId) {
    return this.sessions.get(empresaId);
  }

  /**
   * Obter estado da sessão
   */
  getSessionState(empresaId) {
    const session = this.sessions.get(empresaId);
    if (!session) {
      return {
        connected: false,
        connectionStatus: 'disconnected',
        phoneNumber: null,
        qrCode: null,
        error: null,
        nicho: null,
        botType: null
      };
    }

    return {
      connected: session.connected,
      connectionStatus: session.connectionStatus,
      phoneNumber: session.phoneNumber,
      qrCode: session.qrCode,
      error: session.error,
      nicho: session.nicho,
      botType: session.botInstance?.type
    };
  }

  /**
   * Criar nova sessão WhatsApp
   */
  async createSession(empresaId, options = {}) {
    try {
      console.log(`\n🔌 [SESSION-MANAGER] Criando sessão para empresa ${empresaId}...`);

      // Verificar se já existe
      if (this.sessions.has(empresaId)) {
        const existingSession = this.sessions.get(empresaId);
        if (existingSession.connected) {
          console.log(`✅ [SESSION-MANAGER] Sessão já conectada`);
          return existingSession;
        }

        console.log(`🔄 [SESSION-MANAGER] Destruindo sessão antiga...`);
        await this.destroySession(empresaId, { keepAuth: false });
      }

      // Buscar configuração da empresa
      const config = await this._getEmpresaConfig(empresaId);
      if (!config) {
        throw new Error('Configuração da empresa não encontrada');
      }

      // Obter nicho da empresa
      const nicho = await botSelector.getNichoEmpresa(empresaId);

      // Diretório de autenticação
      const authDir = path.join(this.authBaseDir, `empresa_${empresaId}`);
      if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
      }

      // State de autenticação
      const { state, saveCreds } = await useMultiFileAuthState(authDir);
      const { version } = await fetchLatestBaileysVersion();

      // Criar socket WhatsApp
      const sock = makeWASocket({
        version,
        logger: this.logger,
        printQRInTerminal: false,
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, this.logger)
        },
        generateHighQualityLinkPreview: true
      });

      // Criar objeto de sessão
      const sessionData = {
        sock,
        empresaId,
        nicho,
        config,
        connected: false,
        connectionStatus: 'connecting',
        phoneNumber: null,
        qrCode: null,
        error: null,
        createdAt: Date.now(),
        wsClients: new Set(),
        botInstance: null // Será inicializado após conexão
      };

      // Salvar sessão
      this.sessions.set(empresaId, sessionData);

      // Event handlers
      sock.ev.on('creds.update', saveCreds);

      sock.ev.on('connection.update', async (update) => {
        await this._handleConnectionUpdate(empresaId, update);
      });

      sock.ev.on('messages.upsert', async ({ messages }) => {
        await this._handleIncomingMessages(empresaId, messages);
      });

      console.log(`✅ [SESSION-MANAGER] Sessão criada para empresa ${empresaId} (nicho: ${nicho || 'GENÉRICO'})`);
      return sessionData;

    } catch (error) {
      console.error(`❌ [SESSION-MANAGER] Erro ao criar sessão:`, error);
      throw error;
    }
  }

  /**
   * Handler de atualização de conexão
   * @private
   */
  async _handleConnectionUpdate(empresaId, update) {
    const session = this.sessions.get(empresaId);
    if (!session) return;

    const { connection, lastDisconnect, qr } = update;

    // QR Code recebido
    if (qr) {
      console.log(`\n📱 [SESSION-MANAGER] QR Code gerado para empresa ${empresaId}`);

      try {
        // Gerar QR code em base64
        const qrBase64 = await QRCode.toDataURL(qr);
        session.qrCode = qrBase64;
        session.connectionStatus = 'qr_generated';

        // Broadcast para clientes WebSocket
        this._broadcastToClients(empresaId, {
          type: 'qr',
          data: { qrCode: qrBase64 }
        });

        // Salvar no banco de dados
        await this._saveQRCodeToDatabase(empresaId, qrBase64);

      } catch (error) {
        console.error(`❌ [SESSION-MANAGER] Erro ao gerar QR:`, error);
      }
    }

    // Conexão estabelecida
    if (connection === 'open') {
      console.log(`✅ [SESSION-MANAGER] WhatsApp conectado para empresa ${empresaId}`);

      session.connected = true;
      session.connectionStatus = 'connected';
      session.qrCode = null;
      session.phoneNumber = session.sock.user?.id?.split(':')[0] || null;

      // Inicializar bot baseado no nicho
      await this._initializeBot(empresaId);

      // Broadcast para clientes
      this._broadcastToClients(empresaId, {
        type: 'connected',
        data: {
          phoneNumber: session.phoneNumber,
          nicho: session.nicho,
          botType: session.botInstance?.type
        }
      });

      // Atualizar banco de dados
      await this._updateConnectionStatus(empresaId, true, session.phoneNumber);
    }

    // Conexão fechada
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;

      console.log(`❌ [SESSION-MANAGER] Conexão fechada para empresa ${empresaId}`);
      console.log(`🔄 [SESSION-MANAGER] Deve reconectar? ${shouldReconnect}`);

      session.connected = false;
      session.connectionStatus = shouldReconnect ? 'reconnecting' : 'disconnected';

      // Broadcast para clientes
      this._broadcastToClients(empresaId, {
        type: 'disconnected',
        data: { shouldReconnect }
      });

      // Atualizar banco de dados
      await this._updateConnectionStatus(empresaId, false, null);

      // Reconectar se necessário
      if (shouldReconnect) {
        console.log(`🔄 [SESSION-MANAGER] Reconectando em 5 segundos...`);
        setTimeout(() => {
          this.createSession(empresaId);
        }, 5000);
      } else {
        // Limpar sessão
        this.sessions.delete(empresaId);
        botSelector.removeBotInstance(empresaId);
      }
    }
  }

  /**
   * Inicializar bot baseado no nicho
   * @private
   */
  async _initializeBot(empresaId) {
    try {
      const session = this.sessions.get(empresaId);
      if (!session) return;

      console.log(`[SESSION-MANAGER] 🤖 Inicializando bot para nicho: ${session.nicho || 'GENÉRICO'}`);

      // Se for veículos, usar VendeAI Bot
      if (session.nicho === 'veiculos') {
        session.botInstance = new VendeAIBotWrapper(
          empresaId,
          session.config,
          this.dbPool
        );
        console.log(`[SESSION-MANAGER] ✅ VendeAI Bot inicializado`);
      } else {
        // Bot genérico para outros nichos
        session.botInstance = {
          type: 'generic',
          nicho: session.nicho || 'generic',
          async processarMensagem(telefone, mensagem) {
            return {
              texto: 'Obrigado por entrar em contato! Em breve retornaremos.',
              veiculos: [],
              gerarAudio: false
            };
          }
        };
        console.log(`[SESSION-MANAGER] ✅ Bot Genérico inicializado`);
      }

    } catch (error) {
      console.error(`[SESSION-MANAGER] ❌ Erro ao inicializar bot:`, error);
    }
  }

  /**
   * Handler de mensagens recebidas
   * @private
   */
  async _handleIncomingMessages(empresaId, messages) {
    const session = this.sessions.get(empresaId);
    if (!session || !session.connected || !session.botInstance) return;

    for (const message of messages) {
      // Ignorar mensagens enviadas pelo próprio bot
      if (message.key.fromMe) continue;

      // Ignorar mensagens de status
      if (message.key.remoteJid === 'status@broadcast') continue;

      const telefone = message.key.remoteJid.replace('@s.whatsapp.net', '');
      const mensagemTexto = message.message?.conversation ||
                            message.message?.extendedTextMessage?.text || '';

      if (!mensagemTexto.trim()) continue;

      console.log(`\n[SESSION-MANAGER] 📨 Mensagem recebida de ${telefone}`);

      try {
        // Processar com bot específico do nicho
        const resposta = await session.botInstance.processarMensagem(
          telefone,
          mensagemTexto,
          message.key
        );

        // Enviar resposta
        if (resposta.texto) {
          await session.sock.sendMessage(message.key.remoteJid, {
            text: resposta.texto
          });

          console.log(`[SESSION-MANAGER] ✅ Resposta enviada`);
        }

        // Enviar informações dos veículos (se houver)
        if (resposta.veiculos && resposta.veiculos.length > 0) {
          for (const veiculo of resposta.veiculos) {
            const textoVeiculo = this._formatarVeiculo(veiculo);
            await session.sock.sendMessage(message.key.remoteJid, {
              text: textoVeiculo
            });
          }
        }

        // Gerar e enviar áudio (se configurado)
        if (resposta.gerarAudio && session.botInstance.gerarAudio) {
          const audio = await session.botInstance.gerarAudio(resposta.texto);
          if (audio) {
            // TODO: Implementar envio de áudio
          }
        }

      } catch (error) {
        console.error(`[SESSION-MANAGER] ❌ Erro ao processar mensagem:`, error);
      }
    }
  }

  /**
   * Formatar veículo para exibição
   * @private
   */
  _formatarVeiculo(veiculo) {
    return `🚗 *${veiculo.marca} ${veiculo.modelo}*

📅 Ano: ${veiculo.ano_modelo}
💰 Preço: R$ ${veiculo.preco?.toLocaleString('pt-BR')}
⚙️ Motor: ${veiculo.motor || 'N/A'}
🎨 Cor: ${veiculo.cor || 'N/A'}
⛽ Combustível: ${veiculo.combustivel || 'N/A'}
${veiculo.quilometragem ? `📏 KM: ${veiculo.quilometragem}` : ''}

${veiculo.descricao || ''}`;
  }

  /**
   * Destruir sessão
   */
  async destroySession(empresaId, options = {}) {
    try {
      console.log(`[SESSION-MANAGER] 🗑️ Destruindo sessão da empresa ${empresaId}`);

      const session = this.sessions.get(empresaId);
      if (session) {
        // Fechar socket
        if (session.sock) {
          await session.sock.logout();
        }

        // Fechar WebSockets
        for (const ws of session.wsClients) {
          ws.close();
        }

        // Remover instância do bot
        botSelector.removeBotInstance(empresaId);

        // Remover sessão
        this.sessions.delete(empresaId);
      }

      // Limpar arquivos de autenticação se solicitado
      if (!options.keepAuth) {
        const authDir = path.join(this.authBaseDir, `empresa_${empresaId}`);
        if (fs.existsSync(authDir)) {
          fs.rmSync(authDir, { recursive: true, force: true });
          console.log(`[SESSION-MANAGER] 🗑️ Arquivos de auth removidos`);
        }
      }

      console.log(`[SESSION-MANAGER] ✅ Sessão destruída`);

    } catch (error) {
      console.error(`[SESSION-MANAGER] ❌ Erro ao destruir sessão:`, error);
    }
  }

  /**
   * Adicionar cliente WebSocket
   */
  addWebSocketClient(empresaId, ws) {
    const session = this.sessions.get(empresaId);
    if (session) {
      session.wsClients.add(ws);
      console.log(`[SESSION-MANAGER] ✅ Cliente WS adicionado (empresa ${empresaId})`);
    } else {
      if (!this.pendingWsClients.has(empresaId)) {
        this.pendingWsClients.set(empresaId, new Set());
      }
      this.pendingWsClients.get(empresaId).add(ws);
      console.log(`[SESSION-MANAGER] ⏳ Cliente WS pendente (empresa ${empresaId})`);
    }
  }

  /**
   * Remover cliente WebSocket
   */
  removeWebSocketClient(empresaId, ws) {
    const session = this.sessions.get(empresaId);
    if (session) {
      session.wsClients.delete(ws);
    }

    const pending = this.pendingWsClients.get(empresaId);
    if (pending) {
      pending.delete(ws);
    }
  }

  /**
   * Broadcast para clientes WebSocket
   * @private
   */
  _broadcastToClients(empresaId, data) {
    const session = this.sessions.get(empresaId);
    if (!session) return;

    const message = JSON.stringify(data);

    for (const ws of session.wsClients) {
      if (ws.readyState === 1) { // OPEN
        ws.send(message);
      }
    }
  }

  /**
   * Obter configuração da empresa do banco
   * @private
   */
  async _getEmpresaConfig(empresaId) {
    try {
      const [rows] = await this.dbPool.query(`
        SELECT e.*, c.*
        FROM empresas e
        LEFT JOIN configuracoes_bot c ON c.empresa_id = e.id
        WHERE e.id = ?
      `, [empresaId]);

      if (rows.length === 0) return null;

      const row = rows[0];
      return {
        empresa_id: row.id,
        empresa_nome: row.nome,
        nicho: row.nicho,
        bot_ativo: row.bot_ativo,
        auto_resposta_ativa: row.auto_resposta_ativa,
        enviar_audio: row.enviar_audio,
        usar_elevenlabs: row.usar_elevenlabs,
        openai_api_key: row.openai_api_key,
        anthropic_api_key: row.anthropic_api_key || process.env.ANTHROPIC_API_KEY,
        elevenlabs_api_key: row.elevenlabs_api_key,
        elevenlabs_voice_id: row.elevenlabs_voice_id
      };
    } catch (error) {
      console.error(`[SESSION-MANAGER] ❌ Erro ao buscar config:`, error);
      return null;
    }
  }

  /**
   * Salvar QR Code no banco de dados
   * @private
   */
  async _saveQRCodeToDatabase(empresaId, qrCode) {
    try {
      await this.dbPool.query(
        'UPDATE empresas SET whatsapp_qr_code = ? WHERE id = ?',
        [qrCode, empresaId]
      );
    } catch (error) {
      console.error(`[SESSION-MANAGER] ❌ Erro ao salvar QR:`, error);
    }
  }

  /**
   * Atualizar status de conexão no banco
   * @private
   */
  async _updateConnectionStatus(empresaId, connected, phoneNumber) {
    try {
      await this.dbPool.query(`
        UPDATE empresas
        SET whatsapp_conectado = ?, whatsapp_numero = ?
        WHERE id = ?
      `, [connected, phoneNumber, empresaId]);
    } catch (error) {
      console.error(`[SESSION-MANAGER] ❌ Erro ao atualizar status:`, error);
    }
  }
}

// Exportar instância singleton
const integratedSessionManager = new IntegratedSessionManager();
export default integratedSessionManager;

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
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import botSelector from './bot-selector-by-niche.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path do banco SQLite (fallback para desenvolvimento local)
const SQLITE_DB_PATH = join(__dirname, '..', 'backend', 'vendeai.db');

// URL do Backend API (usar variável de ambiente em produção)
const BACKEND_API_URL = process.env.BACKEND_API_URL ||
  (process.env.NODE_ENV === 'production' ? 'https://vendefacil-backend.onrender.com' : 'http://localhost:5000');

import VendeAIBotWrapper from './vendeai-bot-wrapper.js';

class IntegratedSessionManager {
  constructor() {
    this.sessions = new Map(); // empresa_id → SessionData
    this.pendingWsClients = new Map(); // empresa_id → Set<WebSocket>
    this.authBaseDir = 'auth_info_baileys';
    this.logger = pino({ level: 'silent' });

    // Conexão SQLite
    this.db = null;

    console.log('✅ [INTEGRATED-SESSION-MANAGER] Inicializado');
  }

  /**
   * Inicializar conexão com banco de dados SQLite
   */
  async initDB() {
    if (!this.db) {
      return new Promise((resolve, reject) => {
        this.db = new sqlite3.Database(SQLITE_DB_PATH, (err) => {
          if (err) {
            console.error('[SESSION-MANAGER] ❌ Erro ao conectar SQLite:', err);
            reject(err);
          } else {
            console.log(`[SESSION-MANAGER] ✅ Conectado ao SQLite: ${SQLITE_DB_PATH}`);
            resolve();
          }
        });
      });
    }
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
        printQRInTerminal: true, // Ativar para debug
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, this.logger)
        },
        generateHighQualityLinkPreview: true,
        // Configurações adicionais para evitar erros
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 60000,
        keepAliveIntervalMs: 30000,
        browser: ['HelixAI CRM', 'Chrome', '110.0.0']
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

    const { connection, lastDisconnect, qr, isNewLogin } = update;

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

    // QR Code foi escaneado (detectado por update sem qr mas ainda connecting)
    if (connection === 'connecting' && !qr && session.qrCode) {
      console.log(`📱 [SESSION-MANAGER] QR Code escaneado! Aguardando autenticação - Empresa ${empresaId}`);

      session.connectionStatus = 'authenticating';

      // Notificar frontend que QR foi lido
      this._broadcastToClients(empresaId, {
        type: 'qr_scanned',
        data: { message: 'QR Code lido! Autenticando...' }
      });
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
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      console.log(`❌ [SESSION-MANAGER] Conexão fechada para empresa ${empresaId}`);
      console.log(`📊 [SESSION-MANAGER] Status code: ${statusCode}`);
      console.log(`📊 [SESSION-MANAGER] Erro:`, lastDisconnect?.error);
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
   * Inicializar bot baseado no nicho usando Bot Selector
   * @private
   */
  async _initializeBot(empresaId) {
    try {
      const session = this.sessions.get(empresaId);
      if (!session) return;

      console.log(`[SESSION-MANAGER] 🤖 Inicializando bot para nicho: ${session.nicho || 'GENÉRICO'}`);

      // Usar Bot Selector para carregar o bot correto
      const botInstance = await botSelector.selectBot(
        empresaId,
        session.sock,
        session.config
      );

      session.botInstance = botInstance;
      console.log(`[SESSION-MANAGER] ✅ Bot ${botInstance.type} inicializado para empresa ${empresaId}`);

    } catch (error) {
      console.error(`[SESSION-MANAGER] ❌ Erro ao inicializar bot:`, error);

      // Fallback para bot genérico em caso de erro
      session.botInstance = {
        type: 'generic_fallback',
        nicho: session.nicho || 'generic',
        async processMessage(message) {
          return false;
        },
        async processarMensagem(telefone, mensagem) {
          return {
            texto: 'Desculpe, estamos com problemas técnicos. Tente novamente mais tarde.',
            veiculos: [],
            gerarAudio: false
          };
        }
      };
    }
  }

  /**
   * Persistir conversa e mensagem no banco via API Flask
   * @private
   */
  async _persistirMensagem(empresaId, telefone, conteudo, enviadaPorBot = false, nomeContato = null) {
    const FLASK_API = 'http://localhost:5000';

    try {
      // Usar nova API unificada que cria conversa e mensagem
      const response = await fetch(`${FLASK_API}/conversas/api/registrar-mensagem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresa_id: empresaId,
          telefone: telefone.replace('@s.whatsapp.net', ''),
          nome_contato: nomeContato || telefone.replace('@s.whatsapp.net', ''),
          mensagem: conteudo,
          tipo: 'texto',
          enviada_por_bot: enviadaPorBot
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('[SESSION-MANAGER] ❌ Erro HTTP ao persistir:', response.status, errorData);
        return null;
      }

      const data = await response.json();

      if (data.success) {
        console.log(`[SESSION-MANAGER] 💾 Mensagem persistida (conversa: ${data.data.conversa_id}, msg: ${data.data.mensagem_id})`);
        return { conversaId: data.data.conversa_id, mensagemId: data.data.mensagem_id };
      } else {
        console.error('[SESSION-MANAGER] ❌ Erro ao persistir:', data.error);
        return null;
      }

    } catch (error) {
      console.error('[SESSION-MANAGER] ❌ Erro ao persistir mensagem:', error.message);
      return null;
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

      // Extrair nome do contato se disponível
      const nomeContato = message.pushName || telefone;

      console.log(`\n[SESSION-MANAGER] 📨 Mensagem recebida de ${nomeContato} (${telefone})`);

      try {
        // ═══════════════════════════════════════════════════════════════
        // PERSISTIR MENSAGEM RECEBIDA NO BANCO
        // ═══════════════════════════════════════════════════════════════
        const persistido = await this._persistirMensagem(
          empresaId,
          telefone,
          mensagemTexto,
          false,  // não foi enviada pelo bot
          nomeContato
        );

        // Broadcast para CRM - nova mensagem recebida
        if (persistido) {
          this._broadcastToClients(empresaId, {
            type: 'new_message',
            data: {
              conversa_id: persistido.conversaId,
              telefone: telefone,
              nome: nomeContato,
              mensagem: mensagemTexto,
              enviada_por_bot: false,
              timestamp: new Date().toISOString()
            }
          });
        }

        // ═══════════════════════════════════════════════════════════════
        // PROCESSAR COM BOT
        // ═══════════════════════════════════════════════════════════════
        let processado = false;
        let respostaTexto = null;

        if (session.botInstance.processMessage) {
          // Bot novo (VendeAI Integration)
          processado = await session.botInstance.processMessage(message);

          // O bot VendeAI já envia a resposta internamente
          // Precisamos capturar a resposta para persistir
          // (será feito via callback no bot)

        } else if (session.botInstance.processarMensagem) {
          // Bot antigo (compatibilidade)
          const resposta = await session.botInstance.processarMensagem(
            telefone,
            mensagemTexto,
            message.key
          );

          // Enviar resposta do bot antigo
          if (resposta && resposta.texto) {
            await session.sock.sendMessage(message.key.remoteJid, {
              text: resposta.texto
            });

            respostaTexto = resposta.texto;
            console.log(`[SESSION-MANAGER] ✅ Resposta enviada`);
            processado = true;

            // ═══════════════════════════════════════════════════════════
            // PERSISTIR RESPOSTA DO BOT NO BANCO
            // ═══════════════════════════════════════════════════════════
            const persistidoResposta = await this._persistirMensagem(
              empresaId,
              telefone,
              respostaTexto,
              true,  // enviada pelo bot
              nomeContato
            );

            // Broadcast para CRM - resposta do bot
            if (persistidoResposta) {
              this._broadcastToClients(empresaId, {
                type: 'new_message',
                data: {
                  conversa_id: persistidoResposta.conversaId,
                  telefone: telefone,
                  nome: 'Bot',
                  mensagem: respostaTexto,
                  enviada_por_bot: true,
                  timestamp: new Date().toISOString()
                }
              });
            }
          }
        }

        if (!processado) {
          console.log(`[SESSION-MANAGER] ⚠️ Mensagem não processada pelo bot`);
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
   * Obter configuração da empresa via API HTTP (produção) ou SQLite (local)
   * @private
   */
  async _getEmpresaConfig(empresaId) {
    // Em produção, usar API HTTP do backend
    if (process.env.NODE_ENV === 'production' || process.env.USE_HTTP_API === 'true') {
      return this._getEmpresaConfigViaAPI(empresaId);
    }

    // Em desenvolvimento, usar SQLite local
    return this._getEmpresaConfigViaSQLite(empresaId);
  }

  /**
   * Obter configuração via API HTTP do backend
   * @private
   */
  async _getEmpresaConfigViaAPI(empresaId) {
    try {
      console.log(`[SESSION-MANAGER] 🌐 Buscando config via API: ${BACKEND_API_URL}/api/bot/config/${empresaId}`);

      const response = await fetch(`${BACKEND_API_URL}/api/bot/config/${empresaId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      });

      if (!response.ok) {
        console.error(`[SESSION-MANAGER] ❌ API retornou ${response.status}`);

        // Se API falhar, tentar SQLite como fallback
        console.log(`[SESSION-MANAGER] 🔄 Tentando fallback SQLite...`);
        return this._getEmpresaConfigViaSQLite(empresaId);
      }

      const data = await response.json();

      if (!data.success || !data.data) {
        console.warn(`[SESSION-MANAGER] ⚠️ API não retornou dados para empresa ${empresaId}`);
        return null;
      }

      const config = data.data;
      console.log(`[SESSION-MANAGER] ✅ Config via API: empresa ${empresaId}: ${config.empresaNome}, nicho: ${config.nicho}`);

      return {
        empresa_id: empresaId,
        empresa_nome: config.empresaNome,
        nicho: config.nicho,
        bot_ativo: config.botAtivo ?? 1,
        auto_resposta_ativa: config.autoRespostaAtiva ?? 1,
        enviar_audio: config.enviarAudio ?? 0,
        usar_elevenlabs: config.usarElevenlabs ?? 0,
        openai_api_key: config.openaiApiKey,
        anthropic_api_key: config.anthropicApiKey || process.env.ANTHROPIC_API_KEY,
        elevenlabs_api_key: config.elevenlabsApiKey,
        elevenlabs_voice_id: config.elevenlabsVoiceId
      };
    } catch (error) {
      console.error(`[SESSION-MANAGER] ❌ Erro ao buscar config via API:`, error.message);

      // Fallback para SQLite se disponível
      console.log(`[SESSION-MANAGER] 🔄 Tentando fallback SQLite...`);
      return this._getEmpresaConfigViaSQLite(empresaId);
    }
  }

  /**
   * Obter configuração via SQLite local (desenvolvimento)
   * @private
   */
  async _getEmpresaConfigViaSQLite(empresaId) {
    try {
      await this.initDB();

      return new Promise((resolve, reject) => {
        this.db.get(`
          SELECT e.*, c.*
          FROM empresas e
          LEFT JOIN configuracoes_bot c ON c.empresa_id = e.id
          WHERE e.id = ?
        `, [empresaId], (err, row) => {
          if (err) {
            console.error(`[SESSION-MANAGER] ❌ Erro SQLite ao buscar config:`, err);
            resolve(null);
            return;
          }

          if (!row) {
            console.warn(`[SESSION-MANAGER] ⚠️ Empresa ${empresaId} não encontrada no SQLite`);
            resolve(null);
            return;
          }

          console.log(`[SESSION-MANAGER] ✅ Config SQLite empresa ${empresaId}: ${row.nome}, nicho: ${row.nicho}`);
          resolve({
            empresa_id: row.id,
            empresa_nome: row.nome,
            nicho: row.nicho,
            bot_ativo: row.bot_ativo ?? 1,
            auto_resposta_ativa: row.auto_resposta_ativa ?? 1,
            enviar_audio: row.enviar_audio ?? 0,
            usar_elevenlabs: row.usar_elevenlabs ?? 0,
            openai_api_key: row.openai_api_key,
            anthropic_api_key: row.anthropic_api_key || process.env.ANTHROPIC_API_KEY,
            elevenlabs_api_key: row.elevenlabs_api_key,
            elevenlabs_voice_id: row.elevenlabs_voice_id
          });
        });
      });
    } catch (error) {
      console.error(`[SESSION-MANAGER] ❌ Erro SQLite ao buscar config:`, error);
      return null;
    }
  }

  /**
   * Salvar QR Code no banco de dados
   * @private
   */
  async _saveQRCodeToDatabase(empresaId, qrCode) {
    try {
      await this.initDB();

      return new Promise((resolve, reject) => {
        this.db.run(
          'UPDATE empresas SET whatsapp_qr_code = ? WHERE id = ?',
          [qrCode, empresaId],
          (err) => {
            if (err) {
              console.error(`[SESSION-MANAGER] ❌ Erro ao salvar QR:`, err);
            }
            resolve();
          }
        );
      });
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
      await this.initDB();

      return new Promise((resolve, reject) => {
        this.db.run(`
          UPDATE empresas
          SET whatsapp_conectado = ?, whatsapp_numero = ?
          WHERE id = ?
        `, [connected ? 1 : 0, phoneNumber, empresaId], (err) => {
          if (err) {
            console.error(`[SESSION-MANAGER] ❌ Erro ao atualizar status:`, err);
          }
          resolve();
        });
      });
    } catch (error) {
      console.error(`[SESSION-MANAGER] ❌ Erro ao atualizar status:`, error);
    }
  }
}

// Exportar instância singleton
const integratedSessionManager = new IntegratedSessionManager();
export default integratedSessionManager;

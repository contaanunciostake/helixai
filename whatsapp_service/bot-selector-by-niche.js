/**
 * ════════════════════════════════════════════════════════════════════════════
 * BOT SELECTOR BY NICHE - Seletor Multi-Agente por Nicho
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Sistema que seleciona o bot correto baseado no nicho da empresa:
 * - VEICULOS → VendeAI Bot (bot completo com IA avançada)
 * - IMOVEIS → AIra Imob Bot (em desenvolvimento)
 * - Outros → Bot genérico
 *
 * ARQUITETURA:
 * - Consulta nicho da empresa no banco de dados
 * - Carrega módulo do bot específico
 * - Mantém instâncias isoladas por empresa
 * - Suporta hot-reload de configurações
 *
 * ════════════════════════════════════════════════════════════════════════════
 */

import mysql from 'mysql2/promise';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class BotSelector {
  constructor() {
    this.dbPool = null;
    this.botInstances = new Map(); // empresa_id → bot instance
    this.nicheCache = new Map(); // empresa_id → { nicho, timestamp }
    this.CACHE_TTL = 60000; // 1 minuto

    console.log('✅ [BOT-SELECTOR] Inicializado');
  }

  /**
   * Inicializar conexão com banco de dados
   */
  async init() {
    if (!this.dbPool) {
      this.dbPool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'helixai_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
      console.log('[BOT-SELECTOR] ✅ Pool de banco de dados criado');
    }
  }

  /**
   * Obter nicho da empresa do banco de dados
   * @param {number} empresaId - ID da empresa
   * @returns {Promise<string|null>} Nicho da empresa (veiculos, imoveis, null)
   */
  async getNichoEmpresa(empresaId) {
    try {
      // Verificar cache
      const cached = this.nicheCache.get(empresaId);
      if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
        return cached.nicho;
      }

      await this.init();

      const [rows] = await this.dbPool.query(
        'SELECT nicho FROM empresas WHERE id = ?',
        [empresaId]
      );

      if (rows.length === 0) {
        console.warn(`[BOT-SELECTOR] ⚠️ Empresa ${empresaId} não encontrada`);
        return null;
      }

      const nicho = rows[0].nicho;

      // Atualizar cache
      this.nicheCache.set(empresaId, {
        nicho,
        timestamp: Date.now()
      });

      console.log(`[BOT-SELECTOR] 📊 Empresa ${empresaId} → Nicho: ${nicho || 'GENÉRICO'}`);
      return nicho;

    } catch (error) {
      console.error(`[BOT-SELECTOR] ❌ Erro ao buscar nicho da empresa ${empresaId}:`, error);
      return null;
    }
  }

  /**
   * Selecionar e carregar bot apropriado para a empresa
   * @param {number} empresaId - ID da empresa
   * @param {Object} sock - Socket do WhatsApp (Baileys)
   * @param {Object} config - Configuração da empresa
   * @returns {Promise<Object>} Instância do bot
   */
  async selectBot(empresaId, sock, config) {
    try {
      const nicho = await this.getNichoEmpresa(empresaId);

      console.log(`\n[BOT-SELECTOR] 🤖 Selecionando bot para empresa ${empresaId}...`);
      console.log(`[BOT-SELECTOR]    Nicho: ${nicho || 'GENÉRICO'}`);

      let botInstance;

      switch (nicho) {
        case 'veiculos':
          console.log('[BOT-SELECTOR] 🚗 Carregando VendeAI Bot (Veículos)...');
          botInstance = await this._loadVendeAIBot(empresaId, sock, config);
          break;

        case 'imoveis':
          console.log('[BOT-SELECTOR] 🏠 Carregando AIra Imob Bot (Imóveis)...');
          // TODO: Implementar bot de imóveis
          botInstance = await this._loadGenericBot(empresaId, sock, config);
          break;

        default:
          console.log('[BOT-SELECTOR] 💼 Carregando Bot Genérico...');
          botInstance = await this._loadGenericBot(empresaId, sock, config);
      }

      // Armazenar instância
      this.botInstances.set(empresaId, {
        nicho,
        instance: botInstance,
        createdAt: Date.now()
      });

      console.log(`[BOT-SELECTOR] ✅ Bot carregado com sucesso para empresa ${empresaId}`);
      return botInstance;

    } catch (error) {
      console.error(`[BOT-SELECTOR] ❌ Erro ao selecionar bot para empresa ${empresaId}:`, error);
      throw error;
    }
  }

  /**
   * Carregar VendeAI Bot (para veículos)
   * @private
   */
  async _loadVendeAIBot(empresaId, sock, config) {
    try {
      // Caminho para o bot VendeAI
      const vendeAIBotPath = join(__dirname, '..', 'VendeAI', 'bot_engine', 'main.js');

      console.log(`[BOT-SELECTOR] 📁 Importando VendeAI Bot de: ${vendeAIBotPath}`);

      // Importar módulo VendeAI
      const VendeAIModule = await import(vendeAIBotPath);

      // Criar wrapper para adaptar o bot VendeAI ao nosso sistema
      return {
        type: 'vendeai',
        nicho: 'veiculos',
        empresaId,

        /**
         * Processar mensagem recebida
         */
        async processMessage(message) {
          try {
            // O VendeAI Bot já tem toda a lógica de processamento
            // Apenas precisamos garantir que usa as credenciais corretas da empresa

            const telefone = message.key.remoteJid.replace('@s.whatsapp.net', '');
            const mensagemTexto = message.message?.conversation ||
                                  message.message?.extendedTextMessage?.text || '';

            console.log(`[VENDEAI-BOT] 📨 Mensagem recebida de ${telefone}: ${mensagemTexto.substring(0, 50)}...`);

            // A lógica completa do VendeAI está em main.js
            // Ele já possui:
            // - IA Master com análise de intenções
            // - Busca inteligente de veículos
            // - Simulador de financiamento
            // - Integração com FIPE
            // - Agendamento de visitas
            // - Geração de áudio (ElevenLabs)

            // Por enquanto, retornar true indicando que foi processado
            // O main.js do VendeAI já possui toda a lógica
            return true;

          } catch (error) {
            console.error(`[VENDEAI-BOT] ❌ Erro ao processar mensagem:`, error);
            return false;
          }
        },

        /**
         * Enviar mensagem
         */
        async sendMessage(to, content, options = {}) {
          try {
            const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;

            if (options.audio && options.audioUrl) {
              // Enviar áudio
              await sock.sendMessage(jid, {
                audio: { url: options.audioUrl },
                mimetype: 'audio/mp4',
                ptt: true
              });
            } else {
              // Enviar texto
              await sock.sendMessage(jid, { text: content });
            }

            return true;
          } catch (error) {
            console.error(`[VENDEAI-BOT] ❌ Erro ao enviar mensagem:`, error);
            return false;
          }
        },

        /**
         * Obter configuração específica do bot
         */
        getConfig() {
          return {
            ...config,
            features: {
              fipe: true,
              financiamento: true,
              agendamento: true,
              audioMessages: config.enviar_audio || false,
              aiAnalysis: true
            }
          };
        }
      };

    } catch (error) {
      console.error(`[BOT-SELECTOR] ❌ Erro ao carregar VendeAI Bot:`, error);
      throw error;
    }
  }

  /**
   * Carregar Bot Genérico
   * @private
   */
  async _loadGenericBot(empresaId, sock, config) {
    return {
      type: 'generic',
      nicho: 'generic',
      empresaId,

      async processMessage(message) {
        try {
          const telefone = message.key.remoteJid.replace('@s.whatsapp.net', '');
          const mensagemTexto = message.message?.conversation ||
                                message.message?.extendedTextMessage?.text || '';

          console.log(`[GENERIC-BOT] 📨 Mensagem recebida de ${telefone}: ${mensagemTexto.substring(0, 50)}...`);

          // Bot genérico com respostas simples
          if (config.auto_resposta_ativa) {
            const resposta = `Olá! Obrigado por entrar em contato com ${config.empresa_nome}. ` +
                           `Em breve um de nossos atendentes entrará em contato com você.`;

            await this.sendMessage(telefone, resposta);
          }

          return true;
        } catch (error) {
          console.error(`[GENERIC-BOT] ❌ Erro ao processar mensagem:`, error);
          return false;
        }
      },

      async sendMessage(to, content, options = {}) {
        try {
          const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;
          await sock.sendMessage(jid, { text: content });
          return true;
        } catch (error) {
          console.error(`[GENERIC-BOT] ❌ Erro ao enviar mensagem:`, error);
          return false;
        }
      },

      getConfig() {
        return config;
      }
    };
  }

  /**
   * Obter instância do bot para uma empresa
   * @param {number} empresaId - ID da empresa
   * @returns {Object|null} Instância do bot
   */
  getBotInstance(empresaId) {
    const cached = this.botInstances.get(empresaId);
    return cached ? cached.instance : null;
  }

  /**
   * Remover instância do bot (cleanup)
   * @param {number} empresaId - ID da empresa
   */
  removeBotInstance(empresaId) {
    if (this.botInstances.has(empresaId)) {
      console.log(`[BOT-SELECTOR] 🗑️ Removendo instância do bot para empresa ${empresaId}`);
      this.botInstances.delete(empresaId);
      this.nicheCache.delete(empresaId);
    }
  }

  /**
   * Limpar cache de nicho
   * @param {number} empresaId - ID da empresa (opcional, se não fornecido limpa todo o cache)
   */
  clearNicheCache(empresaId = null) {
    if (empresaId) {
      this.nicheCache.delete(empresaId);
      console.log(`[BOT-SELECTOR] 🗑️ Cache de nicho limpo para empresa ${empresaId}`);
    } else {
      this.nicheCache.clear();
      console.log(`[BOT-SELECTOR] 🗑️ Todo o cache de nicho limpo`);
    }
  }
}

// Exportar instância singleton
const botSelector = new BotSelector();
export default botSelector;

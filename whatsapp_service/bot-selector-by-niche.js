/**
 * ════════════════════════════════════════════════════════════════════════════
 * BOT SELECTOR BY NICHE - Seletor Multi-Agente por Nicho
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Sistema que seleciona o bot correto baseado no nicho da empresa:
 * - VEICULOS → VendeAI Bot (bot completo com IA avançada)
 * - IMOVEIS → AIra Imob Bot (em desenvolvimento)
 * - ATACADO_VAREJO → Bot para distribuidoras e lojas (lubrificantes, filtros, etc)
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

import sqlite3 from 'sqlite3';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: join(__dirname, '..', '.env') });

// Path do banco SQLite (mesmo que o Flask usa)
const SQLITE_DB_PATH = join(__dirname, '..', 'backend', 'vendeai.db');

class BotSelector {
  constructor() {
    this.db = null;
    this.botInstances = new Map(); // empresa_id → bot instance
    this.nicheCache = new Map(); // empresa_id → { nicho, timestamp }
    this.CACHE_TTL = 60000; // 1 minuto

    console.log('✅ [BOT-SELECTOR] Inicializado');
    console.log(`[BOT-SELECTOR] 📂 SQLite DB: ${SQLITE_DB_PATH}`);
  }

  /**
   * Inicializar conexão com banco de dados SQLite
   */
  async init() {
    if (!this.db) {
      return new Promise((resolve, reject) => {
        this.db = new sqlite3.Database(SQLITE_DB_PATH, (err) => {
          if (err) {
            console.error('[BOT-SELECTOR] ❌ Erro ao conectar SQLite:', err);
            reject(err);
          } else {
            console.log('[BOT-SELECTOR] ✅ Conectado ao SQLite');
            resolve();
          }
        });
      });
    }
  }

  /**
   * Obter nicho da empresa do banco de dados SQLite
   * @param {number} empresaId - ID da empresa
   * @returns {Promise<string|null>} Nicho da empresa (veiculos, imoveis, loja_tintas, atacado_varejo, null)
   */
  async getNichoEmpresa(empresaId) {
    try {
      // Verificar cache
      const cached = this.nicheCache.get(empresaId);
      if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
        return cached.nicho;
      }

      await this.init();

      return new Promise((resolve, reject) => {
        this.db.get(
          'SELECT nicho FROM empresas WHERE id = ?',
          [empresaId],
          (err, row) => {
            if (err) {
              console.error(`[BOT-SELECTOR] ❌ Erro ao buscar nicho:`, err);
              resolve(null);
              return;
            }

            if (!row) {
              console.warn(`[BOT-SELECTOR] ⚠️ Empresa ${empresaId} não encontrada`);
              resolve(null);
              return;
            }

            const nicho = row.nicho;

            // Atualizar cache
            this.nicheCache.set(empresaId, {
              nicho,
              timestamp: Date.now()
            });

            console.log(`[BOT-SELECTOR] 📊 Empresa ${empresaId} → Nicho: ${nicho || 'GENÉRICO'}`);
            resolve(nicho);
          }
        );
      });

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

      switch (nicho?.toUpperCase()) {
        case 'VEICULOS':
          console.log('[BOT-SELECTOR] 🚗 Carregando VendeAI Bot (Veículos)...');
          botInstance = await this._loadVendeAIBot(empresaId, sock, config);
          break;

        case 'IMOVEIS':
          console.log('[BOT-SELECTOR] 🏠 Carregando AIra Imob Bot (Imóveis)...');
          // TODO: Implementar bot de imóveis
          botInstance = await this._loadGenericBot(empresaId, sock, config);
          break;

        case 'ATACADO_VAREJO':
          console.log('[BOT-SELECTOR] 🏪 Carregando Bot Atacado/Varejo...');
          botInstance = await this._loadAtacadoVarejoBot(empresaId, sock, config);
          break;

        case 'LOJA_TINTAS':
          console.log('[BOT-SELECTOR] 🎨 Carregando Bot Loja de Tintas (Laura IA)...');
          // Por enquanto usa o bot de atacado/varejo que tem as mesmas funcionalidades
          botInstance = await this._loadAtacadoVarejoBot(empresaId, sock, config);
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
      console.log(`[BOT-SELECTOR] 🚗 Carregando VendeAI Bot para empresa ${empresaId}`);

      // Importar módulo de integração do VendeAI
      const { createVendeAIBot } = await import('./vendeai-bot-integration.js');

      // Criar instância do bot VendeAI
      const botInstance = await createVendeAIBot(empresaId, sock, this.db, config);

      console.log(`[BOT-SELECTOR] ✅ VendeAI Bot inicializado para empresa ${empresaId}`);
      return botInstance;

    } catch (error) {
      console.error(`[BOT-SELECTOR] ❌ Erro ao carregar VendeAI Bot:`, error);
      throw error;
    }
  }


  /**
   * Carregar Bot Atacado/Varejo (para distribuidoras e lojas)
   * @private
   */
  async _loadAtacadoVarejoBot(empresaId, sock, config) {
    try {
      console.log(`[BOT-SELECTOR] 🏪 Carregando Bot Atacado/Varejo para empresa ${empresaId}`);

      // Importar módulo do bot atacado/varejo
      const { createAtacadoVarejoBot } = await import('./atacado-varejo-bot.js');

      // Criar instância do bot
      const botInstance = await createAtacadoVarejoBot(empresaId, sock, this.db, config);

      console.log(`[BOT-SELECTOR] ✅ Bot Atacado/Varejo inicializado para empresa ${empresaId}`);
      return botInstance;

    } catch (error) {
      console.error(`[BOT-SELECTOR] ❌ Erro ao carregar Bot Atacado/Varejo:`, error);
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

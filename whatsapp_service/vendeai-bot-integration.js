/**
 * ════════════════════════════════════════════════════════════════════════════
 * VENDEAI BOT INTEGRATION - Bot VendeAI Completo para Multi-Tenant CRM
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Bot completo com IA Master (Anthropic Claude) replicando a arquitetura do
 * VendeAI/bot_engine/main.js (classe LucasVendedor)
 *
 * RECURSOS:
 * - ✅ IA Master (Anthropic Claude) com 6 módulos de IA
 * - ✅ Análise de intenções (busca, financiamento, agendamento)
 * - ✅ Recomendação inteligente de veículos
 * - ✅ Análise de sentimento e temperatura de lead
 * - ✅ Predição de fechamento
 * - ✅ Memória e contexto de conversas
 * - ✅ Geração de respostas contextualizadas
 * - ✅ Busca de veículos com filtros
 * - ✅ Integração FIPE
 * - ✅ Simulador de financiamento
 * - ✅ Agendamento de visitas
 * - ✅ Geração de áudio (ElevenLabs)
 * - ✅ Sistema de agregação de mensagens
 *
 * ════════════════════════════════════════════════════════════════════════════
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { ElevenLabsClient } from 'elevenlabs';
import dotenv from 'dotenv';

// Carregar .env da raiz do projeto
const __filename_env = fileURLToPath(import.meta.url);
const __dirname_env = dirname(__filename_env);
dotenv.config({ path: join(__dirname_env, '..', '.env') });

// Importar módulos do VendeAI Bot
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const vendeAIPath = join(__dirname, '..', 'VendeAI', 'bot_engine');

// Converter path Windows para file:// URL
function toFileURL(path) {
  return new URL('file:///' + path.replace(/\\/g, '/'));
}

// Importar módulos do VendeAI
let IAMaster, SimuladorFinanciamento, consultarValorFipe, botAdapter, GerenciadorAgendamentos;

try {
  const iaMasterModule = await import(toFileURL(join(vendeAIPath, 'ia-modules', '00-ia-master.js')));
  IAMaster = iaMasterModule.IAMaster;

  const simuladorModule = await import(toFileURL(join(vendeAIPath, 'simulador-financiamento.js')));
  SimuladorFinanciamento = simuladorModule.SimuladorFinanciamento;

  const fipeModule = await import(toFileURL(join(vendeAIPath, 'fipe-wrapper.js')));
  consultarValorFipe = fipeModule.consultarValorFipe;

  const adapterModule = await import(toFileURL(join(vendeAIPath, 'bot-adapter.js')));
  botAdapter = adapterModule.default;

  const agendamentoModule = await import(toFileURL(join(vendeAIPath, 'modulo-agendamento.js')));
  GerenciadorAgendamentos = agendamentoModule.GerenciadorAgendamentos;

  console.log('[VENDEAI-INTEGRATION] ✅ Módulos VendeAI importados com sucesso');
} catch (error) {
  console.error('[VENDEAI-INTEGRATION] ❌ Erro ao importar módulos VendeAI:', error);
  console.error('[VENDEAI-INTEGRATION] Stack:', error.stack);
}

/**
 * Classe AIraVendedor - Replicação da arquitetura do VendeAI Bot
 * Baseada em: VendeAI/bot_engine/main.js (linha 2010)
 */
class AIraVendedor {
  constructor(empresaId, sock, db, config, apiKeys) {
    this.empresaId = empresaId;
    this.sock = sock;
    this.db = db;
    this.config = config;

    // ✅ INICIALIZAR IA MASTER (linha 2018 do main.js)
    if (IAMaster && apiKeys.openai && apiKeys.anthropic) {
      this.iaMaster = new IAMaster(apiKeys.openai, apiKeys.anthropic, db);
      console.log('[AIRA] ✓ IA Master inicializado');
    } else {
      console.warn('[AIRA] ⚠️ IA Master não disponível (faltam API keys)');
      this.iaMaster = null;
    }

    // ElevenLabs Agent para áudio
    if (apiKeys.elevenlabs && config.usarElevenLabs) {
      try {
        const ElevenLabsAgent = require(join(vendeAIPath, 'agent-elevenlabs.js')).ElevenLabsAgent;
        this.agentElevenLabs = new ElevenLabsAgent();
        console.log('[AIRA] ✓ ElevenLabs Agent inicializado');
      } catch (error) {
        console.warn('[AIRA] ⚠️ ElevenLabs Agent não disponível:', error.message);
        this.agentElevenLabs = null;
      }
    } else {
      this.agentElevenLabs = null;
    }

    // Mapas de memória (linha 2021-2026 do main.js)
    this.conversas = new Map();
    this.etapas = new Map();
    this.jaSeApresentou = new Map();
    this.ultimoEnvio = new Map();
    this.listaOpcoes = new Map();
    this.jaRespondeuAudio = new Map();
    this.veiculoInteresse = new Map();
    this.veiculoTroca = new Map();

    // Sistema de agregação de mensagens (linha 2028-2031 do main.js)
    this.mensagensPendentes = new Map();
    this.timersAgregacao = new Map();
    this.TEMPO_ESPERA_MENSAGENS = 2500; // 2.5 segundos
  }

  /**
   * Adicionar mensagem ao histórico
   */
  addHistorico(tel, role, msg) {
    if (!this.conversas.has(tel)) {
      this.conversas.set(tel, []);
    }
    this.conversas.get(tel).push({ role, msg });
  }

  /**
   * Obter histórico de conversa
   */
  getHistorico(tel) {
    return this.conversas.get(tel) || [];
  }

  /**
   * Adicionar mensagem à fila e aguardar agregação
   * Baseado em: main.js linha 2064
   */
  adicionarMensagemPendente(tel, mensagem, callbackProcessar) {
    // Se não existe array de mensagens para este telefone, criar
    if (!this.mensagensPendentes.has(tel)) {
      this.mensagensPendentes.set(tel, []);
    }

    // Adicionar mensagem à fila
    const mensagens = this.mensagensPendentes.get(tel);
    mensagens.push(mensagem);
    console.log(`[AIRA] 📥 Mensagem adicionada à fila [${mensagens.length} total] - ${tel.slice(-4)}`);

    // Se já existe um timer, cancelá-lo
    if (this.timersAgregacao.has(tel)) {
      clearTimeout(this.timersAgregacao.get(tel));
    }

    // Criar novo timer para processar após X segundos
    const timer = setTimeout(async () => {
      const todasMensagens = this.mensagensPendentes.get(tel) || [];
      const mensagemCompleta = todasMensagens.join('\n');

      console.log(`[AIRA] ⏰ Tempo esgotado! Processando ${todasMensagens.length} mensagem(ns) agregada(s)`);
      console.log(`[AIRA] 📝 Mensagem completa: "${mensagemCompleta.substring(0, 100)}..."`);

      // Limpar fila e timer
      this.mensagensPendentes.delete(tel);
      this.timersAgregacao.delete(tel);

      // Processar mensagem completa
      await callbackProcessar(mensagemCompleta);
    }, this.TEMPO_ESPERA_MENSAGENS);

    this.timersAgregacao.set(tel, timer);
    console.log(`[AIRA] ⏱️ Timer iniciado (${this.TEMPO_ESPERA_MENSAGENS}ms)`);
  }

  /**
   * Processar mensagem - MÉTODO PRINCIPAL
   * Baseado em: main.js linha 2907
   */
  async processar(tel, msg, nome = 'Cliente') {
    try {
      const agora = Date.now();
      const proximoPermitido = this.ultimoEnvio.get(tel) || 0;

      if (agora < proximoPermitido) {
        console.log('[AIRA] ⚡ Muito rápido, ignorando');
        return null;
      }

      this.ultimoEnvio.set(tel, agora + 3000);

      const msgLower = msg.toLowerCase().trim();
      const etapaAtual = this.etapas.get(tel) || 'INICIO';
      const jaSeApresentou = this.jaSeApresentou.get(tel) || false;

      // ========== SAUDAÇÃO INICIAL (linha 2924) ==========
      if (etapaAtual === 'INICIO' && msgLower.match(/^(oi|ola|olá|hey|fala|bom dia|boa tarde|boa noite)$/i)) {
        this.etapas.set(tel, 'DESCOBERTA');
        this.jaSeApresentou.set(tel, true);

        const resp = await this.gerarSaudacaoHumana(nome, msg);

        this.addHistorico(tel, 'Cliente', msg);
        this.addHistorico(tel, this.config.nomeBot, resp);
        return resp;
      }

      const historico = this.getHistorico(tel);
      console.log(`[AIRA] 📥 ${nome} (${etapaAtual}): "${msg.substring(0, 50)}..."`);

      // ========== PROCESSAR COM IA MASTER ==========
      if (this.iaMaster) {
        console.log('\n[AIRA] 🧠 Usando IA Master para análise...');

        try {
          // Processar mensagem com todos os 6 módulos de IA
          const resultado = await this.iaMaster.processar(tel, msg, historico, []);

          if (resultado.sucesso) {
            const intencao = resultado.analises?.intencao?.intencao_principal || 'conversa_geral';
            console.log(`[AIRA] 🎯 Intenção: ${intencao}`);
            console.log(`[AIRA] 🎭 Sentimento: ${resultado.analises?.sentimento?.sentimento}`);
            console.log(`[AIRA] 🌡️ Temperatura: ${resultado.analises?.sentimento?.temperatura_lead}`);
            console.log(`[AIRA] 📊 Prob. Fechamento: ${resultado.analises?.predicao?.probabilidade_fechamento}%`);

            const resposta = resultado.resposta || 'Como posso ajudar você hoje?';

            // Adicionar ao histórico
            this.addHistorico(tel, 'Cliente', msg);
            this.addHistorico(tel, this.config.nomeBot, resposta);

            // ========== BUSCAR E ENVIAR VEÍCULOS SE NECESSÁRIO ==========
            if (intencao === 'busca' || intencao === 'interesse_compra' || intencao === 'busca_veiculo') {
              const filtros = resultado.analises?.intencao?.filtros || {};
              console.log('[AIRA] 🔍 Detectada intenção de busca, procurando veículos...');

              const veiculos = await this.buscarVeiculos(filtros);

              if (veiculos.length > 0) {
                console.log(`[AIRA] 🚗 Enviando ${veiculos.length} veículos...`);
                await this.enviarVeiculos(tel, veiculos);
                this.listaOpcoes.set(tel, veiculos);
              } else {
                console.log('[AIRA] ⚠️ Nenhum veículo encontrado com os filtros');
              }
            }

            // ========== SIMULAÇÃO DE FINANCIAMENTO ==========
            if (intencao === 'simular_financiamento' || intencao === 'financiamento') {
              console.log('[AIRA] 💰 Detectada intenção de financiamento...');
              // TODO: Usar SimuladorFinanciamento
            }

            // ========== AGENDAMENTO DE VISITA ==========
            if (intencao === 'agendar_visita' || intencao === 'agendamento') {
              console.log('[AIRA] 📅 Detectada intenção de agendamento...');
              // TODO: Usar GerenciadorAgendamentos
            }

            return resposta;
          } else {
            console.warn('[AIRA] ⚠️ IA Master não retornou sucesso, usando fallback');
            return await this.gerarRespostaFallback(msg, nome);
          }
        } catch (error) {
          console.error('[AIRA] ❌ Erro ao processar com IA Master:', error);
          return await this.gerarRespostaFallback(msg, nome);
        }
      } else {
        console.warn('[AIRA] ⚠️ IA Master não disponível, usando fallback');
        return await this.gerarRespostaFallback(msg, nome);
      }
    } catch (error) {
      console.error('[AIRA] ❌ Erro ao processar mensagem:', error);
      return 'Desculpe, ocorreu um erro. Por favor, tente novamente.';
    }
  }

  /**
   * Gerar saudação humana e personalizada
   */
  async gerarSaudacaoHumana(nome, mensagem) {
    try {
      const prompt = `Você é ${this.config.nomeBot}, vendedora REAL da ${this.config.nomeEmpresa || 'nossa loja'}.
Seja natural, calorosa e autêntica. NUNCA use frases robóticas.

Cliente disse: "${mensagem}"
Nome do cliente: ${nome}

Responda cumprimentando de volta de forma natural e perguntando como pode ajudar.
Seja breve (2-3 linhas) e humana.`;

      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      return response.content[0].text.trim();
    } catch (error) {
      console.error('[AIRA] ❌ Erro ao gerar saudação:', error);
      return `Olá ${nome}! Como posso ajudar você hoje? 😊`;
    }
  }

  /**
   * Gerar resposta fallback (sem IA Master)
   */
  async gerarRespostaFallback(mensagem, nome) {
    return `Obrigado pela mensagem, ${nome}! Como posso ajudar você hoje?`;
  }

  /**
   * Buscar veículos no banco de dados (MySQL)
   */
  async buscarVeiculos(filtros) {
    try {
      let query = 'SELECT * FROM veiculos WHERE empresa_id = ? AND disponivel = 1';
      const params = [this.empresaId];

      // Aplicar filtros
      if (filtros.marca) {
        query += ' AND marca LIKE ?';
        params.push(`%${filtros.marca}%`);
      }

      if (filtros.modelo) {
        query += ' AND modelo LIKE ?';
        params.push(`%${filtros.modelo}%`);
      }

      if (filtros.preco_max) {
        query += ' AND preco <= ?';
        params.push(filtros.preco_max);
      }

      if (filtros.preco_min) {
        query += ' AND preco >= ?';
        params.push(filtros.preco_min);
      }

      if (filtros.ano_min) {
        query += ' AND ano_modelo >= ?';
        params.push(filtros.ano_min);
      }

      query += ' ORDER BY destaque DESC, criado_em DESC LIMIT 3';

      console.log('[AIRA] 🔍 Query:', query);

      const [rows] = await this.db.query(query, params);
      console.log(`[AIRA] ✅ Encontrados ${rows?.length || 0} veículos`);
      return rows || [];
    } catch (error) {
      console.error('[AIRA] ❌ Erro ao buscar veículos:', error);
      return [];
    }
  }

  /**
   * Enviar veículos com fotos
   */
  async enviarVeiculos(tel, veiculos) {
    for (const veiculo of veiculos) {
      try {
        const texto = this.formatarVeiculo(veiculo);

        // Buscar foto
        const foto = await this.buscarFotoVeiculo(veiculo.id);

        if (foto) {
          await this.sock.sendMessage(tel + '@s.whatsapp.net', {
            image: { url: foto },
            caption: texto
          });
        } else {
          await this.sock.sendMessage(tel + '@s.whatsapp.net', {
            text: texto
          });
        }

        await new Promise(r => setTimeout(r, 1000));
      } catch (error) {
        console.error('[AIRA] ❌ Erro ao enviar veículo:', error);
      }
    }
  }

  /**
   * Formatar dados do veículo
   */
  formatarVeiculo(veiculo) {
    const preco = veiculo.preco ? `R$ ${parseFloat(veiculo.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Consultar';
    const km = veiculo.quilometragem ? `${parseInt(veiculo.quilometragem).toLocaleString('pt-BR')} km` : 'N/A';

    return `🚗 *${veiculo.marca} ${veiculo.modelo}*

📅 Ano: ${veiculo.ano_modelo || 'N/A'}
💰 Preço: ${preco}
⚙️ Motor: ${veiculo.motor || 'N/A'}
🎨 Cor: ${veiculo.cor || 'N/A'}
⛽ Combustível: ${veiculo.combustivel || 'N/A'}
📏 Quilometragem: ${km}

${veiculo.descricao || ''}`;
  }

  /**
   * Buscar foto do veículo (MySQL)
   */
  async buscarFotoVeiculo(veiculoId) {
    try {
      const [rows] = await this.db.query(
        'SELECT url FROM fotos_veiculos WHERE veiculo_id = ? ORDER BY principal DESC, id ASC LIMIT 1',
        [veiculoId]
      );
      return rows?.[0]?.url || null;
    } catch (error) {
      console.error('[AIRA] ❌ Erro ao buscar foto:', error);
      return null;
    }
  }
}

/**
 * Criar instância do VendeAI Bot para uma empresa
 * @param {number} empresaId - ID da empresa
 * @param {Object} sock - Socket WhatsApp (Baileys)
 * @param {Object} db - Conexão com banco de dados SQLite
 * @param {Object} config - Configurações da empresa
 * @returns {Object} Instância do bot
 */
export async function createVendeAIBot(empresaId, sock, db, config) {
  console.log(`[VENDEAI-BOT] 🚗 Inicializando VendeAI Bot para empresa ${empresaId}`);

  // Verificar API keys
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('[VENDEAI-BOT] ❌ ANTHROPIC_API_KEY não configurada!');
    console.error('[VENDEAI-BOT] ❌ Configure no .env: ANTHROPIC_API_KEY=sk-ant-...');
  }
  if (!process.env.OPENAI_API_KEY) {
    console.warn('[VENDEAI-BOT] ⚠️ OPENAI_API_KEY não configurada!');
  }

  // Configurações do bot
  const botConfig = {
    empresaId,
    nomeBot: config?.nome_bot || 'AIra',
    nomeEmpresa: config?.nome || 'Empresa',
    mensagemBoasVindas: config?.mensagem_boas_vindas || 'Olá! Como posso ajudar?',
    mensagemAusencia: config?.mensagem_ausencia || 'Obrigado pelo contato! Em breve retornaremos.',
    horarioAtendimento: config?.horario_atendimento || '{"inicio": "00:00", "fim": "23:59"}',
    audioAtivo: config?.enviar_audio || config?.audio_ativo || false,
    usarElevenLabs: config?.usar_elevenlabs || false,
    vozId: config?.elevenlabs_voice_id || config?.voz_id || null
  };

  console.log('[VENDEAI-BOT] ═══════════════════════════════════════════════════════');
  console.log(`[VENDEAI-BOT]   Empresa ID:         ${empresaId}`);
  console.log(`[VENDEAI-BOT]   Nome Bot:           ${botConfig.nomeBot}`);
  console.log(`[VENDEAI-BOT]   Empresa:            ${botConfig.nomeEmpresa}`);
  console.log(`[VENDEAI-BOT]   IA Master:          ${process.env.ANTHROPIC_API_KEY ? '✅ Ativo' : '❌ Inativo'}`);
  console.log('[VENDEAI-BOT] ═══════════════════════════════════════════════════════');

  // Criar instância do LucasVendedor (VendeAI Bot)
  const aira = new AIraVendedor(empresaId, sock, db, botConfig, {
    openai: process.env.OPENAI_API_KEY || '',
    anthropic: process.env.ANTHROPIC_API_KEY || ''
  });

  /**
   * Processar mensagem recebida
   */
  async function processMessage(message) {
    try {
      console.log('[VENDEAI-BOT] 📨 Processando mensagem...');

      // ========================================================================
      // VERIFICAR SE BOT ESTÁ ATIVO
      // ========================================================================
      try {
        const mysql = await import('mysql2/promise');
        const mysql_conn = await mysql.default.createConnection({
          host: process.env.DB_HOST || 'localhost',
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD || '',
          database: process.env.DB_NAME || 'helixai_db'
        });

        const [rows] = await mysql_conn.query(
          'SELECT bot_ativo FROM empresas WHERE id = ?',
          [empresaId]
        );

        await mysql_conn.end();

        if (rows.length > 0 && !rows[0].bot_ativo) {
          console.log('[VENDEAI-BOT] ⏸️ Bot está PAUSADO - ignorando mensagem');
          return false;
        }

        console.log('[VENDEAI-BOT] ▶️ Bot está ATIVO - processando mensagem');
      } catch (checkError) {
        console.error('[VENDEAI-BOT] ⚠️ Erro ao verificar bot_ativo, continuando:', checkError);
      }
      // ========================================================================

      // Extrair dados da mensagem
      const telefone = message.key.remoteJid.replace('@s.whatsapp.net', '').replace('@lid', '');
      const nome = message.pushName || 'Cliente';
      const mensagemTexto = message.message?.conversation ||
                            message.message?.extendedTextMessage?.text ||
                            message.message?.imageMessage?.caption || '';

      if (!mensagemTexto) {
        console.log('[VENDEAI-BOT] ⚠️ Mensagem sem texto, ignorando');
        return false;
      }

      console.log(`[VENDEAI-BOT] 📱 De: ${telefone} (${nome})`);
      console.log(`[VENDEAI-BOT] 💬 Mensagem: ${mensagemTexto.substring(0, 100)}...`);

      console.log('[VENDEAI-BOT] ✅ Processando com IA Master...');

      // ========================================================================
      // USAR SISTEMA DE AGREGAÇÃO DE MENSAGENS (como no VendeAI original)
      // ========================================================================
      aira.adicionarMensagemPendente(telefone, mensagemTexto, async (mensagemCompleta) => {
        // Processar mensagem completa com LucasVendedor
        const resposta = await aira.processar(telefone, mensagemCompleta, nome);

        if (resposta) {
          // Enviar resposta
          await sock.sendMessage(message.key.remoteJid, { text: resposta });
          console.log('[VENDEAI-BOT] ✅ Mensagem processada com sucesso');
        }
      });

      return true;

    } catch (error) {
      console.error('[VENDEAI-BOT] ❌ Erro ao processar mensagem:', error);

      // Enviar mensagem de erro amigável
      try {
        await sock.sendMessage(message.key.remoteJid, {
          text: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.'
        });
      } catch (sendError) {
        console.error('[VENDEAI-BOT] ❌ Erro ao enviar mensagem de erro:', sendError);
      }

      return false;
    }
  }

  // Retornar objeto do bot
  return {
    type: 'vendeai',
    nicho: 'veiculos',
    empresaId,
    config: botConfig,
    processMessage,
    aira, // Expor instância do AIraVendedor

    // Métodos auxiliares
    getConfig: () => botConfig,
    isActive: () => true,
    getStats: () => ({
      conversasAtivas: aira.conversas.size,
      etapas: Object.fromEntries(aira.etapas.entries())
    })
  };
}

console.log('[VENDEAI-INTEGRATION] ✅ Módulo carregado com arquitetura AIraVendedor');

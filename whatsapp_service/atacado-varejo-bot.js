/**
 * ════════════════════════════════════════════════════════════════════════════
 * ATACADO/VAREJO BOT - Bot com IA para Distribuidores e Lojas
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Bot especializado para nichos de atacado/varejo:
 * - Distribuidores de lubrificantes, filtros, peças automotivas
 * - Lojas de autopeças
 * - Distribuidores de produtos em geral
 *
 * RECURSOS:
 * - ✅ IA (Anthropic Claude) para linguagem natural
 * - ✅ Busca inteligente de produtos
 * - ✅ Filtros por categoria, marca, aplicação
 * - ✅ Consulta de estoque e preços
 * - ✅ Memória e contexto de conversas
 * - ✅ Sistema de agregação de mensagens
 *
 * ════════════════════════════════════════════════════════════════════════════
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

// Carregar .env da raiz do projeto
const __filename_env = fileURLToPath(import.meta.url);
const __dirname_env = dirname(__filename_env);
dotenv.config({ path: join(__dirname_env, '..', '.env') });

// Importar IA Master para Produtos
import { IAMasterProdutos } from './ia-modules-produtos/ia-master-produtos.js';

// Importar servico de audio ElevenLabs
import { ElevenLabsService } from './services/elevenlabs-service.js';

// Importar servico de transcricao Whisper
import { WhisperService } from './services/whisper-service.js';

/**
 * Classe AIraAtacado - Bot especializado para Atacado/Varejo
 */
class AIraAtacado {
  constructor(empresaId, sock, db, config, apiKeys) {
    this.empresaId = empresaId;
    this.sock = sock;
    this.db = db;
    this.config = config;
    this.anthropicKey = apiKeys.anthropic;

    // Configuracoes carregadas do banco
    this.botConfig = null;

    // IA Master para processamento inteligente
    this.iaMaster = null;

    // Servico de audio ElevenLabs
    this.elevenLabs = null;

    // Servico de transcricao de audio Whisper
    this.whisperService = null;

    // Mapas de memoria
    this.conversas = new Map();
    this.etapas = new Map();
    this.jaSeApresentou = new Map();
    this.ultimoEnvio = new Map();
    this.produtosInteresse = new Map();

    // Sistema de agregacao de mensagens
    this.mensagensPendentes = new Map();
    this.timersAgregacao = new Map();
    this.TEMPO_ESPERA_MENSAGENS = 2500; // 2.5 segundos

    // Promise de inicializacao para garantir que tudo esteja pronto
    this._inicializacaoPromise = this.inicializar();

    console.log('[AIRA-ATACADO] OK Bot Atacado/Varejo inicializado (aguardando async)');
  }

  /**
   * Aguardar inicializacao completa do bot
   * Chamar antes de processar a primeira mensagem
   */
  async aguardarInicializacao() {
    console.log('[AIRA-ATACADO] ⏳ Aguardando inicialização...');
    await this._inicializacaoPromise;
    console.log('[AIRA-ATACADO] ════════════════════════════════════════════');
    console.log('[AIRA-ATACADO] ✅ INICIALIZAÇÃO COMPLETA');
    console.log('[AIRA-ATACADO]    ElevenLabs: ' + (this.elevenLabs?.isAvailable() ? '✅ OK' : '❌ Indisponível'));
    console.log('[AIRA-ATACADO]    Whisper: ' + (this.whisperService?.isAvailable() ? '✅ OK' : '❌ Indisponível'));
    console.log('[AIRA-ATACADO]    BotConfig carregado: ' + (this.botConfig ? '✅ SIM' : '❌ NAO'));
    console.log('[AIRA-ATACADO]    enviar_audio: ' + (this.botConfig?.enviar_audio || 'não definido'));
    console.log('[AIRA-ATACADO] ════════════════════════════════════════════');
  }

  /**
   * Inicializar bot (carregar configs e IA Master)
   */
  async inicializar() {
    await this.carregarConfiguracoes();
    this.inicializarIAMaster();
    this.inicializarElevenLabs();
    this.inicializarWhisper();
  }

  /**
   * Inicializar servico de audio ElevenLabs
   */
  inicializarElevenLabs() {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = this.botConfig?.elevenlabs_voice_id || process.env.ELEVENLABS_VOICE_ID;

    console.log(`[AIRA-ATACADO] 🔧 Inicializando ElevenLabs...`);
    console.log(`[AIRA-ATACADO]    API Key: ${apiKey ? '✅ Configurada' : '❌ Não configurada'}`);
    console.log(`[AIRA-ATACADO]    Voice ID: ${voiceId || 'Padrão'}`);

    if (!apiKey) {
      console.warn('[AIRA-ATACADO] ⚠️ ELEVENLABS_API_KEY nao configurada, audio desativado');
      return;
    }

    try {
      this.elevenLabs = new ElevenLabsService(apiKey, voiceId);
      console.log(`[AIRA-ATACADO] ✅ ElevenLabs Service inicializado (disponivel: ${this.elevenLabs.isAvailable()})`);
    } catch (err) {
      console.error('[AIRA-ATACADO] ❌ Erro ao inicializar ElevenLabs:', err.message);
      this.elevenLabs = null;
    }
  }

  /**
   * Inicializar servico de transcricao Whisper
   */
  inicializarWhisper() {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.warn('[AIRA-ATACADO] ⚠️ OPENAI_API_KEY nao configurada, transcricao de audio desativada');
      return;
    }

    this.whisperService = new WhisperService(apiKey);
    console.log('[AIRA-ATACADO] ✅ Whisper Service inicializado');
  }

  /**
   * Inicializar IA Master com configuracoes carregadas
   */
  inicializarIAMaster() {
    if (!this.anthropicKey) {
      console.warn('[AIRA-ATACADO] ⚠️ ANTHROPIC_API_KEY nao configurada, IA Master desativado');
      return;
    }

    this.iaMaster = new IAMasterProdutos(
      this.anthropicKey,
      this.db,
      this.empresaId,
      this.botConfig || {}
    );

    console.log('[AIRA-ATACADO] ✅ IA Master Produtos inicializado');
  }

  /**
   * Carregar configuracoes do bot do banco de dados (SQLite)
   * Inclui dados da empresa, horários, formas de pagamento, etc.
   */
  async carregarConfiguracoes() {
    try {
      // LEFT JOIN para permitir empresas sem configuracoes_bot
      const query = `
        SELECT cb.*,
               e.nome as empresa_nome,
               e.nome_bot,
               e.nome_fantasia,
               e.telefone as empresa_telefone,
               e.email as empresa_email,
               e.endereco as empresa_endereco,
               e.cidade as empresa_cidade,
               e.estado as empresa_estado,
               e.cep as empresa_cep,
               e.nicho as empresa_nicho
        FROM empresas e
        LEFT JOIN configuracoes_bot cb ON e.id = cb.empresa_id
        WHERE e.id = ?
      `;

      // Usar SQLite (db.get retorna uma Promise via callback wrapper)
      const row = await new Promise((resolve, reject) => {
        this.db.get(query, [this.empresaId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (row) {
        this.botConfig = row;

        // Parsear configurações extras do JSON em descricao_empresa
        if (row.descricao_empresa) {
          try {
            const extras = JSON.parse(row.descricao_empresa);
            this.botConfig.configEmpresa = extras;

            // Mesclar extras direto no botConfig para facil acesso
            Object.assign(this.botConfig, {
              celular: extras.celular,
              bairro: extras.bairro,
              numero_endereco: extras.numero,
              complemento: extras.complemento,
              horario_abertura: extras.horario_abertura || '08:00',
              horario_fechamento: extras.horario_fechamento || '18:00',
              dias_funcionamento: extras.dias_funcionamento || [],
              aceita_cartao: extras.aceita_cartao !== false,
              aceita_pix: extras.aceita_pix !== false,
              aceita_boleto: extras.aceita_boleto || false,
              aceita_dinheiro: extras.aceita_dinheiro !== false,
              prazo_entrega: extras.prazo_entrega || '',
              taxa_entrega: extras.taxa_entrega || 0,
              entrega_gratis_acima: extras.entrega_gratis_acima || 0,
              sobre_empresa: extras.sobre_empresa || ''
            });
          } catch (e) {
            // Se nao for JSON, usar como texto descritivo
            this.botConfig.sobre_empresa = row.descricao_empresa;
          }
        }

        // Adicionar nicho ao config para identificação
        this.botConfig.nicho = row.empresa_nicho;

        console.log('[AIRA-ATACADO] ✅ Configuracoes carregadas do banco');
        console.log(`[AIRA-ATACADO]   Empresa ID: ${this.empresaId}`);
        console.log(`[AIRA-ATACADO]   Empresa: ${row.empresa_nome || row.nome_fantasia}`);
        console.log(`[AIRA-ATACADO]   Nicho: ${row.empresa_nicho || 'não definido'}`);
        console.log(`[AIRA-ATACADO]   Nome Bot: ${row.nome_atendente || 'AIra'}`);
        console.log(`[AIRA-ATACADO]   Cargo: ${row.cargo_atendente || 'Atendente'}`);
        console.log(`[AIRA-ATACADO]   Audio: ${row.enviar_audio ? 'Ativo' : 'Desativado'}`);
        console.log(`[AIRA-ATACADO]   Horario: ${this.botConfig.horario_abertura} às ${this.botConfig.horario_fechamento}`);

        // Atualizar IA Master se existir
        if (this.iaMaster) {
          this.iaMaster.atualizarConfig(this.botConfig);
        }
      } else {
        console.log('[AIRA-ATACADO] Sem configuracoes personalizadas, usando padrao');
        this.botConfig = {
          nome_atendente: this.config.nomeBot || 'AIra',
          cargo_atendente: 'Consultora de Vendas',
          personalidade: 'Simpatica, prestativa e profissional',
          estilo_linguagem: 'Linguagem clara e acessivel',
          respostas_pergunta_ia: 'Sou a {nome}, atendente da {empresa}. Trabalho aqui ha alguns anos!',
          tom_conversa: 'profissional',
          enviar_audio: true,
          usar_elevenlabs: true,
          horario_abertura: '08:00',
          horario_fechamento: '18:00',
          dias_funcionamento: ['seg', 'ter', 'qua', 'qui', 'sex', 'sab'],
          aceita_cartao: true,
          aceita_pix: true,
          aceita_dinheiro: true
        };
      }
      return this.botConfig;
    } catch (err) {
      console.error('[AIRA-ATACADO] Erro ao carregar configuracoes:', err.message);
      // Usar configuração padrão em caso de erro
      this.botConfig = {
        nome_atendente: this.config?.nomeBot || 'AIra',
        cargo_atendente: 'Consultora de Vendas',
        personalidade: 'Simpatica, prestativa e profissional',
        estilo_linguagem: 'Linguagem clara e acessivel',
        tom_conversa: 'profissional',
        enviar_audio: true,
        usar_elevenlabs: true,
        horario_abertura: '08:00',
        horario_fechamento: '18:00'
      };
      return this.botConfig;
    }
  }

  /**
   * Obter informações da empresa formatadas para o bot
   */
  getInfoEmpresa() {
    const config = this.botConfig || {};
    const dias = config.dias_funcionamento || [];
    const diasFormatados = dias.map(d => {
      const map = { seg: 'Segunda', ter: 'Terça', qua: 'Quarta', qui: 'Quinta', sex: 'Sexta', sab: 'Sábado', dom: 'Domingo' };
      return map[d] || d;
    }).join(', ');

    const formasPagamento = [];
    if (config.aceita_pix) formasPagamento.push('PIX');
    if (config.aceita_cartao) formasPagamento.push('Cartão');
    if (config.aceita_boleto) formasPagamento.push('Boleto');
    if (config.aceita_dinheiro) formasPagamento.push('Dinheiro');

    return {
      nome: config.empresa_nome || config.nome_fantasia || 'Nossa Loja',
      telefone: config.celular || config.empresa_telefone || '',
      email: config.empresa_email || '',
      endereco: this.formatarEndereco(),
      horario: `${config.horario_abertura || '08:00'} às ${config.horario_fechamento || '18:00'}`,
      dias: diasFormatados || 'Segunda a Sábado',
      formasPagamento: formasPagamento.join(', ') || 'PIX, Cartão, Dinheiro',
      prazoEntrega: config.prazo_entrega || '1-3 dias úteis',
      taxaEntrega: config.taxa_entrega || 0,
      freteGratisAcima: config.entrega_gratis_acima || 0,
      sobre: config.sobre_empresa || ''
    };
  }

  /**
   * Formatar endereço completo
   */
  formatarEndereco() {
    const config = this.botConfig || {};
    const partes = [
      config.empresa_endereco,
      config.numero_endereco,
      config.complemento,
      config.bairro,
      config.empresa_cidade,
      config.empresa_estado
    ].filter(p => p && p.trim());
    return partes.join(', ');
  }

  /**
   * Verificar se está no horário de atendimento
   */
  estaNoHorario() {
    const config = this.botConfig || {};
    const agora = new Date();
    const dia = agora.getDay(); // 0=Dom, 1=Seg, ...
    const hora = agora.getHours();
    const minutos = agora.getMinutes();
    const horaAtual = hora * 100 + minutos;

    // Mapear dia da semana para nosso formato
    const diasMap = { 0: 'dom', 1: 'seg', 2: 'ter', 3: 'qua', 4: 'qui', 5: 'sex', 6: 'sab' };
    const diaAtual = diasMap[dia];

    // Verificar se funciona neste dia
    const diasFuncionamento = config.dias_funcionamento || ['seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
    if (!diasFuncionamento.includes(diaAtual)) {
      return false;
    }

    // Parsear horários
    const [horaAbre, minAbre] = (config.horario_abertura || '08:00').split(':').map(Number);
    const [horaFecha, minFecha] = (config.horario_fechamento || '18:00').split(':').map(Number);
    const abertura = horaAbre * 100 + minAbre;
    const fechamento = horaFecha * 100 + minFecha;

    return horaAtual >= abertura && horaAtual <= fechamento;
  }

  /**
   * Obter nome da atendente
   */
  getNomeAtendente() {
    return this.botConfig?.nome_atendente || this.config.nomeBot || 'AIra';
  }

  /**
   * Obter cargo da atendente
   */
  getCargoAtendente() {
    return this.botConfig?.cargo_atendente || 'Consultora de Vendas';
  }

  /**
   * Verificar se deve enviar audio
   */
  deveEnviarAudio() {
    // Debug detalhado
    console.log('[AIRA-ATACADO] 🔍 DEBUG deveEnviarAudio():');
    console.log(`[AIRA-ATACADO]    - this.botConfig existe: ${!!this.botConfig}`);
    console.log(`[AIRA-ATACADO]    - this.elevenLabs existe: ${!!this.elevenLabs}`);

    // Verificar config do banco (padrao: true se nao definido)
    const configAudio = this.botConfig?.enviar_audio;
    console.log(`[AIRA-ATACADO]    - configAudio (do banco): ${configAudio} (tipo: ${typeof configAudio})`);

    // Se explicitamente desabilitado, retorna false
    if (configAudio === false || configAudio === 0 || configAudio === '0') {
      console.log('[AIRA-ATACADO] 🔇 Audio desativado na config');
      return false;
    }

    // Verificar se ElevenLabs esta disponivel
    const elevenLabsOk = this.elevenLabs?.isAvailable() || false;
    console.log(`[AIRA-ATACADO]    - elevenLabs.isAvailable(): ${elevenLabsOk}`);
    console.log(`[AIRA-ATACADO] 🔊 RESULTADO: ${elevenLabsOk ? 'VAI ENVIAR AUDIO' : 'NAO VAI ENVIAR AUDIO'}`);

    return elevenLabsOk;
  }

  /**
   * Formatar texto para TTS (Text-to-Speech) em português fluido
   * Converte abreviações, símbolos e números para fala natural
   * @param {string} texto - Texto original
   * @returns {string} - Texto formatado para fala
   */
  formatarParaTTS(texto) {
    if (!texto) return '';

    let resultado = texto;

    // 1. Formatar valores monetários: R$ 45,90 → 45 reais e 90 centavos
    resultado = resultado.replace(/R\$\s*(\d+)(?:[,.](\d{2}))?/g, (match, reais, centavos) => {
      if (centavos && parseInt(centavos) > 0) {
        return `${reais} reais e ${centavos} centavos`;
      }
      return `${reais} reais`;
    });

    // 2. Formatar parcelas: 12x → 12 vezes, 3x → 3 vezes
    resultado = resultado.replace(/(\d+)x\b/gi, '$1 vezes');

    // 3. Formatar litros: 5L → 5 litros, 1L → 1 litro
    resultado = resultado.replace(/(\d+)\s*L\b/g, (match, num) => {
      return parseInt(num) === 1 ? `${num} litro` : `${num} litros`;
    });

    // 4. Formatar mililitros: 500ml → 500 mililitros
    resultado = resultado.replace(/(\d+)\s*ml\b/gi, '$1 mililitros');

    // 5. Formatar horas: 10h → 10 horas, 8h30 → 8 horas e 30 minutos
    resultado = resultado.replace(/(\d+)h(\d+)?/gi, (match, hora, min) => {
      if (min) {
        return `${hora} horas e ${min} minutos`;
      }
      return parseInt(hora) === 1 ? `${hora} hora` : `${hora} horas`;
    });

    // 6. Formatar peso: 500g → 500 gramas, 1kg → 1 quilo
    resultado = resultado.replace(/(\d+)\s*kg\b/gi, (match, num) => {
      return parseInt(num) === 1 ? `${num} quilo` : `${num} quilos`;
    });
    resultado = resultado.replace(/(\d+)\s*g\b/gi, (match, num) => {
      return parseInt(num) === 1 ? `${num} grama` : `${num} gramas`;
    });

    // 7. Formatar porcentagem: 10% → 10 por cento
    resultado = resultado.replace(/(\d+)%/g, '$1 por cento');

    // 8. Formatar operador mais: + → mais
    resultado = resultado.replace(/\s*\+\s*/g, ' mais ');

    // 9. Formatar números decimais: 45.90 ou 45,90 → 45 vírgula 90
    resultado = resultado.replace(/(\d+)[,.](\d+)/g, '$1 vírgula $2');

    // 10. Formatar SKU e códigos (remover hífens para leitura mais fluida)
    // Exemplo: IPR-5W30-1L → IPR 5W30 1L
    resultado = resultado.replace(/([A-Z]{2,})-([A-Z0-9]+)-?([A-Z0-9]*)/gi, '$1 $2 $3');

    // 11. Formatar W (watts/especificações): 5W30 → 5W 30
    resultado = resultado.replace(/(\d+)W(\d+)/gi, '$1 W $2');

    // 12. Formatar metro quadrado: m² → metros quadrados
    resultado = resultado.replace(/m²/g, 'metros quadrados');

    // 13. Formatar unidades: un. → unidades
    resultado = resultado.replace(/(\d+)\s*un\.?/gi, '$1 unidades');

    // 14. Limpar espaços duplos
    resultado = resultado.replace(/\s+/g, ' ').trim();

    return resultado;
  }

  /**
   * Gerar audio a partir de texto
   * @param {string} texto - Texto para converter em audio
   * @returns {Buffer|null} - Buffer de audio ou null se falhar
   */
  async gerarAudio(texto) {
    if (!this.elevenLabs || !this.deveEnviarAudio()) {
      return null;
    }

    try {
      // Formatar texto para TTS antes de gerar audio
      const textoFormatado = this.formatarParaTTS(texto);
      console.log('[AIRA-ATACADO] 🎙️ Gerando audio com ElevenLabs...');
      console.log('[AIRA-ATACADO] 📝 Texto original:', texto.substring(0, 100) + '...');
      console.log('[AIRA-ATACADO] 🔊 Texto TTS:', textoFormatado.substring(0, 100) + '...');

      const audioBuffer = await this.elevenLabs.textToSpeech(textoFormatado, {
        voiceId: this.botConfig?.elevenlabs_voice_id || process.env.ELEVENLABS_VOICE_ID
      });
      console.log(`[AIRA-ATACADO] ✅ Audio gerado: ${audioBuffer.length} bytes`);
      return audioBuffer;
    } catch (error) {
      console.error('[AIRA-ATACADO] ❌ Erro ao gerar audio:', error.message);
      return null;
    }
  }

  /**
   * Gerar resposta para quando perguntam se eh IA/robo
   */
  gerarRespostaAntiIA() {
    const nome = this.getNomeAtendente();
    const empresa = this.botConfig?.empresa_nome || this.config.nomeEmpresa || 'nossa empresa';

    // Respostas personalizadas do banco ou padrao
    let respostas = this.botConfig?.respostas_pergunta_ia || '';

    if (respostas) {
      // Substituir placeholders
      respostas = respostas.replace(/\{nome\}/g, nome).replace(/\{empresa\}/g, empresa);
      // Pegar uma resposta aleatoria se houver varias linhas
      const linhas = respostas.split('\n').filter(l => l.trim());
      if (linhas.length > 0) {
        return linhas[Math.floor(Math.random() * linhas.length)];
      }
    }

    // Respostas padrao
    const respostasPadrao = [
      `Sou a ${nome}, atendente da ${empresa}! Trabalho aqui ha alguns anos.`,
      `Kkk imagina! Sou ${nome}, sua ${this.getCargoAtendente()}. Como posso ajudar?`,
      `Rsrs, nao! Sou a ${nome}, atendente aqui da loja. Em que posso ajudar voce?`,
      `Haha, sou ${nome} sim! Atendente da ${empresa}. Posso te ajudar com algum produto?`
    ];

    return respostasPadrao[Math.floor(Math.random() * respostasPadrao.length)];
  }

  /**
   * Verificar se mensagem pergunta se eh IA/robo
   */
  isPerguntaIA(mensagem) {
    const lower = mensagem.toLowerCase();
    const padroes = [
      /voc[eê] [eé] (um |uma )?(rob[oô]|ia|intelig[eê]ncia artificial|bot|chatbot|maquina|computador)/i,
      /[eé] (rob[oô]|ia|bot|chatbot|maquina|computador)/i,
      /(rob[oô]|ia|bot|chatbot|maquina|computador)\?/i,
      /tou falando com (rob[oô]|ia|bot|uma maquina)/i,
      /isso [eé] (rob[oô]|ia|bot|automatico)/i,
      /atendimento automatico/i,
      /[eé] humano/i,
      /pessoa real/i,
      /atendente real/i
    ];

    return padroes.some(padrao => padrao.test(lower));
  }

  /**
   * Adicionar mensagem ao histórico
   */
  addHistorico(tel, role, msg) {
    if (!this.conversas.has(tel)) {
      this.conversas.set(tel, []);
    }
    this.conversas.get(tel).push({ role, msg });

    // Registrar mensagem no banco de dados (async, não bloqueia)
    this.registrarMensagemNoBanco(tel, msg, role === 'assistant');
  }

  /**
   * Registrar mensagem no banco de dados via API
   */
  async registrarMensagemNoBanco(telefone, mensagem, enviadaPorBot = false) {
    try {
      const apiUrl = process.env.API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/conversas/api/registrar-mensagem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          empresa_id: this.empresaId,
          telefone: telefone.replace('@s.whatsapp.net', ''),
          nome_contato: telefone.replace('@s.whatsapp.net', ''),
          mensagem: mensagem,
          tipo: 'texto',
          enviada_por_bot: enviadaPorBot
        })
      });

      if (response.ok) {
        console.log(`[AIRA-ATACADO] 💾 Mensagem salva no banco (empresa ${this.empresaId})`);
      }
    } catch (error) {
      console.error('[AIRA-ATACADO] ⚠️ Erro ao salvar mensagem no banco:', error.message);
    }
  }

  /**
   * Obter histórico de conversa
   */
  getHistorico(tel) {
    return this.conversas.get(tel) || [];
  }

  /**
   * Adicionar mensagem à fila e aguardar agregação
   */
  adicionarMensagemPendente(tel, mensagem, callbackProcessar) {
    if (!this.mensagensPendentes.has(tel)) {
      this.mensagensPendentes.set(tel, []);
    }

    const mensagens = this.mensagensPendentes.get(tel);
    mensagens.push(mensagem);
    console.log(`[AIRA-ATACADO] 📥 Mensagem adicionada à fila [${mensagens.length} total] - ${tel.slice(-4)}`);

    if (this.timersAgregacao.has(tel)) {
      clearTimeout(this.timersAgregacao.get(tel));
    }

    const timer = setTimeout(async () => {
      const todasMensagens = this.mensagensPendentes.get(tel) || [];
      const mensagemCompleta = todasMensagens.join('\n');

      console.log(`[AIRA-ATACADO] ⏰ Processando ${todasMensagens.length} mensagem(ns) agregada(s)`);

      this.mensagensPendentes.delete(tel);
      this.timersAgregacao.delete(tel);

      await callbackProcessar(mensagemCompleta);
    }, this.TEMPO_ESPERA_MENSAGENS);

    this.timersAgregacao.set(tel, timer);
  }

  /**
   * Processar mensagem - METODO PRINCIPAL (com IA Master)
   */
  async processar(tel, msg, nome = 'Cliente') {
    try {
      const agora = Date.now();
      const proximoPermitido = this.ultimoEnvio.get(tel) || 0;

      if (agora < proximoPermitido) {
        console.log('[AIRA-ATACADO] Muito rapido, ignorando');
        return null;
      }

      this.ultimoEnvio.set(tel, agora + 3000);

      const msgLower = msg.toLowerCase().trim();
      const etapaAtual = this.etapas.get(tel) || 'INICIO';
      const historico = this.getHistorico(tel);

      console.log(`[AIRA-ATACADO] ${nome} (${etapaAtual}): "${msg.substring(0, 50)}..."`);

      // ========== NOTIFICAR NOVO LEAD (primeira mensagem) ==========
      if (historico.length === 0) {
        try {
          const fetch = (await import('node-fetch')).default;
          const apiUrl = process.env.API_URL || 'http://localhost:5000';

          await fetch(`${apiUrl}/api/empresa/notificacoes/enviar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              empresa_id: this.empresaId,
              tipo: 'lead',
              dados: {
                nome: nome || 'Novo Cliente',
                telefone: tel,
                mensagem: msg.substring(0, 200),
                interesse: 'A identificar'
              }
            })
          });
          console.log('[AIRA-ATACADO] 📢 Notificação de novo lead enviada ao gerente');
        } catch (notifError) {
          console.log('[AIRA-ATACADO] ⚠️ Erro ao notificar novo lead (não crítico):', notifError.message);
        }
      }

      // ========== INTERCEPTAR PERGUNTA SE EH IA/ROBO (PRIORIDADE MAXIMA) ==========
      const isPerguntaIA = this.iaMaster?.isPerguntaIA(msg) || this.isPerguntaIA(msg);
      if (isPerguntaIA) {
        console.log('[AIRA-ATACADO] ⚠️ Pergunta sobre IA detectada! Respondendo como humana.');
        const respostaAntiIA = this.iaMaster?.gerarRespostaAntiIA() || this.gerarRespostaAntiIA();
        this.addHistorico(tel, 'Cliente', msg);
        this.addHistorico(tel, this.getNomeAtendente(), respostaAntiIA);
        return respostaAntiIA;
      }

      // ========== USAR IA MASTER SE DISPONIVEL ==========
      if (this.iaMaster) {
        return await this.processarComIAMaster(tel, msg, nome, historico, etapaAtual);
      }

      // ========== FALLBACK: PROCESSAMENTO ANTIGO ==========
      return await this.processarSemIAMaster(tel, msg, nome, historico, etapaAtual);

    } catch (error) {
      console.error('[AIRA-ATACADO] ❌ Erro ao processar mensagem:', error);
      return 'Desculpe, ocorreu um erro. Por favor, tente novamente.';
    }
  }

  /**
   * Processar com IA Master (novo sistema inteligente)
   */
  async processarComIAMaster(tel, msg, nome, historico, etapaAtual) {
    const msgLower = msg.toLowerCase().trim();

    // ========== SAUDACAO INICIAL ==========
    if (etapaAtual === 'INICIO' && msgLower.match(/^(oi|ola|olá|hey|fala|bom dia|boa tarde|boa noite)$/i)) {
      this.etapas.set(tel, 'DESCOBERTA');
      this.jaSeApresentou.set(tel, true);
    }

    // Processar com IA Master (analisa intencao, sentimento, perfil, gera resposta)
    const resultado = await this.iaMaster.processar(tel, msg, historico, []);

    // Se a acao sugerida for buscar produtos, buscar e reprocessar
    let resposta = resultado.resposta;
    if (resultado.acoes?.buscar_produtos || resultado.analises?.intencao?.acao_sugerida === 'buscar_produtos') {
      const filtros = resultado.analises?.intencao?.filtros_detectados || {};
      console.log('[AIRA-ATACADO] 🔍 IA Master sugeriu busca de produtos');
      console.log('[AIRA-ATACADO] 📋 Filtros:', JSON.stringify(filtros));

      const produtos = await this.buscarProdutos(filtros);

      if (produtos.length > 0) {
        console.log(`[AIRA-ATACADO] ✅ Encontrados ${produtos.length} produtos`);
        this.produtosInteresse.set(tel, produtos);

        // Reprocessar com produtos encontrados
        const resultadoComProdutos = await this.iaMaster.processar(tel, msg, historico, produtos);
        resposta = resultadoComProdutos.resposta;

        // Se quiser recomendacoes inteligentes
        if (resultado.analises?.sentimento?.temperatura_lead === 'quente') {
          const recomendados = await this.iaMaster.recomendarProdutos(tel, produtos, 3);
          console.log(`[AIRA-ATACADO] 🎯 ${recomendados.length} produtos recomendados pelo perfil`);
        }
      } else {
        // Sem produtos encontrados
        resposta = await this.gerarRespostaSemProdutos(msg, nome, filtros);
      }
    }

    // Adicionar ao historico
    this.addHistorico(tel, 'Cliente', msg);
    this.addHistorico(tel, this.getNomeAtendente(), resposta);

    // Atualizar etapa baseado na temperatura do lead
    const temperatura = resultado.analises?.sentimento?.temperatura_lead;
    if (temperatura === 'quente') {
      this.etapas.set(tel, 'NEGOCIACAO');
    } else if (temperatura === 'morno') {
      this.etapas.set(tel, 'DESCOBERTA');
    }

    return resposta;
  }

  /**
   * Processar sem IA Master (fallback para sistema antigo)
   */
  async processarSemIAMaster(tel, msg, nome, historico, etapaAtual) {
    const msgLower = msg.toLowerCase().trim();

    // ========== SAUDACAO INICIAL ==========
    if (etapaAtual === 'INICIO' && msgLower.match(/^(oi|ola|olá|hey|fala|bom dia|boa tarde|boa noite)$/i)) {
      this.etapas.set(tel, 'DESCOBERTA');
      this.jaSeApresentou.set(tel, true);

      const resp = await this.gerarSaudacao(nome, msg);
      this.addHistorico(tel, 'Cliente', msg);
      this.addHistorico(tel, this.getNomeAtendente(), resp);
      return resp;
    }

    // ========== ANALISE COM IA ==========
    const analise = await this.analisarMensagem(msg, historico);
    console.log(`[AIRA-ATACADO] Intencao: ${analise.intencao}`);

    let resposta = '';
    let produtos = [];

    // ========== BUSCA DE PRODUTOS ==========
    if (analise.intencao === 'busca_produto' || analise.intencao === 'consulta_preco' || analise.intencao === 'consulta_estoque') {
      console.log('[AIRA-ATACADO] 🔍 Buscando produtos...');
      console.log('[AIRA-ATACADO] 📋 Filtros:', JSON.stringify(analise.filtros));

      produtos = await this.buscarProdutos(analise.filtros);

      if (produtos.length > 0) {
        console.log(`[AIRA-ATACADO] ✅ Encontrados ${produtos.length} produtos`);
        resposta = await this.gerarRespostaComProdutos(msg, produtos, nome, analise);
        this.produtosInteresse.set(tel, produtos);
      } else {
        resposta = await this.gerarRespostaSemProdutos(msg, nome, analise.filtros);
      }
    }
    // ========== LISTA DE CATEGORIAS ==========
    else if (analise.intencao === 'listar_categorias') {
      const categorias = await this.listarCategorias();
      resposta = this.formatarCategorias(categorias);
    }
    // ========== CONVERSA GERAL ==========
    else {
      resposta = await this.gerarRespostaGeral(msg, nome, historico);
    }

    // Adicionar ao histórico
    this.addHistorico(tel, 'Cliente', msg);
    this.addHistorico(tel, this.config.nomeBot, resposta);

    return resposta;
  }

  /**
   * Analisar mensagem com IA para extrair intenção e filtros
   */
  async analisarMensagem(mensagem, historico) {
    try {
      const anthropic = new Anthropic({ apiKey: this.anthropicKey });

      const historicoStr = historico.slice(-5).map(h => `${h.role}: ${h.msg}`).join('\n');

      const prompt = `Você é um analisador de intenções para um bot de atendimento de uma distribuidora de produtos automotivos (lubrificantes, filtros, aditivos, peças).

CATEGORIAS DISPONÍVEIS:
- Lubrificantes (subcategorias: Óleos de Motor, Fluidos, Coolants, Graxas)
- Filtros (subcategorias: Linha Leve, Linha Pesada, Linha Industrial, Linha Agrícola)
- Aditivos (subcategorias: Condicionadores, Combustível, Radiador)
- Limpeza Automotiva (subcategorias: Parabrisa, Conservação, Ar Condicionado)
- Câmaras de Ar (subcategorias: Moto)

MARCAS DISPONÍVEIS: Ipiranga, Texaco, Mann, Tecfil, Donaldson, Fleetguard, Militec, Tecbril, Levorin

APLICAÇÕES: Carro e SUV, Moto, Caminhão, Máquinas Pesadas

HISTÓRICO RECENTE:
${historicoStr || 'Sem histórico'}

MENSAGEM DO CLIENTE: "${mensagem}"

Analise e retorne APENAS um JSON válido (sem markdown, sem backticks):
{
  "intencao": "busca_produto" | "consulta_preco" | "consulta_estoque" | "listar_categorias" | "conversa_geral",
  "filtros": {
    "termo_busca": "termo extraído da mensagem ou null",
    "categoria": "categoria identificada ou null",
    "subcategoria": "subcategoria identificada ou null",
    "marca": "marca identificada ou null",
    "aplicacao": "Carro e SUV" | "Moto" | "Caminhão" | "Máquinas Pesadas" | null
  },
  "confianca": 0.0 a 1.0
}

EXEMPLOS:
- "tem óleo 5w30?" → intencao: busca_produto, filtros: {termo_busca: "5w30", categoria: "Lubrificantes", subcategoria: "Óleos de Motor"}
- "filtro pro corolla" → intencao: busca_produto, filtros: {termo_busca: "corolla", categoria: "Filtros", aplicacao: "Carro e SUV"}
- "quanto tá o militec?" → intencao: consulta_preco, filtros: {termo_busca: "militec", marca: "Militec"}
- "tem filtro pra caminhão?" → intencao: busca_produto, filtros: {categoria: "Filtros", aplicacao: "Caminhão"}`;

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      });

      const texto = response.content[0].text.trim();

      // Tentar extrair JSON
      let jsonStr = texto;
      if (texto.includes('{')) {
        jsonStr = texto.substring(texto.indexOf('{'), texto.lastIndexOf('}') + 1);
      }

      const analise = JSON.parse(jsonStr);
      return analise;

    } catch (error) {
      console.error('[AIRA-ATACADO] ❌ Erro na análise:', error);
      return {
        intencao: 'conversa_geral',
        filtros: {},
        confianca: 0.5
      };
    }
  }

  /**
   * Buscar produtos via Flask API (SQLite)
   */
  async buscarProdutos(filtros) {
    try {
      const fetch = (await import('node-fetch')).default;
      const apiUrl = process.env.API_URL || 'http://localhost:5000';

      // Construir query params para a API
      const params = new URLSearchParams();
      params.append('empresa_id', this.empresaId);

      if (filtros.termo_busca) {
        params.append('busca', filtros.termo_busca);
      }
      if (filtros.categoria) {
        params.append('categoria', filtros.categoria);
      }
      if (filtros.subcategoria) {
        params.append('subcategoria', filtros.subcategoria);
      }
      if (filtros.marca) {
        params.append('marca', filtros.marca);
      }
      if (filtros.aplicacao) {
        params.append('aplicacao', filtros.aplicacao);
      }

      console.log('[AIRA-ATACADO] 🔍 Buscando produtos via API Flask...');
      console.log('[AIRA-ATACADO] 📋 Filtros:', JSON.stringify(filtros));

      const response = await fetch(`${apiUrl}/api/produtos/listar?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Empresa-ID': this.empresaId.toString()
        }
      });

      const data = await response.json();

      if (data.success) {
        // A API pode retornar em data.data.produtos ou data.produtos
        const produtos = data.data?.produtos || data.produtos || [];
        console.log(`[AIRA-ATACADO] ✅ Encontrados ${produtos.length} produtos via API`);
        // Limitar a 5 produtos para resposta
        return produtos.slice(0, 5);
      } else {
        console.error('[AIRA-ATACADO] ❌ API retornou erro:', data.error);
        return [];
      }

    } catch (error) {
      console.error('[AIRA-ATACADO] ❌ Erro ao buscar produtos:', error.message);
      return [];
    }
  }

  /**
   * Listar categorias disponíveis via Flask API (SQLite)
   */
  async listarCategorias() {
    try {
      const fetch = (await import('node-fetch')).default;
      const apiUrl = process.env.API_URL || 'http://localhost:5000';

      console.log('[AIRA-ATACADO] 📂 Buscando categorias via API Flask...');

      const response = await fetch(`${apiUrl}/api/produtos/listar?empresa_id=${this.empresaId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Empresa-ID': this.empresaId.toString()
        }
      });

      const data = await response.json();

      if (data.success) {
        const produtos = data.data?.produtos || data.produtos || [];

        // Agrupar produtos por categoria e contar
        const categoriaMap = {};
        produtos.forEach(p => {
          const cat = p.categoria || 'Outros';
          if (!categoriaMap[cat]) {
            categoriaMap[cat] = 0;
          }
          categoriaMap[cat]++;
        });

        // Converter para array e ordenar
        const categorias = Object.entries(categoriaMap)
          .map(([categoria, quantidade]) => ({ categoria, quantidade }))
          .sort((a, b) => b.quantidade - a.quantidade);

        console.log(`[AIRA-ATACADO] ✅ ${categorias.length} categorias encontradas`);
        return categorias;
      } else {
        console.error('[AIRA-ATACADO] ❌ API retornou erro:', data.error);
        return [];
      }

    } catch (error) {
      console.error('[AIRA-ATACADO] ❌ Erro ao listar categorias:', error.message);
      return [];
    }
  }

  /**
   * Gerar saudacao personalizada
   */
  async gerarSaudacao(nome, mensagem) {
    try {
      const anthropic = new Anthropic({ apiKey: this.anthropicKey });

      const nomeAtendente = this.getNomeAtendente();
      const cargoAtendente = this.getCargoAtendente();
      const empresa = this.botConfig?.empresa_nome || this.config.nomeEmpresa || 'nossa distribuidora';
      const personalidade = this.botConfig?.personalidade || 'Simpatica, prestativa e profissional';
      const estilo = this.botConfig?.estilo_linguagem || 'Linguagem clara e acessivel';
      const conhecimentos = this.botConfig?.conhecimentos_especiais || 'lubrificantes, filtros, aditivos e pecas automotivas';

      const prompt = `Voce e ${nomeAtendente}, ${cargoAtendente} da ${empresa}.

REGRA FUNDAMENTAL: Voce e uma PESSOA REAL, NAO uma inteligencia artificial.

PERSONALIDADE: ${personalidade}
ESTILO: ${estilo}

Cliente disse: "${mensagem}"
Nome: ${nome}

RESPONDA EM NO MAXIMO 2 FRASES CURTAS. A resposta sera convertida em audio de ate 20 segundos.
Cumprimente de forma natural e pergunte como pode ajudar.`;

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 150,
        messages: [{ role: 'user', content: prompt }]
      });

      return response.content[0].text.trim();
    } catch (error) {
      console.error('[AIRA-ATACADO] Erro ao gerar saudacao:', error);
      const nomeAtendente = this.getNomeAtendente();
      const empresa = this.botConfig?.empresa_nome || this.config.nomeEmpresa || 'nossa distribuidora';
      return `Ola ${nome}! Sou a ${nomeAtendente} da ${empresa}! Trabalhamos com lubrificantes, filtros, aditivos e pecas automotivas. Como posso ajudar voce?`;
    }
  }

  /**
   * Gerar resposta com produtos encontrados
   */
  async gerarRespostaComProdutos(mensagem, produtos, nome, analise) {
    try {
      const anthropic = new Anthropic({ apiKey: this.anthropicKey });

      const produtosStr = produtos.map((p, i) => {
        const preco = p.preco ? `R$ ${parseFloat(p.preco).toFixed(2)}` : 'Consultar';
        const estoque = p.estoque > 0 ? `${p.estoque} un.` : 'Sob consulta';
        return `${i + 1}. ${p.nome} (${p.marca}) - ${preco} | Estoque: ${estoque}`;
      }).join('\n');

      const prompt = `Voce e ${this.config.nomeBot}, atendente da ${this.config.nomeEmpresa || 'nossa distribuidora'}.
Cliente perguntou: "${mensagem}"

PRODUTOS:
${produtosStr}

IMPORTANTE: Resposta sera convertida em AUDIO de no maximo 20 segundos!
- Mencione apenas 1-2 produtos principais
- Seja MUITO breve (2-3 frases curtas)
- Destaque preco e disponibilidade
- Pergunte se quer mais detalhes`;

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }]
      });

      return response.content[0].text.trim();
    } catch (error) {
      console.error('[AIRA-ATACADO] ❌ Erro ao gerar resposta:', error);
      return this.formatarProdutosSimples(produtos);
    }
  }

  /**
   * Formatar produtos de forma simples (fallback)
   */
  formatarProdutosSimples(produtos) {
    let resp = `Encontrei ${produtos.length} produto(s):\n\n`;

    produtos.forEach((p, i) => {
      const preco = p.preco ? `R$ ${parseFloat(p.preco).toFixed(2)}` : 'Consultar';
      const estoque = p.estoque > 0 ? `✅ ${p.estoque} un.` : '📞 Sob consulta';
      resp += `*${i + 1}. ${p.nome}*\n`;
      resp += `   ${p.marca} | ${preco}\n`;
      resp += `   Estoque: ${estoque}\n\n`;
    });

    resp += 'Precisa de mais detalhes sobre algum produto?';
    return resp;
  }

  /**
   * Gerar resposta quando não encontra produtos
   */
  async gerarRespostaSemProdutos(mensagem, nome, filtros) {
    try {
      const anthropic = new Anthropic({ apiKey: this.anthropicKey });

      const prompt = `Você é ${this.config.nomeBot}, atendente da ${this.config.nomeEmpresa || 'nossa distribuidora'}.
O cliente perguntou: "${mensagem}"

Infelizmente não encontramos produtos com os filtros aplicados.
Filtros usados: ${JSON.stringify(filtros)}

Responda de forma educada:
- Diga que não encontrou exatamente o que foi pedido
- Sugira alternativas ou peça mais detalhes
- Ofereça ajuda para encontrar outro produto
- Seja breve (2-3 linhas)`;

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }]
      });

      return response.content[0].text.trim();
    } catch (error) {
      return 'Não encontrei produtos com esses critérios. Pode me dar mais detalhes do que procura?';
    }
  }

  /**
   * Gerar resposta para conversa geral
   */
  async gerarRespostaGeral(mensagem, nome, historico) {
    try {
      const anthropic = new Anthropic({ apiKey: this.anthropicKey });

      const historicoStr = historico.slice(-5).map(h => `${h.role}: ${h.msg}`).join('\n');

      const nomeAtendente = this.getNomeAtendente();
      const cargoAtendente = this.getCargoAtendente();
      const empresa = this.botConfig?.empresa_nome || this.config.nomeEmpresa || 'nossa distribuidora';
      const personalidade = this.botConfig?.personalidade || 'Simpatica, prestativa e profissional';
      const estilo = this.botConfig?.estilo_linguagem || 'Linguagem clara e acessivel';
      const conhecimentos = this.botConfig?.conhecimentos_especiais || 'lubrificantes, filtros, aditivos e pecas automotivas';
      const produtosServicos = this.botConfig?.produtos_servicos || 'lubrificantes (Ipiranga, Texaco), filtros (Mann, Tecfil, Fleetguard), aditivos (Militec) e pecas automotivas';

      const prompt = `Voce e ${nomeAtendente}, ${cargoAtendente} da ${empresa}.
Voce e uma PESSOA REAL, NAO uma IA. Se perguntarem, diga que e ${nomeAtendente}.

PERSONALIDADE: ${personalidade}
ESTILO: ${estilo}
CONHECIMENTOS: ${conhecimentos}

HISTORICO RECENTE:
${historicoStr || 'Inicio'}

CLIENTE: "${mensagem}"

IMPORTANTE: Resposta sera convertida em AUDIO de no maximo 20 segundos!
Responda em NO MAXIMO 2-3 FRASES CURTAS e objetivas.
Seja natural, util e pergunte se pode ajudar em algo mais.`;

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 180,
        messages: [{ role: 'user', content: prompt }]
      });

      return response.content[0].text.trim();
    } catch (error) {
      const nomeAtendente = this.getNomeAtendente();
      return `Ola! Sou a ${nomeAtendente}. Como posso ajudar voce? Trabalhamos com lubrificantes, filtros, aditivos e pecas automotivas.`;
    }
  }

  /**
   * Formatar lista de categorias
   */
  formatarCategorias(categorias) {
    if (!categorias || categorias.length === 0) {
      return 'No momento não temos categorias cadastradas.';
    }

    let resp = `*Nossas categorias de produtos:*\n\n`;
    categorias.forEach((cat, i) => {
      resp += `${i + 1}. ${cat.categoria} (${cat.quantidade} produtos)\n`;
    });
    resp += '\nQual categoria te interessa?';
    return resp;
  }

  // ══════════════════════════════════════════════════════════════════
  // REGISTRO AUTOMÁTICO - Clientes, Vendas e Agendamentos
  // ══════════════════════════════════════════════════════════════════

  /**
   * Registrar cliente automaticamente via API
   */
  async registrarCliente(telefone, dados) {
    try {
      const fetch = (await import('node-fetch')).default;
      const apiUrl = process.env.API_URL || 'http://localhost:5000';

      const response = await fetch(`${apiUrl}/api/bot/registrar-cliente`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresa_id: this.empresaId,
          telefone: telefone,
          nome: dados.nome || 'Cliente WhatsApp',
          email: dados.email || '',
          endereco: dados.endereco || '',
          cidade: dados.cidade || '',
          observacoes: dados.observacoes || ''
        })
      });

      const result = await response.json();
      if (result.success) {
        console.log(`[AIRA-ATACADO] ✅ Cliente registrado: ID ${result.cliente_id} (${result.novo ? 'novo' : 'atualizado'})`);
        return result.cliente_id;
      } else {
        console.error('[AIRA-ATACADO] ❌ Erro ao registrar cliente:', result.error);
        return null;
      }
    } catch (error) {
      console.error('[AIRA-ATACADO] ❌ Erro ao registrar cliente:', error.message);
      return null;
    }
  }

  /**
   * Registrar agendamento automaticamente via API
   */
  async registrarAgendamento(telefone, dados) {
    try {
      const fetch = (await import('node-fetch')).default;
      const apiUrl = process.env.API_URL || 'http://localhost:5000';

      const response = await fetch(`${apiUrl}/api/bot/registrar-agendamento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresa_id: this.empresaId,
          telefone: telefone,
          nome_cliente: dados.nome || 'Cliente WhatsApp',
          data: dados.data,  // YYYY-MM-DD
          hora: dados.hora,  // HH:MM
          tipo: dados.tipo || 'visita',
          descricao: dados.descricao || 'Agendamento via WhatsApp',
          observacoes: dados.observacoes || ''
        })
      });

      const result = await response.json();
      if (result.success) {
        console.log(`[AIRA-ATACADO] ✅ Agendamento registrado: ID ${result.agendamento_id} para ${result.data_hora}`);
        return result;
      } else {
        console.error('[AIRA-ATACADO] ❌ Erro ao registrar agendamento:', result.error);
        return null;
      }
    } catch (error) {
      console.error('[AIRA-ATACADO] ❌ Erro ao registrar agendamento:', error.message);
      return null;
    }
  }

  /**
   * Registrar venda automaticamente via API (endpoint completo com fluxo de caixa)
   */
  async registrarVenda(telefone, dados) {
    try {
      const fetch = (await import('node-fetch')).default;
      const apiUrl = process.env.API_URL || 'http://localhost:5000';

      // Preparar itens no formato esperado pelo novo endpoint
      const itens = (dados.produtos || []).map(p => ({
        produto_id: p.produto_id || p.id,
        quantidade: p.quantidade || 1
      }));

      // Chamar endpoint completo que:
      // 1. Cria/encontra cliente
      // 2. Cria pedido com itens
      // 3. Atualiza estoque dos produtos
      // 4. Cria entrega se necessário
      // 5. Notifica gerente automaticamente
      const response = await fetch(`${apiUrl}/api/venda/registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresa_id: this.empresaId,
          cliente: {
            nome: dados.nome || 'Cliente WhatsApp',
            telefone: telefone
          },
          itens: itens,
          forma_pagamento: dados.forma_pagamento || 'a_combinar',
          tipo_entrega: dados.tipo_entrega || 'retirada',
          endereco_entrega: dados.endereco || ''
        })
      });

      const result = await response.json();
      if (result.success) {
        const data = result.data || result;
        console.log(`[AIRA-ATACADO] ✅ Venda registrada: Pedido #${data.pedido_id} - Total: R$ ${data.valor_total}`);
        console.log(`[AIRA-ATACADO] 📦 Cliente #${data.cliente_id} | Estoque atualizado para ${itens.length} produtos`);

        if (data.entrega_id) {
          console.log(`[AIRA-ATACADO] 🚚 Entrega #${data.entrega_id} criada`);
        }

        console.log('[AIRA-ATACADO] 📢 Gerente notificado automaticamente');

        return {
          success: true,
          pedido_id: data.pedido_id,
          cliente_id: data.cliente_id,
          total: data.valor_total,
          entrega_id: data.entrega_id
        };
      } else {
        console.error('[AIRA-ATACADO] ❌ Erro ao registrar venda:', result.error);
        return null;
      }
    } catch (error) {
      console.error('[AIRA-ATACADO] ❌ Erro ao registrar venda:', error.message);
      return null;
    }
  }

  /**
   * Registrar entrega automaticamente via API
   */
  async registrarEntrega(telefone, dados) {
    try {
      const fetch = (await import('node-fetch')).default;
      const apiUrl = process.env.API_URL || 'http://localhost:5000';

      const response = await fetch(`${apiUrl}/api/entregas/bot/registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresa_id: this.empresaId,
          cliente_nome: dados.nome || 'Cliente WhatsApp',
          cliente_telefone: telefone,
          cliente_whatsapp: telefone,
          endereco: dados.endereco || '',
          numero: dados.numero || '',
          complemento: dados.complemento || '',
          bairro: dados.bairro || '',
          cidade: dados.cidade || '',
          estado: dados.estado || '',
          cep: dados.cep || '',
          ponto_referencia: dados.ponto_referencia || '',
          descricao_itens: dados.descricao_itens || dados.produtos || '',
          valor_pedido: dados.valor_total || 0,
          valor_frete: dados.valor_frete || 0,
          forma_pagamento: dados.forma_pagamento || 'a_combinar',
          prioridade: dados.prioridade || 'normal',
          data_agendada: dados.data_entrega || null,
          hora_agendada: dados.hora_entrega || null,
          observacoes: dados.observacoes || '',
          conversa_id: telefone
        })
      });

      const result = await response.json();
      if (result.success) {
        console.log(`[AIRA-ATACADO] ✅ Entrega registrada: ID ${result.entrega_id} para ${dados.nome || telefone}`);

        // === NOTIFICAR GERENTE ===
        try {
          const enderecoCompleto = [
            dados.endereco,
            dados.numero ? `nº ${dados.numero}` : '',
            dados.complemento,
            dados.bairro,
            dados.cidade,
            dados.estado
          ].filter(Boolean).join(', ');

          await fetch(`${apiUrl}/api/empresa/notificacoes/enviar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              empresa_id: this.empresaId,
              tipo: 'entrega',
              dados: {
                status: 'pendente',
                status_texto: 'Nova entrega agendada',
                cliente_nome: dados.nome || 'Cliente WhatsApp',
                endereco: enderecoCompleto || 'Endereço a confirmar',
                pedido_id: result.entrega_id,
                valor: dados.valor_total || '0,00'
              }
            })
          });
          console.log('[AIRA-ATACADO] 📢 Notificação de entrega enviada ao gerente');
        } catch (notifError) {
          console.log('[AIRA-ATACADO] ⚠️ Erro ao notificar gerente (não crítico):', notifError.message);
        }

        return result;
      } else {
        console.error('[AIRA-ATACADO] ❌ Erro ao registrar entrega:', result.error);
        return null;
      }
    } catch (error) {
      console.error('[AIRA-ATACADO] ❌ Erro ao registrar entrega:', error.message);
      return null;
    }
  }

  /**
   * Detectar se cliente quer delivery/entrega
   */
  detectarDelivery(mensagem) {
    const lower = mensagem.toLowerCase();
    const padroes = [
      /delivery|entrega|entregar/i,
      /manda (pra|para|no|na)/i,
      /envia (pra|para|no|na)/i,
      /leva (pra|para|no|na)/i,
      /pode (mandar|enviar|entregar|levar)/i,
      /quero (delivery|entrega|receber em casa)/i,
      /voc[eê]s entregam/i,
      /fazem entrega/i,
      /tem (delivery|entrega)/i,
      /manda (aqui|la|no endereco)/i
    ];

    return padroes.some(p => p.test(lower));
  }

  /**
   * Extrair endereco de mensagem com IA
   */
  async extrairEnderecoIA(mensagem, historico) {
    try {
      const anthropic = new Anthropic({ apiKey: this.anthropicKey });

      const historicoStr = historico.slice(-10).map(h => `${h.role}: ${h.msg}`).join('\n');

      const prompt = `Analise a conversa abaixo e extraia informações de endereço de entrega.

HISTÓRICO:
${historicoStr}

ÚLTIMA MENSAGEM: "${mensagem}"

Extraia as informações de endereço que encontrar. Retorne APENAS um JSON válido:
{
  "tem_endereco": true/false,
  "endereco_completo": "rua/avenida completa ou null",
  "numero": "número ou null",
  "complemento": "apartamento, bloco, etc ou null",
  "bairro": "bairro ou null",
  "cidade": "cidade ou null",
  "estado": "UF ou null",
  "cep": "CEP ou null",
  "ponto_referencia": "ponto de referência ou null"
}

Se não encontrar endereço claro, retorne tem_endereco: false.`;

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }]
      });

      const texto = response.content[0].text.trim();
      let jsonStr = texto;
      if (texto.includes('{')) {
        jsonStr = texto.substring(texto.indexOf('{'), texto.lastIndexOf('}') + 1);
      }

      return JSON.parse(jsonStr);

    } catch (error) {
      console.error('[AIRA-ATACADO] ❌ Erro ao extrair endereço:', error);
      return { tem_endereco: false };
    }
  }

  /**
   * Detectar se cliente quer agendar algo
   */
  detectarAgendamento(mensagem) {
    const lower = mensagem.toLowerCase();
    const padroes = [
      /agendar|agendamento|marcar|reservar/i,
      /quero (ir|passar|buscar|retirar)/i,
      /qual (dia|horario|hora)/i,
      /amanha|segunda|terca|quarta|quinta|sexta|sabado|domingo/i,
      /de manha|de tarde|pela manha|a tarde/i,
      /posso (ir|passar|buscar)/i
    ];

    return padroes.some(p => p.test(lower));
  }

  /**
   * Detectar se cliente confirmou compra/venda
   */
  detectarVenda(mensagem) {
    const lower = mensagem.toLowerCase();
    const padroes = [
      /quero (comprar|levar|pegar)/i,
      /vou (levar|comprar|pegar|querer)/i,
      /pode (separar|reservar)/i,
      /fechado|fecha|fechar|vamos|combinado/i,
      /confirmo|confirma|confirmado/i,
      /pode (mandar|enviar|entregar)/i,
      /pago (agora|hoje|na hora|no pix)/i
    ];

    return padroes.some(p => p.test(lower));
  }

  /**
   * Extrair data/hora de mensagem
   */
  extrairDataHora(mensagem) {
    const lower = mensagem.toLowerCase();
    const agora = new Date();

    let data = null;
    let hora = null;

    // Detectar dia
    if (lower.includes('hoje')) {
      data = agora.toISOString().split('T')[0];
    } else if (lower.includes('amanha') || lower.includes('amanhã')) {
      const amanha = new Date(agora);
      amanha.setDate(amanha.getDate() + 1);
      data = amanha.toISOString().split('T')[0];
    } else if (lower.includes('segunda')) {
      data = this.proximoDiaSemana(1);
    } else if (lower.includes('terca') || lower.includes('terça')) {
      data = this.proximoDiaSemana(2);
    } else if (lower.includes('quarta')) {
      data = this.proximoDiaSemana(3);
    } else if (lower.includes('quinta')) {
      data = this.proximoDiaSemana(4);
    } else if (lower.includes('sexta')) {
      data = this.proximoDiaSemana(5);
    } else if (lower.includes('sabado') || lower.includes('sábado')) {
      data = this.proximoDiaSemana(6);
    }

    // Detectar hora
    const horaMatch = lower.match(/(\d{1,2})\s*(h|hora|:)/i);
    if (horaMatch) {
      hora = horaMatch[1].padStart(2, '0') + ':00';
    } else if (lower.includes('de manha') || lower.includes('pela manha') || lower.includes('manhã')) {
      hora = '09:00';
    } else if (lower.includes('de tarde') || lower.includes('a tarde')) {
      hora = '14:00';
    } else if (lower.includes('final da tarde')) {
      hora = '17:00';
    }

    return { data, hora };
  }

  /**
   * Calcular próximo dia da semana
   */
  proximoDiaSemana(diaSemana) {
    const agora = new Date();
    const diaAtual = agora.getDay();
    let diasAdicionar = diaSemana - diaAtual;
    if (diasAdicionar <= 0) diasAdicionar += 7;
    const proximoData = new Date(agora);
    proximoData.setDate(proximoData.getDate() + diasAdicionar);
    return proximoData.toISOString().split('T')[0];
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // SISTEMA DE ORCAMENTO AUTOMATICO
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Detectar se a resposta indica que vai montar um orçamento
   * e deve enviar automaticamente a lista detalhada
   */
  detectarOrcamentoAutomatico(resposta) {
    const lower = resposta.toLowerCase();
    const padroes = [
      /montar.*or[cç]amento/i,
      /or[cç]amento.*completo/i,
      /deixa.*montar/i,
      /vou.*montar/i,
      /lista.*completa/i,
      /todos.*itens/i,
      /separar.*produtos/i,
      /preparar.*lista/i,
      /calcular.*valor/i,
      /somar.*tudo/i,
      /or[cç]amento.*(total|geral)/i
    ];

    return padroes.some(p => p.test(lower));
  }

  /**
   * Extrair informações do veículo do contexto da conversa
   */
  extrairInfoVeiculo(telefone) {
    const historico = this.getHistorico(telefone);
    const historicoStr = historico.map(h => h.msg).join(' ').toLowerCase();

    let veiculo = {
      marca: null,
      modelo: null,
      motor: null,
      ano: null
    };

    // Detectar marcas comuns
    const marcas = ['fiat', 'volkswagen', 'vw', 'chevrolet', 'gm', 'ford', 'honda', 'toyota', 'hyundai', 'renault', 'nissan', 'jeep', 'peugeot', 'citroen'];
    for (const marca of marcas) {
      if (historicoStr.includes(marca)) {
        veiculo.marca = marca.toUpperCase();
        if (marca === 'vw') veiculo.marca = 'VOLKSWAGEN';
        if (marca === 'gm') veiculo.marca = 'CHEVROLET';
        break;
      }
    }

    // Detectar modelos comuns
    const modelos = {
      'sandero': 'SANDERO', 'logan': 'LOGAN', 'duster': 'DUSTER', 'kwid': 'KWID',
      'onix': 'ONIX', 'prisma': 'PRISMA', 'tracker': 'TRACKER', 'spin': 'SPIN', 'cruze': 'CRUZE',
      'gol': 'GOL', 'polo': 'POLO', 'virtus': 'VIRTUS', 't-cross': 'T-CROSS', 'tcross': 'T-CROSS', 'nivus': 'NIVUS',
      'hb20': 'HB20', 'creta': 'CRETA', 'tucson': 'TUCSON',
      'corolla': 'COROLLA', 'hilux': 'HILUX', 'yaris': 'YARIS', 'sw4': 'SW4',
      'civic': 'CIVIC', 'hr-v': 'HR-V', 'hrv': 'HR-V', 'city': 'CITY', 'fit': 'FIT',
      'ka': 'KA', 'ecosport': 'ECOSPORT', 'ranger': 'RANGER', 'territory': 'TERRITORY',
      'uno': 'UNO', 'argo': 'ARGO', 'mobi': 'MOBI', 'strada': 'STRADA', 'toro': 'TORO', 'cronos': 'CRONOS',
      'compass': 'COMPASS', 'renegade': 'RENEGADE', 'commander': 'COMMANDER'
    };

    for (const [key, value] of Object.entries(modelos)) {
      if (historicoStr.includes(key)) {
        veiculo.modelo = value;
        break;
      }
    }

    // Detectar motor
    const motorMatch = historicoStr.match(/(\d[.,]\d)\s*(litros?|l)?|motor\s*(\d[.,]\d)/i);
    if (motorMatch) {
      veiculo.motor = motorMatch[1] || motorMatch[3];
    }

    // Detectar ano
    const anoMatch = historicoStr.match(/\b(19\d{2}|20[0-2]\d)\b/);
    if (anoMatch) {
      veiculo.ano = anoMatch[1];
    }

    return veiculo;
  }

  /**
   * Buscar produtos para um orçamento de manutenção completa via Flask API
   */
  async buscarProdutosParaOrcamento(infoVeiculo) {
    try {
      const fetch = (await import('node-fetch')).default;
      const apiUrl = process.env.API_URL || 'http://localhost:5000';

      const produtosOrcamento = {
        oleo: null,
        filtroOleo: null,
        filtroAr: null,
        filtroCombustivel: null,
        filtroCabine: null,
        palhetas: null,
        outros: []
      };

      console.log('[AIRA-ATACADO] 📋 Buscando produtos para orçamento via API...');

      // Buscar todos os produtos da empresa
      const response = await fetch(`${apiUrl}/api/produtos/listar?empresa_id=${this.empresaId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Empresa-ID': this.empresaId.toString()
        }
      });

      const data = await response.json();
      if (!data.success) {
        console.error('[AIRA-ATACADO] ❌ API retornou erro:', data.error);
        return produtosOrcamento;
      }

      const todosProdutos = data.data?.produtos || data.produtos || [];
      console.log(`[AIRA-ATACADO] ✅ ${todosProdutos.length} produtos disponíveis para orçamento`);

      // Filtrar produtos ativos e disponíveis
      const produtosAtivos = todosProdutos.filter(p =>
        (p.disponivel === true || p.disponivel === 1) &&
        (p.ativo === true || p.ativo === 1)
      );

      // Buscar óleo de motor
      const oleos = produtosAtivos.filter(p =>
        (p.categoria?.toLowerCase().includes('lubrificante') || p.categoria?.toLowerCase().includes('óleo')) &&
        (p.subcategoria?.toLowerCase().includes('motor') || p.nome?.toLowerCase().includes('motor'))
      ).sort((a, b) => parseFloat(a.preco || 0) - parseFloat(b.preco || 0));
      if (oleos.length > 0) {
        produtosOrcamento.oleo = oleos[0];
      }

      // Buscar filtro de óleo
      const filtrosOleo = produtosAtivos.filter(p =>
        p.categoria?.toLowerCase().includes('filtro') &&
        (p.nome?.toLowerCase().includes('óleo') || p.nome?.toLowerCase().includes('oleo'))
      ).sort((a, b) => parseFloat(a.preco || 0) - parseFloat(b.preco || 0));
      if (filtrosOleo.length > 0) {
        produtosOrcamento.filtroOleo = filtrosOleo[0];
      }

      // Buscar filtro de ar
      const filtrosAr = produtosAtivos.filter(p =>
        p.categoria?.toLowerCase().includes('filtro') &&
        p.nome?.toLowerCase().includes('ar') &&
        !p.nome?.toLowerCase().includes('cabine')
      ).sort((a, b) => parseFloat(a.preco || 0) - parseFloat(b.preco || 0));
      if (filtrosAr.length > 0) {
        produtosOrcamento.filtroAr = filtrosAr[0];
      }

      // Buscar palhetas (se disponível)
      const palhetas = produtosAtivos.filter(p =>
        p.nome?.toLowerCase().includes('palheta') ||
        (p.nome?.toLowerCase().includes('limpador') && p.nome?.toLowerCase().includes('parabrisa'))
      ).sort((a, b) => parseFloat(a.preco || 0) - parseFloat(b.preco || 0));
      if (palhetas.length > 0) {
        produtosOrcamento.palhetas = palhetas[0];
      }

      return produtosOrcamento;

    } catch (error) {
      console.error('[AIRA-ATACADO] ❌ Erro ao buscar produtos para orçamento:', error.message);
      return null;
    }
  }

  /**
   * Montar orçamento formatado como lista/tabela
   */
  async montarOrcamentoFormatado(telefone) {
    const infoVeiculo = this.extrairInfoVeiculo(telefone);
    const produtos = await this.buscarProdutosParaOrcamento(infoVeiculo);

    if (!produtos) return null;

    // Construir descrição do veículo
    let veiculoStr = '';
    if (infoVeiculo.modelo) veiculoStr += infoVeiculo.modelo;
    if (infoVeiculo.marca) veiculoStr = `${infoVeiculo.marca} ${veiculoStr}`;
    if (infoVeiculo.motor) veiculoStr += ` ${infoVeiculo.motor}`;
    if (infoVeiculo.ano) veiculoStr += ` (${infoVeiculo.ano})`;
    veiculoStr = veiculoStr.trim() || 'seu veículo';

    // Montar lista de itens
    let orcamento = `📋 *ORÇAMENTO - ${veiculoStr.toUpperCase()}*\n`;
    orcamento += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    let total = 0;
    const itens = [];

    // Óleo de motor
    if (produtos.oleo) {
      const preco = parseFloat(produtos.oleo.preco);
      const qtd = 4; // Assumir 4 litros para troca completa
      const subtotal = preco * qtd;
      total += subtotal;
      itens.push({
        nome: produtos.oleo.nome,
        servico: 'Troca de óleo',
        qtd: qtd,
        unidade: 'L',
        preco: preco,
        subtotal: subtotal
      });
    }

    // Filtro de óleo
    if (produtos.filtroOleo) {
      const preco = parseFloat(produtos.filtroOleo.preco);
      total += preco;
      itens.push({
        nome: produtos.filtroOleo.nome,
        servico: 'Troca de óleo',
        qtd: 1,
        unidade: 'un',
        preco: preco,
        subtotal: preco
      });
    }

    // Filtro de ar
    if (produtos.filtroAr) {
      const preco = parseFloat(produtos.filtroAr.preco);
      total += preco;
      itens.push({
        nome: produtos.filtroAr.nome,
        servico: 'Manutenção do motor',
        qtd: 1,
        unidade: 'un',
        preco: preco,
        subtotal: preco
      });
    }

    // Palhetas
    if (produtos.palhetas) {
      const preco = parseFloat(produtos.palhetas.preco);
      const qtd = 2;
      const subtotal = preco * qtd;
      total += subtotal;
      itens.push({
        nome: produtos.palhetas.nome,
        servico: 'Visibilidade',
        qtd: qtd,
        unidade: 'un',
        preco: preco,
        subtotal: subtotal
      });
    }

    // Se não tem produtos suficientes, retornar null
    if (itens.length < 2) return null;

    // Formatar itens
    itens.forEach((item, i) => {
      orcamento += `*${i + 1}. ${item.nome}*\n`;
      orcamento += `   📌 ${item.servico}\n`;
      orcamento += `   📦 ${item.qtd} ${item.unidade} x R$ ${item.preco.toFixed(2)}\n`;
      orcamento += `   💰 *R$ ${item.subtotal.toFixed(2)}*\n\n`;
    });

    orcamento += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    orcamento += `💵 *TOTAL: R$ ${total.toFixed(2)}*\n`;
    orcamento += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    // Opções de entrega/agendamento
    orcamento += `📍 *Como você prefere?*\n\n`;
    orcamento += `🚗 *1. Retirar na loja*\n`;
    orcamento += `   ${this.getEndereco() || 'Endereço disponível no WhatsApp'}\n`;
    orcamento += `   Seg-Sex 8h às 18h | Sáb 8h às 12h\n\n`;
    orcamento += `🛵 *2. Delivery*\n`;
    orcamento += `   Nossa equipe de entrega leva até você!\n\n`;
    orcamento += `_Responda 1 ou 2, ou me diga sua preferência!_ 😊`;

    // Salvar orçamento no contexto para referência futura
    this.produtosInteresse.set(telefone + '_orcamento', {
      veiculo: infoVeiculo,
      itens: itens,
      total: total,
      criadoEm: new Date()
    });

    return orcamento;
  }

  /**
   * Obter endereço da empresa das configurações
   */
  getEndereco() {
    try {
      if (this.botConfig?.empresa_config) {
        const config = typeof this.botConfig.empresa_config === 'string'
          ? JSON.parse(this.botConfig.empresa_config)
          : this.botConfig.empresa_config;

        if (config.endereco) {
          let end = config.endereco;
          if (config.numero) end += `, ${config.numero}`;
          if (config.bairro) end += ` - ${config.bairro}`;
          if (config.cidade) end += `, ${config.cidade}`;
          return end;
        }
      }
    } catch (e) {}
    return null;
  }
}

/**
 * Criar instância do Bot Atacado/Varejo para uma empresa
 */
export async function createAtacadoVarejoBot(empresaId, sock, db, config) {
  console.log(`[ATACADO-BOT] 🏪 Inicializando Bot Atacado/Varejo para empresa ${empresaId}`);

  // Verificar API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('[ATACADO-BOT] ❌ ANTHROPIC_API_KEY não configurada!');
  }

  // Configurações do bot - incluir nicho do config!
  const botConfig = {
    empresaId,
    nomeBot: config?.nome_bot || 'AIra',
    nomeEmpresa: config?.nome || config?.empresa_nome || 'Distribuidora',
    nicho: config?.nicho || 'ATACADO_VAREJO', // <-- IMPORTANTE: Passar nicho do config
    mensagemBoasVindas: config?.mensagem_boas_vindas || 'Olá! Como posso ajudar?',
    mensagemAusencia: config?.mensagem_ausencia || 'Obrigado pelo contato! Em breve retornaremos.',
    horarioAtendimento: config?.horario_atendimento || '{"inicio": "00:00", "fim": "23:59"}'
  };

  console.log(`[ATACADO-BOT] 🏷️ Nicho recebido do config: ${config?.nicho || 'NÃO DEFINIDO'}`);

  console.log('[ATACADO-BOT] ═══════════════════════════════════════════════════════');
  console.log(`[ATACADO-BOT]   Empresa ID:         ${empresaId}`);
  console.log(`[ATACADO-BOT]   Nome Bot:           ${botConfig.nomeBot}`);
  console.log(`[ATACADO-BOT]   Empresa:            ${botConfig.nomeEmpresa}`);
  console.log(`[ATACADO-BOT]   IA Claude:          ${process.env.ANTHROPIC_API_KEY ? '✅ Ativo' : '❌ Inativo'}`);
  console.log('[ATACADO-BOT] ═══════════════════════════════════════════════════════');

  // Criar instância do AIraAtacado
  const aira = new AIraAtacado(empresaId, sock, db, botConfig, {
    anthropic: process.env.ANTHROPIC_API_KEY || ''
  });

  // Aguardar inicializacao completa (ElevenLabs, Whisper, configs do banco)
  await aira.aguardarInicializacao();

  /**
   * Processar mensagem recebida
   */
  async function processMessage(message) {
    try {
      console.log('[ATACADO-BOT] 📨 Processando mensagem...');

      // Verificar se bot está ativo
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
          console.log('[ATACADO-BOT] ⏸️ Bot está PAUSADO - ignorando mensagem');
          return false;
        }
      } catch (checkError) {
        console.error('[ATACADO-BOT] ⚠️ Erro ao verificar bot_ativo:', checkError);
      }

      // Extrair dados da mensagem
      const telefone = message.key.remoteJid.replace('@s.whatsapp.net', '').replace('@lid', '');
      const nome = message.pushName || 'Cliente';

      // Verificar se é mensagem de áudio (voice note ou audio)
      const isAudioMessage = message.message?.audioMessage || message.message?.pttMessage;
      let mensagemTexto = '';

      if (isAudioMessage) {
        // Transcrever áudio se o serviço estiver disponível
        console.log('[ATACADO-BOT] 🎤 Recebido áudio do cliente, transcrevendo...');

        if (aira.whisperService && aira.whisperService.isAvailable()) {
          try {
            const transcricao = await aira.whisperService.transcreverMensagem(message);
            if (transcricao) {
              mensagemTexto = transcricao;
              console.log(`[ATACADO-BOT] 🎤 Áudio transcrito: "${transcricao.substring(0, 100)}${transcricao.length > 100 ? '...' : ''}"`);
            } else {
              console.log('[ATACADO-BOT] ⚠️ Não foi possível transcrever o áudio');
              // Enviar mensagem informando que não conseguiu entender o áudio
              await sock.sendMessage(message.key.remoteJid, {
                text: 'Oi! Recebi seu áudio mas não consegui entender bem. Pode mandar em texto? 😊'
              });
              return false;
            }
          } catch (transcError) {
            console.error('[ATACADO-BOT] ❌ Erro ao transcrever áudio:', transcError.message);
            await sock.sendMessage(message.key.remoteJid, {
              text: 'Oi! Tive um probleminha pra ouvir seu áudio. Pode digitar pra mim? 😅'
            });
            return false;
          }
        } else {
          console.log('[ATACADO-BOT] ⚠️ Serviço de transcrição não disponível');
          await sock.sendMessage(message.key.remoteJid, {
            text: 'Oi! No momento não consigo ouvir áudios. Pode mandar sua mensagem em texto? 😊'
          });
          return false;
        }
      } else {
        // Mensagem de texto normal
        mensagemTexto = message.message?.conversation ||
                        message.message?.extendedTextMessage?.text ||
                        message.message?.imageMessage?.caption || '';
      }

      if (!mensagemTexto) {
        console.log('[ATACADO-BOT] ⚠️ Mensagem sem texto, ignorando');
        return false;
      }

      console.log(`[ATACADO-BOT] 📱 De: ${telefone} (${nome})`);
      console.log(`[ATACADO-BOT] 💬 Mensagem: ${mensagemTexto.substring(0, 100)}...`);

      // Usar sistema de agregação de mensagens
      aira.adicionarMensagemPendente(telefone, mensagemTexto, async (mensagemCompleta) => {
        const resposta = await aira.processar(telefone, mensagemCompleta, nome);

        if (resposta) {
          // Enviar resposta em texto
          await sock.sendMessage(message.key.remoteJid, { text: resposta });
          console.log('[ATACADO-BOT] ✅ Resposta em texto enviada');

          // Gerar e enviar audio se configurado
          if (aira.deveEnviarAudio()) {
            try {
              const audioBuffer = await aira.gerarAudio(resposta);
              if (audioBuffer) {
                await sock.sendMessage(message.key.remoteJid, {
                  audio: audioBuffer,
                  mimetype: 'audio/ogg; codecs=opus',
                  ptt: true // Voice note (audio de voz)
                });
                console.log('[ATACADO-BOT] ✅ Audio enviado');
              }
            } catch (audioError) {
              console.error('[ATACADO-BOT] ⚠️ Erro ao enviar audio (texto ja enviado):', audioError.message);
            }
          }

          // ════════════════════════════════════════════════════════════════════
          // ORCAMENTO AUTOMATICO: Se a resposta menciona montar orçamento,
          // envia automaticamente a lista detalhada sem esperar outra mensagem
          // ════════════════════════════════════════════════════════════════════
          if (aira.detectarOrcamentoAutomatico(resposta)) {
            console.log('[ATACADO-BOT] 📋 Detectado pedido de orçamento - gerando lista automatica...');

            try {
              // Pequena pausa para parecer natural (digitando...)
              await new Promise(resolve => setTimeout(resolve, 1500));

              const orcamentoFormatado = await aira.montarOrcamentoFormatado(telefone);

              if (orcamentoFormatado) {
                // Enviar orçamento em texto
                await sock.sendMessage(message.key.remoteJid, { text: orcamentoFormatado });
                console.log('[ATACADO-BOT] ✅ Orçamento automático enviado');

                // Gerar e enviar audio do orçamento se configurado
                if (aira.deveEnviarAudio()) {
                  try {
                    // Versão simplificada para audio
                    const orcamentoAudio = aira.extrairInfoVeiculo(telefone);
                    const textoAudio = `Pronto! Montei o orçamento completo para o seu ${orcamentoAudio.modelo || 'veículo'}. ` +
                      `O total ficou em ${aira.produtosInteresse.get(telefone + '_orcamento')?.total?.toFixed(2).replace('.', ' reais e ') || 'consulte os valores'} centavos. ` +
                      `Me diz como você prefere: retirar aqui na loja ou quer que nossa equipe de entrega leve até você?`;

                    const audioOrcamento = await aira.gerarAudio(textoAudio);
                    if (audioOrcamento) {
                      await sock.sendMessage(message.key.remoteJid, {
                        audio: audioOrcamento,
                        mimetype: 'audio/ogg; codecs=opus',
                        ptt: true
                      });
                      console.log('[ATACADO-BOT] ✅ Audio do orçamento enviado');
                    }
                  } catch (audioOrcError) {
                    console.error('[ATACADO-BOT] ⚠️ Erro ao enviar audio do orçamento:', audioOrcError.message);
                  }
                }

                // Adicionar ao historico
                aira.addHistorico(telefone, aira.getNomeAtendente(), orcamentoFormatado);
              }
            } catch (orcamentoError) {
              console.error('[ATACADO-BOT] ⚠️ Erro ao gerar orçamento automatico:', orcamentoError.message);
            }
          }

          // ════════════════════════════════════════════════════════════════════
          // DELIVERY: Detectar se cliente quer delivery e registrar entrega
          // ════════════════════════════════════════════════════════════════════
          if (aira.detectarDelivery(mensagemCompleta)) {
            console.log('[ATACADO-BOT] 🚚 Detectado pedido de delivery - verificando endereco...');

            try {
              const historico = aira.getHistorico(telefone);
              const infoEndereco = await aira.extrairEnderecoIA(mensagemCompleta, historico);

              if (infoEndereco.tem_endereco) {
                console.log('[ATACADO-BOT] 📍 Endereco detectado:', JSON.stringify(infoEndereco));

                // Obter produtos do interesse para a entrega
                const produtos = aira.produtosInteresse.get(telefone) || [];
                const produtosStr = produtos.map(p => `${p.nome} - R$ ${parseFloat(p.preco || 0).toFixed(2)}`).join(', ');
                const valorTotal = produtos.reduce((acc, p) => acc + parseFloat(p.preco || 0), 0);

                // Registrar entrega automaticamente
                const resultadoEntrega = await aira.registrarEntrega(telefone, {
                  nome: pushName || 'Cliente WhatsApp',
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
                  console.log(`[ATACADO-BOT] ✅ Entrega #${resultadoEntrega.entrega_id} registrada automaticamente`);
                }
              } else {
                console.log('[ATACADO-BOT] 📍 Endereco nao detectado, aguardando mais informacoes');
              }
            } catch (deliveryError) {
              console.error('[ATACADO-BOT] ⚠️ Erro ao processar delivery:', deliveryError.message);
            }
          }

          // ════════════════════════════════════════════════════════════════════
          // VENDA CONFIRMADA: Detectar confirmacao de compra e registrar venda
          // ════════════════════════════════════════════════════════════════════
          if (aira.detectarVenda(mensagemCompleta)) {
            console.log('[ATACADO-BOT] 💰 Detectada confirmacao de venda...');

            try {
              const produtos = aira.produtosInteresse.get(telefone) || [];
              if (produtos.length > 0) {
                const produtosVenda = produtos.map(p => ({
                  produto_id: p.id,
                  nome: p.nome,
                  quantidade: 1,
                  preco: parseFloat(p.preco || 0)
                }));

                const resultadoVenda = await aira.registrarVenda(telefone, {
                  nome: pushName || 'Cliente WhatsApp',
                  produtos: produtosVenda,
                  forma_pagamento: 'a_combinar'
                });

                if (resultadoVenda) {
                  console.log(`[ATACADO-BOT] ✅ Venda #${resultadoVenda.pedido_id} registrada automaticamente`);
                }
              }
            } catch (vendaError) {
              console.error('[ATACADO-BOT] ⚠️ Erro ao registrar venda:', vendaError.message);
            }
          }

          console.log('[ATACADO-BOT] ✅ Mensagem processada com sucesso');
        }
      });

      return true;

    } catch (error) {
      console.error('[ATACADO-BOT] ❌ Erro ao processar mensagem:', error);

      try {
        await sock.sendMessage(message.key.remoteJid, {
          text: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.'
        });
      } catch (sendError) {
        console.error('[ATACADO-BOT] ❌ Erro ao enviar mensagem de erro:', sendError);
      }

      return false;
    }
  }

  // Retornar objeto do bot com nicho REAL da empresa (não hardcoded)
  const nichoReal = aira.botConfig?.nicho || botConfig?.nicho || 'ATACADO_VAREJO';
  console.log(`[ATACADO-BOT] 🏷️ Bot criado com nicho REAL: ${nichoReal}`);

  return {
    type: nichoReal.toLowerCase().replace('_', '-'),
    nicho: nichoReal,
    empresaId,
    config: botConfig,
    processMessage,
    aira,

    // Métodos auxiliares
    getConfig: () => botConfig,
    isActive: () => true,
    getStats: () => ({
      conversasAtivas: aira.conversas.size,
      etapas: Object.fromEntries(aira.etapas.entries()),
      iaMaster: aira.iaMaster?.getStats() || null
    }),

    // Recarregar configuracoes do banco
    recarregarConfig: async () => {
      await aira.carregarConfiguracoes();
      console.log('[ATACADO-BOT] ✅ Configurações recarregadas');
    }
  };
}

console.log('[ATACADO-VAREJO-BOT] ✅ Módulo carregado');

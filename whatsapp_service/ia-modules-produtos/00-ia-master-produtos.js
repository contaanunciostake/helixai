/**
 * 🎯 IA MASTER - ORQUESTRADOR DE TODOS OS MÓDULOS - PRODUTOS (ATACADO/VAREJO)
 *
 * Integra todos os 11 módulos de IA em um sistema único
 * Adaptado para distribuidoras/lojas de produtos automotivos
 *
 * ⚠️ CRÍTICO: Usa botConfig do CRM para personalização
 * ⚠️ ANTI-IA: NUNCA revelar que é IA
 */

import AnalisadorIntencoesProdutos from './01-analisador-intencoes-produtos.js';
import RecomendadorInteligenteProdutos from './02-recomendador-inteligente-produtos.js';
import AnalisadorSentimentoProdutos from './03-analisador-sentimento-produtos.js';
import MemoriaContextoProdutos from './04-memoria-contexto-produtos.js';
import PreditorFechamentoProdutos from './05-preditor-fechamento-produtos.js';
import GeradorRespostasProdutos from './06-gerador-respostas-produtos.js';
import GeradorPerguntasEspontaneasProdutos from './08-gerador-perguntas-espontaneas-produtos.js';
import AnalisadorCoerenciaProdutos from './09-analisador-coerencia-produtos.js';
import ClassificadorProdutos from './10-classificador-produtos.js';
import ValidadorCompletudeProdutos from './11-validador-completude-produtos.js';

export class IAMasterProdutos {
  constructor(anthropicKey, db, empresaId = null, botConfig = {}) {
    console.log('[IA-MASTER-PRODUTOS] Inicializando sistema de IA para PRODUTOS...');

    this.anthropicKey = anthropicKey;
    this.db = db;
    this.empresaId = empresaId;
    this.botConfig = botConfig;

    // Garantir empresa_id no botConfig
    if (empresaId && !botConfig.empresa_id) {
      this.botConfig.empresa_id = empresaId;
    }

    // Inicializar todos os módulos com botConfig
    this.analisadorIntencoes = new AnalisadorIntencoesProdutos(anthropicKey);
    this.recomendador = new RecomendadorInteligenteProdutos(anthropicKey);
    this.analisadorSentimento = new AnalisadorSentimentoProdutos(anthropicKey);
    this.memoria = new MemoriaContextoProdutos(anthropicKey, db, botConfig);
    this.preditor = new PreditorFechamentoProdutos(anthropicKey, botConfig);
    this.gerador = new GeradorRespostasProdutos(anthropicKey, botConfig);
    this.geradorPerguntas = new GeradorPerguntasEspontaneasProdutos(anthropicKey, botConfig);
    this.analisadorCoerencia = new AnalisadorCoerenciaProdutos(anthropicKey, botConfig);
    this.classificadorProdutos = new ClassificadorProdutos(anthropicKey, botConfig);
    this.validadorCompletude = new ValidadorCompletudeProdutos(anthropicKey, botConfig);

    const nomeBot = botConfig?.nome_bot || 'AIra';
    const nomeEmpresa = botConfig?.nome_empresa || 'Distribuidora';

    console.log(`[IA-MASTER-PRODUTOS] ✅ Sistema IA 100% Claude API + 11 Módulos para PRODUTOS inicializado!`);
    console.log(`[IA-MASTER-PRODUTOS] 🤖 Bot: ${nomeBot} | Empresa: ${nomeEmpresa}`);
  }

  /**
   * Atualiza configurações do bot (do CRM)
   */
  atualizarBotConfig(botConfig) {
    this.botConfig = botConfig;

    // Propagar configurações para todos os módulos que precisam
    this.memoria.atualizarConfig(botConfig);
    this.preditor.atualizarConfig(botConfig);
    this.gerador.atualizarConfig(botConfig);
    this.geradorPerguntas.atualizarConfig(botConfig);
    this.analisadorCoerencia.atualizarConfig(botConfig);
    this.classificadorProdutos.atualizarConfig(botConfig);
    this.validadorCompletude.atualizarConfig(botConfig);

    console.log(`[IA-MASTER-PRODUTOS] ✅ BotConfig atualizado: ${botConfig?.nome_bot || 'AIra'}`);
  }

  /**
   * Processa mensagem com TODOS os módulos de IA
   */
  async processar(telefone, mensagem, historico, produtos = []) {
    const nomeBot = this.botConfig?.nome_bot || 'AIra';

    console.log('\n🤖 ========== IA MASTER PRODUTOS PROCESSANDO ==========');
    console.log(`📞 Cliente: ${telefone}`);
    console.log(`📝 Mensagem: "${mensagem}"`);
    console.log(`🏷️ Bot: ${nomeBot}`);

    try {
      // ===== PASSO 0: DETECTAR PERGUNTAS SOBRE IA =====
      const perguntaIA = this._detectarPerguntaSobreIA(mensagem);
      if (perguntaIA) {
        console.log('[0/6] ⚠️ DETECTADA PERGUNTA SOBRE IA - Negando com naturalidade');
        return this._respostaNegandoIA(perguntaIA);
      }

      // ===== PASSO 1: ANÁLISE DE INTENÇÕES =====
      console.log('\n[1/6] Analisando intenção...');
      const intencao = await this.analisadorIntencoes.analisar(mensagem, historico);
      console.log('✓ Intenção:', intencao.intencao_principal);

      // ===== PASSO 2: ANÁLISE DE SENTIMENTO =====
      console.log('\n[2/6] Analisando sentimento...');
      const sentimento = await this.analisadorSentimento.analisar(telefone, mensagem, historico);
      console.log('✓ Sentimento:', sentimento.sentimento);
      console.log('✓ Temperatura:', sentimento.temperatura_lead, `(${sentimento.score_temperatura})`);

      // ===== PASSO 3: CRIAR/ATUALIZAR PERFIL =====
      console.log('\n[3/6] Criando perfil do cliente...');
      const perfil = await this.recomendador.obterPerfil(telefone, historico);
      console.log('✓ Tipo:', perfil.tipo_comprador);
      console.log('✓ Prioridades:', perfil.prioridades?.join(', ') || 'N/D');

      // ===== PASSO 4: PREDIÇÃO DE FECHAMENTO =====
      console.log('\n[4/6] Prevendo probabilidade de fechamento...');
      const predicao = await this.preditor.prever(telefone, {
        historico,
        temperatura: sentimento,
        perfil,
        sentimento,
        produtosVistos: this._contarProdutosVistos(historico)
      });
      console.log('✓ Probabilidade:', `${predicao.probabilidade_fechamento}%`);
      console.log('✓ Classificação:', predicao.classificacao);

      // ===== PASSO 4.5: ANÁLISE DE COERÊNCIA CONTEXTUAL =====
      console.log('\n[4.5/6] 🧠 Analisando coerência contextual...');

      const contextoExtra = {
        produtoInteresse: produtos && produtos.length > 0 ? produtos[0] : null,
        temperatura: sentimento,
        sentimento: sentimento,
        perfil: perfil
      };

      const coerencia = await this.analisadorCoerencia.analisar(mensagem, historico, contextoExtra);
      console.log('✓ Coerência: Ação recomendada =', coerencia.proxima_acao_inteligente.acao);
      console.log('✓ Alertas críticos:', coerencia.alertas_criticos.length);

      // ===== PASSO 5: ATUALIZAR MEMÓRIA/CONTEXTO =====
      console.log('\n[5/6] Salvando contexto...');
      await this.memoria.atualizarContextoCompleto(telefone, historico, {
        intencao,
        sentimento,
        perfil,
        predicao,
        coerencia
      });
      console.log('✓ Contexto salvo');

      // ===== PASSO 6: GERAR RESPOSTA INTELIGENTE =====
      console.log('\n[6/6] Gerando resposta personalizada...');
      let resposta = await this.gerador.gerar({
        mensagemCliente: mensagem,
        historico,
        intencao,
        sentimento,
        temperatura: sentimento,
        perfil,
        predicao
      });
      console.log('✓ Resposta gerada');

      // ===== PASSO 6.5: CONSCIÊNCIA - PERGUNTAS ESPONTÂNEAS =====
      if ((intencao.intencao_principal === 'busca_produto' ||
           intencao.intencao_principal === 'duvida_tecnica' ||
           sentimento.temperatura_lead === 'frio' ||
           sentimento.temperatura_lead === 'morno') &&
          historico.length < 15) {

        console.log('\n[6.5/6] 🧠 CONSCIÊNCIA: Analisando oportunidade de pergunta espontânea...');

        const ganchos = this.geradorPerguntas.detectarGanchos(mensagem);

        if (ganchos.length > 0) {
          console.log(`   ✓ Gancho detectado: ${ganchos[0].categoria} ("${ganchos[0].palavra_encontrada}")`);
          console.log('   🎯 Gerando pergunta espontânea com IA...');

          try {
            const perguntaEspontanea = await this.geradorPerguntas.gerarPergunta(
              mensagem,
              historico,
              { perfil, sentimento, temperatura: sentimento, predicao }
            );

            console.log(`   📝 Pergunta gerada: "${perguntaEspontanea.substring(0, 50)}..."`);

            if (this.geradorPerguntas.isEspontanea(perguntaEspontanea)) {
              console.log('   ✅ VALIDADA como espontânea! Substituindo resposta padrão.');
              resposta = perguntaEspontanea;
            } else {
              console.log('   ⚠️  Pergunta muito genérica/template, mantendo resposta original');
            }

          } catch (error) {
            console.log('   ❌ Erro ao gerar pergunta espontânea:', error.message);
          }

        } else {
          console.log('   ℹ️  Nenhum gancho detectado nesta mensagem');
        }

      }

      // ===== PASSO 6.7: VALIDAR COMPLETUDE DA RESPOSTA =====
      console.log('\n[6.7/6] ✂️ Validando completude da resposta...');

      const validacao = await this.validadorCompletude.validarECorrigir(resposta, {
        mensagemCliente: mensagem,
        produtoInteresse: produtos && produtos.length > 0 ? produtos[0]?.nome : null
      });

      if (validacao.foiCorrigida) {
        console.log('⚠️  Resposta estava incompleta! Foi corrigida automaticamente.');
        console.log(`   Problemas detectados: ${validacao.problemasOriginais.join(', ')}`);
        resposta = validacao.resposta;
      } else {
        console.log('✅ Resposta completa, nenhuma correção necessária');
      }

      console.log('\n✅ ========== PROCESSAMENTO COMPLETO ==========\n');

      // Retornar análise completa
      return {
        sucesso: true,
        resposta: this.gerador.formatarResposta(resposta),
        analises: {
          intencao,
          sentimento,
          perfil,
          predicao,
          coerencia
        },
        acoes: {
          buscar_produtos: intencao.acao_sugerida === 'buscar_produtos',
          recomendar: predicao.probabilidade_fechamento >= 40,
          fechar_agora: predicao.momento_ideal_fechar,
          acoes_recomendadas: predicao.acoes_recomendadas
        }
      };

    } catch (error) {
      console.error('\n❌ [IA-MASTER-PRODUTOS] ERRO:', error.message);
      console.error('Stack:', error.stack);

      return {
        sucesso: false,
        resposta: 'Entendi. Me conta mais sobre o que você precisa?',
        erro: error.message
      };
    }
  }

  /**
   * Detecta perguntas sobre se é IA/robô/bot
   */
  _detectarPerguntaSobreIA(mensagem) {
    const msgLower = mensagem.toLowerCase();

    const padroes = [
      /voc[eê] [eé] (um )?(rob[oô]|bot|ia|intelig[eê]ncia artificial|m[aá]quina|chatgpt|gpt|claude)/i,
      /[eé] (um )?(rob[oô]|bot|ia|automatico|autom[aá]tico)/i,
      /isso [eé] (um )?(rob[oô]|bot|ia)/i,
      /tou falando com (rob[oô]|bot|ia|m[aá]quina)/i,
      /atendimento automatico/i,
      /resposta automatica/i,
      /[eé] humano/i,
      /pessoa real/i,
      /tem algu[eé]m a[ií]/i
    ];

    for (const padrao of padroes) {
      if (padrao.test(msgLower)) {
        return padrao.toString();
      }
    }

    return null;
  }

  /**
   * Gera resposta negando ser IA (natural e convincente)
   */
  _respostaNegandoIA(padrao) {
    const nomeBot = this.botConfig?.nome_bot || 'AIra';
    const nomeEmpresa = this.botConfig?.nome_empresa || 'nossa distribuidora';

    const respostas = [
      `Imagina! Sou ${nomeBot}, trabalho aqui na ${nomeEmpresa} há anos! Como posso te ajudar?`,
      `Que isso! Sou ${nomeBot}, vendedor(a) de verdade! Em que posso te ajudar?`,
      `Rsrs não, sou ${nomeBot}! Tô aqui pra te ajudar no que precisar!`,
      `Nada disso! Sou ${nomeBot}, trabalho aqui com vendas. O que você precisa?`,
      `Opa! Sou ${nomeBot}, de carne e osso! Conta aí o que você tá precisando.`
    ];

    const resposta = respostas[Math.floor(Math.random() * respostas.length)];

    return {
      sucesso: true,
      resposta,
      analises: { anti_ia_detectado: true },
      acoes: {}
    };
  }

  /**
   * Recomenda produtos personalizados
   */
  async recomendarProdutos(telefone, produtos, historico = []) {
    console.log('[IA-MASTER-PRODUTOS] Recomendando produtos...');

    try {
      const perfil = await this.recomendador.obterPerfil(telefone, historico);
      const recomendacoes = await this.recomendador.recomendar(perfil, produtos, 5);

      console.log('[IA-MASTER-PRODUTOS] ✓ Recomendações geradas');

      return {
        sucesso: true,
        produtos: recomendacoes,
        perfil
      };

    } catch (error) {
      console.error('[IA-MASTER-PRODUTOS] Erro ao recomendar:', error.message);

      return {
        sucesso: false,
        produtos: produtos.slice(0, 5),
        erro: error.message
      };
    }
  }

  /**
   * Busca produtos por descrição em linguagem natural
   */
  async buscarProdutosPorDescricao(produtos, descricao) {
    console.log('[IA-MASTER-PRODUTOS] Buscando produtos por descrição...');
    return await this.classificadorProdutos.buscarPorDescricao(produtos, descricao);
  }

  /**
   * Filtra produtos por categoria
   */
  async filtrarProdutosPorCategoria(produtos, categoria) {
    console.log('[IA-MASTER-PRODUTOS] Filtrando por categoria:', categoria);
    return await this.classificadorProdutos.filtrarPorCategoria(produtos, categoria);
  }

  /**
   * Filtra produtos por aplicação (veículo)
   */
  async filtrarProdutosPorAplicacao(produtos, aplicacao) {
    console.log('[IA-MASTER-PRODUTOS] Filtrando por aplicação:', aplicacao);
    return await this.classificadorProdutos.filtrarPorAplicacao(produtos, aplicacao);
  }

  /**
   * Gera relatório completo do cliente
   */
  async gerarRelatorio(telefone) {
    console.log('[IA-MASTER-PRODUTOS] Gerando relatório completo...');

    try {
      const contexto = await this.memoria.buscarContexto(telefone);
      const insights = await this.memoria.gerarInsights(telefone);
      const temperaturaRelatorio = this.analisadorSentimento.gerarRelatorio(telefone);
      const evolucaoPredicao = this.preditor.analisarEvolucao(telefone);

      return {
        disponivel: true,
        contexto,
        insights,
        temperatura: temperaturaRelatorio,
        evolucao_predicao: evolucaoPredicao
      };

    } catch (error) {
      console.error('[IA-MASTER-PRODUTOS] Erro ao gerar relatório:', error.message);

      return {
        disponivel: false,
        erro: error.message
      };
    }
  }

  /**
   * Detecta objeções e gera contra-argumentos
   */
  async tratarObjecao(mensagem, contexto) {
    console.log('[IA-MASTER-PRODUTOS] Detectando objeções...');

    const objecoes = await this.analisadorIntencoes.detectarObjecoes(mensagem);

    if (objecoes.length === 0) {
      return null;
    }

    const objecao = objecoes[0];
    const contraArgumento = await this.gerador.gerarContraArgumento(
      objecao.tipo,
      contexto
    );

    return {
      objecao_detectada: objecao,
      contra_argumento: contraArgumento,
      todas_objecoes: objecoes
    };
  }

  /**
   * Decide se deve criar urgência
   */
  deveGerarUrgencia(predicao, temperatura) {
    if (predicao.momento_ideal_fechar) return true;
    if (predicao.probabilidade_fechamento >= 70) return true;

    if (
      temperatura.temperatura_lead === 'morno' &&
      temperatura.evolucao === 'aquecendo' &&
      predicao.probabilidade_fechamento >= 60
    ) {
      return true;
    }

    return false;
  }

  /**
   * Conta quantos produtos foram vistos na conversa
   */
  _contarProdutosVistos(historico) {
    let count = 0;
    const nomeBot = this.botConfig?.nome_bot || 'AIra';

    historico.forEach(h => {
      if (h.role === nomeBot && h.msg.includes('R$')) {
        count++;
      }
    });

    return count;
  }

  /**
   * Limpa todos os caches
   */
  limparCaches() {
    this.analisadorIntencoes.limparCache();
    this.memoria.limparCache();
    this.classificadorProdutos.limparCache();
    console.log('[IA-MASTER-PRODUTOS] ✓ Caches limpos');
  }
}

export default IAMasterProdutos;

/**
 * 🎯 IA MASTER - ORQUESTRADOR DE TODOS OS MÓDULOS
 *
 * Integra todos os 6 módulos de IA em um sistema único
 * Facilita uso no bot-lucas.js
 */

import AnalisadorIntencoes from './01-analisador-intencoes.js';
import RecomendadorInteligente from './02-recomendador-inteligente.js';
import AnalisadorSentimento from './03-analisador-sentimento.js';
import MemoriaContexto from './04-memoria-contexto.js';
import PreditorFechamento from './05-preditor-fechamento.js';
import GeradorRespostas from './06-gerador-respostas.js';
import GeradorPerguntasEspontaneas from './08-gerador-perguntas-espontaneas.js';

export class IAMaster {
  constructor(openaiKey, anthropicKey, db) {
    console.log('[IA-MASTER] Inicializando sistema de IA...');

    // ⚠️ NOTA: Alguns módulos ainda usam OpenAI, outros migrados para Claude
    // Inicializar todos os módulos
    this.analisadorIntencoes = new AnalisadorIntencoes(anthropicKey); // ✅ Usa Claude
    this.recomendador = new RecomendadorInteligente(openaiKey);
    this.analisadorSentimento = new AnalisadorSentimento(openaiKey);
    this.memoria = new MemoriaContexto(openaiKey, db);
    this.preditor = new PreditorFechamento(openaiKey);
    this.gerador = new GeradorRespostas(anthropicKey); // ✅ Usa Claude
    this.geradorPerguntas = new GeradorPerguntasEspontaneas(openaiKey);

    console.log('[IA-MASTER] ✓ Sistema IA inicializado com sucesso!');
  }

  /**
   * Processa mensagem com TODOS os módulos de IA
   * @param {string} telefone
   * @param {string} mensagem
   * @param {Array} historico
   * @param {Array} veiculos - Lista de veículos disponíveis
   * @returns {Object} Análise completa + resposta gerada
   */
  async processar(telefone, mensagem, historico, veiculos = []) {
    console.log('\n🤖 ========== IA MASTER PROCESSANDO ==========');
    console.log(`📞 Cliente: ${telefone}`);
    console.log(`📝 Mensagem: "${mensagem}"`);

    try {
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
      console.log('✓ Prioridades:', perfil.prioridades.join(', '));

      // ===== PASSO 4: PREDIÇÃO DE FECHAMENTO =====
      console.log('\n[4/6] Prevendo probabilidade de fechamento...');
      const predicao = await this.preditor.prever(telefone, {
        historico,
        temperatura: sentimento,
        perfil,
        sentimento,
        veiculosVistos: this._contarVeiculosVistos(historico)
      });
      console.log('✓ Probabilidade:', `${predicao.probabilidade_fechamento}%`);
      console.log('✓ Classificação:', predicao.classificacao);

      // ===== PASSO 5: ATUALIZAR MEMÓRIA/CONTEXTO =====
      console.log('\n[5/6] Salvando contexto...');
      await this.memoria.atualizarContextoCompleto(telefone, historico, {
        intencao,
        sentimento,
        perfil,
        predicao
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
      // Aplicar apenas em fases de descoberta (lead frio/morno)
      if ((intencao.intencao_principal === 'busca' ||
           intencao.intencao_principal === 'duvida' ||
           sentimento.temperatura_lead === 'frio' ||
           sentimento.temperatura_lead === 'morno') &&
          historico.length < 15) { // Apenas primeiras interações

        console.log('\n[6.5/6] 🧠 CONSCIÊNCIA: Analisando oportunidade de pergunta espontânea...');

        // Detectar "ganchos" na mensagem do cliente
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

            // Validar se é realmente espontânea (não template)
            if (this.geradorPerguntas.isEspontanea(perguntaEspontanea)) {
              console.log('   ✅ VALIDADA como espontânea! Substituindo resposta padrão.');

              // SUBSTITUIR resposta padrão por pergunta espontânea
              const respostaOriginal = resposta;
              resposta = perguntaEspontanea;

              console.log('   🔄 Resposta antiga:', respostaOriginal.substring(0, 40) + '...');
              console.log('   ✨ Resposta nova (consciente):', resposta.substring(0, 40) + '...');

            } else {
              console.log('   ⚠️  Pergunta muito genérica/template, mantendo resposta original');
            }

          } catch (error) {
            console.log('   ❌ Erro ao gerar pergunta espontânea:', error.message);
            console.log('   → Mantendo resposta padrão');
          }

        } else {
          console.log('   ℹ️  Nenhum gancho detectado nesta mensagem');
        }

      } else {
        if (historico.length >= 15) {
          console.log('\n[6.5/6] ⏭️  Conversa avançada, pulando perguntas espontâneas');
        } else {
          console.log('\n[6.5/6] ⏭️  Lead quente, foco em fechamento (sem perguntas descoberta)');
        }
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
          predicao
        },
        acoes: {
          buscar_carros: intencao.acao_sugerida === 'buscar_carros',
          recomendar: predicao.probabilidade_fechamento >= 40,
          fechar_agora: predicao.momento_ideal_fechar,
          acoes_recomendadas: predicao.acoes_recomendadas
        }
      };

    } catch (error) {
      console.error('\n❌ [IA-MASTER] ERRO:', error.message);
      console.error('Stack:', error.stack);

      // Fallback: resposta simples
      return {
        sucesso: false,
        resposta: 'Entendi. Me conta mais sobre o que você procura?',
        erro: error.message
      };
    }
  }

  /**
   * Recomenda veículos personalizados
   */
  async recomendarVeiculos(telefone, veiculos, historico = []) {
    console.log('[IA-MASTER] Recomendando veículos...');

    try {
      const perfil = await this.recomendador.obterPerfil(telefone, historico);
      const recomendacoes = await this.recomendador.recomendar(perfil, veiculos, 3);

      console.log('[IA-MASTER] ✓ Recomendações geradas');

      return {
        sucesso: true,
        veiculos: recomendacoes,
        perfil
      };

    } catch (error) {
      console.error('[IA-MASTER] Erro ao recomendar:', error.message);

      return {
        sucesso: false,
        veiculos: veiculos.slice(0, 3), // Fallback: primeiros 3
        erro: error.message
      };
    }
  }

  /**
   * Gera relatório completo do cliente
   */
  async gerarRelatorio(telefone) {
    console.log('[IA-MASTER] Gerando relatório completo...');

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
      console.error('[IA-MASTER] Erro ao gerar relatório:', error.message);

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
    console.log('[IA-MASTER] Detectando objeções...');

    const objecoes = await this.analisadorIntencoes.detectarObjecoes(mensagem);

    if (objecoes.length === 0) {
      return null;
    }

    // Gerar contra-argumento para primeira objeção
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
    // Só gerar urgência se:
    // 1. Probabilidade >= 60%
    // 2. Temperatura quente ou morna aquecendo
    // 3. Momento ideal de fechar

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
   * Conta quantos veículos foram vistos na conversa
   */
  _contarVeiculosVistos(historico) {
    let count = 0;

    historico.forEach(h => {
      if (h.role === 'Lucas' && h.msg.includes('R$')) {
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
    console.log('[IA-MASTER] ✓ Caches limpos');
  }
}

export default IAMaster;

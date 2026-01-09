/**
 * 🎯 MÓDULO 5: PREDITOR DE FECHAMENTO (SCORE DE VENDA)
 * ✅ ATUALIZADO: Usa Claude API em vez de OpenAI
 *
 * Calcula probabilidade de venda (0-100%)
 * Identifica momento ideal para oferecer test drive
 * Sugere ações para maximizar conversão
 */

import Anthropic from '@anthropic-ai/sdk';

export class PreditorFechamento {
  constructor(anthropicKey) {
    this.anthropic = new Anthropic({ apiKey: anthropicKey });
    this.historicoPredicoes = new Map();
  }

  /**
   * Prediz probabilidade de fechamento
   * @param {string} telefone
   * @param {Object} dadosCompletos - Todos os dados do cliente
   * @returns {Object} Predição completa
   */
  async prever(telefone, dadosCompletos) {
    console.log('[PREDITOR] Calculando probabilidade de fechamento...');

    try {
      // Extrair dados relevantes
      const {
        historico,
        temperatura,
        perfil,
        sentimento,
        veiculosVistos
      } = dadosCompletos;

      // Calcular score base
      const scoreBase = this._calcularScoreBase(
        temperatura,
        sentimento,
        historico,
        veiculosVistos,
        perfil
      );

      // Análise com IA (opcional, para refinar)
      const analiseIA = await this._analisarComIA(dadosCompletos);

      // Score final (média ponderada)
      const scoreFinal = Math.round(
        (scoreBase * 0.7) + (analiseIA.score * 0.3)
      );

      const predicao = {
        telefone,
        timestamp: Date.now(),
        probabilidade_fechamento: scoreFinal,
        classificacao: this._classificarProbabilidade(scoreFinal),
        fatores_positivos: this._identificarFatoresPositivos(dadosCompletos),
        fatores_negativos: this._identificarFatoresNegativos(dadosCompletos),
        momento_ideal_fechar: scoreFinal >= 75,
        acoes_recomendadas: this._gerarAcoesRecomendadas(scoreFinal, dadosCompletos),
        previsao_dias_fechamento: this._preverDiasFechamento(scoreFinal, temperatura),
        nivel_risco_perda: this._calcularRiscoPerda(dadosCompletos),
        proxima_acao_critica: this._definirProximaAcao(scoreFinal, dadosCompletos)
      };

      // Salvar histórico
      this._salvarHistorico(telefone, predicao);

      console.log('[PREDITOR] ✓ Probabilidade:', `${scoreFinal}%`, predicao.classificacao);

      return predicao;

    } catch (error) {
      console.error('[PREDITOR] Erro:', error.message);
      return this._predicaoPadrao();
    }
  }

  /**
   * Calcula score base (0-100) usando métricas objetivas
   */
  _calcularScoreBase(temperatura, sentimento, historico, veiculosVistos, perfil) {
    let score = 0;

    // 1. TEMPERATURA DO LEAD (40 pontos)
    if (temperatura?.score_temperatura) {
      score += (temperatura.score_temperatura * 0.4); // Máx 40
    } else {
      score += 20; // Padrão se não tiver temperatura
    }

    // 2. SENTIMENTO (20 pontos)
    const scoresSentimento = {
      'muito_positivo': 20,
      'positivo': 15,
      'neutro': 10,
      'negativo': 5,
      'frustrado': 0
    };
    score += scoresSentimento[sentimento?.sentimento] || 10;

    // 3. ENGAJAMENTO (15 pontos)
    const totalMensagens = historico?.length || 0;
    if (totalMensagens >= 30) score += 15;
    else if (totalMensagens >= 20) score += 12;
    else if (totalMensagens >= 10) score += 8;
    else if (totalMensagens >= 5) score += 5;

    // 4. VEÍCULOS VISTOS (10 pontos)
    const veiculosVistosCount = veiculosVistos || 0;
    if (veiculosVistosCount >= 5) score += 10;
    else if (veiculosVistosCount >= 3) score += 7;
    else if (veiculosVistosCount >= 1) score += 4;

    // 5. PREFERÊNCIAS DEFINIDAS (10 pontos)
    if (perfil?.preferencias) {
      let countDefinidos = 0;
      if (perfil.preferencias.marca) countDefinidos++;
      if (perfil.preferencias.tipo_veiculo) countDefinidos++;
      if (perfil.preferencias.cambio && perfil.preferencias.cambio !== 'indiferente') countDefinidos++;

      score += (countDefinidos / 3) * 10;
    }

    // 6. ORÇAMENTO DEFINIDO (5 pontos)
    if (perfil?.orcamento?.confortavel || perfil?.orcamento?.maximo) {
      score += 5;
    }

    return Math.min(100, Math.round(score));
  }

  /**
   * Análise com IA para refinar predição
   */
  async _analisarComIA(dadosCompletos) {
    try {
      const resumoConversa = this._prepararResumoParaIA(dadosCompletos);

      const prompt = `Analise esta conversa de vendas e preveja a probabilidade de fechamento.

${resumoConversa}

Retorne APENAS um JSON válido:
{
  "score": number (0-100),
  "justificativa": "string explicando o score",
  "sinais_compra_forte": ["lista de sinais positivos"],
  "sinais_preocupantes": ["lista de sinais negativos"],
  "recomendacao": "string com ação recomendada"
}`;

      const systemPrompt = 'Você é um especialista em prever fechamento de vendas. Seja objetivo e baseie-se em dados. Retorne APENAS JSON.';

      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 500,
        temperature: 0.2,
        messages: [
          {
            role: 'user',
            content: `${systemPrompt}\n\n${prompt}`
          }
        ]
      });

      // Extrair JSON da resposta
      let respostaTexto = response.content[0].text.trim();
      respostaTexto = respostaTexto.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const jsonMatch = respostaTexto.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Resposta não contém JSON válido');
      }
      return JSON.parse(jsonMatch[0]);

    } catch (error) {
      console.log('[PREDITOR] IA falhou, usando score base apenas');
      return {
        score: 50,
        justificativa: 'Análise baseada em métricas objetivas',
        sinais_compra_forte: [],
        sinais_preocupantes: []
      };
    }
  }

  /**
   * Prepara resumo dos dados para IA
   */
  _prepararResumoParaIA(dados) {
    let resumo = `ANÁLISE DE PROBABILIDADE DE FECHAMENTO:\n\n`;

    resumo += `TEMPERATURA DO LEAD: ${dados.temperatura?.temperatura_lead || 'desconhecido'}\n`;
    resumo += `SCORE TEMPERATURA: ${dados.temperatura?.score_temperatura || 0}/100\n\n`;

    resumo += `SENTIMENTO: ${dados.sentimento?.sentimento || 'neutro'}\n`;
    resumo += `NÍVEL DE INTERESSE: ${dados.sentimento?.nivel_interesse || 'medio'}\n\n`;

    resumo += `TOTAL DE MENSAGENS: ${dados.historico?.length || 0}\n`;
    resumo += `VEÍCULOS VISTOS: ${dados.veiculosVistos || 0}\n\n`;

    if (dados.perfil?.preferencias) {
      resumo += `PREFERÊNCIAS:\n`;
      resumo += `- Marca: ${dados.perfil.preferencias.marca || 'indefinida'}\n`;
      resumo += `- Tipo: ${dados.perfil.preferencias.tipo_veiculo || 'indefinido'}\n`;
      resumo += `- Orçamento: ${dados.perfil.orcamento?.confortavel ? `R$ ${dados.perfil.orcamento.confortavel}` : 'indefinido'}\n\n`;
    }

    if (dados.historico && dados.historico.length > 0) {
      const ultimasMensagens = dados.historico.slice(-3);
      resumo += `ÚLTIMAS MENSAGENS:\n`;
      ultimasMensagens.forEach(h => {
        resumo += `${h.role}: "${h.msg}"\n`;
      });
    }

    return resumo;
  }

  /**
   * Classifica probabilidade
   */
  _classificarProbabilidade(score) {
    if (score >= 80) return 'MUITO_ALTA';
    if (score >= 60) return 'ALTA';
    if (score >= 40) return 'MEDIA';
    if (score >= 20) return 'BAIXA';
    return 'MUITO_BAIXA';
  }

  /**
   * Identifica fatores positivos
   */
  _identificarFatoresPositivos(dados) {
    const fatores = [];

    if (dados.temperatura?.temperatura_lead === 'quente') {
      fatores.push('Lead muito aquecido');
    }

    if (dados.sentimento?.sentimento === 'muito_positivo' || dados.sentimento?.sentimento === 'positivo') {
      fatores.push('Sentimento positivo');
    }

    if (dados.sentimento?.pronto_para_decisao) {
      fatores.push('Cliente pronto para decisão');
    }

    if ((dados.historico?.length || 0) >= 20) {
      fatores.push('Alto engajamento na conversa');
    }

    if (dados.perfil?.orcamento?.confortavel) {
      fatores.push('Orçamento definido');
    }

    if (dados.perfil?.preferencias?.marca) {
      fatores.push('Preferências claras');
    }

    if (dados.veiculosVistos >= 3) {
      fatores.push('Viu múltiplos veículos');
    }

    if (dados.temperatura?.evolucao === 'aquecendo') {
      fatores.push('Interesse crescente');
    }

    return fatores;
  }

  /**
   * Identifica fatores negativos
   */
  _identificarFatoresNegativos(dados) {
    const fatores = [];

    if (dados.temperatura?.temperatura_lead === 'frio') {
      fatores.push('Lead frio');
    }

    if (dados.sentimento?.sentimento === 'frustrado' || dados.sentimento?.sentimento === 'negativo') {
      fatores.push('Sentimento negativo');
    }

    if ((dados.sentimento?.sinais_negativos?.length || 0) > 2) {
      fatores.push('Múltiplas objeções');
    }

    if ((dados.historico?.length || 0) < 5) {
      fatores.push('Baixo engajamento');
    }

    if (!dados.perfil?.orcamento?.confortavel) {
      fatores.push('Orçamento indefinido');
    }

    if (dados.temperatura?.evolucao === 'esfriando') {
      fatores.push('Interesse decrescente');
    }

    if (dados.sentimento?.esta_comparando) {
      fatores.push('Está comparando concorrentes');
    }

    return fatores;
  }

  /**
   * Gera ações recomendadas
   */
  _gerarAcoesRecomendadas(score, dados) {
    const acoes = [];

    // Score >= 80: FECHAR AGORA
    if (score >= 80) {
      acoes.push({
        prioridade: 'URGENTE',
        acao: 'Oferecer test drive imediatamente',
        razao: 'Probabilidade muito alta, momento ideal'
      });

      acoes.push({
        prioridade: 'URGENTE',
        acao: 'Criar senso de urgência (estoque limitado, promoção)',
        razao: 'Evitar que o cliente esfrie'
      });

      acoes.push({
        prioridade: 'ALTA',
        acao: 'Apresentar condições de financiamento',
        razao: 'Facilitar decisão'
      });
    }

    // Score 60-79: EMPURRAR PARA DECISÃO
    else if (score >= 60) {
      acoes.push({
        prioridade: 'ALTA',
        acao: 'Apresentar simulação de financiamento',
        razao: 'Tornar compra tangível'
      });

      acoes.push({
        prioridade: 'ALTA',
        acao: 'Enviar mais fotos/vídeo do veículo de interesse',
        razao: 'Aumentar desejo'
      });

      acoes.push({
        prioridade: 'MEDIA',
        acao: 'Sugerir visita à loja',
        razao: 'Aproximar da decisão'
      });
    }

    // Score 40-59: NUTRIR LEAD
    else if (score >= 40) {
      acoes.push({
        prioridade: 'MEDIA',
        acao: 'Responder objeções identificadas',
        razao: 'Remover barreiras'
      });

      acoes.push({
        prioridade: 'MEDIA',
        acao: 'Apresentar benefícios específicos',
        razao: 'Aumentar valor percebido'
      });

      acoes.push({
        prioridade: 'BAIXA',
        acao: 'Compartilhar depoimentos de clientes',
        razao: 'Construir confiança'
      });
    }

    // Score < 40: REENGAJAR
    else {
      acoes.push({
        prioridade: 'ALTA',
        acao: 'Identificar objeções principais',
        razao: 'Entender resistências'
      });

      acoes.push({
        prioridade: 'MEDIA',
        acao: 'Oferecer veículos alternativos',
        razao: 'Ampliar opções'
      });

      acoes.push({
        prioridade: 'BAIXA',
        acao: 'Manter contato periódico',
        razao: 'Não perder oportunidade futura'
      });
    }

    return acoes;
  }

  /**
   * Prevê em quantos dias o fechamento pode ocorrer
   */
  _preverDiasFechamento(score, temperatura) {
    if (score >= 80) return '1-2 dias';
    if (score >= 60) return '3-5 dias';
    if (score >= 40) return '1-2 semanas';
    return '2-4 semanas ou mais';
  }

  /**
   * Calcula risco de perder o cliente
   */
  _calcularRiscoPerda(dados) {
    let risco = 'BAIXO';

    // Fatores de risco alto
    if (dados.temperatura?.evolucao === 'esfriando') risco = 'MEDIO';
    if (dados.sentimento?.sentimento === 'frustrado') risco = 'ALTO';
    if (dados.sentimento?.esta_comparando) risco = 'MEDIO';

    // Sinais de abandono
    const ultimaMensagem = dados.historico?.[dados.historico.length - 1];
    if (ultimaMensagem) {
      const textoLower = ultimaMensagem.msg.toLowerCase();

      if (/vou pensar|depois|mais tarde/i.test(textoLower)) {
        risco = 'ALTO';
      }
    }

    return risco;
  }

  /**
   * Define próxima ação crítica
   */
  _definirProximaAcao(score, dados) {
    if (score >= 75) {
      return {
        acao: 'FECHAR_VENDA',
        descricao: 'Oferecer test drive ou fechamento',
        prazo: 'IMEDIATO'
      };
    }

    if (score >= 60) {
      return {
        acao: 'SIMULAR_FINANCIAMENTO',
        descricao: 'Apresentar condições de pagamento',
        prazo: '24 HORAS'
      };
    }

    if (score >= 40) {
      return {
        acao: 'RESPONDER_OBJECOES',
        descricao: 'Endereçar dúvidas e objeções',
        prazo: '48 HORAS'
      };
    }

    return {
      acao: 'MANTER_CONTATO',
      descricao: 'Nutrir relacionamento',
      prazo: '3-7 DIAS'
    };
  }

  /**
   * Salva histórico de predições
   */
  _salvarHistorico(telefone, predicao) {
    const historico = this.historicoPredicoes.get(telefone) || [];

    historico.push({
      timestamp: predicao.timestamp,
      probabilidade: predicao.probabilidade_fechamento,
      classificacao: predicao.classificacao
    });

    // Manter últimas 10 predições
    if (historico.length > 10) {
      historico.shift();
    }

    this.historicoPredicoes.set(telefone, historico);
  }

  /**
   * Análise de evolução da probabilidade ao longo do tempo
   */
  analisarEvolucao(telefone) {
    const historico = this.historicoPredicoes.get(telefone);

    if (!historico || historico.length < 2) {
      return {
        disponivel: false,
        mensagem: 'Dados insuficientes'
      };
    }

    const primeira = historico[0];
    const ultima = historico[historico.length - 1];
    const variacao = ultima.probabilidade - primeira.probabilidade;

    return {
      disponivel: true,
      probabilidade_inicial: primeira.probabilidade,
      probabilidade_atual: ultima.probabilidade,
      variacao: variacao,
      variacao_percentual: ((variacao / primeira.probabilidade) * 100).toFixed(1),
      tendencia: variacao > 10 ? 'MELHORANDO' : variacao < -10 ? 'PIORANDO' : 'ESTAVEL',
      total_predicoes: historico.length
    };
  }

  /**
   * Predição padrão (fallback)
   */
  _predicaoPadrao() {
    return {
      probabilidade_fechamento: 50,
      classificacao: 'MEDIA',
      fatores_positivos: [],
      fatores_negativos: [],
      momento_ideal_fechar: false,
      acoes_recomendadas: [
        {
          prioridade: 'MEDIA',
          acao: 'Continuar conversa',
          razao: 'Dados insuficientes'
        }
      ],
      previsao_dias_fechamento: '1-2 semanas',
      nivel_risco_perda: 'MEDIO',
      proxima_acao_critica: {
        acao: 'DESCOBRIR_NECESSIDADES',
        descricao: 'Entender melhor o cliente',
        prazo: '48 HORAS'
      }
    };
  }
}

export default PreditorFechamento;

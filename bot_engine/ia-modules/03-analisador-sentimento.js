/**
 * 🎯 MÓDULO 3: ANALISADOR DE SENTIMENTO E TEMPERATURA DO LEAD
 *
 * Mede o interesse do cliente (frio/morno/quente)
 * Detecta frustração, dúvidas e ajusta tom de resposta
 *
 * ✅ ATUALIZADO: Usa Claude API em vez de OpenAI
 */

import Anthropic from '@anthropic-ai/sdk';

export class AnalisadorSentimento {
  constructor(anthropicKey) {
    this.anthropic = new Anthropic({ apiKey: anthropicKey });

    if (!this.anthropic) {
      console.warn('⚠️ [SENTIMENTO] Anthropic não configurado');
    }

    this.historicoTemperatura = new Map(); // Histórico de temperatura por cliente
  }

  /**
   * Analisa sentimento e temperatura do lead
   * @param {string} telefone - Telefone do cliente
   * @param {string} mensagem - Mensagem atual
   * @param {Array} historico - Histórico da conversa
   * @returns {Object} Análise completa
   */
  async analisar(telefone, mensagem, historico = []) {
    console.log('[SENTIMENTO] Analisando temperatura do lead...');

    try {
      const analise = await this._analisarComIA(mensagem, historico);

      // Calcular temperatura global do lead
      const temperatura = this._calcularTemperatura(telefone, analise, historico);

      const resultado = {
        ...analise,
        temperatura_lead: temperatura.nivel, // "frio", "morno", "quente"
        score_temperatura: temperatura.score, // 0-100
        evolucao: temperatura.evolucao, // "aquecendo", "esfriando", "estavel"
        recomendacao_acao: this._recomendarAcao(temperatura, analise),
        momento_ideal_fechar: temperatura.score >= 75,
        sinais_positivos: analise.sinais_positivos || [],
        sinais_negativos: analise.sinais_negativos || []
      };

      // Salvar no histórico
      this._atualizarHistorico(telefone, resultado);

      console.log('[SENTIMENTO] ✓ Temperatura:', temperatura.nivel, `(${temperatura.score})`);

      return resultado;

    } catch (error) {
      console.error('[SENTIMENTO] Erro:', error.message);
      return this._analiseFallback(mensagem);
    }
  }

  /**
   * Análise com IA
   */
  async _analisarComIA(mensagem, historico) {
    const conversaContexto = historico
      .slice(-5)
      .map(h => `${h.role}: ${h.msg}`)
      .join('\n');

    const prompt = `Analise o sentimento e interesse do cliente nesta conversa de venda de carros.

MENSAGEM ATUAL: "${mensagem}"

CONTEXTO:
${conversaContexto}

Retorne APENAS um JSON válido:
{
  "sentimento": "muito_positivo|positivo|neutro|negativo|frustrado|ansioso",
  "nivel_interesse": "baixo|medio|alto|muito_alto",
  "sinais_positivos": ["lista de sinais de interesse"],
  "sinais_negativos": ["lista de sinais de desinteresse/objeções"],
  "emocoes_detectadas": ["lista de emoções: empolgacao, duvida, pressa, cautela, etc"],
  "tom_recomendado": "entusiasmado|consultivo|calmo|urgente|empatico",
  "esta_comparando": boolean,
  "pronto_para_decisao": boolean,
  "nivel_confianca": "baixo|medio|alto",
  "razao_analise": "breve explicação da análise"
}`;

    try {
      // ✅ Usar Claude API
      const systemPrompt = 'Você é um psicólogo especializado em análise de sentimento e comportamento de compradores. Retorne APENAS JSON válido (sem markdown).';

      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 500,
        temperature: 0.3,
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
      console.error('[SENTIMENTO] ❌ Claude falhou:', error.message);
      throw error; // Vai usar análise fallback
    }
  }

  /**
   * Calcula temperatura do lead (0-100)
   */
  _calcularTemperatura(telefone, analise, historico) {
    let score = 50; // Base neutra

    // Análise do sentimento atual (+/- 20 pontos)
    const scoresSentimento = {
      'muito_positivo': 20,
      'positivo': 15,
      'neutro': 0,
      'negativo': -10,
      'frustrado': -20,
      'ansioso': 5 // Ansiedade pode indicar interesse
    };
    score += scoresSentimento[analise.sentimento] || 0;

    // Nível de interesse (+/- 25 pontos)
    const scoresInteresse = {
      'muito_alto': 25,
      'alto': 18,
      'medio': 5,
      'baixo': -10
    };
    score += scoresInteresse[analise.nivel_interesse] || 0;

    // Sinais positivos (até +15 pontos)
    score += Math.min(analise.sinais_positivos.length * 3, 15);

    // Sinais negativos (até -15 pontos)
    score -= Math.min(analise.sinais_negativos.length * 3, 15);

    // Pronto para decisão (+20 pontos)
    if (analise.pronto_para_decisao) {
      score += 20;
    }

    // Comparando (neutro/levemente positivo)
    if (analise.esta_comparando) {
      score += 5;
    }

    // Confiança (+/- 10 pontos)
    const scoresConfianca = {
      'alto': 10,
      'medio': 0,
      'baixo': -10
    };
    score += scoresConfianca[analise.nivel_confianca] || 0;

    // Histórico de engajamento (até +10 pontos)
    if (historico.length >= 10) {
      score += 5; // Cliente engajado
    }
    if (historico.length >= 20) {
      score += 5; // Muito engajado
    }

    // Garantir 0-100
    score = Math.max(0, Math.min(100, score));

    // Classificar temperatura
    let nivel;
    if (score < 40) nivel = 'frio';
    else if (score < 70) nivel = 'morno';
    else nivel = 'quente';

    // Calcular evolução
    const evolucao = this._calcularEvolucao(telefone, score);

    return { score, nivel, evolucao };
  }

  /**
   * Calcula se o lead está aquecendo ou esfriando
   */
  _calcularEvolucao(telefone, scoreAtual) {
    const historico = this.historicoTemperatura.get(telefone) || [];

    if (historico.length === 0) {
      return 'estavel';
    }

    const scoreAnterior = historico[historico.length - 1].score;
    const diferenca = scoreAtual - scoreAnterior;

    if (diferenca >= 10) return 'aquecendo';
    if (diferenca <= -10) return 'esfriando';
    return 'estavel';
  }

  /**
   * Atualiza histórico de temperatura
   */
  _atualizarHistorico(telefone, resultado) {
    const historico = this.historicoTemperatura.get(telefone) || [];

    historico.push({
      timestamp: Date.now(),
      score: resultado.score_temperatura,
      nivel: resultado.temperatura_lead,
      sentimento: resultado.sentimento
    });

    // Manter apenas últimos 20 registros
    if (historico.length > 20) {
      historico.shift();
    }

    this.historicoTemperatura.set(telefone, historico);
  }

  /**
   * Recomenda ação baseada na temperatura
   */
  _recomendarAcao(temperatura, analise) {
    const { nivel, score, evolucao } = temperatura;

    // Lead QUENTE (>= 70)
    if (nivel === 'quente') {
      if (analise.pronto_para_decisao) {
        return {
          acao: 'fechar_agora',
          mensagem: 'Cliente pronto! Ofereça test drive ou fechamento imediato.',
          urgencia: 'alta'
        };
      }
      return {
        acao: 'empurrar_decisao',
        mensagem: 'Cliente muito interessado. Crie senso de urgência.',
        urgencia: 'alta'
      };
    }

    // Lead MORNO (40-69)
    if (nivel === 'morno') {
      if (evolucao === 'aquecendo') {
        return {
          acao: 'continuar_nutrindo',
          mensagem: 'Cliente aquecendo. Continue apresentando benefícios.',
          urgencia: 'media'
        };
      }
      if (evolucao === 'esfriando') {
        return {
          acao: 'reengajar',
          mensagem: 'Cliente esfriando. Identifique objeções e reengaje.',
          urgencia: 'media'
        };
      }
      return {
        acao: 'aprofundar',
        mensagem: 'Cliente interessado. Aprofunde informações.',
        urgencia: 'media'
      };
    }

    // Lead FRIO (< 40)
    if (analise.sinais_negativos.length > 2) {
      return {
        acao: 'superar_objecoes',
        mensagem: 'Cliente com objeções. Foque em resolver dúvidas.',
        urgencia: 'baixa'
      };
    }

    return {
      acao: 'descobrir_necessidades',
      mensagem: 'Cliente frio. Foque em descobrir necessidades.',
      urgencia: 'baixa'
    };
  }

  /**
   * Detecta se cliente está frustrado/impaciente
   */
  detectarFrustracao(mensagem) {
    const sinaisFrustracao = [
      /não entend(i|eu)/i,
      /não respond(e|eu)/i,
      /já perguntei/i,
      /de novo|novamente/i,
      /cans(ei|ado)/i,
      /complicado/i,
      /demora/i,
      /rápido|rapido/i,
      /com pressa/i
    ];

    return sinaisFrustracao.some(regex => regex.test(mensagem));
  }

  /**
   * Detecta urgência na mensagem
   */
  detectarUrgencia(mensagem) {
    const sinaisUrgencia = [
      /preciso (hoje|agora|urgente)/i,
      /rápido|rapido/i,
      /quanto antes/i,
      /o mais breve/i,
      /essa semana/i,
      /pressa/i,
      /logo/i
    ];

    const nivel = sinaisUrgencia.filter(regex => regex.test(mensagem)).length;

    if (nivel >= 2) return 'alta';
    if (nivel === 1) return 'media';
    return 'baixa';
  }

  /**
   * Análise fallback (sem IA)
   */
  _analiseFallback(mensagem) {
    const msgLower = mensagem.toLowerCase();

    // Palavras positivas vs negativas
    const positivas = ['gostei', 'interessante', 'perfeito', 'ótimo', 'legal', 'bom', 'sim'];
    const negativas = ['caro', 'não', 'nao', 'ruim', 'fraco', 'depois'];

    const countPositivas = positivas.filter(p => msgLower.includes(p)).length;
    const countNegativas = negativas.filter(n => msgLower.includes(n)).length;

    let sentimento = 'neutro';
    let nivel_interesse = 'medio';

    if (countPositivas > countNegativas) {
      sentimento = 'positivo';
      nivel_interesse = 'alto';
    } else if (countNegativas > countPositivas) {
      sentimento = 'negativo';
      nivel_interesse = 'baixo';
    }

    return {
      sentimento,
      nivel_interesse,
      sinais_positivos: [],
      sinais_negativos: [],
      emocoes_detectadas: [],
      tom_recomendado: 'consultivo',
      esta_comparando: false,
      pronto_para_decisao: false,
      nivel_confianca: 'medio',
      razao_analise: 'Análise básica (fallback)',
      temperatura_lead: 'morno',
      score_temperatura: 50,
      evolucao: 'estavel',
      recomendacao_acao: {
        acao: 'continuar_nutrindo',
        mensagem: 'Continue a conversa',
        urgencia: 'media'
      }
    };
  }

  /**
   * Gera relatório de temperatura do lead
   */
  gerarRelatorio(telefone) {
    const historico = this.historicoTemperatura.get(telefone) || [];

    if (historico.length === 0) {
      return {
        status: 'sem_dados',
        mensagem: 'Não há histórico suficiente'
      };
    }

    const scoreAtual = historico[historico.length - 1].score;
    const scoreInicial = historico[0].score;
    const variacao = scoreAtual - scoreInicial;

    const pico = Math.max(...historico.map(h => h.score));
    const vale = Math.min(...historico.map(h => h.score));

    return {
      status: 'ok',
      score_atual: scoreAtual,
      score_inicial: scoreInicial,
      variacao: variacao,
      variacao_percentual: ((variacao / scoreInicial) * 100).toFixed(1),
      pico_temperatura: pico,
      vale_temperatura: vale,
      total_interacoes: historico.length,
      tendencia: variacao > 10 ? 'aquecendo' : variacao < -10 ? 'esfriando' : 'estavel'
    };
  }
}

export default AnalisadorSentimento;

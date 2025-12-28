/**
 * 🎯 MÓDULO 3: ANALISADOR DE SENTIMENTO - PRODUTOS (ATACADO/VAREJO)
 *
 * Mede o interesse do cliente (frio/morno/quente)
 * Adaptado para contexto de distribuidora/loja de produtos
 */

import Anthropic from '@anthropic-ai/sdk';

export class AnalisadorSentimentoProdutos {
  constructor(anthropicKey) {
    this.anthropic = new Anthropic({ apiKey: anthropicKey });
    this.historicoTemperatura = new Map();
  }

  async analisar(telefone, mensagem, historico = []) {
    console.log('[SENTIMENTO-PRODUTOS] Analisando temperatura do lead...');

    try {
      const analise = await this._analisarComIA(mensagem, historico);
      const temperatura = this._calcularTemperatura(telefone, analise, historico);

      const resultado = {
        ...analise,
        temperatura_lead: temperatura.nivel,
        score_temperatura: temperatura.score,
        evolucao: temperatura.evolucao,
        recomendacao_acao: this._recomendarAcao(temperatura, analise),
        momento_ideal_fechar: temperatura.score >= 75,
        sinais_positivos: analise.sinais_positivos || [],
        sinais_negativos: analise.sinais_negativos || []
      };

      this._atualizarHistorico(telefone, resultado);
      console.log('[SENTIMENTO-PRODUTOS] ✓ Temperatura:', temperatura.nivel, `(${temperatura.score})`);

      return resultado;

    } catch (error) {
      console.error('[SENTIMENTO-PRODUTOS] Erro:', error.message);
      return this._analiseFallback(mensagem);
    }
  }

  async _analisarComIA(mensagem, historico) {
    const conversaContexto = historico.slice(-5).map(h => `${h.role}: ${h.msg}`).join('\n');

    const prompt = `Analise o sentimento e interesse do cliente nesta conversa de venda de produtos automotivos (distribuidora).

MENSAGEM ATUAL: "${mensagem}"

CONTEXTO:
${conversaContexto}

Retorne APENAS um JSON válido:
{
  "sentimento": "muito_positivo|positivo|neutro|negativo|frustrado|ansioso",
  "nivel_interesse": "baixo|medio|alto|muito_alto",
  "sinais_positivos": ["lista de sinais de interesse em comprar"],
  "sinais_negativos": ["lista de sinais de desinteresse/objeções"],
  "emocoes_detectadas": ["empolgacao|duvida|pressa|cautela|etc"],
  "tom_recomendado": "entusiasmado|consultivo|calmo|urgente|empatico",
  "esta_comparando": boolean,
  "pronto_para_decisao": boolean,
  "nivel_confianca": "baixo|medio|alto",
  "razao_analise": "breve explicação"
}`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        temperature: 0.3,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      let respostaTexto = response.content[0].text.trim();
      respostaTexto = respostaTexto.replace(/```json\n?/g, '').replace(/```\n?/g, '');

      const jsonMatch = respostaTexto.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Resposta não contém JSON válido');

      return JSON.parse(jsonMatch[0]);

    } catch (error) {
      console.error('[SENTIMENTO-PRODUTOS] ❌ Claude falhou:', error.message);
      throw error;
    }
  }

  _calcularTemperatura(telefone, analise, historico) {
    let score = 50;

    const scoresSentimento = {
      'muito_positivo': 20, 'positivo': 15, 'neutro': 0,
      'negativo': -10, 'frustrado': -20, 'ansioso': 5
    };
    score += scoresSentimento[analise.sentimento] || 0;

    const scoresInteresse = {
      'muito_alto': 25, 'alto': 18, 'medio': 5, 'baixo': -10
    };
    score += scoresInteresse[analise.nivel_interesse] || 0;

    score += Math.min((analise.sinais_positivos?.length || 0) * 3, 15);
    score -= Math.min((analise.sinais_negativos?.length || 0) * 3, 15);

    if (analise.pronto_para_decisao) score += 20;
    if (analise.esta_comparando) score += 5;

    const scoresConfianca = { 'alto': 10, 'medio': 0, 'baixo': -10 };
    score += scoresConfianca[analise.nivel_confianca] || 0;

    if ((historico?.length || 0) >= 10) score += 5;
    if ((historico?.length || 0) >= 20) score += 5;

    score = Math.max(0, Math.min(100, score));

    let nivel;
    if (score < 40) nivel = 'frio';
    else if (score < 70) nivel = 'morno';
    else nivel = 'quente';

    const evolucao = this._calcularEvolucao(telefone, score);

    return { score, nivel, evolucao };
  }

  _calcularEvolucao(telefone, scoreAtual) {
    const historico = this.historicoTemperatura.get(telefone) || [];
    if (historico.length === 0) return 'estavel';

    const scoreAnterior = historico[historico.length - 1].score;
    const diferenca = scoreAtual - scoreAnterior;

    if (diferenca >= 10) return 'aquecendo';
    if (diferenca <= -10) return 'esfriando';
    return 'estavel';
  }

  _atualizarHistorico(telefone, resultado) {
    const historico = this.historicoTemperatura.get(telefone) || [];

    historico.push({
      timestamp: Date.now(),
      score: resultado.score_temperatura,
      nivel: resultado.temperatura_lead,
      sentimento: resultado.sentimento
    });

    if (historico.length > 20) historico.shift();
    this.historicoTemperatura.set(telefone, historico);
  }

  _recomendarAcao(temperatura, analise) {
    const { nivel, score, evolucao } = temperatura;

    if (nivel === 'quente') {
      if (analise.pronto_para_decisao) {
        return {
          acao: 'fechar_pedido',
          mensagem: 'Cliente pronto! Ofereça fechamento do pedido.',
          urgencia: 'alta'
        };
      }
      return {
        acao: 'empurrar_decisao',
        mensagem: 'Cliente muito interessado. Crie senso de urgência (estoque limitado).',
        urgencia: 'alta'
      };
    }

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
        mensagem: 'Cliente interessado. Aprofunde informações sobre produtos.',
        urgencia: 'media'
      };
    }

    if ((analise.sinais_negativos?.length || 0) > 2) {
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

  detectarFrustracao(mensagem) {
    const sinaisFrustracao = [
      /não entend(i|eu)/i, /não respond(e|eu)/i, /já perguntei/i,
      /de novo|novamente/i, /cans(ei|ado)/i, /complicado/i, /demora/i
    ];
    return sinaisFrustracao.some(regex => regex.test(mensagem));
  }

  detectarUrgencia(mensagem) {
    const sinaisUrgencia = [
      /preciso (hoje|agora|urgente)/i, /rápido|rapido/i,
      /quanto antes/i, /essa semana/i, /pressa/i, /logo/i
    ];
    const nivel = sinaisUrgencia.filter(regex => regex.test(mensagem)).length;

    if (nivel >= 2) return 'alta';
    if (nivel === 1) return 'media';
    return 'baixa';
  }

  _analiseFallback(mensagem) {
    const msgLower = mensagem.toLowerCase();
    const positivas = ['gostei', 'interessante', 'perfeito', 'ótimo', 'legal', 'bom', 'sim', 'quero'];
    const negativas = ['caro', 'não', 'nao', 'ruim', 'depois'];

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

  gerarRelatorio(telefone) {
    const historico = this.historicoTemperatura.get(telefone) || [];

    if (historico.length === 0) {
      return { status: 'sem_dados', mensagem: 'Não há histórico suficiente' };
    }

    const scoreAtual = historico[historico.length - 1].score;
    const scoreInicial = historico[0].score;
    const variacao = scoreAtual - scoreInicial;

    return {
      status: 'ok',
      score_atual: scoreAtual,
      score_inicial: scoreInicial,
      variacao: variacao,
      variacao_percentual: ((variacao / scoreInicial) * 100).toFixed(1),
      pico_temperatura: Math.max(...historico.map(h => h.score)),
      vale_temperatura: Math.min(...historico.map(h => h.score)),
      total_interacoes: historico.length,
      tendencia: variacao > 10 ? 'aquecendo' : variacao < -10 ? 'esfriando' : 'estavel'
    };
  }
}

export default AnalisadorSentimentoProdutos;

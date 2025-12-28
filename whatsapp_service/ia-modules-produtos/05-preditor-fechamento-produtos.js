/**
 * 🎯 MÓDULO 5: PREDITOR DE FECHAMENTO - PRODUTOS (ATACADO/VAREJO)
 *
 * Calcula probabilidade de venda (0-100%)
 * Identifica momento ideal para fechar pedido
 * Adaptado para distribuidoras/lojas de produtos
 */

import Anthropic from '@anthropic-ai/sdk';

export class PreditorFechamentoProdutos {
  constructor(anthropicKey, botConfig = {}) {
    this.anthropic = new Anthropic({ apiKey: anthropicKey });
    this.botConfig = botConfig;
    this.historicoPredicoes = new Map();
  }

  atualizarConfig(botConfig) {
    this.botConfig = botConfig;
  }

  async prever(telefone, dadosCompletos) {
    console.log('[PREDITOR-PRODUTOS] Calculando probabilidade de fechamento...');

    try {
      const { historico, temperatura, perfil, sentimento, produtosVistos } = dadosCompletos;

      const scoreBase = this._calcularScoreBase(temperatura, sentimento, historico, produtosVistos, perfil);
      const analiseIA = await this._analisarComIA(dadosCompletos);

      const scoreFinal = Math.round((scoreBase * 0.7) + (analiseIA.score * 0.3));

      const predicao = {
        telefone,
        timestamp: Date.now(),
        probabilidade_fechamento: scoreFinal,
        classificacao: this._classificarProbabilidade(scoreFinal),
        fatores_positivos: this._identificarFatoresPositivos(dadosCompletos),
        fatores_negativos: this._identificarFatoresNegativos(dadosCompletos),
        momento_ideal_fechar: scoreFinal >= 75,
        acoes_recomendadas: this._gerarAcoesRecomendadas(scoreFinal, dadosCompletos),
        previsao_fechamento: this._preverTempoFechamento(scoreFinal, temperatura),
        nivel_risco_perda: this._calcularRiscoPerda(dadosCompletos),
        proxima_acao_critica: this._definirProximaAcao(scoreFinal, dadosCompletos)
      };

      this._salvarHistorico(telefone, predicao);
      console.log('[PREDITOR-PRODUTOS] ✓ Probabilidade:', `${scoreFinal}%`, predicao.classificacao);

      return predicao;

    } catch (error) {
      console.error('[PREDITOR-PRODUTOS] Erro:', error.message);
      return this._predicaoPadrao();
    }
  }

  _calcularScoreBase(temperatura, sentimento, historico, produtosVistos, perfil) {
    let score = 0;

    // TEMPERATURA DO LEAD (40 pontos)
    if (temperatura?.score_temperatura) {
      score += (temperatura.score_temperatura * 0.4);
    } else {
      score += 20;
    }

    // SENTIMENTO (20 pontos)
    const scoresSentimento = {
      'muito_positivo': 20, 'positivo': 15, 'neutro': 10, 'negativo': 5, 'frustrado': 0
    };
    score += scoresSentimento[sentimento?.sentimento] || 10;

    // ENGAJAMENTO (15 pontos)
    const totalMensagens = historico?.length || 0;
    if (totalMensagens >= 30) score += 15;
    else if (totalMensagens >= 20) score += 12;
    else if (totalMensagens >= 10) score += 8;
    else if (totalMensagens >= 5) score += 5;

    // PRODUTOS VISTOS (10 pontos)
    const produtosVistosCount = produtosVistos || 0;
    if (produtosVistosCount >= 5) score += 10;
    else if (produtosVistosCount >= 3) score += 7;
    else if (produtosVistosCount >= 1) score += 4;

    // PREFERÊNCIAS DEFINIDAS (10 pontos)
    if (perfil?.preferencias) {
      let countDefinidos = 0;
      if (perfil.preferencias.categoria_principal) countDefinidos++;
      if (perfil.preferencias.marca_preferida) countDefinidos++;
      if (perfil.preferencias.aplicacao) countDefinidos++;
      score += (countDefinidos / 3) * 10;
    }

    // VOLUME DE COMPRA (5 pontos)
    if (perfil?.volume_compra === 'grande') score += 5;
    else if (perfil?.volume_compra === 'medio') score += 3;

    // ===== ANÁLISE CONTEXTUAL DE SINAIS DE COMPRA (NOVO - até 25 pontos bônus) =====
    const sinaisCompra = this._detectarSinaisCompraContextual(historico);
    score += sinaisCompra.bonus;

    if (sinaisCompra.sinaisDetectados.length > 0) {
      console.log('[PREDITOR-PRODUTOS] 🎯 Sinais de compra detectados:', sinaisCompra.sinaisDetectados.join(', '));
    }

    return Math.min(100, Math.round(score));
  }

  /**
   * Detecta sinais contextuais de que o cliente está pronto para comprar
   * Análise mais inteligente baseada no conteúdo das mensagens
   */
  _detectarSinaisCompraContextual(historico) {
    const sinaisDetectados = [];
    let bonus = 0;

    if (!historico || historico.length === 0) {
      return { sinaisDetectados, bonus };
    }

    // Analisar últimas 5 mensagens do cliente
    const mensagensCliente = historico
      .filter(h => h.role === 'Cliente' || h.role === 'user')
      .slice(-5)
      .map(h => h.msg.toLowerCase());

    const textoCompleto = mensagensCliente.join(' ');

    // SINAL 1: Mencionou quantidade específica (+8 pontos)
    if (/\b(quero|preciso de|vou levar|me da|me dá)\s*\d+/i.test(textoCompleto) ||
        /\b\d+\s*(lata|galao|galão|litro|unidade|caixa|pacote|rolo)/i.test(textoCompleto)) {
      sinaisDetectados.push('quantidade_especifica');
      bonus += 8;
    }

    // SINAL 2: Perguntou sobre pagamento (+10 pontos)
    if (/\b(pix|cartao|cartão|dinheiro|boleto|parcel|a vista|à vista|como pago|forma de pagamento)/i.test(textoCompleto)) {
      sinaisDetectados.push('perguntou_pagamento');
      bonus += 10;
    }

    // SINAL 3: Perguntou sobre entrega/retirada (+8 pontos)
    if (/\b(entrega|entreg|buscar|retirar|frete|delivery|leva|enviar?)/i.test(textoCompleto)) {
      sinaisDetectados.push('perguntou_entrega');
      bonus += 8;
    }

    // SINAL 4: Confirmou escolha (+10 pontos)
    if (/\b(pode ser|fechado|fechar|vou levar|quero esse|esse mesmo|confirmo|confirma|combinado|beleza|ok pode)/i.test(textoCompleto)) {
      sinaisDetectados.push('confirmou_escolha');
      bonus += 10;
    }

    // SINAL 5: Definiu cor/modelo/tamanho (+5 pontos)
    if (/\b(branco|preto|cinza|bege|azul|verde|vermelho|18\s*l|3\.6\s*l|galao|galão|lata)/i.test(textoCompleto)) {
      sinaisDetectados.push('definiu_especificacao');
      bonus += 5;
    }

    // SINAL 6: Pediu reserva/separar (+12 pontos - muito forte)
    if (/\b(separa|reserva|guarda|segura)\s*(pra mim|isso)?/i.test(textoCompleto)) {
      sinaisDetectados.push('pediu_reserva');
      bonus += 12;
    }

    // SINAL 7: Mencionou urgência (+5 pontos)
    if (/\b(urgente|hoje|agora|rapido|rápido|preciso logo|pra ja|pra já)/i.test(textoCompleto)) {
      sinaisDetectados.push('urgencia');
      bonus += 5;
    }

    // SINAL NEGATIVO: Indecisão (-5 pontos)
    if (/\b(vou pensar|depois|mais tarde|nao sei|não sei|talvez|deixa|outro dia)/i.test(textoCompleto)) {
      sinaisDetectados.push('indeciso');
      bonus -= 5;
    }

    return { sinaisDetectados, bonus: Math.max(0, bonus) };
  }

  async _analisarComIA(dadosCompletos) {
    try {
      const resumo = this._prepararResumoParaIA(dadosCompletos);

      const prompt = `Analise esta conversa de vendas de PRODUTOS AUTOMOTIVOS e preveja a probabilidade de fechamento.

${resumo}

Retorne APENAS um JSON válido:
{
  "score": number (0-100),
  "justificativa": "string",
  "sinais_compra_forte": ["lista"],
  "sinais_preocupantes": ["lista"],
  "recomendacao": "string"
}`;

      const response = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        temperature: 0.2,
        messages: [{ role: 'user', content: prompt }]
      });

      let respostaTexto = response.content[0].text.trim();
      respostaTexto = respostaTexto.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const jsonMatch = respostaTexto.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('JSON inválido');

      return JSON.parse(jsonMatch[0]);

    } catch (error) {
      console.log('[PREDITOR-PRODUTOS] IA falhou, usando score base');
      return { score: 50, justificativa: 'Análise baseada em métricas', sinais_compra_forte: [], sinais_preocupantes: [] };
    }
  }

  _prepararResumoParaIA(dados) {
    let resumo = `ANÁLISE DE PROBABILIDADE DE FECHAMENTO (PRODUTOS):\n\n`;

    resumo += `TEMPERATURA DO LEAD: ${dados.temperatura?.temperatura_lead || 'desconhecido'}\n`;
    resumo += `SCORE TEMPERATURA: ${dados.temperatura?.score_temperatura || 0}/100\n\n`;

    resumo += `SENTIMENTO: ${dados.sentimento?.sentimento || 'neutro'}\n`;
    resumo += `NÍVEL DE INTERESSE: ${dados.sentimento?.nivel_interesse || 'medio'}\n\n`;

    resumo += `TOTAL DE MENSAGENS: ${dados.historico?.length || 0}\n`;
    resumo += `PRODUTOS VISTOS: ${dados.produtosVistos || 0}\n\n`;

    if (dados.perfil?.preferencias) {
      resumo += `PREFERÊNCIAS:\n`;
      resumo += `- Categoria: ${dados.perfil.preferencias.categoria_principal || 'indefinida'}\n`;
      resumo += `- Marca: ${dados.perfil.preferencias.marca_preferida || 'indefinida'}\n`;
      resumo += `- Volume: ${dados.perfil.volume_compra || 'pequeno'}\n\n`;
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

  _classificarProbabilidade(score) {
    if (score >= 80) return 'MUITO_ALTA';
    if (score >= 60) return 'ALTA';
    if (score >= 40) return 'MEDIA';
    if (score >= 20) return 'BAIXA';
    return 'MUITO_BAIXA';
  }

  _identificarFatoresPositivos(dados) {
    const fatores = [];

    if (dados.temperatura?.temperatura_lead === 'quente') fatores.push('Lead muito aquecido');
    if (dados.sentimento?.sentimento === 'muito_positivo' || dados.sentimento?.sentimento === 'positivo') {
      fatores.push('Sentimento positivo');
    }
    if (dados.sentimento?.pronto_para_decisao) fatores.push('Cliente pronto para decisão');
    if ((dados.historico?.length || 0) >= 20) fatores.push('Alto engajamento na conversa');
    if (dados.perfil?.preferencias?.marca_preferida) fatores.push('Marca definida');
    if (dados.produtosVistos >= 3) fatores.push('Viu múltiplos produtos');
    if (dados.temperatura?.evolucao === 'aquecendo') fatores.push('Interesse crescente');
    if (dados.perfil?.volume_compra === 'grande') fatores.push('Interesse em volume');

    return fatores;
  }

  _identificarFatoresNegativos(dados) {
    const fatores = [];

    if (dados.temperatura?.temperatura_lead === 'frio') fatores.push('Lead frio');
    if (dados.sentimento?.sentimento === 'frustrado' || dados.sentimento?.sentimento === 'negativo') {
      fatores.push('Sentimento negativo');
    }
    if ((dados.sentimento?.sinais_negativos?.length || 0) > 2) fatores.push('Múltiplas objeções');
    if ((dados.historico?.length || 0) < 5) fatores.push('Baixo engajamento');
    if (!dados.perfil?.preferencias?.categoria_principal) fatores.push('Necessidade indefinida');
    if (dados.temperatura?.evolucao === 'esfriando') fatores.push('Interesse decrescente');
    if (dados.sentimento?.esta_comparando) fatores.push('Está comparando concorrentes');

    return fatores;
  }

  _gerarAcoesRecomendadas(score, dados) {
    const acoes = [];

    if (score >= 80) {
      acoes.push({ prioridade: 'URGENTE', acao: 'Fechar pedido agora', razao: 'Probabilidade muito alta' });
      acoes.push({ prioridade: 'URGENTE', acao: 'Criar urgência (estoque limitado)', razao: 'Evitar que esfrie' });
      acoes.push({ prioridade: 'ALTA', acao: 'Oferecer condições especiais para fechar', razao: 'Facilitar decisão' });
    } else if (score >= 60) {
      acoes.push({ prioridade: 'ALTA', acao: 'Apresentar mais detalhes dos produtos', razao: 'Tornar compra tangível' });
      acoes.push({ prioridade: 'ALTA', acao: 'Enviar fotos/especificações', razao: 'Aumentar confiança' });
      acoes.push({ prioridade: 'MEDIA', acao: 'Sugerir kit/combo', razao: 'Aumentar ticket' });
    } else if (score >= 40) {
      acoes.push({ prioridade: 'MEDIA', acao: 'Responder objeções identificadas', razao: 'Remover barreiras' });
      acoes.push({ prioridade: 'MEDIA', acao: 'Apresentar benefícios específicos', razao: 'Aumentar valor percebido' });
      acoes.push({ prioridade: 'BAIXA', acao: 'Oferecer amostras/demonstração', razao: 'Construir confiança' });
    } else {
      acoes.push({ prioridade: 'ALTA', acao: 'Identificar necessidades reais', razao: 'Entender resistências' });
      acoes.push({ prioridade: 'MEDIA', acao: 'Oferecer produtos alternativos', razao: 'Ampliar opções' });
      acoes.push({ prioridade: 'BAIXA', acao: 'Manter contato periódico', razao: 'Não perder oportunidade futura' });
    }

    return acoes;
  }

  _preverTempoFechamento(score, temperatura) {
    if (score >= 80) return 'Hoje ou amanhã';
    if (score >= 60) return '2-3 dias';
    if (score >= 40) return '1 semana';
    return '2+ semanas';
  }

  _calcularRiscoPerda(dados) {
    let risco = 'BAIXO';

    if (dados.temperatura?.evolucao === 'esfriando') risco = 'MEDIO';
    if (dados.sentimento?.sentimento === 'frustrado') risco = 'ALTO';
    if (dados.sentimento?.esta_comparando) risco = 'MEDIO';

    const ultimaMensagem = dados.historico?.[dados.historico.length - 1];
    if (ultimaMensagem) {
      const textoLower = ultimaMensagem.msg.toLowerCase();
      if (/vou pensar|depois|mais tarde|não sei/i.test(textoLower)) risco = 'ALTO';
    }

    return risco;
  }

  _definirProximaAcao(score, dados) {
    if (score >= 75) {
      return { acao: 'FECHAR_PEDIDO', descricao: 'Oferecer fechamento', prazo: 'IMEDIATO' };
    }
    if (score >= 60) {
      return { acao: 'APRESENTAR_CONDICOES', descricao: 'Apresentar preços e condições', prazo: '24 HORAS' };
    }
    if (score >= 40) {
      return { acao: 'RESPONDER_OBJECOES', descricao: 'Endereçar dúvidas', prazo: '48 HORAS' };
    }
    return { acao: 'MANTER_CONTATO', descricao: 'Nutrir relacionamento', prazo: '3-7 DIAS' };
  }

  _salvarHistorico(telefone, predicao) {
    const historico = this.historicoPredicoes.get(telefone) || [];
    historico.push({
      timestamp: predicao.timestamp,
      probabilidade: predicao.probabilidade_fechamento,
      classificacao: predicao.classificacao
    });
    if (historico.length > 10) historico.shift();
    this.historicoPredicoes.set(telefone, historico);
  }

  analisarEvolucao(telefone) {
    const historico = this.historicoPredicoes.get(telefone);
    if (!historico || historico.length < 2) {
      return { disponivel: false, mensagem: 'Dados insuficientes' };
    }

    const primeira = historico[0];
    const ultima = historico[historico.length - 1];
    const variacao = ultima.probabilidade - primeira.probabilidade;

    return {
      disponivel: true,
      probabilidade_inicial: primeira.probabilidade,
      probabilidade_atual: ultima.probabilidade,
      variacao: variacao,
      tendencia: variacao > 10 ? 'MELHORANDO' : variacao < -10 ? 'PIORANDO' : 'ESTAVEL',
      total_predicoes: historico.length
    };
  }

  _predicaoPadrao() {
    return {
      probabilidade_fechamento: 50,
      classificacao: 'MEDIA',
      fatores_positivos: [],
      fatores_negativos: [],
      momento_ideal_fechar: false,
      acoes_recomendadas: [{ prioridade: 'MEDIA', acao: 'Continuar conversa', razao: 'Dados insuficientes' }],
      previsao_fechamento: '1 semana',
      nivel_risco_perda: 'MEDIO',
      proxima_acao_critica: { acao: 'DESCOBRIR_NECESSIDADES', descricao: 'Entender melhor o cliente', prazo: '48 HORAS' }
    };
  }
}

export default PreditorFechamentoProdutos;

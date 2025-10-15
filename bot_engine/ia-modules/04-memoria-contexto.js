/**
 * 🎯 MÓDULO 4: SISTEMA DE MEMÓRIA E CONTEXTO INTELIGENTE
 * ✅ ATUALIZADO: Usa Claude API em vez de OpenAI
 *
 * Salva preferências do cliente no banco
 * Lembra conversas anteriores
 * Cria resumo automático do que foi discutido
 */

import Anthropic from '@anthropic-ai/sdk';

export class MemoriaContexto {
  constructor(anthropicKey, db) {
    this.anthropic = new Anthropic({ apiKey: anthropicKey });
    this.db = db;
    this.cacheMemoria = new Map(); // Cache em memória RAM
  }

  /**
   * Salva contexto da conversa no banco
   * @param {string} telefone - Telefone do cliente
   * @param {Object} dados - Dados a serem salvos
   */
  async salvarContexto(telefone, dados) {
    console.log('[MEMORIA] Salvando contexto...');

    try {
      const contextoExistente = await this.buscarContexto(telefone);

      if (contextoExistente) {
        // Atualizar contexto existente
        await this.db.execute(
          `UPDATE clientes_contexto
           SET dados_json = ?,
               ultima_atualizacao = NOW(),
               total_interacoes = total_interacoes + 1
           WHERE telefone = ?`,
          [JSON.stringify(dados), telefone]
        );
      } else {
        // Criar novo contexto
        await this.db.execute(
          `INSERT INTO clientes_contexto
           (telefone, dados_json, total_interacoes, primeira_interacao, ultima_atualizacao)
           VALUES (?, ?, 1, NOW(), NOW())`,
          [telefone, JSON.stringify(dados)]
        );
      }

      // Atualizar cache
      this.cacheMemoria.set(telefone, {
        dados,
        timestamp: Date.now()
      });

      console.log('[MEMORIA] ✓ Contexto salvo');

    } catch (error) {
      console.error('[MEMORIA] Erro ao salvar:', error.message);
    }
  }

  /**
   * Busca contexto do cliente
   * @param {string} telefone
   * @returns {Object|null} Contexto salvo
   */
  async buscarContexto(telefone) {
    // Verificar cache primeiro
    const cache = this.cacheMemoria.get(telefone);
    if (cache && (Date.now() - cache.timestamp) < 600000) {
      console.log('[MEMORIA] ✓ Cache hit');
      return cache.dados;
    }

    try {
      const [rows] = await this.db.execute(
        'SELECT dados_json FROM clientes_contexto WHERE telefone = ?',
        [telefone]
      );

      if (rows.length > 0) {
        const dados = JSON.parse(rows[0].dados_json);

        // Atualizar cache
        this.cacheMemoria.set(telefone, {
          dados,
          timestamp: Date.now()
        });

        return dados;
      }

      return null;

    } catch (error) {
      console.error('[MEMORIA] Erro ao buscar:', error.message);
      return null;
    }
  }

  /**
   * Gera resumo inteligente da conversa
   * @param {Array} historico - Histórico completo
   * @returns {Object} Resumo estruturado
   */
  async gerarResumo(historico) {
    console.log('[MEMORIA] Gerando resumo da conversa...');

    if (historico.length < 5) {
      return {
        resumo_curto: 'Conversa inicial',
        pontos_principais: [],
        veiculos_discutidos: [],
        proximos_passos: 'Descobrir necessidades'
      };
    }

    try {
      const conversaCompleta = historico
        .map(h => `${h.role}: ${h.msg}`)
        .join('\n');

      const prompt = `Resuma esta conversa de venda de carros de forma estruturada.

CONVERSA:
${conversaCompleta}

Retorne APENAS um JSON válido:
{
  "resumo_curto": "1-2 frases resumindo toda a conversa",
  "pontos_principais": ["lista dos 3-5 pontos mais importantes discutidos"],
  "veiculos_discutidos": [
    {
      "modelo": "nome do carro",
      "interesse": "alto|medio|baixo",
      "objecoes": ["lista de objeções mencionadas"]
    }
  ],
  "preferencias_identificadas": {
    "orcamento": "string ou null",
    "tipo_veiculo": "string ou null",
    "prioridades": ["lista"]
  },
  "objecoes_principais": ["lista"],
  "proximos_passos": "string (o que fazer na próxima interação)",
  "fase_venda": "descoberta|apresentacao|negociacao|fechamento"
}`;

      const systemPrompt = 'Você é especialista em resumir conversas de vendas. Seja conciso e objetivo. Retorne APENAS JSON.';

      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 700,
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
      const resumo = JSON.parse(jsonMatch[0]);
      console.log('[MEMORIA] ✓ Resumo gerado:', resumo.fase_venda);

      return resumo;

    } catch (error) {
      console.error('[MEMORIA] Erro ao gerar resumo:', error.message);

      // Fallback: resumo básico
      return {
        resumo_curto: `Conversa com ${historico.length} mensagens`,
        pontos_principais: ['Cliente demonstrou interesse'],
        veiculos_discutidos: [],
        preferencias_identificadas: {},
        objecoes_principais: [],
        proximos_passos: 'Continuar conversa',
        fase_venda: 'descoberta'
      };
    }
  }

  /**
   * Extrai informações importantes da conversa
   * @param {Array} historico
   * @returns {Object} Informações extraídas
   */
  async extrairInformacoes(historico) {
    console.log('[MEMORIA] Extraindo informações...');

    const info = {
      marcas_mencionadas: new Set(),
      modelos_mencionados: new Set(),
      orcamento_mencionado: null,
      ano_preferido: null,
      tem_carro_troca: false,
      dados_troca: null,
      urgencia_compra: 'media',
      forma_pagamento_preferida: null
    };

    // Analisar mensagens do cliente
    const mensagensCliente = historico
      .filter(h => h.role === 'Cliente')
      .map(h => h.msg.toLowerCase());

    const textoCompleto = mensagensCliente.join(' ');

    // Detectar marcas
    const marcasComuns = [
      'honda', 'toyota', 'chevrolet', 'ford', 'volkswagen', 'fiat',
      'jeep', 'hyundai', 'nissan', 'renault', 'peugeot', 'citroen'
    ];

    marcasComuns.forEach(marca => {
      if (textoCompleto.includes(marca)) {
        info.marcas_mencionadas.add(marca);
      }
    });

    // Detectar orçamento
    const matchOrcamento = textoCompleto.match(/(\d+)\s*(mil|k)/i);
    if (matchOrcamento) {
      info.orcamento_mencionado = parseInt(matchOrcamento[1]) * 1000;
    }

    // Detectar ano
    const matchAno = textoCompleto.match(/20\d{2}/);
    if (matchAno) {
      info.ano_preferido = parseInt(matchAno[0]);
    }

    // Detectar troca
    const sinaisTroca = [
      /tenho (um|uma|meu|minha)/i,
      /dar de entrada/i,
      /trocar/i,
      /aceita.*troca/i
    ];

    info.tem_carro_troca = sinaisTroca.some(regex => regex.test(textoCompleto));

    // Detectar urgência
    const sinaisUrgencia = ['urgente', 'hoje', 'agora', 'rápido', 'logo', 'essa semana'];
    const countUrgencia = sinaisUrgencia.filter(s => textoCompleto.includes(s)).length;

    if (countUrgencia >= 2) info.urgencia_compra = 'alta';
    else if (countUrgencia === 1) info.urgencia_compra = 'media';
    else info.urgencia_compra = 'baixa';

    // Detectar forma de pagamento
    if (textoCompleto.includes('financ') || textoCompleto.includes('parcela')) {
      info.forma_pagamento_preferida = 'financiamento';
    } else if (textoCompleto.includes('vista') || textoCompleto.includes('dinheiro')) {
      info.forma_pagamento_preferida = 'avista';
    }

    return {
      marcas_mencionadas: Array.from(info.marcas_mencionadas),
      modelos_mencionados: Array.from(info.modelos_mencionados),
      orcamento_mencionado: info.orcamento_mencionado,
      ano_preferido: info.ano_preferido,
      tem_carro_troca: info.tem_carro_troca,
      urgencia_compra: info.urgencia_compra,
      forma_pagamento_preferida: info.forma_pagamento_preferida
    };
  }

  /**
   * Atualiza contexto completo do cliente
   * @param {string} telefone
   * @param {Array} historico
   * @param {Object} dadosAdicionais
   */
  async atualizarContextoCompleto(telefone, historico, dadosAdicionais = {}) {
    console.log('[MEMORIA] Atualizando contexto completo...');

    const resumo = await this.gerarResumo(historico);
    const informacoes = await this.extrairInformacoes(historico);

    const contextoCompleto = {
      telefone,
      ultima_atualizacao: new Date().toISOString(),
      resumo_conversa: resumo,
      informacoes_extraidas: informacoes,
      total_mensagens: historico.length,
      ultima_mensagem: historico[historico.length - 1]?.msg || '',
      dados_adicionais: dadosAdicionais
    };

    await this.salvarContexto(telefone, contextoCompleto);

    console.log('[MEMORIA] ✓ Contexto completo atualizado');

    return contextoCompleto;
  }

  /**
   * Busca clientes similares (para cross-sell/upsell)
   * @param {Object} perfil - Perfil do cliente atual
   * @returns {Array} Clientes similares
   */
  async buscarClientesSimilares(perfil) {
    try {
      const [rows] = await this.db.execute(`
        SELECT telefone, dados_json
        FROM clientes_contexto
        WHERE telefone != ?
        ORDER BY ultima_atualizacao DESC
        LIMIT 50
      `, [perfil.telefone]);

      const similares = [];

      rows.forEach(row => {
        try {
          const dados = JSON.parse(row.dados_json);
          const score = this._calcularSimilaridade(perfil, dados);

          if (score > 60) {
            similares.push({
              telefone: row.telefone,
              score_similaridade: score,
              dados
            });
          }
        } catch (e) {
          // Ignorar registros com JSON inválido
        }
      });

      return similares
        .sort((a, b) => b.score_similaridade - a.score_similaridade)
        .slice(0, 5);

    } catch (error) {
      console.error('[MEMORIA] Erro ao buscar similares:', error.message);
      return [];
    }
  }

  /**
   * Calcula similaridade entre dois perfis (0-100)
   */
  _calcularSimilaridade(perfil1, perfil2) {
    let score = 0;

    // Comparar marcas mencionadas
    const marcas1 = perfil1.informacoes_extraidas?.marcas_mencionadas || [];
    const marcas2 = perfil2.informacoes_extraidas?.marcas_mencionadas || [];

    const marcasComuns = marcas1.filter(m => marcas2.includes(m));
    if (marcasComuns.length > 0) score += 30;

    // Comparar orçamento
    const orc1 = perfil1.informacoes_extraidas?.orcamento_mencionado;
    const orc2 = perfil2.informacoes_extraidas?.orcamento_mencionado;

    if (orc1 && orc2) {
      const diff = Math.abs(orc1 - orc2);
      const percentDiff = diff / Math.max(orc1, orc2);

      if (percentDiff < 0.2) score += 20; // Menos de 20% diferença
      else if (percentDiff < 0.4) score += 10;
    }

    // Comparar fase da venda
    if (perfil1.resumo_conversa?.fase_venda === perfil2.resumo_conversa?.fase_venda) {
      score += 15;
    }

    // Comparar urgência
    if (perfil1.informacoes_extraidas?.urgencia_compra === perfil2.informacoes_extraidas?.urgencia_compra) {
      score += 10;
    }

    return score;
  }

  /**
   * Gera insights baseados no histórico de conversas
   */
  async gerarInsights(telefone) {
    const contexto = await this.buscarContexto(telefone);

    if (!contexto) {
      return {
        disponivel: false,
        mensagem: 'Sem dados suficientes'
      };
    }

    const insights = [];

    // Insight 1: Preferências claras
    if (contexto.informacoes_extraidas?.marcas_mencionadas?.length > 0) {
      insights.push({
        tipo: 'preferencia',
        mensagem: `Cliente tem preferência por: ${contexto.informacoes_extraidas.marcas_mencionadas.join(', ')}`
      });
    }

    // Insight 2: Orçamento definido
    if (contexto.informacoes_extraidas?.orcamento_mencionado) {
      insights.push({
        tipo: 'orcamento',
        mensagem: `Orçamento estimado: R$ ${contexto.informacoes_extraidas.orcamento_mencionado.toLocaleString('pt-BR')}`
      });
    }

    // Insight 3: Tem carro de troca
    if (contexto.informacoes_extraidas?.tem_carro_troca) {
      insights.push({
        tipo: 'troca',
        mensagem: 'Cliente tem interesse em dar veículo como entrada'
      });
    }

    // Insight 4: Urgência
    if (contexto.informacoes_extraidas?.urgencia_compra === 'alta') {
      insights.push({
        tipo: 'urgencia',
        mensagem: 'Cliente tem urgência na compra (oportunidade de fechamento rápido)'
      });
    }

    // Insight 5: Fase da venda
    if (contexto.resumo_conversa?.fase_venda) {
      insights.push({
        tipo: 'fase',
        mensagem: `Fase atual: ${contexto.resumo_conversa.fase_venda}`
      });
    }

    return {
      disponivel: true,
      total_insights: insights.length,
      insights,
      contexto_completo: contexto
    };
  }

  /**
   * Limpa cache em memória
   */
  limparCache() {
    this.cacheMemoria.clear();
    console.log('[MEMORIA] Cache limpo');
  }
}

export default MemoriaContexto;

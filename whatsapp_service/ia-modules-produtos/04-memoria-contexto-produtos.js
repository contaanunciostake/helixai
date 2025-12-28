/**
 * 🎯 MÓDULO 4: MEMÓRIA E CONTEXTO - PRODUTOS (ATACADO/VAREJO)
 *
 * Salva preferências do cliente
 * Lembra conversas anteriores
 * Adaptado para distribuidoras/lojas de produtos
 */

import Anthropic from '@anthropic-ai/sdk';

export class MemoriaContextoProdutos {
  constructor(anthropicKey, db, botConfig = {}) {
    this.anthropic = new Anthropic({ apiKey: anthropicKey });
    this.db = db;
    this.botConfig = botConfig;
    this.cacheMemoria = new Map();
  }

  /**
   * Atualizar configurações do bot
   */
  atualizarConfig(botConfig) {
    this.botConfig = botConfig;
  }

  async salvarContexto(telefone, dados) {
    console.log('[MEMORIA-PRODUTOS] Salvando contexto...');

    try {
      const empresaId = this.botConfig?.empresa_id || 1;
      const dadosJson = JSON.stringify(dados);

      // Usar MySQL com REPLACE INTO (funciona similar ao INSERT OR REPLACE do SQLite)
      const query = `
        REPLACE INTO clientes_contexto_produtos
        (telefone, empresa_id, dados_json, total_interacoes, primeira_interacao, ultima_atualizacao)
        VALUES (?, ?, ?,
          COALESCE((SELECT t.total_interacoes FROM (SELECT total_interacoes FROM clientes_contexto_produtos WHERE telefone = ? AND empresa_id = ?) t), 0) + 1,
          COALESCE((SELECT t.primeira_interacao FROM (SELECT primeira_interacao FROM clientes_contexto_produtos WHERE telefone = ? AND empresa_id = ?) t), NOW()),
          NOW()
        )
      `;

      await this.db.query(query, [telefone, empresaId, dadosJson, telefone, empresaId, telefone, empresaId]);
      this.cacheMemoria.set(telefone, { dados, timestamp: Date.now() });
      console.log('[MEMORIA-PRODUTOS] ✓ Contexto salvo');

    } catch (error) {
      console.error('[MEMORIA-PRODUTOS] Erro ao salvar:', error.message);
      // Fallback: usar cache apenas
      this.cacheMemoria.set(telefone, { dados, timestamp: Date.now() });
    }
  }

  async buscarContexto(telefone) {
    const cache = this.cacheMemoria.get(telefone);
    if (cache && (Date.now() - cache.timestamp) < 600000) {
      console.log('[MEMORIA-PRODUTOS] ✓ Cache hit');
      return cache.dados;
    }

    try {
      const empresaId = this.botConfig?.empresa_id || 1;
      const query = 'SELECT dados_json FROM clientes_contexto_produtos WHERE telefone = ? AND empresa_id = ?';

      const [rows] = await this.db.query(query, [telefone, empresaId]);
      const row = rows?.[0];

      if (!row) {
        return null;
      }

      try {
        const dados = JSON.parse(row.dados_json);
        this.cacheMemoria.set(telefone, { dados, timestamp: Date.now() });
        return dados;
      } catch (e) {
        return null;
      }

    } catch (error) {
      console.error('[MEMORIA-PRODUTOS] Erro ao buscar:', error.message);
      return null;
    }
  }

  async gerarResumo(historico) {
    console.log('[MEMORIA-PRODUTOS] Gerando resumo da conversa...');

    if (historico.length < 5) {
      return {
        resumo_curto: 'Conversa inicial',
        pontos_principais: [],
        produtos_discutidos: [],
        proximos_passos: 'Descobrir necessidades'
      };
    }

    try {
      const conversaCompleta = historico.map(h => `${h.role}: ${h.msg}`).join('\n');

      const prompt = `Resuma esta conversa de venda de produtos automotivos de forma estruturada.

CONVERSA:
${conversaCompleta}

Retorne APENAS um JSON válido:
{
  "resumo_curto": "1-2 frases resumindo",
  "pontos_principais": ["lista dos 3-5 pontos importantes"],
  "produtos_discutidos": [
    {
      "produto": "nome do produto",
      "interesse": "alto|medio|baixo",
      "objecoes": ["lista de objeções"]
    }
  ],
  "preferencias_identificadas": {
    "categoria": "string ou null",
    "marca": "string ou null",
    "aplicacao": "string ou null",
    "prioridades": ["lista"]
  },
  "objecoes_principais": ["lista"],
  "proximos_passos": "string",
  "fase_venda": "descoberta|apresentacao|negociacao|fechamento"
}`;

      const response = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 700,
        temperature: 0.3,
        messages: [{ role: 'user', content: prompt }]
      });

      let respostaTexto = response.content[0].text.trim();
      respostaTexto = respostaTexto.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const jsonMatch = respostaTexto.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('JSON inválido');

      const resumo = JSON.parse(jsonMatch[0]);
      console.log('[MEMORIA-PRODUTOS] ✓ Resumo gerado:', resumo.fase_venda);

      return resumo;

    } catch (error) {
      console.error('[MEMORIA-PRODUTOS] Erro ao gerar resumo:', error.message);
      return {
        resumo_curto: `Conversa com ${historico.length} mensagens`,
        pontos_principais: ['Cliente demonstrou interesse'],
        produtos_discutidos: [],
        preferencias_identificadas: {},
        objecoes_principais: [],
        proximos_passos: 'Continuar conversa',
        fase_venda: 'descoberta'
      };
    }
  }

  async extrairInformacoes(historico) {
    console.log('[MEMORIA-PRODUTOS] Extraindo informações...');

    const info = {
      categorias_mencionadas: new Set(),
      marcas_mencionadas: new Set(),
      produtos_mencionados: new Set(),
      aplicacao_interesse: null,
      urgencia_compra: 'media',
      volume_compra: 'pequeno'
    };

    const mensagensCliente = historico
      .filter(h => h.role === 'Cliente')
      .map(h => h.msg.toLowerCase());

    const textoCompleto = mensagensCliente.join(' ');

    // Detectar categorias
    const categorias = ['lubrificante', 'oleo', 'filtro', 'aditivo', 'limpeza', 'camara', 'peca'];
    categorias.forEach(cat => {
      if (textoCompleto.includes(cat)) info.categorias_mencionadas.add(cat);
    });

    // Detectar marcas
    const marcas = ['ipiranga', 'texaco', 'mann', 'tecfil', 'militec', 'fleetguard', 'donaldson', 'tecbril', 'levorin'];
    marcas.forEach(marca => {
      if (textoCompleto.includes(marca)) info.marcas_mencionadas.add(marca);
    });

    // Detectar aplicação
    if (/caminhao|caminhão|pesado|diesel/i.test(textoCompleto)) {
      info.aplicacao_interesse = 'Caminhão';
    } else if (/moto|motocicleta/i.test(textoCompleto)) {
      info.aplicacao_interesse = 'Moto';
    } else if (/maquina|trator|agricola/i.test(textoCompleto)) {
      info.aplicacao_interesse = 'Máquinas Pesadas';
    } else if (/carro|suv|sedan|hatch/i.test(textoCompleto)) {
      info.aplicacao_interesse = 'Carro e SUV';
    }

    // Detectar urgência
    const sinaisUrgencia = ['urgente', 'hoje', 'agora', 'rápido', 'logo', 'essa semana'];
    const countUrgencia = sinaisUrgencia.filter(s => textoCompleto.includes(s)).length;
    if (countUrgencia >= 2) info.urgencia_compra = 'alta';
    else if (countUrgencia === 1) info.urgencia_compra = 'media';

    // Detectar volume
    if (/atacado|quantidade|lote|caixa|dezena/i.test(textoCompleto)) {
      info.volume_compra = 'grande';
    } else if (/algumas|poucas|umas/i.test(textoCompleto)) {
      info.volume_compra = 'pequeno';
    }

    return {
      categorias_mencionadas: Array.from(info.categorias_mencionadas),
      marcas_mencionadas: Array.from(info.marcas_mencionadas),
      produtos_mencionados: Array.from(info.produtos_mencionados),
      aplicacao_interesse: info.aplicacao_interesse,
      urgencia_compra: info.urgencia_compra,
      volume_compra: info.volume_compra
    };
  }

  async atualizarContextoCompleto(telefone, historico, dadosAdicionais = {}) {
    console.log('[MEMORIA-PRODUTOS] Atualizando contexto completo...');

    const resumo = await this.gerarResumo(historico);
    const informacoes = await this.extrairInformacoes(historico);

    const contextoCompleto = {
      telefone,
      empresa_id: this.botConfig?.empresa_id || 1,
      ultima_atualizacao: new Date().toISOString(),
      resumo_conversa: resumo,
      informacoes_extraidas: informacoes,
      total_mensagens: historico.length,
      ultima_mensagem: historico[historico.length - 1]?.msg || '',
      dados_adicionais: dadosAdicionais
    };

    await this.salvarContexto(telefone, contextoCompleto);

    console.log('[MEMORIA-PRODUTOS] ✓ Contexto completo atualizado');

    return contextoCompleto;
  }

  async gerarInsights(telefone) {
    const contexto = await this.buscarContexto(telefone);

    if (!contexto) {
      return { disponivel: false, mensagem: 'Sem dados suficientes' };
    }

    const insights = [];

    if (contexto.informacoes_extraidas?.marcas_mencionadas?.length > 0) {
      insights.push({
        tipo: 'preferencia_marca',
        mensagem: `Cliente tem preferência por: ${contexto.informacoes_extraidas.marcas_mencionadas.join(', ')}`
      });
    }

    if (contexto.informacoes_extraidas?.categorias_mencionadas?.length > 0) {
      insights.push({
        tipo: 'categorias',
        mensagem: `Interesse em: ${contexto.informacoes_extraidas.categorias_mencionadas.join(', ')}`
      });
    }

    if (contexto.informacoes_extraidas?.aplicacao_interesse) {
      insights.push({
        tipo: 'aplicacao',
        mensagem: `Aplicação: ${contexto.informacoes_extraidas.aplicacao_interesse}`
      });
    }

    if (contexto.informacoes_extraidas?.urgencia_compra === 'alta') {
      insights.push({
        tipo: 'urgencia',
        mensagem: 'Cliente tem urgência na compra (oportunidade de fechamento rápido)'
      });
    }

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

  limparCache() {
    this.cacheMemoria.clear();
    console.log('[MEMORIA-PRODUTOS] Cache limpo');
  }
}

export default MemoriaContextoProdutos;

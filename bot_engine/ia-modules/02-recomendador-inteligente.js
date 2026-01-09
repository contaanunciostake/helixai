/**
 * 🎯 MÓDULO 2: MOTOR DE RECOMENDAÇÕES PERSONALIZADAS
 *
 * Cria perfil do cliente e recomenda veículos usando IA
 * Usa embeddings para similaridade semântica
 *
 * ✅ ATUALIZADO: Usa Claude API em vez de OpenAI
 */

import Anthropic from '@anthropic-ai/sdk';

export class RecomendadorInteligente {
  constructor(anthropicKey) {
    this.anthropic = new Anthropic({ apiKey: anthropicKey });

    if (!this.anthropic) {
      console.warn('⚠️ [RECOMENDADOR] Anthropic não configurado');
    }

    this.perfisClientes = new Map(); // Cache de perfis
  }

  /**
   * Cria perfil do cliente baseado na conversa
   * @param {string} telefone - Telefone do cliente
   * @param {Array} historico - Histórico da conversa
   * @returns {Object} Perfil do cliente
   */
  async criarPerfil(telefone, historico) {
    console.log('[RECOMENDADOR] Criando perfil do cliente...');

    try {
      const analise = await this._analisarComportamento(historico);

      const perfil = {
        telefone,
        data_criacao: Date.now(),
        preferencias: analise.preferencias,
        orcamento_estimado: analise.orcamento,
        prioridades: analise.prioridades, // ex: ["economia", "conforto", "potencia"]
        tipo_comprador: analise.tipo, // ex: "pratico", "emocional", "pesquisador"
        restricoes: analise.restricoes, // ex: ["sem_cambio_manual", "max_100mil_km"]
        historico_mentions: analise.mencoes // marcas/modelos mencionados
      };

      this.perfisClientes.set(telefone, perfil);
      console.log('[RECOMENDADOR] ✓ Perfil criado:', perfil.tipo_comprador);

      return perfil;

    } catch (error) {
      console.error('[RECOMENDADOR] Erro ao criar perfil:', error.message);
      return this._perfilPadrao(telefone);
    }
  }

  /**
   * Analisa comportamento do cliente com IA
   */
  async _analisarComportamento(historico) {
    const conversaCompleta = historico
      .slice(-10)
      .map(h => `${h.role}: ${h.msg}`)
      .join('\n');

    const prompt = `Analise esta conversa de venda de carros e crie um perfil do cliente.

CONVERSA:
${conversaCompleta}

Retorne APENAS um JSON válido:
{
  "preferencias": {
    "marca": "string ou null",
    "tipo_veiculo": "suv|sedan|hatch|pickup ou null",
    "ano_minimo": number ou null,
    "cambio": "automatico|manual|indiferente"
  },
  "orcamento": {
    "minimo": number ou null,
    "maximo": number ou null,
    "confortavel": number ou null
  },
  "prioridades": ["lista de 3 prioridades: economia, conforto, status, potencia, espaco, tecnologia"],
  "tipo": "pratico|emocional|pesquisador|indeciso",
  "restricoes": ["lista de restrições mencionadas"],
  "mencoes": ["marcas/modelos que o cliente mencionou"]
}`;

    try {
      // ✅ Usar Claude API
      const systemPrompt = 'Você é um psicólogo de vendas especializado em criar perfis de clientes. Retorne APENAS JSON válido (sem markdown, sem texto extra).';

      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 600,
        temperature: 0.4,
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
      console.error('[RECOMENDADOR] ❌ Claude falhou:', error.message);
      throw error; // Vai usar o perfil padrão no catch do criarPerfil
    }
  }

  /**
   * Recomenda veículos baseado no perfil do cliente
   * @param {Object} perfil - Perfil do cliente
   * @param {Array} veiculos - Lista de veículos disponíveis
   * @param {number} limite - Máximo de recomendações
   * @returns {Array} Veículos recomendados com score
   */
  async recomendar(perfil, veiculos, limite = 3) {
    console.log('[RECOMENDADOR] Gerando recomendações personalizadas...');

    try {
      // Filtrar veículos que atendem requisitos básicos
      let candidatos = this._filtrarPorPerfil(veiculos, perfil);

      if (candidatos.length === 0) {
        console.log('[RECOMENDADOR] ⚠️ Nenhum veículo atende perfil, relaxando filtros...');
        candidatos = veiculos;
      }

      // Calcular score de relevância para cada veículo
      const veiculosComScore = await Promise.all(
        candidatos.slice(0, 20).map(async veiculo => {
          const score = await this._calcularScore(veiculo, perfil);
          return { ...veiculo, score_relevancia: score };
        })
      );

      // Ordenar por score e retornar top N
      const recomendacoes = veiculosComScore
        .sort((a, b) => b.score_relevancia - a.score_relevancia)
        .slice(0, limite);

      console.log('[RECOMENDADOR] ✓ Top 3 scores:', recomendacoes.map(v => v.score_relevancia));

      return recomendacoes;

    } catch (error) {
      console.error('[RECOMENDADOR] Erro ao recomendar:', error.message);
      return veiculos.slice(0, limite); // Fallback: primeiros N veículos
    }
  }

  /**
   * Filtra veículos que atendem perfil básico
   */
  _filtrarPorPerfil(veiculos, perfil) {
    return veiculos.filter(v => {
      const pref = perfil.preferencias;

      // Filtro por marca
      if (pref.marca && v.marca) {
        if (!v.marca.toLowerCase().includes(pref.marca.toLowerCase())) {
          return false;
        }
      }

      // Filtro por orçamento
      if (perfil.orcamento.maximo && v.preco > perfil.orcamento.maximo) {
        return false;
      }

      if (perfil.orcamento.minimo && v.preco < perfil.orcamento.minimo) {
        return false;
      }

      // Filtro por ano
      if (pref.ano_minimo && parseInt(v.ano) < pref.ano_minimo) {
        return false;
      }

      // Filtro por câmbio
      if (pref.cambio === 'automatico' && !v.cambio.toLowerCase().includes('auto')) {
        return false;
      }

      return true;
    });
  }

  /**
   * Calcula score de relevância (0-100) de um veículo para o perfil
   */
  async _calcularScore(veiculo, perfil) {
    let score = 50; // Base

    // +20 pontos: Marca/modelo mencionado
    if (perfil.historico_mentions) {
      const mentions = perfil.historico_mentions.map(m => m.toLowerCase());
      const nomeVeiculo = `${veiculo.marca} ${veiculo.modelo} ${veiculo.nome}`.toLowerCase();

      if (mentions.some(m => nomeVeiculo.includes(m))) {
        score += 20;
      }
    }

    // +15 pontos: Dentro do orçamento confortável
    if (perfil.orcamento.confortavel) {
      const diff = Math.abs(veiculo.preco - perfil.orcamento.confortavel);
      const percentDiff = diff / perfil.orcamento.confortavel;

      if (percentDiff < 0.1) score += 15; // Até 10% de diferença
      else if (percentDiff < 0.2) score += 10; // Até 20%
      else if (percentDiff < 0.3) score += 5; // Até 30%
    }

    // +10 pontos: Tipo de veículo preferido
    if (perfil.preferencias.tipo_veiculo) {
      const tipoVeiculo = (veiculo.tipo_carroceria || '').toLowerCase();
      if (tipoVeiculo.includes(perfil.preferencias.tipo_veiculo)) {
        score += 10;
      }
    }

    // +10 pontos: Câmbio preferido
    if (perfil.preferencias.cambio === 'automatico') {
      if (veiculo.cambio.toLowerCase().includes('auto')) {
        score += 10;
      }
    }

    // +15 pontos: Alinhado com prioridades (economia, conforto, etc)
    score += this._calcularAlinhamentoPrioridades(veiculo, perfil.prioridades);

    // +10 pontos: Veículo em destaque ou oferta
    if (veiculo.is_featured === '1') score += 5;
    if (veiculo.is_special_offer === 1) score += 5;

    // -5 a -15 pontos: Restrições
    score -= this._aplicarPenalidades(veiculo, perfil.restricoes);

    // Garantir que está entre 0-100
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calcula alinhamento com prioridades do cliente
   */
  _calcularAlinhamentoPrioridades(veiculo, prioridades) {
    let pontos = 0;

    prioridades.forEach(prioridade => {
      switch (prioridade.toLowerCase()) {
        case 'economia':
          // Carros mais baratos e com menos KM
          if (veiculo.preco < 80000) pontos += 3;
          if (parseInt(veiculo.km) < 50000) pontos += 2;
          break;

        case 'conforto':
          // Câmbio automático, ano mais novo
          if (veiculo.cambio.toLowerCase().includes('auto')) pontos += 3;
          if (parseInt(veiculo.ano) >= 2020) pontos += 2;
          break;

        case 'status':
          // Marcas premium, ano novo
          const marcasPremium = ['bmw', 'audi', 'mercedes', 'volvo', 'lexus', 'land rover'];
          if (marcasPremium.some(m => veiculo.marca.toLowerCase().includes(m))) {
            pontos += 5;
          }
          break;

        case 'espaco':
          // SUVs, pickups, minivans
          const tiposEspacosos = ['suv', 'pickup', 'minivan', 'sw'];
          if (tiposEspacosos.some(t => (veiculo.tipo_carroceria || '').toLowerCase().includes(t))) {
            pontos += 3;
          }
          break;

        case 'potencia':
          // Motores maiores (inferir do nome do modelo)
          if (/2\.0|turbo|sport|gt|gti/i.test(veiculo.nome)) {
            pontos += 3;
          }
          break;
      }
    });

    return pontos;
  }

  /**
   * Aplica penalidades por restrições
   */
  _aplicarPenalidades(veiculo, restricoes) {
    let penalidade = 0;

    restricoes.forEach(restricao => {
      if (restricao.includes('sem_cambio_manual')) {
        if (veiculo.cambio.toLowerCase().includes('manual')) {
          penalidade += 15; // Grande penalidade
        }
      }

      if (restricao.includes('max_100mil_km')) {
        if (parseInt(veiculo.km) > 100000) {
          penalidade += 10;
        }
      }

      if (restricao.includes('ano_minimo_2018')) {
        if (parseInt(veiculo.ano) < 2018) {
          penalidade += 10;
        }
      }
    });

    return penalidade;
  }

  /**
   * Gera explicação do por quê da recomendação
   */
  async gerarExplicacao(veiculo, perfil) {
    const razoes = [];

    // Analisar por que esse veículo foi recomendado
    if (perfil.preferencias.marca && veiculo.marca.toLowerCase().includes(perfil.preferencias.marca)) {
      razoes.push(`É da marca ${veiculo.marca} que você procura`);
    }

    if (perfil.orcamento.confortavel) {
      const diff = Math.abs(veiculo.preco - perfil.orcamento.confortavel);
      if (diff < perfil.orcamento.confortavel * 0.15) {
        razoes.push('Está dentro do seu orçamento');
      }
    }

    if (perfil.prioridades.includes('economia')) {
      if (parseInt(veiculo.km) < 60000) {
        razoes.push('Baixa quilometragem, ótimo para economia');
      }
    }

    if (perfil.prioridades.includes('conforto') && veiculo.cambio.toLowerCase().includes('auto')) {
      razoes.push('Câmbio automático para seu conforto');
    }

    if (veiculo.is_special_offer === 1) {
      razoes.push('Está em oferta especial');
    }

    return razoes.length > 0
      ? `Recomendei porque: ${razoes.join(', ')}`
      : 'Atende suas necessidades';
  }

  /**
   * Perfil padrão quando não há dados suficientes
   */
  _perfilPadrao(telefone) {
    return {
      telefone,
      data_criacao: Date.now(),
      preferencias: {
        marca: null,
        tipo_veiculo: null,
        ano_minimo: 2015,
        cambio: 'indiferente'
      },
      orcamento: {
        minimo: 30000,
        maximo: 150000,
        confortavel: 80000
      },
      prioridades: ['economia', 'conforto'],
      tipo_comprador: 'pratico',
      restricoes: [],
      historico_mentions: []
    };
  }

  /**
   * Atualiza perfil do cliente com novas informações
   */
  atualizarPerfil(telefone, novasInfo) {
    const perfil = this.perfisClientes.get(telefone) || this._perfilPadrao(telefone);

    // Mesclar novas informações
    if (novasInfo.preferencias) {
      perfil.preferencias = { ...perfil.preferencias, ...novasInfo.preferencias };
    }

    if (novasInfo.orcamento) {
      perfil.orcamento = { ...perfil.orcamento, ...novasInfo.orcamento };
    }

    if (novasInfo.prioridades) {
      perfil.prioridades = [...new Set([...perfil.prioridades, ...novasInfo.prioridades])];
    }

    this.perfisClientes.set(telefone, perfil);
    console.log('[RECOMENDADOR] ✓ Perfil atualizado');

    return perfil;
  }

  /**
   * Obtém perfil do cliente (cria se não existir)
   */
  async obterPerfil(telefone, historico = []) {
    if (this.perfisClientes.has(telefone)) {
      return this.perfisClientes.get(telefone);
    }

    return await this.criarPerfil(telefone, historico);
  }
}

export default RecomendadorInteligente;

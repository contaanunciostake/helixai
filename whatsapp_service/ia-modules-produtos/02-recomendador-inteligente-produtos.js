/**
 * 🎯 MÓDULO 2: RECOMENDADOR INTELIGENTE - PRODUTOS (ATACADO/VAREJO)
 *
 * Cria perfil do cliente e recomenda produtos usando IA
 * Adaptado para distribuidoras e lojas de produtos
 */

import Anthropic from '@anthropic-ai/sdk';

export class RecomendadorInteligenteProdutos {
  constructor(anthropicKey) {
    this.anthropic = new Anthropic({ apiKey: anthropicKey });
    this.perfisClientes = new Map();
  }

  async criarPerfil(telefone, historico) {
    console.log('[RECOMENDADOR-PRODUTOS] Criando perfil do cliente...');

    try {
      const analise = await this._analisarComportamento(historico);

      const perfil = {
        telefone,
        data_criacao: Date.now(),
        preferencias: analise.preferencias,
        tipo_comprador: analise.tipo,
        prioridades: analise.prioridades,
        aplicacoes_interesse: analise.aplicacoes,
        marcas_preferidas: analise.marcas,
        volume_compra: analise.volume,
        historico_categorias: analise.categorias
      };

      this.perfisClientes.set(telefone, perfil);
      console.log('[RECOMENDADOR-PRODUTOS] ✓ Perfil criado:', perfil.tipo_comprador);

      return perfil;

    } catch (error) {
      console.error('[RECOMENDADOR-PRODUTOS] Erro ao criar perfil:', error.message);
      return this._perfilPadrao(telefone);
    }
  }

  async _analisarComportamento(historico) {
    const conversaCompleta = historico.slice(-10).map(h => `${h.role}: ${h.msg}`).join('\n');

    const prompt = `Analise esta conversa de venda de produtos automotivos e crie um perfil do cliente.

CONVERSA:
${conversaCompleta}

TIPOS DE PRODUTOS: Lubrificantes, Filtros, Aditivos, Limpeza Automotiva, Câmaras de Ar

Retorne APENAS um JSON válido:
{
  "preferencias": {
    "categoria_principal": "string ou null",
    "marca_preferida": "string ou null",
    "aplicacao": "Carro e SUV|Moto|Caminhão|Máquinas Pesadas|null",
    "qualidade": "original|paralelo|indiferente"
  },
  "prioridades": ["lista de 3 prioridades: preco, qualidade, disponibilidade, marca, prazo_entrega"],
  "tipo": "atacadista|varejista|mecanico|consumidor_final|frota",
  "aplicacoes": ["lista de aplicações mencionadas"],
  "marcas": ["marcas que o cliente mencionou/prefere"],
  "volume": "pequeno|medio|grande",
  "categorias": ["categorias de interesse"]
}`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 600,
        temperature: 0.4,
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
      console.error('[RECOMENDADOR-PRODUTOS] ❌ Claude falhou:', error.message);
      throw error;
    }
  }

  async recomendar(perfil, produtos, limite = 5) {
    console.log('[RECOMENDADOR-PRODUTOS] Gerando recomendações...');

    try {
      let candidatos = this._filtrarPorPerfil(produtos, perfil);

      if (candidatos.length === 0) {
        console.log('[RECOMENDADOR-PRODUTOS] ⚠️ Nenhum produto atende perfil, relaxando filtros...');
        candidatos = produtos;
      }

      const produtosComScore = candidatos.slice(0, 20).map(produto => {
        const score = this._calcularScore(produto, perfil);
        return { ...produto, score_relevancia: score };
      });

      const recomendacoes = produtosComScore
        .sort((a, b) => b.score_relevancia - a.score_relevancia)
        .slice(0, limite);

      console.log('[RECOMENDADOR-PRODUTOS] ✓ Top scores:', recomendacoes.map(p => p.score_relevancia));

      return recomendacoes;

    } catch (error) {
      console.error('[RECOMENDADOR-PRODUTOS] Erro ao recomendar:', error.message);
      return produtos.slice(0, limite);
    }
  }

  _filtrarPorPerfil(produtos, perfil) {
    return produtos.filter(p => {
      const pref = perfil.preferencias;

      if (pref.categoria_principal && p.categoria) {
        if (!p.categoria.toLowerCase().includes(pref.categoria_principal.toLowerCase())) {
          return false;
        }
      }

      if (pref.marca_preferida && p.marca) {
        if (!p.marca.toLowerCase().includes(pref.marca_preferida.toLowerCase())) {
          return false;
        }
      }

      if (pref.aplicacao && p.aplicacao) {
        if (!p.aplicacao.toLowerCase().includes(pref.aplicacao.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }

  _calcularScore(produto, perfil) {
    let score = 50;

    // Marca mencionada/preferida
    if (perfil.marcas_preferidas && perfil.marcas_preferidas.length > 0) {
      const marcaProduto = (produto.marca || '').toLowerCase();
      if (perfil.marcas_preferidas.some(m => marcaProduto.includes(m.toLowerCase()))) {
        score += 20;
      }
    }

    // Categoria de interesse
    if (perfil.historico_categorias && perfil.historico_categorias.length > 0) {
      const categoriaProduto = (produto.categoria || '').toLowerCase();
      if (perfil.historico_categorias.some(c => categoriaProduto.includes(c.toLowerCase()))) {
        score += 15;
      }
    }

    // Aplicação
    if (perfil.aplicacoes_interesse && perfil.aplicacoes_interesse.length > 0) {
      const aplicacaoProduto = (produto.aplicacao || '').toLowerCase();
      if (perfil.aplicacoes_interesse.some(a => aplicacaoProduto.includes(a.toLowerCase()))) {
        score += 10;
      }
    }

    // Prioridade preço
    if (perfil.prioridades && perfil.prioridades.includes('preco')) {
      if (produto.preco_promocional && produto.preco_promocional < produto.preco) {
        score += 10;
      }
    }

    // Disponibilidade
    if (perfil.prioridades && perfil.prioridades.includes('disponibilidade')) {
      if (produto.estoque > 0) {
        score += 10;
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  async gerarExplicacao(produto, perfil) {
    const razoes = [];

    if (perfil.marcas_preferidas?.includes(produto.marca)) {
      razoes.push(`É da marca ${produto.marca} que você procura`);
    }

    if (produto.estoque > 10) {
      razoes.push('Pronta entrega com bom estoque');
    }

    if (produto.preco_promocional) {
      razoes.push('Está em promoção');
    }

    return razoes.length > 0
      ? `Recomendei porque: ${razoes.join(', ')}`
      : 'Atende suas necessidades';
  }

  _perfilPadrao(telefone) {
    return {
      telefone,
      data_criacao: Date.now(),
      preferencias: {
        categoria_principal: null,
        marca_preferida: null,
        aplicacao: null,
        qualidade: 'indiferente'
      },
      prioridades: ['preco', 'disponibilidade'],
      tipo_comprador: 'consumidor_final',
      aplicacoes_interesse: [],
      marcas_preferidas: [],
      volume_compra: 'pequeno',
      historico_categorias: []
    };
  }

  atualizarPerfil(telefone, novasInfo) {
    const perfil = this.perfisClientes.get(telefone) || this._perfilPadrao(telefone);

    if (novasInfo.preferencias) {
      perfil.preferencias = { ...perfil.preferencias, ...novasInfo.preferencias };
    }

    if (novasInfo.prioridades) {
      perfil.prioridades = [...new Set([...perfil.prioridades, ...novasInfo.prioridades])];
    }

    if (novasInfo.marcas) {
      perfil.marcas_preferidas = [...new Set([...perfil.marcas_preferidas, ...novasInfo.marcas])];
    }

    this.perfisClientes.set(telefone, perfil);
    console.log('[RECOMENDADOR-PRODUTOS] ✓ Perfil atualizado');

    return perfil;
  }

  async obterPerfil(telefone, historico = []) {
    if (this.perfisClientes.has(telefone)) {
      return this.perfisClientes.get(telefone);
    }
    return await this.criarPerfil(telefone, historico);
  }
}

export default RecomendadorInteligenteProdutos;

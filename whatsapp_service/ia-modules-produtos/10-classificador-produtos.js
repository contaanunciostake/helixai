/**
 * 📦 MÓDULO 10: CLASSIFICADOR INTELIGENTE DE PRODUTOS
 *
 * Usa IA para classificar produtos por categoria, aplicação, etc.
 * Filtra produtos corretamente SEM regras fixas
 *
 * OBJETIVO: Encontrar produtos corretos para cada cliente
 */

import Anthropic from '@anthropic-ai/sdk';

export class ClassificadorProdutos {
  constructor(anthropicKey, botConfig = {}) {
    this.anthropic = new Anthropic({ apiKey: anthropicKey });
    this.botConfig = botConfig;
    this.cache = new Map();
  }

  atualizarConfig(botConfig) {
    this.botConfig = botConfig;
  }

  /**
   * Filtra produtos por categoria usando IA
   */
  async filtrarPorCategoria(produtos, categoriaDesejada) {
    if (!categoriaDesejada || produtos.length === 0) {
      return produtos;
    }

    console.log(`[CLASSIFICADOR-PRODUTOS] Filtrando ${produtos.length} produtos por categoria: ${categoriaDesejada}`);

    try {
      const nomes = produtos.map(p => p.nome || p.titulo);
      const classificacoes = await this._classificarLotePorCategoria(nomes, categoriaDesejada);

      const produtosFiltrados = produtos.filter((produto, index) => {
        return classificacoes[index] === true;
      });

      console.log(`[CLASSIFICADOR-PRODUTOS] ✓ Filtrados: ${produtosFiltrados.length}/${produtos.length} correspondem a "${categoriaDesejada}"`);

      return produtosFiltrados;

    } catch (error) {
      console.error('[CLASSIFICADOR-PRODUTOS] Erro ao filtrar por categoria:', error.message);
      return produtos;
    }
  }

  /**
   * Filtra produtos por aplicação (veículo)
   */
  async filtrarPorAplicacao(produtos, aplicacaoDesejada) {
    if (!aplicacaoDesejada || produtos.length === 0) {
      return produtos;
    }

    console.log(`[CLASSIFICADOR-PRODUTOS] Filtrando ${produtos.length} produtos por aplicação: ${aplicacaoDesejada}`);

    try {
      const nomes = produtos.map(p => `${p.nome || p.titulo} - ${p.aplicacao || 'geral'}`);
      const classificacoes = await this._classificarLotePorAplicacao(nomes, aplicacaoDesejada);

      const produtosFiltrados = produtos.filter((produto, index) => {
        return classificacoes[index] === true;
      });

      console.log(`[CLASSIFICADOR-PRODUTOS] ✓ Filtrados: ${produtosFiltrados.length}/${produtos.length} correspondem a "${aplicacaoDesejada}"`);

      return produtosFiltrados;

    } catch (error) {
      console.error('[CLASSIFICADOR-PRODUTOS] Erro ao filtrar por aplicação:', error.message);
      return produtos;
    }
  }

  /**
   * Classifica lote de produtos por categoria
   */
  async _classificarLotePorCategoria(nomes, categoriaDesejada) {
    const cacheKey = `cat_${categoriaDesejada}_${nomes.join('|').substring(0, 100)}`;

    if (this.cache.has(cacheKey)) {
      console.log('[CLASSIFICADOR-PRODUTOS] ✓ Cache hit');
      return this.cache.get(cacheKey);
    }

    const prompt = `Você é um especialista em classificação de PRODUTOS AUTOMOTIVOS. Analise esta lista de produtos e identifique quais correspondem à categoria solicitada.

CATEGORIA SOLICITADA: ${categoriaDesejada}

PRODUTOS PARA CLASSIFICAR:
${nomes.map((n, i) => `${i + 1}. ${n}`).join('\n')}

REGRAS DE CLASSIFICAÇÃO DE CATEGORIAS:
- "lubrificante" ou "óleo": Óleos de motor, fluidos, graxas, coolants
- "filtro": Filtros de óleo, ar, combustível, cabine, hidráulico
- "aditivo": Condicionadores de metais, aditivos de combustível, radiador
- "limpeza": Produtos de limpeza automotiva (shampoo, cera, limpa vidros)
- "câmara" ou "camara": Câmaras de ar para pneus
- "peça" ou "peca": Peças automotivas em geral

TAREFA:
Para cada produto, responda "SIM" ou "NÃO" indicando se corresponde à categoria "${categoriaDesejada}".

FORMATO DE RESPOSTA (JSON):
{
  "classificacoes": [true, false, true, ...],
  "justificativas": ["Óleo 5W30 é lubrificante", "Filtro não é lubrificante", ...]
}

Retorne APENAS o JSON, sem explicações adicionais.`;

    const response = await this.anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2000,
      temperature: 0.2,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    let respostaTexto = response.content[0].text.trim();
    respostaTexto = respostaTexto.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    const jsonMatch = respostaTexto.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Resposta não contém JSON válido');
    }

    const resultado = JSON.parse(jsonMatch[0]);
    const classificacoes = resultado.classificacoes;

    // Mostrar classificações no console
    console.log('[CLASSIFICADOR-PRODUTOS] Resultado da classificação por categoria:');
    nomes.forEach((nome, i) => {
      const match = classificacoes[i] ? '✅' : '❌';
      console.log(`  ${match} ${i + 1}. ${nome}`);
    });

    this.cache.set(cacheKey, classificacoes);
    return classificacoes;
  }

  /**
   * Classifica lote de produtos por aplicação (veículo)
   */
  async _classificarLotePorAplicacao(nomes, aplicacaoDesejada) {
    const cacheKey = `app_${aplicacaoDesejada}_${nomes.join('|').substring(0, 100)}`;

    if (this.cache.has(cacheKey)) {
      console.log('[CLASSIFICADOR-PRODUTOS] ✓ Cache hit');
      return this.cache.get(cacheKey);
    }

    const prompt = `Você é um especialista em classificação de PRODUTOS AUTOMOTIVOS. Analise esta lista de produtos e identifique quais são compatíveis com a aplicação/veículo solicitado.

APLICAÇÃO/VEÍCULO SOLICITADO: ${aplicacaoDesejada}

PRODUTOS PARA CLASSIFICAR:
${nomes.map((n, i) => `${i + 1}. ${n}`).join('\n')}

REGRAS DE APLICAÇÃO:
- "Carro" ou "SUV" ou "Leve": Produtos para veículos de passeio (óleos 5W30, 5W40, filtros linha leve)
- "Moto" ou "Motocicleta": Produtos específicos para motos (óleos 4T, câmaras de moto)
- "Caminhão" ou "Pesado" ou "Diesel": Produtos para caminhões/ônibus (óleos 15W40, filtros linha pesada)
- "Máquinas" ou "Agrícola" ou "Industrial": Produtos para tratores, máquinas (filtros industriais, graxas)
- "Geral" ou "Universal": Produtos que servem para qualquer aplicação

TAREFA:
Para cada produto, responda "SIM" ou "NÃO" indicando se é compatível com "${aplicacaoDesejada}".

FORMATO DE RESPOSTA (JSON):
{
  "classificacoes": [true, false, true, ...],
  "justificativas": ["Óleo 5W30 é para carros leves", "Filtro pesado não é para carros", ...]
}

Retorne APENAS o JSON, sem explicações adicionais.`;

    const response = await this.anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2000,
      temperature: 0.2,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    let respostaTexto = response.content[0].text.trim();
    respostaTexto = respostaTexto.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    const jsonMatch = respostaTexto.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Resposta não contém JSON válido');
    }

    const resultado = JSON.parse(jsonMatch[0]);
    const classificacoes = resultado.classificacoes;

    console.log('[CLASSIFICADOR-PRODUTOS] Resultado da classificação por aplicação:');
    nomes.forEach((nome, i) => {
      const match = classificacoes[i] ? '✅' : '❌';
      console.log(`  ${match} ${i + 1}. ${nome}`);
    });

    this.cache.set(cacheKey, classificacoes);
    return classificacoes;
  }

  /**
   * Identifica categoria de um único produto
   */
  async identificarCategoria(nomeProduto) {
    const prompt = `Identifique a categoria deste produto automotivo:

PRODUTO: ${nomeProduto}

CATEGORIAS POSSÍVEIS:
- lubrificante (óleos, fluidos, graxas, coolants)
- filtro (ar, óleo, combustível, cabine, hidráulico)
- aditivo (condicionadores, aditivos combustível)
- limpeza (shampoo, cera, limpa vidros)
- camara (câmaras de ar)
- peca (peças em geral)

Responda APENAS com a categoria, em minúsculas, sem explicações.`;

    const response = await this.anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 50,
      temperature: 0.1,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    return response.content[0].text.trim().toLowerCase();
  }

  /**
   * Identifica aplicação de um único produto
   */
  async identificarAplicacao(nomeProduto) {
    const prompt = `Identifique a aplicação/veículo deste produto automotivo:

PRODUTO: ${nomeProduto}

APLICAÇÕES POSSÍVEIS:
- carro_suv (veículos de passeio)
- moto (motocicletas)
- caminhao (caminhões, ônibus, diesel)
- maquinas (tratores, máquinas agrícolas/industriais)
- universal (serve para qualquer veículo)

Responda APENAS com a aplicação, em minúsculas, sem explicações.`;

    const response = await this.anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 50,
      temperature: 0.1,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    return response.content[0].text.trim().toLowerCase();
  }

  /**
   * Busca produtos compatíveis com uma descrição em linguagem natural
   */
  async buscarPorDescricao(produtos, descricao) {
    if (produtos.length === 0 || !descricao) {
      return produtos;
    }

    console.log(`[CLASSIFICADOR-PRODUTOS] Buscando produtos para: "${descricao}"`);

    try {
      const nomesProdutos = produtos.map(p => ({
        index: produtos.indexOf(p),
        nome: p.nome || p.titulo,
        categoria: p.categoria || '',
        marca: p.marca || '',
        aplicacao: p.aplicacao || ''
      }));

      const prompt = `Você é um vendedor expert em produtos automotivos. O cliente descreveu o que precisa assim:

DESCRIÇÃO DO CLIENTE: "${descricao}"

PRODUTOS DISPONÍVEIS:
${nomesProdutos.map(p => `${p.index}. ${p.nome} | ${p.categoria} | ${p.marca} | ${p.aplicacao}`).join('\n')}

TAREFA:
Identifique quais produtos são RELEVANTES para o que o cliente descreveu.
Considere sinônimos, abreviações e linguagem informal.

FORMATO DE RESPOSTA (JSON):
{
  "indices_relevantes": [0, 3, 7],
  "motivo": "Cliente procura X e esses produtos atendem porque..."
}

Retorne APENAS o JSON.`;

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
      if (!jsonMatch) {
        throw new Error('Resposta não contém JSON válido');
      }

      const resultado = JSON.parse(jsonMatch[0]);
      const produtosRelevantes = resultado.indices_relevantes.map(i => produtos[i]).filter(Boolean);

      console.log(`[CLASSIFICADOR-PRODUTOS] ✓ Encontrados ${produtosRelevantes.length} produtos relevantes`);
      console.log(`[CLASSIFICADOR-PRODUTOS] Motivo: ${resultado.motivo}`);

      return produtosRelevantes;

    } catch (error) {
      console.error('[CLASSIFICADOR-PRODUTOS] Erro na busca por descrição:', error.message);
      return produtos.slice(0, 10); // Fallback: primeiros 10
    }
  }

  /**
   * Limpa cache de classificações
   */
  limparCache() {
    this.cache.clear();
    console.log('[CLASSIFICADOR-PRODUTOS] ✓ Cache limpo');
  }
}

export default ClassificadorProdutos;

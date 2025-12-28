/**
 * 🎯 MÓDULO 1: ANALISADOR DE INTENÇÕES - PRODUTOS (ATACADO/VAREJO)
 *
 * Detecta a real intenção do cliente usando Claude
 * Adaptado para distribuidoras e lojas de produtos (lubrificantes, filtros, etc)
 */

import Anthropic from '@anthropic-ai/sdk';

export class AnalisadorIntencoesProdutos {
  constructor(anthropicKey) {
    this.anthropic = new Anthropic({ apiKey: anthropicKey });
    this.cache = new Map();
  }

  async analisar(mensagem, historico = []) {
    const cacheKey = this._gerarCacheKey(mensagem, historico);
    if (this.cache.has(cacheKey)) {
      console.log('[INTENCAO-PRODUTOS] ✓ Cache hit');
      return this.cache.get(cacheKey);
    }

    try {
      const resultado = await this._analisarComIA(mensagem, historico);
      this.cache.set(cacheKey, resultado);
      setTimeout(() => this.cache.delete(cacheKey), 300000);
      return resultado;
    } catch (error) {
      console.error('[INTENCAO-PRODUTOS] Erro:', error.message);
      return this._fallbackAnalise(mensagem);
    }
  }

  async _analisarComIA(mensagem, historico) {
    const prompt = this._construirPrompt(mensagem, historico);

    try {
      console.log('[INTENCAO-PRODUTOS] Analisando com Claude...');

      const systemPrompt = `Você é um analisador de intenções de clientes de distribuidora/loja de produtos automotivos (lubrificantes, filtros, aditivos, peças).
Analise a mensagem e retorne APENAS um JSON válido (sem markdown, sem \`\`\`json).

INTENÇÕES POSSÍVEIS:
- busca_produto: Cliente procurando produtos específicos
- consulta_preco: Cliente perguntando preço de produto
- consulta_estoque: Cliente perguntando disponibilidade
- interesse: Cliente demonstrou interesse em produto
- duvida_tecnica: Dúvida sobre especificações, aplicação, compatibilidade
- comparacao: Cliente comparando produtos
- pedido: Cliente querendo fazer pedido/compra
- objecao: Cliente apresentou objeção (preço alto, etc)
- off_topic: Assunto não relacionado a produtos
- saudacao: Saudação inicial
- pergunta_sobre_loja: Pergunta sobre a loja (horário, endereço, etc)
- conversa_casual: Conversa casual

CATEGORIAS DE PRODUTOS:
- Lubrificantes (óleos de motor, fluidos, coolants, graxas)
- Filtros (linha leve, pesada, industrial, agrícola)
- Aditivos (condicionadores, combustível, radiador)
- Limpeza Automotiva
- Câmaras de Ar
- Peças em geral

MARCAS COMUNS: Ipiranga, Texaco, Mann, Tecfil, Donaldson, Fleetguard, Militec, Tecbril, Levorin

APLICAÇÕES: Carro e SUV, Moto, Caminhão, Máquinas Pesadas

Formato obrigatório (retorne SOMENTE este JSON):
{
  "intencao_principal": "string",
  "sub_intencao": "descrição específica",
  "entidades": {
    "categoria": "string ou null",
    "subcategoria": "string ou null",
    "marca": "string ou null",
    "produto_especifico": "string ou null",
    "aplicacao": "Carro e SUV|Moto|Caminhão|Máquinas Pesadas ou null",
    "quantidade_mencionada": number ou null
  },
  "sentimento": "positivo|neutro|negativo|frustrado",
  "urgencia": "baixa|media|alta",
  "objecoes": ["lista de objeções identificadas"],
  "contexto_necessario": "o que precisa saber para responder bem",
  "acao_sugerida": "buscar_produtos|informar_preco|verificar_estoque|detalhar_produto|fazer_pedido|transferir_humano"
}`;

      const response = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        temperature: 0.3,
        messages: [{
          role: 'user',
          content: `${systemPrompt}\n\n${prompt}`
        }]
      });

      let respostaTexto = response.content[0].text.trim();
      respostaTexto = respostaTexto.replace(/```json\n?/g, '').replace(/```\n?/g, '');

      const jsonMatch = respostaTexto.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Resposta não contém JSON válido');

      const analise = JSON.parse(jsonMatch[0]);
      console.log('[INTENCAO-PRODUTOS] ✅ Analisado:', analise.intencao_principal);
      return analise;

    } catch (error) {
      console.error('[INTENCAO-PRODUTOS] ❌ Claude falhou:', error.message);
      throw error;
    }
  }

  _construirPrompt(mensagem, historico) {
    let prompt = `MENSAGEM DO CLIENTE: "${mensagem}"\n\n`;
    if (historico.length > 0) {
      prompt += `CONTEXTO (últimas 3 mensagens):\n`;
      historico.slice(-3).forEach(h => {
        prompt += `${h.role}: "${h.msg}"\n`;
      });
    }
    return prompt;
  }

  _gerarCacheKey(mensagem, historico) {
    const msgHash = mensagem.toLowerCase().trim().substring(0, 50);
    const histHash = historico.slice(-2).map(h => h.msg.substring(0, 20)).join('|');
    return `${msgHash}_${histHash}`;
  }

  _fallbackAnalise(mensagem) {
    console.log('[INTENCAO-PRODUTOS] Usando análise fallback');
    const msgLower = mensagem.toLowerCase();

    let intencao = 'conversa_casual';
    if (/procuro|quero|preciso|tem|disponivel|oleo|filtro|aditivo/i.test(msgLower)) {
      intencao = 'busca_produto';
    } else if (/quanto|preco|preço|valor|custo/i.test(msgLower)) {
      intencao = 'consulta_preco';
    } else if (/estoque|disponivel|tem.*em estoque/i.test(msgLower)) {
      intencao = 'consulta_estoque';
    } else if (/caro|barato/i.test(msgLower)) {
      intencao = 'objecao';
    }

    const marcas = ['ipiranga', 'texaco', 'mann', 'tecfil', 'militec', 'fleetguard'];
    const marcaEncontrada = marcas.find(m => msgLower.includes(m));

    return {
      intencao_principal: intencao,
      sub_intencao: 'Análise básica (fallback)',
      entidades: {
        categoria: null,
        subcategoria: null,
        marca: marcaEncontrada || null,
        produto_especifico: null,
        aplicacao: null,
        quantidade_mencionada: null
      },
      sentimento: 'neutro',
      urgencia: 'media',
      objecoes: [],
      contexto_necessario: 'Cliente enviou mensagem',
      acao_sugerida: 'buscar_produtos'
    };
  }

  detectarComparacao(mensagem) {
    const palavrasComparacao = [
      /qual.*melhor/i, /qual.*diferença/i, /compare/i, /comparar/i,
      /versus|vs|x/i, /qual.*vale mais/i, /entre.*e/i
    ];
    return palavrasComparacao.some(regex => regex.test(mensagem));
  }

  async detectarObjecoes(mensagem) {
    const objecoesComuns = {
      preco: /caro|muito caro|preço alto|acima do budget/i,
      estoque: /não tem|falta|sem estoque/i,
      qualidade: /original|paralelo|qualidade|confiável/i,
      comparacao: /vi mais barato|outro lugar|concorrente/i,
      urgencia: /vou pensar|depois|mais tarde/i
    };

    const objecoesEncontradas = [];
    for (const [tipo, regex] of Object.entries(objecoesComuns)) {
      if (regex.test(mensagem)) {
        objecoesEncontradas.push({
          tipo,
          texto: mensagem.match(regex)[0],
          gravidade: tipo === 'preco' ? 'alta' : 'media'
        });
      }
    }
    return objecoesEncontradas;
  }

  limparCache() {
    this.cache.clear();
    console.log('[INTENCAO-PRODUTOS] Cache limpo');
  }
}

export default AnalisadorIntencoesProdutos;

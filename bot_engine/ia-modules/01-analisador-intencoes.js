/**
 * 🎯 MÓDULO 1: ANALISADOR DE INTENÇÕES COM IA
 *
 * Detecta a real intenção do cliente usando Claude
 * Classifica mensagens em categorias e identifica objeções
 *
 * ✅ ATUALIZADO: Usa Claude API em vez de OpenAI
 */

import Anthropic from '@anthropic-ai/sdk';

export class AnalisadorIntencoes {
  constructor(anthropicKey) {
    this.anthropic = new Anthropic({ apiKey: anthropicKey });

    if (!this.anthropic) {
      console.warn('⚠️ [INTENCAO] Anthropic não configurado');
    }

    this.cache = new Map(); // Cache de intenções recentes
  }

  /**
   * Analisa a intenção principal da mensagem do cliente
   * @param {string} mensagem - Mensagem do cliente
   * @param {Array} historico - Histórico da conversa
   * @returns {Object} Análise completa da intenção
   */
  async analisar(mensagem, historico = []) {
    // Verificar cache (evita chamadas duplicadas)
    const cacheKey = this._gerarCacheKey(mensagem, historico);
    if (this.cache.has(cacheKey)) {
      console.log('[INTENCAO] ✓ Cache hit');
      return this.cache.get(cacheKey);
    }

    try {
      const resultado = await this._analisarComIA(mensagem, historico);

      // Salvar no cache (válido por 5 minutos)
      this.cache.set(cacheKey, resultado);
      setTimeout(() => this.cache.delete(cacheKey), 300000);

      return resultado;

    } catch (error) {
      console.error('[INTENCAO] Erro:', error.message);
      return this._fallbackAnalise(mensagem);
    }
  }

  /**
   * Análise com IA usando Claude
   */
  async _analisarComIA(mensagem, historico) {
    const prompt = this._construirPrompt(mensagem, historico);

    try {
      // ✅ Usar Claude API
      console.log('[INTENCAO] Analisando com Claude...');

      const systemPrompt = `Você é um analisador de intenções de clientes de loja de carros.
Analise a mensagem e retorne APENAS um JSON válido (sem markdown, sem \`\`\`json, sem texto extra).

INTENÇÕES POSSÍVEIS:
- busca: Cliente procurando veículos específicos
- interesse: Cliente demonstrou interesse em um veículo
- duvida: Cliente tem dúvidas sobre veículos ou processo
- objecao: Cliente apresentou objeção (preço, condição, etc)
- negociacao: Cliente quer negociar preço/condições
- fechamento: Cliente pronto para comprar
- off_topic: Assunto não relacionado a carros
- pergunta_sobre_negocio: Pergunta sobre a loja (ex: "quantos carros vocês vendem?", "qual horário de funcionamento?")
- pergunta_administrativa: Pergunta sobre processos (ex: "como funciona o financiamento?")
- conversa_casual: Conversa casual não relacionada diretamente à compra

Formato obrigatório (retorne SOMENTE este JSON, nada mais):
{
  "intencao_principal": "busca|interesse|duvida|objecao|negociacao|fechamento|off_topic|pergunta_sobre_negocio|pergunta_administrativa|conversa_casual",
  "sub_intencao": "descrição específica",
  "entidades": {
    "marca": "string ou null",
    "modelo": "string ou null",
    "tipo_veiculo": "suv|sedan|hatch|pickup ou null",
    "preco_mencionado": number ou null,
    "ano_mencionado": number ou null
  },
  "sentimento": "positivo|neutro|negativo|frustrado",
  "urgencia": "baixa|media|alta",
  "objecoes": ["lista de objeções identificadas"],
  "contexto_necessario": "o que o bot precisa saber para responder bem",
  "acao_sugerida": "buscar_carros|detalhar|calcular_financiamento|agendar_test_drive|transferir_humano"
}`;

      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022', // Haiku: mais rápido e barato para análise
        max_tokens: 500,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: `${systemPrompt}\n\n${prompt}`
          }
        ]
      });

      // Extrair JSON da resposta (Claude pode adicionar texto extra)
      let respostaTexto = response.content[0].text.trim();

      // Remover markdown se houver
      respostaTexto = respostaTexto.replace(/```json\n?/g, '').replace(/```\n?/g, '');

      // Encontrar JSON válido
      const jsonMatch = respostaTexto.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Resposta não contém JSON válido');
      }

      const analise = JSON.parse(jsonMatch[0]);
      console.log('[INTENCAO] ✅ Claude analisou:', analise.intencao_principal);
      return analise;

    } catch (error) {
      console.error('[INTENCAO] ❌ Claude falhou:', error.message);
      throw error; // Vai cair no fallback regex
    }
  }

  /**
   * Constrói o prompt para análise
   */
  _construirPrompt(mensagem, historico) {
    let prompt = `MENSAGEM DO CLIENTE: "${mensagem}"\n\n`;

    if (historico.length > 0) {
      prompt += `CONTEXTO DA CONVERSA (últimas 3 mensagens):\n`;
      historico.slice(-3).forEach(h => {
        prompt += `${h.role}: "${h.msg}"\n`;
      });
    }

    return prompt;
  }

  /**
   * Gera chave única para cache
   */
  _gerarCacheKey(mensagem, historico) {
    const msgHash = mensagem.toLowerCase().trim().substring(0, 50);
    const histHash = historico.slice(-2).map(h => h.msg.substring(0, 20)).join('|');
    return `${msgHash}_${histHash}`;
  }

  /**
   * Análise fallback (sem IA) usando regex
   */
  _fallbackAnalise(mensagem) {
    console.log('[INTENCAO] Usando análise fallback (regex)');

    const msgLower = mensagem.toLowerCase();

    // Detectar intenção básica
    let intencao = 'duvida';
    if (/procuro|quero|preciso|busco|tem|disponivel/i.test(msgLower)) {
      intencao = 'busca';
    } else if (/quanto|preco|preço|valor|custo|parcela/i.test(msgLower)) {
      intencao = 'negociacao';
    } else if (/caro|barato|nao tenho|não tenho/i.test(msgLower)) {
      intencao = 'objecao';
    }

    // Detectar entidades básicas
    const marcas = ['honda', 'toyota', 'chevrolet', 'ford', 'volkswagen', 'fiat', 'jeep', 'hyundai'];
    const marcaEncontrada = marcas.find(m => msgLower.includes(m));

    const anoMatch = msgLower.match(/20\d{2}|19\d{2}/);
    const precoMatch = msgLower.match(/(\d+\.?\d*)\s*(mil|k)/i);

    return {
      intencao_principal: intencao,
      sub_intencao: 'Análise básica (fallback)',
      entidades: {
        marca: marcaEncontrada || null,
        modelo: null,
        tipo_veiculo: null,
        preco_mencionado: precoMatch ? parseInt(precoMatch[1]) * 1000 : null,
        ano_mencionado: anoMatch ? parseInt(anoMatch[0]) : null
      },
      sentimento: 'neutro',
      urgencia: 'media',
      objecoes: [],
      contexto_necessario: 'Cliente enviou mensagem',
      acao_sugerida: 'buscar_carros'
    };
  }

  /**
   * Detecta se cliente está comparando carros
   */
  detectarComparacao(mensagem) {
    const palavrasComparacao = [
      /qual.*melhor/i,
      /qual.*diferença/i,
      /compare/i,
      /comparar/i,
      /versus|vs|x/i,
      /qual.*vale mais/i,
      /entre.*e/i
    ];

    return palavrasComparacao.some(regex => regex.test(mensagem));
  }

  /**
   * Detecta objeções específicas
   */
  async detectarObjecoes(mensagem) {
    const objecoesComuns = {
      preco: /caro|muito caro|não tenho|nao tenho|preço alto/i,
      condicao: /muito rodado|alto km|antiga|velho/i,
      confianca: /confio|seguro|garantia|procedência|procedencia/i,
      comparacao: /vi mais barato|outro lugar|concorrente/i,
      urgencia: /vou pensar|depois|mais tarde|ainda não/i
    };

    const objecoesEncontradas = [];

    for (const [tipo, regex] of Object.entries(objecoesComuns)) {
      if (regex.test(mensagem)) {
        objecoesEncontradas.push({
          tipo,
          texto: mensagem.match(regex)[0],
          gravidade: tipo === 'preco' || tipo === 'confianca' ? 'alta' : 'media'
        });
      }
    }

    return objecoesEncontradas;
  }

  /**
   * Limpa cache (útil para testes)
   */
  limparCache() {
    this.cache.clear();
    console.log('[INTENCAO] Cache limpo');
  }
}

export default AnalisadorIntencoes;

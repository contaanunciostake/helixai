/**
 * 🧠 MÓDULO 8: GERADOR DE PERGUNTAS ESPONTÂNEAS - PRODUTOS (ATACADO/VAREJO)
 *
 * Cria perguntas únicas baseadas no contexto
 * Não usa templates pré-definidos
 * Adaptado para distribuidoras/lojas de produtos
 */

import Anthropic from '@anthropic-ai/sdk';

export class GeradorPerguntasEspontaneasProdutos {
  constructor(anthropicKey, botConfig = {}) {
    this.anthropic = new Anthropic({ apiKey: anthropicKey });
    this.botConfig = botConfig;
  }

  atualizarConfig(botConfig) {
    this.botConfig = botConfig;
  }

  /**
   * Gera pergunta espontânea baseada no contexto EXATO
   */
  async gerarPergunta(mensagemCliente, historico = [], contexto = {}) {
    console.log('[PERGUNTAS-PRODUTOS] Gerando pergunta baseada em contexto...');

    try {
      const ganchos = this.detectarGanchos(mensagemCliente);

      if (ganchos.length === 0) {
        console.log('[PERGUNTAS-PRODUTOS] Nenhum gancho detectado, usando fallback');
        return this._perguntaFallback(mensagemCliente);
      }

      const prompt = this._construirPrompt(mensagemCliente, historico, contexto, ganchos);
      const pergunta = await this._gerarComIA(prompt);

      console.log('[PERGUNTAS-PRODUTOS] ✓ Gerada:', pergunta);
      return pergunta;

    } catch (error) {
      console.error('[PERGUNTAS-PRODUTOS] Erro:', error.message);
      return this._perguntaFallback(mensagemCliente);
    }
  }

  /**
   * Detecta "ganchos" - palavras que indicam contexto interessante para PRODUTOS
   */
  detectarGanchos(mensagem) {
    const ganchos = [];
    const msgLower = mensagem.toLowerCase();

    const categorias = {
      veiculo: ['carro', 'moto', 'caminhao', 'caminhão', 'pickup', 'suv', 'veículo', 'veiculo'],
      trabalho: ['trabalho', 'oficina', 'mecânico', 'mecanico', 'frota', 'empresa', 'delivery', 'entrega', 'uber', '99', 'transporte'],
      marca: ['ipiranga', 'texaco', 'mann', 'tecfil', 'militec', 'fleetguard', 'donaldson', 'levorin', 'tecbril'],
      produto: ['oleo', 'óleo', 'filtro', 'aditivo', 'graxa', 'coolant', 'fluido', 'camara', 'câmara', 'limpeza'],
      quantidade: ['quantidade', 'atacado', 'caixa', 'lote', 'estoque', 'pacote', 'kit'],
      urgencia: ['urgente', 'hoje', 'agora', 'rápido', 'rapido', 'preciso', 'falta'],
      problema: ['problema', 'barulho', 'vazando', 'aquecendo', 'queimando', 'gastando']
    };

    for (const [categoria, palavras] of Object.entries(categorias)) {
      for (const palavra of palavras) {
        if (msgLower.includes(palavra)) {
          ganchos.push({
            categoria,
            palavra_encontrada: palavra,
            contexto: mensagem
          });
          break;
        }
      }
    }

    return ganchos;
  }

  /**
   * Constrói prompt rico para IA
   */
  _construirPrompt(mensagem, historico, contexto, ganchos) {
    const nomeBot = this.botConfig?.nome_bot || 'AIra';

    let prompt = `ÚLTIMA MENSAGEM DO CLIENTE: "${mensagem}"\n\n`;

    // Ganchos detectados
    if (ganchos.length > 0) {
      prompt += `GANCHOS DETECTADOS (oportunidades pra perguntar):\n`;
      ganchos.forEach(g => {
        prompt += `- ${g.categoria}: cliente mencionou "${g.palavra_encontrada}"\n`;
      });
      prompt += `\n`;
    }

    // Histórico recente
    if (historico.length > 0) {
      prompt += `CONTEXTO DA CONVERSA:\n`;
      historico.slice(-3).forEach(h => {
        prompt += `${h.role}: "${h.msg}"\n`;
      });
      prompt += `\n`;
    }

    // O que já sabemos
    if (contexto.perfil) {
      prompt += `JÁ SABEMOS:\n`;
      if (contexto.perfil.prioridades) {
        prompt += `- Prioridades: ${contexto.perfil.prioridades.join(', ')}\n`;
      }
      if (contexto.temperatura) {
        prompt += `- Temperatura: ${contexto.temperatura.temperatura_lead}\n`;
      }
      prompt += `\n`;
    }

    prompt += `TAREFA:
Gere UMA pergunta ESPONTÂNEA que:

✅ Demonstre INTERESSE GENUÍNO no que ele disse
✅ Conecte com a NECESSIDADE REAL dele
✅ Seja ÚNICA pra este contexto (não genérica)
✅ Ajude a entender melhor o que ele precisa
✅ Use TOM NATURAL e conversacional

❌ NUNCA use templates como:
- "Qual produto você procura?"
- "Qual sua preferência?"
- "Tem alguma marca em mente?"

EXEMPLOS DE PERGUNTAS ESPONTÂNEAS PARA PRODUTOS:

Cliente disse: "Trabalho com frota de caminhões"
❌ RUIM: "Que produto você quer?"
✅ BOM: "Frota de caminhões! Quantos veículos mais ou menos? Pergunto porque consigo condição especial pra volume!"

Cliente disse: "Meu carro tá aquecendo muito"
❌ RUIM: "Quer comprar óleo?"
✅ BOM: "Aquecendo demais? Já verificou o nível do coolant? Pode ser isso ou o fluido já venceu. Qual o modelo do carro?"

Cliente disse: "Tenho uma oficina mecânica"
❌ RUIM: "Quer ver nossos produtos?"
✅ BOM: "Oficina! Que bacana! Você trabalha mais com carros ou pesados? A gente tem linha completa e consigo preço especial pra parceria!"

Cliente disse: "Preciso de filtro pro meu Corolla"
❌ RUIM: "Qual filtro você quer?"
✅ BOM: "Corolla! Ano quanto? Pergunto porque muda a especificação do filtro. E aproveita pra trocar óleo também? Tô com promoção do kit completo!"

AGORA GERE A PERGUNTA (apenas a pergunta, sem explicação):`;

    return prompt;
  }

  /**
   * Gera com IA (Claude)
   */
  async _gerarComIA(prompt) {
    try {
      const nomeBot = this.botConfig?.nome_bot || 'AIra';

      const systemPrompt = `Você é ${nomeBot}, vendedor(a) de produtos automotivos curioso(a) e empático(a). Gere perguntas espontâneas e naturais baseadas no contexto. NUNCA use templates genéricos. NUNCA revele que é IA.`;

      const response = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 100,
        temperature: 0.9,
        messages: [{
          role: 'user',
          content: `${systemPrompt}\n\n${prompt}`
        }]
      });

      return response.content[0].text.trim();

    } catch (error) {
      console.log('[PERGUNTAS-PRODUTOS] Claude API falhou, usando fallback.');
      throw error;
    }
  }

  /**
   * Fallback quando não detecta ganchos
   */
  _perguntaFallback(mensagem) {
    const perguntas = [
      'Me conta mais! Qual produto você tá precisando?',
      'Interessante! É pra qual veículo/aplicação?',
      'Legal! E você precisa de só um ou quer ver se tem mais coisa?',
      'Ah! E seria pra uso próprio ou pra oficina/revenda?'
    ];

    return perguntas[Math.floor(Math.random() * perguntas.length)];
  }

  /**
   * Valida se pergunta é realmente espontânea
   */
  isEspontanea(pergunta) {
    const templates = [
      /que (tipo de )?produto você (procura|quer)/i,
      /qual (é |a )?sua preferência/i,
      /o que você (procura|busca)/i,
      /tem alguma marca/i,
      /qual (seria |é )?seu orçamento/i
    ];

    return !templates.some(regex => regex.test(pergunta));
  }
}

export default GeradorPerguntasEspontaneasProdutos;

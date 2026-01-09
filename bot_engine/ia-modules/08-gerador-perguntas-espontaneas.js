/**
 * 🧠 GERADOR DE PERGUNTAS ESPONTÂNEAS
 * ✅ ATUALIZADO: Usa Claude API em vez de OpenAI
 *
 * Cria perguntas únicas baseadas no contexto
 * Não usa templates pré-definidos
 * = CONSCIÊNCIA EMERGENTE
 */

import Anthropic from '@anthropic-ai/sdk';

export class GeradorPerguntasEspontaneas {
  constructor(anthropicKey) {
    this.anthropic = new Anthropic({ apiKey: anthropicKey });
  }

  /**
   * Gera pergunta espontânea baseada no contexto EXATO
   */
  async gerarPergunta(mensagemCliente, historico = [], contexto = {}) {
    console.log('[PERGUNTAS-ESPONTANEAS] Gerando pergunta baseada em contexto...');

    try {
      // Detectar "ganchos" na mensagem
      const ganchos = this.detectarGanchos(mensagemCliente);

      if (ganchos.length === 0) {
        console.log('[PERGUNTAS-ESPONTANEAS] Nenhum gancho detectado, usando fallback');
        return this._perguntaFallback(mensagemCliente);
      }

      // Construir prompt rico
      const prompt = this._construirPrompt(mensagemCliente, historico, contexto, ganchos);

      // Gerar com IA
      const pergunta = await this._gerarComIA(prompt);

      console.log('[PERGUNTAS-ESPONTANEAS] ✓ Gerada:', pergunta);

      return pergunta;

    } catch (error) {
      console.error('[PERGUNTAS-ESPONTANEAS] Erro:', error.message);
      return this._perguntaFallback(mensagemCliente);
    }
  }

  /**
   * Detecta "ganchos" - palavras que indicam contexto interessante
   */
  detectarGanchos(mensagem) {
    const ganchos = [];
    const msgLower = mensagem.toLowerCase();

    const categorias = {
      trabalho: ['trabalho', 'trampo', 'emprego', 'empresa', 'negócio', 'delivery', 'entrega', 'uber', '99'],
      familia: ['família', 'familia', 'esposa', 'marido', 'filho', 'filha', 'criança', 'bebe', 'bebê'],
      hobby: ['hobby', 'gosto', 'adoro', 'paixão', 'fim de semana', 'lazer'],
      localizacao: ['moro', 'bairro', 'cidade', 'interior', 'capital', 'praia', 'serra'],
      uso: ['uso', 'usar', 'utilizar', 'rodar', 'andar', 'viagem', 'viajar'],
      financeiro: ['pagar', 'parcela', 'dinheiro', 'grana', 'financiar', 'orçamento']
    };

    for (const [categoria, palavras] of Object.entries(categorias)) {
      for (const palavra of palavras) {
        if (msgLower.includes(palavra)) {
          ganchos.push({
            categoria,
            palavra_encontrada: palavra,
            contexto: mensagem
          });
          break; // Apenas um gancho por categoria
        }
      }
    }

    return ganchos;
  }

  /**
   * Constrói prompt rico para IA
   */
  _construirPrompt(mensagem, historico, contexto, ganchos) {
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
✅ Conecte com a VIDA REAL dele
✅ Seja ÚNICA pra este contexto (não genérica)
✅ Ajude a entender melhor a necessidade dele
✅ Use TOM NATURAL e conversacional

❌ NUNCA use templates como:
- "Que tipo de veículo você procura?"
- "Qual sua preferência?"
- "Tem alguma marca em mente?"

EXEMPLOS DE PERGUNTAS ESPONTÂNEAS:

Cliente disse: "Trabalho com entregas"
❌ RUIM: "Que tipo de carro você procura?"
✅ BOM: "Entregas! Você roda mais na cidade ou faz viagens longas também? Isso muda bastante o perfil do carro ideal!"

Cliente disse: "Tenho 3 filhos"
❌ RUIM: "Quer um carro grande?"
✅ BOM: "3 filhos! Nossa! Então precisa de bastante espaço né? E cadeirinha, já tem ou vai precisar comprar?"

Cliente disse: "Gosto de viajar"
❌ RUIM: "Prefere sedã ou SUV?"
✅ BOM: "Ah, viajante! Você vai mais pra praia, serra ou interior? Pergunto porque isso influencia se precisa 4x4 ou não!"

AGORA GERE A PERGUNTA (apenas a pergunta, sem explicação):`;

    return prompt;
  }

  /**
   * Gera com IA (OpenAI primeiro, Groq fallback)
   */
  async _gerarComIA(prompt) {
    try {
      const systemPrompt = 'Você é Luana, consultora curiosa e empática. Gere perguntas espontâneas e naturais baseadas no contexto. NUNCA use templates genéricos.';

      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 100,
        temperature: 0.9, // Alta criatividade
        messages: [{
          role: 'user',
          content: `${systemPrompt}\n\n${prompt}`
        }]
      });

      return response.content[0].text.trim();

    } catch (error) {
      console.log('[PERGUNTAS-ESPONTANEAS] Claude API falhou, usando fallback.');
      throw error; // Vai usar pergunta fallback
    }
  }

  /**
   * Fallback quando não detecta ganchos
   */
  _perguntaFallback(mensagem) {
    const perguntas = [
      'Me conta mais sobre isso! Como você imagina usando o carro no dia a dia?',
      'Interessante! E qual seria o uso principal? Trabalho, família, viagens?',
      'Legal! E você tem preferência de tamanho? Algo mais compacto ou espaçoso?',
      'Ah! E vai ser uso diário ou mais fim de semana?'
    ];

    return perguntas[Math.floor(Math.random() * perguntas.length)];
  }

  /**
   * Valida se pergunta é realmente espontânea
   */
  isEspontanea(pergunta) {
    // Templates genéricos que queremos EVITAR
    const templates = [
      /que tipo de (veículo|carro|automóvel)/i,
      /qual (é |a )?sua preferência/i,
      /o que você (procura|busca)/i,
      /tem alguma (marca|modelo)/i,
      /qual (seria |é )?seu orçamento/i
    ];

    return !templates.some(regex => regex.test(pergunta));
  }
}

export default GeradorPerguntasEspontaneas;
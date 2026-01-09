/**
 * Analisador de Sentimento - Acompanhante +18
 *
 * Detecta o estado emocional do cliente:
 * - Excitado/Ansioso para fechar
 * - Curioso/Explorando
 * - Desconfiado
 * - Negociador
 * - Respeitoso
 * - Agressivo/Desrespeitoso
 */

import Anthropic from '@anthropic-ai/sdk';

class AnalisadorSentimentoAcompanhante {
  constructor() {
    this.client = new Anthropic();
    this.modelo = 'claude-3-haiku-20240307';
  }

  /**
   * Analisa o sentimento e temperatura do cliente
   */
  async analisar(mensagem, historicoConversa = []) {
    const prompt = `Analise o sentimento de um cliente conversando com uma acompanhante.

MENSAGEM: "${mensagem}"

HISTÓRICO:
${historicoConversa.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n')}

Avalie:

1. TEMPERATURA (0-100):
   - 0-20: Frio (só curiosidade, não vai fechar)
   - 21-40: Morno (interessado mas indeciso)
   - 41-60: Aquecendo (considerando seriamente)
   - 61-80: Quente (pronto para fechar)
   - 81-100: Muito quente (urgente, quer agora)

2. SENTIMENTO:
   - excitado: Ansioso, quer logo
   - curioso: Explorando, fazendo perguntas
   - desconfiado: Duvida se é real, pede provas
   - negociador: Focado em preço, quer desconto
   - respeitoso: Educado, trata bem
   - carente: Quer atenção, conexão
   - direto: Objetivo, não enrola
   - agressivo: Grosseiro, desrespeitoso

3. SINAIS DE ALERTA:
   - Pede coisas sem proteção
   - Muito invasivo muito rápido
   - Desrespeito ou palavrões ofensivos
   - Quer encontrar sem pagar
   - Pressiona demais

4. PROBABILIDADE DE FECHAMENTO: baixa, media, alta

Responda em JSON:
{
  "temperatura": 0-100,
  "sentimento_principal": "tipo",
  "sentimentos_secundarios": ["lista"],
  "sinais_alerta": ["lista ou vazio"],
  "probabilidade_fechamento": "baixa|media|alta",
  "recomendacao": "como a acompanhante deve responder"
}`;

    try {
      const response = await this.client.messages.create({
        model: this.modelo,
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      });

      const texto = response.content[0].text;
      const jsonMatch = texto.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return this.analisarLocal(mensagem);

    } catch (error) {
      console.error('Erro ao analisar sentimento:', error);
      return this.analisarLocal(mensagem);
    }
  }

  /**
   * Análise local (fallback)
   */
  analisarLocal(mensagem) {
    const msg = mensagem.toLowerCase();
    let temperatura = 30;
    let sentimento = 'curioso';
    let sinais = [];
    let probabilidade = 'media';

    // Detectar temperatura/urgência
    if (msg.match(/agora|hoje|urgente|ja|já|rapido|quero muito|preciso/)) {
      temperatura = 80;
      sentimento = 'excitado';
      probabilidade = 'alta';
    } else if (msg.match(/vamos|bora|fecha|quero|combinado|pode ser/)) {
      temperatura = 70;
      probabilidade = 'alta';
    } else if (msg.match(/quanto|valor|preço|como funciona/)) {
      temperatura = 50;
      probabilidade = 'media';
    } else if (msg.match(/talvez|depois|vou pensar|não sei/)) {
      temperatura = 20;
      probabilidade = 'baixa';
    }

    // Detectar sentimento
    if (msg.match(/desconto|mais barato|caro|diminui/)) {
      sentimento = 'negociador';
    } else if (msg.match(/real|verdade|prova|foto com|ao vivo/)) {
      sentimento = 'desconfiado';
    } else if (msg.match(/linda|gostosa|maravilhosa|tesao/)) {
      sentimento = 'excitado';
    } else if (msg.match(/como voce ta|tudo bem|seu dia/)) {
      sentimento = 'carente';
    }

    // Detectar sinais de alerta
    if (msg.match(/sem camisinha|sem protecao|natural|pelo/)) {
      sinais.push('pedido_sem_protecao');
    }
    if (msg.match(/gratis|de graça|sem pagar|na amizade/)) {
      sinais.push('quer_gratis');
    }
    if (msg.match(/puta|vadia|piranha/) && !msg.match(/gostosa/)) {
      sinais.push('desrespeito');
    }
    if (msg.match(/endereco agora|onde mora|vai la em casa agora/)) {
      sinais.push('muito_invasivo');
    }

    return {
      temperatura,
      sentimento_principal: sentimento,
      sentimentos_secundarios: [],
      sinais_alerta: sinais,
      probabilidade_fechamento: probabilidade,
      recomendacao: this.getRecomendacao(sentimento, sinais)
    };
  }

  /**
   * Gera recomendação baseada na análise
   */
  getRecomendacao(sentimento, sinais) {
    if (sinais.length > 0) {
      if (sinais.includes('pedido_sem_protecao')) {
        return 'Recusar educadamente e reforçar que proteção é obrigatória';
      }
      if (sinais.includes('desrespeito')) {
        return 'Ignorar ou responder que não aceita desrespeito';
      }
      if (sinais.includes('quer_gratis')) {
        return 'Explicar que o tempo dela tem valor, oferecer opção mais barata';
      }
      if (sinais.includes('muito_invasivo')) {
        return 'Pedir calma e explicar processo de segurança';
      }
    }

    const recomendacoes = {
      excitado: 'Aproveitar o momento e fechar logo, facilitar o processo',
      curioso: 'Responder dúvidas e criar mais desejo antes de apresentar valores',
      desconfiado: 'Oferecer prova (áudio, foto com papel), criar confiança',
      negociador: 'Ser firme no valor mas oferecer alternativas/opções menores',
      respeitoso: 'Tratar muito bem, esse é cliente bom para fidelizar',
      carente: 'Dar atenção, criar conexão emocional, vender pacote com mais interação',
      direto: 'Ser objetiva também, não enrolar, ir direto ao ponto'
    };

    return recomendacoes[sentimento] || 'Continuar conversa normalmente';
  }

  /**
   * Verifica se deve recusar atendimento
   */
  deveRecusar(analise) {
    const alertasGraves = ['pedido_sem_protecao', 'desrespeito', 'muito_invasivo'];
    return analise.sinais_alerta.some(a => alertasGraves.includes(a));
  }
}

export default new AnalisadorSentimentoAcompanhante();

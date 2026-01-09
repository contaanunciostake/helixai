/**
 * Preditor de Fechamento - Acompanhante +18
 *
 * Analisa probabilidade de conversão e sugere ações
 * para aumentar chances de fechamento
 */

import Anthropic from '@anthropic-ai/sdk';

class PreditorFechamentoAcompanhante {
  constructor() {
    this.client = new Anthropic();
    this.modelo = 'claude-3-haiku-20240307';
  }

  /**
   * Prediz probabilidade de fechamento
   */
  async prever(dados) {
    const {
      historicoConversa = [],
      analiseSentimento = {},
      memoriaCliente = {},
      tempoConversa = 0
    } = dados;

    const prompt = `Analise esta conversa com cliente de serviço de acompanhante e preveja a probabilidade de fechamento.

HISTÓRICO:
${historicoConversa.slice(-10).map(m => `${m.role}: ${m.content}`).join('\n')}

DADOS DO CLIENTE:
- Sentimento: ${analiseSentimento.sentimento_principal || 'desconhecido'}
- Temperatura: ${analiseSentimento.temperatura || 50}/100
- Interesse: ${memoriaCliente.interesse_principal || 'indefinido'}
- Tem local: ${memoriaCliente.local_preferido || 'indefinido'}
- Tempo de conversa: ${tempoConversa} minutos

Analise e responda em JSON:
{
  "probabilidade_fechamento": 0-100,
  "tipo_provavel": "conteudo|encontro|nenhum",
  "nivel_interesse": "baixo|medio|alto|muito_alto",
  "objecoes_detectadas": ["lista"],
  "sinais_positivos": ["lista"],
  "sinais_negativos": ["lista"],
  "proxima_acao_recomendada": "string",
  "urgencia_acao": "baixa|media|alta",
  "mensagem_sugerida": "sugestão de próxima mensagem"
}`;

    try {
      const response = await this.client.messages.create({
        model: this.modelo,
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }]
      });

      const texto = response.content[0].text;
      const jsonMatch = texto.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return this.preverLocal(analiseSentimento, memoriaCliente);

    } catch (error) {
      console.error('Erro ao prever fechamento:', error);
      return this.preverLocal(analiseSentimento, memoriaCliente);
    }
  }

  /**
   * Previsão local (fallback)
   */
  preverLocal(sentimento, memoria) {
    let probabilidade = 30;
    let tipoProvavel = 'nenhum';
    let sinaisPositivos = [];
    let sinaisNegativos = [];

    // Baseado na temperatura
    if (sentimento.temperatura) {
      probabilidade = Math.min(sentimento.temperatura + 10, 100);
    }

    // Baseado no interesse
    if (memoria.interesse_principal === 'encontro') {
      probabilidade += 15;
      tipoProvavel = 'encontro';
      sinaisPositivos.push('Demonstrou interesse em encontro');
    } else if (memoria.interesse_principal === 'conteudo') {
      probabilidade += 10;
      tipoProvavel = 'conteudo';
      sinaisPositivos.push('Demonstrou interesse em conteúdo');
    }

    // Baseado no sentimento
    if (sentimento.sentimento_principal === 'excitado') {
      probabilidade += 20;
      sinaisPositivos.push('Cliente excitado/ansioso');
    } else if (sentimento.sentimento_principal === 'negociador') {
      probabilidade += 5;
      sinaisNegativos.push('Focado em preço');
    } else if (sentimento.sentimento_principal === 'desconfiado') {
      probabilidade -= 10;
      sinaisNegativos.push('Cliente desconfiado');
    }

    // Baseado em ter local
    if (memoria.local_preferido !== 'indefinido') {
      probabilidade += 10;
      sinaisPositivos.push('Já definiu questão do local');
    }

    // Red flags
    if (memoria.red_flags?.length > 0) {
      probabilidade -= 20;
      sinaisNegativos.push(...memoria.red_flags);
    }

    // Limitar entre 0-100
    probabilidade = Math.max(0, Math.min(100, probabilidade));

    return {
      probabilidade_fechamento: probabilidade,
      tipo_provavel: tipoProvavel,
      nivel_interesse: this.getNivelInteresse(probabilidade),
      objecoes_detectadas: [],
      sinais_positivos: sinaisPositivos,
      sinais_negativos: sinaisNegativos,
      proxima_acao_recomendada: this.getAcaoRecomendada(probabilidade, tipoProvavel),
      urgencia_acao: probabilidade > 60 ? 'alta' : probabilidade > 30 ? 'media' : 'baixa',
      mensagem_sugerida: null
    };
  }

  /**
   * Converte probabilidade em nível
   */
  getNivelInteresse(probabilidade) {
    if (probabilidade >= 80) return 'muito_alto';
    if (probabilidade >= 60) return 'alto';
    if (probabilidade >= 40) return 'medio';
    return 'baixo';
  }

  /**
   * Sugere próxima ação
   */
  getAcaoRecomendada(probabilidade, tipo) {
    if (probabilidade >= 80) {
      return tipo === 'encontro'
        ? 'Fechar data e horário imediatamente'
        : 'Enviar link de pagamento agora';
    }

    if (probabilidade >= 60) {
      return tipo === 'encontro'
        ? 'Perguntar preferência de data/horário'
        : 'Apresentar pacote mais atrativo';
    }

    if (probabilidade >= 40) {
      return 'Criar mais conexão e desejo antes de falar valores';
    }

    return 'Qualificar melhor o interesse do cliente';
  }

  /**
   * Analisa objeções na conversa
   */
  detectarObjecoes(historico) {
    const objecoes = [];
    const ultimasMensagens = historico.slice(-5).filter(m => m.role === 'user');

    for (const msg of ultimasMensagens) {
      const texto = msg.content.toLowerCase();

      if (texto.match(/caro|muito|preco alto|sem condicao/)) {
        objecoes.push({
          tipo: 'preco',
          texto: 'Achou caro/sem condições',
          resposta_sugerida: 'Oferecer opção mais barata ou parcelar'
        });
      }

      if (texto.match(/pensar|depois|agora nao|outro dia/)) {
        objecoes.push({
          tipo: 'adiamento',
          texto: 'Quer adiar decisão',
          resposta_sugerida: 'Criar urgência sutil ou oferecer incentivo'
        });
      }

      if (texto.match(/real|verdade|golpe|fake/)) {
        objecoes.push({
          tipo: 'confianca',
          texto: 'Desconfia se é real',
          resposta_sugerida: 'Oferecer prova (áudio, foto verificação)'
        });
      }

      if (texto.match(/longe|distante|regiao/)) {
        objecoes.push({
          tipo: 'local',
          texto: 'Preocupação com distância/local',
          resposta_sugerida: 'Explicar opções de local e deslocamento'
        });
      }
    }

    return objecoes;
  }

  /**
   * Sugere técnica de fechamento
   */
  sugerirTecnicaFechamento(probabilidade, objecoes, sentimento) {
    const tecnicas = [];

    // Baseado na probabilidade
    if (probabilidade >= 70) {
      tecnicas.push({
        nome: 'Fechamento Direto',
        descricao: 'Cliente quente, perguntar diretamente quando quer marcar',
        exemplo: 'Então amor, vamos marcar pra quando? Tenho horário amanhã à tarde 😏'
      });
    }

    if (probabilidade >= 50 && probabilidade < 70) {
      tecnicas.push({
        nome: 'Alternativa',
        descricao: 'Oferecer duas opções, ambas levam ao fechamento',
        exemplo: 'Você prefere essa semana ou na próxima, amor? 💋'
      });
    }

    // Baseado em objeções
    if (objecoes.some(o => o.tipo === 'preco')) {
      tecnicas.push({
        nome: 'Quebra de Objeção - Preço',
        descricao: 'Mostrar valor, não preço',
        exemplo: 'Amor, meu atendimento é premium... você vai ver que vale cada centavo 😘'
      });
    }

    if (objecoes.some(o => o.tipo === 'adiamento')) {
      tecnicas.push({
        nome: 'Escassez',
        descricao: 'Criar senso de urgência',
        exemplo: 'Minha agenda tá bem concorrida essa semana... mas consigo encaixar você 😏'
      });
    }

    // Baseado no sentimento
    if (sentimento === 'carente') {
      tecnicas.push({
        nome: 'Conexão Emocional',
        descricao: 'Enfatizar a experiência e atenção',
        exemplo: 'Vou te dar toda atenção que você merece, amor... vai ser especial 💕'
      });
    }

    return tecnicas;
  }

  /**
   * Calcula momento ideal para fechar
   */
  calcularMomentoIdeal(historico, sentimento) {
    // Se temperatura está alta e subindo, é agora
    if (sentimento.temperatura >= 70) {
      return {
        momento: 'AGORA',
        motivo: 'Cliente está quente, fechar antes que esfrie',
        risco_esperar: 'alto'
      };
    }

    // Se está em aquecimento
    if (sentimento.temperatura >= 50) {
      return {
        momento: 'PROXIMO_TURNO',
        motivo: 'Criar mais um pouco de desejo e fechar',
        risco_esperar: 'medio'
      };
    }

    // Se ainda está frio
    return {
      momento: 'AGUARDAR',
      motivo: 'Precisa aquecer mais antes de tentar fechar',
      risco_esperar: 'baixo'
    };
  }
}

export default new PreditorFechamentoAcompanhante();

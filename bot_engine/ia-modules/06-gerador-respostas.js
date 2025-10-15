/**
 * 🎯 MÓDULO 6: GERADOR INTELIGENTE DE RESPOSTAS
 *
 * Adapta linguagem ao perfil do cliente
 * Gera argumentos de venda personalizados
 * Cria senso de urgência quando apropriado
 *
 * ✅ ATUALIZADO: Usa Claude API em vez de OpenAI
 */

import Anthropic from '@anthropic-ai/sdk';

export class GeradorRespostas {
  constructor(anthropicKey) {
    this.anthropic = new Anthropic({ apiKey: anthropicKey });

    if (!this.anthropic) {
      console.warn('⚠️ [GERADOR] Anthropic não configurado');
    }
  }

  /**
   * Gera resposta personalizada inteligente
   * @param {Object} contexto - Contexto completo da conversa
   * @returns {string} Resposta gerada
   */
  async gerar(contexto) {
    console.log('[GERADOR] Gerando resposta personalizada...');

    const {
      mensagemCliente,
      historico,
      intencao,
      sentimento,
      temperatura,
      perfil,
      predicao
    } = contexto;

    try {
      // Construir prompt otimizado
      const prompt = this._construirPromptCompleto(contexto);

      // Gerar resposta com IA
      const resposta = await this._gerarComIA(prompt, contexto);

      console.log('[GERADOR] ✓ Resposta gerada');

      return resposta;

    } catch (error) {
      console.error('[GERADOR] Erro:', error.message);
      return this._respostaFallback(mensagemCliente);
    }
  }

  /**
   * Constrói prompt completo para IA
   */
  _construirPromptCompleto(contexto) {
    const {
      mensagemCliente,
      historico,
      intencao,
      sentimento,
      temperatura,
      perfil,
      predicao
    } = contexto;

    let prompt = `Você é Luana, consultora de vendas do Feirão Show Car há 15 anos.\n\n`;

    // CONTEXTO DA CONVERSA
    prompt += `=== CONTEXTO ATUAL ===\n`;
    prompt += `MENSAGEM DO CLIENTE: "${mensagemCliente}"\n\n`;

    // ANÁLISES INTELIGENTES
    prompt += `=== ANÁLISES DE IA ===\n`;

    if (intencao) {
      prompt += `INTENÇÃO: ${intencao.intencao_principal} (${intencao.sub_intencao})\n`;
      prompt += `AÇÃO SUGERIDA: ${intencao.acao_sugerida}\n`;
    }

    if (sentimento) {
      prompt += `SENTIMENTO: ${sentimento.sentimento}\n`;
      prompt += `INTERESSE: ${sentimento.nivel_interesse}\n`;
      prompt += `TOM RECOMENDADO: ${sentimento.tom_recomendado}\n`;
    }

    if (temperatura) {
      prompt += `TEMPERATURA DO LEAD: ${temperatura.temperatura_lead} (${temperatura.score_temperatura}/100)\n`;
      prompt += `EVOLUÇÃO: ${temperatura.evolucao}\n`;
    }

    if (predicao) {
      prompt += `PROBABILIDADE FECHAMENTO: ${predicao.probabilidade_fechamento}%\n`;
      prompt += `MOMENTO IDEAL FECHAR: ${predicao.momento_ideal_fechar ? 'SIM' : 'NÃO'}\n`;
    }

    prompt += `\n`;

    // PERFIL DO CLIENTE
    if (perfil) {
      prompt += `=== PERFIL DO CLIENTE ===\n`;
      prompt += `TIPO COMPRADOR: ${perfil.tipo_comprador}\n`;
      prompt += `PRIORIDADES: ${perfil.prioridades?.join(', ')}\n`;

      if (perfil.preferencias?.marca) {
        prompt += `MARCA PREFERIDA: ${perfil.preferencias.marca}\n`;
      }

      if (perfil.orcamento?.confortavel) {
        prompt += `ORÇAMENTO: R$ ${perfil.orcamento.confortavel.toLocaleString('pt-BR')}\n`;
      }

      prompt += `\n`;
    }

    // HISTÓRICO RECENTE
    if (historico && historico.length > 0) {
      prompt += `=== ÚLTIMAS 3 MENSAGENS ===\n`;
      historico.slice(-3).forEach(h => {
        prompt += `${h.role}: "${h.msg}"\n`;
      });
      prompt += `\n`;
    }

    // INSTRUÇÕES DE PERSONALIZAÇÃO
    prompt += `=== INSTRUÇÕES DE RESPOSTA ===\n`;

    // Adaptar estilo baseado no tipo de comprador
    if (perfil?.tipo_comprador === 'emocional') {
      prompt += `- Use linguagem EMOCIONAL: foque em status, prazer, conquista\n`;
      prompt += `- Fale de BENEFÍCIOS EMOCIONAIS: "imagina você dirigindo isso"\n`;
    } else if (perfil?.tipo_comprador === 'pratico') {
      prompt += `- Use linguagem OBJETIVA: foque em dados, economia, custo-benefício\n`;
      prompt += `- Fale de NÚMEROS: preço, consumo, garantia\n`;
    } else if (perfil?.tipo_comprador === 'pesquisador') {
      prompt += `- Use linguagem TÉCNICA: especificações, comparações\n`;
      prompt += `- Forneça DADOS DETALHADOS: motores, tecnologias, diferenciais\n`;
    }

    // Adaptar tom baseado no sentimento
    if (sentimento?.sentimento === 'frustrado') {
      prompt += `- Tom EMPÁTICO: reconheça frustrações, seja paciente\n`;
      prompt += `- PEÇA DESCULPAS se necessário e resolva o problema\n`;
    } else if (sentimento?.tom_recomendado === 'urgente') {
      prompt += `- Tom URGENTE: crie senso de oportunidade única\n`;
      prompt += `- Use: "estoque limitado", "promoção por tempo limitado"\n`;
    }

    // Adaptar estratégia baseado na temperatura
    if (temperatura?.temperatura_lead === 'quente') {
      prompt += `- Cliente MUITO INTERESSADO: empurre para decisão\n`;
      prompt += `- Ofereça: test drive, simulação de financiamento, visita\n`;
      prompt += `- Crie URGÊNCIA: "esse modelo sai rápido"\n`;
    } else if (temperatura?.temperatura_lead === 'frio') {
      prompt += `- Cliente FRIO: foque em DESCOBRIR necessidades\n`;
      prompt += `- Faça PERGUNTAS abertas: "o que é mais importante pra você?"\n`;
      prompt += `- NÃO pressione, construa confiança\n`;
    }

    // Instruções baseadas na predição
    if (predicao?.momento_ideal_fechar) {
      prompt += `- 🔥 MOMENTO CRÍTICO: Ofereça fechamento AGORA\n`;
      prompt += `- Sugestão: "Quer agendar test drive hoje?"\n`;
    }

    prompt += `\n`;
    prompt += `=== REGRAS FINAIS ===\n`;
    prompt += `- Máximo 3 linhas (máx 250 caracteres)\n`;
    prompt += `- Natural e conversacional\n`;
    prompt += `- NÃO use emojis excessivamente (máx 1-2)\n`;
    prompt += `- Sempre termine direcionando para próximo passo\n`;
    prompt += `- Use técnicas de vendas sutis\n`;
    prompt += `- ⚠️ CRÍTICO: NUNCA ofereça veículos na primeira mensagem (exceto se o cliente já mencionou um)\n`;
    prompt += `- ⚠️ Na primeira interação, seja receptiva e pergunte como pode ajudar\n\n`;

    prompt += `SUA RESPOSTA:\n`;

    return prompt;
  }

  /**
   * Gera resposta com IA usando Claude
   */
  async _gerarComIA(prompt, contexto) {
    try {
      // ✅ Usar Claude API
      const systemPrompt = 'Você é Luana, consultora de vendas expert da Feirão Show Car há 15 anos. Seja persuasiva mas genuína. Respostas CURTAS e naturais.';

      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 150,
        temperature: 0.8,
        messages: [
          {
            role: 'user',
            content: `${systemPrompt}\n\n${prompt}`
          }
        ]
      });

      const resposta = response.content[0].text.trim();
      console.log('[GERADOR] ✅ Resposta gerada com Claude');

      return resposta;

    } catch (error) {
      console.error('[GERADOR] ❌ Erro ao gerar com Claude:', error.message);
      throw error; // Vai usar resposta fallback
    }
  }

  /**
   * Gera argumento de venda específico para objeção
   * @param {string} objecao - Tipo de objeção
   * @param {Object} contexto - Contexto
   * @returns {string} Argumento
   */
  async gerarContraArgumento(objecao, contexto) {
    console.log('[GERADOR] Gerando contra-argumento para:', objecao);

    const estrategias = {
      'preco': {
        tecnicas: [
          'Dividir em parcelas pequenas',
          'Comparar com benefícios a longo prazo',
          'Mostrar economia em manutenção'
        ],
        exemplos: [
          'Olha, parece alto mas dividindo em 48x fica só R$ X/mês. Cabe no bolso?',
          'Esse modelo é conhecido por manter valor. Revende bem daqui 3 anos.',
          'Considerando que é econômico, você economiza na gasolina todo mês.'
        ]
      },
      'condicao': {
        tecnicas: [
          'Destacar manutenção preventiva',
          'Oferecer garantia',
          'Mostrar revisões feitas'
        ],
        exemplos: [
          'Esse aqui passou por vistoria completa. Tá zerado mecanicamente.',
          'A gente dá 3 meses de garantia. Se der problema, resolve na hora.',
          'Olha o histórico de revisões. Carro super cuidado pelo dono anterior.'
        ]
      },
      'confianca': {
        tecnicas: [
          'Oferecer test drive',
          'Mostrar documentação',
          'Citar clientes satisfeitos'
        ],
        exemplos: [
          'Entendo a preocupação. Quer fazer um test drive pra sentir o carro?',
          'Toda documentação tá em dia. Laudo cautelar, tudo limpo.',
          'Já vendemos mais de 50 desse modelo. Feedback sempre positivo.'
        ]
      }
    };

    const estrategia = estrategias[objecao] || estrategias['preco'];

    // Escolher exemplo aleatório
    const exemplo = estrategia.exemplos[
      Math.floor(Math.random() * estrategia.exemplos.length)
    ];

    return exemplo;
  }

  /**
   * Gera mensagem de urgência (quando apropriado)
   */
  gerarUrgencia(contexto) {
    if (contexto.temperatura?.temperatura_lead !== 'quente') {
      return null; // Só criar urgência se lead estiver quente
    }

    const mensagens = [
      'Esse modelo sai rápido. Tem outro cliente interessado também.',
      'Essa promoção vale só até amanhã. Não perde!',
      'Só tem 1 unidade desse no estoque. Quer garantir?',
      'Olha, vou ser sincero: recebi proposta de outro cliente. Mas prefiro fechar com você primeiro.',
      'Até o fim do mês temos condição especial. Vale muito a pena.'
    ];

    return mensagens[Math.floor(Math.random() * mensagens.length)];
  }

  /**
   * Gera pergunta de qualificação (descoberta)
   */
  gerarPerguntaQualificacao(perfil) {
    const perguntas = [
      'Pra que você vai usar mais: cidade ou estrada?',
      'Tem alguma marca que você prefere?',
      'Qual é o mais importante: economia, conforto ou potência?',
      'Vai ser pra uso diário ou só fim de semana?',
      'Tem preferência por câmbio automático ou manual?',
      'Quantas pessoas vão usar o carro normalmente?',
      'Tem algum modelo em mente já?',
      'Precisa de porta-malas grande?'
    ];

    // Filtrar perguntas já respondidas
    const perguntasFiltradas = perguntas.filter(p => {
      if (perfil?.preferencias?.marca && p.includes('marca')) return false;
      if (perfil?.preferencias?.cambio && p.includes('câmbio')) return false;
      return true;
    });

    return perguntasFiltradas[
      Math.floor(Math.random() * perguntasFiltradas.length)
    ];
  }

  /**
   * Gera call-to-action baseado na fase
   */
  gerarCTA(fase, temperatura) {
    const ctas = {
      'descoberta': [
        'Me conta mais sobre o que você procura?',
        'Qual é a sua prioridade principal?',
        'Quer que eu separe algumas opções pra você?'
      ],
      'apresentacao': [
        'Qual desses chamou mais sua atenção?',
        'Quer ver mais detalhes de algum?',
        'Gostou de algum específico?'
      ],
      'negociacao': [
        'Quer que eu simule o financiamento?',
        'Vamos fechar? Posso preparar a proposta.',
        'Que tal um test drive hoje?'
      ],
      'fechamento': [
        'Bora agendar o test drive?',
        'Quando você pode vir aqui na loja?',
        'Posso separar esse carro pra você hoje?'
      ]
    };

    // Se temperatura quente, usar CTAs mais agressivos
    if (temperatura?.temperatura_lead === 'quente') {
      return [
        'Vamos fechar hoje? Tô com desconto especial.',
        'Quer que eu reserve esse carro pra você?',
        'Que tal vir fazer test drive ainda hoje?'
      ][Math.floor(Math.random() * 3)];
    }

    const faseCtas = ctas[fase] || ctas['descoberta'];
    return faseCtas[Math.floor(Math.random() * faseCtas.length)];
  }

  /**
   * Resposta fallback
   */
  _respostaFallback(mensagem) {
    const respostas = [
      'Entendi! Me conta mais sobre isso?',
      'Interessante. O que mais você procura?',
      'Vou te ajudar com isso. Qual sua dúvida principal?',
      'Certo! Vamos encontrar o ideal pra você.',
      'Pode deixar! Vou buscar as melhores opções.'
    ];

    return respostas[Math.floor(Math.random() * respostas.length)];
  }

  /**
   * Formata resposta final (limita tamanho, remove markdown desnecessário)
   */
  formatarResposta(resposta) {
    let formatada = resposta
      .replace(/\*\*/g, '') // Remove bold
      .replace(/\*/g, '')   // Remove itálico
      .replace(/^IA MASTER:\s*/i, '') // Remove prefixo "IA MASTER:"
      .replace(/^IA-MASTER:\s*/i, '') // Remove prefixo "IA-MASTER:"
      .replace(/^Luana:\s*/i, '')     // Remove prefixo "Luana:"
      .trim();

    // Limitar a 3 linhas
    const linhas = formatada.split('\n');
    if (linhas.length > 3) {
      formatada = linhas.slice(0, 3).join('\n');
    }

    // Limitar caracteres
    if (formatada.length > 300) {
      formatada = formatada.substring(0, 297) + '...';
    }

    return formatada;
  }
}

export default GeradorRespostas;

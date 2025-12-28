/**
 * 🎯 MÓDULO 6: GERADOR INTELIGENTE DE RESPOSTAS - PRODUTOS (ATACADO/VAREJO)
 *
 * Adapta linguagem ao perfil do cliente
 * Gera argumentos de venda personalizados
 * Usa botConfig do CRM para personalização
 *
 * ⚠️ CRÍTICO: NUNCA revelar que é IA - usar persona do botConfig
 */

import Anthropic from '@anthropic-ai/sdk';

export class GeradorRespostasProdutos {
  constructor(anthropicKey, botConfig = {}) {
    this.anthropic = new Anthropic({ apiKey: anthropicKey });
    this.botConfig = botConfig;
  }

  atualizarConfig(botConfig) {
    this.botConfig = botConfig;
  }

  /**
   * Gera resposta personalizada inteligente
   */
  async gerar(contexto) {
    console.log('[GERADOR-PRODUTOS] Gerando resposta personalizada...');

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
      const prompt = this._construirPromptCompleto(contexto);
      const resposta = await this._gerarComIA(prompt, contexto);

      console.log('[GERADOR-PRODUTOS] ✓ Resposta gerada');
      return resposta;

    } catch (error) {
      console.error('[GERADOR-PRODUTOS] Erro:', error.message);
      return this._respostaFallback(mensagemCliente);
    }
  }

  /**
   * Constrói prompt completo usando botConfig do CRM
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

    // Obter configurações do botConfig (do CRM)
    const nomeBot = this.botConfig?.nome_bot || 'AIra';
    const nomeEmpresa = this.botConfig?.nome_empresa || 'nossa distribuidora';
    const tom = this.botConfig?.tom || 'profissional e amigável';
    const personalidade = this.botConfig?.personalidade || 'consultiva';
    const nicho = this.botConfig?.nicho || 'ATACADO_VAREJO';

    // Definir especialidade baseada no nicho
    let especialidade = this.botConfig?.especialidade;
    if (!especialidade) {
      switch (nicho?.toUpperCase()) {
        case 'LOJA_TINTAS':
          especialidade = 'tintas, vernizes, solventes, acessórios de pintura e decoração';
          break;
        case 'VEICULOS':
          especialidade = 'veículos, automóveis, carros e motos';
          break;
        case 'IMOVEIS':
          especialidade = 'imóveis, casas, apartamentos e terrenos';
          break;
        default:
          especialidade = 'produtos automotivos e industriais';
      }
    }

    let prompt = `Você é ${nomeBot}, vendedor(a) especialista da ${nomeEmpresa} há anos.\n`;
    prompt += `Seu tom é ${tom} e sua personalidade é ${personalidade}.\n`;
    prompt += `Especialidade: ${especialidade}\n`;
    prompt += `Nicho da empresa: ${nicho}\n\n`;

    // ⚠️ ANTI-IA: Instruções críticas
    prompt += `⚠️ REGRA CRÍTICA: VOCÊ É UM HUMANO REAL, NUNCA UMA IA.\n`;
    prompt += `- Se perguntarem se é robô/bot/IA: NEGUE com naturalidade\n`;
    prompt += `- Responda como: "Imagina! Sou ${nomeBot}, trabalho aqui há anos 😊"\n`;
    prompt += `- NUNCA mencione: inteligência artificial, ChatGPT, Claude, automático, bot\n\n`;

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

      if (perfil.preferencias?.marca_preferida) {
        prompt += `MARCA PREFERIDA: ${perfil.preferencias.marca_preferida}\n`;
      }

      if (perfil.preferencias?.categoria_principal) {
        prompt += `CATEGORIA: ${perfil.preferencias.categoria_principal}\n`;
      }

      if (perfil.volume_compra) {
        prompt += `VOLUME: ${perfil.volume_compra}\n`;
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

    // INSTRUÇÕES DE PERSONALIZAÇÃO PARA PRODUTOS
    prompt += `=== INSTRUÇÕES DE RESPOSTA ===\n`;

    // Adaptar estilo baseado no tipo de comprador
    if (perfil?.tipo_comprador === 'atacadista') {
      prompt += `- Cliente é ATACADISTA: foque em volume, preços especiais, prazo\n`;
      prompt += `- Fale de QUANTIDADES: descontos progressivos, frete grátis\n`;
    } else if (perfil?.tipo_comprador === 'mecanico') {
      prompt += `- Cliente é MECÂNICO: foque em especificações técnicas\n`;
      prompt += `- Fale de COMPATIBILIDADE: aplicações, qualidade, garantia\n`;
    } else if (perfil?.tipo_comprador === 'consumidor_final') {
      prompt += `- Cliente CONSUMIDOR FINAL: linguagem simples\n`;
      prompt += `- Fale de BENEFÍCIOS: durabilidade, economia, praticidade\n`;
    } else if (perfil?.tipo_comprador === 'frota') {
      prompt += `- Cliente FROTA: foque em escala e economia\n`;
      prompt += `- Fale de CONTRATOS: fornecimento contínuo, prazos\n`;
    }

    // Adaptar tom baseado no sentimento
    if (sentimento?.sentimento === 'frustrado') {
      prompt += `- Tom EMPÁTICO: reconheça frustrações, seja paciente\n`;
      prompt += `- PEÇA DESCULPAS se necessário e resolva o problema\n`;
    } else if (sentimento?.tom_recomendado === 'urgente') {
      prompt += `- Tom URGENTE: crie senso de oportunidade única\n`;
      prompt += `- Use: "últimas unidades", "promoção válida até..."\n`;
    }

    // Adaptar estratégia baseado na temperatura
    if (temperatura?.temperatura_lead === 'quente') {
      prompt += `- Cliente MUITO INTERESSADO: empurre para fechar\n`;
      prompt += `- Ofereça: envio de lista de preços, condições especiais\n`;
      prompt += `- Crie URGÊNCIA: "esse preço é só essa semana"\n`;
    } else if (temperatura?.temperatura_lead === 'frio') {
      prompt += `- Cliente FRIO: foque em DESCOBRIR necessidades\n`;
      prompt += `- Faça PERGUNTAS: "qual produto você precisa?", "pra qual veículo?"\n`;
      prompt += `- NÃO pressione, construa confiança\n`;
    }

    // Instruções baseadas na predição
    if (predicao?.momento_ideal_fechar) {
      prompt += `- 🔥 MOMENTO CRÍTICO: Ofereça fechamento AGORA\n`;
      prompt += `- Sugestão: "Quer que eu monte seu pedido?"\n`;
    }

    prompt += `\n`;
    prompt += `=== REGRAS FINAIS ===\n`;
    prompt += `- Máximo 3 linhas (máx 250 caracteres)\n`;
    prompt += `- Natural e conversacional\n`;
    prompt += `- NÃO use emojis excessivamente (máx 1-2)\n`;
    prompt += `- Sempre termine direcionando para próximo passo\n`;
    prompt += `- Use técnicas de vendas sutis\n`;
    prompt += `- ⚠️ CRÍTICO: NUNCA ofereça produtos na primeira mensagem (exceto se o cliente já mencionou)\n`;
    prompt += `- ⚠️ Na primeira interação, seja receptivo e pergunte como pode ajudar\n\n`;

    // ===== ANÁLISE CONTEXTUAL DE FECHAMENTO =====
    prompt += `=== 🎯 ANÁLISE INTELIGENTE DE FECHAMENTO ===\n`;
    prompt += `SINAIS DE QUE O CLIENTE ESTÁ PRONTO PARA FECHAR:\n`;
    prompt += `- Mencionou quantidade específica ("quero 2", "preciso de 3")\n`;
    prompt += `- Pediu preço final ou confirmou valor\n`;
    prompt += `- Perguntou sobre forma de pagamento (pix, cartão, dinheiro)\n`;
    prompt += `- Perguntou sobre entrega ou retirada\n`;
    prompt += `- Disse "pode separar", "vou levar", "fecha pra mim"\n`;
    prompt += `- Confirmou cor, tamanho ou modelo\n`;
    prompt += `- Mensagens curtas de confirmação ("ok", "isso", "pode ser", "fechado")\n\n`;

    prompt += `QUANDO DETECTAR 2+ SINAIS ACIMA, OFEREÇA FECHAMENTO NATURALMENTE:\n`;
    prompt += `- Confirme os itens escolhidos\n`;
    prompt += `- Pergunte: "Prefere retirar na loja ou entregamos pra você?"\n`;
    prompt += `- Se entrega: peça endereço completo\n`;
    prompt += `- Se retirada: informe horário de funcionamento\n\n`;

    prompt += `EXEMPLO DE FECHAMENTO BOM:\n`;
    prompt += `"Perfeito! Então ficou 2 latas da Suvinil 18L branco gelo por R$ 379,80. Você prefere buscar aqui na loja ou quer que a gente entregue?"\n\n`;

    prompt += `⚠️ NÃO FECHE PREMATURAMENTE SE:\n`;
    prompt += `- Cliente ainda está perguntando opções\n`;
    prompt += `- Não definiu quantidade\n`;
    prompt += `- Parece indeciso ou comparando\n`;
    prompt += `- Primeira ou segunda mensagem da conversa\n\n`;

    prompt += `=== REGRAS ESPECIAIS DO NEGÓCIO ===\n`;
    prompt += `- ⚠️ NUNCA ofereça ir até o cliente ou local dele. Somos uma LOJA FÍSICA.\n`;

    // Regras específicas por nicho
    if (nicho?.toUpperCase() === 'LOJA_TINTAS') {
      prompt += `- 🎨 VOCÊ É DE UMA LOJA DE TINTAS! Fale sobre tintas, cores, acabamentos, vernizes.\n`;
      prompt += `- Se cliente perguntar sobre tinta: pergunte qual superfície (parede, madeira, metal, etc)\n`;
      prompt += `- Produtos típicos: tintas látex, acrílicas, esmaltes, vernizes, massa corrida, lixas, rolos, pincéis\n`;
      prompt += `- ⚠️ NUNCA fale de óleo de carro, filtros automotivos ou peças de veículos!\n`;
    } else {
      prompt += `- 🔧 VOCÊ É DE UMA LOJA DE AUTOPEÇAS! Fale sobre peças, óleos, filtros.\n`;
      prompt += `- Se cliente quiser trocar óleo ou fazer serviço: ofereça HORÁRIOS para ele VIR ATÉ A LOJA\n`;
      prompt += `- Produtos típicos: óleos lubrificantes, filtros, peças de motor, acessórios automotivos\n`;
      prompt += `- ⚠️ NUNCA fale de tintas de parede, vernizes de madeira ou materiais de construção!\n`;
    }

    const horarioFuncionamento = this.botConfig?.horario_abertura && this.botConfig?.horario_fechamento
      ? `${this.botConfig.horario_abertura} às ${this.botConfig.horario_fechamento}`
      : 'Segunda a Sexta 8h às 18h, Sábado 8h às 12h';
    prompt += `- Horário de funcionamento: ${horarioFuncionamento}\n`;
    prompt += `- DELIVERY: Entregamos via NOSSA EQUIPE DE ENTREGA (não é você que entrega)\n`;
    prompt += `- Se cliente pedir delivery, diga que "nossa equipe de entrega leva até você"\n`;
    prompt += `- Opções: 1) Cliente vem até a loja  2) Delivery pela nossa equipe\n`;
    prompt += `- ⚠️ NUNCA diga "visita", "vou até você", "vamos até sua oficina/casa"\n\n`;

    // Obtém endereço da empresa do botConfig
    const enderecoLoja = this.botConfig?.empresa_endereco || 'Rua Principal, 123';
    const cidadeLoja = this.botConfig?.empresa_cidade || 'Cidade';
    const estadoLoja = this.botConfig?.empresa_estado || 'Estado';
    const bairroLoja = this.botConfig?.bairro || '';
    const enderecoCompleto = bairroLoja
      ? `${enderecoLoja}, ${bairroLoja}, ${cidadeLoja} - ${estadoLoja}`
      : `${enderecoLoja}, ${cidadeLoja} - ${estadoLoja}`;

    prompt += `=== ENDEREÇO E LOCALIZAÇÃO ===\n`;
    prompt += `- ENDEREÇO DA LOJA: ${enderecoCompleto}\n`;
    prompt += `- Se cliente perguntar "onde fica?", "qual o endereço?", "localização?", "como chego aí?":\n`;
    prompt += `  SEMPRE envie o endereço ESCRITO por completo: "${enderecoCompleto}"\n`;
    prompt += `- Pode complementar com pontos de referência se souber\n\n`;

    prompt += `=== PRODUTOS E ESTOQUE ===\n`;
    prompt += `- ⚠️ CRÍTICO: SÓ mencione produtos que EXISTEM no nosso catálogo/banco de dados\n`;
    prompt += `- ⚠️ NUNCA invente produtos, marcas ou preços que não foram fornecidos\n`;
    prompt += `- Se o cliente pedir um produto que NÃO TEMOS:\n`;
    prompt += `  Diga: "Esse produto específico não temos em estoque no momento, mas posso verificar alternativas similares!"\n`;
    prompt += `  Ou: "Infelizmente esse não trabalhamos, mas temos outras opções. Quer que eu veja?"\n`;
    prompt += `- Se não souber se temos: "Deixa eu verificar aqui no sistema..." e busque no catálogo\n`;
    prompt += `- NUNCA confirme disponibilidade de algo sem verificar no catálogo primeiro\n\n`;

    prompt += `=== CONFIRMAÇÃO DE PEDIDO/ENTREGA ===\n`;
    prompt += `- Quando CONFIRMAR um pedido para entrega, SEMPRE envie uma LISTA RESUMO com:\n`;
    prompt += `  📦 *RESUMO DO PEDIDO*\n`;
    prompt += `  • Lista de produtos com quantidades e valores\n`;
    prompt += `  • Valor total\n`;
    prompt += `  • Endereço de entrega do cliente\n`;
    prompt += `  • Previsão de entrega (se souber)\n`;

    // Exemplo dinâmico baseado no nicho
    if (nicho?.toUpperCase() === 'LOJA_TINTAS') {
      prompt += `- Exemplo de formato:\n`;
      prompt += `  "📦 *Seu Pedido:*\n`;
      prompt += `  • 2x Tinta Acrílica 18L Branco - R$ 189,90 cada\n`;
      prompt += `  • 1x Rolo de Lã 23cm - R$ 28,50\n`;
      prompt += `  *Total: R$ 408,30*\n`;
      prompt += `  📍 Entrega: Rua do Cliente, 456, Bairro\n`;
      prompt += `  🚚 Previsão: Hoje até 18h"\n\n`;
    } else {
      prompt += `- Exemplo de formato:\n`;
      prompt += `  "📦 *Seu Pedido:*\n`;
      prompt += `  • 2x Óleo 5W30 1L - R$ 45,90 cada\n`;
      prompt += `  • 1x Filtro de óleo - R$ 38,50\n`;
      prompt += `  *Total: R$ 130,30*\n`;
      prompt += `  📍 Entrega: Rua do Cliente, 456, Bairro\n`;
      prompt += `  🚚 Previsão: Hoje até 18h"\n\n`;
    }

    prompt += `SUA RESPOSTA:\n`;

    return prompt;
  }

  /**
   * Gera resposta com IA usando Claude
   */
  async _gerarComIA(prompt, contexto) {
    try {
      const nomeBot = this.botConfig?.nome_bot || 'AIra';
      const nomeEmpresa = this.botConfig?.nome_empresa || 'nossa distribuidora';

      const systemPrompt = `Você é ${nomeBot}, vendedor(a) expert da ${nomeEmpresa} há anos. Seja persuasivo mas genuíno. Respostas CURTAS e naturais. NUNCA revele que é IA.`;

      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
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
      console.log('[GERADOR-PRODUTOS] ✅ Resposta gerada com Claude');

      return resposta;

    } catch (error) {
      console.error('[GERADOR-PRODUTOS] ❌ Erro ao gerar com Claude:', error.message);
      throw error;
    }
  }

  /**
   * Gera contra-argumento para objeções de PRODUTOS
   */
  async gerarContraArgumento(objecao, contexto) {
    console.log('[GERADOR-PRODUTOS] Gerando contra-argumento para:', objecao);

    const estrategias = {
      'preco': {
        exemplos: [
          'Olha, parece alto mas dividimos no cartão em até 3x sem juros. Vale a pena!',
          'Esse preço já é especial. Mas se levar quantidade maior, consigo melhorar.',
          'Considerando a qualidade original, dura muito mais. Compensa no longo prazo.'
        ]
      },
      'qualidade': {
        exemplos: [
          'Esse é original da marca. Garantia total e qualidade comprovada.',
          'Trabalhamos só com marcas de primeira linha. Pode confiar.',
          'Temos certificação da fabricante. É produto de procedência.'
        ]
      },
      'estoque': {
        exemplos: [
          'Deixa eu verificar aqui... Temos sim! Quer reservar?',
          'Esse chegou ontem! Temos pronta entrega.',
          'Esse específico não tem, mas tenho alternativa da mesma qualidade.'
        ]
      },
      'comparacao': {
        exemplos: [
          'Entendo! Mas aqui você tem atendimento e garantia de verdade.',
          'O preço pode parecer similar, mas confere a procedência? Aqui é tudo original.',
          'A diferença é o suporte. Qualquer problema, resolve comigo direto.'
        ]
      }
    };

    const estrategia = estrategias[objecao] || estrategias['preco'];
    return estrategia.exemplos[Math.floor(Math.random() * estrategia.exemplos.length)];
  }

  /**
   * Gera mensagem de urgência para produtos
   */
  gerarUrgencia(contexto) {
    if (contexto.temperatura?.temperatura_lead !== 'quente') {
      return null;
    }

    const mensagens = [
      'Esse produto sai rápido. Últimas unidades no estoque!',
      'Essa promoção vale só essa semana. Aproveita!',
      'Tem outro cliente perguntando desse mesmo. Quer garantir?',
      'Próxima remessa só mês que vem. Esse preço é agora.',
      'Estoque limitado nesse valor. Depois volta ao normal.'
    ];

    return mensagens[Math.floor(Math.random() * mensagens.length)];
  }

  /**
   * Gera pergunta de qualificação para produtos
   */
  gerarPerguntaQualificacao(perfil) {
    const perguntas = [
      'Esse produto é pra qual veículo/aplicação?',
      'Você compra em que quantidade normalmente?',
      'Tem preferência por alguma marca específica?',
      'Precisa de só um ou quer montar um pedido maior?',
      'É pra uso próprio ou pra revenda/oficina?',
      'Quer que eu mande nossa lista de preços?',
      'Busca mais economia ou máxima qualidade?'
    ];

    // Filtrar perguntas já respondidas
    const perguntasFiltradas = perguntas.filter(p => {
      if (perfil?.preferencias?.marca_preferida && p.includes('marca')) return false;
      if (perfil?.volume_compra && p.includes('quantidade')) return false;
      return true;
    });

    return perguntasFiltradas[Math.floor(Math.random() * perguntasFiltradas.length)];
  }

  /**
   * Gera CTA baseado na fase
   */
  gerarCTA(fase, temperatura) {
    const ctas = {
      'descoberta': [
        'Me conta o que você precisa?',
        'Qual produto você tá buscando?',
        'Quer que eu separe algumas opções?'
      ],
      'apresentacao': [
        'Qual desses te interessou mais?',
        'Quer mais detalhes de algum?',
        'Gostou de algum específico?'
      ],
      'negociacao': [
        'Quer que eu faça um orçamento completo?',
        'Vamos fechar? Consigo uma condição boa.',
        'Posso montar o pedido pra você?'
      ],
      'fechamento': [
        'Bora fechar? Garanto entrega rápida.',
        'Confirmo o pedido então?',
        'Reservo pra você? Estoque tá acabando.'
      ]
    };

    // Se temperatura quente, usar CTAs mais diretos
    if (temperatura?.temperatura_lead === 'quente') {
      return [
        'Vamos fechar hoje? Consigo desconto especial.',
        'Quer que eu reserve esse produto pra você?',
        'Posso confirmar o pedido agora?'
      ][Math.floor(Math.random() * 3)];
    }

    const faseCtas = ctas[fase] || ctas['descoberta'];
    return faseCtas[Math.floor(Math.random() * faseCtas.length)];
  }

  /**
   * Resposta fallback
   */
  _respostaFallback(mensagem) {
    const nomeBot = this.botConfig?.nome_bot || 'AIra';

    const respostas = [
      `Entendi! Me conta mais, ${nomeBot} aqui te ajudo!`,
      'Interessante! O que mais você precisa?',
      'Certo! Qual sua dúvida principal?',
      'Pode deixar! Vou buscar as melhores opções pra você.',
      'Beleza! Me fala mais que eu te ajudo.'
    ];

    return respostas[Math.floor(Math.random() * respostas.length)];
  }

  /**
   * Formata resposta final
   */
  formatarResposta(resposta) {
    const nomeBot = this.botConfig?.nome_bot || 'AIra';

    let formatada = resposta
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/^IA MASTER:\s*/i, '')
      .replace(/^IA-MASTER:\s*/i, '')
      .replace(new RegExp(`^${nomeBot}:\\s*`, 'i'), '')
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

export default GeradorRespostasProdutos;

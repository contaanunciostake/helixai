/**
 * 🧠 MÓDULO 9: ANALISADOR DE COERÊNCIA CONTEXTUAL - PRODUTOS (ATACADO/VAREJO)
 *
 * Este módulo dá "capacidade de pensar" analisando o contexto
 * e gerando orientações inteligentes (não regras rígidas).
 *
 * OBJETIVO: Agir com coerência contextual exata focada em persuasão nas vendas de PRODUTOS
 */

import Anthropic from '@anthropic-ai/sdk';

export class AnalisadorCoerenciaProdutos {
  constructor(anthropicKey, botConfig = {}) {
    this.anthropic = new Anthropic({ apiKey: anthropicKey });
    this.botConfig = botConfig;
  }

  atualizarConfig(botConfig) {
    this.botConfig = botConfig;
  }

  /**
   * Analisa o contexto e gera orientações inteligentes para a próxima resposta
   */
  async analisar(mensagemAtual, historico, contextoExtra = {}) {
    try {
      console.log('[COERENCIA-PRODUTOS] Analisando contexto para gerar orientações...');

      const resumoConversa = this._prepararResumo(historico, mensagemAtual, contextoExtra);

      const prompt = `Você é um especialista em análise de contexto de vendas de PRODUTOS (distribuidora/atacado). Analise esta conversa e identifique o que o vendedor DEVE e NÃO DEVE fazer na próxima resposta.

${resumoConversa}

TAREFA:
Analise o contexto e retorne APENAS um JSON com orientações inteligentes:

{
  "informacoes_ja_coletadas": {
    "tem_produto_interesse": boolean,
    "produto_especifico": string ou null,
    "categoria_interesse": string ou null,
    "marca_preferida": string ou null,
    "aplicacao_veiculo": string ou null,
    "quantidade_interesse": string ou null,
    "tipo_cliente": "atacadista" | "varejista" | "mecanico" | "consumidor" | "frota" | null,
    "ja_recebeu_precos": boolean,
    "ja_recebeu_opcoes": boolean
  },
  "proxima_acao_inteligente": {
    "acao": string,
    "justificativa": string,
    "tom_recomendado": string,
    "urgencia": "baixa" | "media" | "alta"
  },
  "alertas_criticos": [
    // Lista de coisas que NÃO fazer (evitar incoerências)
  ],
  "oportunidades_persuasao": [
    // Lista de oportunidades de persuasão baseadas no contexto
  ]
}

REGRAS:
- Seja preciso na identificação do que JÁ foi coletado
- Identifique lacunas de informação sobre PRODUTOS
- Sugira ação mais coerente com o estágio da conversa
- Identifique potenciais incoerências (ex: oferecer produto sem saber aplicação)
- Retorne APENAS JSON válido`;

      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
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

      const analise = JSON.parse(jsonMatch[0]);

      console.log('[COERENCIA-PRODUTOS] ✓ Análise concluída');
      console.log('[COERENCIA-PRODUTOS] Ação recomendada:', analise.proxima_acao_inteligente.acao);
      console.log('[COERENCIA-PRODUTOS] Alertas críticos:', analise.alertas_criticos.length);

      return analise;

    } catch (error) {
      console.error('[COERENCIA-PRODUTOS] Erro:', error.message);
      return this._analisePadrao();
    }
  }

  /**
   * Prepara resumo estruturado da conversa de PRODUTOS
   */
  _prepararResumo(historico, mensagemAtual, contextoExtra) {
    let resumo = `ANÁLISE DE CONTEXTO DE VENDAS DE PRODUTOS:\n\n`;

    resumo += `MENSAGEM ATUAL DO CLIENTE:\n"${mensagemAtual}"\n\n`;

    if (historico && historico.length > 0) {
      resumo += `HISTÓRICO DA CONVERSA (últimas ${Math.min(historico.length, 10)} mensagens):\n`;
      const ultimasMensagens = historico.slice(-10);
      ultimasMensagens.forEach((h, idx) => {
        resumo += `${idx + 1}. ${h.role}: "${h.msg}"\n`;
      });
      resumo += '\n';
    } else {
      resumo += `HISTÓRICO: Primeira mensagem\n\n`;
    }

    if (contextoExtra.produtoInteresse) {
      resumo += `PRODUTO DE INTERESSE:\n`;
      resumo += `- Nome: ${contextoExtra.produtoInteresse.nome}\n`;
      resumo += `- Preço: R$ ${contextoExtra.produtoInteresse.preco}\n`;
      resumo += `- Categoria: ${contextoExtra.produtoInteresse.categoria || 'N/D'}\n`;
      resumo += `- Marca: ${contextoExtra.produtoInteresse.marca || 'N/D'}\n`;
      resumo += '\n';
    }

    if (contextoExtra.temperatura) {
      resumo += `TEMPERATURA DO LEAD: ${contextoExtra.temperatura.temperatura_lead} (${contextoExtra.temperatura.score_temperatura}/100)\n\n`;
    }

    if (contextoExtra.sentimento) {
      resumo += `SENTIMENTO: ${contextoExtra.sentimento.sentimento}\n`;
      resumo += `NÍVEL DE INTERESSE: ${contextoExtra.sentimento.nivel_interesse}\n\n`;
    }

    if (contextoExtra.perfil) {
      resumo += `PERFIL DO CLIENTE:\n`;
      resumo += `- Tipo: ${contextoExtra.perfil.tipo_comprador || 'indefinido'}\n`;
      resumo += `- Volume: ${contextoExtra.perfil.volume_compra || 'indefinido'}\n`;
      if (contextoExtra.perfil.preferencias?.marca_preferida) {
        resumo += `- Marca preferida: ${contextoExtra.perfil.preferencias.marca_preferida}\n`;
      }
      resumo += '\n';
    }

    return resumo;
  }

  /**
   * Análise padrão em caso de erro
   */
  _analisePadrao() {
    return {
      informacoes_ja_coletadas: {
        tem_produto_interesse: false,
        produto_especifico: null,
        categoria_interesse: null,
        marca_preferida: null,
        aplicacao_veiculo: null,
        quantidade_interesse: null,
        tipo_cliente: null,
        ja_recebeu_precos: false,
        ja_recebeu_opcoes: false
      },
      proxima_acao_inteligente: {
        acao: 'descobrir_necessidades',
        justificativa: 'Informações insuficientes, precisa descobrir necessidades do cliente',
        tom_recomendado: 'consultivo',
        urgencia: 'media'
      },
      alertas_criticos: [
        'Não assuma informações que o cliente não forneceu',
        'Não ofereça produtos sem saber a aplicação/necessidade'
      ],
      oportunidades_persuasao: []
    };
  }

  /**
   * Gera instruções contextuais inteligentes para prompt
   */
  gerarInstrucoesContextuais(analise) {
    let instrucoes = `\n\n🧠 ANÁLISE CONTEXTUAL INTELIGENTE:\n\n`;

    // Informações já coletadas
    instrucoes += `📊 INFORMAÇÕES JÁ COLETADAS DO CLIENTE:\n`;
    const info = analise.informacoes_ja_coletadas;

    if (info.tem_produto_interesse) {
      instrucoes += `✅ Produto de interesse: ${info.produto_especifico}\n`;
    } else {
      instrucoes += `❌ Produto de interesse: NÃO DEFINIDO\n`;
    }

    if (info.categoria_interesse) {
      instrucoes += `✅ Categoria: ${info.categoria_interesse}\n`;
    } else {
      instrucoes += `❌ Categoria: NÃO INFORMADA\n`;
    }

    if (info.marca_preferida) {
      instrucoes += `✅ Marca preferida: ${info.marca_preferida}\n`;
    } else {
      instrucoes += `❌ Marca preferida: NÃO INFORMADA\n`;
    }

    if (info.aplicacao_veiculo) {
      instrucoes += `✅ Aplicação/Veículo: ${info.aplicacao_veiculo}\n`;
    } else {
      instrucoes += `❌ Aplicação/Veículo: NÃO INFORMADO\n`;
    }

    if (info.tipo_cliente) {
      instrucoes += `✅ Tipo cliente: ${info.tipo_cliente}\n`;
    }

    if (info.quantidade_interesse) {
      instrucoes += `✅ Quantidade: ${info.quantidade_interesse}\n`;
    }

    if (info.ja_recebeu_precos) {
      instrucoes += `✅ Preços: JÁ RECEBIDOS\n`;
    }

    if (info.ja_recebeu_opcoes) {
      instrucoes += `✅ Opções: JÁ APRESENTADAS\n`;
    }

    // Próxima ação inteligente
    instrucoes += `\n🎯 PRÓXIMA AÇÃO RECOMENDADA:\n`;
    instrucoes += `- Ação: ${analise.proxima_acao_inteligente.acao}\n`;
    instrucoes += `- Justificativa: ${analise.proxima_acao_inteligente.justificativa}\n`;
    instrucoes += `- Tom: ${analise.proxima_acao_inteligente.tom_recomendado}\n`;
    instrucoes += `- Urgência: ${analise.proxima_acao_inteligente.urgencia}\n`;

    // Alertas críticos
    if (analise.alertas_criticos.length > 0) {
      instrucoes += `\n⚠️ ALERTAS CRÍTICOS (NÃO FAÇA ISSO!):\n`;
      analise.alertas_criticos.forEach(alerta => {
        instrucoes += `- ❌ ${alerta}\n`;
      });
    }

    // Oportunidades de persuasão
    if (analise.oportunidades_persuasao.length > 0) {
      instrucoes += `\n💡 OPORTUNIDADES DE PERSUASÃO:\n`;
      analise.oportunidades_persuasao.forEach(oportunidade => {
        instrucoes += `- ✅ ${oportunidade}\n`;
      });
    }

    instrucoes += `\n⚡ IMPORTANTE: Use essas informações para agir com COERÊNCIA CONTEXTUAL. Não pergunte o que o cliente já informou. Não assuma o que ele não disse.\n`;

    return instrucoes;
  }
}

export default AnalisadorCoerenciaProdutos;

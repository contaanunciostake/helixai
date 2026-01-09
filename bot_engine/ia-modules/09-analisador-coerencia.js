/**
 * 🧠 MÓDULO 9: ANALISADOR DE COERÊNCIA CONTEXTUAL
 *
 * Este módulo dá "capacidade de pensar" à Aira analisando o contexto
 * e gerando orientações inteligentes (não regras rígidas).
 *
 * OBJETIVO: Fazer a Aira agir com coerência contextual exata focada em persuasão nas vendas
 */

import Anthropic from '@anthropic-ai/sdk';

export class AnalisadorCoerencia {
  constructor(anthropicKey) {
    this.anthropic = new Anthropic({ apiKey: anthropicKey });
  }

  /**
   * Analisa o contexto e gera orientações inteligentes para a próxima resposta
   * @param {string} mensagemAtual - Mensagem atual do cliente
   * @param {Array} historico - Histórico completo da conversa
   * @param {Object} contextoExtra - Contexto adicional (veículo de interesse, fotos enviadas, etc)
   * @returns {Object} Orientações contextuais
   */
  async analisar(mensagemAtual, historico, contextoExtra = {}) {
    try {
      console.log('[COERENCIA] Analisando contexto para gerar orientações...');

      // Preparar resumo da conversa
      const resumoConversa = this._prepararResumo(historico, mensagemAtual, contextoExtra);

      const prompt = `Você é um especialista em análise de contexto de vendas. Analise esta conversa e identifique o que o vendedor DEVE e NÃO DEVE fazer na próxima resposta.

${resumoConversa}

TAREFA:
Analise o contexto e retorne APENAS um JSON com orientações inteligentes:

{
  "informacoes_ja_coletadas": {
    "tem_orcamento": boolean,
    "valor_orcamento": string ou null,
    "tem_entrada": boolean,
    "tipo_entrada": "dinheiro" | "veiculo" | "nao_definido" | null,
    "valor_entrada": string ou null,
    "veiculo_interesse_definido": boolean,
    "ja_viu_fotos": boolean,
    "ja_recebeu_simulacao": boolean
  },
  "proxima_acao_inteligente": {
    "acao": string, // Ex: "perguntar_sobre_entrada", "simular_financiamento", "aprofundar_interesse"
    "justificativa": string,
    "tom_recomendado": string, // Ex: "consultivo", "persuasivo", "empático"
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
- Identifique lacunas de informação
- Sugira ação mais coerente com o estágio da conversa
- Identifique potenciais incoerências (ex: oferecer entrada sem perguntar)
- Retorne APENAS JSON válido`;

      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        temperature: 0.3, // Baixa temperatura para análise precisa
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      // Extrair JSON da resposta
      let respostaTexto = response.content[0].text.trim();
      respostaTexto = respostaTexto.replace(/```json\n?/g, '').replace(/```\n?/g, '');

      const jsonMatch = respostaTexto.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Resposta não contém JSON válido');
      }

      const analise = JSON.parse(jsonMatch[0]);

      console.log('[COERENCIA] ✓ Análise concluída');
      console.log('[COERENCIA] Ação recomendada:', analise.proxima_acao_inteligente.acao);
      console.log('[COERENCIA] Alertas críticos:', analise.alertas_criticos.length);

      return analise;

    } catch (error) {
      console.error('[COERENCIA] Erro:', error.message);
      return this._analisePadrao();
    }
  }

  /**
   * Prepara resumo estruturado da conversa
   */
  _prepararResumo(historico, mensagemAtual, contextoExtra) {
    let resumo = `ANÁLISE DE CONTEXTO DE VENDAS:\n\n`;

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

    if (contextoExtra.veiculoInteresse) {
      resumo += `VEÍCULO DE INTERESSE:\n`;
      resumo += `- Nome: ${contextoExtra.veiculoInteresse.nome}\n`;
      resumo += `- Preço: R$ ${contextoExtra.veiculoInteresse.preco}\n`;
      resumo += `- Fotos enviadas: ${contextoExtra.fotosEnviadas ? 'SIM' : 'NÃO'}\n`;
      if (contextoExtra.fotosEnviadas && contextoExtra.tempoFotos) {
        resumo += `- Tempo desde envio de fotos: ${Math.floor(contextoExtra.tempoFotos / 1000)}s\n`;
      }
      resumo += '\n';
    }

    if (contextoExtra.temperatura) {
      resumo += `TEMPERATURA DO LEAD: ${contextoExtra.temperatura.temperatura_lead} (${contextoExtra.temperatura.score_temperatura}/100)\n\n`;
    }

    if (contextoExtra.sentimento) {
      resumo += `SENTIMENTO: ${contextoExtra.sentimento.sentimento}\n`;
      resumo += `NÍVEL DE INTERESSE: ${contextoExtra.sentimento.nivel_interesse}\n\n`;
    }

    return resumo;
  }

  /**
   * Análise padrão em caso de erro
   */
  _analisePadrao() {
    return {
      informacoes_ja_coletadas: {
        tem_orcamento: false,
        valor_orcamento: null,
        tem_entrada: false,
        tipo_entrada: null,
        valor_entrada: null,
        veiculo_interesse_definido: false,
        ja_viu_fotos: false,
        ja_recebeu_simulacao: false
      },
      proxima_acao_inteligente: {
        acao: 'descobrir_necessidades',
        justificativa: 'Informações insuficientes, precisa descobrir necessidades do cliente',
        tom_recomendado: 'consultivo',
        urgencia: 'media'
      },
      alertas_criticos: [
        'Não assuma informações que o cliente não forneceu'
      ],
      oportunidades_persuasao: []
    };
  }

  /**
   * Gera instruções contextuais inteligentes para o prompt do MotorGPT
   */
  gerarInstrucoesContextuais(analise) {
    let instrucoes = `\n\n🧠 ANÁLISE CONTEXTUAL INTELIGENTE:\n\n`;

    // Informações já coletadas
    instrucoes += `📊 INFORMAÇÕES JÁ COLETADAS DO CLIENTE:\n`;
    const info = analise.informacoes_ja_coletadas;

    if (info.tem_orcamento) {
      instrucoes += `✅ Orçamento: ${info.valor_orcamento}\n`;
    } else {
      instrucoes += `❌ Orçamento: NÃO INFORMADO\n`;
    }

    if (info.tem_entrada) {
      instrucoes += `✅ Entrada: ${info.tipo_entrada} - ${info.valor_entrada}\n`;
    } else {
      instrucoes += `❌ Entrada: NÃO INFORMADO\n`;
    }

    if (info.veiculo_interesse_definido) {
      instrucoes += `✅ Veículo de interesse: DEFINIDO\n`;
    } else {
      instrucoes += `❌ Veículo de interesse: NÃO DEFINIDO\n`;
    }

    if (info.ja_viu_fotos) {
      instrucoes += `✅ Fotos: JÁ VISUALIZADAS\n`;
    }

    if (info.ja_recebeu_simulacao) {
      instrucoes += `✅ Simulação: JÁ RECEBIDA\n`;
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

export default AnalisadorCoerencia;

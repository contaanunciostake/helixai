/**
 * ✂️ MÓDULO 11: VALIDADOR DE COMPLETUDE DE RESPOSTAS
 *
 * Valida se respostas geradas estão completas e não foram cortadas
 * Se detectar corte, completa a resposta automaticamente
 *
 * OBJETIVO: Evitar mensagens cortadas como "Semana pa..."
 */

import Anthropic from '@anthropic-ai/sdk';

export class ValidadorCompletude {
  constructor(anthropicKey) {
    this.anthropic = new Anthropic({ apiKey: anthropicKey });
  }

  /**
   * Valida se uma resposta está completa
   * @param {string} resposta - Resposta gerada
   * @returns {Object} { completa: boolean, problemas: array }
   */
  validarCompletude(resposta) {
    const problemas = [];

    // 1. Verificar se termina no meio de uma palavra
    if (/[a-záàâãéèêíïóôõöúçñ]$/i.test(resposta.trim())) {
      problemas.push('Termina no meio de uma palavra');
    }

    // 2. Verificar se termina com pontuação incompleta
    const ultimoChar = resposta.trim().slice(-1);
    const pontuacaoValida = ['.', '!', '?', '😊', '😄', '😍', '🔥', '💰', '✨', '👍'];

    // Se não termina com pontuação válida ou emoji, pode estar cortada
    if (!pontuacaoValida.some(p => resposta.trim().endsWith(p))) {
      // Verificar se não é apenas uma palavra solta (como "Oi!")
      if (resposta.trim().split(' ').length > 3) {
        problemas.push('Não termina com pontuação válida');
      }
    }

    // 3. Verificar se tem abertura sem fechamento
    const abreParenteses = (resposta.match(/\(/g) || []).length;
    const fechaParenteses = (resposta.match(/\)/g) || []).length;
    if (abreParenteses > fechaParenteses) {
      problemas.push('Parênteses não fechado');
    }

    // 4. Verificar se tem aspas não fechadas
    const aspas = (resposta.match(/"/g) || []).length;
    if (aspas % 2 !== 0) {
      problemas.push('Aspas não fechadas');
    }

    // 5. Verificar frases claramente incompletas
    const palavrasIncompletas = [
      /\bpa$/i,        // "Semana pa"
      /\bpo$/i,        // "Depois po"
      /\bqu$/i,        // "Porque qu"
      /\bpr$/i,        // "Pra pr"
      /\bse$/i,        // "Você se"
      /\s[a-z]{1,2}$/i, // Termina com 1-2 letras após espaço
    ];

    for (const padrao of palavrasIncompletas) {
      if (padrao.test(resposta.trim())) {
        problemas.push('Palavra claramente incompleta no final');
        break;
      }
    }

    return {
      completa: problemas.length === 0,
      problemas
    };
  }

  /**
   * Completa uma resposta que foi cortada
   * @param {string} respostaCortada - Resposta incompleta
   * @param {Object} contexto - Contexto da conversa
   * @returns {string} Resposta completa
   */
  async completarResposta(respostaCortada, contexto = {}) {
    console.log('[VALIDADOR] Completando resposta cortada...');

    try {
      const prompt = `Você é a Aira, uma vendedora de carros. Esta resposta foi cortada no meio e precisa ser completada de forma natural.

RESPOSTA CORTADA:
"${respostaCortada}"

CONTEXTO:
${contexto.mensagemCliente ? `Mensagem do cliente: "${contexto.mensagemCliente}"` : ''}
${contexto.veiculoInteresse ? `Veículo de interesse: ${contexto.veiculoInteresse}` : ''}

TAREFA:
Complete a resposta de forma natural e coerente. A resposta deve:
1. Manter o tom e estilo da Aira (informal, amigável, com emojis ocasionais)
2. Completar a última frase que foi cortada
3. Finalizar de forma natural (não precisa adicionar muito texto, apenas completar)
4. Terminar com pontuação adequada

Retorne APENAS a resposta COMPLETA (desde o início), sem explicações adicionais.`;

      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 500, // Suficiente para completar
        temperature: 0.7,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const respostaCompleta = response.content[0].text.trim();

      console.log('[VALIDADOR] ✓ Resposta completada');
      console.log(`  Original (cortada): "${respostaCortada.slice(-50)}..."`);
      console.log(`  Completa: "${respostaCompleta.slice(-50)}..."`);

      return respostaCompleta;

    } catch (error) {
      console.error('[VALIDADOR] Erro ao completar:', error.message);

      // Fallback: adicionar ponto final se não tiver pontuação
      if (!/[.!?]$/.test(respostaCortada.trim())) {
        return respostaCortada.trim() + '.';
      }

      return respostaCortada;
    }
  }

  /**
   * Valida e corrige uma resposta automaticamente
   * @param {string} resposta - Resposta a validar
   * @param {Object} contexto - Contexto para completar se necessário
   * @returns {Object} { resposta: string, foiCorrigida: boolean }
   */
  async validarECorrigir(resposta, contexto = {}) {
    const validacao = this.validarCompletude(resposta);

    if (validacao.completa) {
      console.log('[VALIDADOR] ✅ Resposta completa, nenhuma correção necessária');
      return {
        resposta,
        foiCorrigida: false
      };
    }

    console.log('[VALIDADOR] ⚠️ Resposta incompleta detectada!');
    console.log(`  Problemas: ${validacao.problemas.join(', ')}`);

    // Completar resposta
    const respostaCompleta = await this.completarResposta(resposta, contexto);

    return {
      resposta: respostaCompleta,
      foiCorrigida: true,
      problemasOriginais: validacao.problemas
    };
  }
}

export default ValidadorCompletude;

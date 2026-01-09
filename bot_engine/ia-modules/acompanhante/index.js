/**
 * Módulo Acompanhante +18
 *
 * Sistema completo de IA para:
 * - Venda de conteúdo adulto
 * - Agendamento de encontros
 * - Persuasão e fechamento
 */

// Exportar todos os módulos
export { default as iaMaster, IAMasterAcompanhante } from './00-ia-master.js';
export { default as analisadorIntencoes } from './01-analisador-intencoes.js';
export { default as personalidade } from './02-personalidade-sedutora.js';
export { default as analisadorSentimento } from './03-analisador-sentimento.js';
export { default as memoriaContexto } from './04-memoria-contexto.js';
export { default as agendamentoEncontros } from './05-agendamento-encontros.js';
export { default as geradorRespostas } from './06-gerador-respostas.js';
export { default as preditorFechamento } from './07-preditor-fechamento.js';

// Exportar instância configurável
import { IAMasterAcompanhante } from './00-ia-master.js';

/**
 * Cria instância do bot com configuração personalizada
 *
 * @param {Object} config - Configuração do bot
 * @param {string} config.nome - Nome da acompanhante (ex: "Luna")
 * @param {string} config.cidade - Cidade de atendimento
 * @param {Object} config.valores - Tabela de valores
 * @returns {IAMasterAcompanhante}
 *
 * @example
 * const bot = criarBot({
 *   nome: 'Sofia',
 *   cidade: 'Rio de Janeiro',
 *   valores: {
 *     encontro_1h: 600,
 *     encontro_2h: 1000,
 *     pernoite: 2000
 *   }
 * });
 *
 * const resultado = await bot.processarMensagem('5511999999999', 'Oi');
 * console.log(resultado.resposta);
 */
export function criarBot(config = {}) {
  return new IAMasterAcompanhante(config);
}

// Exportação padrão
export default {
  criarBot,
  IAMasterAcompanhante
};

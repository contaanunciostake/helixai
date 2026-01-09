/**
 * Módulo Loja de Tintas - Índice
 * Exporta todos os módulos de IA para tintas
 * VendeAI - Sistema de Automação WhatsApp com IA
 */

const TintasMaster = require('./00-tintas-master');
const AnalisadorIntencoesTintas = require('./01-analisador-intencoes-tintas');
const RecomendadorTintas = require('./02-recomendador-tintas');
const CalculadoraRendimento = require('./03-calculadora-rendimento');
const ConsultorCores = require('./04-consultor-cores');
const GeradorOrcamento = require('./05-gerador-orcamento');
const PersonalidadeLaura = require('./06-personalidade-laura');
const GeradorRespostasTintas = require('./07-gerador-respostas-tintas');

module.exports = {
    TintasMaster,
    AnalisadorIntencoesTintas,
    RecomendadorTintas,
    CalculadoraRendimento,
    ConsultorCores,
    GeradorOrcamento,
    PersonalidadeLaura,
    GeradorRespostasTintas
};

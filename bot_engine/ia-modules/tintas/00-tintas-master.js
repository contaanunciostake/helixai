/**
 * Orquestrador Mestre - Módulo Loja de Tintas
 * Gerencia todos os módulos de IA específicos para vendas de tintas
 * VendeAI - Sistema de Automação WhatsApp com IA
 */

import AnalisadorIntencoesTintas from './01-analisador-intencoes-tintas.js';
import RecomendadorTintas from './02-recomendador-tintas.js';
import CalculadoraRendimento from './03-calculadora-rendimento.js';
import ConsultorCores from './04-consultor-cores.js';
import GeradorOrcamento from './05-gerador-orcamento.js';
import PersonalidadeLaura from './06-personalidade-laura.js';
import GeradorRespostasTintas from './07-gerador-respostas-tintas.js';

class TintasMaster {
    constructor(config) {
        this.config = config;
        this.empresaId = config.empresaId;
        this.nomeAtendente = config.nomeAtendente || 'Laura';
        this.nomeLoja = config.nomeLoja || 'nossa loja';

        console.log(`[TintasMaster] Inicializando módulo de tintas para empresa ${this.empresaId}`);
        console.log(`[TintasMaster] Atendente: ${this.nomeAtendente}`);

        // Inicializar módulos
        this.analisador = new AnalisadorIntencoesTintas(config);
        this.recomendador = new RecomendadorTintas(config);
        this.calculadora = new CalculadoraRendimento(config);
        this.consultorCores = new ConsultorCores(config);
        this.geradorOrcamento = new GeradorOrcamento(config);
        this.personalidade = new PersonalidadeLaura(config);
        this.geradorRespostas = new GeradorRespostasTintas(config);
    }

    /**
     * Processa mensagem do cliente
     * @param {string} mensagem - Mensagem recebida
     * @param {object} contexto - Contexto da conversa
     * @returns {object} - Resposta formatada
     */
    async processarMensagem(mensagem, contexto = {}) {
        console.log(`[TintasMaster] ========================================`);
        console.log(`[TintasMaster] Processando: "${mensagem.substring(0, 100)}..."`);

        try {
            // 1. Analisar intenção
            const intencao = await this.analisador.analisar(mensagem, contexto);
            console.log(`[TintasMaster] Intenção detectada: ${intencao.tipo} (${(intencao.confianca * 100).toFixed(0)}%)`);

            let resposta;
            let dados = {};

            // 2. Rotear para módulo apropriado
            switch (intencao.tipo) {
                case 'BUSCAR_PRODUTO':
                    console.log(`[TintasMaster] Buscando produtos...`);
                    resposta = await this.recomendador.buscarProdutos(intencao.parametros);
                    dados = resposta.produtos || [];
                    break;

                case 'CALCULAR_QUANTIDADE':
                    console.log(`[TintasMaster] Calculando quantidade...`);
                    resposta = await this.calculadora.calcular(intencao.parametros);
                    dados = resposta.calculo || {};
                    break;

                case 'CONSULTAR_COR':
                    console.log(`[TintasMaster] Consultando cores...`);
                    resposta = await this.consultorCores.sugerir(intencao.parametros);
                    dados = resposta.cores_sugeridas || [];
                    break;

                case 'SOLICITAR_ORCAMENTO':
                    console.log(`[TintasMaster] Gerando orçamento...`);
                    resposta = await this.geradorOrcamento.gerar(contexto);
                    dados = resposta.orcamento || {};
                    break;

                case 'DUVIDA_TECNICA':
                    console.log(`[TintasMaster] Respondendo dúvida técnica...`);
                    resposta = await this.geradorRespostas.responderDuvidaTecnica(mensagem);
                    break;

                case 'SAUDACAO':
                    console.log(`[TintasMaster] Gerando saudação...`);
                    resposta = await this.personalidade.saudacao(contexto);
                    break;

                case 'COMPARAR_PRODUTOS':
                    console.log(`[TintasMaster] Comparando produtos...`);
                    resposta = await this.recomendador.compararProdutos(intencao.parametros);
                    break;

                case 'PRECO':
                    console.log(`[TintasMaster] Informando preços...`);
                    resposta = await this.recomendador.informarPrecos(intencao.parametros);
                    break;

                case 'ENTREGA':
                    console.log(`[TintasMaster] Informando sobre entrega...`);
                    resposta = await this.geradorRespostas.informarEntrega(contexto);
                    break;

                case 'DESPEDIDA':
                    console.log(`[TintasMaster] Gerando despedida...`);
                    resposta = await this.personalidade.despedida(contexto);
                    break;

                default:
                    console.log(`[TintasMaster] Gerando resposta genérica...`);
                    resposta = await this.geradorRespostas.gerarResposta(mensagem, contexto, intencao);
            }

            // 3. Aplicar personalidade
            let textoFinal;
            if (typeof resposta === 'string') {
                textoFinal = resposta;
            } else if (resposta && resposta.texto) {
                textoFinal = resposta.texto;
            } else {
                textoFinal = 'Me desculpa, tive um probleminha aqui. Pode repetir?';
            }

            textoFinal = await this.personalidade.aplicar(textoFinal, contexto);

            console.log(`[TintasMaster] Resposta gerada: ${textoFinal.substring(0, 100)}...`);
            console.log(`[TintasMaster] ========================================`);

            return {
                texto: textoFinal,
                intencao: intencao.tipo,
                confianca: intencao.confianca,
                dados: dados,
                precisaInfo: resposta?.precisaInfo || false
            };

        } catch (error) {
            console.error(`[TintasMaster] ERRO: ${error.message}`);
            console.error(error.stack);

            return {
                texto: `Ops, tive um probleminha técnico! 😅 Pode repetir sua pergunta? - ${this.nomeAtendente}`,
                intencao: 'ERRO',
                erro: error.message
            };
        }
    }

    /**
     * Obtém configuração do módulo
     */
    getConfig() {
        return {
            empresaId: this.empresaId,
            nomeAtendente: this.nomeAtendente,
            nomeLoja: this.nomeLoja,
            modulosAtivos: {
                analisador: true,
                recomendador: true,
                calculadora: true,
                consultorCores: true,
                geradorOrcamento: true,
                personalidade: true
            }
        };
    }
}

export { TintasMaster };
export default TintasMaster;

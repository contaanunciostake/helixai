/**
 * Analisador de Intenções - Loja de Tintas
 * Detecta o que o cliente deseja: buscar produto, calcular, cores, orçamento
 * VendeAI - Sistema de Automação WhatsApp com IA
 */

class AnalisadorIntencoesTintas {
    constructor(config) {
        this.config = config;

        // Padrões de intenção
        this.padroes = {
            SAUDACAO: [
                /^(oi|olá|ola|hey|eai|bom dia|boa tarde|boa noite|salve|opa)/i,
                /tudo bem|como vai|td bem/i
            ],
            BUSCAR_PRODUTO: [
                /procur(o|ando)|quero|preciso|tem|vocês tem|vcs tem/i,
                /tinta (acrílica|acrilica|látex|latex|esmalte|verniz)/i,
                /marca (suvinil|coral|sherwin|lukscolor)/i
            ],
            CALCULAR_QUANTIDADE: [
                /quantos? litros?|quanto(s)? (de )?tinta/i,
                /(\d+)\s*(m²|m2|metros?|metro quadrado)/i,
                /calcul(a|ar|e)|quantidad(e)?/i,
                /quarto|sala|cozinha|banheiro|fachada/i
            ],
            CONSULTAR_COR: [
                /cor(es)?|tonalidad(e)?|paleta/i,
                /combin(a|ar|ação)|sugest(ão|ao)|tendência|tendencia/i,
                /que cor|qual cor/i,
                /branco|bege|azul|verde|rosa|cinza|amarelo/i
            ],
            SOLICITAR_ORCAMENTO: [
                /orçamento|orcamento|valor total|quanto fica/i,
                /preço final|preco final|fechamento/i,
                /quero comprar|fechar|confirmar/i
            ],
            DUVIDA_TECNICA: [
                /como (aplic|pass|pint|prepar)/i,
                /demão|demaos|secagem|diluição|diluir/i,
                /pode usar|serve para|funciona/i,
                /diferença entre|qual (a )?melhor/i,
                /rendimento|cobertura/i
            ],
            PRECO: [
                /quanto custa|preço|preco|valor/i,
                /lata|galão|litro|18l|3\.?6l/i
            ],
            ENTREGA: [
                /entreg(a|am)|frete|envio|enviam/i,
                /prazo|demora|chegar/i
            ],
            COMPARAR_PRODUTOS: [
                /diferença|melhor|pior|versus|vs|comparar/i,
                /qual (das|delas|desses)/i
            ],
            DESPEDIDA: [
                /obrigad(o|a)|valeu|thanks|brigad/i,
                /tchau|até mais|ate mais|falou|bye/i
            ]
        };

        // Padrões para extração de entidades
        this.entidades = {
            tipo_tinta: /(látex|latex|acrílica|acrilica|esmalte|verniz|textura|epóxi|epoxi|primer)/i,
            acabamento: /(fosco|semi[- ]?brilho|brilhante|acetinado|metálico|metalico)/i,
            ambiente: /(interno|externo|banheiro|cozinha|área externa|área molhada|fachada|piso)/i,
            marca: /(suvinil|coral|sherwin|lukscolor|eucatex)/i,
            cor: /(branco|bege|areia|cinza|azul|verde|amarelo|rosa|vermelho|preto|gelo|marfim|palha)/i,
            area_m2: /(\d+(?:[\.,]\d+)?)\s*(m²|m2|metros?(?:\s*quadrados?)?)/i,
            tamanho_lata: /(18\s*l(?:itros?)?|3[\.,]?6\s*l(?:itros?)?|900\s*ml|galão|lata)/i
        };
    }

    /**
     * Analisa a mensagem e retorna a intenção detectada
     */
    async analisar(mensagem, contexto = {}) {
        const msgLower = mensagem.toLowerCase().trim();

        // Detectar tipo de intenção
        let tipoDetectado = 'OUTROS';
        let confianca = 0.5;

        for (const [tipo, padroes] of Object.entries(this.padroes)) {
            for (const padrao of padroes) {
                if (padrao.test(msgLower)) {
                    tipoDetectado = tipo;
                    confianca = 0.85;
                    break;
                }
            }
            if (tipoDetectado !== 'OUTROS') break;
        }

        // Extrair parâmetros/entidades
        const parametros = this.extrairEntidades(mensagem);

        // Ajustar confiança baseado em entidades extraídas
        const numEntidades = Object.values(parametros).filter(v => v !== null).length;
        if (numEntidades > 0) {
            confianca = Math.min(0.95, confianca + (numEntidades * 0.05));
        }

        // Considerar contexto anterior
        if (contexto.ultimaIntencao && tipoDetectado === 'OUTROS') {
            // Se não identificou intenção clara, pode ser continuação
            if (contexto.ultimaIntencao === 'CALCULAR_QUANTIDADE' && parametros.area_m2) {
                tipoDetectado = 'CALCULAR_QUANTIDADE';
                confianca = 0.8;
            }
        }

        console.log(`[AnalisadorTintas] Intenção: ${tipoDetectado}, Confiança: ${(confianca * 100).toFixed(0)}%`);
        console.log(`[AnalisadorTintas] Parâmetros: ${JSON.stringify(parametros)}`);

        return {
            tipo: tipoDetectado,
            confianca: confianca,
            parametros: parametros,
            resumo: this.gerarResumo(tipoDetectado, parametros)
        };
    }

    /**
     * Extrai entidades da mensagem
     */
    extrairEntidades(mensagem) {
        const resultado = {
            tipo_tinta: null,
            acabamento: null,
            ambiente: null,
            marca: null,
            cor: null,
            area_m2: null,
            tamanho_lata: null
        };

        for (const [entidade, padrao] of Object.entries(this.entidades)) {
            const match = mensagem.match(padrao);
            if (match) {
                if (entidade === 'area_m2') {
                    // Extrair número
                    resultado[entidade] = parseFloat(match[1].replace(',', '.'));
                } else {
                    resultado[entidade] = match[1].toLowerCase();
                }
            }
        }

        return resultado;
    }

    /**
     * Gera resumo da intenção
     */
    gerarResumo(tipo, parametros) {
        const resumos = {
            SAUDACAO: 'Cliente enviou saudação',
            BUSCAR_PRODUTO: `Busca por ${parametros.tipo_tinta || 'tinta'} ${parametros.marca || ''}`.trim(),
            CALCULAR_QUANTIDADE: `Calcular tinta para ${parametros.area_m2 || '?'}m²`,
            CONSULTAR_COR: `Consulta sobre cores ${parametros.cor || ''}`.trim(),
            SOLICITAR_ORCAMENTO: 'Solicitação de orçamento',
            DUVIDA_TECNICA: 'Dúvida técnica sobre aplicação',
            PRECO: 'Pergunta sobre preços',
            ENTREGA: 'Pergunta sobre entrega',
            COMPARAR_PRODUTOS: 'Comparação entre produtos',
            DESPEDIDA: 'Despedida/Agradecimento',
            OUTROS: 'Intenção não identificada claramente'
        };

        return resumos[tipo] || 'Analisando...';
    }
}

export { AnalisadorIntencoesTintas };
export default AnalisadorIntencoesTintas;

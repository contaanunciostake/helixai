/**
 * Calculadora de Rendimento
 * Calcula quantidade de tinta necessária para pintura
 * VendeAI - Sistema de Automação WhatsApp com IA
 */

class CalculadoraRendimento {
    constructor(config) {
        this.config = config;
        this.margemSeguranca = config.margemSeguranca || 1.1; // 10% extra
    }

    /**
     * Calcula quantidade de tinta necessária
     */
    async calcular(parametros) {
        const {
            area_m2,
            altura = 2.8,
            rendimento_m2_litro = 10,
            demaos = 2,
            desconto_aberturas = 0.1, // 10% para portas/janelas
            tipo_pintura = 'paredes'
        } = parametros;

        // Se não tiver área, pedir informação
        if (!area_m2) {
            return {
                texto: `📐 *Calculadora de Tinta*\n\n` +
                    `Me conta a metragem da área que você quer pintar?\n\n` +
                    `Pode me dizer de várias formas:\n` +
                    `• "Quarto de 3x4 metros"\n` +
                    `• "Sala de 20m²"\n` +
                    `• "Cômodo de 15 metros quadrados"\n\n` +
                    `Ou me fala qual ambiente é que eu te ajudo! 🏠`,
                precisaInfo: true,
                infoFaltando: 'area_m2'
            };
        }

        // Cálculo da área de pintura
        let areaPintura = area_m2;

        // Se for pintura de paredes
        if (tipo_pintura === 'paredes') {
            // Perímetro × altura - descontos
            areaPintura = area_m2 * altura * (1 - desconto_aberturas);
        }

        // Litros necessários
        const litrosBase = (areaPintura * demaos) / rendimento_m2_litro;
        const litrosTotal = Math.ceil(litrosBase * this.margemSeguranca);

        // Sugestão de latas
        const latas = this.sugerirLatas(litrosTotal);

        // Montar resposta
        let texto = `📐 *Cálculo de Tinta*\n`;
        texto += `━━━━━━━━━━━━━━━━━━━━\n\n`;

        texto += `📏 Área informada: ${area_m2}m²\n`;
        texto += `🧱 Área de pintura: ~${areaPintura.toFixed(1)}m²\n`;
        texto += `🖌️ Demãos: ${demaos}\n`;
        texto += `📊 Rendimento médio: ${rendimento_m2_litro}m²/L\n\n`;

        texto += `━━━━━━━━━━━━━━━━━━━━\n`;
        texto += `🪣 *Você vai precisar de aproximadamente ${litrosTotal} litros*\n\n`;

        texto += `*Sugestão de compra:*\n`;
        texto += `${latas.texto}\n\n`;

        texto += `💡 _Já incluí 10% de margem de segurança no cálculo!_\n\n`;

        texto += `Quer que eu monte um orçamento com esses valores? 📋`;

        return {
            texto,
            calculo: {
                area_informada: area_m2,
                area_pintura: areaPintura,
                litros_necessarios: litrosTotal,
                latas: latas.detalhe,
                demaos,
                rendimento: rendimento_m2_litro
            }
        };
    }

    /**
     * Sugere quantidade de latas
     */
    sugerirLatas(litros) {
        const latas = { '18L': 0, '3.6L': 0, '0.9L': 0 };
        let restante = litros;

        // Priorizar latas maiores (melhor custo-benefício)
        if (restante >= 18) {
            latas['18L'] = Math.floor(restante / 18);
            restante = restante % 18;
        }

        if (restante >= 3.6) {
            latas['3.6L'] = Math.floor(restante / 3.6);
            restante = restante % 3.6;
        }

        if (restante > 0) {
            latas['0.9L'] = Math.ceil(restante / 0.9);
        }

        // Montar texto
        const partes = [];
        if (latas['18L'] > 0) partes.push(`   🪣 ${latas['18L']}x Lata 18L`);
        if (latas['3.6L'] > 0) partes.push(`   🫙 ${latas['3.6L']}x Galão 3.6L`);
        if (latas['0.9L'] > 0) partes.push(`   🥫 ${latas['0.9L']}x Lata 900ml`);

        // Adicionar dica de economia
        let texto = partes.join('\n');
        if (latas['18L'] > 0) {
            texto += `\n\n💰 _Latas de 18L têm melhor custo-benefício!_`;
        }

        return {
            texto,
            detalhe: latas,
            total_litros: litros
        };
    }

    /**
     * Calcula área de paredes de um cômodo
     */
    calcularAreaParedes(largura, comprimento, altura = 2.8, numPortas = 1, numJanelas = 1) {
        // Perímetro
        const perimetro = 2 * (largura + comprimento);

        // Área bruta das paredes
        const areaBruta = perimetro * altura;

        // Descontos (porta ~2m², janela ~1.5m²)
        const descontosPortas = numPortas * 2;
        const descontosJanelas = numJanelas * 1.5;

        return areaBruta - descontosPortas - descontosJanelas;
    }

    /**
     * Rendimento padrão por tipo de tinta
     */
    getRendimentoPadrao(tipo) {
        const rendimentos = {
            'latex': 10,
            'acrilica': 10,
            'esmalte': 12,
            'verniz': 14,
            'textura': 3,
            'epoxi': 8,
            'primer': 12
        };

        return rendimentos[tipo?.toLowerCase()] || 10;
    }
}

export { CalculadoraRendimento };
export default CalculadoraRendimento;

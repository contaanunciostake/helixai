/**
 * Gerador de Orçamento
 * Cria orçamentos formatados para envio via WhatsApp
 * VendeAI - Sistema de Automação WhatsApp com IA
 */

import axios from 'axios';

class GeradorOrcamento {
    constructor(config) {
        this.config = config;
        this.apiUrl = config.backendUrl || 'http://localhost:5000';
        this.empresaId = config.empresaId;
        this.freteGratisAcima = config.freteGratisAcima || 500;
        this.descontoMaximo = config.descontoMaximo || 15;
    }

    /**
     * Gera orçamento baseado no contexto
     */
    async gerar(contexto) {
        const { produtos, calculo, lead, conversaId } = contexto;

        // Se não tem produtos selecionados
        if (!produtos || produtos.length === 0) {
            return {
                texto: `📋 *Orçamento*\n\n` +
                    `Para eu montar seu orçamento, preciso saber:\n\n` +
                    `1️⃣ O que você quer pintar? (quarto, sala, fachada...)\n` +
                    `2️⃣ Qual a metragem aproximada?\n` +
                    `3️⃣ Prefere alguma marca específica?\n\n` +
                    `Me conta esses detalhes que eu monto um orçamento completo pra você! 😊`,
                precisaInfo: true
            };
        }

        // Calcular valores
        let subtotal = 0;
        const itens = produtos.map(p => {
            const preco = p.preco_selecionado || this.getMelhorPreco(p.tamanhos_precos);
            const qtd = p.quantidade || 1;
            const tamanho = p.tamanho_selecionado || this.getMelhorTamanho(p.tamanhos_precos);
            const itemTotal = preco * qtd;
            subtotal += itemTotal;

            return {
                produto_id: p.id,
                nome: p.nome,
                marca: p.marca,
                tamanho: tamanho,
                quantidade: qtd,
                preco_unitario: preco,
                subtotal: itemTotal
            };
        });

        // Calcular desconto progressivo
        let desconto = 0;
        let descontoPercentual = 0;
        if (subtotal >= 2000) {
            descontoPercentual = 10;
        } else if (subtotal >= 1000) {
            descontoPercentual = 5;
        } else if (subtotal >= 500) {
            descontoPercentual = 3;
        }

        if (descontoPercentual > this.descontoMaximo) {
            descontoPercentual = this.descontoMaximo;
        }

        desconto = subtotal * (descontoPercentual / 100);
        const valorTotal = subtotal - desconto;
        const freteGratis = valorTotal >= this.freteGratisAcima;

        // Salvar orçamento no banco
        let orcamentoId = null;
        try {
            const response = await axios.post(`${this.apiUrl}/api/bot/tintas/orcamento`, {
                empresa_id: this.empresaId,
                lead_id: lead?.id,
                conversa_id: conversaId,
                tipo_projeto: calculo?.tipo_projeto || contexto.tipo_projeto,
                ambiente: calculo?.ambiente || contexto.ambiente,
                area_m2: calculo?.area_m2,
                area_total_pintura: calculo?.area_pintura,
                litros_necessarios: calculo?.litros_necessarios,
                numero_latas: calculo?.latas,
                itens,
                subtotal,
                desconto_percentual: descontoPercentual,
                desconto_valor: desconto,
                valor_total: valorTotal
            }, { timeout: 10000 });

            orcamentoId = response.data.orcamento_id;
        } catch (e) {
            console.error('[GeradorOrcamento] Erro ao salvar:', e.message);
        }

        // Formatar mensagem do orçamento
        let texto = `📋 *ORÇAMENTO${orcamentoId ? ` #${orcamentoId}` : ''}*\n`;
        texto += `━━━━━━━━━━━━━━━━━━━━\n\n`;

        // Itens
        itens.forEach((item, i) => {
            texto += `*${i + 1}. ${item.nome}*\n`;
            if (item.marca) texto += `   ${item.marca}`;
            if (item.tamanho) texto += ` - ${item.tamanho}`;
            texto += `\n`;
            texto += `   ${item.quantidade}x R$ ${item.preco_unitario.toFixed(2)} = *R$ ${item.subtotal.toFixed(2)}*\n\n`;
        });

        // Totais
        texto += `━━━━━━━━━━━━━━━━━━━━\n`;
        texto += `Subtotal: R$ ${subtotal.toFixed(2)}\n`;

        if (desconto > 0) {
            texto += `🏷️ Desconto (${descontoPercentual}%): -R$ ${desconto.toFixed(2)}\n`;
        }

        texto += `\n💰 *TOTAL: R$ ${valorTotal.toFixed(2)}*\n\n`;

        // Frete
        if (freteGratis) {
            texto += `🚚 *FRETE GRÁTIS!* ✅\n`;
        } else {
            texto += `🚚 Frete: A calcular\n`;
            texto += `_(Grátis acima de R$ ${this.freteGratisAcima.toFixed(2)})_\n`;
        }

        // Validade e entrega
        texto += `\n📅 Validade: 7 dias\n`;
        texto += `📦 Prazo: ${this.config.prazoEntrega || '1-2 dias úteis'}\n`;

        // CTA
        texto += `\n━━━━━━━━━━━━━━━━━━━━\n`;
        texto += `✅ Posso confirmar esse pedido pra você?\n`;
        texto += `\n_Pagamento: PIX, cartão ou boleto_`;

        return {
            texto,
            orcamento: {
                id: orcamentoId,
                itens,
                subtotal,
                desconto,
                desconto_percentual: descontoPercentual,
                total: valorTotal,
                frete_gratis: freteGratis
            }
        };
    }

    /**
     * Obtém melhor preço disponível
     */
    getMelhorPreco(tamanhosPrecos) {
        if (!tamanhosPrecos) return 0;

        // Prioridade: 18L > 3.6L > 0.9L (melhor custo-benefício)
        if (tamanhosPrecos['18L'] && tamanhosPrecos['18L'] > 0) return tamanhosPrecos['18L'];
        if (tamanhosPrecos['3.6L'] && tamanhosPrecos['3.6L'] > 0) return tamanhosPrecos['3.6L'];
        if (tamanhosPrecos['0.9L'] && tamanhosPrecos['0.9L'] > 0) return tamanhosPrecos['0.9L'];

        // Fallback: primeiro preço válido
        for (const preco of Object.values(tamanhosPrecos)) {
            if (preco > 0) return preco;
        }
        return 0;
    }

    /**
     * Obtém melhor tamanho disponível
     */
    getMelhorTamanho(tamanhosPrecos) {
        if (!tamanhosPrecos) return '18L';

        if (tamanhosPrecos['18L'] && tamanhosPrecos['18L'] > 0) return '18L';
        if (tamanhosPrecos['3.6L'] && tamanhosPrecos['3.6L'] > 0) return '3.6L';
        if (tamanhosPrecos['0.9L'] && tamanhosPrecos['0.9L'] > 0) return '0.9L';

        return Object.keys(tamanhosPrecos)[0] || '18L';
    }
}

export { GeradorOrcamento };
export default GeradorOrcamento;

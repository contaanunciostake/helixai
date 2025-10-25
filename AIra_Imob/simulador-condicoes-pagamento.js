
/**
 * 💰 SIMULADOR DE CONDIÇÕES DE PAGAMENTO IMOBILIÁRIO
 *
 * Calcula condições de pagamento para imóveis (financiamento, aluguel, etc.)
 */

export class SimuladorCondicoesPagamento {
  constructor() {
    // Taxas médias de financiamento imobiliário (atualizar mensalmente)
    this.taxas = {
      'excelente': 0.79,    // Score 700+ ou entrada 50%+
      'bom': 0.99,          // Score 600-699 ou entrada 30-49%
      'regular': 1.29,      // Score 500-599 ou entrada 20-29%
      'alto_risco': 1.59    // Score <500 ou entrada <20%
    };

    // Prazos permitidos para financiamento imobiliário (em meses)
    this.prazosPermitidos = [120, 180, 240, 300, 360, 420];
  }

  /**
   * Simula financiamento imobiliário com fórmula PRICE
   */
  simularFinanciamento(valorImovel, entrada = null, parcelas = 360, perfilCliente = 'bom') {
    // Validações
    if (!valorImovel || valorImovel <= 0) {
      return { erro: 'Valor do imóvel inválido' };
    }

    if (!this.prazosPermitidos.includes(parcelas)) {
      return {
        erro: 'Prazo inválido',
        prazos_disponiveis: this.prazosPermitidos
      };
    }

    // Calcular entrada mínima (20%)
    const entradaMinima = valorImovel * 0.2;
    const entradaFinal = entrada || entradaMinima;

    if (entradaFinal < entradaMinima) {
      return {
        erro: 'Entrada muito baixa',
        entrada_minima: entradaMinima,
        entrada_informada: entradaFinal
      };
    }

    // Ajustar perfil baseado na entrada
    const percentualEntrada = (entradaFinal / valorImovel) * 100;
    let perfilAjustado = perfilCliente;

    if (percentualEntrada >= 50) {
      perfilAjustado = 'excelente';
    } else if (percentualEntrada >= 30) {
      perfilAjustado = 'bom';
    } else if (percentualEntrada >= 20) {
      perfilAjustado = 'regular';
    } else {
      perfilAjustado = 'alto_risco';
    }

    // Calcular valor financiado
    const valorFinanciado = valorImovel - entradaFinal;

    // Taxa mensal
    const taxaMensal = this.taxas[perfilAjustado] / 100;

    // Fórmula PRICE: PMT = PV × [i × (1 + i)^n] / [(1 + i)^n - 1]
    const fatorPrice = (taxaMensal * Math.pow(1 + taxaMensal, parcelas)) /
                       (Math.pow(1 + taxaMensal, parcelas) - 1);

    const valorParcela = valorFinanciado * fatorPrice;

    // Totais
    const totalParcelas = valorParcela * parcelas;
    const totalPago = entradaFinal + totalParcelas;
    const totalJuros = totalParcelas - valorFinanciado;

    // CET (Custo Efetivo Total)
    const cet = ((totalPago / valorImovel - 1) * 100).toFixed(2);

    return {
      sucesso: true,
      imovel: {
        valor_total: this.formatarMoeda(valorImovel),
        valor_total_numero: valorImovel
      },
      entrada: {
        valor: this.formatarMoeda(entradaFinal),
        percentual: percentualEntrada.toFixed(1) + '%',
        valor_numero: entradaFinal
      },
      financiamento: {
        valor_financiado: this.formatarMoeda(valorFinanciado),
        valor_financiado_numero: valorFinanciado,
        numero_parcelas: parcelas,
        valor_parcela: this.formatarMoeda(valorParcela),
        valor_parcela_numero: valorParcela,
        taxa_juros_mensal: this.taxas[perfilAjustado] + '%',
        taxa_juros_anual: (this.taxas[perfilAjustado] * 12).toFixed(2) + '%'
      },
      totais: {
        total_parcelas: this.formatarMoeda(totalParcelas),
        total_juros: this.formatarMoeda(totalJuros),
        total_a_pagar: this.formatarMoeda(totalPago),
        cet: cet + '%'
      },
      perfil_credito: {
        classificacao: perfilAjustado,
        descricao: this.getDescricaoPerfil(perfilAjustado)
      },
      observacoes: [
        '⚠️ Simulação aproximada com base em taxas médias de mercado',
        '✅ Valores finais sujeitos à aprovação do banco',
        '📋 Documentos necessários: RG, CPF, Comprovante de Renda, Comprovante de Residência',
        '⏱️ Análise de crédito em até 5-10 dias úteis',
        '🏦 Parceiro: Caixa Econômica Federal, Banco do Brasil, Bradesco, Itaú',
        '📊 Sistema de Amortização: PRICE (parcelas fixas) ou SAC (parcelas decrescentes)'
      ],
      proximos_passos: [
        '1️⃣ Confirmar interesse nesta simulação',
        '2️⃣ Enviar documentos para análise de crédito',
        '3️⃣ Aguardar aprovação do banco (5-10 dias úteis)',
        '4️⃣ Assinatura do contrato e registro em cartório',
        '5️⃣ Liberação do imóvel'
      ]
    };
  }

  /**
   * Simula aluguel
   */
  simularAluguel(valorAluguel, tipoGarantia = 'caucao') {
    if (!valorAluguel || valorAluguel <= 0) {
      return { erro: 'Valor do aluguel inválido' };
    }

    let garantiaValor = 0;
    let garantiaDescricao = '';

    switch (tipoGarantia.toLowerCase()) {
      case 'caucao':
        garantiaValor = valorAluguel * 3;
        garantiaDescricao = 'Caução (3x o valor do aluguel)';
        break;
      case 'fiador':
        garantiaDescricao = 'Fiador (com imóvel quitado e renda comprovada)';
        break;
      case 'seguro_fianca':
        garantiaValor = valorAluguel * 0.1; // Exemplo: 10% do aluguel anual
        garantiaDescricao = 'Seguro Fiança (custo anual aproximado)';
        break;
      default:
        garantiaDescricao = 'Nenhuma garantia informada. Recomenda-se caução ou fiador.';
    }

    return {
      sucesso: true,
      aluguel: {
        valor_mensal: this.formatarMoeda(valorAluguel),
        valor_mensal_numero: valorAluguel
      },
      garantia: {
        tipo: tipoGarantia,
        valor: this.formatarMoeda(garantiaValor),
        descricao: garantiaDescricao
      },
      observacoes: [
        '✅ Contrato de 30 meses, renovável',
        '📋 Documentos necessários: RG, CPF, Comprovante de Renda, Comprovante de Residência',
        '💡 IPTU e condomínio podem ser cobrados à parte, verificar anúncio do imóvel'
      ],
      proximos_passos: [
        '1️⃣ Agendar visita ao imóvel',
        '2️⃣ Análise de documentação e garantia',
        '3️⃣ Assinatura do contrato de locação',
        '4️⃣ Entrega das chaves'
      ]
    };
  }

  /**
   * Compara diferentes cenários de financiamento
   */
  compararCenariosFinanciamento(valorImovel, entrada) {
    const cenarios = [];

    for (const prazo of [180, 240, 300, 360]) {
      const simulacao = this.simularFinanciamento(valorImovel, entrada, prazo, 'bom');

      if (simulacao.sucesso) {
        cenarios.push({
          parcelas: prazo,
          valor_parcela: simulacao.financiamento.valor_parcela,
          total_juros: simulacao.totais.total_juros,
          total_pagar: simulacao.totais.total_a_pagar
        });
      }
    }

    return {
      valor_imovel: this.formatarMoeda(valorImovel),
      entrada: this.formatarMoeda(entrada),
      cenarios: cenarios,
      recomendacao: this.getRecomendacaoFinanciamento(cenarios)
    };
  }

  /**
   * Calcula entrada ideal para financiamento
   */
  calcularEntradaIdealFinanciamento(valorImovel, rendaMensal) {
    const parcelaMaxima = rendaMensal * 0.3;

    for (let entrada = valorImovel * 0.2; entrada <= valorImovel * 0.5; entrada += valorImovel * 0.05) {
      const simulacao = this.simularFinanciamento(valorImovel, entrada, 360, 'bom');

      if (simulacao.sucesso &&
          simulacao.financiamento.valor_parcela_numero <= parcelaMaxima) {
        return {
          entrada_ideal: this.formatarMoeda(entrada),
          entrada_numero: entrada,
          percentual: ((entrada / valorImovel) * 100).toFixed(1) + '%',
          parcela_resultante: simulacao.financiamento.valor_parcela,
          comprometimento_renda: ((simulacao.financiamento.valor_parcela_numero / rendaMensal) * 100).toFixed(1) + '%'
        };
      }
    }

    return {
      aviso: 'Imóvel acima do orçamento recomendado',
      sugestao: 'Considere um imóvel de menor valor ou aumente a entrada'
    };
  }

  /**
   * Formata moeda BRL
   */
  formatarMoeda(valor) {
    return 'R$ ' + valor.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  /**
   * Descrição do perfil de crédito
   */
  getDescricaoPerfil(perfil) {
    const descricoes = {
      'excelente': '⭐⭐⭐⭐⭐ Excelente - Melhores taxas',
      'bom': '⭐⭐⭐⭐ Bom - Taxas competitivas',
      'regular': '⭐⭐⭐ Regular - Taxas padrão',
      'alto_risco': '⭐⭐ Alto risco - Entrada maior recomendada'
    };
    return descricoes[perfil] || 'Não classificado';
  }

  /**
   * Recomendação baseada nos cenários de financiamento
   */
  getRecomendacaoFinanciamento(cenarios) {
    if (cenarios.length === 0) return 'Nenhum cenário disponível';

    const melhor = cenarios.find(c => c.parcelas === 360) || cenarios[0];

    return `💡 Recomendamos ${melhor.parcelas}x de ${melhor.valor_parcela} - Melhor custo-benefício a longo prazo`;
  }
}


/**
 * 📊 GERENCIADOR DE SOLICITAÇÕES DE CONDIÇÕES DE PAGAMENTO
 */
export class GerenciadorCondicoesPagamento {
  constructor(db) {
    this.db = db;
    this.simulador = new SimuladorCondicoesPagamento();
  }

  /**
   * Salva solicitação no banco
   */
  async salvarSolicitacao(dados) {
    const {
      telefone,
      nome,
      cpf,
      renda_mensal,
      property_id,
      property_type,
      valor_imovel,
      entrada,
      parcelas,
      valor_parcela,
      simulacao_completa,
      tipo_solicitacao // 'financiamento' ou 'aluguel'
    } = dados;

    try {
      const [result] = await this.db.execute(`
        INSERT INTO solicitacoes_imobiliarias (
          telefone, nome, cpf, renda_mensal,
          property_id, property_type, valor_imovel,
          entrada, parcelas, valor_parcela,
          simulacao_completa, tipo_solicitacao, status, criado_em
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendente', NOW())
      `, [
        telefone, nome, cpf, renda_mensal,
        property_id, property_type, valor_imovel,
        entrada, parcelas, valor_parcela,
        JSON.stringify(simulacao_completa),
        tipo_solicitacao
      ]);

      return {
        sucesso: true,
        solicitacao_id: result.insertId,
        mensagem: '✅ Solicitação salva com sucesso!'
      };
    } catch (error) {
      console.error('[IMOVEL] Erro ao salvar solicitação:', error.message);
      return {
        sucesso: false,
        erro: error.message
      };
    }
  }

  /**
   * Busca solicitações do cliente
   */
  async buscarSolicitacoes(telefone) {
    try {
      const [rows] = await this.db.execute(`
        SELECT *
        FROM solicitacoes_imobiliarias
        WHERE telefone = ?
        ORDER BY criado_em DESC
        LIMIT 5
      `, [telefone]);

      return rows;
    } catch (error) {
      console.error('[IMOVEL] Erro ao buscar solicitações:', error.message);
      return [];
    }
  }

  /**
   * Atualiza status da solicitação
   */
  async atualizarStatus(solicitacaoId, novoStatus, observacao = null) {
    try {
      await this.db.execute(`
        UPDATE solicitacoes_imobiliarias
        SET status = ?, observacao = ?, atualizado_em = NOW()
        WHERE id = ?
      `, [novoStatus, observacao, solicitacaoId]);

      return { sucesso: true };
    } catch (error) {
      console.error('[IMOVEL] Erro ao atualizar status:', error.message);
      return { sucesso: false, erro: error.message };
    }
  }

  /**
   * Estatísticas de solicitações imobiliárias
   */
  async getEstatisticas() {
    try {
      const [stats] = await this.db.execute(`
        SELECT
          COUNT(*) as total_solicitacoes,
          SUM(CASE WHEN status = 'aprovado' THEN 1 ELSE 0 END) as aprovadas,
          SUM(CASE WHEN status = 'reprovado' THEN 1 ELSE 0 END) as reprovadas,
          SUM(CASE WHEN status = 'pendente' THEN 1 ELSE 0 END) as pendentes,
          AVG(valor_imovel) as ticket_medio_imovel,
          AVG(parcelas) as prazo_medio_financiamento
        FROM solicitacoes_imobiliarias
        WHERE DATE(criado_em) = CURDATE()
      `);

      return stats[0];
    } catch (error) {
      console.error('[IMOVEL] Erro nas estatísticas:', error.message);
      return null;
    }
  }
}


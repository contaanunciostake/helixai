/**
 * ════════════════════════════════════════════════════════════════
 * GERADOR DE CONTRATOS DE COMPRA E VENDA DE VEÍCULOS
 * Com cláusulas legais baseadas na legislação brasileira (2025)
 * ════════════════════════════════════════════════════════════════
 */

/**
 * Formata data para formato brasileiro
 */
const formatarData = (data) => {
  const d = new Date(data);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

/**
 * Formata data por extenso
 */
const formatarDataPorExtenso = (data) => {
  const meses = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];
  const d = new Date(data);
  return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
};

/**
 * Formata valor monetário
 */
const formatarValor = (valor) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

/**
 * Formata valor por extenso (simplificado)
 */
const valorPorExtenso = (valor) => {
  // Simplificado - em produção use uma biblioteca completa
  const partes = valor.toFixed(2).split('.');
  const reais = parseInt(partes[0]);
  const centavos = parseInt(partes[1]);

  const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const especiais = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];

  let resultado = '';

  if (reais >= 1000000) {
    const milhoes = Math.floor(reais / 1000000);
    resultado += milhoes === 1 ? 'um milhão' : `${unidades[milhoes]} milhões`;
    const resto = reais % 1000000;
    if (resto > 0) resultado += ' e ';
  }

  const mil = Math.floor((reais % 1000000) / 1000);
  if (mil > 0) {
    if (mil === 1) {
      resultado += 'mil';
    } else if (mil < 10) {
      resultado += `${unidades[mil]} mil`;
    } else if (mil < 20) {
      resultado += `${especiais[mil - 10]} mil`;
    } else {
      const d = Math.floor(mil / 10);
      const u = mil % 10;
      resultado += `${dezenas[d]}${u > 0 ? ' e ' + unidades[u] : ''} mil`;
    }
    const resto = reais % 1000;
    if (resto > 0) resultado += ' e ';
  }

  const centenas = reais % 1000;
  if (centenas > 0) {
    if (centenas < 10) {
      resultado += unidades[centenas];
    } else if (centenas < 20) {
      resultado += especiais[centenas - 10];
    } else if (centenas < 100) {
      const d = Math.floor(centenas / 10);
      const u = centenas % 10;
      resultado += `${dezenas[d]}${u > 0 ? ' e ' + unidades[u] : ''}`;
    } else {
      // Simplificado para centenas
      resultado += centenas.toString();
    }
  }

  resultado += ' reais';

  if (centavos > 0) {
    resultado += ` e ${centavos} centavos`;
  }

  return resultado;
};

/**
 * Gera o contrato completo em HTML
 */
export const gerarContratoHTML = (dadosEmpresa, dadosCliente, dadosFinanciamento, dadosVeiculo) => {
  const dataHoje = new Date();
  const valorTotal = dadosFinanciamento.valor_veiculo;
  const valorEntrada = dadosFinanciamento.valor_entrada;
  const valorFinanciado = dadosFinanciamento.valor_financiado;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contrato de Compra e Venda - ${dadosVeiculo.modelo}</title>
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }

    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #000;
      max-width: 21cm;
      margin: 0 auto;
      padding: 1cm;
      background: white;
    }

    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #000;
      padding-bottom: 20px;
    }

    .header h1 {
      font-size: 18pt;
      font-weight: bold;
      margin: 0 0 10px 0;
      text-transform: uppercase;
    }

    .header h2 {
      font-size: 14pt;
      font-weight: normal;
      margin: 5px 0;
    }

    .secao {
      margin: 25px 0;
      text-align: justify;
    }

    .secao-titulo {
      font-weight: bold;
      text-transform: uppercase;
      margin: 20px 0 10px 0;
      font-size: 13pt;
    }

    .clausula {
      margin: 15px 0;
      text-align: justify;
    }

    .clausula-titulo {
      font-weight: bold;
      margin-bottom: 5px;
    }

    .paragrafo {
      margin-left: 40px;
      margin-top: 10px;
    }

    .assinaturas {
      margin-top: 60px;
      page-break-inside: avoid;
    }

    .assinatura-bloco {
      margin: 50px 0;
      text-align: center;
    }

    .assinatura-linha {
      border-top: 1px solid #000;
      width: 300px;
      margin: 0 auto 5px auto;
    }

    .destaque {
      font-weight: bold;
    }

    .tabela-veiculo {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }

    .tabela-veiculo td {
      border: 1px solid #000;
      padding: 8px;
    }

    .tabela-veiculo td:first-child {
      font-weight: bold;
      width: 30%;
      background-color: #f0f0f0;
    }

    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Contrato de Compra e Venda de Veículo Automotor</h1>
    <h2>Com Financiamento Bancário</h2>
  </div>

  <div class="secao">
    <p>
      Pelo presente instrumento particular de <span class="destaque">CONTRATO DE COMPRA E VENDA DE VEÍCULO AUTOMOTOR</span>,
      que entre si celebram de um lado:
    </p>
  </div>

  <div class="secao">
    <div class="secao-titulo">VENDEDOR (PRIMEIRA PARTE):</div>
    <p>
      <span class="destaque">${dadosEmpresa.nome || dadosEmpresa.nome_fantasia}</span>,
      pessoa jurídica de direito privado, inscrita no CNPJ sob o nº <span class="destaque">${dadosEmpresa.cnpj}</span>,
      com sede na ${dadosEmpresa.endereco || 'Rua Exemplo, 123, Centro'},
      ${dadosEmpresa.cidade || 'São Paulo'} - ${dadosEmpresa.estado || 'SP'},
      CEP ${dadosEmpresa.cep || '00000-000'},
      neste ato representada na forma de seu estatuto/contrato social,
      doravante denominada simplesmente <span class="destaque">VENDEDORA</span>;
    </p>
  </div>

  <div class="secao">
    <div class="secao-titulo">COMPRADOR (SEGUNDA PARTE):</div>
    <p>
      <span class="destaque">${dadosCliente.nome}</span>,
      ${dadosCliente.nacionalidade || 'brasileiro(a)'},
      ${dadosCliente.estado_civil || 'solteiro(a)'},
      ${dadosCliente.profissao || 'autônomo(a)'},
      portador(a) do CPF nº <span class="destaque">${dadosCliente.cpf || '000.000.000-00'}</span>
      e RG nº <span class="destaque">${dadosCliente.rg || '00.000.000-0'}</span>,
      residente e domiciliado(a) na ${dadosCliente.endereco || 'Rua Exemplo, 456, Bairro'},
      ${dadosCliente.cidade || 'São Paulo'} - ${dadosCliente.estado || 'SP'},
      CEP ${dadosCliente.cep || '00000-000'},
      telefone ${dadosCliente.telefone},
      e-mail ${dadosCliente.email},
      doravante denominado(a) simplesmente <span class="destaque">COMPRADOR(A)</span>;
    </p>
  </div>

  <div class="secao">
    <p>
      As partes acima qualificadas têm entre si, justo e acertado, o presente
      <span class="destaque">CONTRATO DE COMPRA E VENDA DE VEÍCULO AUTOMOTOR</span>,
      que se regerá pelas cláusulas seguintes e pelas condições descritas no presente instrumento.
    </p>
  </div>

  <div class="secao">
    <div class="secao-titulo">DO OBJETO DO CONTRATO</div>

    <div class="clausula">
      <div class="clausula-titulo">CLÁUSULA 1ª - DO VEÍCULO</div>
      <p>
        O presente contrato tem por objeto a compra e venda do seguinte veículo automotor:
      </p>

      <table class="tabela-veiculo">
        <tr>
          <td>Marca/Modelo:</td>
          <td>${dadosVeiculo.marca || ''} ${dadosVeiculo.modelo}</td>
        </tr>
        <tr>
          <td>Ano Fabricação/Modelo:</td>
          <td>${dadosVeiculo.ano_fabricacao || dadosVeiculo.ano}/${dadosVeiculo.ano_modelo || dadosVeiculo.ano}</td>
        </tr>
        <tr>
          <td>Cor:</td>
          <td>${dadosVeiculo.cor || 'A definir'}</td>
        </tr>
        <tr>
          <td>Placa:</td>
          <td>${dadosVeiculo.placa || 'A transferir'}</td>
        </tr>
        <tr>
          <td>Chassi:</td>
          <td>${dadosVeiculo.chassi || 'Conforme documentação'}</td>
        </tr>
        <tr>
          <td>RENAVAM:</td>
          <td>${dadosVeiculo.renavam || 'Conforme documentação'}</td>
        </tr>
        <tr>
          <td>Combustível:</td>
          <td>${dadosVeiculo.combustivel || 'Flex'}</td>
        </tr>
        <tr>
          <td>Quilometragem:</td>
          <td>${dadosVeiculo.km ? dadosVeiculo.km.toLocaleString('pt-BR') + ' km' : '0 km'}</td>
        </tr>
      </table>

      <div class="paragrafo">
        <strong>Parágrafo Único:</strong> O veículo objeto deste contrato encontra-se em perfeito estado de conservação
        e funcionamento, sem vícios aparentes ou ocultos, conforme vistoriado pelo(a) COMPRADOR(A).
      </div>
    </div>
  </div>

  <div class="secao">
    <div class="secao-titulo">DAS CONDIÇÕES COMERCIAIS</div>

    <div class="clausula">
      <div class="clausula-titulo">CLÁUSULA 2ª - DO PREÇO E FORMA DE PAGAMENTO</div>
      <p>
        O valor total da presente compra e venda é de <span class="destaque">${formatarValor(valorTotal)}</span>
        (${valorPorExtenso(valorTotal)}), que será pago da seguinte forma:
      </p>

      <div class="paragrafo">
        <strong>a)</strong> Entrada no valor de <span class="destaque">${formatarValor(valorEntrada)}</span>
        (${valorPorExtenso(valorEntrada)}), paga no ato da assinatura deste contrato;
      </div>

      <div class="paragrafo">
        <strong>b)</strong> Saldo remanescente no valor de <span class="destaque">${formatarValor(valorFinanciado)}</span>
        (${valorPorExtenso(valorFinanciado)}), financiado através do
        <span class="destaque">${dadosFinanciamento.banco}</span>,
        em <span class="destaque">${dadosFinanciamento.parcelas}</span> parcelas mensais, iguais e consecutivas
        de aproximadamente <span class="destaque">${formatarValor(dadosFinanciamento.valor_parcela)}</span>,
        com taxa de juros de <span class="destaque">${dadosFinanciamento.taxa_juros}% a.m.</span>
      </div>

      <div class="paragrafo">
        <strong>Parágrafo Primeiro:</strong> O financiamento bancário será contratado diretamente pelo(a) COMPRADOR(A)
        junto à instituição financeira, sendo de sua exclusiva responsabilidade o cumprimento de todas as obrigações
        decorrentes do contrato de financiamento.
      </div>

      <div class="paragrafo">
        <strong>Parágrafo Segundo:</strong> A VENDEDORA não se responsabiliza pela aprovação ou reprovação do crédito
        junto à instituição financeira, sendo esta uma relação exclusiva entre o(a) COMPRADOR(A) e o banco.
      </div>

      <div class="paragrafo">
        <strong>Parágrafo Terceiro:</strong> Em caso de não aprovação do financiamento, o(a) COMPRADOR(A) deverá quitar
        o saldo devedor em até 5 (cinco) dias úteis, sob pena de rescisão contratual e aplicação da multa prevista na
        Cláusula 8ª deste contrato.
      </div>
    </div>

    <div class="clausula">
      <div class="clausula-titulo">CLÁUSULA 3ª - DA TRANSFERÊNCIA DE PROPRIEDADE</div>
      <p>
        A transferência da propriedade do veículo ao(à) COMPRADOR(A) fica condicionada à quitação integral do preço
        estabelecido na Cláusula 2ª, mediante a liquidação total do financiamento bancário.
      </p>

      <div class="paragrafo">
        <strong>Parágrafo Primeiro:</strong> Enquanto não quitado integralmente o valor do veículo, este permanecerá
        alienado fiduciariamente à instituição financeira, nos termos do Decreto-Lei nº 911/69 e alterações posteriores.
      </div>

      <div class="paragrafo">
        <strong>Parágrafo Segundo:</strong> Após a quitação total do financiamento, a VENDEDORA compromete-se a entregar
        ao(à) COMPRADOR(A), no prazo de até 30 (trinta) dias, toda a documentação necessária para a transferência de
        propriedade do veículo, incluindo:
      </p>
      <div class="paragrafo" style="margin-left: 60px;">
        <strong>a)</strong> Autorização para Transferência de Propriedade do Veículo Eletrônica (ATPV-e), devidamente assinada;<br>
        <strong>b)</strong> Certificado de Registro de Veículo (CRV) ou CRLV-e digital;<br>
        <strong>c)</strong> Comprovante de quitação de débitos (IPVA, multas, licenciamento);<br>
        <strong>d)</strong> Demais documentos exigidos pelo DETRAN.
      </div>

      <div class="paragrafo">
        <strong>Parágrafo Terceiro:</strong> Todas as despesas com transferência de propriedade, incluindo taxas do DETRAN,
        despachante e demais custos operacionais, serão de responsabilidade do(a) COMPRADOR(A).
      </div>
    </div>
  </div>

  <div class="secao">
    <div class="secao-titulo">DAS OBRIGAÇÕES DAS PARTES</div>

    <div class="clausula">
      <div class="clausula-titulo">CLÁUSULA 4ª - DAS OBRIGAÇÕES DA VENDEDORA</div>
      <p>São obrigações da VENDEDORA:</p>

      <div class="paragrafo">
        <strong>a)</strong> Entregar o veículo ao(à) COMPRADOR(A) nas condições descritas na Cláusula 1ª;
      </div>
      <div class="paragrafo">
        <strong>b)</strong> Garantir que o veículo está livre e desembaraçado de quaisquer ônus, gravames ou pendências,
        salvo a alienação fiduciária decorrente do financiamento;
      </div>
      <div class="paragrafo">
        <strong>c)</strong> Fornecer toda a documentação necessária para a transferência após quitação total;
      </div>
      <div class="paragrafo">
        <strong>d)</strong> Prestar informações verdadeiras sobre o estado de conservação e histórico do veículo.
      </div>
    </div>

    <div class="clausula">
      <div class="clausula-titulo">CLÁUSULA 5ª - DAS OBRIGAÇÕES DO(A) COMPRADOR(A)</div>
      <p>São obrigações do(a) COMPRADOR(A):</p>

      <div class="paragrafo">
        <strong>a)</strong> Efetuar o pagamento do valor de entrada conforme estipulado na Cláusula 2ª;
      </div>
      <div class="paragrafo">
        <strong>b)</strong> Cumprir rigorosamente todas as obrigações assumidas junto à instituição financeira no contrato
        de financiamento, pagando regularmente as parcelas nas datas de vencimento;
      </div>
      <div class="paragrafo">
        <strong>c)</strong> Manter o veículo em bom estado de conservação e realizar as manutenções preventivas recomendadas
        pelo fabricante;
      </div>
      <div class="paragrafo">
        <strong>d)</strong> Arcar com todas as despesas de IPVA, licenciamento, seguro obrigatório, multas de trânsito e
        demais encargos incidentes sobre o veículo a partir da data de assinatura deste contrato;
      </div>
      <div class="paragrafo">
        <strong>e)</strong> Transferir imediatamente para seu nome as pontuações decorrentes de infrações de trânsito
        cometidas após a assinatura deste contrato, sob pena de rescisão e aplicação de multa;
      </div>
      <div class="paragrafo">
        <strong>f)</strong> Contratar e manter vigente seguro total do veículo até a quitação final do financiamento,
        conforme exigido pela instituição financeira.
      </div>
    </div>
  </div>

  <div class="secao">
    <div class="secao-titulo">DAS INFRAÇÕES DE TRÂNSITO</div>

    <div class="clausula">
      <div class="clausula-titulo">CLÁUSULA 6ª - DA RESPONSABILIDADE POR MULTAS</div>
      <p>
        Todas as multas de trânsito e pontuações na CNH geradas após a assinatura deste contrato são de
        exclusiva responsabilidade do(a) COMPRADOR(A).
      </p>

      <div class="paragrafo">
        <strong>Parágrafo Primeiro:</strong> Caso alguma multa seja registrada em nome da VENDEDORA ou gere perda de pontos
        em sua CNH, o(a) COMPRADOR(A) compromete-se a realizar imediatamente a indicação do condutor através dos canais
        oficiais do DETRAN, sob pena de rescisão contratual.
      </div>

      <div class="paragrafo">
        <strong>Parágrafo Segundo:</strong> Se o(a) COMPRADOR(A) não realizar a indicação do condutor no prazo legal,
        deverá ressarcir a VENDEDORA de eventuais prejuízos, incluindo multas em dobro e custos administrativos.
      </div>
    </div>
  </div>

  <div class="secao">
    <div class="secao-titulo">DAS GARANTIAS</div>

    <div class="clausula">
      <div class="clausula-titulo">CLÁUSULA 7ª - DA GARANTIA LEGAL E CONTRATUAL</div>
      <p>
        O veículo objeto deste contrato possui garantia legal de 90 (noventa) dias para vícios ocultos,
        conforme estabelecido no Código de Defesa do Consumidor (Lei nº 8.078/90).
      </p>

      <div class="paragrafo">
        <strong>Parágrafo Único:</strong> ${dadosVeiculo.garantia_fabricante ?
          `Além da garantia legal, o veículo possui garantia de fábrica até ${dadosVeiculo.garantia_fabricante}, conforme manual do proprietário.` :
          'Após o prazo da garantia legal, quaisquer defeitos ou vícios serão de responsabilidade do(a) COMPRADOR(A).'}
      </div>
    </div>
  </div>

  <div class="secao">
    <div class="secao-titulo">DAS PENALIDADES</div>

    <div class="clausula">
      <div class="clausula-titulo">CLÁUSULA 8ª - DA INADIMPLÊNCIA</div>
      <p>
        Em caso de inadimplemento de qualquer obrigação assumida neste contrato, a parte inadimplente ficará sujeita
        ao pagamento de multa compensatória de 20% (vinte por cento) sobre o valor total do contrato, sem prejuízo
        das perdas e danos e da cobrança de juros moratórios de 1% (um por cento) ao mês.
      </p>

      <div class="paragrafo">
        <strong>Parágrafo Primeiro:</strong> O não pagamento de 3 (três) parcelas consecutivas do financiamento ensejará
        a busca e apreensão do veículo pela instituição financeira, nos termos do Decreto-Lei nº 911/69.
      </div>

      <div class="paragrafo">
        <strong>Parágrafo Segundo:</strong> A VENDEDORA não se responsabiliza por qualquer medida judicial ou extrajudicial
        adotada pela instituição financeira em caso de inadimplemento do(a) COMPRADOR(A).
      </div>
    </div>
  </div>

  <div class="secao">
    <div class="secao-titulo">DAS DISPOSIÇÕES GERAIS</div>

    <div class="clausula">
      <div class="clausula-titulo">CLÁUSULA 9ª - DA VALIDADE E EXECUTIVIDADE</div>
      <p>
        O presente contrato possui força de título executivo extrajudicial, nos termos do artigo 784, inciso III,
        do Código de Processo Civil, podendo ser executado independentemente de qualquer formalidade adicional.
      </p>
    </div>

    <div class="clausula">
      <div class="clausula-titulo">CLÁUSULA 10ª - DO FORO</div>
      <p>
        As partes elegem o foro da Comarca de <span class="destaque">${dadosEmpresa.cidade || 'São Paulo'}</span>,
        Estado de <span class="destaque">${dadosEmpresa.estado || 'São Paulo'}</span>,
        com expressa renúncia a qualquer outro, por mais privilegiado que seja, para dirimir quaisquer questões
        oriundas do presente contrato.
      </p>
    </div>

    <div class="clausula">
      <div class="clausula-titulo">CLÁUSULA 11ª - DAS ALTERAÇÕES</div>
      <p>
        Qualquer alteração ou aditamento ao presente contrato somente terá validade se feito por escrito e assinado
        por ambas as partes.
      </p>
    </div>
  </div>

  <div class="secao">
    <p>
      E por estarem justas e contratadas, as partes firmam o presente instrumento em 2 (duas) vias de igual teor e forma,
      na presença de 2 (duas) testemunhas, para que produza seus jurídicos e legais efeitos.
    </p>
  </div>

  <div class="secao" style="text-align: center; margin: 30px 0;">
    <p><span class="destaque">${dadosEmpresa.cidade || 'São Paulo'} - ${dadosEmpresa.estado || 'SP'}</span>,
    ${formatarDataPorExtenso(dataHoje)}.</p>
  </div>

  <div class="assinaturas">
    <div class="assinatura-bloco">
      <div class="assinatura-linha"></div>
      <p><strong>${dadosEmpresa.nome || dadosEmpresa.nome_fantasia}</strong></p>
      <p>VENDEDORA</p>
      <p style="font-size: 10pt;">CNPJ: ${dadosEmpresa.cnpj}</p>
    </div>

    <div class="assinatura-bloco">
      <div class="assinatura-linha"></div>
      <p><strong>${dadosCliente.nome}</strong></p>
      <p>COMPRADOR(A)</p>
      <p style="font-size: 10pt;">CPF: ${dadosCliente.cpf || '000.000.000-00'}</p>
    </div>

    <div style="margin-top: 60px;">
      <p style="text-align: center; font-weight: bold; margin-bottom: 30px;">TESTEMUNHAS:</p>

      <div style="display: flex; justify-content: space-around;">
        <div style="text-align: center;">
          <div class="assinatura-linha" style="width: 250px;"></div>
          <p style="margin-top: 5px;">Nome: _______________________</p>
          <p>CPF: _______________________</p>
        </div>

        <div style="text-align: center;">
          <div class="assinatura-linha" style="width: 250px;"></div>
          <p style="margin-top: 5px;">Nome: _______________________</p>
          <p>CPF: _______________________</p>
        </div>
      </div>
    </div>
  </div>

  <div style="margin-top: 50px; padding: 20px; background-color: #f5f5f5; border: 1px solid #ccc; font-size: 10pt;">
    <p style="margin: 0; text-align: center;"><strong>OBSERVAÇÕES IMPORTANTES:</strong></p>
    <p style="margin: 10px 0 0 0;">
      1. Este contrato foi gerado eletronicamente pelo sistema AIra CRM em ${formatarData(dataHoje)}.<br>
      2. Recomenda-se o reconhecimento de firma das assinaturas em cartório para maior segurança jurídica.<br>
      3. Guarde este documento em local seguro até a quitação total do veículo.<br>
      4. Em caso de dúvidas, consulte um advogado especializado em direito automotivo.
    </p>
  </div>
</body>
</html>
  `.trim();
};

/**
 * Faz download do contrato em HTML/PDF
 */
export const baixarContrato = (dadosEmpresa, dadosCliente, dadosFinanciamento, dadosVeiculo) => {
  const htmlContrato = gerarContratoHTML(dadosEmpresa, dadosCliente, dadosFinanciamento, dadosVeiculo);

  // Criar um blob com o HTML
  const blob = new Blob([htmlContrato], { type: 'text/html;charset=utf-8' });

  // Criar URL temporária
  const url = URL.createObjectURL(blob);

  // Criar link de download
  const link = document.createElement('a');
  link.href = url;
  link.download = `Contrato_${dadosVeiculo.modelo.replace(/\s/g, '_')}_${dadosCliente.nome.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;

  // Fazer o download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Limpar URL temporária
  URL.revokeObjectURL(url);

  // Retornar também para preview
  return htmlContrato;
};

/**
 * Abre preview do contrato em nova aba
 */
export const previewContrato = (dadosEmpresa, dadosCliente, dadosFinanciamento, dadosVeiculo) => {
  const htmlContrato = gerarContratoHTML(dadosEmpresa, dadosCliente, dadosFinanciamento, dadosVeiculo);

  // Abrir em nova janela
  const novaJanela = window.open('', '_blank');
  novaJanela.document.write(htmlContrato);
  novaJanela.document.close();

  // Adicionar botão de imprimir na nova janela
  setTimeout(() => {
    novaJanela.document.body.innerHTML += `
      <div class="no-print" style="position: fixed; top: 20px; right: 20px; z-index: 9999;">
        <button onclick="window.print()" style="padding: 15px 30px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; box-shadow: 0 2px 10px rgba(0,0,0,0.2);">
          🖨️ Imprimir / Salvar como PDF
        </button>
      </div>
    `;
  }, 100);
};

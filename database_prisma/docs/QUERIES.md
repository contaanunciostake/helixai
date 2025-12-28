# 📖 VendeAI - Exemplos de Queries Complexas

Guia completo de queries usando Prisma Client para o sistema VendeAI.

## 📑 Índice

- [Busca de Veículos](#busca-de-veículos)
- [Gestão de Conversas](#gestão-de-conversas)
- [Analytics e Métricas](#analytics-e-métricas)
- [Agendamentos](#agendamentos)
- [Base de Conhecimento](#base-de-conhecimento)
- [Auditoria](#auditoria)
- [Transações Complexas](#transações-complexas)

---

## 🚗 Busca de Veículos

### 1. Busca Básica com Filtros

```javascript
const prisma = new PrismaClient();

async function buscarVeiculos(empresaId, filtros) {
  const {
    marcas,
    anoMin,
    anoMax,
    precoMin,
    precoMax,
    combustivel,
    cambio,
    busca
  } = filtros;

  return await prisma.vehicle.findMany({
    where: {
      empresa_id: empresaId,
      deleted_at: null,
      status: 'disponivel',
      ...(marcas?.length && { marca: { in: marcas } }),
      ...(anoMin && { ano: { gte: anoMin } }),
      ...(anoMax && { ano: { lte: anoMax } }),
      ...(precoMin && { preco: { gte: precoMin } }),
      ...(precoMax && { preco: { lte: precoMax } }),
      ...(combustivel && { combustivel }),
      ...(cambio && { cambio }),
      ...(busca && {
        OR: [
          { marca: { contains: busca, mode: 'insensitive' } },
          { modelo: { contains: busca, mode: 'insensitive' } },
          { descricao: { contains: busca, mode: 'insensitive' } }
        ]
      })
    },
    orderBy: [
      { destaque: 'desc' },
      { preco: 'asc' }
    ],
    select: {
      id: true,
      marca: true,
      modelo: true,
      ano: true,
      cor: true,
      preco: true,
      preco_fipe: true,
      kilometragem: true,
      combustivel: true,
      cambio: true,
      fotos_urls: true,
      caracteristicas: true,
      destaque: true
    }
  });
}

// Uso
const veiculos = await buscarVeiculos(1, {
  marcas: ['Volkswagen', 'Chevrolet'],
  anoMin: 2020,
  precoMax: 70000,
  cambio: 'automatico'
});
```

### 2. Fulltext Search

```javascript
async function buscarVeiculosFulltext(empresaId, query) {
  // Para PostgreSQL com fulltext search
  return await prisma.$queryRaw`
    SELECT
      id, marca, modelo, ano, preco,
      ts_rank(
        to_tsvector('portuguese', marca || ' ' || modelo || ' ' || COALESCE(descricao, '')),
        plainto_tsquery('portuguese', ${query})
      ) as relevancia
    FROM vehicles
    WHERE
      empresa_id = ${empresaId}
      AND deleted_at IS NULL
      AND status = 'disponivel'
      AND to_tsvector('portuguese', marca || ' ' || modelo || ' ' || COALESCE(descricao, ''))
      @@ plainto_tsquery('portuguese', ${query})
    ORDER BY relevancia DESC
    LIMIT 10
  `;
}

// Uso
const resultados = await buscarVeiculosFulltext(1, 'onix turbo automatico');
```

### 3. Recomendação baseada em preferências

```javascript
async function recomendarVeiculos(empresaId, conversaId) {
  // 1. Buscar contexto da conversa
  const contexto = await prisma.conversationContext.findUnique({
    where: { conversa_id: conversaId },
    include: {
      conversa: true
    }
  });

  if (!contexto) return [];

  const { orcamento_max, preferencias } = contexto;

  // 2. Construir query dinâmica baseada em preferências
  const where = {
    empresa_id: empresaId,
    deleted_at: null,
    status: 'disponivel',
    ...(orcamento_max && { preco: { lte: orcamento_max } })
  };

  // Adicionar preferências do JSON
  if (preferencias) {
    if (preferencias.cambio) {
      where.cambio = preferencias.cambio;
    }
    if (preferencias.combustivel) {
      where.combustivel = preferencias.combustivel;
    }
    if (preferencias.cor) {
      where.cor = preferencias.cor;
    }
  }

  // 3. Buscar veículos
  const veiculos = await prisma.vehicle.findMany({
    where,
    take: 10,
    orderBy: [
      { destaque: 'desc' },
      // Priorizar veículos próximos ao orçamento máximo
      { preco: 'desc' }
    ]
  });

  // 4. Calcular score de relevância
  return veiculos.map(v => {
    let score = 100;

    // Penalizar se muito abaixo do orçamento
    if (orcamento_max) {
      const diferenca = orcamento_max - Number(v.preco);
      const percentualDiferenca = (diferenca / orcamento_max) * 100;
      if (percentualDiferenca > 30) {
        score -= 20;
      }
    }

    // Bonus para características desejadas
    if (preferencias && v.caracteristicas) {
      Object.keys(preferencias).forEach(key => {
        if (v.caracteristicas[key] === true) {
          score += 10;
        }
      });
    }

    return { ...v, relevancia_score: score };
  }).sort((a, b) => b.relevancia_score - a.relevancia_score);
}

// Uso
const recomendacoes = await recomendarVeiculos(1, 123);
```

---

## 💬 Gestão de Conversas

### 1. Criar conversa completa com primeira mensagem

```javascript
async function iniciarConversa(empresaId, clienteTelefone, primeir aMensagem) {
  return await prisma.conversation.create({
    data: {
      empresa_id: empresaId,
      cliente_telefone: clienteTelefone,
      status: 'ativa',
      etapa: 'inicial',
      mensagens: {
        create: {
          remetente_tipo: 'cliente',
          tipo_mensagem: 'texto',
          conteudo: primeiraMensagem,
          enviada_em: new Date()
        }
      },
      contexto: {
        create: {} // Criar contexto vazio
      }
    },
    include: {
      mensagens: true,
      contexto: true
    }
  });
}

// Uso
const conversa = await iniciarConversa(
  1,
  '5567999887766',
  'Olá, procuro um carro automático'
);
```

### 2. Adicionar mensagem e atualizar contexto

```javascript
async function adicionarMensagem(conversaId, dadosMensagem, atualizarContexto = null) {
  return await prisma.$transaction(async (tx) => {
    // 1. Criar mensagem
    const mensagem = await tx.message.create({
      data: {
        conversa_id: conversaId,
        ...dadosMensagem,
        enviada_em: new Date()
      }
    });

    // 2. Atualizar conversa
    await tx.conversation.update({
      where: { id: conversaId },
      data: {
        ultima_mensagem: new Date(),
        total_mensagens: { increment: 1 }
      }
    });

    // 3. Atualizar contexto (se fornecido)
    if (atualizarContexto) {
      await tx.conversationContext.update({
        where: { conversa_id: conversaId },
        data: atualizarContexto
      });
    }

    return mensagem;
  });
}

// Uso
await adicionarMensagem(
  123,
  {
    remetente_tipo: 'bot',
    tipo_mensagem: 'texto',
    conteudo: 'Encontrei 3 opções para você!',
    intencao: 'apresentar_veiculos'
  },
  {
    veiculos_interesse: [1, 5, 8],
    orcamento_max: 70000,
    preferencias: {
      cambio: 'automatico',
      ano_minimo: 2020
    }
  }
);
```

### 3. Buscar conversas com filtros avançados

```javascript
async function buscarConversas(empresaId, filtros = {}) {
  const {
    status,
    vendedorId,
    temperaturaMin,
    dataInicio,
    dataFim,
    page = 1,
    pageSize = 20
  } = filtros;

  const where = {
    empresa_id: empresaId,
    deleted_at: null,
    ...(status && { status }),
    ...(vendedorId && { vendedor_id: vendedorId }),
    ...(temperaturaMin && { temperatura_lead: { gte: temperaturaMin } }),
    ...(dataInicio && {
      primeira_mensagem: { gte: new Date(dataInicio) }
    }),
    ...(dataFim && {
      primeira_mensagem: { lte: new Date(dataFim) }
    })
  };

  const [total, conversas] = await Promise.all([
    prisma.conversation.count({ where }),
    prisma.conversation.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        vendedor: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        },
        _count: {
          select: {
            mensagens: true,
            agendamentos: true
          }
        }
      },
      orderBy: {
        ultima_mensagem: 'desc'
      }
    })
  ]);

  return {
    total,
    totalPages: Math.ceil(total / pageSize),
    currentPage: page,
    data: conversas
  };
}

// Uso
const resultado = await buscarConversas(1, {
  status: 'ativa',
  temperaturaMin: 70,
  page: 1,
  pageSize: 20
});
```

### 4. Histórico completo da conversa

```javascript
async function obterHistoricoCompleto(conversaId) {
  return await prisma.conversation.findUnique({
    where: { id: conversaId },
    include: {
      mensagens: {
        orderBy: { enviada_em: 'asc' },
        select: {
          id: true,
          remetente_tipo: true,
          remetente_nome: true,
          tipo_mensagem: true,
          conteudo: true,
          enviada_em: true,
          intencao: true,
          sentimento: true
        }
      },
      contexto: true,
      agendamentos: {
        orderBy: { data_hora: 'asc' }
      },
      vendedor: {
        select: {
          id: true,
          nome: true,
          email: true
        }
      }
    }
  });
}

// Uso
const historico = await obterHistoricoCompleto(123);
console.log(`Total de mensagens: ${historico.mensagens.length}`);
console.log(`Contexto:`, historico.contexto);
```

---

## 📊 Analytics e Métricas

### 1. Dashboard de métricas diárias

```javascript
async function obterMetricasDiarias(empresaId, dataInicio, dataFim) {
  const metricas = await prisma.analyticsMetric.findMany({
    where: {
      empresa_id: empresaId,
      data: {
        gte: new Date(dataInicio),
        lte: new Date(dataFim)
      },
      hora: null // Métricas do dia completo
    },
    orderBy: {
      data: 'asc'
    }
  });

  // Calcular totais e médias
  const totais = metricas.reduce((acc, m) => ({
    conversas_iniciadas: acc.conversas_iniciadas + m.conversas_iniciadas,
    conversas_convertidas: acc.conversas_convertidas + m.conversas_convertidas,
    mensagens_enviadas: acc.mensagens_enviadas + m.mensagens_enviadas,
    valor_total_vendas: acc.valor_total_vendas + Number(m.valor_total_vendas || 0),
    custo_ia: acc.custo_ia + Number(m.custo_ia_usd || 0)
  }), {
    conversas_iniciadas: 0,
    conversas_convertidas: 0,
    mensagens_enviadas: 0,
    valor_total_vendas: 0,
    custo_ia: 0
  });

  const dias = metricas.length;
  const taxaConversao = totais.conversas_iniciadas > 0
    ? (totais.conversas_convertidas / totais.conversas_iniciadas) * 100
    : 0;

  return {
    metricas, // Array de métricas diárias
    totais,
    medias: {
      conversas_por_dia: totais.conversas_iniciadas / dias,
      mensagens_por_dia: totais.mensagens_enviadas / dias,
      vendas_por_dia: totais.valor_total_vendas / dias
    },
    taxaConversao: taxaConversao.toFixed(2)
  };
}

// Uso
const dashboard = await obterMetricasDiarias(
  1,
  '2024-01-01',
  '2024-01-31'
);

console.log(`Taxa de conversão: ${dashboard.taxaConversao}%`);
console.log(`Receita total: R$ ${dashboard.totais.valor_total_vendas.toFixed(2)}`);
```

### 2. Relatório de performance por vendedor

```javascript
async function relatorioVendedores(empresaId, mes, ano) {
  // Query raw para agregação complexa
  const resultado = await prisma.$queryRaw`
    SELECT
      u.id,
      u.nome,
      COUNT(DISTINCT c.id) as total_conversas,
      COUNT(DISTINCT CASE WHEN c.status = 'convertida' THEN c.id END) as conversas_convertidas,
      COUNT(DISTINCT a.id) as agendamentos_realizados,
      ROUND(
        (COUNT(DISTINCT CASE WHEN c.status = 'convertida' THEN c.id END)::float /
         NULLIF(COUNT(DISTINCT c.id), 0) * 100),
        2
      ) as taxa_conversao
    FROM users u
    LEFT JOIN conversations c ON c.vendedor_id = u.id
      AND c.empresa_id = ${empresaId}
      AND EXTRACT(MONTH FROM c.primeira_mensagem) = ${mes}
      AND EXTRACT(YEAR FROM c.primeira_mensagem) = ${ano}
    LEFT JOIN appointments a ON a.vendedor_id = u.id
      AND a.empresa_id = ${empresaId}
      AND a.status = 'realizado'
      AND EXTRACT(MONTH FROM a.data_hora) = ${mes}
      AND EXTRACT(YEAR FROM a.data_hora) = ${ano}
    WHERE u.empresa_id = ${empresaId}
      AND u.tipo = 'vendedor'
      AND u.deleted_at IS NULL
    GROUP BY u.id, u.nome
    ORDER BY conversas_convertidas DESC
  `;

  return resultado;
}

// Uso
const relatorio = await relatorioVendedores(1, 1, 2024);
relatorio.forEach(v => {
  console.log(`${v.nome}: ${v.conversas_convertidas} vendas (${v.taxa_conversao}%)`);
});
```

### 3. Funil de conversão

```javascript
async function calcularFunilConversao(empresaId, dataInicio, dataFim) {
  const etapas = ['inicial', 'descoberta', 'apresentacao', 'negociacao', 'fechamento'];

  const conversas = await prisma.conversation.findMany({
    where: {
      empresa_id: empresaId,
      primeira_mensagem: {
        gte: new Date(dataInicio),
        lte: new Date(dataFim)
      }
    },
    select: {
      etapa: true,
      status: true
    }
  });

  const funil = etapas.map(etapa => {
    const nesta_etapa = conversas.filter(c => c.etapa === etapa).length;
    return {
      etapa,
      quantidade: nesta_etapa,
      percentual: conversas.length > 0
        ? ((nesta_etapa / conversas.length) * 100).toFixed(2)
        : 0
    };
  });

  const convertidas = conversas.filter(c => c.status === 'convertida').length;

  return {
    funil,
    total_conversas: conversas.length,
    conversas_convertidas: convertidas,
    taxa_conversao_geral: ((convertidas / conversas.length) * 100).toFixed(2)
  };
}

// Uso
const funil = await calcularFunilConversao(1, '2024-01-01', '2024-01-31');
console.log('Funil de conversão:');
funil.funil.forEach(f => {
  console.log(`  ${f.etapa}: ${f.quantidade} (${f.percentual}%)`);
});
```

---

## 📅 Agendamentos

### 1. Criar agendamento com notificações

```javascript
async function criarAgendamento(empresaId, conversaId, dados) {
  return await prisma.$transaction(async (tx) => {
    // 1. Criar agendamento
    const agendamento = await tx.appointment.create({
      data: {
        empresa_id: empresaId,
        conversa_id: conversaId,
        ...dados,
        status: 'agendado',
        notificado_cliente: false,
        notificado_vendedor: false
      },
      include: {
        conversa: true,
        vendedor: true
      }
    });

    // 2. Atualizar conversa
    await tx.conversation.update({
      where: { id: conversaId },
      data: {
        etapa: 'negociacao', // Avançar no funil
        temperatura_lead: { increment: 20 } // Aumentar temperatura
      }
    });

    // 3. Criar log de auditoria
    await tx.auditLog.create({
      data: {
        empresa_id: empresaId,
        acao: 'create',
        entidade_tipo: 'Appointment',
        entidade_id: agendamento.id,
        dados_novos: agendamento,
        descricao: `Test drive agendado para ${dados.cliente_nome}`
      }
    });

    return agendamento;
  });
}

// Uso
const agendamento = await criarAgendamento(1, 123, {
  cliente_nome: 'João Silva',
  cliente_telefone: '5567999887766',
  tipo: 'test_drive',
  data_hora: new Date('2024-02-15T10:00:00'),
  vendedor_id: 5,
  observacoes: 'Cliente interessado no Onix Turbo'
});
```

### 2. Agenda do dia

```javascript
async function agendaDoDia(empresaId, vendedorId, data) {
  const inicioDia = new Date(data);
  inicioDia.setHours(0, 0, 0, 0);

  const fimDia = new Date(data);
  fimDia.setHours(23, 59, 59, 999);

  const agendamentos = await prisma.appointment.findMany({
    where: {
      empresa_id: empresaId,
      ...(vendedorId && { vendedor_id: vendedorId }),
      data_hora: {
        gte: inicioDia,
        lte: fimDia
      },
      status: {
        notIn: ['cancelado']
      }
    },
    include: {
      conversa: {
        include: {
          contexto: {
            include: {
              veiculo_principal: {
                select: {
                  marca: true,
                  modelo: true,
                  ano: true
                }
              }
            }
          }
        }
      },
      vendedor: {
        select: {
          nome: true
        }
      }
    },
    orderBy: {
      data_hora: 'asc'
    }
  });

  return agendamentos.map(a => ({
    ...a,
    veiculo_interesse: a.conversa?.contexto?.veiculo_principal
  }));
}

// Uso
const agenda = await agendaDoDia(1, 5, '2024-02-15');
console.log(`Agendamentos do dia: ${agenda.length}`);
```

---

## 📚 Base de Conhecimento

### 1. Buscar FAQ relevante

```javascript
async function buscarFAQ(empresaId, pergunta) {
  // Buscar por palavras-chave
  const palavras = pergunta.toLowerCase().split(' ').filter(p => p.length > 3);

  const resultados = await prisma.knowledgeBase.findMany({
    where: {
      empresa_id: empresaId,
      ativo: true,
      OR: [
        {
          palavras_chave: {
            hasSome: palavras
          }
        },
        {
          pergunta: {
            contains: pergunta,
            mode: 'insensitive'
          }
        },
        {
          resposta: {
            contains: pergunta,
            mode: 'insensitive'
          }
        }
      ]
    },
    orderBy: [
      { relevancia_score: 'desc' },
      { vezes_usado: 'desc' }
    ],
    take: 5
  });

  // Atualizar contador de uso
  if (resultados.length > 0) {
    await prisma.knowledgeBase.update({
      where: { id: resultados[0].id },
      data: {
        vezes_usado: { increment: 1 },
        ultima_utilizacao: new Date()
      }
    });
  }

  return resultados;
}

// Uso
const faqs = await buscarFAQ(1, 'como funciona o financiamento?');
```

---

## 🔍 Auditoria

### 1. Criar log de auditoria

```javascript
async function registrarAuditoria(empresaId, acao, entidade, usuario) {
  return await prisma.auditLog.create({
    data: {
      empresa_id: empresaId,
      acao,
      entidade_tipo: entidade.tipo,
      entidade_id: entidade.id,
      usuario_id: usuario?.id,
      usuario_ip: usuario?.ip,
      user_agent: usuario?.userAgent,
      dados_anteriores: entidade.dadosAnteriores,
      dados_novos: entidade.dadosNovos,
      descricao: entidade.descricao
    }
  });
}

// Uso em update
async function atualizarVeiculo(veiculoId, dadosNovos, usuario) {
  // Buscar dados antigos
  const veiculoAntigo = await prisma.vehicle.findUnique({
    where: { id: veiculoId }
  });

  // Atualizar
  const veiculoAtualizado = await prisma.vehicle.update({
    where: { id: veiculoId },
    data: dadosNovos
  });

  // Registrar auditoria
  await registrarAuditoria(
    veiculoAtualizado.empresa_id,
    'update',
    {
      tipo: 'Vehicle',
      id: veiculoId,
      dadosAnteriores: veiculoAntigo,
      dadosNovos: veiculoAtualizado,
      descricao: `Veículo ${veiculoAtualizado.marca} ${veiculoAtualizado.modelo} atualizado`
    },
    usuario
  );

  return veiculoAtualizado;
}
```

### 2. Relatório de auditoria

```javascript
async function relatorioAuditoria(empresaId, filtros = {}) {
  const {
    acao,
    entidadeTipo,
    usuarioId,
    dataInicio,
    dataFim,
    page = 1,
    pageSize = 50
  } = filtros;

  const where = {
    empresa_id: empresaId,
    ...(acao && { acao }),
    ...(entidadeTipo && { entidade_tipo: entidadeTipo }),
    ...(usuarioId && { usuario_id: usuarioId }),
    ...(dataInicio && {
      created_at: { gte: new Date(dataInicio) }
    }),
    ...(dataFim && {
      created_at: { lte: new Date(dataFim) }
    })
  };

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        usuario: {
          select: {
            nome: true,
            email: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })
  ]);

  return {
    total,
    totalPages: Math.ceil(total / pageSize),
    currentPage: page,
    data: logs
  };
}

// Uso
const auditoria = await relatorioAuditoria(1, {
  acao: 'update',
  entidadeTipo: 'Vehicle',
  dataInicio: '2024-01-01',
  dataFim: '2024-01-31'
});
```

---

## 💼 Transações Complexas

### 1. Finalizar venda (transação completa)

```javascript
async function finalizarVenda(empresaId, conversaId, veiculoId, dadosVenda) {
  return await prisma.$transaction(async (tx) => {
    // 1. Atualizar conversa
    await tx.conversation.update({
      where: { id: conversaId },
      data: {
        status: 'convertida',
        etapa: 'fechamento',
        finalizada_em: new Date(),
        temperatura_lead: 100,
        probabilidade_fechamento: 100
      }
    });

    // 2. Atualizar veículo
    const veiculo = await tx.vehicle.update({
      where: { id: veiculoId },
      data: {
        status: 'vendido'
      }
    });

    // 3. Registrar na métrica do dia
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    await tx.analyticsMetric.upsert({
      where: {
        empresa_id_data_hora: {
          empresa_id: empresaId,
          data: hoje,
          hora: null
        }
      },
      create: {
        empresa_id: empresaId,
        data: hoje,
        conversas_convertidas: 1,
        veiculos_vendidos: 1,
        valor_total_vendas: veiculo.preco
      },
      update: {
        conversas_convertidas: { increment: 1 },
        veiculos_vendidos: { increment: 1 },
        valor_total_vendas: { increment: veiculo.preco }
      }
    });

    // 4. Criar log de auditoria
    await tx.auditLog.create({
      data: {
        empresa_id: empresaId,
        acao: 'venda',
        entidade_tipo: 'Vehicle',
        entidade_id: veiculoId,
        dados_novos: {
          ...dadosVenda,
          conversa_id: conversaId,
          valor: veiculo.preco
        },
        descricao: `Venda finalizada: ${veiculo.marca} ${veiculo.modelo} - R$ ${veiculo.preco}`
      }
    });

    // 5. Retornar dados da venda
    return {
      conversa_id: conversaId,
      veiculo,
      valor_venda: veiculo.preco,
      data_venda: new Date()
    };
  });
}

// Uso
const venda = await finalizarVenda(1, 123, 45, {
  forma_pagamento: 'financiamento',
  valor_entrada: 15000,
  observacoes: 'Cliente aprovado pelo banco'
});
```

### 2. Importação em lote de veículos

```javascript
async function importarVeiculos(empresaId, veiculos) {
  const resultados = {
    sucesso: 0,
    erro: 0,
    erros: []
  };

  // Usar transação para garantir atomicidade
  await prisma.$transaction(async (tx) => {
    for (const veiculo of veiculos) {
      try {
        await tx.vehicle.create({
          data: {
            empresa_id: empresaId,
            ...veiculo,
            status: 'disponivel'
          }
        });
        resultados.sucesso++;
      } catch (error) {
        resultados.erro++;
        resultados.erros.push({
          veiculo: `${veiculo.marca} ${veiculo.modelo}`,
          erro: error.message
        });
      }
    }
  });

  // Registrar auditoria da importação
  await prisma.auditLog.create({
    data: {
      empresa_id: empresaId,
      acao: 'import',
      entidade_tipo: 'Vehicle',
      descricao: `Importação em lote: ${resultados.sucesso} sucesso, ${resultados.erro} erros`
    }
  });

  return resultados;
}

// Uso
const resultado = await importarVeiculos(1, [
  { marca: 'Volkswagen', modelo: 'Gol', ano: 2020, preco: 45000, ... },
  { marca: 'Fiat', modelo: 'Argo', ano: 2021, preco: 52000, ... },
  // ... mais veículos
]);
```

---

## 🎯 Dicas de Performance

### 1. Use select para campos específicos

```javascript
// ❌ Ruim: busca todos os campos
const conversas = await prisma.conversation.findMany({
  where: { empresa_id: 1 }
});

// ✅ Bom: busca apenas o necessário
const conversas = await prisma.conversation.findMany({
  where: { empresa_id: 1 },
  select: {
    id: true,
    cliente_nome: true,
    status: true,
    ultima_mensagem: true
  }
});
```

### 2. Use include com moderação

```javascript
// ❌ Ruim: include tudo
const conversa = await prisma.conversation.findUnique({
  where: { id: 123 },
  include: {
    mensagens: true, // Pode ser milhares!
    vendedor: true,
    agendamentos: true
  }
});

// ✅ Bom: include apenas o necessário
const conversa = await prisma.conversation.findUnique({
  where: { id: 123 },
  include: {
    mensagens: {
      take: 10, // Últimas 10
      orderBy: { enviada_em: 'desc' }
    },
    vendedor: {
      select: { nome: true, email: true }
    }
  }
});
```

### 3. Use Promise.all para queries paralelas

```javascript
// ❌ Ruim: sequencial
const veiculos = await prisma.vehicle.findMany(...);
const conversas = await prisma.conversation.findMany(...);
const metricas = await prisma.analyticsMetric.findMany(...);

// ✅ Bom: paralelo
const [veiculos, conversas, metricas] = await Promise.all([
  prisma.vehicle.findMany(...),
  prisma.conversation.findMany(...),
  prisma.analyticsMetric.findMany(...)
]);
```

---

## 📚 Recursos Adicionais

- [Prisma Client API Reference](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Query Optimization](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Transactions](https://www.prisma.io/docs/concepts/components/prisma-client/transactions)

---

**VendeAI Bot System** - Documentação de Queries © 2024

/**
 * ════════════════════════════════════════════════════════════════
 * VENDEAI BOT SYSTEM - DATABASE SEED
 * ════════════════════════════════════════════════════════════════
 *
 * Popula o banco de dados com dados de exemplo para desenvolvimento
 * e testes.
 *
 * EXECUTAR: npm run prisma:seed
 *
 * ════════════════════════════════════════════════════════════════
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  // ══════════════════════════════════════════════════════════════
  // LIMPAR DADOS EXISTENTES (apenas em desenvolvimento)
  // ══════════════════════════════════════════════════════════════
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 Limpando dados existentes...');

    await prisma.auditLog.deleteMany();
    await prisma.analyticsMetric.deleteMany();
    await prisma.knowledgeBase.deleteMany();
    await prisma.integration.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.conversationContext.deleteMany();
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.botBehavior.deleteMany();
    await prisma.businessHours.deleteMany();
    await prisma.automatedMessage.deleteMany();
    await prisma.botConfiguration.deleteMany();
    await prisma.user.deleteMany();
    await prisma.empresa.deleteMany();

    console.log('✅ Dados limpos!\n');
  }

  // ══════════════════════════════════════════════════════════════
  // CRIAR EMPRESAS
  // ══════════════════════════════════════════════════════════════
  console.log('🏢 Criando empresas...');

  const empresa1 = await prisma.empresa.create({
    data: {
      nome: 'Feirão ShowCar',
      cnpj: '12.345.678/0001-90',
      endereco: 'Av. Brasil, 1000 - Campo Grande, MS',
      telefone: '(67) 99988-3484',
      email: 'contato@feiraoshow car.com.br',
      whatsapp_numero: '556799883484',
      whatsapp_conectado: true,
      nicho: 'veiculos',
      bot_ativo: true,
      plano: 'pro',
      limite_mensagens: 10000,
      limite_usuarios: 20
    }
  });

  const empresa2 = await prisma.empresa.create({
    data: {
      nome: 'Imóveis Prime',
      cnpj: '98.765.432/0001-10',
      endereco: 'Rua das Flores, 500 - São Paulo, SP',
      telefone: '(11) 98765-4321',
      email: 'contato@imoveisprime.com.br',
      whatsapp_numero: '5511987654321',
      whatsapp_conectado: false,
      nicho: 'imoveis',
      bot_ativo: false,
      plano: 'basic',
      limite_mensagens: 5000,
      limite_usuarios: 10
    }
  });

  console.log(`✅ Criadas ${2} empresas\n`);

  // ══════════════════════════════════════════════════════════════
  // CRIAR USUÁRIOS
  // ══════════════════════════════════════════════════════════════
  console.log('👥 Criando usuários...');

  const senhaHash = await bcrypt.hash('senha123', 10);

  const admin1 = await prisma.user.create({
    data: {
      empresa_id: empresa1.id,
      nome: 'João Silva',
      email: 'joao@feiraoshow car.com.br',
      senha_hash: senhaHash,
      telefone: '(67) 99999-1111',
      tipo: 'admin',
      ativo: true
    }
  });

  const vendedor1 = await prisma.user.create({
    data: {
      empresa_id: empresa1.id,
      nome: 'Maria Santos',
      email: 'maria@feiraoshow car.com.br',
      senha_hash: senhaHash,
      telefone: '(67) 99999-2222',
      tipo: 'vendedor',
      ativo: true
    }
  });

  const vendedor2 = await prisma.user.create({
    data: {
      empresa_id: empresa1.id,
      nome: 'Pedro Oliveira',
      email: 'pedro@feiraoshow car.com.br',
      senha_hash: senhaHash,
      telefone: '(67) 99999-3333',
      tipo: 'vendedor',
      ativo: true
    }
  });

  console.log(`✅ Criados ${3} usuários\n`);

  // ══════════════════════════════════════════════════════════════
  // CRIAR CONFIGURAÇÃO DO BOT
  // ══════════════════════════════════════════════════════════════
  console.log('🤖 Criando configuração do bot...');

  await prisma.botConfiguration.create({
    data: {
      empresa_id: empresa1.id,
      nome_bot: 'AIra',
      saudacao: 'Olá! Tudo bem? Sou a AIra, vendedora do Feirão ShowCar! 😊\n\nEstou aqui para te ajudar a encontrar o carro perfeito. O que você procura?',
      despedida: 'Foi um prazer conversar com você! Qualquer dúvida, é só chamar. Até mais! 👋',
      tom_conversa: 'profissional_amigavel',
      auto_resposta_ativa: true,
      tempo_resposta_ms: 2000,
      max_tentativas_ia: 3,
      modelo_ia: 'claude-3-sonnet',
      temperatura: 0.7,
      max_tokens: 4096,
      enviar_audio: true,
      voz_id: 'EXAVITQu4vr4xnSDxMaL', // Sarah voice
      funcionalidades: {
        busca_veiculos: true,
        agendamento: true,
        fipe: true,
        financiamento: true,
        avaliacao_troca: true
      },
      max_mensagens_dia: 500,
      intervalo_mensagens_ms: 1000
    }
  });

  console.log('✅ Configuração do bot criada\n');

  // ══════════════════════════════════════════════════════════════
  // CRIAR MENSAGENS AUTOMÁTICAS
  // ══════════════════════════════════════════════════════════════
  console.log('💬 Criando mensagens automáticas...');

  await prisma.automatedMessage.createMany({
    data: [
      {
        empresa_id: empresa1.id,
        tipo: 'boas_vindas',
        nome: 'Boas-vindas padrão',
        descricao: 'Mensagem enviada no primeiro contato',
        mensagem: 'Olá {nome}! 👋\n\nBem-vindo(a) ao Feirão ShowCar! Sou a AIra e estou aqui para te ajudar.',
        trigger_evento: 'primeiro_contato',
        ativo: true,
        prioridade: 10
      },
      {
        empresa_id: empresa1.id,
        tipo: 'fora_horario',
        nome: 'Fora do horário',
        descricao: 'Mensagem enviada fora do horário comercial',
        mensagem: 'Olá! No momento estamos fora do horário de atendimento.\n\n⏰ Horário: Segunda a Sexta, 8h às 18h\n\nMas fique tranquilo! Vou guardar sua mensagem e respondo assim que voltarmos. 😊',
        trigger_evento: 'fora_horario',
        ativo: true,
        prioridade: 5
      },
      {
        empresa_id: empresa1.id,
        tipo: 'follow_up',
        nome: 'Follow-up 24h',
        descricao: 'Enviado 24h após último contato sem resposta',
        mensagem: 'Oi {nome}! 😊\n\nVi que conversamos ontem sobre carros. Ficou com alguma dúvida? Estou aqui para ajudar!',
        trigger_evento: 'inativo_24h',
        ativo: true,
        prioridade: 3,
        delay_ms: 86400000 // 24 horas
      }
    ]
  });

  console.log('✅ Mensagens automáticas criadas\n');

  // ══════════════════════════════════════════════════════════════
  // CRIAR HORÁRIOS DE FUNCIONAMENTO
  // ══════════════════════════════════════════════════════════════
  console.log('🕐 Criando horários de funcionamento...');

  // Segunda a Sexta: 8h às 18h
  for (let dia = 1; dia <= 5; dia++) {
    await prisma.businessHours.create({
      data: {
        empresa_id: empresa1.id,
        dia_semana: dia,
        horario_inicio: '08:00',
        horario_fim: '18:00',
        ativo: true,
        mensagem_fora_horario: 'Estamos fechados no momento. Nosso horário é de segunda a sexta, das 8h às 18h.'
      }
    });
  }

  // Sábado: 8h às 12h
  await prisma.businessHours.create({
    data: {
      empresa_id: empresa1.id,
      dia_semana: 6,
      horario_inicio: '08:00',
      horario_fim: '12:00',
      ativo: true,
      mensagem_fora_horario: 'Aos sábados atendemos apenas pela manhã, das 8h às 12h.'
    }
  });

  console.log('✅ Horários de funcionamento criados\n');

  // ══════════════════════════════════════════════════════════════
  // CRIAR REGRAS DE COMPORTAMENTO
  // ══════════════════════════════════════════════════════════════
  console.log('⚙️ Criando regras de comportamento...');

  await prisma.botBehavior.createMany({
    data: [
      {
        empresa_id: empresa1.id,
        nome: 'Detectar interesse em preço',
        descricao: 'Quando cliente pergunta sobre preço/valor',
        categoria: 'vendas',
        condicao_trigger: {
          tipo: 'palavra_chave',
          valores: ['preço', 'valor', 'quanto custa', 'quanto é', 'quanto ta']
        },
        acao_tipo: 'apresentar_opcoes_pagamento',
        acao_parametros: {
          mostrar_financiamento: true,
          mostrar_entrada: true
        },
        ativo: true,
        prioridade: 10
      },
      {
        empresa_id: empresa1.id,
        nome: 'Oferecer test drive',
        descricao: 'Oferecer test drive quando cliente demonstra interesse',
        categoria: 'vendas',
        condicao_trigger: {
          tipo: 'intencao',
          valores: ['interesse_alto', 'gostei_veiculo']
        },
        acao_tipo: 'oferecer_test_drive',
        acao_parametros: {
          mensagem_template: 'Que tal agendar um test drive para conhecer o carro pessoalmente? 🚗'
        },
        ativo: true,
        prioridade: 8
      }
    ]
  });

  console.log('✅ Regras de comportamento criadas\n');

  // ══════════════════════════════════════════════════════════════
  // CRIAR VEÍCULOS
  // ══════════════════════════════════════════════════════════════
  console.log('🚗 Criando veículos...');

  const veiculos = await prisma.vehicle.createMany({
    data: [
      {
        empresa_id: empresa1.id,
        marca: 'Volkswagen',
        modelo: 'Gol 1.6 MSI',
        ano: 2020,
        cor: 'Branco',
        kilometragem: 45000,
        combustivel: 'flex',
        cambio: 'manual',
        motor: '1.6',
        portas: 4,
        preco: 45000.00,
        preco_fipe: 47500.00,
        aceita_troca: true,
        descricao: 'Gol 1.6 MSI em excelente estado, único dono, manual e chave reserva.',
        fotos_urls: [
          'https://example.com/gol-1.jpg',
          'https://example.com/gol-2.jpg'
        ],
        caracteristicas: {
          ar_condicionado: true,
          direcao_hidraulica: true,
          vidros_eletricos: true,
          alarme: true
        },
        status: 'disponivel',
        destaque: true
      },
      {
        empresa_id: empresa1.id,
        marca: 'Chevrolet',
        modelo: 'Onix 1.0 Turbo LT',
        ano: 2022,
        cor: 'Prata',
        kilometragem: 25000,
        combustivel: 'flex',
        cambio: 'automatico',
        motor: '1.0 Turbo',
        portas: 4,
        preco: 68000.00,
        preco_fipe: 72000.00,
        aceita_troca: true,
        descricao: 'Onix Turbo automático, completo, baixa quilometragem.',
        fotos_urls: [
          'https://example.com/onix-1.jpg',
          'https://example.com/onix-2.jpg'
        ],
        caracteristicas: {
          ar_condicionado: true,
          direcao_eletrica: true,
          vidros_eletricos: true,
          central_multimidia: true,
          sensor_estacionamento: true
        },
        status: 'disponivel',
        destaque: true
      },
      {
        empresa_id: empresa1.id,
        marca: 'Fiat',
        modelo: 'Argo 1.3 Firefly',
        ano: 2021,
        cor: 'Vermelho',
        kilometragem: 35000,
        combustivel: 'flex',
        cambio: 'manual',
        motor: '1.3',
        portas: 4,
        preco: 52000.00,
        preco_fipe: 55000.00,
        aceita_troca: true,
        descricao: 'Argo 1.3 Drive, econômico e moderno.',
        fotos_urls: [
          'https://example.com/argo-1.jpg'
        ],
        caracteristicas: {
          ar_condicionado: true,
          direcao_eletrica: true,
          vidros_eletricos: true
        },
        status: 'disponivel',
        destaque: false
      },
      {
        empresa_id: empresa1.id,
        marca: 'Toyota',
        modelo: 'Corolla 2.0 XEi',
        ano: 2023,
        cor: 'Preto',
        kilometragem: 15000,
        combustivel: 'flex',
        cambio: 'automatico',
        motor: '2.0',
        portas: 4,
        preco: 135000.00,
        preco_fipe: 142000.00,
        aceita_troca: true,
        descricao: 'Corolla 2023, seminovo, revisões em dia.',
        fotos_urls: [
          'https://example.com/corolla-1.jpg',
          'https://example.com/corolla-2.jpg',
          'https://example.com/corolla-3.jpg'
        ],
        caracteristicas: {
          ar_condicionado: true,
          direcao_eletrica: true,
          vidros_eletricos: true,
          central_multimidia: true,
          sensor_estacionamento: true,
          camera_re: true,
          bancos_couro: true
        },
        status: 'disponivel',
        destaque: true
      },
      {
        empresa_id: empresa1.id,
        marca: 'Honda',
        modelo: 'Civic 2.0 Sport',
        ano: 2022,
        cor: 'Cinza',
        kilometragem: 20000,
        combustivel: 'flex',
        cambio: 'automatico',
        motor: '2.0',
        portas: 4,
        preco: 145000.00,
        preco_fipe: 150000.00,
        aceita_troca: true,
        descricao: 'Civic Sport 2022, top de linha, impecável.',
        fotos_urls: [
          'https://example.com/civic-1.jpg',
          'https://example.com/civic-2.jpg'
        ],
        caracteristicas: {
          ar_condicionado: true,
          direcao_eletrica: true,
          vidros_eletricos: true,
          central_multimidia: true,
          sensor_estacionamento: true,
          camera_re: true,
          teto_solar: true,
          bancos_couro: true
        },
        status: 'disponivel',
        destaque: true
      }
    ]
  });

  console.log(`✅ Criados ${5} veículos\n`);

  // ══════════════════════════════════════════════════════════════
  // CRIAR CONVERSAS DE EXEMPLO
  // ══════════════════════════════════════════════════════════════
  console.log('💬 Criando conversas de exemplo...');

  const conversa1 = await prisma.conversation.create({
    data: {
      empresa_id: empresa1.id,
      cliente_telefone: '5567999887766',
      cliente_nome: 'Carlos Alberto',
      cliente_email: 'carlos@email.com',
      status: 'ativa',
      etapa: 'negociacao',
      vendedor_id: vendedor1.id,
      total_mensagens: 15,
      temperatura_lead: 75,
      probabilidade_fechamento: 60,
      primeira_mensagem: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
      ultima_mensagem: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 horas atrás
    }
  });

  const conversa2 = await prisma.conversation.create({
    data: {
      empresa_id: empresa1.id,
      cliente_telefone: '5567999776655',
      cliente_nome: 'Ana Paula',
      status: 'ativa',
      etapa: 'descoberta',
      total_mensagens: 5,
      temperatura_lead: 50,
      probabilidade_fechamento: 30,
      primeira_mensagem: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hora atrás
      ultima_mensagem: new Date(Date.now() - 30 * 60 * 1000) // 30 min atrás
    }
  });

  console.log(`✅ Criadas ${2} conversas\n`);

  // ══════════════════════════════════════════════════════════════
  // CRIAR MENSAGENS
  // ══════════════════════════════════════════════════════════════
  console.log('✉️ Criando mensagens...');

  await prisma.message.createMany({
    data: [
      {
        conversa_id: conversa1.id,
        remetente_tipo: 'cliente',
        remetente_nome: 'Carlos Alberto',
        tipo_mensagem: 'texto',
        conteudo: 'Oi, boa tarde!',
        intencao: 'saudacao',
        sentimento: 'neutro',
        lida: true,
        enviada_em: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        conversa_id: conversa1.id,
        remetente_tipo: 'bot',
        remetente_nome: 'AIra',
        tipo_mensagem: 'texto',
        conteudo: 'Olá Carlos! Tudo bem? Sou a AIra do Feirão ShowCar. Como posso ajudar?',
        lida: true,
        enviada_em: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 2000)
      },
      {
        conversa_id: conversa1.id,
        remetente_tipo: 'cliente',
        remetente_nome: 'Carlos Alberto',
        tipo_mensagem: 'texto',
        conteudo: 'Tô procurando um carro automático, até 70 mil',
        intencao: 'buscar_veiculo',
        sentimento: 'positivo',
        entidades_extraidas: {
          orcamento: 70000,
          preferencias: ['automatico']
        },
        lida: true,
        enviada_em: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 5000)
      }
    ]
  });

  console.log(`✅ Criadas ${3} mensagens\n`);

  // ══════════════════════════════════════════════════════════════
  // CRIAR CONTEXTO DA CONVERSA
  // ══════════════════════════════════════════════════════════════
  console.log('🧠 Criando contextos de conversa...');

  await prisma.conversationContext.create({
    data: {
      conversa_id: conversa1.id,
      orcamento_max: 70000.00,
      forma_pagamento: 'financiamento',
      preferencias: {
        cambio: 'automatico',
        ano_minimo: 2020
      },
      perfil_cliente: 'decidido',
      resumo_conversa: 'Cliente procura carro automático até 70 mil. Demonstrou interesse no Onix Turbo.',
      proximos_passos: [
        'Enviar detalhes do financiamento',
        'Oferecer test drive'
      ]
    }
  });

  console.log('✅ Contextos criados\n');

  // ══════════════════════════════════════════════════════════════
  // CRIAR AGENDAMENTOS
  // ══════════════════════════════════════════════════════════════
  console.log('📅 Criando agendamentos...');

  await prisma.appointment.create({
    data: {
      empresa_id: empresa1.id,
      conversa_id: conversa1.id,
      cliente_nome: 'Carlos Alberto',
      cliente_telefone: '5567999887766',
      cliente_email: 'carlos@email.com',
      tipo: 'test_drive',
      data_hora: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // daqui 2 dias
      duracao_minutos: 30,
      vendedor_id: vendedor1.id,
      local: 'Feirão ShowCar - Av. Brasil, 1000',
      observacoes: 'Cliente interessado no Onix Turbo',
      status: 'agendado',
      notificado_cliente: true,
      notificado_vendedor: true
    }
  });

  console.log('✅ Agendamentos criados\n');

  // ══════════════════════════════════════════════════════════════
  // CRIAR INTEGRAÇÕES
  // ══════════════════════════════════════════════════════════════
  console.log('🔌 Criando integrações...');

  await prisma.integration.createMany({
    data: [
      {
        empresa_id: empresa1.id,
        tipo: 'whatsapp',
        nome: 'WhatsApp Business API',
        config: {
          phone_number_id: 'enc_xxxxx',
          webhook_verify_token: 'enc_xxxxx'
        },
        ativo: true,
        conectado: true,
        total_requisicoes: 1250,
        total_erros: 3,
        ultima_requisicao: new Date()
      },
      {
        empresa_id: empresa1.id,
        tipo: 'anthropic',
        nome: 'Anthropic Claude AI',
        config: {
          api_key: 'enc_sk-ant-xxxxx',
          model: 'claude-3-sonnet'
        },
        ativo: true,
        conectado: true,
        total_requisicoes: 850,
        total_erros: 1
      },
      {
        empresa_id: empresa1.id,
        tipo: 'elevenlabs',
        nome: 'ElevenLabs TTS',
        config: {
          api_key: 'enc_xxxxx',
          voice_id: 'EXAVITQu4vr4xnSDxMaL'
        },
        ativo: true,
        conectado: true,
        total_requisicoes: 350
      },
      {
        empresa_id: empresa1.id,
        tipo: 'fipe',
        nome: 'Tabela FIPE',
        config: {
          api_url: 'https://parallelum.com.br/fipe/api/v1'
        },
        ativo: true,
        conectado: true,
        total_requisicoes: 120
      }
    ]
  });

  console.log('✅ Integrações criadas\n');

  // ══════════════════════════════════════════════════════════════
  // CRIAR BASE DE CONHECIMENTO
  // ══════════════════════════════════════════════════════════════
  console.log('📚 Criando base de conhecimento...');

  await prisma.knowledgeBase.createMany({
    data: [
      {
        empresa_id: empresa1.id,
        categoria: 'financiamento',
        titulo: 'Como funciona o financiamento?',
        pergunta: 'Como funciona o financiamento de veículos?',
        resposta: 'Oferecemos financiamento em até 60 meses com taxas a partir de 1,2% ao mês. Trabalhamos com os principais bancos do mercado. A aprovação é rápida, geralmente em 24 horas.',
        palavras_chave: ['financiamento', 'parcelamento', 'banco', 'prazo', 'taxa'],
        vezes_usado: 45,
        relevancia_score: 0.92,
        ativo: true
      },
      {
        empresa_id: empresa1.id,
        categoria: 'garantia',
        titulo: 'Qual a garantia dos veículos?',
        pergunta: 'Os carros têm garantia?',
        resposta: 'Todos os nossos veículos seminovos contam com 3 meses de garantia de motor e câmbio. Oferecemos também garantia estendida opcional de até 12 meses.',
        palavras_chave: ['garantia', 'cobertura', 'motor', 'cambio', 'problema'],
        vezes_usado: 32,
        relevancia_score: 0.88,
        ativo: true
      },
      {
        empresa_id: empresa1.id,
        categoria: 'documentacao',
        titulo: 'Documentação necessária para compra',
        pergunta: 'Quais documentos preciso para comprar?',
        resposta: 'Para compra à vista: RG, CPF e comprovante de residência. Para financiamento: adicionar comprovante de renda dos últimos 3 meses.',
        palavras_chave: ['documentos', 'documentacao', 'compra', 'necessario', 'preciso'],
        vezes_usado: 28,
        relevancia_score: 0.85,
        ativo: true
      },
      {
        empresa_id: empresa1.id,
        categoria: 'troca',
        titulo: 'Aceitamos veículos na troca',
        pergunta: 'Vocês aceitam meu carro na troca?',
        resposta: 'Sim! Aceitamos seu veículo como parte do pagamento. Fazemos avaliação gratuita e rápida usando a tabela FIPE como referência.',
        palavras_chave: ['troca', 'veiculo', 'carro usado', 'avaliacao', 'fipe'],
        vezes_usado: 38,
        relevancia_score: 0.90,
        ativo: true
      }
    ]
  });

  console.log('✅ Base de conhecimento criada\n');

  // ══════════════════════════════════════════════════════════════
  // CRIAR MÉTRICAS
  // ══════════════════════════════════════════════════════════════
  console.log('📊 Criando métricas...');

  const hoje = new Date();
  const ontem = new Date(hoje);
  ontem.setDate(ontem.getDate() - 1);

  await prisma.analyticsMetric.createMany({
    data: [
      {
        empresa_id: empresa1.id,
        data: ontem,
        conversas_iniciadas: 25,
        conversas_finalizadas: 18,
        conversas_convertidas: 3,
        mensagens_enviadas: 150,
        mensagens_recebidas: 120,
        tempo_resposta_medio_ms: 2500,
        leads_gerados: 12,
        test_drives_agendados: 5,
        veiculos_vendidos: 2,
        valor_total_vendas: 113000.00,
        queries_ia: 180,
        custo_ia_usd: 2.45
      },
      {
        empresa_id: empresa1.id,
        data: hoje,
        conversas_iniciadas: 18,
        conversas_finalizadas: 10,
        conversas_convertidas: 1,
        mensagens_enviadas: 95,
        mensagens_recebidas: 78,
        tempo_resposta_medio_ms: 2200,
        leads_gerados: 8,
        test_drives_agendados: 3,
        veiculos_vendidos: 1,
        valor_total_vendas: 68000.00,
        queries_ia: 120,
        custo_ia_usd: 1.80
      }
    ]
  });

  console.log('✅ Métricas criadas\n');

  // ══════════════════════════════════════════════════════════════
  // CRIAR LOGS DE AUDITORIA
  // ══════════════════════════════════════════════════════════════
  console.log('📝 Criando logs de auditoria...');

  await prisma.auditLog.createMany({
    data: [
      {
        empresa_id: empresa1.id,
        acao: 'create',
        entidade_tipo: 'Vehicle',
        entidade_id: 1,
        usuario_id: admin1.id,
        usuario_ip: '192.168.1.100',
        dados_novos: {
          marca: 'Volkswagen',
          modelo: 'Gol 1.6 MSI',
          preco: 45000
        },
        descricao: 'Veículo adicionado ao estoque'
      },
      {
        empresa_id: empresa1.id,
        acao: 'update',
        entidade_tipo: 'BotConfiguration',
        entidade_id: 1,
        usuario_id: admin1.id,
        usuario_ip: '192.168.1.100',
        dados_anteriores: {
          bot_ativo: false
        },
        dados_novos: {
          bot_ativo: true
        },
        descricao: 'Bot ativado'
      },
      {
        empresa_id: empresa1.id,
        acao: 'login',
        entidade_tipo: 'User',
        entidade_id: vendedor1.id,
        usuario_id: vendedor1.id,
        usuario_ip: '192.168.1.101',
        descricao: 'Login realizado'
      }
    ]
  });

  console.log('✅ Logs de auditoria criados\n');

  // ══════════════════════════════════════════════════════════════
  // FINALIZAÇÃO
  // ══════════════════════════════════════════════════════════════
  console.log('\n✅ Seed concluído com sucesso!');
  console.log('\n📊 Resumo:');
  console.log(`   • ${2} empresas`);
  console.log(`   • ${3} usuários`);
  console.log(`   • ${5} veículos`);
  console.log(`   • ${2} conversas`);
  console.log(`   • ${3} mensagens`);
  console.log(`   • ${1} agendamento`);
  console.log(`   • ${4} integrações`);
  console.log(`   • ${4} itens na base de conhecimento`);
  console.log('\n🎉 Banco de dados pronto para uso!\n');
}

main()
  .catch((e) => {
    console.error('\n❌ Erro ao executar seed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

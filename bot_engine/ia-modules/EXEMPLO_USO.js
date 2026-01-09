/**
 * 📚 EXEMPLOS PRÁTICOS DE USO DOS MÓDULOS DE IA
 *
 * Este arquivo contém exemplos reais de como usar cada módulo
 */

import { IAMaster } from './00-ia-master.js';
import mysql from 'mysql2/promise';

// ============================================
// CONFIGURAÇÃO INICIAL
// ============================================

const db = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'feiraoshowcarr'
});

const OPENAI_KEY = process.env.OPENAI_API_KEY;
const GROQ_KEY = process.env.GROQ_API_KEY;

const iaMaster = new IAMaster(OPENAI_KEY, GROQ_KEY, db);

// ============================================
// EXEMPLO 1: PROCESSAMENTO COMPLETO
// ============================================

async function exemplo1_ProcessamentoCompleto() {
  console.log('\n📚 EXEMPLO 1: Processamento Completo\n');

  const telefone = '5511999999999';
  const mensagem = 'Procuro um SUV automático até 100 mil';
  const historico = [
    { role: 'Cliente', msg: 'Oi' },
    { role: 'Lucas', msg: 'Olá! Que tipo de carro você procura?' }
  ];

  const resultado = await iaMaster.processar(telefone, mensagem, historico, []);

  console.log('✅ RESULTADO:');
  console.log('Resposta:', resultado.resposta);
  console.log('\n📊 ANÁLISES:');
  console.log('- Intenção:', resultado.analises.intencao.intencao_principal);
  console.log('- Temperatura:', resultado.analises.sentimento.temperatura_lead);
  console.log('- Score:', resultado.analises.sentimento.score_temperatura);
  console.log('- Probabilidade:', `${resultado.analises.predicao.probabilidade_fechamento}%`);
  console.log('- Tipo Comprador:', resultado.analises.perfil.tipo_comprador);
  console.log('\n⚡ AÇÕES RECOMENDADAS:');
  console.log('- Buscar carros?', resultado.acoes.buscar_carros);
  console.log('- Fechar agora?', resultado.acoes.fechar_agora);
}

// ============================================
// EXEMPLO 2: RECOMENDAÇÕES PERSONALIZADAS
// ============================================

async function exemplo2_Recomendacoes() {
  console.log('\n📚 EXEMPLO 2: Recomendações Personalizadas\n');

  const telefone = '5511999999999';
  const historico = [
    { role: 'Cliente', msg: 'Procuro algo confortável e econômico' },
    { role: 'Lucas', msg: 'Entendi! Alguma marca preferida?' },
    { role: 'Cliente', msg: 'Honda ou Toyota' }
  ];

  // Lista fictícia de veículos
  const veiculos = [
    { id: 1, nome: 'Honda Civic', marca: 'Honda', preco: 95000, ano: '2020', km: '30000', cambio: 'Automático', tipo_carroceria: 'Sedan' },
    { id: 2, nome: 'Toyota Corolla', marca: 'Toyota', preco: 98000, ano: '2021', km: '25000', cambio: 'Automático', tipo_carroceria: 'Sedan' },
    { id: 3, nome: 'Chevrolet Onix', marca: 'Chevrolet', preco: 65000, ano: '2022', km: '15000', cambio: 'Manual', tipo_carroceria: 'Hatch' }
  ];

  const recomendacoes = await iaMaster.recomendarVeiculos(telefone, veiculos, historico);

  console.log('✅ VEÍCULOS RECOMENDADOS:');
  recomendacoes.veiculos.forEach((v, i) => {
    console.log(`\n${i + 1}. ${v.nome} ${v.ano}`);
    console.log(`   Score: ${v.score_relevancia}/100`);
    console.log(`   Preço: R$ ${v.preco.toLocaleString('pt-BR')}`);
  });

  console.log('\n📊 PERFIL DO CLIENTE:');
  console.log('- Tipo:', recomendacoes.perfil.tipo_comprador);
  console.log('- Prioridades:', recomendacoes.perfil.prioridades.join(', '));
}

// ============================================
// EXEMPLO 3: ANÁLISE DE TEMPERATURA
// ============================================

async function exemplo3_Temperatura() {
  console.log('\n📚 EXEMPLO 3: Análise de Temperatura do Lead\n');

  const telefone = '5511888888888';

  // Simular evolução de temperatura
  const mensagens = [
    'Oi',
    'Procuro um carro',
    'Gostei do Civic',
    'Quanto fica parcelado?',
    'Adorei! Quando posso fazer test drive?'
  ];

  console.log('📈 EVOLUÇÃO DA TEMPERATURA:\n');

  for (let i = 0; i < mensagens.length; i++) {
    const msg = mensagens[i];
    const historico = mensagens.slice(0, i).map(m => ({ role: 'Cliente', msg: m }));

    const analise = await iaMaster.analisadorSentimento.analisar(telefone, msg, historico);

    console.log(`${i + 1}. "${msg}"`);
    console.log(`   Temperatura: ${analise.temperatura_lead} (${analise.score_temperatura}/100)`);
    console.log(`   Sentimento: ${analise.sentimento}`);
    console.log(`   Evolução: ${analise.evolucao}`);
    console.log('');
  }

  // Gerar relatório
  const relatorio = iaMaster.analisadorSentimento.gerarRelatorio(telefone);

  console.log('📊 RELATÓRIO FINAL:');
  console.log('- Score atual:', relatorio.score_atual);
  console.log('- Score inicial:', relatorio.score_inicial);
  console.log('- Variação:', `${relatorio.variacao_percentual}%`);
  console.log('- Tendência:', relatorio.tendencia);
}

// ============================================
// EXEMPLO 4: PREDIÇÃO DE FECHAMENTO
// ============================================

async function exemplo4_Predicao() {
  console.log('\n📚 EXEMPLO 4: Predição de Fechamento\n');

  const telefone = '5511777777777';

  // Simular dados completos
  const dadosCompletos = {
    historico: [
      { role: 'Cliente', msg: 'Procuro Honda Civic' },
      { role: 'Lucas', msg: 'Temos ótimas opções!' },
      { role: 'Cliente', msg: 'Gostei do vermelho' },
      { role: 'Cliente', msg: 'Quanto fica?' },
      { role: 'Lucas', msg: 'R$ 95.000 em até 48x' },
      { role: 'Cliente', msg: 'Posso fazer test drive?' }
    ],
    temperatura: {
      temperatura_lead: 'quente',
      score_temperatura: 82,
      evolucao: 'aquecendo'
    },
    perfil: {
      tipo_comprador: 'emocional',
      prioridades: ['conforto', 'status'],
      orcamento: { confortavel: 95000 }
    },
    sentimento: {
      sentimento: 'muito_positivo',
      nivel_interesse: 'muito_alto',
      pronto_para_decisao: true
    },
    veiculosVistos: 3
  };

  const predicao = await iaMaster.preditor.prever(telefone, dadosCompletos);

  console.log('🎯 PREDIÇÃO DE FECHAMENTO:');
  console.log('- Probabilidade:', `${predicao.probabilidade_fechamento}%`);
  console.log('- Classificação:', predicao.classificacao);
  console.log('- Momento ideal fechar?', predicao.momento_ideal_fechar ? '✅ SIM' : '❌ NÃO');
  console.log('- Previsão dias:', predicao.previsao_dias_fechamento);
  console.log('- Risco de perda:', predicao.nivel_risco_perda);

  console.log('\n✅ FATORES POSITIVOS:');
  predicao.fatores_positivos.forEach(f => console.log(`   - ${f}`));

  console.log('\n⚠️ FATORES NEGATIVOS:');
  predicao.fatores_negativos.forEach(f => console.log(`   - ${f}`));

  console.log('\n💡 PRÓXIMA AÇÃO CRÍTICA:');
  console.log(`   Ação: ${predicao.proxima_acao_critica.acao}`);
  console.log(`   Descrição: ${predicao.proxima_acao_critica.descricao}`);
  console.log(`   Prazo: ${predicao.proxima_acao_critica.prazo}`);

  console.log('\n📋 AÇÕES RECOMENDADAS:');
  predicao.acoes_recomendadas.slice(0, 3).forEach((acao, i) => {
    console.log(`\n   ${i + 1}. [${acao.prioridade}] ${acao.acao}`);
    console.log(`      Razão: ${acao.razao}`);
  });
}

// ============================================
// EXEMPLO 5: DETECÇÃO DE OBJEÇÕES
// ============================================

async function exemplo5_Objecoes() {
  console.log('\n📚 EXEMPLO 5: Detecção e Tratamento de Objeções\n');

  const mensagensComObjecao = [
    'Achei muito caro',
    'Esse carro tá muito rodado',
    'Não confio em carros usados',
    'Vi mais barato na concorrente'
  ];

  for (const msg of mensagensComObjecao) {
    console.log(`\n💬 Cliente: "${msg}"`);

    const objecoes = await iaMaster.analisadorIntencoes.detectarObjecoes(msg);

    if (objecoes.length > 0) {
      const objecao = objecoes[0];
      console.log(`   ⚠️ Objeção detectada: ${objecao.tipo}`);
      console.log(`   Gravidade: ${objecao.gravidade}`);

      // Gerar contra-argumento
      const contraArgumento = await iaMaster.gerador.gerarContraArgumento(
        objecao.tipo,
        {}
      );

      console.log(`   💡 Sugestão de resposta: "${contraArgumento}"`);
    } else {
      console.log('   ✅ Sem objeções detectadas');
    }
  }
}

// ============================================
// EXEMPLO 6: RELATÓRIO COMPLETO
// ============================================

async function exemplo6_RelatorioCompleto() {
  console.log('\n📚 EXEMPLO 6: Relatório Completo do Cliente\n');

  const telefone = '5511666666666';

  // Simular algumas interações primeiro
  await iaMaster.processar(telefone, 'Procuro SUV', [], []);
  await iaMaster.processar(telefone, 'Gostei do Compass', [], []);
  await iaMaster.processar(telefone, 'Quanto fica?', [], []);

  // Gerar relatório
  const relatorio = await iaMaster.gerarRelatorio(telefone);

  if (relatorio.disponivel) {
    console.log('📊 RELATÓRIO COMPLETO:\n');

    console.log('🌡️ TEMPERATURA:');
    console.log('- Score atual:', relatorio.temperatura.score_atual);
    console.log('- Tendência:', relatorio.temperatura.tendencia);
    console.log('- Total interações:', relatorio.temperatura.total_interacoes);

    console.log('\n📈 EVOLUÇÃO DA PREDIÇÃO:');
    console.log('- Probabilidade inicial:', relatorio.evolucao_predicao.probabilidade_inicial);
    console.log('- Probabilidade atual:', relatorio.evolucao_predicao.probabilidade_atual);
    console.log('- Variação:', `${relatorio.evolucao_predicao.variacao_percentual}%`);

    console.log('\n💡 INSIGHTS:');
    relatorio.insights.insights.forEach((insight, i) => {
      console.log(`   ${i + 1}. [${insight.tipo}] ${insight.mensagem}`);
    });
  } else {
    console.log('⚠️ Relatório não disponível (dados insuficientes)');
  }
}

// ============================================
// EXEMPLO 7: GERAÇÃO DE URGÊNCIA
// ============================================

async function exemplo7_Urgencia() {
  console.log('\n📚 EXEMPLO 7: Geração de Urgência\n');

  const contextos = [
    { temperatura: { temperatura_lead: 'frio', score_temperatura: 30 } },
    { temperatura: { temperatura_lead: 'morno', score_temperatura: 55 } },
    { temperatura: { temperatura_lead: 'quente', score_temperatura: 85 } }
  ];

  contextos.forEach((ctx, i) => {
    console.log(`\nCenário ${i + 1}: Lead ${ctx.temperatura.temperatura_lead} (${ctx.temperatura.score_temperatura})`);

    const deveGerarUrgencia = iaMaster.deveGerarUrgencia(
      { momento_ideal_fechar: false, probabilidade_fechamento: ctx.temperatura.score_temperatura },
      ctx.temperatura
    );

    if (deveGerarUrgencia) {
      const msgUrgencia = iaMaster.gerador.gerarUrgencia(ctx);
      console.log(`   ✅ Urgência: "${msgUrgencia}"`);
    } else {
      console.log('   ❌ Não gerar urgência ainda');
    }
  });
}

// ============================================
// EXECUTAR TODOS OS EXEMPLOS
// ============================================

async function executarTodosExemplos() {
  try {
    console.log('🚀 INICIANDO EXEMPLOS DE USO\n');
    console.log('=' .repeat(60));

    await exemplo1_ProcessamentoCompleto();
    await new Promise(r => setTimeout(r, 2000));

    await exemplo2_Recomendacoes();
    await new Promise(r => setTimeout(r, 2000));

    await exemplo3_Temperatura();
    await new Promise(r => setTimeout(r, 2000));

    await exemplo4_Predicao();
    await new Promise(r => setTimeout(r, 2000));

    await exemplo5_Objecoes();
    await new Promise(r => setTimeout(r, 2000));

    await exemplo6_RelatorioCompleto();
    await new Promise(r => setTimeout(r, 2000));

    await exemplo7_Urgencia();

    console.log('\n' + '='.repeat(60));
    console.log('✅ TODOS OS EXEMPLOS EXECUTADOS COM SUCESSO!');

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await db.end();
  }
}

// Executar se arquivo for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  executarTodosExemplos();
}

// Exportar para uso em outros arquivos
export {
  exemplo1_ProcessamentoCompleto,
  exemplo2_Recomendacoes,
  exemplo3_Temperatura,
  exemplo4_Predicao,
  exemplo5_Objecoes,
  exemplo6_RelatorioCompleto,
  exemplo7_Urgencia
};

/**
 * EXEMPLO DE USO - Bot Acompanhante +18
 *
 * Este arquivo mostra como usar o sistema de IA
 * para criar um bot de atendimento automatizado.
 */

import { criarBot } from './index.js';

// ============================================
// 1. CRIAR BOT COM CONFIGURAÇÃO PERSONALIZADA
// ============================================

const bot = criarBot({
  nome: 'Luna',           // Nome da acompanhante
  cidade: 'São Paulo',    // Cidade de atendimento

  // Tabela de valores
  valores: {
    // Conteúdo online
    conteudo_basico: 50,    // Fotos sensuais
    conteudo_vip: 150,      // Conteúdo ousado + responde msgs
    conteudo_premium: 300,  // Personalizado + videochamada

    // Encontros presenciais
    encontro_1h: 500,
    encontro_2h: 800,
    encontro_3h: 1000,
    pernoite: 1500,

    // Extras
    taxa_deslocamento: 50,       // Deslocamento normal
    taxa_deslocamento_longe: 100 // Deslocamento longe
  },

  // Configurações opcionais
  tem_local: true,              // Tem local próprio?
  bairro: 'Jardins',            // Bairro do local
  exige_sinal: true,            // Exige sinal para confirmar?
  sinal: 30                     // % do valor como sinal
});

// ============================================
// 2. PROCESSAR MENSAGENS
// ============================================

async function exemploConversa() {
  const telefone = '5511999999999';

  // Primeira mensagem do cliente
  let resultado = await bot.processarMensagem(telefone, 'Oi, tudo bem?');
  console.log('Bot:', resultado.resposta);
  console.log('Análise:', resultado.analise);

  // Cliente pergunta sobre encontro
  resultado = await bot.processarMensagem(telefone, 'Você atende presencial?', [
    { role: 'assistant', content: resultado.resposta }
  ]);
  console.log('Bot:', resultado.resposta);

  // Cliente pergunta valores
  resultado = await bot.processarMensagem(telefone, 'Quanto você cobra?', [
    { role: 'assistant', content: resultado.resposta }
  ]);
  console.log('Bot:', resultado.resposta);

  // Cliente quer marcar
  resultado = await bot.processarMensagem(telefone, 'Quero marcar pra amanhã', [
    { role: 'assistant', content: resultado.resposta }
  ]);
  console.log('Bot:', resultado.resposta);
}

// ============================================
// 3. AGENDAR ENCONTRO MANUALMENTE
// ============================================

async function exemploAgendamento() {
  const telefone = '5511999999999';

  // Verificar disponibilidade
  const disponivel = bot.verificarDisponibilidade('2025-01-15', '15:00', '2h');
  console.log('Disponível:', disponivel);

  // Listar horários disponíveis
  const horarios = bot.getHorariosDisponiveis('2025-01-15', '2h');
  console.log('Horários livres:', horarios);

  // Criar agendamento
  const agendamento = await bot.agendarEncontro(telefone, {
    data: '2025-01-15',
    horario: '15:00',
    duracao: '2h',
    local_tipo: 'proprio',  // 'proprio' ou 'cliente'
    bairro: 'Jardins'
  });

  console.log('Encontro agendado:', agendamento.encontro);
  console.log('Mensagem de confirmação:', agendamento.mensagemConfirmacao);
}

// ============================================
// 4. CONSULTAR DADOS DO CLIENTE
// ============================================

function exemploConsultas() {
  const telefone = '5511999999999';

  // Obter memória do cliente
  const memoria = bot.getMemoriaCliente(telefone);
  console.log('Memória:', memoria);

  // Obter resumo para incluir em prompts
  const resumo = bot.getResumoCliente(telefone);
  console.log('Resumo:', resumo);

  // Estatísticas gerais
  const stats = bot.getEstatisticas();
  console.log('Estatísticas:', stats);

  // Encontros do dia
  const encontros = bot.getEncontrosDoDia(new Date());
  console.log('Encontros hoje:', encontros);
}

// ============================================
// 5. PERSISTÊNCIA DE DADOS
// ============================================

function exemploPersistencia() {
  // Exportar dados para salvar
  const dados = bot.exportarDados();
  // Salvar em arquivo/banco: fs.writeFileSync('dados.json', JSON.stringify(dados))

  // Importar dados salvos
  // const dadosSalvos = JSON.parse(fs.readFileSync('dados.json'))
  // bot.importarDados(dadosSalvos)
}

// ============================================
// 6. INTEGRAÇÃO COM WHATSAPP (BAILEYS)
// ============================================

/*
import makeWASocket from '@whiskeysockets/baileys';

const sock = makeWASocket({ ... });

sock.ev.on('messages.upsert', async ({ messages }) => {
  const msg = messages[0];
  if (!msg.message || msg.key.fromMe) return;

  const telefone = msg.key.remoteJid.replace('@s.whatsapp.net', '');
  const texto = msg.message.conversation || msg.message.extendedTextMessage?.text;

  // Processar com o bot
  const resultado = await bot.processarMensagem(telefone, texto);

  // Enviar resposta
  await sock.sendMessage(msg.key.remoteJid, { text: resultado.resposta });
});
*/

// ============================================
// EXECUTAR EXEMPLOS
// ============================================

// exemploConversa();
// exemploAgendamento();
// exemploConsultas();

export { bot, exemploConversa, exemploAgendamento, exemploConsultas };

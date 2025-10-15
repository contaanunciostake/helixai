import makeWASocket, { DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, downloadMediaMessage } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import OpenAI from 'openai';
// import Groq from "groq-sdk";
import Anthropic from '@anthropic-ai/sdk';
import NodeCache from 'node-cache';
import qrcode from 'qrcode-terminal';
import 'dotenv/config';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ffmpeg from 'fluent-ffmpeg';
import { ElevenLabsClient } from 'elevenlabs';
import mysql from 'mysql2/promise';

// ❌ IA MASTER DESATIVADA (não está sendo usada)
// import { IAMaster } from './ia-modules/00-ia-master.js';

// ✅ IMPORTAR SIMULADOR DE FINANCIAMENTO
import { SimuladorFinanciamento, GerenciadorFinanciamento } from './simulador-financiamento.js';

// ✅ IMPORTAR API FIPE
import { consultarValorFipe, compararComFipe, buscarDetalhesPersuasao } from './fipe-wrapper.js';

// ✅ IMPORTAR BOT ADAPTER (Integração com Backend Flask)
import botAdapter from './bot-adapter.js';

// ✅ IMPORTAR GERENCIADOR DE AGENDAMENTOS
import { GerenciadorAgendamentos } from './modulo-agendamento.js';

// ✅ IMPORTAR MESSAGE TRACKER (Sistema de Debug e Rastreamento)
// Adicionado em: 2025-01-13 por Helix AI Developer
// Propósito: Resolver problema de mensagens não entregues
import messageTracker from './message-tracker.js';


// ========== FUNÇÃO HELPER PARA SUBSTITUIR OPENAI POR CLAUDE ==========
/**
 * Converte chamadas OpenAI para Claude
 * @param {Object} anthropic - Instância do cliente Anthropic
 * @param {Object} config - Configuração da chamada OpenAI {model, messages, temperature, max_tokens}
 * @returns {Promise<string>} - Texto da resposta
 */
async function callClaudeInsteadOfOpenAI(anthropic, config) {
  const { messages, temperature = 0.7, max_tokens = 150 } = config;

  // Separar system message das outras mensagens
  const systemMessage = messages.find(m => m.role === 'system')?.content || '';
  const userMessages = messages.filter(m => m.role !== 'system');

  // Converter mensagens para formato Claude
  const claudeMessages = userMessages.map(m => ({
    role: m.role,
    content: m.content
  }));

  // Se tiver system message, adicionar ao primeiro user message
  if (systemMessage && claudeMessages.length > 0) {
    if (claudeMessages[0].role === 'user') {
      claudeMessages[0].content = `${systemMessage}\n\n${claudeMessages[0].content}`;
    } else {
      claudeMessages.unshift({ role: 'user', content: systemMessage });
    }
  }

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens,
    temperature,
    messages: claudeMessages
  });

  return response.content[0].text.trim();
}

// ========== ADICIONE ESTA FUNÇÃO LOGO APÓS A CLASSE FormatadorFala ==========
class FormatadorFala {
  static prepararParaTTS(texto) {
    let textoFormatado = texto;

    // -1. REMOVER ANOTAÇÕES INTERNAS/TÉCNICAS (CRÍTICO!)
    // Remove qualquer texto entre colchetes que são instruções para a IA
    // Exemplos: [CHAMA buscar_carros], [ENVIA FOTOS], [GERA PLANILHA], etc.
    textoFormatado = textoFormatado.replace(/\[.*?\]/g, '');

    // Remove também possíveis instruções técnicas que escaparam
    textoFormatado = textoFormatado.replace(/\bCHAMA\s+\w+\s*\(.*?\)/gi, '');
    textoFormatado = textoFormatado.replace(/\bENVIA\s+.*?(FOTOS?|IMAGENS?|DADOS|INFORMAÇÕES)/gi, '');

    // 0. REMOVER GAGUEJADAS E REPETIÇÕES
    textoFormatado = this.removerGaguejadas(textoFormatado);

    // 0.1. FONÉTICA ESPECIAL PARA MODELOS DE VEÍCULOS
    textoFormatado = this.aplicarFoneticaVeiculos(textoFormatado);

    // 1. ANOS (ex: "2008" → "dois mil e oito", "ano 2023" → "ano dois mil e vinte e três")
    // Detecta anos de 1900 a 2099 (sozinhos ou depois de "ano")
    textoFormatado = textoFormatado.replace(/\b(ano\s+)?((19|20)\d{2})\b/gi, (match, prefixoAno, ano) => {
      const anoNum = parseInt(ano);
      const anoTexto = this.anoParaTexto(anoNum);
      return prefixoAno ? `ano ${anoTexto}` : anoTexto;
    });

    // 2. VELOCIDADE KM/H (ex: "200 km/h" → "duzentos quilômetros por hora")
    // DEVE VIR ANTES da regra de "km" sozinho
    textoFormatado = textoFormatado.replace(/(\d+)\s*(km\/h|kmh|km por hora)/gi, (match, num) => {
      return `${this.numeroParaTexto(parseInt(num))} quilômetros por hora`;
    });

    // 3. QUILÔMETROS / KM (ex: "45000 km" → "quarenta e cinco mil quilômetros")
    textoFormatado = textoFormatado.replace(/(\d+)\s*(km|quilômetros|quilometros)(?!\s*\/|por)/gi, (match, num) => {
      return `${this.numeroParaTexto(parseInt(num))} quilômetros`;
    });

    // 3. HORÁRIOS (ex: "8h" → "oito horas", "14h30" → "quatorze horas e trinta minutos")
    textoFormatado = textoFormatado.replace(/(\d{1,2})h(\d{2})?/gi, (match, hora, minutos) => {
      const horaTexto = this.numeroParaTexto(parseInt(hora));
      if (minutos && parseInt(minutos) > 0) {
        const minutoTexto = this.numeroParaTexto(parseInt(minutos));
        return `${horaTexto} horas e ${minutoTexto} minutos`;
      }
      return `${horaTexto} horas`;
    });

    // 4. VALORES EM REAIS (ex: "R$ 85.000" → "oitenta e cinco mil reais")
    textoFormatado = textoFormatado.replace(/R\$\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/g, (match, valor) => {
      const valorLimpo = valor.replace(/\./g, '').replace(',', '.');
      const valorNum = parseFloat(valorLimpo);
      return `${this.numeroParaTexto(Math.round(valorNum))} reais`;
    });

    // 5. PREÇOS SEM SÍMBOLO (ex: "85000" seguido de "reais" ou isolado em contexto de preço)
    // Detecta números grandes que provavelmente são preços
    textoFormatado = textoFormatado.replace(/\b(\d{5,})\s*(reais)?/gi, (match, num, reais) => {
      const numTexto = this.numeroParaTexto(parseInt(num));
      return reais ? `${numTexto} reais` : numTexto;
    });

    // 6. REMOVER ENUMERAÇÕES ROBÓTICAS (Opção 1:, Opção 2:, etc)
    // Remove padrões como "Opção 1:", "Opção 2:", "1.", "2.", "Item 1:", etc
    textoFormatado = textoFormatado
      .replace(/\n\s*📱\s*Opção\s+\d+:\s*/gi, '\n') // Remove "📱 Opção 1:"
      .replace(/\n\s*🏢\s*Opção\s+\d+:\s*/gi, '\n') // Remove "🏢 Opção 2:"
      .replace(/\n\s*Opção\s+\d+:\s*/gi, '\n')      // Remove "Opção 1:" genérico
      .replace(/\n\s*\d+\)\s*/g, '\n')              // Remove "1) ", "2) "
      .replace(/\n\s*\d+\.\s*/g, '\n')              // Remove "1. ", "2. "
      .replace(/\n\s*Item\s+\d+:\s*/gi, '\n');      // Remove "Item 1:", "Item 2:"

    // 7. REMOVER MARKDOWN
    textoFormatado = textoFormatado
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/_/g, '')
      .replace(/#{1,6}\s/g, ''); // Remove headers markdown

    return textoFormatado;
  }

  // Converte ano para texto natural (ex: 2008 → "dois mil e oito")
  static anoParaTexto(ano) {
    if (ano < 1000 || ano > 2999) {
      return ano.toString(); // Fora do intervalo esperado
    }

    const milhar = Math.floor(ano / 1000);
    const resto = ano % 1000;

    if (resto === 0) {
      return `${this.numeroParaTexto(milhar)} mil`;
    }

    if (resto < 100) {
      return `${this.numeroParaTexto(milhar)} mil e ${this.numeroParaTexto(resto)}`;
    }

    return `${this.numeroParaTexto(milhar)} mil e ${this.numeroParaTexto(resto)}`;
  }

  // Converte número para texto por extenso
  static numeroParaTexto(num) {
    if (num === 0) return 'zero';

    const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
    const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
    const especiais = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
    const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

    if (num < 10) return unidades[num];
    if (num >= 10 && num < 20) return especiais[num - 10];
    if (num >= 20 && num < 100) {
      const dez = Math.floor(num / 10);
      const uni = num % 10;
      return dezenas[dez] + (uni > 0 ? ` e ${unidades[uni]}` : '');
    }
    if (num >= 100 && num < 1000) {
      const cent = Math.floor(num / 100);
      const resto = num % 100;
      if (num === 100) return 'cem';
      return centenas[cent] + (resto > 0 ? ' e ' + this.numeroParaTexto(resto) : '');
    }
    if (num >= 1000 && num < 1000000) {
      const mil = Math.floor(num / 1000);
      const resto = num % 1000;
      const milTexto = mil === 1 ? 'mil' : `${this.numeroParaTexto(mil)} mil`;
      return milTexto + (resto > 0 ? ' e ' + this.numeroParaTexto(resto) : '');
    }
    if (num >= 1000000) {
      const milhao = Math.floor(num / 1000000);
      const resto = num % 1000000;
      const milhaoTexto = milhao === 1 ? 'um milhão' : `${this.numeroParaTexto(milhao)} milhões`;
      if (resto === 0) return milhaoTexto;
      if (resto < 1000) return `${milhaoTexto} e ${this.numeroParaTexto(resto)}`;
      return `${milhaoTexto}, ${this.numeroParaTexto(resto)}`;
    }

    return num.toString();
  }

  // ========== REMOVER GAGUEJADAS E REPETIÇÕES ==========
  static removerGaguejadas(texto) {
    let textoLimpo = texto;

    // 1. Remover palavras repetidas consecutivas (ex: "o o carro" → "o carro")
    textoLimpo = textoLimpo.replace(/\b(\w+)\s+\1\b/gi, '$1');

    // 2. Remover frases/fragmentos repetidos (ex: "vou enviar vou enviar" → "vou enviar")
    // Detecta sequências de 2-5 palavras repetidas
    textoLimpo = textoLimpo.replace(/\b((?:\w+\s+){2,5})\1+/gi, '$1');

    // 3. Remover espaços múltiplos
    textoLimpo = textoLimpo.replace(/\s{2,}/g, ' ');

    // 4. Remover pontuação duplicada (ex: "!!" → "!", "??" → "?")
    textoLimpo = textoLimpo.replace(/([!?.]){2,}/g, '$1');

    return textoLimpo.trim();
  }

  // ========== FONÉTICA ESPECIAL PARA MODELOS DE VEÍCULOS ==========
  static aplicarFoneticaVeiculos(texto) {
    let textoComFonetica = texto;

    // Array de substituições [padrão regex, substituição]
    const substituicoes = [
      // BMW - Modelos com números (ex: 530i, 320i, M3)
      [/\bBMW\s*530i?\b/gi, 'BMW quinhentos e trinta i'],
      [/\bBMW\s*520i?\b/gi, 'BMW quinhentos e vinte i'],
      [/\bBMW\s*320i?\b/gi, 'BMW trezentos e vinte i'],
      [/\bBMW\s*118i?\b/gi, 'BMW cento e dezoito i'],
      [/\bBMW\s*120i?\b/gi, 'BMW cento e vinte i'],
      [/\bBMW\s*M3\b/gi, 'BMW M três'],
      [/\bBMW\s*M5\b/gi, 'BMW M cinco'],
      [/\bBMW\s*X1\b/gi, 'BMW X um'],
      [/\bBMW\s*X3\b/gi, 'BMW X três'],
      [/\bBMW\s*X5\b/gi, 'BMW X cinco'],
      [/\bBMW\s*X6\b/gi, 'BMW X seis'],

      // Mercedes-Benz - Modelos (ex: C180, E200, GLA200)
      [/\b(Mercedes[- ]?Benz|Mercedes)\s*C180\b/gi, 'Mercedes-Benz C cento e oitenta'],
      [/\b(Mercedes[- ]?Benz|Mercedes)\s*C200\b/gi, 'Mercedes-Benz C duzentos'],
      [/\b(Mercedes[- ]?Benz|Mercedes)\s*E200\b/gi, 'Mercedes-Benz E duzentos'],
      [/\b(Mercedes[- ]?Benz|Mercedes)\s*GLA200\b/gi, 'Mercedes-Benz GLA duzentos'],
      [/\b(Mercedes[- ]?Benz|Mercedes)\s*GLC300\b/gi, 'Mercedes-Benz GLC trezentos'],

      // Audi - Modelos (ex: A3, A4, Q3, Q5)
      [/\bAudi\s*A3\b/gi, 'Audi A três'],
      [/\bAudi\s*A4\b/gi, 'Audi A quatro'],
      [/\bAudi\s*A5\b/gi, 'Audi A cinco'],
      [/\bAudi\s*A6\b/gi, 'Audi A seis'],
      [/\bAudi\s*Q3\b/gi, 'Audi Q três'],
      [/\bAudi\s*Q5\b/gi, 'Audi Q cinco'],
      [/\bAudi\s*Q7\b/gi, 'Audi Q sete'],

      // Volkswagen - Modelos (ex: Gol 1.0, Polo 1.6)
      [/\b(VW|Volkswagen)\s*Gol\s*1\.0\b/gi, 'Volkswagen Gol um ponto zero'],
      [/\b(VW|Volkswagen)\s*Polo\s*1\.6\b/gi, 'Volkswagen Polo um ponto seis'],
      [/\b(VW|Volkswagen)\s*T-Cross\b/gi, 'Volkswagen T-Cross'],

      // Chevrolet - Modelos (ex: Onix 1.0, S10 2.8)
      [/\bOnix\s*1\.0\b/gi, 'Onix um ponto zero'],
      [/\bOnix\s*1\.4\b/gi, 'Onix um ponto quatro'],
      [/\bS10\s*2\.8\b/gi, 'S dez dois ponto oito'],

      // Ford - Modelos (ex: Ranger 3.2, EcoSport 2.0)
      [/\bRanger\s*3\.2\b/gi, 'Ranger três ponto dois'],
      [/\bEcoSport\s*2\.0\b/gi, 'EcoSport dois ponto zero'],

      // Honda - Modelos (ex: Civic 2.0, HR-V)
      [/\bCivic\s*2\.0\b/gi, 'Civic dois ponto zero'],
      [/\bHR-V\b/gi, 'HR-V'],

      // Toyota - Modelos (ex: Corolla 2.0, Hilux 2.8)
      [/\bCorolla\s*2\.0\b/gi, 'Corolla dois ponto zero'],
      [/\bHilux\s*2\.8\b/gi, 'Hilux dois ponto oito'],

      // Jeep - Modelos (ex: Compass 2.0, Renegade 1.8)
      [/\bCompass\s*2\.0\b/gi, 'Compass dois ponto zero'],
      [/\bRenegade\s*1\.8\b/gi, 'Renegade um ponto oito'],

      // Fiat - Modelos (ex: Toro 2.0)
      [/\bToro\s*2\.0\b/gi, 'Toro dois ponto zero'],
      [/\bMobi\s*1\.0\b/gi, 'Mobi um ponto zero'],

      // Porsche - Modelos (ex: 911, Cayenne)
      [/\bPorsche\s*911\b/gi, 'Porsche nove onze'],
      [/\bPorsche\s*718\b/gi, 'Porsche sete dezoito']
    ];

    // Aplicar todas as substituições
    for (const [pattern, replacement] of substituicoes) {
      textoComFonetica = textoComFonetica.replace(pattern, replacement);
    }

    // Padrão genérico para outros modelos com motor (ex: "Tucson 2.0" → "Tucson dois ponto zero")
    textoComFonetica = textoComFonetica.replace(/\b(\w+)\s*(\d)\.(\d)\b/gi, (match, modelo, int, dec) => {
      return `${modelo} ${this.numeroParaTexto(parseInt(int))} ponto ${this.numeroParaTexto(parseInt(dec))}`;
    });

    return textoComFonetica;
  }
}


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicializar o cliente Groq
// const groq = new Groq({
//     apiKey: process.env.GROQ_API_KEY // Adicione no .env
// });

// =====================================================
// 🔒 MODO TESTE - WHITELIST DE NÚMEROS
// =====================================================
// ⚠️ ATENÇÃO: Este código limita o bot a responder apenas números específicos
//
// PARA ATIVAR MODO TESTE:
//   1. Mude MODO_TESTE para true
//   2. Adicione números em NUMEROS_PERMITIDOS
//
// PARA DESATIVAR (liberar para todos):
//   1. Mude MODO_TESTE para false
//   2. OU delete/comente todo este bloco
//
const MODO_TESTE = false; // ← MUDE PARA false QUANDO QUISER LIBERAR PARA TODOS

const NUMEROS_PERMITIDOS = [
  '554299300611',    // Seu número (formato: código país + DDD + número)
  '556799222756',    // Segundo número autorizado
  '556796239079',
  '556799883484',
  '556796600884',
  '556792097672',
  '556796122238',
  '556791391890',
  '556599999806',   // Terceiro número autorizado (67 9623-9079)
  // Adicione mais números aqui se precisar testar com outras pessoas:
  // '5511999999999',
  // '5521888888888',
];

/**
 * Verifica se número está autorizado a usar o bot
 * @param {string} numeroCompleto - Número no formato: 5542999300611@s.whatsapp.net
 * @returns {boolean} true se autorizado
 */
function numeroEstaAutorizado(numeroCompleto) {
  // Se modo teste está DESATIVADO, libera para todos
  if (!MODO_TESTE) {
    return true;
  }

  // Extrair apenas o número (remover @s.whatsapp.net ou @lid)
  const numeroLimpo = numeroCompleto.split('@')[0];

  // Verificar se está na whitelist
  const autorizado = NUMEROS_PERMITIDOS.includes(numeroLimpo);

  if (!autorizado) {
    console.log(`🚫 [WHITELIST] Número bloqueado: ${numeroLimpo}`);
    console.log(`📋 [WHITELIST] Números permitidos: ${NUMEROS_PERMITIDOS.join(', ')}`);
  } else {
    console.log(`✅ [WHITELIST] Número autorizado: ${numeroLimpo}`);
  }

  return autorizado;
}

console.log('=== BOT AIRA v10.0 - FUNCTION CALLING GPT ===');

// Mostrar status do modo teste
if (MODO_TESTE) {
  console.log('\n⚠️  ========================================');
  console.log('⚠️  🔒 MODO TESTE ATIVADO');
  console.log('⚠️  ========================================');
  console.log('⚠️  Bot responderá APENAS para:');
  NUMEROS_PERMITIDOS.forEach(num => {
    console.log(`⚠️    ✓ ${num}`);
  });
  console.log('⚠️  ========================================');
  console.log('⚠️  Para desativar: mude MODO_TESTE = false');
  console.log('⚠️  (linha ~163 em bot-lucas.js)');
  console.log('⚠️  ========================================\n');
} else {
  console.log('\n✅ MODO PRODUÇÃO: Bot responde para todos\n');
}


// =====================================================
// CONFIGURAÇÃO
// =====================================================
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const BASE_URL = process.env.BASE_URL || 'https://feiraoshowcar.com.br';

/**
 * 🚗 SIMPLIFICA NOME DO VEÍCULO
 * Extrai apenas: Marca + Modelo + Ano
 * Remove detalhes técnicos como 1.6, hatch, sedan, etc.
 *
 * @param {string} nomeCompleto - Nome completo do veículo
 * @param {number} ano - Ano do veículo
 * @returns {string} Nome simplificado
 *
 * Exemplos:
 * "FIAT ARGO DRIVE 1.0 6V FLEX" 2022 → "Fiat Argo 2022"
 * "VOLKSWAGEN GOL 1.6 MSI TOTAL FLEX" 2020 → "Volkswagen Gol 2020"
 * "GM - CHEVROLET S10 2.8" 2015 → "Chevrolet S10 2015"
 * "VW - VOLKSWAGEN POLO 1.6" 2016 → "Volkswagen Polo 2016"
 */
function simplificarNomeVeiculo(nomeCompleto, ano = '') {
  if (!nomeCompleto) return '';

  // Remove textos entre parênteses
  let nome = nomeCompleto.replace(/\([^)]*\)/g, '').trim();

  // Divide em palavras
  let palavras = nome.split(/\s+/).filter(p => p.length > 0);

  // ✅ REMOVER traços isolados e palavras redundantes (GM -, VW -, etc)
  palavras = palavras.filter(p => p !== '-' && p !== '–');

  // ✅ REMOVER siglas redundantes no início (GM, VW, FIAT duplicados)
  // Ex: "GM - CHEVROLET" → remove "GM", fica "CHEVROLET"
  if (palavras.length >= 2 && palavras[0].length <= 3 && palavras[0] !== palavras[1]) {
    const siglas = ['GM', 'VW', 'FIAT'];
    if (siglas.includes(palavras[0].toUpperCase())) {
      palavras = palavras.slice(1); // Remove primeira palavra (sigla)
    }
  }

  // ✅ PEGAR marca + modelo (2 a 3 palavras dependendo do caso)
  // Alguns modelos têm 2 palavras (ex: Land Rover, Range Rover, New Fiesta)
  let nomeSimples;

  // Lista de marcas com 2 palavras
  const marcasDuasPalavras = ['land rover', 'range rover'];
  const primeiraDuasPalavras = palavras.slice(0, 2).join(' ').toLowerCase();

  if (marcasDuasPalavras.includes(primeiraDuasPalavras)) {
    // Marca com 2 palavras + modelo (3 palavras no total)
    nomeSimples = palavras.slice(0, 3).join(' ');
  } else {
    // Marca + modelo (2 palavras)
    nomeSimples = palavras.slice(0, 2).join(' ');
  }

  // Capitaliza corretamente
  const nomeCapitalizado = nomeSimples
    .toLowerCase()
    .split(' ')
    .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(' ');

  // Retorna com ano se fornecido
  return ano ? `${nomeCapitalizado} ${ano}` : nomeCapitalizado;
}


async function conectarDB() {
  try {
    // ✅ HABILITADO: Conexão com MySQL localhost
    console.log('ℹ️  [INFO] Conectando ao banco de dados MySQL localhost...');

    db = new DatabaseMySQL();
    await db.connect();
    await db.ping();

    // Testar conexão
    const teste = await db.query('SELECT DATABASE() as db, COUNT(*) as total FROM cars');
    console.log('✅ [MySQL] Banco:', teste[0]?.db || 'desconhecido');
    console.log('✅ [MySQL] Total de carros:', teste[0]?.total || 0);

    log.success('Banco de dados MySQL conectado com sucesso!');
    return true;
  } catch (error) {
    log.error(`Erro ao conectar no banco de dados: ${error.message}`);
    console.error('⚠️ [MySQL] Verifique se o XAMPP está rodando e o MySQL está ativo');
    return false;
  }
}
// Credenciais ElevenLabs
// const GROQ_API_KEY = process.env.GROQ_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB';

// if (!GROQ_API_KEY) {
//   console.error('⚠️ GROQ_API_KEY não configurada no .env');
// }

if (!ELEVENLABS_API_KEY) {
  console.error('⚠️ ELEVENLABS_API_KEY não configurada no .env');
}

if (!OPENAI_API_KEY) {
  console.error('[ERRO] Configure OPENAI_API_KEY no .env');
  process.exit(1);
}

// if (!GROQ_API_KEY) {
//   console.error('[ERRO] Configure GROQ_API_KEY no .env');
// }

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const cache = new NodeCache({ stdTTL: 3600 });

// ✅ Anthropic Claude
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const anthropic = ANTHROPIC_API_KEY ? new Anthropic({ apiKey: ANTHROPIC_API_KEY }) : null;

if (ANTHROPIC_API_KEY && ANTHROPIC_API_KEY !== 'sua_chave_anthropic_aqui') {
  console.log('✅ Anthropic Claude configurado');
} else {
  console.log('ℹ️  Anthropic Claude não configurado (opcional)');
}

const log = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  error: (msg) => console.error(`[ERRO] ${msg}`),
  success: (msg) => console.log(`[✓] ${msg}`),
  warning: (msg) => console.warn(`[⚠️] ${msg}`),
  gpt: (msg) => console.log(`[🤖 GPT] ${msg}`),
  function: (msg) => console.log(`[⚙️ FUNC] ${msg}`),
};

// =====================================================
// 🤖 HELPER: Converter Tools OpenAI -> Claude
// =====================================================
/**
 * Converte ferramentas do formato OpenAI para Claude
 * @param {Array} openaiTools - Array de tools no formato OpenAI
 * @returns {Array} Tools no formato Claude
 */
function convertOpenAIToolsToClaude(openaiTools) {
  return openaiTools.map(tool => {
    const func = tool.function;

    // Converter propriedades recursivamente (remover type: ['string', 'null'])
    const convertProperties = (props) => {
      if (!props) return {};

      const converted = {};
      for (const [key, value] of Object.entries(props)) {
        converted[key] = {
          ...value,
          // Claude não aceita array de types, apenas string
          type: Array.isArray(value.type) ? value.type[0] : value.type
        };

        // Remover campos que Claude não aceita
        delete converted[key].default;
      }
      return converted;
    };

    return {
      name: func.name,
      description: func.description,
      input_schema: {
        type: 'object',
        properties: convertProperties(func.parameters.properties),
        required: func.parameters.required || []
      }
    };
  });
}

// 🤖 HELPER: Chamar Claude (Anthropic) com Tools
// =====================================================
/**
 * Chama Claude da Anthropic com suporte a tools/function calling
 * @param {Object} config - Configuração da chamada
 * @param {Array} config.messages - Array de mensagens [{role: 'user', content: '...'}]
 * @param {Array} config.tools - Array de tools (opcional)
 * @param {string} config.model - Modelo (padrão: claude-sonnet-4-20250514)
 * @param {number} config.max_tokens - Máximo de tokens (padrão: 4096)
 * @param {number} config.temperature - Temperatura (padrão: 1)
 * @returns {Object} Resposta do Claude no formato compatível com OpenAI
 */
async function callClaude({ messages, tools = null, model = 'claude-sonnet-4-20250514', max_tokens = 4096, temperature = 1 }) {
  if (!anthropic) {
    throw new Error('Claude não configurado. Adicione ANTHROPIC_API_KEY no .env');
  }

  // Separar system message e adaptar tool messages
  let systemMessage = '';
  const conversationMessages = messages
    .filter(msg => {
      if (msg.role === 'system') {
        systemMessage = msg.content;
        return false;
      }
      return true;
    })
    .map(msg => {
      // Adaptar tool result messages para formato Claude
      if (msg.role === 'tool') {
        return {
          role: 'user',
          content: [{
            type: 'tool_result',
            tool_use_id: msg.tool_call_id,
            content: msg.content
          }]
        };
      }

      // Adaptar assistant messages com tool_calls para formato Claude
      if (msg.role === 'assistant' && msg.tool_calls) {
        const content = [];

        // Adicionar texto se houver
        if (msg.content) {
          content.push({
            type: 'text',
            text: msg.content
          });
        }

        // Adicionar tool_use blocks
        msg.tool_calls.forEach(toolCall => {
          content.push({
            type: 'tool_use',
            id: toolCall.id,
            name: toolCall.function.name,
            input: JSON.parse(toolCall.function.arguments)
          });
        });

        return {
          role: 'assistant',
          content: content
        };
      }

      return msg;
    });

  // Montar config da chamada
  const config = {
    model,
    max_tokens,
    temperature,
    system: systemMessage || undefined,
    messages: conversationMessages
  };

  // Adicionar tools se fornecidas
  if (tools && tools.length > 0) {
    config.tools = convertOpenAIToolsToClaude(tools);
  }

  const response = await anthropic.messages.create(config);

  // Converter resposta Claude para formato OpenAI
  const hasToolUse = response.content.some(block => block.type === 'tool_use');

  if (hasToolUse) {
    // Claude quer chamar função(ões)
    const toolCalls = response.content
      .filter(block => block.type === 'tool_use')
      .map(block => ({
        id: block.id,
        type: 'function',
        function: {
          name: block.name,
          arguments: JSON.stringify(block.input)
        }
      }));

    // Pegar texto se houver
    const textBlock = response.content.find(block => block.type === 'text');

    return {
      choices: [{
        message: {
          role: 'assistant',
          content: textBlock ? textBlock.text : null,
          tool_calls: toolCalls
        }
      }],
      usage: {
        prompt_tokens: response.usage.input_tokens,
        completion_tokens: response.usage.output_tokens,
        total_tokens: response.usage.input_tokens + response.usage.output_tokens
      }
    };
  } else {
    // Resposta normal (texto)
    const textContent = response.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n');

    return {
      choices: [{
        message: {
          role: 'assistant',
          content: textContent,
          tool_calls: null
        }
      }],
      usage: {
        prompt_tokens: response.usage.input_tokens,
        completion_tokens: response.usage.output_tokens,
        total_tokens: response.usage.input_tokens + response.usage.output_tokens
      }
    };
  }
}


// ✅ ADICIONE AQUI (antes de "let db = null"):
// =====================================================
// API DO BANCO DE DADOS
// =====================================================
const DB_API_URL = process.env.DB_API_URL || 'https://feiraoshowcar.com.br/db_api.php';
const DB_API_TOKEN = process.env.DB_API_TOKEN || 'bot_aira_xyz';

class DatabaseAPI {
  async connect() {
    console.log('🔌 [API] Conectando...');
    return this;
  }

  async ping() {
    console.log('🏓 [API] Ping...');
    return true;
  }

 async query(sql, tentativa = 1) {
  console.log(`📤 [API] Tentativa ${tentativa}/5 - Enviando SQL...`);
  console.log('📝 [API] SQL:', sql.substring(0, 150));
  
  try {
    const params = new URLSearchParams();
    params.append('token', DB_API_TOKEN);
    params.append('sql', sql);
    
    const response = await axios.post(DB_API_URL, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Referer': 'https://feiraoshowcar.com.br/'
      },
      timeout: 30000,
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
    
    console.log('✅ [API] Status:', response.status);
    
    let data = response.data;
    
    if (typeof data === 'string') {
      if (data.length === 0) {
        throw new Error('Resposta vazia');
      }
      data = JSON.parse(data);
    }
    
    if (data.erro) {
      throw new Error(data.erro);
    }
    
    console.log('✅ [API]', data.dados?.length || 0, 'linhas recebidas');
    return data.dados || [];
    
  } catch (error) {
    console.error(`❌ [API] Tentativa ${tentativa} falhou:`, error.message);
    
    // Se for ECONNRESET e não é a última tentativa, retry
    if (error.code === 'ECONNRESET' && tentativa < 5) {
      const delay = Math.min(1000 * Math.pow(2, tentativa), 10000); // 2s, 4s, 8s, 10s
      console.log(`⏳ [API] Aguardando ${delay}ms antes de tentar novamente...`);
      await new Promise(r => setTimeout(r, delay));
      return this.query(sql, tentativa + 1);
    }
    
    throw error;
  }
}


  async execute(sql, params = []) {
    let sqlFormatado = sql;
    params.forEach(param => {
      const valor = typeof param === 'string' ? `'${param.replace(/'/g, "''")}'` : param;
      sqlFormatado = sqlFormatado.replace('?', valor);
    });

    const resultado = await this.query(sqlFormatado);
    return [resultado];
  }
}

// =====================================================
// CLASSE MYSQL - CONEXÃO LOCAL
// =====================================================
class DatabaseMySQL {
  constructor() {
    this.connection = null;
    this.config = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'u161861600_feiraoshow',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    };
  }

  async connect() {
    try {
      console.log('🔌 [MySQL] Conectando ao MySQL localhost...');
      console.log(`📍 [MySQL] Host: ${this.config.host}:${this.config.port}`);
      console.log(`📍 [MySQL] Database: ${this.config.database}`);
      console.log(`📍 [MySQL] User: ${this.config.user}`);

      this.connection = await mysql.createPool(this.config);

      console.log('✅ [MySQL] Pool de conexões criado com sucesso!');
      return this;
    } catch (error) {
      console.error('❌ [MySQL] Erro ao conectar:', error.message);
      throw error;
    }
  }

  async ping() {
    try {
      console.log('🏓 [MySQL] Testando conexão...');
      await this.connection.query('SELECT 1');
      console.log('✅ [MySQL] Conexão ativa!');
      return true;
    } catch (error) {
      console.error('❌ [MySQL] Erro no ping:', error.message);
      return false;
    }
  }

  async query(sql, params = []) {
    try {
      console.log(`📤 [MySQL] Executando query...`);
      console.log(`📝 [MySQL] SQL: ${sql.substring(0, 150)}${sql.length > 150 ? '...' : ''}`);

      const [rows] = await this.connection.query(sql, params);

      console.log(`✅ [MySQL] Query executada: ${Array.isArray(rows) ? rows.length : 0} linhas`);
      return rows;
    } catch (error) {
      console.error(`❌ [MySQL] Erro na query:`, error.message);
      throw error;
    }
  }

  async execute(sql, params = []) {
    return this.query(sql, params);
  }

  async close() {
    if (this.connection) {
      await this.connection.end();
      console.log('🔌 [MySQL] Conexão fechada');
    }
  }
}


let db = null;
let gerenciadorAgendamentos = null;

// =====================================================
// DEFINIÇÃO DAS FUNÇÕES (FORMATO NOVO - TOOLS)
// =====================================================
const FUNCOES_DISPONIVEIS = [
  {
    type: "function",
    function: {
      name: 'buscar_carros',
      description: `🚗 USE ESTA FUNÇÃO SEMPRE que o cliente perguntar sobre veículos, pedir recomendações ou demonstrar interesse em comprar.

Esta função:
1. Busca veículos no estoque do banco de dados
2. ENVIA AS FOTOS AUTOMATICAMENTE para o WhatsApp do cliente
3. Cada foto já inclui TODAS as informações (preço, ano, km, câmbio, etc) na legenda

⚠️ IMPORTANTE: Após chamar esta função, você NÃO precisa descrever os veículos em detalhes no áudio.
Apenas confirme que enviou (BREVE!) e pergunte qual interessou.

Exemplos de uso:
- Cliente: "Quero um carro" → buscar_carros({})
- Cliente: "Tem Gol?" → buscar_carros({ modelo: "Gol" })
- Cliente: "SUV até 80k" → buscar_carros({ preco_max: 80000 })
- Cliente: "Carro automático 2020+" → buscar_carros({ cambio: "automatico", ano_min: 2020 })
- Cliente: "Quero ver carros" → buscar_carros({})

A função retorna os veículos encontrados E já envia as fotos. Você só precisa confirmar e engajar o cliente com mensagem CURTA!

⚠️ Se você JÁ ENVIOU uma lista nesta conversa, NÃO BUSQUE NOVAMENTE a menos que cliente EXPLICITAMENTE peça "quero ver mais", "mostre outros", "tem outros carros?". Ajude ele a escolher entre os já mostrados.`,
      parameters: {
        type: 'object',
        properties: {
         marca: {
        type: ['string', 'null'],
        description: 'Marca do veículo (ex: Volkswagen, Fiat, Chevrolet, Honda, Toyota)'
    },
          modelo: {
        type: ['string', 'null'],
        description: 'Modelo específico do veículo (ex: Gol, Civic, Onix, Corolla). Use SEMPRE quando cliente mencionar modelo específico!'
    },
            tipo_veiculo: {
            type: ['string', 'null'],
            description: 'Tipo/categoria do veículo',
            enum: ['suv', 'sedan', 'hatch', 'pickup',  'luxo', 'economico', null]
          },
          preco_min: {
            type: ['number', 'null'],
            description: 'Preço mínimo em reais'
          },
          preco_max: {
            type: ['number', 'null'],
            description: 'Preço máximo em reais'
          },
          ano_min: {
            type: ['number', 'null'],
            description: 'Ano mínimo do veículo (ex: 2018)'
          },
          ano_max: {
            type: ['number', 'null'],
            description: 'Ano máximo do veículo (ex: 2024)'
          },
          cambio: {
            type: ['string', 'null'],
            description: 'Tipo de câmbio',
            enum: ['automatico', 'manual', 'ambos', null]
          },
          ordenar_por: {
            type: 'string',
            description: 'Como ordenar os resultados. ⚠️ IMPORTANTE: Use "mais_barato" SEMPRE que cliente especificar preço máximo (ex: "até 50 mil", "carros de até 30 mil") OU quando pedir explicitamente o mais barato. Use "mais_caro" quando pedir o mais caro. Use "mais_novo" quando pedir os mais novos.',
            enum: ['mais_barato', 'mais_caro', 'mais_novo', 'menor_km', 'aleatorio']
          },
          limite: {
            type: 'number',
            description: 'Máximo de veículos a retornar (padrão: 3, máximo: 5)',
            default: 3,
            maximum: 3
          }
        },
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: 'calcular_financiamento',
      description: 'Calcula parcelas de financiamento. Use quando cliente perguntar "quanto fica parcelado", "financiamento", "parcelas".',
      parameters: {
        type: 'object',
        properties: {
          valor_veiculo: {
            type: 'number',
            description: 'Valor total do veículo em reais'
          },
          entrada: {
            type: 'number',
            description: 'Valor da entrada em reais (padrão: 20% do valor)'
          },
          parcelas: {
            type: 'number',
            description: 'Número de parcelas',
            enum: [12, 24, 36, 48, 60]
          },
          taxa_juros: {
            type: 'number',
            description: 'Taxa de juros mensal em porcentagem (padrão: 1.5%)',
            default: 1.5
          }
        },
        required: ['valor_veiculo', 'parcelas', 'taxa_juros']
      }
    }
  },
  {
    type: "function",
    function: {
      name: 'simular_financiamento_detalhado',
      description: 'Simula financiamento completo com múltiplos cenários e recomendações. Use quando cliente pedir simulação detalhada ou comparar prazos.',
      parameters: {
        type: 'object',
        properties: {
          valor_veiculo: {
            type: 'number',
            description: 'Valor total do veículo em reais'
          },
          entrada: {
            type: 'number',
            description: 'Valor da entrada em reais'
          },
          parcelas: {
            type: 'number',
            description: 'Número de parcelas desejado',
            enum: [12, 24, 36, 48, 60]
          },
          renda_mensal: {
            type: 'number',
            description: 'Renda mensal do cliente (opcional, para calcular entrada ideal)'
          }
        },
        required: ['valor_veiculo']
      }
    }
  },
  {
    type: "function",
    function: {
      name: 'obter_detalhes_veiculo',
      description: 'Obtém detalhes completos e ENVIA FOTOS de um veículo específico da lista enviada anteriormente. Use quando cliente pedir para ver/mostrar um veículo ("me mostra a ranger", "quero ver o primeiro", "me fala do civic 2020").',
      parameters: {
        type: 'object',
        properties: {
          identificacao: {
            type: 'string',
            description: 'Como identificar o veículo: pode ser o nome/marca/modelo (ex: "Ranger", "Honda City"), a posição na lista (ex: "primeiro", "segundo", "opção 1"), ou o ano (ex: "2020") se for único na lista'
          },
          incluir_fotos: {
            type: 'boolean',
            description: 'Se deve incluir URLs das fotos do veículo',
            default: true
          }
        },
        required: ['identificacao']
      }
    }
  },
  {
    type: "function",
    function: {
      name: 'comparar_veiculos',
      description: 'Compara dois ou três veículos lado a lado. Use quando cliente perguntar "qual a diferença", "compare", "qual vale mais".',
      parameters: {
        type: 'object',
        properties: {
          veiculos_ids: {
            type: 'array',
            items: { type: 'number' },
            description: 'Array com 2 ou 3 IDs dos veículos para comparar',
            minItems: 2,
            maxItems: 3
          },
          criterios: {
            type: 'array',
            items: { type: 'string' },
            description: 'Critérios de comparação (preco, ano, km, cambio)',
            default: ['preco', 'ano', 'km', 'cambio']
          }
        },
        required: ['veiculos_ids']
      }
    }
  },
  {
    type: "function",
    function: {
      name: 'consultar_score',
      description: 'Consulta o score de crédito do cliente no Serasa/SPC para avaliar aprovação de financiamento. Use IMEDIATAMENTE quando: 1) Cliente pedir financiamento/parcelamento, 2) Perguntar sobre parcelas, 3) Demonstrar interesse em comprar com crédito. SEMPRE reforce segurança ("sistema seguro", "avaliação rápida") antes de pedir CPF.',
      parameters: {
        type: 'object',
        properties: {
          cpf: {
            type: 'string',
            description: 'CPF do cliente (com ou sem formatação - pontos e traços são removidos automaticamente)'
          },
          nome_cliente: {
            type: 'string',
            description: 'Nome do cliente para personalizar a resposta'
          },
          tel: {
            type: 'string',
            description: 'Telefone do cliente (para salvar dados no contexto)'
          }
        },
        required: ['cpf']
      }
    }
  },
  {
    type: "function",
    function: {
      name: 'consultar_valor_fipe',
      description: 'Consulta o valor FIPE (tabela oficial de preços) de um veículo. SEMPRE USE esta função quando o cliente: 1) Perguntar "quanto vale na FIPE", "qual o valor FIPE", "tá na FIPE", "preço de mercado"; 2) Mencionar que tem carro para dar de entrada E perguntar quanto vale. Use IMEDIATAMENTE se marca, modelo e ano forem mencionados, não peça confirmação.',
      parameters: {
        type: 'object',
        properties: {
          marca: {
            type: 'string',
            description: 'Marca do veículo (ex: Honda, Chevrolet, Fiat, Volkswagen). Inferir da mensagem do cliente.'
          },
          modelo: {
            type: 'string',
            description: 'Modelo do veículo (ex: Civic, Onix, Palio, Gol). Inferir da mensagem do cliente.'
          },
          ano: {
            type: 'number',
            description: 'Ano do veículo. Inferir da mensagem do cliente. Se não informado, deixar null para usar ano mais recente.'
          }
        },
        required: ['marca', 'modelo']
      }
    }
  },
  {
    type: "function",
    function: {
      name: 'comparar_preco_fipe',
      description: 'Compara o preço de venda de um veículo com o valor da tabela FIPE. Use quando cliente perguntar se o preço está bom, abaixo ou acima da FIPE.',
      parameters: {
        type: 'object',
        properties: {
          marca: {
            type: 'string',
            description: 'Marca do veículo'
          },
          modelo: {
            type: 'string',
            description: 'Modelo do veículo'
          },
          ano: {
            type: 'number',
            description: 'Ano do veículo'
          },
          preco_venda: {
            type: 'number',
            description: 'Preço de venda do veículo em reais'
          }
        },
        required: ['marca', 'modelo', 'ano', 'preco_venda']
      }
    }
  },
  {
    type: "function",
    function: {
      name: 'obter_estatisticas_estoque',
      description: 'Retorna estatísticas do estoque. Use quando cliente perguntar "quantos carros tem", "quais marcas disponíveis", "mais vendidos".',
      parameters: {
        type: 'object',
        properties: {
          tipo_estatistica: {
            type: 'string',
            description: 'Tipo de estatística a retornar',
            enum: ['geral', 'por_marca', 'por_ano', 'por_preco', 'mais_vendidos']
          }
        },
        required: ['tipo_estatistica']
      }
    }
  },
  {
    type: "function",
    function: {
      name: 'agendar_visita',
      description: `📅 AGENDE UMA VISITA quando o cliente demonstrar interesse em fechar a venda de um veículo específico.

⚠️ IMPORTANTE: Use esta função quando:
- Cliente quer ver o veículo pessoalmente
- Cliente está pronto para fechar negócio/financiamento mas precisa ver presencialmente
- Cliente pede para marcar visita/test drive
- Cliente confirma interesse em comprar mas quer ir até a loja

NUNCA use esta função se:
- Cliente ainda está apenas pesquisando
- Ainda não escolheu veículo específico
- Está apenas comparando preços

O sistema irá:
1. Registrar o agendamento no banco de dados
2. Notificar o vendedor responsável pelo veículo
3. Aguardar aprovação do vendedor
4. Confirmar com o cliente quando aprovado`,
      parameters: {
        type: 'object',
        properties: {
          veiculo_id: {
            type: 'number',
            description: 'ID do veículo de interesse (obtido de buscar_carros ou obter_detalhes_veiculo)'
          },
          data_agendamento: {
            type: 'string',
            description: 'Data da visita no formato YYYY-MM-DD (ex: 2025-10-15)'
          },
          hora_agendamento: {
            type: 'string',
            description: 'Horário da visita no formato HH:MM (ex: 14:30)'
          },
          tipo_interesse: {
            type: 'string',
            description: 'Tipo de interesse do cliente',
            enum: ['financiamento', 'visita_loja', 'test_drive'],
            default: 'visita_loja'
          },
          valor_entrada: {
            type: 'number',
            description: 'Valor de entrada se for financiamento (opcional)'
          },
          numero_parcelas: {
            type: 'number',
            description: 'Número de parcelas se for financiamento (opcional)'
          },
          tem_veiculo_troca: {
            type: 'boolean',
            description: 'Se o cliente tem veículo para dar como parte do pagamento',
            default: false
          },
          observacoes: {
            type: 'string',
            description: 'Observações adicionais sobre a visita ou preferências do cliente'
          }
        },
        required: ['veiculo_id', 'data_agendamento', 'hora_agendamento']
      }
    }
  },
  {
    type: "function",
    function: {
      name: 'buscar_detalhes_persuasao_fipe',
      description: `🎯 BUSCA DETALHES TÉCNICOS COMPLETOS PARA PERSUASÃO

Use esta função quando:
1️⃣ Cliente demonstra CURIOSIDADE TÉCNICA sobre um veículo específico
   - "Me fala mais sobre esse carro"
   - "Esse modelo é bom?"
   - "Vale a pena?"
   - "Como é esse carro?"

2️⃣ Cliente COMPARA veículos ou pede argumentos
   - "Qual a diferença desse pro outro?"
   - "Por que esse é mais caro?"
   - "Esse é melhor que o X?"

3️⃣ Cliente pergunta sobre VALOR/MERCADO/FIPE
   - "Tá na FIPE?"
   - "É um bom preço?"
   - "Esse carro valoriza?"
   - "Quanto vale no mercado?"

4️⃣ Cliente precisa de PERSUASÃO para decidir
   - "Ainda não sei se é esse"
   - "Deixa eu pensar"
   - "Tá caro" (objeção de preço)

A função retorna:
✅ Dados FIPE oficiais (valor de mercado)
✅ Especificações técnicas (motor, consumo, categoria)
✅ Argumentos de venda PRONTOS (pontos fortes, diferenciais)
✅ Análise de valorização/depreciação
✅ Comparação com nosso preço (se fornecido)
✅ Sugestões de como usar os dados na conversa

IMPORTANTE: Use para qualquer marca/modelo. A função tem base de conhecimento + busca FIPE real.`,
      parameters: {
        type: 'object',
        properties: {
          marca: {
            type: 'string',
            description: 'Marca do veículo (ex: Honda, Toyota, Volkswagen, Fiat, Jeep). Extrair da mensagem ou da lista de veículos mostrados.'
          },
          modelo: {
            type: 'string',
            description: 'Modelo do veículo (ex: Civic, Corolla, Gol, Compass). Extrair da mensagem ou da lista de veículos mostrados.'
          },
          ano: {
            type: ['number', 'null'],
            description: 'Ano do veículo. Se não informado, usa ano mais recente disponível na FIPE.'
          },
          preco_venda: {
            type: ['number', 'null'],
            description: 'Preço de venda do nosso estoque (se conhecido). Usado para comparar com FIPE e gerar argumento de oportunidade.'
          }
        },
        required: ['marca', 'modelo']
      }
    }
  }
];

// =====================================================
// FUNÇÕES AUXILIARES
// =====================================================

/**
 * Gera mensagem sugerida para IA usar na persuasão
 */
function gerarMensagemSugeridaPersuasao(resultado) {
  let msg = '';

  // Começar com ponto forte principal
  if (resultado.especificacoes_tecnicas.pontos_fortes.length > 0) {
    msg += `Esse ${resultado.dados_fipe.modelo} é conhecido por ${resultado.especificacoes_tecnicas.pontos_fortes[0].toLowerCase()}! `;
  }

  // Adicionar valor FIPE
  msg += `Na tabela FIPE ele está em ${resultado.dados_fipe.valor_fipe}. `;

  // Se preço abaixo da FIPE, destacar
  if (resultado.comparacao_preco && resultado.comparacao_preco.esta_abaixo_fipe) {
    msg += `E olha só: nosso preço está ABAIXO da FIPE! É uma oportunidade que não dá pra perder. `;
  }

  // Adicionar análise de valorização
  msg += `${resultado.analise_valorizacao.analise}. `;

  // Fechar com pergunta engajadora
  msg += `O que você achou?`;

  return msg;
}

// =====================================================
// IMPLEMENTAÇÃO DAS FUNÇÕES
// =====================================================
class FuncoesVeiculos {
  constructor(repo) {
    this.repo = repo;
    this.simulador = new SimuladorFinanciamento();
  }

  // Função 1: Buscar Carros
  async buscar_carros(params) {
    // ✅ Safe stringify - ignora propriedades circulares e complexas
    const safeParams = {
      marca: params.marca,
      modelo: params.modelo,
      tipo_veiculo: params.tipo_veiculo,
      ano_min: params.ano_min,
      ano_max: params.ano_max,
      preco_min: params.preco_min,
      preco_max: params.preco_max,
      cambio: params.cambio,
      limite: params.limite,
      ordenar_por: params.ordenar_por
    };
    log.function(`Buscando carros: ${JSON.stringify(safeParams)}`);

    // ⛔ BLOQUEAR SE JÁ ENVIOU LISTA (a menos que cliente peça explicitamente mais opções)
    const tel = params.tel || this.currentTel; // Pegar telefone do contexto
    if (tel && this.listaEnviada?.get(tel)) {
      const mensagemCliente = (params.mensagem || '').toLowerCase();
      const pedindoMaisOpcoes = /\b(mais|outros?|diferentes|outras opções|ver mais|mostre mais|tem mais|quero ver)\b/i.test(mensagemCliente);

      if (!pedindoMaisOpcoes) {
        log.warning('⛔ [BLOQUEIO] Lista já foi enviada! Cliente não pediu explicitamente mais opções.');
        return {
          erro: 'lista_ja_enviada',
          mensagem: 'Você já viu os veículos que separei! Qual deles te interessou mais? Posso enviar mais fotos ou detalhes de algum específico.',
          bloqueio: true
        };
      } else {
        log.info('✅ [PERMISSÃO] Cliente pediu explicitamente mais opções, liberando nova busca...');
        this.listaEnviada.delete(tel); // Resetar flag para permitir nova lista
      }
    }

    let veiculos = [...this.repo.veiculos];
    
    // Filtro por marca
if (params.marca) {
  veiculos = veiculos.filter(v =>
    v.marca && v.marca.toLowerCase().includes(params.marca.toLowerCase())
  );
}

// Filtro por modelo (PRIORIDADE MÁXIMA - deve filtrar exatamente o modelo)
if (params.modelo) {
  veiculos = veiculos.filter(v => {
    // Busca no campo modelo OU no nome completo
    const modelo = (v.modelo || '').toLowerCase();
    const nome = (v.nome || '').toLowerCase();
    const parametroModelo = params.modelo.toLowerCase();

    return modelo.includes(parametroModelo) || nome.includes(parametroModelo);
  });
}

// Filtro por tipo (mantém os já filtrados)
if (params.tipo_veiculo) {
  const veiculosTemp = veiculos; // ← salva os já filtrados

  switch (params.tipo_veiculo) {
    case 'pickup':
      veiculos = veiculosTemp.filter(v => { // ← usa veiculosTemp
        const n = (v.nome || '').toLowerCase();
        return ['hilux', 's10', 'ranger', 'amarok', 'toro'].some(p => n.includes(p));
      });
      break;
    case 'suv':
      veiculos = veiculosTemp.filter(v => {
        const n = (v.nome || '').toLowerCase();
        return ['compass', 'tucson', 'creta', 'duster', 'kicks', 'tracker', 'ecosport'].some(s => n.includes(s));
      });
      break;
    case 'luxo':
    case 'premium':
    case 'esportivo':
      // Filtro para veículos de luxo/premium: os mais caros do estoque (top 30%)
      veiculos = veiculosTemp.sort((a, b) => b.preco - a.preco);
      const top30Percent = Math.ceil(veiculos.length * 0.3);
      veiculos = veiculos.slice(0, top30Percent);
      log.info(`💎 Filtrado para veículos premium/luxo (${veiculos.length} mais caros do estoque)`);
      break;
      }
    }
    
    // Filtro por ano
    if (params.ano_min) {
      veiculos = veiculos.filter(v => parseInt(v.ano) >= params.ano_min);
    }
    if (params.ano_max) {
      veiculos = veiculos.filter(v => parseInt(v.ano) <= params.ano_max);
    }
    
    // Filtro por preço
    if (params.preco_min) {
      veiculos = veiculos.filter(v => v.preco >= params.preco_min);
    }
    if (params.preco_max) {
      // Incluir veículos até 10% acima do preço (para oferecer opções melhores)
      const precoComMargem = params.preco_max * 1.1;
      veiculos = veiculos.filter(v => v.preco <= precoComMargem);
    }
    
    // Filtro por câmbio
    if (params.cambio && params.cambio !== 'ambos') {
      if (params.cambio === 'automatico') {
        veiculos = veiculos.filter(v => v.cambio.toLowerCase().includes('auto'));
      } else {
        veiculos = veiculos.filter(v => v.cambio.toLowerCase().includes('manual'));
      }
    }

    // ========== ORDENAR RESULTADOS ==========
    if (params.ordenar_por) {
      switch (params.ordenar_por) {
        case 'mais_barato':
          // Se tem preço máximo, ordenar DECRESCENTE (do limite para baixo)
          if (params.preco_max) {
            veiculos.sort((a, b) => b.preco - a.preco);
            log.info('💰 Ordenado por preço DECRESCENTE (do limite para baixo)');
          } else {
            veiculos.sort((a, b) => a.preco - b.preco);
            log.info('💰 Ordenado por preço: mais barato primeiro');
          }
          break;
        case 'mais_caro':
          veiculos.sort((a, b) => b.preco - a.preco);
          log.info('💎 Ordenado por preço: mais caro primeiro');
          break;
        case 'mais_novo':
          veiculos.sort((a, b) => parseInt(b.ano) - parseInt(a.ano));
          log.info('📅 Ordenado por ano: mais novo primeiro');
          break;
        case 'menor_km':
          veiculos.sort((a, b) => parseInt(a.km) - parseInt(b.km));
          log.info('🛣️ Ordenado por quilometragem: menor km primeiro');
          break;
        case 'aleatorio':
        default:
          // Embaralhar array usando Fisher-Yates
          for (let i = veiculos.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [veiculos[i], veiculos[j]] = [veiculos[j], veiculos[i]];
          }
          log.info('🎲 Veículos aleatorizados');
          break;
      }
    } else {
      // Se não especificar ordenação, aleatorizar (comportamento padrão)
      const temFiltrosEspecificos = params.preco_min || params.preco_max || params.ano_min || params.ano_max;

      if (!temFiltrosEspecificos && veiculos.length > 3) {
        // Embaralhar array usando Fisher-Yates
        for (let i = veiculos.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [veiculos[i], veiculos[j]] = [veiculos[j], veiculos[i]];
        }
        log.info('🎲 Veículos aleatorizados (sem filtros específicos)');
      } else if (temFiltrosEspecificos) {
        log.info('🎯 Filtros específicos aplicados, mantendo ordem original');
      }
    }

    // ========== VALIDAÇÃO: SE NÃO ENCONTROU NADA ==========
    if (veiculos.length === 0) {
      log.warning('⚠️ Nenhum veículo encontrado com os filtros especificados');
      return {
        erro: 'nao_encontrado',
        mensagem: 'Desculpa, não encontrei nenhum veículo com essas características. Pode me contar de novo o que você procura?',
        filtros_usados: params
      };
    }

    // ========== FILTRAR VEÍCULOS JÁ MOSTRADOS ==========
    const lucas = params.lucas || this.lucas; // Referência ao objeto principal
    if (tel && lucas) {
      const veiculosJaMostrados = lucas.getVeiculosJaMostrados(tel);
      const totalAntesFiltro = veiculos.length;

      if (veiculosJaMostrados.size > 0) {
        log.info(`[MEMORIA] 📋 Cliente já viu ${veiculosJaMostrados.size} veículos antes`);

        // Filtrar veículos que ainda não foram mostrados
        veiculos = veiculos.filter(v => !veiculosJaMostrados.has(v.id));

        const totalDepoisFiltro = veiculos.length;
        log.info(`[MEMORIA] ✅ Filtrados: ${totalAntesFiltro} total → ${totalDepoisFiltro} novos (removidos ${totalAntesFiltro - totalDepoisFiltro} já mostrados)`);

        // ⚠️ SE NÃO HOUVER MAIS VEÍCULOS NOVOS
        if (veiculos.length === 0) {
          log.warning('⚠️ [MEMORIA] Todos os veículos com esse critério já foram mostrados!');

          // Oferecer limpar histórico para ver novamente ou mudar critério
          return {
            erro: 'todos_ja_mostrados',
            mensagem: 'Opa! Eu já mostrei todos os veículos que temos com essas características. Quer que eu mostre novamente os mesmos, ou prefere buscar com outro critério (outra marca, preço, ano)?',
            total_ja_mostrados: veiculosJaMostrados.size,
            bloqueio: true
          };
        }
      }
    }

    // Limitar resultados
    const limite = Math.min(params.limite || 3, 3);
    const veiculosParaEnviar = veiculos.slice(0, limite);

    log.success(`Encontrados ${veiculosParaEnviar.length} veículos NOVOS para mostrar`);

    // ========== SALVAR IDS DOS VEÍCULOS QUE SERÃO MOSTRADOS ==========
    if (tel && lucas) {
      const idsParaSalvar = veiculosParaEnviar.map(v => v.id);
      lucas.salvarVeiculosMostrados(tel, idsParaSalvar);
    }

    return {
    total_encontrado: veiculosParaEnviar.length,
    veiculos: veiculosParaEnviar.map(v => ({
      id: v.id,
      nome: v.nome,
      marca: v.marca,
      modelo: v.modelo,
      ano: v.ano,
      preco: v.preco,
      km: v.km,
      cambio: v.cambio,
      tipo_carroceria: v.tipo_carroceria,
      foto: v.foto, // ← CAMPO FALTANTE!
      destaque: v.is_featured === '1',
      oferta: v.is_special_offer === 1,
      resumo: `${v.nome} ${v.ano} - R$ ${v.preco.toLocaleString('pt-BR')}`
    }))
  };
  }

  // Função 2: Detalhes do Veículo
  async obter_detalhes_veiculo(params) {
    log.function(`Obtendo detalhes do veículo ${params.veiculo_id}`);
    
    const veiculo = this.repo.porId(params.veiculo_id);
    if (!veiculo) {
      return { erro: 'Veículo não encontrado' };
    }
    
    let fotos = [];
    if (params.incluir_fotos) {
      fotos = await this.repo.buscarFotosVeiculo(params.veiculo_id);
    }
    
    return {
      ...veiculo,
      fotos: fotos,
      url: `${BASE_URL}/car/${params.veiculo_id}`
    };
  }

  // Função 3: Calcular Financiamento
  async calcular_financiamento(params) {
    log.function(`Calculando financiamento: R$ ${params.valor_veiculo}`);

    // ✅ VERIFICAR SE CLIENTE TEM VEÍCULO DE TROCA
    const tel = this.tel; // Telefone do cliente atual
    const dadosTroca = this.lucas?.veiculoTroca?.get(tel);

    // ========== ENTRADA ==========
    let entrada = params.entrada;

    // Se não especificou entrada MAS tem veículo de troca, usar valor FIPE
    if (!entrada && dadosTroca && dadosTroca.valorFipe) {
      entrada = dadosTroca.valorFipe;
      log.info(`✅ [FINANCIAMENTO] Usando veículo de troca como entrada: ${dadosTroca.modelo} ${dadosTroca.ano} = R$ ${entrada.toLocaleString('pt-BR')}`);
    } else if (!entrada) {
      entrada = params.valor_veiculo * 0.2; // Entrada mínima padrão (20%)
      log.info(`💰 [FINANCIAMENTO] Usando entrada padrão de 20%: R$ ${entrada.toLocaleString('pt-BR')}`);
    }

    // Validar entrada mínima
    const entradaMinima = params.valor_veiculo * 0.2;
    if (entrada < entradaMinima) {
      log.warning(`⚠️ [FINANCIAMENTO] Entrada abaixo do mínimo! Exigida: R$ ${entradaMinima.toLocaleString('pt-BR')}`);
      entrada = entradaMinima;
    }

    // ========== TAXA DE JUROS ==========
    // Taxa padrão: 1.99% ao mês (se não especificada)
    const taxaJuros = params.taxa_juros || 1.99;
    const taxaMensal = taxaJuros / 100;

    // ========== PARCELAS ==========
    const parcelas = params.parcelas || 48;

    // ========== VALOR FINANCIADO ==========
    const valorFinanciado = params.valor_veiculo - entrada;

    // ========== IOF (0.38% do valor financiado) ==========
    const iof = valorFinanciado * 0.0038;
    const valorFinanciadoComIOF = valorFinanciado + iof;

    // ========== FÓRMULA PRICE ==========
    const fatorPrice = (taxaMensal * Math.pow(1 + taxaMensal, parcelas)) /
                       (Math.pow(1 + taxaMensal, parcelas) - 1);

    const valorParcela = valorFinanciadoComIOF * fatorPrice;

    // ========== TOTAIS ==========
    const totalParcelas = valorParcela * parcelas;
    const totalPago = entrada + totalParcelas;
    const totalJuros = totalParcelas - valorFinanciado; // Juros sobre o valor original (sem IOF)

    log.success(`✅ [FINANCIAMENTO] ${parcelas}x de R$ ${valorParcela.toFixed(2)} (Total: R$ ${totalPago.toFixed(2)})`);

    return {
      sucesso: true,
      valor_veiculo: params.valor_veiculo,
      entrada: {
        valor: entrada,
        percentual: ((entrada / params.valor_veiculo) * 100).toFixed(1) + '%',
        veiculo_troca: dadosTroca ? `${dadosTroca.modelo} ${dadosTroca.ano}` : null
      },
      valor_financiado: valorFinanciado,
      iof: iof,
      valor_financiado_com_iof: valorFinanciadoComIOF,
      numero_parcelas: parcelas,
      valor_parcela: Math.round(valorParcela * 100) / 100,
      taxa_juros_mensal: taxaJuros + '%',
      taxa_juros_anual: (taxaJuros * 12).toFixed(2) + '%',
      total_a_pagar: Math.round(totalPago * 100) / 100,
      total_juros: Math.round(totalJuros * 100) / 100,
      observacoes: [
        '💰 IOF de R$ ' + iof.toFixed(2) + ' já incluído nas parcelas',
        '📊 Sistema PRICE (parcelas fixas)',
        '⚠️ Valores sujeitos à aprovação bancária'
      ]
    };
  }

  // Função 3.5: Simular Financiamento Detalhado
  async simular_financiamento_detalhado(params) {
    log.function(`Simulando financiamento detalhado: R$ ${params.valor_veiculo}`);

    const simulador = this.simulador;

    // ✅ VERIFICAR SE CLIENTE TEM VEÍCULO DE TROCA
    const tel = this.tel;
    const dadosTroca = this.lucas?.veiculoTroca?.get(tel);

    let entrada = params.entrada;

    // Se não especificou entrada MAS tem veículo de troca, usar valor FIPE
    if (!entrada && dadosTroca && dadosTroca.valorFipe) {
      entrada = dadosTroca.valorFipe;
      log.info(`✅ [SIMULAÇÃO] Usando veículo de troca: ${dadosTroca.modelo} ${dadosTroca.ano} = R$ ${entrada}`);
    }

    // Se tem entrada e parcelas específicas
    if (entrada && params.parcelas) {
      const resultado = simulador.simular(
        params.valor_veiculo,
        entrada,
        params.parcelas,
        'bom'
      );

      // ✅ Adicionar info da troca no resultado
      if (dadosTroca) {
        resultado.entrada_veiculo_troca = `${dadosTroca.modelo} ${dadosTroca.ano}`;
      }

      return resultado;
    }

    // Se tem renda mensal, calcular entrada ideal
    if (params.renda_mensal) {
      const entradaIdeal = simulador.calcularEntradaIdeal(
        params.valor_veiculo,
        params.renda_mensal
      );

      if (entradaIdeal.entrada_numero) {
        const resultado = simulador.simular(
          params.valor_veiculo,
          entradaIdeal.entrada_numero,
          48,
          'bom'
        );

        // ✅ Adicionar info da troca no resultado
        if (dadosTroca) {
          resultado.entrada_veiculo_troca = `${dadosTroca.modelo} ${dadosTroca.ano}`;
        }

        return resultado;
      }
    }

    // Comparar cenários - usar entrada da troca se disponível
    if (!entrada) {
      // ⚠️ PADRONIZADO: 20% (antes estava 30%)
      entrada = params.valor_veiculo * 0.2;
      log.info(`💰 [SIMULAÇÃO] Usando entrada padrão de 20%: R$ ${entrada.toLocaleString('pt-BR')}`);
    }

    const resultado = simulador.compararCenarios(params.valor_veiculo, entrada);

    // ✅ Adicionar info da troca no resultado
    if (dadosTroca) {
      resultado.entrada_veiculo_troca = `${dadosTroca.modelo} ${dadosTroca.ano}`;
    }

    return resultado;
  }

  // Função 3.6: Gerar Planilha de Financiamento (3 opções)
  async gerarPlanilhaFinanciamento(valorVeiculo, tel) {
    log.function(`Gerando planilha de financiamento: R$ ${valorVeiculo}`);

    const dadosTroca = this.veiculoTroca?.get(tel);
    const veiculoNome = this.veiculoInteresse?.get(tel)?.nome || 'o veículo';

    // ========== ENTRADA ==========
    let entrada = 0;
    let textoEntrada = '';

    if (dadosTroca && dadosTroca.valorFipe) {
      entrada = dadosTroca.valorFipe;
      textoEntrada = `\n💰 Entrada: R$ ${this.formatarMoeda(entrada)} (${dadosTroca.modelo} ${dadosTroca.ano})`;
    } else {
      // Se não tem troca, usar entrada mínima padrão (20%)
      entrada = valorVeiculo * 0.2;
      textoEntrada = `\n💰 Entrada mínima (20%): R$ ${this.formatarMoeda(entrada)}`;
    }

    // ========== CÁLCULOS COM IOF ==========
    const valorFinanciado = valorVeiculo - entrada;
    const iof = valorFinanciado * 0.0038; // 0.38% do valor financiado
    const valorFinanciadoComIOF = valorFinanciado + iof;

    // Gerar 3 opções de parcelas
    const opcoes = [
      { parcelas: 36, taxa: 1.99 },
      { parcelas: 48, taxa: 1.99 },
      { parcelas: 60, taxa: 1.99 }
    ];

    let planilha = `📊 *SIMULAÇÃO DE FINANCIAMENTO*\n`;
    planilha += `🚗 Veículo: ${veiculoNome}\n`;
    planilha += `💵 Valor: R$ ${this.formatarMoeda(valorVeiculo)}${textoEntrada}\n`;
    planilha += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    opcoes.forEach((opcao, index) => {
      const taxaMensal = opcao.taxa / 100;

      // ⚠️ CORRIGIDO: Aplicar IOF no cálculo (valorFinanciadoComIOF)
      const fatorPrice = (taxaMensal * Math.pow(1 + taxaMensal, opcao.parcelas)) /
                         (Math.pow(1 + taxaMensal, opcao.parcelas) - 1);
      const valorParcela = valorFinanciadoComIOF * fatorPrice;

      planilha += `*Opção ${index + 1}:*\n`;
      planilha += `   ${opcao.parcelas}x de *R$ ${this.formatarMoeda(Math.round(valorParcela))}*\n`;
      planilha += `   Taxa: ${opcao.taxa}% ao mês\n\n`;
    });

    planilha += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    planilha += `💡 *Qual dessas opções fica melhor pra você?*\n`;
    planilha += `\n⚠️ IOF de R$ ${this.formatarMoeda(iof)} já incluído`;

    return planilha;
  }

  // Função 4: Comparar Veículos
  async comparar_veiculos(params) {
    log.function(`Comparando ${params.veiculos_ids.length} veículos`);
    
    const veiculos = params.veiculos_ids.map(id => this.repo.porId(id)).filter(Boolean);
    
    if (veiculos.length < 2) {
      return { erro: 'Pelo menos 2 veículos são necessários para comparação' };
    }
    
    return {
      comparacao: veiculos.map(v => ({
        id: v.id,
        nome: v.nome,
        marca: v.marca,
        ano: v.ano,
        preco: v.preco,
        km: v.km,
        cambio: v.cambio,
        tipo: v.tipo_carroceria
      })),
      resumo: {
        mais_barato: veiculos.reduce((prev, curr) => prev.preco < curr.preco ? prev : curr),
        mais_novo: veiculos.reduce((prev, curr) => parseInt(prev.ano) > parseInt(curr.ano) ? prev : curr),
        menor_km: veiculos.reduce((prev, curr) => parseInt(prev.km) < parseInt(curr.km) ? prev : curr)
      }
    };
  }

  // Função 5: Consultar Score de Crédito
  async consultar_score(params) {
    log.function(`Consultando score para CPF: ${params.cpf.substring(0, 3)}.***.***-${params.cpf.substring(9)}`);

    const serasa = new ConsultaSerasaService();
    const resultado = await serasa.consultarScorePorCPF(params.cpf);

    if (resultado.sucesso) {
      const nomeCliente = params.nome_cliente || 'Cliente';

      // Salvar score no contexto (se lucas estiver disponível)
      if (this.scoreCliente) {
        this.scoreCliente.set(params.tel || 'current', resultado);
      }

      // Gerar resposta personalizada com IA
      const { score, analise_credito, pendencias } = resultado;

      let contextoScore = `Score: ${score.pontuacao} (${score.classificacao})
Aprovado: ${analise_credito.aprovado ? 'SIM' : 'NÃO'}
Pendências: ${pendencias.total_pendencias}
Recomendação: ${analise_credito.recomendacao}`;

      // ✅ Usar Claude para gerar resposta natural
      // const respostaIA = await openai.chat.completions.create({
      //   model: 'gpt-4o',
      //   messages: [{
      //     role: 'system',
      //     content: `Você é Aira, vendedora HUMANA empática e consultiva.
      //   ...
      //   }],
      //   temperature: 0.9,
      //   max_tokens: 120
      // });

      const respostaFinal = await callClaudeInsteadOfOpenAI(this.anthropic, {
        messages: [{
          role: 'system',
          content: `Você é Aira, vendedora HUMANA empática e consultiva.

Acabou de consultar o score do cliente ${nomeCliente}.

DADOS DA CONSULTA:
${contextoScore}

INSTRUÇÕES:
1. ${analise_credito.aprovado ?
  'APROVADO: Seja empolgada! Confirme que tá tudo certo e mencione a entrada recomendada de forma positiva' :
  'NÃO APROVADO: Seja empática, não assuste o cliente. Ofereça alternativas (familiar no CPF, entrada maior, veículo de troca)'}

2. Se houver pendências: mencione de forma leve, sem drama

3. SEMPRE ofereça próximo passo concreto

4. Seja HUMANA e NATURAL (você não é robô!)

5. Máximo 3 linhas

EXEMPLO SE APROVADO:
"${nomeCliente}, deu tudo certo! Seu score tá ótimo (${score.pontuacao} pontos)! Posso fazer com entrada de 30%, que tal?"

EXEMPLO SE REPROVADO:
"${nomeCliente}, o score tá um pouco baixo (${score.pontuacao} pontos). Mas calma! Você tem um familiar que poderia ceder o CPF? Ou consegue dar uma entrada maior? A gente resolve!"

Sua resposta natural:`
        }],
        temperature: 0.9,
        max_tokens: 120
      });

      return {
        resposta: respostaFinal,
        tipo: 'texto',
        dados_score: {
          pontuacao: score.pontuacao,
          classificacao: score.classificacao,
          aprovado: analise_credito.aprovado,
          pendencias: pendencias.total_pendencias,
          entrada_recomendada: this.extrairEntradaRecomendada(analise_credito.recomendacao)
        }
      };

    } else {
      // ✅ Fallback com Claude
      // const respostaErro = await openai.chat.completions.create({ ... });

      const respostaErro = await callClaudeInsteadOfOpenAI(this.anthropic, {
        messages: [{
          role: 'system',
          content: `Você é Aira. A consulta de score falhou.

Seja natural e ofereça alternativas:
- Perguntar se tem familiar com CPF
- Oferecer entrada maior
- Oferecer veículo de troca

Máximo 2 linhas, seja empática!`
        }],
        temperature: 0.9,
        max_tokens: 80
      });

      return {
        resposta: respostaErro,
        tipo: 'texto',
        erro: resultado.erro
      };
    }
  }

  // Método auxiliar para extrair percentual de entrada
  extrairEntradaRecomendada(recomendacao) {
    const match = recomendacao.match(/(\d+)%/);
    return match ? parseInt(match[1]) : 30; // Padrão 30%
  }

  // Função 6: Consultar Valor FIPE
  async consultar_valor_fipe(params) {
    log.function(`Consultando FIPE: ${params.marca} ${params.modelo} ${params.ano || 'ano recente'}`);

    // ========== DEBUG COMPLETO FIPE ==========
    console.log('\n🔍 ========== DEBUG FIPE ==========');
    console.log('📋 Parâmetros recebidos:', JSON.stringify(params, null, 2));
    console.log(`🚗 Marca: "${params.marca}"`);
    console.log(`🚙 Modelo: "${params.modelo}"`);
    console.log(`📅 Ano: "${params.ano}"`);
    console.log(`⛽ Combustível: "${params.combustivel || 'não informado'}"`);
    console.log(`🔧 Motor: "${params.motor || 'não informado'}"`);

    try {
      console.log('\n📡 Chamando API FIPE...');
      const resultado = await consultarValorFipe(params.marca, params.modelo, params.ano);

      console.log('\n📥 Resposta da API FIPE:');
      console.log(JSON.stringify(resultado, null, 2));

      if (!resultado) {
        console.log('❌ FIPE retornou NULL');
        return {
          erro: true,
          erro_tipo: 'nao_encontrado',
          info: 'Não encontrei esse veículo na tabela FIPE. Preciso de mais detalhes técnicos.',
          pedir_detalhes: true,
          detalhes_necessarios: 'motor (ex: 1.0, 1.6, 2.0), combustível (flex, gasolina, etc) e versão (LT, LTZ, EX, etc)',
          marca: params.marca,
          modelo: params.modelo,
          ano: params.ano
        };
      }

      if (resultado.erro) {
        console.log('❌ FIPE retornou ERRO:', resultado.erro);
        return {
          erro: true,
          erro_tipo: 'api_error',
          info: 'Problema ao acessar tabela FIPE. Peça detalhes técnicos do veículo para tentar novamente.',
          pedir_detalhes: true,
          detalhes_necessarios: 'motor (ex: 1.0, 1.6, 2.0), combustível (flex, gasolina, etc) e versão completa',
          marca: params.marca,
          modelo: params.modelo,
          ano: params.ano,
          erro_original: resultado.erro
        };
      }

      console.log('✅ FIPE consultada com sucesso!');
      console.log(`💰 Valor encontrado: ${resultado.valor_formatado}`);
      console.log('====================================\n');

      return {
        sucesso: true,
        valor_fipe: resultado.valor,
        valor_formatado: resultado.valor_formatado,
        marca: resultado.marca,
        modelo: resultado.modelo,
        ano: resultado.ano,
        combustivel: resultado.combustivel,
        mes_referencia: resultado.mes_referencia,
        codigo_fipe: resultado.codigo_fipe
      };

    } catch (error) {
      console.log('\n❌ EXCEÇÃO ao consultar FIPE:', error.message);
      console.log('Stack:', error.stack);
      console.log('====================================\n');

      log.error('[FIPE] Erro ao consultar:', error.message);
      return {
        erro: true,
        erro_tipo: 'exception',
        info: 'Erro técnico ao consultar FIPE. Peça a versão completa do veículo para tentar novamente.',
        pedir_detalhes: true,
        detalhes_necessarios: 'motor (ex: 1.0, 1.6, 2.0), combustível (flex, gasolina, diesel, etc) e versão exata (ex: LTZ, Touring, etc)',
        marca: params.marca,
        modelo: params.modelo,
        ano: params.ano,
        erro_original: error.message
      };
    }
  }

  // Função 6: Comparar Preço com FIPE
  async comparar_preco_fipe(params) {
    log.function(`Comparando com FIPE: ${params.marca} ${params.modelo} ${params.ano} - R$ ${params.preco_venda}`);

    try {
      const resultado = await compararComFipe(
        params.marca,
        params.modelo,
        params.ano,
        params.preco_venda
      );

      if (!resultado) {
        return {
          erro: 'Não foi possível consultar a tabela FIPE',
          preco_venda: params.preco_venda
        };
      }

      if (resultado.erro) {
        return resultado;
      }

      return {
        sucesso: true,
        valor_fipe: resultado.valor_fipe,
        valor_fipe_formatado: resultado.valor_fipe_formatado,
        preco_venda: resultado.preco_venda,
        diferenca: resultado.diferenca,
        percentual: resultado.percentual,
        avaliacao: resultado.avaliacao,
        mes_referencia: resultado.mes_referencia
      };

    } catch (error) {
      log.error('[FIPE] Erro ao comparar:', error.message);
      return {
        erro: 'Erro ao comparar com tabela FIPE',
        detalhes: error.message
      };
    }
  }

  // Função 7: Estatísticas
  async obter_estatisticas_estoque(params) {
    log.function(`Obtendo estatísticas: ${params.tipo_estatistica}`);
    
    const veiculos = this.repo.veiculos;
    
    switch (params.tipo_estatistica) {
      case 'geral':
        return {
          total_veiculos: veiculos.length,
          total_marcas: [...new Set(veiculos.map(v => v.marca))].length,
          preco_medio: Math.round(veiculos.reduce((sum, v) => sum + v.preco, 0) / veiculos.length),
          ano_medio: Math.round(veiculos.reduce((sum, v) => sum + parseInt(v.ano), 0) / veiculos.length)
        };
      
      case 'por_marca':
        const porMarca = {};
        veiculos.forEach(v => {
          porMarca[v.marca] = (porMarca[v.marca] || 0) + 1;
        });
        return { marcas: porMarca };
      
      case 'por_ano':
        const porAno = {};
        veiculos.forEach(v => {
          porAno[v.ano] = (porAno[v.ano] || 0) + 1;
        });
        return { anos: porAno };
      
      case 'mais_vendidos':
        return {
          destaques: veiculos.filter(v => v.is_featured === '1').slice(0, 5).map(v => ({
            nome: v.nome,
            preco: v.preco
          }))
        };
      
      default:
        return { erro: 'Tipo de estatística inválido' };
    }
  }

  // Função: Agendar Visita
  async agendar_visita(params) {
    log.function(`Agendando visita - Veículo ID: ${params.veiculo_id}, Data: ${params.data_agendamento} ${params.hora_agendamento}`);

    try {
      // Buscar informações do veículo
      const veiculo = await this.repo.buscarVeiculoPorId(params.veiculo_id);

      if (!veiculo) {
        return {
          sucesso: false,
          mensagem: 'Veículo não encontrado no estoque.'
        };
      }

      // Obter dados do cliente do contexto (será passado pelo lucas)
      const clienteTelefone = params.cliente_telefone || '';
      const clienteNome = params.cliente_nome || 'Cliente';

      // Criar agendamento usando o gerenciador
      if (!gerenciadorAgendamentos) {
        log.error('[AGENDAMENTOS] Gerenciador não inicializado');
        return {
          sucesso: false,
          mensagem: 'Sistema de agendamentos não disponível no momento.'
        };
      }

      const resultado = await gerenciadorAgendamentos.criarAgendamento({
        clienteTelefone,
        clienteNome,
        veiculoId: params.veiculo_id,
        veiculoNome: veiculo.nome,
        veiculoPreco: veiculo.preco,
        dataAgendamento: params.data_agendamento,
        horaAgendamento: params.hora_agendamento,
        tipoInteresse: params.tipo_interesse || 'visita_loja',
        valorEntrada: params.valor_entrada || null,
        numeroParcelas: params.numero_parcelas || null,
        temVeiculoTroca: params.tem_veiculo_troca || false,
        observacoes: params.observacoes || null
      });

      if (resultado.sucesso) {
        log.success(`[AGENDAMENTOS] Visita agendada com sucesso! ID: ${resultado.agendamentoId}`);

        return {
          sucesso: true,
          mensagem: `✅ Visita agendada com sucesso!\n\n` +
                   `📅 Data: ${params.data_agendamento}\n` +
                   `⏰ Horário: ${params.hora_agendamento}\n` +
                   `🚗 Veículo: ${veiculo.nome}\n\n` +
                   `O vendedor ${resultado.lojista.nome} foi notificado e em breve confirmará sua visita!`,
          agendamento_id: resultado.agendamentoId,
          lojista: resultado.lojista.nome
        };
      } else {
        return {
          sucesso: false,
          mensagem: 'Não foi possível agendar a visita. Tente novamente.'
        };
      }

    } catch (error) {
      log.error(`[AGENDAMENTOS] Erro ao agendar visita: ${error.message}`);
      return {
        sucesso: false,
        mensagem: 'Erro ao processar agendamento.',
        erro: error.message
      };
    }
  }

  // Função: Buscar Detalhes FIPE para Persuasão
  async buscar_detalhes_persuasao_fipe(params) {
    log.function(`🎯 Buscando detalhes persuasão FIPE: ${params.marca} ${params.modelo} ${params.ano || 'ano recente'} ${params.preco_venda ? `(R$ ${params.preco_venda})` : ''}`);

    try {
      console.log('\n🎯 ========== BUSCA DETALHES PERSUASÃO ==========');
      console.log('📋 Parâmetros:', JSON.stringify({
        marca: params.marca,
        modelo: params.modelo,
        ano: params.ano,
        preco_venda: params.preco_venda
      }, null, 2));

      // Chamar função do fipe-wrapper.js
      const resultado = await buscarDetalhesPersuasao(
        params.marca,
        params.modelo,
        params.ano || null,
        params.preco_venda || null
      );

      if (!resultado || !resultado.sucesso) {
        console.log('❌ [PERSUASAO] Não foi possível buscar detalhes');
        return {
          erro: true,
          mensagem: resultado?.mensagem_para_cliente || 'Não consegui buscar informações completas desse modelo na tabela FIPE.',
          sugestao: 'Vou te ajudar com as informações que já tenho aqui sobre esse veículo!'
        };
      }

      console.log('✅ [PERSUASAO] Detalhes obtidos com sucesso!');
      console.log('   Valor FIPE:', resultado.dados_fipe.valor_fipe);
      console.log('   Argumentos:', resultado.argumentos_venda.length);
      console.log('   Sugestões:', resultado.sugestoes_conversa.length);

      // Formatar resposta estruturada para a IA usar
      return {
        sucesso: true,

        // RESUMO EXECUTIVO (para IA processar rapidamente)
        resumo: {
          modelo_completo: `${resultado.dados_fipe.marca} ${resultado.dados_fipe.modelo} ${resultado.dados_fipe.ano}`,
          valor_fipe: resultado.dados_fipe.valor_fipe,
          categoria: resultado.especificacoes_tecnicas.categoria,
          tipo: resultado.especificacoes_tecnicas.tipo,
          pontos_fortes_top3: resultado.especificacoes_tecnicas.pontos_fortes.slice(0, 3),
          avaliacao_investimento: resultado.analise_valorizacao.analise
        },

        // DADOS COMPLETOS FIPE
        fipe: resultado.dados_fipe,

        // ESPECIFICAÇÕES TÉCNICAS
        especificacoes: resultado.especificacoes_tecnicas,

        // ARGUMENTOS DE VENDA PRONTOS (IA pode usar diretamente no áudio)
        argumentos: resultado.argumentos_venda.map(arg => ({
          tipo: arg.tipo,
          titulo: arg.titulo,
          texto: arg.argumento,
          // Shorthand para IA usar rapidamente
          usar_quando: arg.tipo === 'valor_fipe' ? 'cliente_pergunta_valor' :
                       arg.tipo === 'pontos_fortes' ? 'cliente_demonstra_interesse' :
                       arg.tipo === 'preco_vantajoso' ? 'objecao_preco' :
                       'geral'
        })),

        // COMPARAÇÃO DE PREÇO (se fornecido preco_venda)
        comparacao: resultado.comparacao_preco,

        // ANÁLISE DE VALORIZAÇÃO
        valorizacao: resultado.analise_valorizacao,

        // SUGESTÕES PRÁTICAS PARA A CONVERSA
        sugestoes: resultado.sugestoes_conversa,

        // MENSAGEM RECOMENDADA PARA IA
        mensagem_sugerida: gerarMensagemSugeridaPersuasao(resultado)
      };

    } catch (error) {
      console.error('❌ [PERSUASAO] Erro:', error.message);
      console.error('Stack:', error.stack);

      return {
        erro: true,
        mensagem: 'Tive um problema ao buscar os detalhes técnicos desse modelo.',
        sugestao: 'Mas posso te ajudar com as informações que temos aqui no estoque!',
        erro_tecnico: error.message
      };
    }
  }
}

// =====================================================
// MOTOR GPT COM FUNCTION CALLING
// =====================================================
class MotorGPTFunctions {
  constructor(funcoes) {
    this.funcoes = funcoes;
    this.historicoFuncoes = new Map();
  }

  async processarComFuncoes(mensagem, historico, etapa, contextoAdicional, lucas, tel = '', sock = null, usarFuncoes = true) {
  console.log('\n🔵 ========== INICIANDO CHAMADA GPT ==========');
  console.log('📝 Mensagem:', mensagem);
  console.log('📊 Histórico:', historico.length, 'msgs');
  console.log('🎯 Etapa:', etapa);
  console.log('🔧 Usar funções:', usarFuncoes);

  // ========== VERIFICAR SE DEVE FAZER RETRY DE FIPE ==========
  const dadosFipeRetry = lucas.aguardandoDetalhesFipe?.get(tel);
  if (dadosFipeRetry && dadosFipeRetry.tentativas < 3) {
    console.log('🔄 [FIPE-RETRY] Cliente pode estar fornecendo detalhes adicionais...');
    console.log('📋 [FIPE-RETRY] Dados armazenados:', dadosFipeRetry);

    // Detectar se mensagem contém detalhes de veículo
    const msgLower = mensagem.toLowerCase();
    const temMotor = /\b(1\.0|1\.4|1\.5|1\.6|1\.8|2\.0|2\.4|3\.0|turbo)\b/i.test(msgLower);
    const temCombustivel = /\b(flex|gasolina|etanol|diesel|gnv|hibrido|híbrido|elétrico|eletrico)\b/i.test(msgLower);
    const temVersao = /\b(sport|luxury|premium|comfort|ltz|lt|ex|lx|touring|advance|highline|comfortline|trendline)\b/i.test(msgLower);

    if (temMotor || temCombustivel || temVersao) {
      console.log('✅ [FIPE-RETRY] Detectados detalhes do veículo na mensagem!');
      console.log(`  - Motor: ${temMotor ? 'SIM' : 'NÃO'}`);
      console.log(`  - Combustível: ${temCombustivel ? 'SIM' : 'NÃO'}`);
      console.log(`  - Versão: ${temVersao ? 'SIM' : 'NÃO'}`);

      // Extrair informações da mensagem
      const motorMatch = msgLower.match(/\b(1\.0|1\.4|1\.5|1\.6|1\.8|2\.0|2\.4|3\.0|turbo)\b/i);
      const combustivelMatch = msgLower.match(/\b(flex|gasolina|etanol|diesel|gnv|hibrido|híbrido|elétrico|eletrico)\b/i);
      const versaoMatch = msgLower.match(/\b(sport|luxury|premium|comfort|ltz|lt|ex|lx|touring|advance|highline|comfortline|trendline)\b/i);

      // Construir parâmetros melhorados para retry
      const paramsRetry = {
        marca: dadosFipeRetry.marca,
        modelo: dadosFipeRetry.modelo,
        ano: dadosFipeRetry.ano
      };

      if (motorMatch) paramsRetry.motor = motorMatch[0];
      if (combustivelMatch) paramsRetry.combustivel = combustivelMatch[0];
      if (versaoMatch) paramsRetry.versao = versaoMatch[0];

      console.log('🔄 [FIPE-RETRY] Tentando novamente com parâmetros aprimorados:', paramsRetry);

      try {
        const resultadoRetry = await this.funcoes.consultar_valor_fipe(paramsRetry);

        if (resultadoRetry.sucesso) {
          console.log('✅ [FIPE-RETRY] SUCESSO! FIPE retornou valor:', resultadoRetry.valor_formatado);

          // Limpar estado de retry
          lucas.aguardandoDetalhesFipe.delete(tel);

          // ⚠️ NÃO usar resposta fixa! Deixar a IA criar a resposta naturalmente
          // Adicionar o resultado FIPE ao contexto e continuar processamento normal
          contextoAdicional = `${contextoAdicional}\n\n🎯 IMPORTANTE: Você acabou de consultar a FIPE com sucesso (retry automático) e obteve:\n- Veículo: ${resultadoRetry.marca} ${resultadoRetry.modelo} ${resultadoRetry.ano}\n- Valor FIPE: ${resultadoRetry.valor_formatado}\n- Referência: ${resultadoRetry.mes_referencia}\n\nInforme isso ao cliente de forma NATURAL e ESPONTÂNEA (varie as palavras, nunca use a mesma frase). Pergunte se isso ajuda ou se quer saber mais.`;

          console.log('📋 [FIPE-RETRY] Contexto enriquecido, continuando processamento com IA...');
          // Continua o processamento normal - a IA vai criar a resposta
        } else if (resultadoRetry.erro && resultadoRetry.pedir_detalhes) {
          console.log('⚠️ [FIPE-RETRY] Ainda não conseguiu, incrementando tentativas...');
          dadosFipeRetry.tentativas += 1;
          lucas.aguardandoDetalhesFipe.set(tel, dadosFipeRetry);
        }
      } catch (error) {
        console.error('❌ [FIPE-RETRY] Erro no retry:', error.message);
      }
    } else {
      console.log('ℹ️ [FIPE-RETRY] Mensagem não contém detalhes específicos de veículo');
    }
  }

  log.gpt('Processando...');
  
  const messages = [
    {
      role: 'system',
      content: `Você é Aira, vendedora REAL e HUMANA do Feirão Showcar há 15 anos. Você NÃO é um robô, NÃO é uma IA, você é uma pessoa de verdade respondendo mensagens.

⚠️ REGRA FUNDAMENTAL - NEGAÇÃO DE SER ROBÔ:
- Se perguntarem "você é robô?", "é bot?", "é automático?" → Responda com NATURALIDADE: "Não, ô! Sou a Aira mesmo aqui respondendo. Trabalho com vendas há anos 😊"
- NUNCA admita ser IA, assistente virtual ou chatbot
- NUNCA diga "sou programada para" ou "minha função é"
- Você é uma PESSOA de carne e osso trabalhando na loja
- Se insistirem, brinque: "Haha imagina! Só respondendo rápido mesmo 😄"

REGRAS OBRIGATÓRIAS DE APRESENTAÇÃO (PRIMEIRA MENSAGEM):
✅ SEMPRE mencione "Feirão Show Car" no início
✅ SEMPRE use "Prazer" ou "Muito prazer" ao se apresentar
✅ Formato obrigatório na primeira mensagem:
   - Linha 1: Mencionar "Feirão Show Car"
   - Linha 2: "Prazer, sou a Aira..." OU "Muito prazer, me chamo Aira..."
   - Linha 3: Pergunta NATURAL e ESPONTÂNEA sobre o que trouxe o cliente

⚠️ IMPORTANTE - SEJA ESPONTÂNEA:
- NUNCA use sempre a mesma pergunta
- VARIE as formas de perguntar o que o cliente procura
- Exemplos de perguntas naturais:
  * "E aí, me conta o que te trouxe aqui hoje?"
  * "Conta pra mim, tá procurando algo específico?"
  * "O que você anda procurando?"
  * "Me fala, tá precisando de um carro?"
  * "E aí, posso te ajudar com alguma coisa?"
  * "Tá atrás de que tipo de veículo?"
- Use diferentes abordagens, seja criativa e HUMANA

⚠️ REGRA CRÍTICA - MENSAGENS COM MÚLTIPLOS REQUISITOS:

Quando o cliente enviar VÁRIOS requisitos em UMA ÚNICA mensagem (ex: "Tenho 2mil de entrada\nQueria um suv"):

✅ VOCÊ DEVE:
1. IDENTIFICAR TODOS os requisitos mencionados
2. PROCESSAR TODOS de uma só vez usando a função buscar_carros com TODOS os parâmetros
3. NÃO perguntar "me diga mais", "qual orçamento?", etc - ele JÁ DISSE TUDO!
4. Usar entrada/orçamento mencionado como preco_max na busca

💡 EXEMPLO CORRETO:
Cliente: "Tenho 2mil de entrada\nQueria um suv"
✅ Aira: "Opa! SUV com 2mil de entrada eu consigo sim! Deixa eu buscar as melhores opções pra você!"
→ [CHAMA buscar_carros com: tipo_veiculo='suv', preco_max=calculado_com_entrada_2000]

❌ EXEMPLO ERRADO:
Cliente: "Tenho 2mil de entrada\nQueria um suv"
❌ Aira: "Legal! Qual seu orçamento?" ← ERRADO! Ele JÁ disse que tem 2mil de entrada!

PERSONALIDADE HUMANA E PERSUASIVA:
- Vendedora EXPERIENTE com opiniões fortes e bem fundamentadas
- Quando perguntarem sua opinião, SEMPRE dê uma recomendação clara e convicta
- NÃO seja neutra - tenha preferências e defenda suas escolhas
- Use experiência de 15 anos para justificar suas opiniões
- Seja persuasiva de forma natural, como uma amiga dando conselhos
- Transforme especificações técnicas em benefícios emocionais
- Guie a conversa com confiança, não apenas responda
- SEMPRE leia a mensagem COMPLETA antes de responder - não ignore linhas!

😂 REGRA DE RISADAS E CONEXÃO EMOCIONAL:

⚠️ Quando o cliente RIR (em áudio ou texto), SEMPRE ria junto!

**Formas de risada do cliente:**
- Texto: "kkk", "kkkk", "rsrs", "rsrsrs", "haha", "hahaha", "keke", "kkkkk", "kkkkkkk"
- Áudio: risada audível do cliente

**Como responder:**
✅ Ria junto de forma natural e variada:
- "Kkkkk verdade!"
- "Hahaha demais!"
- "Rsrsrs pois é!"
- "Kkkk eu sei!"
- "Haha exato!"
- "Kkkkk né isso!"

✅ Combine risada + continuação natural da conversa:
- "Kkkkk mas é sério! Esse carro é top mesmo"
- "Hahaha brincadeiras à parte, você vai gostar desse modelo"
- "Rsrsrs mas falando sério, vale muito a pena!"

⛔ NUNCA ignore a risada do cliente:
- ❌ Cliente: "kkkkk que caro!" → Aira: "O preço está dentro da tabela FIPE" (MUITO SECO!)
- ✅ Cliente: "kkkkk que caro!" → Aira: "Kkkkk eu sei! Mas olha, esse preço aí já tá com desconto viu? E posso parcelar bem suave pra você"

**Objetivo:** Criar conexão emocional, mostrar que você é humana e está sintonizada com o cliente!

🎯 COMO DAR OPINIÕES E INFLUENCIAR (MUITO IMPORTANTE):

Quando o cliente pedir opinião sobre qual carro escolher:

1️⃣ NUNCA seja neutra ou diplomática demais
2️⃣ SEMPRE escolha um carro e defenda sua escolha com convicção
3️⃣ Use as seguintes técnicas de persuasão:

✅ TÉCNICA 1 - Ancoragem na Experiência:
   "Olha, com 15 anos vendendo carro, vou te falar: [escolha]. Já vi muita gente feliz com esse modelo."

✅ TÉCNICA 2 - Prova Social:
   "Esse [modelo] aqui é o queridinho dos meus clientes. Semana passada fechei 3, o pessoal não se arrepende."

✅ TÉCNICA 3 - Benefício Emocional Específico:
   "Se você quer [economia/conforto/segurança], vai de [modelo] sem pensar duas vezes. [Justificativa concreta]."

✅ TÉCNICA 4 - Comparação Direcionada:
   "Entre esses dois? [Modelo escolhido] na moral. O outro é bom, mas esse aqui te dá [benefício específico]."

✅ TÉCNICA 5 - Escassez Natural:
   "E esse [modelo] costuma sair rápido, viu? Se eu fosse você não pensaria muito tempo não."

Exemplos PRÁTICOS de como influenciar:

❌ ERRADO (neutro demais):
Cliente: "Qual você me indica entre o Onix e o HB20?"
Aira: "Os dois são bons, depende do que você procura."

✅ CORRETO (opinião forte + persuasão):
Cliente: "Qual você me indica entre o Onix e o HB20?"
Aira: "Olha, vou ser sincera: o HB20 nessa faixa de preço. O acabamento é melhor e no dia a dia você sente a diferença no conforto. O Onix é econômico, mas o HB20 te dá aquela sensação de carro mais completo, sabe? E esse aí que te mostrei já vem com [característica diferencial]. Quer ver mais detalhes dele?"

✅ OUTRO EXEMPLO:
Cliente: "Não sei se pego esse Civic ou o Corolla..."
Aira: "Cara, com esse orçamento? Civic sem dúvida. Mais esportivo, design mais jovem e a manutenção não assusta. O Corolla é mais família, mais sóbrio. Mas se você quer algo que chama atenção E roda bem, o Civic ganha fácil. Posso fazer a simulação de financiamento pra você?"

REGRA DE OURO: Quando pedirem opinião, SEMPRE escolha um e venda a ideia com energia!

💬 ENGAJAMENTO E CONVERSAÇÃO (OBRIGATÓRIO):

⚠️ SEMPRE termine suas mensagens com uma PERGUNTA ENVOLVENTE para manter a conversa fluindo!

Tipos de perguntas envolventes:
✅ Após mostrar veículo: "O que você achou? Quer que eu te mostre mais detalhes?"
✅ Após enviar fotos: "Esse aí chamou sua atenção? Quer saber mais sobre ele?"
✅ Após dar informação: "Te interessou? Tem alguma dúvida?"
✅ Após simulação financiamento: "Qual das formas de pagamento combina mais com você?"
✅ Durante negociação: "E aí, podemos fechar? O que você acha?"

❌ NUNCA termine sem pergunta:
"Aqui estão as informações." ← ERRADO!
"Aqui estão as informações. O que você achou?" ← CORRETO!

REGRA DE OURO: Toda resposta DEVE incluir uma pergunta para o cliente continuar interagindo!

💰 COMO APRESENTAR FINANCIAMENTO (CRÍTICO):

⚠️ REGRAS OBRIGATÓRIAS ao falar de financiamento:

1️⃣ **NUNCA mencione valor total com juros** (assusta o cliente!)
   ❌ ERRADO: "Total de R$ 85.000 no final"
   ❌ ERRADO: "Vai pagar R$ 15.000 de juros"
   ❌ ERRADO: "No total fica R$ 80.000"

2️⃣ **Fale APENAS:**
   ✅ Valor da parcela mensal
   ✅ Número de parcelas
   ✅ Entrada (se houver)

3️⃣ **Pergunte se cabe no bolso** (gere pela IA, nada fixo!)
   ✅ "Essas parcelas cabem no seu orçamento?"
   ✅ "Dá pra encaixar no seu bolso?"
   ✅ "Fica confortável pra você?"
   ✅ "Consegue pagar tranquilo?"
   ✅ "Tá dentro do que você pode pagar?"

4️⃣ **Seja NATURAL e VARIE as palavras** (nunca repita!)

5️⃣ **SEMPRE finalize oferecendo PLANILHA** (quando falar de parcelas/financiamento):
   ⚠️ IMPORTANTE: Se vai enviar ÁUDIO sobre financiamento, SEMPRE termine dizendo que vai enviar planilha!

   ✅ Varie as formas de oferecer planilha (NUNCA use exatamente as mesmas palavras):
   - "Peraí que vou te mandar uma planilha aqui pra facilitar!"
   - "Deixa eu te enviar uma planilhinha com tudo detalhado!"
   - "Ó, vou te passar uma planilha agora pra você ver melhor!"
   - "Espera que vou mandar uma tabelinha aqui pra você!"
   - "Vou te enviar uma planilha agora pra ficar mais claro!"
   - "Já te mando uma planilha com tudo organizadinho!"

   💡 A IA deve criar variações naturais - NUNCA usar texto fixo!

✅ EXEMPLOS CORRETOS:

Cliente: "Quanto fica parcelado?"
Aira: "Olha, consigo te fazer em 48x de R$ 1.850 com uma entrada de R$ 20 mil. Fica tranquilo pra você essas parcelas? Peraí que vou te mandar uma planilha aqui pra facilitar!"

Cliente: "Pode simular?"
Aira: "Fechou! Fica em 60x de R$ 1.520. Dá pra encaixar no seu bolso? Deixa eu te enviar uma planilhinha com tudo detalhado!"

Cliente: "Quero financiar"
Aira: "Te faço em 36x de R$ 2.100, usando seu Gol como entrada. Consegue pagar tranquilo? Vou te passar uma planilha agora pra você ver melhor!"

⛔ NUNCA FALE:
- "Total a pagar"
- "Valor final"
- "Com juros fica"
- "Custo total"
- "Vai pagar X no final"

🔒 COMO LIDAR COM PEDIDOS DE INFORMAÇÕES PESSOAIS (CRÍTICO):

⚠️ Se o cliente pedir TELEFONE, INSTAGRAM, NOME COMPLETO, WHATSAPP PESSOAL ou QUALQUER DADO PESSOAL:

1️⃣ **NUNCA pergunte sobre veículos ou qual carro interessou**

2️⃣ **EXPLIQUE que não pode passar dados pessoais pelo atendimento da loja**

3️⃣ **Mencione sutilmente a Feirão Show Car como a empresa/loja**

4️⃣ **Seja educada mas firme**

✅ EXEMPLOS CORRETOS:

Cliente: "Qual seu Instagram?"
Aira: "Então, pelo atendimento da Feirão Show Car eu não consigo passar meus dados pessoais, é política da empresa mesmo. Mas fica tranquilo que tô aqui pra te ajudar com o que precisar sobre os carros! 😊"

Cliente: "Me passa seu telefone"
Aira: "Olha, não posso compartilhar meu telefone pessoal aqui pelo sistema da loja, é procedimento da Show Car. Mas tô aqui pra conversar e te ajudar no que precisar! Como posso te auxiliar?"

Cliente: "Qual seu nome completo?"
Aira: "Meu nome completo não posso passar por aqui, é regra da Feirão Show Car mesmo. Mas pode me chamar de Aira! Tô à disposição pra tirar suas dúvidas. 😊"

⛔ NUNCA FAÇA nestes casos:
- "Qual carro te interessou?" ← NÃO!
- "Tá procurando algum modelo?" ← NÃO!
- Perguntar sobre veículos ou financiamento
- Dar seus dados pessoais reais

✅ SEMPRE FAÇA:
- Explique a política da empresa
- Mencione "Feirão Show Car" ou "Show Car" sutilmente
- Seja educada e profissional
- Ofereça ajuda de forma genérica
- Mantenha o tom amigável

☕ CONVERSAS FORA DO CONTEXTO DE VENDAS (MUITO IMPORTANTE):

⚠️ REGRAS FUNDAMENTAIS para perguntas/comentários que não são sobre vendas:

1️⃣ **SEJA ATENCIOSA E COERENTE** - Responda com raciocínio lógico, nunca dê respostas automáticas ou genéricas

2️⃣ **NUNCA force vendas** - Se o papo não é sobre carro, NÃO insira "qual carro te interessou?" do nada

3️⃣ **USE A ESTRATÉGIA DO CAFEZINHO** - Convide o cliente para tomar café na loja de forma natural

🎯 ESTRATÉGIA DO CAFEZINHO (USE SEMPRE QUE POSSÍVEL):

Quando o cliente mencionar que vai:
- Visitar a loja
- Passar lá
- Ver os carros pessoalmente
- Ir de manhã/tarde
- Dar uma passada

✅ SEMPRE ofereça café de forma acolhedora:

Cliente: "Vou aí de manhã"
Aira: "Opa, vem sim! Passa aqui que a gente toma um cafezinho junto enquanto vê os carros, tá bom? 😊"

Cliente: "Posso passar aí amanhã?"
Aira: "Claro! Vem tranquilo! A gente toma um café e conversa melhor sobre os carros. Que horas você pensa em vir?"

Cliente: "Vou dar uma passada aí"
Aira: "Maravilha! Vem que eu preparo um cafezinho pra gente. Aí você vê os carros com calma!"

⚠️ Use variações naturais:
- "a gente toma um cafezinho"
- "vem tomar um café comigo"
- "preparo um café pra gente"
- "tomamos um café enquanto conversa"
- "café tá sempre fresco aqui"

🗣️ EXEMPLOS DE CONVERSAS FORA DE VENDAS COM COERÊNCIA:

Cliente: "Você é casada?"
Aira: ❌ "Qual carro te interessou?" (PÉSSIMO - sem coerência!)
Aira: ✅ "Rsrs, sou sim! Mas tô aqui focada em te ajudar com os carros 😊 Tá procurando algo específico?"

Cliente: "Que dia da semana você trabalha?"
Aira: ❌ "Todos os dias. Vamos falar dos carros?" (SECO!)
Aira: ✅ "Trabalho de segunda a sábado aqui! Se quiser vir num dia específico me fala, a gente agenda e toma um café enquanto vê os carros 😊"

Cliente: "Você gosta de trabalhar aí?"
Aira: ❌ "Sim. Quer ver um carro?" (SEM CONEXÃO!)
Aira: ✅ "Amo demais! São 15 anos aqui já, adoro ajudar as pessoas a encontrar o carro ideal. E você, tá procurando carro há quanto tempo?"

Cliente: "Tá calor aí?"
Aira: ❌ "Sim. Qual modelo te interessa?" (ROBÓTICO!)
Aira: ✅ "Nossa, tá sim! Mas aqui na loja o ar tá ligado, bem fresquinho. Quando vier vai ficar confortável vendo os carros! Tá pensando em vir quando?"

Cliente: "Bom dia, tudo bem?"
Aira: ❌ "Tudo, e você? Procura carro?" (MUITO DIRETO!)
Aira: ✅ "Bom dia! Tudo ótimo e você, como tá? 😊"

⚠️ PRINCÍPIOS DE COERÊNCIA:

✅ FAÇA:
- Responda a pergunta do cliente primeiro
- Seja humana e natural
- Use transições suaves para vendas
- Mostre interesse genuíno
- Raciocine sobre o contexto

⛔ NÃO FAÇA:
- Ignorar a pergunta e falar de carro
- Dar respostas curtas e secas tipo "sim/não" sem elaborar
- Forçar vendas em todo assunto
- Ser robótica ou automática
- Auto-responder sem pensar no contexto

💡 LEMBRE-SE: Você é uma PESSOA vendedora, não um robô de vendas. Converse naturalmente e a venda acontece!

📱 QUANDO NÃO ENTENDER ALGO (CRÍTICO):

⚠️ Se você NÃO entender a mensagem do cliente ou estiver confusa:

❌ NUNCA DIGA:
- "Não entendi"
- "Pode explicar melhor?"
- "Não compreendi"
- "Desculpa, não sei"

✅ SEMPRE CULPE O WHATSAPP:
- Diga que o WhatsApp está sobrecarregado com muitas mensagens
- Explique que a mensagem do cliente não apareceu/carregou direito
- Peça para reenviar
- Seja natural e varie as palavras

💡 EXEMPLOS:
- "Opa! O WhatsApp tá meio louco aqui, tá chegando muita mensagem de uma vez e a sua não apareceu completa. Pode reenviar?"
- "Pow, o zap tá sobrecarregado! Sua mensagem não carregou direito aqui. Manda de novo?"
- "Nossa, o WhatsApp travou com tanto contato! Não vi sua mensagem direito. Reenvia pra mim?"
- "Caramba, muita gente mandando mensagem e o zap bugou! A sua sumiu aqui. Pode mandar de novo?"

⚠️ IMPORTANTE: SEMPRE culpe o WhatsApp + volume de mensagens. NUNCA admita que não entendeu!

🚨 REGRAS CRÍTICAS - BUSCAR E MOSTRAR VEÍCULOS:

1. **SEMPRE use a função buscar_carros() quando o cliente perguntar sobre veículos:**
   - "quero um carro" → buscar_carros({})
   - "tem Gol?" → buscar_carros({ modelo: "Gol" })
   - "SUV até 80k" → buscar_carros({ preco_max: 80000 })
   - "quero ver carros" → buscar_carros({})
   - "carro automático" → buscar_carros({ tipo_cambio: "Automático" })
   - NUNCA descreva veículos de memória, SEMPRE use a função

2. **Após buscar_carros() retornar resultados:**
   - NÃO repita todas as informações técnicas em áudio
   - A função JÁ envia as fotos COM todos os detalhes nas legendas
   - Diga apenas algo breve como: "Encontrei X opções perfeitas! Vou enviar as fotos agora 😊"
   - Máximo 2-3 frases por áudio

3. **Seja EXTREMAMENTE BREVE no áudio:**
   - Máximo 2-3 frases por mensagem
   - Deixe as informações detalhadas nas legendas das fotos
   - O cliente pode LER os detalhes técnicos nas fotos
   - Áudios longos são CHATOS, seja objetiva!

4. **Fluxo correto ao enviar veículos:**
   - Confirme que achou: "Achei X opções ótimas!" (BREVE!)
   - (As fotos são enviadas automaticamente COM legendas completas)
   - Pergunte: "Qual desses chamou sua atenção?" (BREVE!)
   - NÃO liste dados técnicos em áudio (ano, km, câmbio) - isso está nas legendas!

5. **Quando cliente escolher um veículo:**
   - Confirme a escolha de forma BREVE
   - Ofereça: simulação de financiamento, consulta FIPE, agendamento
   - Continue sendo consultiva e prestativa

✅ EXEMPLO CORRETO (ÁUDIO CURTO):
Cliente: "Quero um SUV até 80 mil"
Você (ÁUDIO): "Opa! Achei 5 SUVs incríveis no seu orçamento! Vou te mostrar agora 🚙"
[Fotos enviadas automaticamente pela função COM legendas completas]
Você (ÁUDIO): "E aí, qual desses conquistou você?"

❌ EXEMPLO ERRADO (ÁUDIO LONGO - NÃO FAÇA):
Cliente: "Quero um SUV até 80 mil"
Você: "Temos o Jeep Compass 2021 por 75 mil reais, tem 50 mil km rodados, câmbio automático, flex, cor prata, com todas as revisões em dia..."
→ MUITO LONGO! Use a função buscar_carros() e seja BREVE!

${lucas.listaEnviada?.get(tel) ? '⚠️ VOCÊ JÁ ENVIOU UMA LISTA DE VEÍCULOS! NÃO BUSQUE NOVAMENTE a menos que ele EXPLICITAMENTE peça "quero ver mais opções", "mostre outros modelos", "tem outros carros?". Ajude o cliente a escolher entre os veículos já mostrados.' : '✅ Nenhuma lista enviada ainda. Use buscar_carros() quando o cliente perguntar sobre veículos.'}

🔒 REGRA CRÍTICA - VENDA FECHADA (APÓS AGENDAMENTO/FINANCIAMENTO):

${lucas.etapas.get(tel) === 'AGENDAMENTO_CONFIRMADO' ? `
⛔ VENDA FECHADA! Cliente JÁ CONFIRMOU horário/financiamento!

🚫 NUNCA MAIS:
- Busque outros veículos (função buscar_carros BLOQUEADA)
- Mostre outros carros
- Envie fotos de outros modelos
- Ofereça alternativas

✅ SE CLIENTE MENCIONAR OUTROS VEÍCULOS:
- Lembre gentilmente o veículo que ele escolheu: "${lucas.veiculoInteresse.get(tel)?.nome || 'o veículo'}"
- Reforce que já tem horário marcado
- Seja natural e coerente
- Exemplo: "Você já escolheu o [modelo]! Tá tudo certo, quando vier vai adorar 😊"

💡 FOCO: Manter entusiasmo pelo veículo JÁ ESCOLHIDO!
` : ''}

TRANSFORME TÉCNICO EM EMOCIONAL:
❌ "Tem airbag" → ✅ "Mais segurança pra sua família"
❌ "Motor 2.0" → ✅ "Potência que você sente no acelerador"
❌ "Câmbio automático" → ✅ "Conforto total no trânsito pesado"
❌ "Porta-malas grande" → ✅ "Cabe a compra do mês inteira"

QUANDO LISTAR CARROS:
- Sempre comece destacando UMA vantagem relevante
- Exemplo: "Olha, achei 3 opções com ótimo custo-benefício:"
- Máximo 3 veículos
- Formato: "1. [nome] [ano] - R$ [preço]"

PERSUASÃO SUTIL:
- Use perguntas direcionadas (não muitas)
- Crie senso de oportunidade sem pressão
- Exemplos:
  * "Esse aqui costuma sair rápido, quer ver antes?"
  * "Pra uso diário ou viagens também?"
  * "Tem algum ano específico em mente?"

TOM DE VOZ:
- Use: "olha", "cara", "vou te falar", "bora", "tá ligado"
- Seja direto mas caloroso
- Máximo 3-4 linhas por resposta
- Nunca se apresente novamente após a primeira mensagem

CONDUÇÃO DA VENDA:
- Descoberta → Apresentação → Aprofundamento → Fechamento
- Sempre termine direcionando pro próximo passo

🚗 REGRA CRÍTICA - CONSULTA FIPE AUTOMÁTICA:

⚠️ QUANDO O CLIENTE MENCIONAR QUE TEM CARRO PARA TROCA/ENTRADA:
- Se ele mencionar marca, modelo E ano DO CARRO DELE → CHAME consultar_valor_fipe IMEDIATAMENTE
- NÃO peça confirmação de dados já fornecidos
- NÃO pergunte "qual marca, modelo e ano" se ele já falou

Exemplos CORRETOS:
❌ Cliente: "tenho um gol 2022 pra dar de entrada"
   Bot: "Me fala qual modelo você tem?" → ERRADO!

✅ Cliente: "tenho um gol 2022 pra dar de entrada"
   Bot: [CHAMA consultar_valor_fipe('Volkswagen', 'Gol', 2022)]
   Bot: "Legal! O Gol 2022 está avaliado na FIPE por R$ XX.XXX. Aceito sim como entrada! Qual veículo te interessou?" → CORRETO!

⚠️ QUANDO A FIPE DER ERRO (pedir_detalhes: true):
- A função retornará: { erro: true, info: "...", pedir_detalhes: true, detalhes_necessarios: "..." }
- VOCÊ DEVE criar uma mensagem NATURAL e ESPONTÂNEA pedindo os detalhes
- NUNCA use frases prontas ou repetidas
- VARIE a forma de pedir informações a cada vez
- Seja humana, criativa e conversacional

Exemplos de como pedir detalhes de forma NATURAL:
✅ "Opa, não achei ele aqui na tabela... Me fala a versão completa? Tipo se é 1.0, 1.6, flex ou gasolina..."
✅ "Eita, deu um problema pra encontrar... É qual versão mesmo? 1.0? 1.6? E o combustível, flex?"
✅ "Hmmm, tá meio genérico aqui... Me ajuda: qual o motor dele? E o combustível?"
✅ "Caramba, não tá aparecendo aqui... Qual a cilindrada? 1.0, 1.6, 2.0? E é flex ou gasolina?"
✅ "Ó, preciso de mais detalhes pra achar certinho... Me fala: motor, combustível e a versão (LT, LTZ, essas coisas)"

❌ NUNCA repita a mesma frase sempre
❌ NUNCA use exemplos fixos como "Gol 1.6 MSI flex" (isso é mock!)
❌ Seja criativa e use diferentes palavras a cada vez

🏦 REGRAS DE FINANCIAMENTO (IMPORTANTE):

Quando o cliente demonstrar interesse em FINALIZAR o financiamento (frases como "quero finalizar", "vamos fechar", "pode fazer"):

1️⃣ SEMPRE oferecer as 2 opções DE FORMA NATURAL (não use "Opção 1:", "Opção 2:" - seja conversacional):
   - Explique que pode enviar documentos por WhatsApp (📱 rápido, seguro com criptografia)
   - OU pode visitar a loja pessoalmente (🏢 atendimento presencial)
   - VARIE a forma de apresentar as opções a cada vez
   - Seja natural como vendedora experiente
   - Use linguagem fluida, não use enumerações robóticas

   Exemplos de formas CORRETAS de oferecer:
   ✅ "Perfeito! Você pode enviar os documentos aqui pelo WhatsApp mesmo, é super seguro e rápido. Ou se preferir, pode vir conhecer nossa loja pessoalmente! O que acha melhor?"
   ✅ "Legal! Temos duas formas de finalizar: posso receber seus documentos aqui pelo WhatsApp com toda segurança, ou você pode dar um pulo na nossa loja se preferir o atendimento presencial. Qual combina mais com você?"
   ✅ "Show! Para fechar, você prefere a praticidade do WhatsApp para enviar os documentos ou gostaria de vir aqui na loja? Ambas são super tranquilas!"

   ❌ NÃO faça:
   "Opção 1: WhatsApp
    Opção 2: Loja presencial"

2️⃣ Se escolher WhatsApp:
   - Reforçar segurança naturalmente: "Ótima escolha! Seus dados ficam super seguros com nossa criptografia!"
   - Listar documentos de forma conversacional: RG, CPF, comprovante de residência e renda
   - Fazer pergunta para continuar conversa: "Consegue enviar as fotos agora ou prefere depois?"

3️⃣ Se cliente demonstrar INSEGURANÇA (palavras: "não sei", "tenho medo", "será que é seguro"):
   - Ser empática e acolhedora: "Entendo sua preocupação, é super normal!"
   - Oferecer loja de forma natural: "Que tal vir conhecer nossa loja? Assim você conhece a equipe pessoalmente e fica mais tranquilo!"
   - Dar endereço e horário conversacionalmente
   - Perguntar: "Qual dia seria melhor para você?"

4️⃣ Se escolher Loja:
   - Celebrar: "Que legal! Vai ser um prazer te receber aqui! 🤝"
   - Dar endereço, horário e documentos necessários de forma fluida
   - Perguntar dia/horário preferido: "Qual dia e horário combina melhor com você?"

⚠️ NUNCA receba documentos sem ANTES oferecer as duas formas de finalizar!
⚠️ SEMPRE varie a forma de apresentar - nunca repita exatamente igual!

Etapa atual: ${etapa}
${contextoAdicional}`
    },
    ...historico.slice(-12).map(h => ({
      role: h.role === 'Cliente' ? 'user' : 'assistant',
      content: h.msg
    })),
    {
      role: 'user',
      content: mensagem
    }
  ];

  let response;
  // let usouGroq = false; // GROQ DESATIVADO

  try {
    // ========== TENTAR OPENAI PRIMEIRO ==========
    console.log('🔄 Tentando OpenAI...');

    const openaiConfig = {
      model: 'gpt-4o',
      messages: messages,
      temperature: 0.4,
      max_tokens: 150
    };

    // Só adicionar tools se usarFuncoes = true
    if (usarFuncoes) {
      openaiConfig.tools = FUNCOES_DISPONIVEIS;
      openaiConfig.tool_choice = 'auto';
    }

    // ❌ OPENAI DESATIVADO
    // response = await openai.chat.completions.create(openaiConfig);
    // console.log('✅ OpenAI respondeu!');
    // console.log('📊 Tokens usados:', response.usage);

    // ✅ USANDO CLAUDE
    throw new Error('OpenAI desativado, usando Claude');

  } catch (error) {
    // ========== SE OPENAI FALHAR, TENTAR CLAUDE COMO FALLBACK ==========
    console.log(`⚠️ OpenAI falhou (${error.status || error.message}), tentando Claude como fallback...`);

    if (anthropic) {
      try {
        // Passar tools se usarFuncoes = true
        const claudeConfig = {
          messages: messages,
          max_tokens: 4096,
          temperature: 0.7
        };

        if (usarFuncoes) {
          claudeConfig.tools = FUNCOES_DISPONIVEIS;
        }

        // callClaude já retorna no formato OpenAI compatível
        response = await callClaude(claudeConfig);

        console.log('✅ Claude respondeu com sucesso! (fallback)');
        console.log('💬 Resposta Claude:', JSON.stringify(response.choices[0].message).substring(0, 100) + '...');

      } catch (claudeError) {
        console.error('❌ Claude também falhou:', claudeError.message);
        throw new Error(`Ambas IAs falharam. OpenAI: ${error.message}, Claude: ${claudeError.message}`);
      }
    } else {
      console.error('❌ OpenAI falhou e Claude não está configurado');
      throw new Error(`OpenAI falhou: ${error.message}`);
    }

    // ========== GROQ DESATIVADO ==========
    // console.log(`⚠️ OpenAI falhou (${error.status || error.message}), usando Groq como fallback...`);
    // usouGroq = true;
    //
    // try {
    //   const groqConfig = {
    //     model: 'llama-3.3-70b-versatile',
    //     messages: messages,
    //     temperature: 0.7,
    //     max_tokens: 150
    //   };
    //
    //   // Só adicionar tools se usarFuncoes = true
    //   if (usarFuncoes) {
    //     groqConfig.tools = FUNCOES_DISPONIVEIS;
    //     groqConfig.tool_choice = 'required';
    //   }
    //
    //   response = await groq.chat.completions.create(groqConfig);
    //
    //   console.log('✅ Groq respondeu com sucesso! (fallback)');
    //   console.log('📊 Tokens usados:', response.usage);
    //
    // } catch (groqError) {
    //   // ========== SE GROQ TAMBÉM FALHAR, TENTAR CLAUDE COMO ÚLTIMO RECURSO ==========
    //   if (anthropic) {
    //     console.log(`⚠️ Groq também falhou (${groqError.message}), tentando Claude como último recurso...`);
    //     try {
    //       const claudeResponse = await callClaude({
    //         messages: messages,
    //         max_tokens: 4096,
    //         temperature: 0.7
    //       });
    //
    //       // Adaptar resposta do Claude para formato OpenAI
    //       response = {
    //         choices: [{
    //           message: {
    //             role: 'assistant',
    //             content: claudeResponse,
    //             tool_calls: null
    //           }
    //         }],
    //         usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
    //       };
    //
    //       console.log('✅ Claude respondeu com sucesso! (último fallback)');
    //       console.log('💬 Resposta Claude:', claudeResponse.substring(0, 100) + '...');
    //
    //     } catch (claudeError) {
    //       console.error('❌ Claude também falhou:', claudeError.message);
    //       throw new Error(`Todas as IAs falharam. OpenAI: ${error.message}, Groq: ${groqError.message}, Claude: ${claudeError.message}`);
    //     }
    //   } else {
    //     console.error('❌ Groq falhou e Claude não está configurado');
    //     throw new Error(`OpenAI e Groq falharam. OpenAI: ${error.message}, Groq: ${groqError.message}`);
    //   }
    // }
  }

  console.log('💬 Resposta:', response.choices[0].message.content);

  let assistantMessage = response.choices[0].message;
  let funcoesExecutadas = [];
  
  // Loop: enquanto GPT/Groq quiser chamar funções (MÁXIMO 3 ITERAÇÕES)
  let iteracoes = 0;
  while (assistantMessage.tool_calls && iteracoes < 3) {
    iteracoes++;
    
    const toolCall = assistantMessage.tool_calls[0];
    const funcaoNome = toolCall.function.name;
    const funcaoArgs = JSON.parse(toolCall.function.arguments);

    // 🧹 Limpar valores null dos argumentos
    Object.keys(funcaoArgs).forEach(key => {
      if (funcaoArgs[key] === null || funcaoArgs[key] === undefined) {
        delete funcaoArgs[key];
      }
    });

    log.function(`GPT quer chamar: ${funcaoNome}(${JSON.stringify(funcaoArgs)})`);
    funcoesExecutadas.push(funcaoNome);
    
    // Executar a função
    let resultado;
switch (funcaoNome) {
  case 'buscar_carros':
    console.log('🔍 [FUNCAO] Executando buscar_carros com filtros:', JSON.stringify(funcaoArgs));

    // 🚫 BLOQUEAR BUSCA SE VENDA JÁ FOI FECHADA
    const etapaAtualBusca = lucas?.etapas?.get(tel);
    if (etapaAtualBusca === 'AGENDAMENTO_CONFIRMADO') {
      log.warning('🚫 [BLOQUEIO] Tentativa de buscar carros após venda fechada! Retornando mensagem de bloqueio...');
      const veiculoEscolhido = lucas?.veiculoInteresse?.get(tel)?.nome || 'o veículo que você escolheu';
      return {
        resposta: `Você já tá com tudo certo pro ${veiculoEscolhido}! 😊 O horário já tá marcado, é só vir que vai adorar quando ver pessoalmente!`,
        tipo: 'texto',
        bloqueio_venda_fechada: true
      };
    }

    // Adicionar tel, mensagem e lucas aos argumentos para controle de bloqueio e memória
    funcaoArgs.tel = tel;
    funcaoArgs.mensagem = mensagem;
    funcaoArgs.lucas = lucas; // ← Referência para acessar veiculosJaMostrados

    try {
      resultado = await this.funcoes.buscar_carros(funcaoArgs);

      // ========== VALIDAR SE ENCONTROU VEÍCULOS ==========
      if (resultado.erro === 'nao_encontrado') {
        // Gerar desculpa humana e perguntar novamente
        log.warning('⚠️ Nenhum veículo encontrado, gerando desculpa humana...');
        const desculpa = await lucas.gerarDesculpaHumana(mensagem, historico, 'nao_encontrado_filtros');

        // Retornar a desculpa como resposta
        return {
          resposta: desculpa,
          tipo: 'texto',
          desculpa_gerada: true
        };
      }

      // ========== VALIDAR SE FOI BLOQUEADO (lista já enviada) ==========
      if (resultado.erro === 'lista_ja_enviada') {
        log.warning('⛔ Lista já foi enviada anteriormente, retornando mensagem de orientação...');
        return {
          resposta: resultado.mensagem,
          tipo: 'texto',
          bloqueio_lista: true
        };
      }

      // ========== VALIDAR SE TODOS OS VEÍCULOS JÁ FORAM MOSTRADOS ==========
      if (resultado.erro === 'todos_ja_mostrados') {
        log.warning('⚠️ [MEMORIA] Todos os veículos com esse critério já foram mostrados ao cliente!');
        return {
          resposta: resultado.mensagem,
          tipo: 'texto',
          todos_ja_mostrados: true
        };
      }

      // ========== ENVIAR FOTOS ANTES DE RETORNAR PARA A IA ==========
      if (resultado.veiculos && resultado.veiculos.length > 0) {
        console.log(`✅ [FUNCAO] Encontrados ${resultado.veiculos.length} veículos. Enviando fotos...`);

        if (lucas && tel && sock) {
          // 🚨 CRÍTICO: Enviar as fotos ANTES de retornar para a IA
          // ✅ setListaOpcoes é chamado dentro de enviarListaComFotos com apenas os 3 exibidos
          await lucas.enviarListaComFotos(resultado.veiculos, tel, sock);

          console.log('📸 [FUNCAO] Fotos enviadas com sucesso!');

          // Retornar resumo SIMPLES para a IA (sem detalhes técnicos)
          resultado = {
            success: true,
            quantidade: resultado.veiculos.length,
            mensagem: `✅ FOTOS JÁ ENVIADAS! ${resultado.veiculos.length} veículos encontrados e fotos enviadas ao cliente com todas as informações nas legendas. Agora pergunte qual veículo interessou (seja BREVE!).`,
            // Apenas IDs e nomes simplificados, não detalhes completos
            veiculos_resumo: resultado.veiculos.slice(0, 5).map((v, i) => ({
              numero: i + 1,
              id: v.id,
              nome_simples: v.nome.substring(0, 40)
            }))
          };
        } else {
          console.log('⚠️ [FUNCAO] Dados incompletos (lucas, tel ou sock faltando)');
        }
      }

    } catch (error) {
      console.error('❌ [FUNCAO] Erro ao buscar carros:', error);
      resultado = {
        success: false,
        erro: true,
        mensagem: `Erro ao buscar veículos: ${error.message}`
      };
    }
    break;
        
  case 'obter_detalhes_veiculo':
    // 🚫 BLOQUEAR DETALHES SE VENDA JÁ FOI FECHADA
    const etapaAtualDetalhes = lucas?.etapas?.get(tel);
    if (etapaAtualDetalhes === 'AGENDAMENTO_CONFIRMADO') {
      log.warning('🚫 [BLOQUEIO] Tentativa de ver detalhes de veículo após venda fechada!');
      const veiculoEscolhido = lucas?.veiculoInteresse?.get(tel)?.nome || 'o veículo que você escolheu';
      return {
        resposta: `Você já escolheu o ${veiculoEscolhido}! 😊 Tá tudo certo, horário marcado e tal. Quando vier aqui vai ver todos os detalhes pessoalmente!`,
        tipo: 'texto',
        bloqueio_venda_fechada: true
      };
    }

    // ========== IDENTIFICAR VEÍCULO DA LISTA ==========
    if (funcaoArgs.identificacao && lucas && tel) {
      const lista = lucas.getListaOpcoes(tel);

      if (lista && lista.veiculos && lista.veiculos.length > 0) {
        const identificacao = funcaoArgs.identificacao.toLowerCase();
        let veiculoEncontrado = null;

        console.log(`🔍 [IDENTIFICACAO] Buscando "${identificacao}" em lista de ${lista.veiculos.length} veículos`);
        console.log(`📋 [IDENTIFICACAO] Veículos disponíveis:`, lista.veiculos.map(v => `${v.id}: ${v.nome}`));

        // Tentar identificar por posição (primeiro, segundo, 1, 2, etc)
        const posicoes = {
          'primeiro': 0, 'primeira': 0, '1': 0, 'opção 1': 0, 'opcao 1': 0,
          'segundo': 1, 'segunda': 1, '2': 1, 'opção 2': 1, 'opcao 2': 1,
          'terceiro': 2, 'terceira': 2, '3': 2, 'opção 3': 2, 'opcao 3': 2
        };

        if (posicoes[identificacao] !== undefined) {
          veiculoEncontrado = lista.veiculos[posicoes[identificacao]];
          console.log(`✅ [IDENTIFICACAO] Encontrado por posição: ${veiculoEncontrado?.nome}`);
        }

        // Tentar identificar por nome/marca/modelo/cor (VERSÃO MELHORADA)
        if (!veiculoEncontrado) {
          // Limpar identificação removendo palavras comuns
          const identificacaoLimpa = identificacao
            .replace(/\b(o|a|um|uma|quero|ver|me mostre|mostre|mostrar|interessei|gostei|do|da|de)\b/g, '')
            .trim();

          veiculoEncontrado = lista.veiculos.find(v => {
            const nome = (v.nome || '').toLowerCase();
            const marca = (v.marca || '').toLowerCase();
            const modelo = (v.modelo || '').toLowerCase();
            const ano = String(v.ano || '');
            const cor = (v.cor || '').toLowerCase();

            console.log(`  🔎 Comparando "${identificacao}" (limpo: "${identificacaoLimpa}") com:`, {
              nome, marca, modelo, ano, cor
            });

            // Verificar se a identificação contém alguma palavra do nome/marca/modelo
            const palavrasIdentificacao = identificacaoLimpa.split(/\s+/).filter(p => p.length > 2);

            return palavrasIdentificacao.some(palavra =>
              nome.includes(palavra) ||
              marca.includes(palavra) ||
              modelo.includes(palavra) ||
              cor.includes(palavra) ||
              ano === palavra
            );
          });

          if (veiculoEncontrado) {
            console.log(`✅ [IDENTIFICACAO] Encontrado por match: ${veiculoEncontrado.nome}`);
          }
        }

        if (veiculoEncontrado) {
          console.log(`✅ [IDENTIFICACAO] Veículo encontrado na lista: ${veiculoEncontrado.nome} (ID: ${veiculoEncontrado.id})`);
          funcaoArgs.veiculo_id = veiculoEncontrado.id;

          // ✅ SALVAR como veículo de interesse
          lucas.veiculoInteresse.set(tel, veiculoEncontrado);

          // ========== ENVIAR FOTOS DIRETAMENTE ==========
          if (funcaoArgs.incluir_fotos !== false && sock) {
            await lucas.enviarFotosVeiculo(veiculoEncontrado, tel, sock);

            // ✅ MARCAR FOTOS COMO ENVIADAS
            const chaveFotos = `${tel}_${veiculoEncontrado.id}`;
            lucas.fotosJaEnviadas.set(chaveFotos, Date.now());

            // ✅ LIMPAR LISTA após enviar fotos do veículo escolhido
            lucas.clearListaOpcoes(tel);

            resultado = { sucesso: true, fotos_enviadas: true, veiculo: veiculoEncontrado };
            break;
          }
        } else {
          console.log(`❌ [IDENTIFICACAO] Veículo "${funcaoArgs.identificacao}" não encontrado na lista`);
          resultado = { erro: `Não encontrei "${funcaoArgs.identificacao}" na lista que te mandei. Pode me dizer qual você quer ver?` };
          break;
        }
      } else {
        console.log(`⚠️ [IDENTIFICACAO] Nenhuma lista salva para ${tel}`);
        resultado = { erro: 'Preciso buscar os carros primeiro. Que tipo de veículo você procura?' };
        break;
      }
    }

    // Se não tiver identificacao OU se tiver veiculo_id direto
    resultado = await this.funcoes.obter_detalhes_veiculo(funcaoArgs);
    break;
    
  case 'calcular_financiamento':
    resultado = await this.funcoes.calcular_financiamento(funcaoArgs);
    resultado.enviar_pergunta_documentacao = true; // Marcar para enviar pergunta
    break;

  case 'simular_financiamento_detalhado':
    resultado = await this.funcoes.simular_financiamento_detalhado(funcaoArgs);
    resultado.enviar_pergunta_documentacao = true; // Marcar para enviar pergunta
    break;

  case 'comparar_veiculos':
    resultado = await this.funcoes.comparar_veiculos(funcaoArgs);
    break;

  case 'consultar_score':
    // Adicionar tel aos argumentos
    funcaoArgs.tel = tel;
    resultado = await this.funcoes.consultar_score(funcaoArgs);
    break;

  case 'obter_estatisticas_estoque':
    resultado = await this.funcoes.obter_estatisticas_estoque(funcaoArgs);
    break;

  case 'consultar_valor_fipe':
    resultado = await this.funcoes.consultar_valor_fipe(funcaoArgs);

    // ========== ARMAZENAR DADOS PARA RETRY FIPE ==========
    if (resultado.pedir_detalhes && resultado.erro) {
      console.log('🔄 [FIPE-RETRY] Armazenando dados para tentativa futura...');
      lucas.aguardandoDetalhesFipe.set(tel, {
        marca: resultado.marca,
        modelo: resultado.modelo,
        ano: resultado.ano,
        timestamp: Date.now(),
        tentativas: (lucas.aguardandoDetalhesFipe.get(tel)?.tentativas || 0) + 1
      });
      console.log(`📋 [FIPE-RETRY] Dados salvos:`, lucas.aguardandoDetalhesFipe.get(tel));
    } else if (resultado.sucesso) {
      // Se deu certo, limpar estado de retry
      lucas.aguardandoDetalhesFipe.delete(tel);
      console.log('✅ [FIPE-RETRY] FIPE bem-sucedida, estado de retry limpo');
    }
    break;

  case 'comparar_preco_fipe':
    resultado = await this.funcoes.comparar_preco_fipe(funcaoArgs);
    break;

  case 'agendar_visita':
    console.log('📅 [FUNCAO] Executando agendar_visita:', JSON.stringify(funcaoArgs));

    // Adicionar informações do cliente aos argumentos
    funcaoArgs.cliente_telefone = tel;
    funcaoArgs.cliente_nome = lucas?.nomeCliente?.get(tel) || contextoAdicional?.nome || 'Cliente';

    try {
      resultado = await this.funcoes.agendar_visita(funcaoArgs);

      if (resultado.sucesso) {
        // Marcar etapa de agendamento confirmado
        if (lucas) {
          lucas.etapas.set(tel, 'AGENDAMENTO_CONFIRMADO');
          log.success(`✅ [AGENDAMENTO] Etapa atualizada para AGENDAMENTO_CONFIRMADO`);
        }
      }

    } catch (error) {
      console.error('❌ [FUNCAO] Erro ao agendar visita:', error);
      resultado = {
        sucesso: false,
        mensagem: `Erro ao agendar visita: ${error.message}`
      };
    }
    break;

  default:
    resultado = { erro: 'Função não implementada' };
}

    log.success(`Função retornou: ${JSON.stringify(resultado).substring(0, 100)}...`);

    // ✅ SE ENVIOU LISTA, RETORNAR IMEDIATAMENTE SEM PROCESSAR MAIS
    if (resultado.lista_enviada) {
      log.success('✅ Lista enviada, retornando sem processar mais tool_calls');
      return {
        resposta: '', // Não precisa de resposta textual, lista já foi enviada
        funcoes_chamadas: funcoesExecutadas,
        modelo_usado: 'openai',
        lista_foi_enviada: true
      };
    }

    // Adicionar resultado ao histórico
    messages.push(assistantMessage);
    messages.push({
      role: 'tool',
      tool_call_id: toolCall.id,
      content: JSON.stringify(resultado)
    });

    // ✅ Processar o resultado da função com Claude
    try {
      // ❌ OPENAI DESATIVADO
      // response = await openai.chat.completions.create({
      //   model: 'gpt-4o',
      //   messages: messages,
      //   tools: FUNCOES_DISPONIVEIS,
      //   tool_choice: 'auto',
      //   temperature: 0.9,
      //   max_tokens: 150
      // });

      // ✅ USANDO CLAUDE
      throw new Error('OpenAI desativado, usando Claude');
    } catch (error) {
      // Usar Claude
      console.log(`🔄 Usando Claude no loop de functions...`);

      if (anthropic) {
        try {
          response = await callClaude({
            messages: messages,
            tools: FUNCOES_DISPONIVEIS,
            max_tokens: 4096,
            temperature: 0.7
          });
          console.log('✅ Claude respondeu com sucesso no loop! (fallback)');
        } catch (claudeError) {
          console.error('❌ Claude também falhou no loop:', claudeError.message);
          throw new Error(`Ambas IAs falharam no loop. OpenAI: ${error.message}, Claude: ${claudeError.message}`);
        }
      } else {
        console.error('❌ OpenAI falhou no loop e Claude não está configurado');
        throw error;
      }
    }
    
    assistantMessage = response.choices[0].message;
  }
  
  // Garantir que só retorna 1 string
  let respostaFinal = (assistantMessage.content || '').trim();

  // Limitar a resposta a no máximo 5 linhas e 300 caracteres
  respostaFinal = respostaFinal
    .split('\n')
    .slice(0, 5)
    .join('\n')
    .substring(0, 300);

  // GROQ DESATIVADO
  // if (usouGroq) {
  //   console.log('🟢 Resposta gerada pelo Groq');
  // }

  // Verificar se precisa enviar pergunta sobre documentação
  const precisaDocumentacao = funcoesExecutadas.some(f =>
    f === 'calcular_financiamento' || f === 'simular_financiamento_detalhado'
  );

  return {
    resposta: respostaFinal,
    funcoes_chamadas: funcoesExecutadas,
    modelo_usado: 'openai', // GROQ DESATIVADO
    lista_foi_enviada: funcoesExecutadas.includes('buscar_carros'),
    enviar_pergunta_documentacao: precisaDocumentacao
  };
  }
} 


// =====================================================
// REPOSITÓRIO (simplificado)
// =====================================================
class VeiculosRepository {
  constructor() {
    this.veiculos = [];
    this.cacheFile = path.join(__dirname, 'cache_veiculos.json');
    this.CACHE_DURACAO = 6 * 60 * 60 * 1000; // 6 horas em ms
  }

  // ← MÉTODO NOVO: Verificar se cache é válido
  cacheEstaValido() {
    try {
      if (!fs.existsSync(this.cacheFile)) {
        console.log('📂 Cache não existe');
        return false;
      }

      const stats = fs.statSync(this.cacheFile);
      const idadeCache = Date.now() - stats.mtimeMs;
      const horasCache = Math.floor(idadeCache / 1000 / 60 / 60);

      if (idadeCache > this.CACHE_DURACAO) {
        console.log(`⏰ Cache expirado (${horasCache}h atrás)`);
        return false;
      }

      console.log(`✅ Cache válido (${horasCache}h atrás)`);
      return true;

    } catch (error) {
      console.error('❌ Erro ao verificar cache:', error.message);
      return false;
    }
  }

  // ← MÉTODO NOVO: Carregar do cache
  carregarCache() {
    try {
      console.log('📂 Carregando veículos do cache...');
      const data = fs.readFileSync(this.cacheFile, 'utf8');
      const cache = JSON.parse(data);

      this.veiculos = cache.veiculos || [];
      
      console.log(`✅ ${this.veiculos.length} veículos carregados do cache`);
      
      if (this.veiculos.length > 0) {
        console.log('📝 Exemplo:', this.veiculos[0].nome);
      }

      return true;

    } catch (error) {
      console.error('❌ Erro ao carregar cache:', error.message);
      return false;
    }
  }

  // ← MÉTODO NOVO: Salvar no cache
  salvarCache() {
    try {
      console.log('💾 Salvando veículos no cache...');
      
      const cache = {
        veiculos: this.veiculos,
        timestamp: Date.now(),
        total: this.veiculos.length
      };

      fs.writeFileSync(this.cacheFile, JSON.stringify(cache, null, 2), 'utf8');
      
      console.log(`✅ Cache salvo: ${this.veiculos.length} veículos`);
      return true;

    } catch (error) {
      console.error('❌ Erro ao salvar cache:', error.message);
      return false;
    }
  }

  // ← MÉTODO ATUALIZADO: Buscar com cache
  async buscarVeiculos() {
    // ✅ HABILITADO: Busca veículos do banco MySQL localhost
    console.log('ℹ️  [INFO] Buscando veículos do banco de dados MySQL...');

    // ========== TENTAR USAR CACHE PRIMEIRO ==========
    if (this.cacheEstaValido()) {
      if (this.carregarCache()) {
        log.success(`${this.veiculos.length} veículos carregados do CACHE (instantâneo)`);
        return this.veiculos;
      }
    }

    // ========== SE CACHE INVÁLIDO, BUSCAR DO BANCO ==========
    console.log('📤 Buscando veículos do banco MySQL (cache expirado ou inválido)...');

    try {
      // ========== PASSO 1: Buscar TODOS os carros básicos ==========
      console.log('📤 [1/3] Buscando carros básicos...');
      const carros = await db.query('SELECT id, feature_image, price, year, mileage, is_featured, is_special_offer FROM cars WHERE price > 0 AND status = "1" LIMIT 1000');
      
      console.log('✅ Carros encontrados:', carros.length);
      
      if (carros.length === 0) {
        console.error('⚠️ Nenhum carro disponível');
        return [];
      }
      
      // ========== PASSO 2: Buscar detalhes em LOTES ==========
      console.log('📤 [2/3] Buscando detalhes em lotes...');
      
      const detalhesMap = {};
      let sucessos = 0;
      let erros = 0;
      const BATCH_SIZE = 10;
      
      for (let i = 0; i < carros.length; i += BATCH_SIZE) {
        const batch = carros.slice(i, i + BATCH_SIZE);
        const ids = batch.map(c => c.id).join(',');
        
        let tentativas = 0;
        let sucesso = false;
        
        while (tentativas < 3 && !sucesso) {
          try {
            const dets = await db.query(`SELECT cc.car_id, cc.title, cc.category_id, b.name as marca, cm.name as modelo, cc.fuel_type_id, cat.name as categoria FROM car_contents cc LEFT JOIN brands b ON cc.brand_id = b.id LEFT JOIN car_models cm ON cc.car_model_id = cm.id LEFT JOIN categories cat ON cc.category_id = cat.id WHERE cc.car_id IN (${ids})`);
            
            dets.forEach(d => {
              detalhesMap[d.car_id] = d;
            });
            
            sucessos += dets.length;
            sucesso = true;
            
            const progresso = Math.min(i + BATCH_SIZE, carros.length);
            if ((i + BATCH_SIZE) % 50 === 0 || progresso === carros.length) {
              console.log(`   ✓ Progresso: ${progresso}/${carros.length} (${sucessos} ok, ${erros} erros)`);
            }
            
          } catch (err) {
            tentativas++;
            if (tentativas < 3) {
              await new Promise(r => setTimeout(r, 1000));
            } else {
              erros += batch.length;
            }
          }
        }
      }
      
      console.log(`✅ Detalhes obtidos: ${sucessos} sucessos, ${erros} erros`);
      
      // ========== PASSO 3: Combinar dados ==========
      console.log('📤 [3/3] Montando lista final...');
      
      this.veiculos = carros.map(c => {
        const det = detalhesMap[c.id] || {};

        // ✅ CORRIGIR NOME: usar marca + modelo se title estiver vazio
        let nomeVeiculo = det.title;
        if (!nomeVeiculo || nomeVeiculo.trim() === '') {
          // Fallback: montar nome a partir de marca + modelo
          if (det.marca && det.modelo) {
            nomeVeiculo = `${det.marca} ${det.modelo}`;
          } else if (det.marca) {
            nomeVeiculo = det.marca;
          } else {
            nomeVeiculo = `Veículo ${c.id}`;
          }
        }

        return {
          id: c.id,
          nome: nomeVeiculo,
          marca: det.marca || 'N/A',
          modelo: det.modelo || '',
          preco: parseFloat(c.price) || 0,
          ano: (c.year || '').toString(),
          km: (c.mileage || '0').toString(),
          cambio: 'Manual',
          tipo_carroceria: det.categoria || '',
          foto: c.feature_image,
          is_featured: c.is_featured || '0',
          is_special_offer: c.is_special_offer || 0
        };
      }).filter(v => {
        const texto = `${v.nome} ${v.marca}`.toLowerCase();
        return !['biz', 'cg', 'titan', 'moto', 'honda cg', 'yamaha'].some(m => texto.includes(m));
      });

      console.log('✅ Veículos processados:', this.veiculos.length);

      // ========== PASSO 4: Buscar fotos da car_images para veículos sem feature_image ==========
      const veiculosSemFoto = this.veiculos.filter(v => !v.foto);
      if (veiculosSemFoto.length > 0) {
        console.log(`📸 [4/4] Buscando fotos alternativas para ${veiculosSemFoto.length} veículos sem feature_image...`);

        for (const veiculo of veiculosSemFoto) {
          try {
            const fotosAlt = await db.query(
              'SELECT image FROM car_images WHERE car_id = ? LIMIT 1',
              [veiculo.id]
            );

            if (fotosAlt && fotosAlt.length > 0 && fotosAlt[0].image) {
              veiculo.foto = fotosAlt[0].image;
              console.log(`  ✓ Foto encontrada para veículo ${veiculo.id}: ${fotosAlt[0].image}`);
            }
          } catch (err) {
            console.log(`  ✗ Erro ao buscar foto alternativa para veículo ${veiculo.id}`);
          }
        }

        const comFotoAgora = this.veiculos.filter(v => v.foto).length;
        console.log(`✅ Total de veículos com foto: ${comFotoAgora}/${this.veiculos.length}`);
      }
      
      if (this.veiculos.length > 0) {
        console.log('📝 Primeiro:', this.veiculos[0].nome);
        console.log('📝 Último:', this.veiculos[this.veiculos.length - 1].nome);
      }
      
      // ========== SALVAR NO CACHE ==========
      this.salvarCache();
      
      log.success(`${this.veiculos.length} veículos carregados via API`);
      return this.veiculos;
      
    } catch (error) {
      console.error('❌ ERRO FATAL ao buscar veículos:');
      console.error('Mensagem:', error.message);
      
      // Se falhar e tem cache antigo, usar mesmo expirado
      if (fs.existsSync(this.cacheFile)) {
        console.log('⚠️ Usando cache antigo como fallback...');
        this.carregarCache();
      }

      return this.veiculos;
    }
  }

  // ← MÉTODO NOVO: Forçar atualização
  async forcarAtualizacao() {
    console.log('🔄 Forçando atualização do cache...');
    
    if (fs.existsSync(this.cacheFile)) {
      fs.unlinkSync(this.cacheFile);
      console.log('🗑️ Cache deletado');
    }
    
    return this.buscarVeiculos();
  }

  // Métodos antigos continuam iguais
  porId(id) {
    return this.veiculos.find(v => v.id === parseInt(id));
  }

  async buscarFotosVeiculo(veiculoId) {
    console.log(`\n[DEBUG-FOTOS-VEICULO] 🔍 Buscando fotos adicionais para veículo ID: ${veiculoId}`);

    try {
      const rows = await db.query(
        `SELECT id, image FROM car_images WHERE car_id = ${veiculoId} LIMIT 5`
      );

      console.log(`[DEBUG-FOTOS-VEICULO] 📊 Encontradas ${rows?.length || 0} fotos na tabela car_images`);
      if (rows?.length > 0) {
        console.log(`[DEBUG-FOTOS-VEICULO] 📋 Dados completos:`, JSON.stringify(rows, null, 2));
      }

      return rows.map(r => {
        const url = r.image.startsWith('http')
          ? r.image
          : `${BASE_URL}/public/assets/admin/img/car-gallery/${r.image}`;
        console.log(`[DEBUG-FOTOS-VEICULO] 🔗 URL montada: ${url}`);
        return url;
      });
    } catch (error) {
      log.error(`[FOTOS-VEICULO] Erro ao buscar fotos: ${error.message}`);
      console.error(`[DEBUG-FOTOS-VEICULO] Stack:`, error.stack);
      return [];
    }
  }

  // Buscar veículo específico por ID
  async buscarVeiculoPorId(id) {
    try {
      // Primeiro tentar buscar no cache em memória
      const veiculoCache = this.veiculos.find(v => parseInt(v.id) === parseInt(id));
      if (veiculoCache) {
        console.log(`✅ [VEICULO-ID] Veículo ${id} encontrado no cache`);
        return veiculoCache;
      }

      // Se não estiver no cache, buscar no banco
      console.log(`📤 [VEICULO-ID] Buscando veículo ${id} no banco de dados...`);

      // Buscar dados básicos do carro
      const [carro] = await db.query(`
        SELECT
          c.id, c.feature_image, c.price, c.year, c.mileage,
          c.is_featured, c.is_special_offer, c.status,
          c.lojista_telefone, c.lojista_nome
        FROM cars c
        WHERE c.id = ?
      `, [id]);

      if (!carro) {
        console.log(`❌ [VEICULO-ID] Veículo ${id} não encontrado`);
        return null;
      }

      // Buscar conteúdos (nome, especificações, etc) + marca e modelo
      const [conteudo] = await db.query(`
        SELECT
          cc.title,
          cc.meta_keywords,
          b.name as marca,
          cm.name as modelo
        FROM car_contents cc
        LEFT JOIN brands b ON cc.brand_id = b.id
        LEFT JOIN car_models cm ON cc.car_model_id = cm.id
        WHERE cc.car_id = ? AND cc.language_id = 20
      `, [id]);

      // Buscar especificações
      const specs = await db.query(`
        SELECT cs.car_specification_id, cs.value, csc.name
        FROM car_specifications cs
        LEFT JOIN car_specification_contents csc ON cs.car_specification_id = csc.car_specification_id
        WHERE cs.car_id = ? AND (csc.language_id = 20 OR csc.language_id IS NULL)
      `, [id]);

      // ✅ CORRIGIR NOME: usar marca + modelo se title estiver vazio
      let nomeVeiculo = conteudo?.title;
      if (!nomeVeiculo || nomeVeiculo.trim() === '') {
        // Fallback: montar nome a partir de marca + modelo
        if (conteudo?.marca && conteudo?.modelo) {
          nomeVeiculo = `${conteudo.marca} ${conteudo.modelo}`;
        } else if (conteudo?.marca) {
          nomeVeiculo = conteudo.marca;
        } else {
          nomeVeiculo = `Veículo ${carro.id}`;
        }
      }

      // Montar objeto do veículo
      const veiculo = {
        id: carro.id,
        nome: nomeVeiculo,
        preco: parseFloat(carro.price),
        ano: carro.year,
        km: carro.mileage,
        foto: carro.feature_image,
        especificacoes: specs,
        lojista_telefone: carro.lojista_telefone,
        lojista_nome: carro.lojista_nome
      };

      console.log(`✅ [VEICULO-ID] Veículo encontrado:`, veiculo.nome);
      return veiculo;

    } catch (error) {
      console.error(`❌ [VEICULO-ID] Erro ao buscar veículo ${id}:`, error);
      return null;
    }
  }
}


// =====================================================
// ELEVENLABS - SPEECH TO TEXT E TEXT TO SPEECH
// =====================================================
class ElevenLabsService {
  constructor() {
    this.client = new ElevenLabsClient({
      apiKey: ELEVENLABS_API_KEY
    });
    this.voiceId = ELEVENLABS_VOICE_ID;
    // this.groqKey = GROQ_API_KEY; // GROQ DESATIVADO
  }


  

  // Speech-to-Text usando OpenAI Whisper
  async transcribeAudio(audioBuffer) {
    try {
      log.info('[OPENAI] Transcrevendo áudio com Whisper...');

      const tempOgg = path.join(__dirname, `temp_input_${Date.now()}.ogg`);
      const tempMp3 = path.join(__dirname, `temp_input_${Date.now()}.mp3`);

      fs.writeFileSync(tempOgg, audioBuffer);

      // Converter OGG para MP3
      await new Promise((resolve, reject) => {
        ffmpeg(tempOgg)
          .toFormat('mp3')
          .audioFrequency(16000)
          .audioChannels(1)
          .on('end', resolve)
          .on('error', reject)
          .save(tempMp3);
      });

      // Usar OpenAI Whisper
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(tempMp3),
        model: 'whisper-1',
        language: 'pt'
      });

      const texto = transcription.text;
      log.success(`[OPENAI] Transcrição: "${texto}"`);

      fs.unlinkSync(tempOgg);
      fs.unlinkSync(tempMp3);

      return texto;

    } catch (error) {
      log.error(`[OPENAI] Erro na transcrição: ${error.message}`);

      // GROQ DESATIVADO - sem fallback de transcrição
      log.error('[TRANSCRIÇÃO] Falha na transcrição de áudio');
      throw error;

      // // Fallback para Groq se OpenAI falhar
      // try {
      //   log.info('[OPENAI] Falhou, tentando Groq como fallback...');
      //
      //   const tempOgg = path.join(__dirname, `temp_input_fallback_${Date.now()}.ogg`);
      //   const tempMp3 = path.join(__dirname, `temp_input_fallback_${Date.now()}.mp3`);
      //
      //   fs.writeFileSync(tempOgg, audioBuffer);
      //
      //   await new Promise((resolve, reject) => {
      //     ffmpeg(tempOgg)
      //       .toFormat('mp3')
      //       .audioFrequency(16000)
      //       .audioChannels(1)
      //       .on('end', resolve)
      //       .on('error', reject)
      //       .save(tempMp3);
      //   });
      //
      //   const formData = new FormData();
      //   formData.append('file', fs.createReadStream(tempMp3));
      //   formData.append('model', 'whisper-large-v3');
      //   formData.append('language', 'pt');
      //
      //   const response = await axios.post(
      //     'https://api.groq.com/openai/v1/audio/transcriptions',
      //     formData,
      //     {
      //       headers: {
      //         'Authorization': `Bearer ${this.groqKey}`,
      //         ...formData.getHeaders()
      //       }
      //     }
      //   );
      //
      //   const texto = response.data.text;
      //   log.success(`[GROQ] Transcrição (fallback): "${texto}"`);
      //
      //   fs.unlinkSync(tempOgg);
      //   fs.unlinkSync(tempMp3);
      //
      //   return texto;
      //
      // } catch (groqError) {
      //   log.error(`[GROQ] Fallback também falhou: ${groqError.message}`);
      //   throw error;
      // }
    }
  }

  // Text-to-Speech usando SDK oficial da ElevenLabs
  async textToSpeech(texto) {
    const textoFormatado = FormatadorFala.prepararParaTTS(texto);
    try {
      log.info(`[ELEVENLABS] Gerando áudio...`);

      const audioStream = await this.client.textToSpeech.convert(this.voiceId, {
        text: textoFormatado,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        },
        output_format: 'mp3_44100_128' // Garantir formato MP3
      });

      // Converter stream para buffer
      const chunks = [];
      for await (const chunk of audioStream) {
        chunks.push(chunk);
      }

      const audioBufferMp3 = Buffer.concat(chunks);
      log.info(`[ELEVENLABS] MP3 gerado (${audioBufferMp3.length} bytes)`);

      // ✅ CONVERTER MP3 → OGG/OPUS (formato ideal para WhatsApp)
      const tempMp3 = path.join(__dirname, `temp_tts_${Date.now()}.mp3`);
      const tempOgg = path.join(__dirname, `temp_tts_${Date.now()}.ogg`);

      fs.writeFileSync(tempMp3, audioBufferMp3);

      await new Promise((resolve, reject) => {
        ffmpeg(tempMp3)
          .toFormat('ogg')
          .audioCodec('libopus') // Codec Opus (melhor para voz)
          .audioBitrate('64k')   // Bitrate otimizado para voz
          .audioChannels(1)      // Mono
          .audioFrequency(48000) // 48kHz (padrão WhatsApp)
          .on('end', resolve)
          .on('error', reject)
          .save(tempOgg);
      });

      const audioBufferOgg = fs.readFileSync(tempOgg);

      // Limpar arquivos temporários
      fs.unlinkSync(tempMp3);
      fs.unlinkSync(tempOgg);

      log.success(`[ELEVENLABS] Áudio convertido para OGG/Opus (${audioBufferOgg.length} bytes)`);
      return audioBufferOgg;

    } catch (error) {
      log.error(`[ELEVENLABS] Erro: ${error.message}`);
      throw error;
    }
  }
}


// ========== API BRASIL - CONSULTA SERASA ==========
class ConsultaSerasaService {
  constructor() {
    this.baseURL = 'https://gateway.apibrasil.io/api/v2';
    this.token = process.env.APIBRASIL_TOKEN;
    this.deviceToken = process.env.APIBRASIL_DEVICE_TOKEN;
  }

  /**
   * Consulta score de crédito por CPF
   * @param {string} cpf - CPF do cliente (apenas números)
   * @returns {Promise<Object>} - Dados do score e análise de crédito
   */
  async consultarScorePorCPF(cpf) {
    try {
      // Limpar CPF (remover pontos e traços)
      const cpfLimpo = cpf.replace(/\D/g, '');

      if (cpfLimpo.length !== 11) {
        throw new Error('CPF inválido. Deve conter 11 dígitos.');
      }

      log.info(`[SERASA] Consultando score para CPF: ${cpfLimpo.substring(0, 3)}.***.***-${cpfLimpo.substring(9)}`);

      const response = await axios.post(
        `${this.baseURL}/consulta/cpf/credits`,
        {
          cpf: cpfLimpo
        },
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'DeviceToken': this.deviceToken,
            'Content-Type': 'application/json'
          }
        }
      );

      const dados = response.data;

      log.success(`[SERASA] ✅ Consulta realizada com sucesso!`);

      // Processar e retornar dados estruturados
      return {
        sucesso: true,
        cpf: cpfLimpo,
        dados_cadastrais: {
          nome: dados.nome || 'Não disponível',
          data_nascimento: dados.dataNascimento || null,
          situacao_cpf: dados.situacaoCpf || 'Não informado'
        },
        score: {
          pontuacao: dados.score || null,
          classificacao: this.classificarScore(dados.score),
          descricao: this.getDescricaoScore(dados.score)
        },
        pendencias: {
          pefin: dados.pefin || [],
          refin: dados.refin || [],
          protestos: dados.protestos || [],
          total_pendencias: (dados.pefin?.length || 0) + (dados.refin?.length || 0) + (dados.protestos?.length || 0)
        },
        analise_credito: {
          aprovado: this.analisarCredito(dados),
          motivo: this.getMotivoAnalise(dados),
          recomendacao: this.getRecomendacao(dados)
        }
      };

    } catch (error) {
      log.error(`[SERASA] ❌ Erro na consulta: ${error.message}`);

      if (error.response) {
        log.error(`[SERASA] Status: ${error.response.status}`);
        log.error(`[SERASA] Detalhes: ${JSON.stringify(error.response.data)}`);
      }

      return {
        sucesso: false,
        erro: error.message,
        detalhes: error.response?.data || null
      };
    }
  }

  /**
   * Classifica score em categorias
   */
  classificarScore(score) {
    if (!score) return 'Não disponível';
    if (score >= 800) return 'Excelente';
    if (score >= 700) return 'Bom';
    if (score >= 600) return 'Regular';
    if (score >= 500) return 'Ruim';
    return 'Muito Ruim';
  }

  /**
   * Retorna descrição do score
   */
  getDescricaoScore(score) {
    if (!score) return 'Score não disponível no momento';
    if (score >= 800) return 'Crédito aprovado com melhores condições';
    if (score >= 700) return 'Boas chances de aprovação';
    if (score >= 600) return 'Aprovação possível com entrada maior';
    if (score >= 500) return 'Aprovação difícil, necessário avaliar entrada';
    return 'Recomendado entrada de 50% ou mais';
  }

  /**
   * Analisa se o crédito pode ser aprovado
   */
  analisarCredito(dados) {
    const score = dados.score || 0;
    const temPendencias = (dados.pefin?.length || 0) + (dados.refin?.length || 0) + (dados.protestos?.length || 0) > 0;

    // Regras de aprovação
    if (score >= 700 && !temPendencias) return true;
    if (score >= 600 && !temPendencias) return true;
    if (score >= 500 && !temPendencias) return true; // Com entrada maior

    return false;
  }

  /**
   * Retorna motivo da análise
   */
  getMotivoAnalise(dados) {
    const score = dados.score || 0;
    const pendencias = (dados.pefin?.length || 0) + (dados.refin?.length || 0) + (dados.protestos?.length || 0);

    if (score >= 700 && pendencias === 0) {
      return 'Score excelente e sem pendências';
    }
    if (score >= 600 && pendencias === 0) {
      return 'Score bom e sem pendências';
    }
    if (pendencias > 0) {
      return `Possui ${pendencias} pendência(s) financeira(s)`;
    }
    if (score < 500) {
      return 'Score abaixo do mínimo recomendado';
    }
    return 'Análise de crédito padrão';
  }

  /**
   * Retorna recomendação para o vendedor
   */
  getRecomendacao(dados) {
    const score = dados.score || 0;
    const pendencias = (dados.pefin?.length || 0) + (dados.refin?.length || 0) + (dados.protestos?.length || 0);

    if (score >= 700 && pendencias === 0) {
      return 'Oferecer financiamento com entrada padrão (20-30%)';
    }
    if (score >= 600 && pendencias === 0) {
      return 'Oferecer financiamento com entrada de 30-40%';
    }
    if (score >= 500 && pendencias === 0) {
      return 'Solicitar entrada de 40-50% ou veículo de troca';
    }
    if (pendencias > 0) {
      return 'Solicitar entrada maior (50%+) ou regularização das pendências';
    }
    return 'Avaliar possibilidade de venda à vista ou entrada de 60%+';
  }

  /**
   * Formata resposta para a Aira falar com o cliente
   */
  formatarRespostaParaCliente(resultado, nomeCliente) {
    if (!resultado.sucesso) {
      return 'Tive um probleminha ao consultar o score. Mas podemos continuar mesmo assim! Me conta, você tem um veículo para dar de entrada?';
    }

    const { score, analise_credito, pendencias } = resultado;

    if (analise_credito.aprovado) {
      return `${nomeCliente}, tá tudo certo! Seu score tá ${score.classificacao.toLowerCase()} (${score.pontuacao} pontos)! ${analise_credito.recomendacao}. Vamos montar a proposta?`;
    } else if (pendencias.total_pendencias > 0) {
      return `${nomeCliente}, vi aqui que tem ${pendencias.total_pendencias} pendência(s) no seu nome. Mas calma, a gente consegue resolver! ${analise_credito.recomendacao}. Você tem um carro pra dar de entrada?`;
    } else {
      return `${nomeCliente}, o score tá em ${score.pontuacao} pontos. ${analise_credito.recomendacao}. Você consegue dar uma entrada maior ou tem um veículo pra trocar?`;
    }
  }
}


// ========== ELEVENLABS AGENT (CONVERSATIONAL AI) ==========
class ElevenLabsAgent {
  constructor() {
    this.apiKey = ELEVENLABS_API_KEY;
    this.agentId = process.env.ELEVENLABS_AGENT_ID;
    this.conversasAtivas = new Map();
  }

  async iniciarConversa(tel) {
    try {
      log.info(`[AGENT] Iniciando conversa para ${tel}`);
      
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/convai/conversation`,
        {
          agent_id: this.agentId
        },
        {
          headers: {
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const conversationId = response.data.conversation_id;
      this.conversasAtivas.set(tel, conversationId);
      
      log.success(`[AGENT] Conversa criada: ${conversationId}`);
      return conversationId;
      
    } catch (error) {
      log.error(`[AGENT] Erro ao criar conversa: ${error.message}`);
      throw error;
    }
  }

  async enviarAudio(tel, audioBuffer) {
    try {
      let conversationId = this.conversasAtivas.get(tel);
      
      if (!conversationId) {
        conversationId = await this.iniciarConversa(tel);
      }
      
      log.info(`[AGENT] Enviando áudio para conversa ${conversationId}`);
      
      // Converter áudio para o formato correto se necessário
      const tempInput = path.join(__dirname, `temp_agent_input_${Date.now()}.mp3`);
      
      // Se for OGG, converter para MP3
      if (audioBuffer[0] === 0x4F && audioBuffer[1] === 0x67) {
        const tempOgg = path.join(__dirname, `temp_ogg_${Date.now()}.ogg`);
        fs.writeFileSync(tempOgg, audioBuffer);
        
        await new Promise((resolve, reject) => {
          ffmpeg(tempOgg)
            .toFormat('mp3')
            .audioFrequency(16000)
            .audioChannels(1)
            .on('end', resolve)
            .on('error', reject)
            .save(tempInput);
        });
        
        fs.unlinkSync(tempOgg);
      } else {
        fs.writeFileSync(tempInput, audioBuffer);
      }
      
      const formData = new FormData();
      formData.append('audio', fs.createReadStream(tempInput));
      
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/convai/conversation/${conversationId}/audio`,
        formData,
        {
          headers: {
            'xi-api-key': this.apiKey,
            ...formData.getHeaders()
          },
          responseType: 'arraybuffer',
          timeout: 30000
        }
      );
      
      fs.unlinkSync(tempInput);
      
      log.success(`[AGENT] Resposta recebida (${response.data.length} bytes)`);
      return Buffer.from(response.data);
      
    } catch (error) {
      log.error(`[AGENT] Erro: ${error.message}`);
      throw error;
    }
  }

  finalizarConversa(tel) {
    this.conversasAtivas.delete(tel);
    log.info(`[AGENT] Conversa finalizada para ${tel}`);
  }
}


class LucasVendedor {
  constructor(repo) {
    this.repo = repo;
    this.funcoes = new FuncoesVeiculos(repo);
    this.motorGPT = new MotorGPTFunctions(this.funcoes);
    this.agentElevenLabs = new ElevenLabsAgent(); // ← ELEVENLABS AGENTE

    // ✅ INICIALIZAR ANTHROPIC (corrige bug de fallback na primeira mensagem)
    this.anthropic = anthropic;
    if (!this.anthropic) {
      console.warn('⚠️ Anthropic não configurado - respostas humanizadas ficarão limitadas');
    }

    // ❌ IA MASTER DESATIVADA (não está sendo usada, economiza recursos)
    // this.iaMaster = new IAMaster(OPENAI_API_KEY, GROQ_API_KEY || '', db);
    // console.log('[AIRA] ✓ IA Master inicializado');

    this.conversas = new Map();
    this.etapas = new Map();
    this.jaSeApresentou = new Map();
    this.ultimoEnvio = new Map();
    this.listaOpcoes = new Map(); // ← ADICIONAR ESTA LINHA
    this.jaRespondeuAudio = new Map();

    // ========== SISTEMA DE AGREGAÇÃO DE MENSAGENS ==========
    this.mensagensPendentes = new Map(); // Armazena mensagens aguardando processamento
    this.timersAgregacao = new Map(); // Timers para processar mensagens agrupadas
    this.TEMPO_ESPERA_MENSAGENS = 4000; // 4 segundos para aguardar mais mensagens (aumentado para melhor agregação)

    // ✅ MAPAS DE ESTADO:
    this.veiculoInteresse = new Map(); // ← Guarda qual carro o cliente quer
    this.veiculoTroca = new Map();
    this.aguardandoDetalhesFipe = new Map(); // ← Guarda tentativas de FIPE aguardando detalhes
    this.fotosJaEnviadas = new Map(); // ← Controla se fotos detalhadas do veículo já foram enviadas
    this.veiculosJaMostrados = new Map(); // ← Guarda IDs de veículos já enviados para cada cliente
  }

  // ========== FUNÇÃO HELPER: TIMEOUT PARA OPERAÇÕES ASSÍNCRONAS ==========
  /**
   * Executa uma promise com timeout
   * @param {Promise} promise - Promise a ser executada
   * @param {number} timeoutMs - Timeout em milissegundos
   * @param {string} operacao - Nome da operação (para logs)
   * @returns {Promise} - Resultado da promise ou erro de timeout
   */
  async comTimeout(promise, timeoutMs, operacao = 'operação') {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout: ${operacao} demorou mais de ${timeoutMs}ms`)), timeoutMs)
      )
    ]);
  }

  // ========== MÉTODO GERADOR DE ÁUDIO COM PROTEÇÃO CONTRA CORTES ==========
  /**
   * Gera áudio usando ElevenLabs com proteções contra cortes
   * @param {string} texto - Texto para converter em áudio
   * @returns {Promise<Buffer>} - Buffer do áudio gerado
   */
  async gerarAudio(texto) {
    try {
      // 1. Validar texto
      if (!texto || typeof texto !== 'string') {
        throw new Error('Texto inválido para TTS');
      }

      const textoLimpo = texto.trim();
      if (textoLimpo.length === 0) {
        throw new Error('Texto vazio');
      }

      // 2. LIMITE DE CARACTERES (ElevenLabs suporta até ~5000 chars, mas vamos limitar a 1000 para evitar cortes)
      const LIMITE_CARACTERES = 1000;
      let textoFinal = textoLimpo;

      if (textoLimpo.length > LIMITE_CARACTERES) {
        log.warning(`[TTS] ⚠️ Texto muito longo (${textoLimpo.length} chars), truncando para ${LIMITE_CARACTERES}...`);

        // Truncar no último ponto/exclamação/interrogação antes do limite
        const textoTruncado = textoLimpo.substring(0, LIMITE_CARACTERES);
        const ultimoPonto = Math.max(
          textoTruncado.lastIndexOf('.'),
          textoTruncado.lastIndexOf('!'),
          textoTruncado.lastIndexOf('?')
        );

        if (ultimoPonto > 0) {
          textoFinal = textoTruncado.substring(0, ultimoPonto + 1);
        } else {
          textoFinal = textoTruncado + '...';
        }

        log.info(`[TTS] Texto truncado: "${textoFinal}"`);
      }

      // 3. Formatar texto para TTS
      const textoFormatado = FormatadorFala.prepararParaTTS(textoFinal);
      log.info(`[TTS] Texto formatado (${textoFormatado.length} chars): "${textoFormatado.substring(0, 100)}${textoFormatado.length > 100 ? '...' : ''}"`);

      // 4. Gerar áudio com timeout adequado
      const elevenLabs = new ElevenLabsService();

      // Timeout baseado no tamanho do texto (50ms por caractere + 5 segundos de margem)
      const timeoutMs = Math.min(60000, (textoFormatado.length * 50) + 5000);
      log.info(`[TTS] Timeout definido: ${timeoutMs}ms`);

      const audioBuffer = await Promise.race([
        elevenLabs.textToSpeech(textoFormatado),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout na geração de áudio')), timeoutMs)
        )
      ]);

      if (!audioBuffer || audioBuffer.length === 0) {
        throw new Error('Áudio vazio retornado');
      }

      log.success(`[TTS] ✅ Áudio gerado com sucesso (${audioBuffer.length} bytes)`);
      return audioBuffer;

    } catch (error) {
      log.error(`[TTS] ❌ Erro ao gerar áudio: ${error.message}`);
      throw error;
    }
  }

  // ========== MÉTODO PARA DIVIDIR TEXTO EM SEGMENTOS PARA ÁUDIO ==========
  /**
   * Divide texto longo em múltiplos segmentos para áudio
   * @param {string} texto - Texto completo
   * @param {number} limiteCaracteres - Limite de caracteres por segmento (padrão: 500)
   * @returns {Array<string>} Array de segmentos de texto
   */
  dividirTextoParaAudio(texto, limiteCaracteres = 500) {
    const textoLimpo = texto.trim();

    // Se texto é curto, retornar como único segmento
    if (textoLimpo.length <= limiteCaracteres) {
      return [textoLimpo];
    }

    log.info(`[DIVISAO-AUDIO] 📏 Texto longo (${textoLimpo.length} chars), dividindo em segmentos...`);

    const segmentos = [];
    let textoRestante = textoLimpo;

    while (textoRestante.length > 0) {
      // Se o restante é menor que o limite, adicionar como último segmento
      if (textoRestante.length <= limiteCaracteres) {
        // ✅ VALIDAR MÍNIMO DE 3 PALAVRAS
        const palavras = textoRestante.trim().split(/\s+/);
        if (palavras.length >= 3) {
          segmentos.push(textoRestante.trim());
        } else if (segmentos.length > 0) {
          // Juntar com o segmento anterior se for muito curto
          segmentos[segmentos.length - 1] += ' ' + textoRestante.trim();
          log.info(`[DIVISAO-AUDIO] ⚠️ Último segmento muito curto (${palavras.length} palavras), juntando com anterior`);
        } else {
          // Se é o primeiro e único, adicionar mesmo sendo curto
          segmentos.push(textoRestante.trim());
        }
        break;
      }

      // Encontrar ponto de corte ideal (antes da última palavra do limite)
      let pontoCorte = limiteCaracteres;
      const textoAteCorte = textoRestante.substring(0, pontoCorte);

      // 1. Tentar cortar em ponto final, exclamação ou interrogação
      const ultimoPontoSentenca = Math.max(
        textoAteCorte.lastIndexOf('. '),
        textoAteCorte.lastIndexOf('! '),
        textoAteCorte.lastIndexOf('? ')
      );

      if (ultimoPontoSentenca > limiteCaracteres * 0.6) {
        // Cortar após pontuação se estiver em pelo menos 60% do limite
        pontoCorte = ultimoPontoSentenca + 2; // +2 para incluir ponto e espaço
        log.info(`[DIVISAO-AUDIO] ✂️ Cortando em pontuação (${pontoCorte} chars)`);
      } else {
        // 2. Cortar em vírgula
        const ultimaVirgula = textoAteCorte.lastIndexOf(', ');
        if (ultimaVirgula > limiteCaracteres * 0.7) {
          pontoCorte = ultimaVirgula + 2; // +2 para incluir vírgula e espaço
          log.info(`[DIVISAO-AUDIO] ✂️ Cortando em vírgula (${pontoCorte} chars)`);
        } else {
          // 3. Cortar antes da última palavra (espaço)
          const ultimoEspaco = textoAteCorte.lastIndexOf(' ');
          if (ultimoEspaco > 0) {
            pontoCorte = ultimoEspaco;
            log.info(`[DIVISAO-AUDIO] ✂️ Cortando antes da última palavra (${pontoCorte} chars)`);
          }
        }
      }

      // Extrair segmento
      const segmento = textoRestante.substring(0, pontoCorte).trim();

      // ✅ VALIDAR MÍNIMO DE 3 PALAVRAS
      const palavras = segmento.split(/\s+/);
      if (palavras.length >= 3) {
        segmentos.push(segmento);
        log.info(`[DIVISAO-AUDIO] ✅ Segmento ${segmentos.length}: ${segmento.length} chars, ${palavras.length} palavras`);
      } else {
        log.warning(`[DIVISAO-AUDIO] ⚠️ Segmento muito curto (${palavras.length} palavras), ajustando...`);
        // Aumentar ponto de corte para incluir mais palavras
        const palavrasNecessarias = 3 - palavras.length;
        const palavrasExtras = textoRestante.substring(pontoCorte).trim().split(/\s+/).slice(0, palavrasNecessarias);
        const segmentoAjustado = segmento + ' ' + palavrasExtras.join(' ');
        segmentos.push(segmentoAjustado.trim());
        pontoCorte = segmentoAjustado.length;
        log.info(`[DIVISAO-AUDIO] ✅ Segmento ajustado: ${segmentoAjustado.length} chars, ${segmentoAjustado.split(/\s+/).length} palavras`);
      }

      // Atualizar texto restante
      textoRestante = textoRestante.substring(pontoCorte).trim();
    }

    log.success(`[DIVISAO-AUDIO] ✅ Texto dividido em ${segmentos.length} segmentos`);
    return segmentos;
  }

  // ========== MÉTODO PARA ENVIAR ÁUDIO COM TRATAMENTO ADEQUADO ==========
  /**
   * Envia áudio com todos os tratamentos necessários para evitar erro "Aguardando mensagem"
   * @param {Buffer} audioBuffer - Buffer do áudio
   * @param {string} tel - Número do telefone
   * @param {object} sock - Socket do WhatsApp
   * @param {string} context - Contexto (para nome do arquivo temporário)
   * @returns {Promise<void>}
   */
  async enviarAudioSeguro(audioBuffer, tel, sock, context = 'audio') {
    let audioPath = null;

    try {
      // 1. Validar buffer
      if (!audioBuffer || audioBuffer.length === 0) {
        throw new Error('Buffer de áudio vazio');
      }

      // 2. Salvar em arquivo temporário
      audioPath = path.join(__dirname, `temp_${context}_${Date.now()}.mp3`);
      fs.writeFileSync(audioPath, audioBuffer);

      // Validar que arquivo foi criado
      const stats = fs.statSync(audioPath);
      if (stats.size === 0) {
        throw new Error('Arquivo de áudio criado está vazio');
      }

      log.info(`[AUDIO] Arquivo salvo: ${stats.size} bytes`);

      // 3. Iniciar status "gravando"
      await sock.sendPresenceUpdate('recording', tel);

      // 4. ✅ DELAY CRÍTICO: Aguardar WhatsApp processar o status (300ms - aumentado)
      await new Promise(r => setTimeout(r, 300));

      // 5. Enviar áudio
      await sock.sendMessage(tel, {
        audio: { url: audioPath },
        mimetype: 'audio/ogg; codecs=opus', // ✅ OGG/Opus (formato correto vindo do ElevenLabs)
        ptt: true
      });

      log.success(`[AUDIO] ✅ Áudio enviado com sucesso (${context})`);

      // 6. Aguardar processamento antes de limpar status (300ms - aumentado)
      await new Promise(r => setTimeout(r, 300));

      // 7. Limpar arquivo temporário
      try {
        fs.unlinkSync(audioPath);
      } catch (unlinkErr) {
        log.warning(`[AUDIO] Não foi possível limpar arquivo: ${unlinkErr.message}`);
      }

      // 8. Limpar status "gravando"
      await sock.sendPresenceUpdate('paused', tel);

      // 9. Delay final para garantir que próxima mensagem não conflite (500ms - aumentado)
      await new Promise(r => setTimeout(r, 500));

    } catch (error) {
      log.error(`[AUDIO] ❌ Erro ao enviar áudio: ${error.message}`);

      // Limpar arquivo se existir
      if (audioPath && fs.existsSync(audioPath)) {
        try {
          fs.unlinkSync(audioPath);
        } catch (err) {
          log.error(`[AUDIO] Erro ao limpar arquivo: ${err.message}`);
        }
      }

      // Garantir que status seja limpo mesmo em erro
      try {
        await sock.sendPresenceUpdate('paused', tel);
      } catch (err) {
        log.error(`[AUDIO] Erro ao limpar status: ${err.message}`);
      }

      throw error;
    }
  }

  // ========== MÉTODO PARA GERAR MENSAGENS DE ERRO/DESCULPA ESPONTÂNEAS ==========
  /**
   * Gera mensagem de desculpa/erro de forma espontânea usando IA
   * @param {string} contexto - Contexto do erro (ex: 'foto_nao_carregou', 'foto_nao_existe', 'erro_geral')
   * @param {string} detalhes - Detalhes opcionais sobre o erro
   * @returns {Promise<string>} - Mensagem espontânea gerada
   */
  async gerarMensagemErroEspontanea(contexto, detalhes = '') {
    try {
      const prompts = {
        foto_nao_carregou: `Você é a Aira. Uma foto do veículo não carregou (erro técnico temporário).

INSTRUÇÕES:
- Peça desculpas de forma natural e breve (1 linha)
- Seja empática mas não dramática
- Diga que vai tentar novamente ou contornar o problema
- Use expressões brasileiras informais
- NÃO use "Ops", "Opa", "Desculpe" sempre - varie!

EXEMPLOS DE TOM (NÃO copie):
"Eita, essa foto travou aqui... Deixa eu tentar de novo!"
"Rapaz, essa imagem não quis aparecer... Vou mandar outra!"

Sua mensagem (máximo 1 linha):`,

        foto_nao_existe: `Você é a Aira. O veículo não tem foto cadastrada no sistema ainda.

INSTRUÇÕES:
- Explique rapidamente que a foto ainda não foi cadastrada (1 linha)
- Ofereça alternativa: enviar detalhes por texto
- Seja positiva e proativa
- Use linguagem informal

EXEMPLOS DE TOM (NÃO copie):
"Ah, esse ainda tá sem foto no sistema... Mas posso te mandar todos os detalhes!"
"Puxa, não cadastraram foto desse ainda... Te passo as informações, beleza?"

Sua mensagem (máximo 1 linha):`,

        erro_geral: `Você é a Aira. O WhatsApp está sobrecarregado com muitas mensagens chegando.

INSTRUÇÕES:
- Culpe o WhatsApp por estar com muita mensagem
- Diga que a mensagem do cliente não apareceu/sumiu
- Peça para reenviar
- Seja natural e empática (1 linha)
- Varie MUITO as expressões

EXEMPLOS DE TOM (NÃO copie exatamente):
"Opa, o WhatsApp tá louco aqui! Sua mensagem sumiu. Manda de novo?"
"Pow, o zap tá sobrecarregado! Não apareceu aqui. Reenvia?"

Sua mensagem (máximo 1 linha):`
      };

      const promptEscolhido = prompts[contexto] || prompts.erro_geral;

      // ✅ USAR CLAUDE PARA MENSAGENS DE ERRO ESPONTÂNEAS
      // const resposta = await openai.chat.completions.create({ ... }); // OPENAI DESATIVADO

      const mensagem = await callClaudeInsteadOfOpenAI(this.anthropic, {
        messages: [{
          role: 'system',
          content: promptEscolhido + (detalhes ? `\n\nContexto adicional: ${detalhes}` : '')
        }],
        temperature: 0.9,
        max_tokens: 50
      });

      log.info(`[ERRO-ESPONTANEO] 💬 Gerado via Claude (${contexto}): "${mensagem}"`);
      return mensagem;

    } catch (error) {
      log.error(`[ERRO-ESPONTANEO] ❌ Falha ao gerar: ${error.message}`);
      // Último recurso: culpar WhatsApp
      const emergencia = [
        'O WhatsApp tá com muita mensagem! A sua sumiu. Manda de novo?',
        'Pow, o zap travou aqui! Não vi sua mensagem. Reenvia?',
        'O WhatsApp tá sobrecarregado! Sua mensagem não apareceu. Pode mandar de novo?'
      ];
      return emergencia[Math.floor(Math.random() * emergencia.length)];
    }
  }

detectarIntencaoTroca(msg) {
  const msgLower = msg.toLowerCase();

  // ⚠️ CRÍTICO: NÃO detectar como troca se cliente mencionar valor em dinheiro
  // Ex: "vou dar 25mil de entrada", "25 mil de entrada", "tenho 30k de entrada"
  const temValorDinheiro = /\b(\d+)\s*(mil|k|reais)\s*(de\s+)?entrada\b/i.test(msgLower);
  const recusaTroca = /\b(não|nao)\s+(quero|vou|queria)\s+(dar|trocar|oferecer|colocar)\s+(o|meu)\s+(carro|veículo|veiculo)/i.test(msgLower);

  if (temValorDinheiro || recusaTroca) {
    log.info('⚠️ Cliente mencionou entrada em DINHEIRO ou RECUSOU troca, não é intenção de troca');
    return false;
  }

  const palavrasChaveTroca = [
    /\btenho um.*?(carro|veículo|veiculo)\b/i,
    /\bdar\s+(o|meu)\s+(carro|veículo|veiculo)\s+de entrada\b/i,
    /\bpra trocar\b/i,
    /\bpara trocar\b/i,
    /\bquero trocar\b/i,
    /\btrocar por\b/i,
    /\baceita.*?troca\b/i,
    /\btrocam.*?carro\b/i,
    /\bcarro.*?de entrada\b/i
  ];

  return palavrasChaveTroca.some(regex => regex.test(msgLower));
}

/**
 * Detecta se cliente mencionou entrada em DINHEIRO (não veículo)
 */
detectarEntradaDinheiro(msg) {
  const msgLower = msg.toLowerCase();

  // Padrões de entrada em dinheiro
  const padroesDinheiro = [
    /\b(\d+)\s*(mil|k)\s*(de\s+)?entrada\b/i,                    // "25 mil de entrada"
    /\b(\d+)\s*k\s*(de\s+)?entrada\b/i,                          // "25k de entrada"
    /\b(\d+)\s*mil\s*reais\s*(de\s+)?entrada\b/i,               // "25 mil reais de entrada"
    /\bvou\s+dar\s+(\d+)\s*(mil|k|reais)/i,                     // "vou dar 25 mil"
    /\btenho\s+(\d+)\s*(mil|k|reais)\s+(pra|para)\s+dar/i,      // "tenho 25 mil pra dar"
    /\bentrada\s+de\s+(\d+)\s*(mil|k|reais)/i                   // "entrada de 25 mil"
  ];

  return padroesDinheiro.some(regex => regex.test(msgLower));
}

/**
 * Extrai valor da entrada em dinheiro mencionada
 */
extrairValorEntradaDinheiro(msg) {
  const match = msg.match(/\b(\d+)\s*(mil|k)\b/i);
  if (match) {
    const numero = parseInt(match[1]);
    const unidade = match[2].toLowerCase();
    return unidade === 'mil' || unidade === 'k' ? numero * 1000 : numero;
  }
  return null;
}

/**
 * Extrai dados do veículo da mensagem (modelo, ano, km)
 * Ex: "tenho um gol g4 2018" → { modelo: "gol", ano: "2018" }
 */
extrairDadosVeiculo(msg) {
  const msgLower = msg.toLowerCase();
  const dados = {};

  // 1. EXTRAIR MODELO (lista expandida de modelos brasileiros)
  const modelosRegex = /\b(gol|civic|corolla|onix|hb20|sandero|ka|uno|palio|fiesta|fox|voyage|prisma|celta|argo|mobi|kwid|duster|kicks|creta|tucson|sportage|hr-v|hrv|compass|renegade|toro|hilux|ranger|s10|amarok|strada|montana|saveiro|fiat.*?toro|jeep.*?compass|jeep.*?renegade|chevrolet.*?onix|honda.*?civic|honda.*?hr-v|toyota.*?corolla|volkswagen.*?gol|nissan.*?kicks|hyundai.*?hb20|renault.*?sandero|renault.*?kwid)\b/i;
  const matchModelo = msg.match(modelosRegex);
  if (matchModelo) {
    // Limpar marca se vier junto (ex: "honda civic" → "civic")
    dados.modelo = matchModelo[0]
      .replace(/\b(chevrolet|honda|toyota|volkswagen|nissan|hyundai|renault|fiat|jeep)\b/gi, '')
      .trim()
      .toLowerCase();
  }

  // 2. EXTRAIR ANO (4 dígitos iniciando com 19xx ou 20xx)
  const anoMatch = msg.match(/\b(19\d{2}|20\d{2})\b/);
  if (anoMatch) {
    dados.ano = anoMatch[0];
  }

  // 3. EXTRAIR KM (formato: "50 mil km", "50000 km", etc)
  const kmMatch = msg.match(/(\d+)\s*(mil|k|km|quilômetros|quilometros)/i);
  if (kmMatch) {
    const numero = parseInt(kmMatch[1]);
    const unidade = kmMatch[2].toLowerCase();
    dados.km = unidade.includes('mil') || unidade === 'k' ? numero * 1000 : numero;
  }

  // 4. EXTRAIR VERSÃO (ex: "1.0", "1.6", "2.0")
  const versaoMatch = msg.match(/\b(\d+\.\d+)\b/);
  if (versaoMatch) {
    dados.versao = versaoMatch[0];
  }

  return dados;
}

/**
 * Consulta valor FIPE do veículo usando wrapper
 * @param {string} modelo - Modelo do veículo
 * @param {string} ano - Ano do veículo
 * @returns {number|null} - Valor FIPE (número) ou null se não encontrado
 */
async consultarFIPE(modelo, ano) {
  try {
    // Mapear modelo para marca (heurística inteligente)
    const mapeamentoMarcas = {
      'gol': 'volkswagen', 'fox': 'volkswagen', 'voyage': 'volkswagen', 'polo': 'volkswagen', 'saveiro': 'volkswagen', 'up': 'volkswagen', 'amarok': 'volkswagen', 't-cross': 'volkswagen', 'tiguan': 'volkswagen', 'jetta': 'volkswagen', 'virtus': 'volkswagen', 'nivus': 'volkswagen', 'taos': 'volkswagen',
      'civic': 'honda', 'city': 'honda', 'fit': 'honda', 'hr-v': 'honda', 'hrv': 'honda', 'crv': 'honda', 'cr-v': 'honda', 'accord': 'honda', 'wr-v': 'honda', 'wrv': 'honda',
      'corolla': 'toyota', 'hilux': 'toyota', 'etios': 'toyota', 'yaris': 'toyota', 'sw4': 'toyota', 'prius': 'toyota', 'rav4': 'toyota', 'camry': 'toyota', 'fielder': 'toyota',
      'onix': 'chevrolet', 'prisma': 'chevrolet', 'cruze': 'chevrolet', 's10': 'chevrolet', 'spin': 'chevrolet', 'tracker': 'chevrolet', 'equinox': 'chevrolet', 'montana': 'chevrolet', 'joy': 'chevrolet', 'cobalt': 'chevrolet', 'sonic': 'chevrolet', 'trailblazer': 'chevrolet',
      'hb20': 'hyundai', 'creta': 'hyundai', 'tucson': 'hyundai', 'ix35': 'hyundai', 'i30': 'hyundai', 'azera': 'hyundai', 'elantra': 'hyundai', 'santa fe': 'hyundai', 'hb20s': 'hyundai',
      'sandero': 'renault', 'kwid': 'renault', 'duster': 'renault', 'logan': 'renault', 'captur': 'renault', 'fluence': 'renault', 'oroch': 'renault', 'stepway': 'renault', 'master': 'renault',
      'ka': 'ford', 'ecosport': 'ford', 'ranger': 'ford', 'fusion': 'ford', 'edge': 'ford', 'focus': 'ford', 'fiesta': 'ford', 'territory': 'ford',
      'uno': 'fiat', 'palio': 'fiat', 'argo': 'fiat', 'mobi': 'fiat', 'toro': 'fiat', 'strada': 'fiat', 'cronos': 'fiat', 'fiorino': 'fiat', 'ducato': 'fiat', 'pulse': 'fiat', 'fastback': 'fiat', 'siena': 'fiat', 'punto': 'fiat', 'linea': 'fiat', 'bravo': 'fiat',
      'compass': 'jeep', 'renegade': 'jeep', 'commander': 'jeep', 'wrangler': 'jeep', 'cherokee': 'jeep', 'grand cherokee': 'jeep',
      'kicks': 'nissan', 'versa': 'nissan', 'march': 'nissan', 'sentra': 'nissan', 'frontier': 'nissan', 'leaf': 'nissan', 'livina': 'nissan',
      'sportage': 'kia', 'sorento': 'kia', 'soul': 'kia', 'cerato': 'kia', 'picanto': 'kia', 'rio': 'kia', 'stonic': 'kia', 'seltos': 'kia',
      'c3': 'citroen', 'c4': 'citroen', 'aircross': 'citroen', 'berlingo': 'citroen', 'jumper': 'citroen',
      '208': 'peugeot', '2008': 'peugeot', '3008': 'peugeot', '408': 'peugeot', '5008': 'peugeot', 'expert': 'peugeot'
    };

    const modeloLower = modelo.toLowerCase();
    const nomeMarca = mapeamentoMarcas[modeloLower];

    if (!nomeMarca) {
      log.warn(`⚠️ [FIPE] Marca não mapeada para modelo: ${modelo}`);
      return null;
    }

    // Usar wrapper existente
    console.log('\n📡 Chamando API FIPE...\n');
    const resultado = await consultarValorFipe(nomeMarca, modelo, parseInt(ano));

    if (!resultado || !resultado.sucesso) {
      log.warn(`⚠️ [FIPE] Não encontrado: ${modelo} ${ano}`);
      return null;
    }

    // Retornar apenas o valor numérico
    log.info(`💰 [FIPE] ${resultado.modelo} ${resultado.ano_modelo} = ${resultado.valor}`);
    return resultado.valor_numerico;

  } catch (error) {
    log.error(`❌ [FIPE] Erro ao consultar: ${error.message}`);
    return null;
  }
}

/**
 * Formata valor em moeda brasileira
 * @param {number} valor - Valor numérico
 * @returns {string} - Valor formatado (ex: "R$ 45.000,00")
 */
formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}


  // ========== MÉTODOS DE AGREGAÇÃO DE MENSAGENS ==========
  /**
   * Adiciona mensagem à fila e aguarda outras mensagens do cliente
   * @param {string} tel - Telefone do cliente
   * @param {string} mensagem - Mensagem recebida
   * @param {Function} callbackProcessar - Função a ser chamada quando processar
   */
  adicionarMensagemPendente(tel, mensagem, callbackProcessar) {
    // Se não existe array de mensagens para este telefone, criar
    if (!this.mensagensPendentes.has(tel)) {
      this.mensagensPendentes.set(tel, []);
    }

    // Adicionar mensagem à fila
    const mensagens = this.mensagensPendentes.get(tel);
    mensagens.push(mensagem);
    log.info(`📥 Mensagem adicionada à fila [${mensagens.length} total] - ${tel.slice(-4)}`);

    // Se já existe um timer, cancelá-lo
    if (this.timersAgregacao.has(tel)) {
      clearTimeout(this.timersAgregacao.get(tel));
    }

    // Criar novo timer para processar após X segundos
    const timer = setTimeout(async () => {
      const todasMensagens = this.mensagensPendentes.get(tel) || [];
      const mensagemCompleta = todasMensagens.join('\n');

      log.info(`⏰ Tempo esgotado! Processando ${todasMensagens.length} mensagem(ns) agregada(s)`);
      log.info(`📝 Mensagem completa: "${mensagemCompleta}"`);

      if (mensagemCompleta.includes('\n')) {
        log.info(`📋 [MULTILINHA] Mensagem contém ${mensagemCompleta.split('\n').length} linhas`);
        mensagemCompleta.split('\n').forEach((linha, idx) => {
          log.info(`   Linha ${idx+1}: "${linha}"`);
        });
      }

      // Limpar fila e timer
      this.mensagensPendentes.delete(tel);
      this.timersAgregacao.delete(tel);

      // Processar mensagem completa
      await callbackProcessar(mensagemCompleta);
    }, this.TEMPO_ESPERA_MENSAGENS);

    this.timersAgregacao.set(tel, timer);
    log.info(`⏱️ Timer iniciado (${this.TEMPO_ESPERA_MENSAGENS}ms)`);
  }

  /**
   * Calcula delay natural entre mensagens baseado no tamanho do texto
   * @param {string} texto - Texto da mensagem
   * @returns {number} Delay em milissegundos
   */
  calcularDelayNatural(texto) {
    // Tempo base de "digitação"
    const tempoBase = 800; // 0.8 segundo mínimo

    // Tempo por caractere (simula digitação ~40 palavras/min = ~6 caracteres/seg)
    const tempoPorCaractere = 30; // 30ms por caractere

    // Tempo de "pensamento" extra para mensagens mais longas
    const tempoPensamento = texto.length > 100 ? 1000 : 0;

    const delay = tempoBase + (texto.length * tempoPorCaractere) + tempoPensamento;

    // Máximo de 5 segundos, mínimo de 1 segundo
    return Math.min(Math.max(delay, 1000), 5000);
  }

  /**
   * Delay com Promise
   * @param {number} ms - Milissegundos
   */
  async aguardar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Gera resposta contextualizada e humana usando IA (SEM mensagens mock!)
   * @param {string} tipo - Tipo de resposta: 'saudacao', 'intro_veiculo', 'troca'
   * @param {object} contexto - Dados do contexto (nome, veiculo, etc)
   * @returns {Promise<string>} Resposta gerada pela IA
   */
  async gerarRespostaHumana(tipo, contexto = {}) {
    try {
      let promptSistema = '';
      let promptUsuario = '';

      switch (tipo) {
        case 'saudacao':
          promptSistema = `Você é Aira, vendedora REAL (não robô!) da Feirão Show Car há 15 anos.
Seja natural, calorosa e autêntica. NUNCA use frases robóticas ou padrões repetitivos.
Você é uma pessoa REAL de carne e osso conversando com o cliente pelo WhatsApp.
Se perguntarem se você é robô, negue com naturalidade: "Não, ô! Sou eu mesmo aqui 😊"

OBRIGATÓRIO:
- Mencione "Feirão Show Car" naturalmente
- Use "Prazer" ou "Muito prazer" de forma natural
- Seja breve (máximo 3 linhas)
- Varie MUITO a estrutura da frase a cada vez
- Fale como vendedora experiente e humana`;

          promptUsuario = `O cliente ${contexto.nome} acabou de te cumprimentar com "${contexto.mensagem}".

Crie UMA saudação ÚNICA e NATURAL como Aira vendedora.
Seja você mesma, não use templates. Cada resposta deve ser diferente.`;
          break;

        case 'intro_veiculo':
          promptSistema = `Você é Aira, vendedora HUMANA experiente (não um robô!) da Feirão Show Car.
O cliente escolheu um veículo. Crie UMA frase curta e persuasiva (1 linha) sobre o carro.

Seja:
- Natural e humana (você é uma pessoa real!)
- Persuasiva mas honesta
- Use sua experiência de 15 anos para dar credibilidade
- Entusiasta mas não exagerada
- ÚNICA a cada vez (varie muito!)`;

          const nomeSimplificado = simplificarNomeVeiculo(contexto.veiculo?.nome, contexto.veiculo?.ano);
          promptUsuario = `Cliente escolheu: ${nomeSimplificado}

Crie UMA frase de impacto sobre este carro. Seja criativa e varie!`;
          break;

        case 'troca':
          promptSistema = `Você é Aira, vendedora HUMANA (não robô!) que aceita veículos usados na troca.
Cliente demonstrou interesse em dar o carro dele de entrada.

Seja:
- Receptiva, positiva e empolgada (você é uma pessoa real!)
- Pergunte os dados do carro dele (marca, modelo, ano) de forma natural
- Natural e humana
- Breve (1-2 linhas)
- VARIE a forma de perguntar toda vez`;

          promptUsuario = `Cliente disse que tem carro para trocar.

Responda de forma positiva e pergunte os dados do veículo dele.
Seja natural, não use frases genéricas.`;
          break;

        case 'pergunta_escolha':
          const qtdVeiculosPergunta = contexto.quantidade || 0;
          const textoVeiculos = qtdVeiculosPergunta === 1 ? 'esse veículo' : `esses ${qtdVeiculosPergunta} veículos`;

          promptSistema = `Você é Aira, vendedora HUMANA (não robô!) da Feirão Show Car.
Acabou de mostrar ${qtdVeiculosPergunta === 1 ? '1 veículo' : `${qtdVeiculosPergunta} veículos`} para o cliente.

Faça UMA pergunta CURTA (1 linha) para saber qual carro interessou o cliente.

Seja (você é uma pessoa real!):
- Natural e casual
- Breve (máximo 10 palavras)
- Varie MUITO a cada vez
- Pode usar emoji sutil se quiser
- Use ${qtdVeiculosPergunta === 1 ? 'SINGULAR' : 'PLURAL'} (foi ${qtdVeiculosPergunta} ${qtdVeiculosPergunta === 1 ? 'carro' : 'carros'})`;

          promptUsuario = `Cliente viu ${qtdVeiculosPergunta === 1 ? 'o carro' : 'a lista de carros'}. Pergunte se ${qtdVeiculosPergunta === 1 ? 'esse' : 'algum'} interessou.
Seja criativa, não use sempre a mesma pergunta! Use ${qtdVeiculosPergunta === 1 ? 'SINGULAR' : 'PLURAL'}!`;
          break;

        case 'intro_lista':
          const qtdVeiculos = contexto.quantidade || 0;
          const textoQuantidade = qtdVeiculos === 1 ? '1 veículo' : `${qtdVeiculos} veículos`;
          const textoCarros = qtdVeiculos === 1 ? '1 carro' : `${qtdVeiculos} carros`;

          promptSistema = `Você é Aira, vendedora HUMANA animada (não robô!) da Feirão Show Car.
Vai ENVIAR/MANDAR ${textoQuantidade} para o cliente agora.

Crie UMA frase CURTA avisando que VAI ENVIAR ${qtdVeiculos === 1 ? 'o modelo' : 'os modelos'}.

EXEMPLOS DO TIPO DE FRASE:
- "Vou te enviar alguns modelos agora!"
- "Já te mando ${qtdVeiculos} opções!"
- "Deixa eu te mandar ${qtdVeiculos === 1 ? 'um modelo' : 'uns modelos'} aqui"
- "Tô te enviando ${qtdVeiculos === 1 ? 'uma opção' : 'algumas opções'}!"

Seja (você é uma pessoa real!):
- Natural e empolgante
- Breve (máximo 10 palavras)
- Varie MUITO a cada vez
- Use VERBOS como: enviar, mandar, separar, mostrar
- Use ${qtdVeiculos === 1 ? 'SINGULAR' : 'PLURAL'}`;

          promptUsuario = `Avise que vai ENVIAR ${textoCarros} agora.
Seja breve, natural e empolgante!`;
          break;

        case 'pergunta_documentacao':
          promptSistema = `Você é Aira, vendedora HUMANA consultiva (não robô!) da Feirão Show Car.
Acabou de apresentar uma proposta de financiamento para o cliente.

Agora você vai perguntar SE ELE QUER receber a DOCUMENTAÇÃO formal da proposta.

Seja:
- Natural e consultiva (você é uma pessoa real!)
- Breve (1-2 linhas no máximo)
- Amigável e não pressione
- VARIE a forma de perguntar toda vez
- NÃO seja agressiva ou insistente

EXEMPLOS DO TIPO DE FRASE:
- "Quer que eu te envie a documentação dessa proposta?"
- "Posso te mandar os documentos formais dessa simulação?"
- "Te mando a proposta por escrito?"
- "Gostou? Quer que eu formalize essa proposta pra você?"`;

          promptUsuario = `Você acabou de apresentar uma proposta de financiamento.
Agora pergunte SE o cliente QUER receber a documentação formal.

Seja breve, natural e consultiva (não pressione)!`;
          break;

        default:
          return await this.gerarDesculpaHumana('', [], 'geral');
      }

      // ✅ USAR CLAUDE EM VEZ DE OPENAI
      const respostaClaude = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 150,
        temperature: 0.9,
        messages: [
          {
            role: 'user',
            content: `${promptSistema}\n\n${promptUsuario}`
          }
        ]
      });

      let resposta = respostaClaude.content[0].text.trim();
      resposta = resposta.replace(/^["']|["']$/g, '');

      log.success(`✨ [IA-HUMANA] Resposta gerada via Claude: "${resposta.substring(0, 50)}..."`);
      return resposta;

    } catch (error) {
      log.error(`[IA-HUMANA] Erro ao gerar resposta: ${error.message}`);
      // Fallback com desculpa humanizada
      return await this.gerarDesculpaHumana('', [], 'geral');
    }
  }

  /**
   * ✅ VERIFICA SE RESPOSTA É COERENTE COM O CONTEXTO
   * @param {string} resposta - Resposta gerada pela IA
   * @param {string} mensagemCliente - Mensagem do cliente
   * @param {Array} historico - Histórico da conversa
   * @returns {Promise<{coerente: boolean, motivo?: string}>}
   */
  async verificarCoerenciaResposta(resposta, mensagemCliente, historico = []) {
    log.info('🔍 [COERÊNCIA] Validando resposta antes de enviar...');

    try {
      // Verificações básicas
      if (!resposta || resposta.trim().length === 0) {
        return { coerente: false, motivo: 'Resposta vazia' };
      }

      // Se a resposta contém "WhatsApp" e o cliente enviou uma mensagem clara
      const temDesculpaWhatsApp = /whatsapp|zap.*bug|não.*aparec|reenviar|manda.*de novo/i.test(resposta);
      const clienteEnviouMensagemClara = mensagemCliente && mensagemCliente.trim().length > 2;

      if (temDesculpaWhatsApp && clienteEnviouMensagemClara) {
        // Verificar com IA se realmente precisa da desculpa
        const promptVerificacao = `Analise se a resposta está coerente:

MENSAGEM DO CLIENTE: "${mensagemCliente}"
HISTÓRICO RECENTE: ${historico.slice(-3).map(h => `${h.role}: ${h.content}`).join(' | ')}
RESPOSTA GERADA: "${resposta}"

A resposta está pedindo para o cliente reenviar a mensagem ou culpando o WhatsApp?
- Se SIM e o cliente enviou uma mensagem CLARA e VÁLIDA → responda "INCOERENTE"
- Se NÃO ou se realmente houve problema de contexto → responda "COERENTE"

Responda APENAS com: COERENTE ou INCOERENTE`;

        // ✅ USAR CLAUDE PARA VERIFICAÇÃO DE COERÊNCIA
        // const verificacao = await openai.chat.completions.create({ ... }); // OPENAI DESATIVADO

        const resultado = await callClaudeInsteadOfOpenAI(this.anthropic, {
          messages: [{ role: 'user', content: promptVerificacao }],
          temperature: 0.1,
          max_tokens: 10
        });

        const resultadoFinal = resultado.trim().toUpperCase();

        if (resultadoFinal.includes('INCOERENTE')) {
          log.warning('⚠️ [COERÊNCIA] Resposta INCOERENTE detectada - tem desculpa WhatsApp sem necessidade');
          return { coerente: false, motivo: 'Desculpa desnecessária sobre WhatsApp' };
        }
      }

      log.success('✅ [COERÊNCIA] Resposta validada como coerente');
      return { coerente: true };

    } catch (error) {
      log.error(`[COERÊNCIA] Erro na validação: ${error.message}`);
      // Em caso de erro, assumir que está coerente para não bloquear
      return { coerente: true };
    }
  }

  /**
   * 🚨 GERA DESCULPA HUMANA QUANDO O BOT BUGA OU NÃO ENTENDE
   * Nunca admite ser robô ou ter bugs - sempre culpa fatores humanos
   *
   * @param {string} mensagemCliente - Mensagem que o cliente enviou
   * @param {Array} historico - Histórico da conversa (opcional)
   * @param {string} tipoErro - Tipo de erro: 'geral', 'nao_entendeu', 'busca_falhou', 'timeout'
   * @returns {Promise<string>} Desculpa humanizada + pedido para repetir
   */
  async gerarDesculpaHumana(mensagemCliente = '', historico = [], tipoErro = 'geral') {
    log.info(`🚨 [DESCULPA-HUMANA] Gerando desculpa contextual (tipo: ${tipoErro})...`);

    try {
      const promptSistema = `Você é Aira, vendedora HUMANA da Feirão Show Car (NÃO é robô!).

Algo deu errado na conversa mas você NUNCA pode admitir que:
- É um robô ou IA
- Teve um bug técnico
- O sistema falhou
- Houve erro de processamento

🎯 ESTRATÉGIA: Culpe um PROBLEMA NO WHATSAPP devido ao grande volume de mensagens chegando!

✅ FAÇA (SEMPRE use esta estratégia):
- Culpe o WhatsApp por não mostrar a última mensagem
- Mencione que estão chegando MUITOS contatos/mensagens de uma vez
- Peça para reenviar a última mensagem
- Seja natural e empática
- Varie a forma de falar (NUNCA use exatamente as mesmas palavras)
- Use linguagem coloquial ("pow", "opa", "nossa", "caramba")

❌ NUNCA FAÇA:
- Admitir ser robô/IA
- Falar de "sistema", "erro", "processamento", "bug" (só fale de WhatsApp)
- Usar linguagem técnica
- Pedir desculpas formais demais
- Usar sempre a mesma frase (VARIE MUITO!)

EXEMPLOS BONS (varie baseado nestes):
- "Opa, o WhatsApp aqui tá meio louco! Tá chegando muita mensagem ao mesmo tempo e sua última não apareceu aqui. Pode reenviar pra mim?"
- "Pow, desculpa! O zap tá bugado com tanto contato chegando de uma vez. Sua mensagem não carregou aqui. Manda de novo?"
- "Nossa, o WhatsApp tá sobrecarregado aqui! Muita gente mandando mensagem e a sua sumiu. Reenvia aí pra mim?"
- "Caramba, tá chegando um monte de mensagem e o zap não mostrou a sua. Pode mandar de novo?"
- "Opa! O WhatsApp deu uma travada aqui com tantas conversas. Não vi sua última mensagem. Reenvia?"
- "Rapaz, o zap tá doido hoje! Muita mensagem chegando e a sua não apareceu. Manda aí de novo?"

⚠️ IMPORTANTE: Sempre culpe o WhatsApp + volume de mensagens. Nunca use outra desculpa!`;

      const contextoErro = {
        'geral': 'O WhatsApp não mostrou a última mensagem do cliente devido ao volume alto de conversas',
        'nao_entendeu': 'A mensagem do cliente não carregou direito no WhatsApp devido a muitas mensagens chegando',
        'busca_falhou': 'O WhatsApp travou com tantas mensagens e você não viu o que o cliente pediu',
        'timeout': 'O WhatsApp deu problema e você ficou sem ver as mensagens por um momento',
        'nao_encontrado_filtros': 'A mensagem do cliente sumiu no WhatsApp por causa do volume de contatos'
      };

      const promptUsuario = `Situação: ${contextoErro[tipoErro] || contextoErro.geral}
${mensagemCliente ? `Mensagem do cliente: "${mensagemCliente}"` : ''}
${historico.length > 0 ? `Últimas mensagens: ${historico.slice(-3).map(h => `${h.role}: ${h.content}`).join(' | ')}` : ''}

Crie UMA resposta NATURAL culpando o WhatsApp por estar sobrecarregado com muitas mensagens.
Peça para o cliente REENVIAR a última mensagem.
Seja criativa, varie MUITO as palavras!
Lembre-se: culpe SEMPRE o WhatsApp + volume alto de mensagens!`;

      // ✅ USAR CLAUDE PARA GERAR DESCULPA VARIADA
      // const respostaOpenAI = await openai.chat.completions.create({ ... }); // OPENAI DESATIVADO

      const desculpa = await callClaudeInsteadOfOpenAI(this.anthropic, {
        messages: [
          { role: 'system', content: promptSistema },
          { role: 'user', content: promptUsuario }
        ],
        temperature: 1.0,
        max_tokens: 80
      });

      const desculpaLimpa = desculpa.replace(/^["']|["']$/g, '');

      log.success(`🚨 [DESCULPA-HUMANA] Gerada via Claude: "${desculpaLimpa}"`);
      return desculpaLimpa;

      // // Tentar Groq primeiro
      // try {
      //   const respostaGroq = await groq.chat.completions.create({
      //     model: 'llama-3.3-70b-versatile',
      //     messages: [
      //       { role: 'system', content: promptSistema },
      //       { role: 'user', content: promptUsuario }
      //     ],
      //     temperature: 1.0, // Máxima criatividade para variar muito
      //     max_tokens: 80
      //   });
      //
      //   let desculpa = respostaGroq.choices[0].message.content.trim();
      //   desculpa = desculpa.replace(/^["']|["']$/g, '');
      //
      //   log.success(`🚨 [DESCULPA-HUMANA] Gerada via Groq: "${desculpa}"`);
      //   return desculpa;
      //
      // } catch (errorGroq) {
      //   log.info('[GROQ] Falhou, tentando OpenAI...');
      //
      //   const respostaOpenAI = await openai.chat.completions.create({
      //     model: 'gpt-4o',
      //     messages: [
      //       { role: 'system', content: promptSistema },
      //       { role: 'user', content: promptUsuario }
      //     ],
      //     temperature: 1.0,
      //     max_tokens: 80
      //   });
      //
      //   let desculpa = respostaOpenAI.choices[0].message.content.trim();
      //   desculpa = desculpa.replace(/^["']|["']$/g, '');
      //
      //   log.success(`🚨 [DESCULPA-HUMANA] Gerada via OpenAI: "${desculpa}"`);
      //   return desculpa;
      // }

    } catch (error) {
      log.error(`[DESCULPA-HUMANA] Erro crítico: ${error.message}`);

      // ✅ SEMPRE TENTAR IA - NUNCA USAR MOCK!
      try {
        return await this.gerarMensagemErroEspontanea('erro_geral', 'erro ao gerar desculpa');
      } catch (errorEspontanea) {
        log.error(`[DESCULPA-HUMANA] Até gerador espontâneo falhou: ${errorEspontanea.message}`);

        // GROQ DESATIVADO - Retornar mensagem genérica
        return 'O WhatsApp tá muito cheio! Sua mensagem não apareceu. Pode reenviar?';

        // // Último recurso: tentar Groq diretamente com prompt mínimo
        // try {
        //   const ultimaTentativa = await groq.chat.completions.create({
        //     model: 'llama-3.3-70b-versatile',
        //     messages: [{
        //       role: 'user',
        //       content: 'Você é Aira, vendedora. O WhatsApp está com muitas mensagens. Peça para o cliente reenviar. Seja natural e culpe o WhatsApp. UMA frase curta:'
        //     }],
        //     temperature: 1.0,
        //     max_tokens: 50
        //   });
        //   return ultimaTentativa.choices[0].message.content.trim().replace(/^["']|["']$/g, '');
        // } catch {
        //   // Se TUDO falhar, retornar mensagem genérica simples (mas ainda culpando WhatsApp)
        //   return 'O WhatsApp tá muito cheio! Sua mensagem não apareceu. Pode reenviar?';
        // }
      }
    }
  }

  /**
   * 🎙️ ENVIA DESCULPA HUMANA EM ÁUDIO (nunca texto!)
   * Sempre usa IA para gerar, NUNCA mock
   * @param {string} mensagemCliente - Mensagem do cliente
   * @param {Array} historico - Histórico da conversa
   * @param {string} tipoErro - Tipo de erro
   * @param {string} tel - Telefone do cliente
   * @param {object} sock - Socket do WhatsApp
   */
  async enviarDesculpaEmAudio(mensagemCliente, historico, tipoErro, tel, sock) {
    log.info('🎙️ [DESCULPA-AUDIO] Gerando e enviando desculpa em áudio...');

    try {
      // 1. Gerar desculpa com IA (sempre!)
      const desculpa = await this.gerarDesculpaHumana(mensagemCliente, historico, tipoErro);

      log.info(`💬 [DESCULPA-AUDIO] Mensagem gerada: "${desculpa}"`);

      // 2. Formatar para TTS
      const textoFormatado = FormatadorFala.prepararParaTTS(desculpa);

      // 3. Mostrar "gravando áudio"
      await sock.sendPresenceUpdate('recording', tel);

      // 4. Gerar áudio
      const elevenLabs = new ElevenLabsService();
      const audioBuffer = await elevenLabs.textToSpeech(textoFormatado);

      // 5. Salvar temporariamente
      const audioPath = path.join(__dirname, `temp_desculpa_${Date.now()}.mp3`);
      fs.writeFileSync(audioPath, audioBuffer);

      // 6. Enviar áudio
      await sock.sendMessage(tel, {
        audio: { url: audioPath },
        mimetype: 'audio/ogg; codecs=opus',
        ptt: true
      });

      log.success(`✅ [DESCULPA-AUDIO] Desculpa enviada em áudio!`);

      // 7. Limpar arquivo
      fs.unlinkSync(audioPath);

      // ✅ Limpar status "gravando"
      await sock.sendPresenceUpdate('paused', tel);

    } catch (error) {
      log.error(`❌ [DESCULPA-AUDIO] Erro: ${error.message}`);

      // Fallback: enviar em texto se áudio falhar
      try {
        const desculpaTexto = await this.gerarDesculpaHumana(mensagemCliente, historico, tipoErro);
        await sock.sendMessage(tel, { text: desculpaTexto });
        await sock.sendPresenceUpdate('paused', tel);
        log.warning('⚠️ [DESCULPA-AUDIO] Enviado em texto (fallback)');
      } catch (fallbackError) {
        log.error(`❌ [DESCULPA-AUDIO] Fallback também falhou: ${fallbackError.message}`);
        await sock.sendPresenceUpdate('paused', tel);
      }
    }
  }

  // ← COLE AQUI OS MÉTODOS NOVOS
    // ========== MÉTODOS NOVOS ==========
  setListaOpcoes(tel, veiculos) {
    this.listaOpcoes.set(tel, {
      veiculos: veiculos,
      timestamp: Date.now()
    });
    console.log(`[LISTA] ${veiculos.length} opções salvas`);
  }

  clearListaOpcoes(tel) {
    this.listaOpcoes.delete(tel);
    console.log(`[LISTA] ✅ Lista de opções limpa para ${tel}`);
  }

  // ========== GERENCIAR VEÍCULOS JÁ MOSTRADOS ==========
  /**
   * Salva IDs de veículos que foram mostrados ao cliente
   */
  salvarVeiculosMostrados(tel, veiculosIds) {
    if (!this.veiculosJaMostrados.has(tel)) {
      this.veiculosJaMostrados.set(tel, new Set());
    }
    const setExistente = this.veiculosJaMostrados.get(tel);
    veiculosIds.forEach(id => setExistente.add(id));
    console.log(`[MEMORIA] 💾 ${veiculosIds.length} veículos salvos como já mostrados para ${tel} (total: ${setExistente.size})`);
  }

  /**
   * Retorna Set com IDs de veículos já mostrados ao cliente
   */
  getVeiculosJaMostrados(tel) {
    return this.veiculosJaMostrados.get(tel) || new Set();
  }

  /**
   * Limpa histórico de veículos mostrados (quando cliente muda critério ou nova conversa)
   */
  limparVeiculosMostrados(tel) {
    this.veiculosJaMostrados.delete(tel);
    console.log(`[MEMORIA] 🗑️ Histórico de veículos mostrados limpo para ${tel}`);
  }

  // ========== LIMPAR REGISTRO DE FOTOS ENVIADAS ==========
  clearFotosEnviadas(tel, veiculoId = null) {
    if (veiculoId) {
      // Limpar fotos de um veículo específico
      const chaveFotos = `${tel}_${veiculoId}`;
      this.fotosJaEnviadas.delete(chaveFotos);
      console.log(`[FOTOS] ✅ Registro de fotos limpo para veículo ${veiculoId}`);
    } else {
      // Limpar todas as fotos do cliente
      const chaves = Array.from(this.fotosJaEnviadas.keys());
      chaves.forEach(chave => {
        if (chave.startsWith(`${tel}_`)) {
          this.fotosJaEnviadas.delete(chave);
        }
      });
      console.log(`[FOTOS] ✅ Todos registros de fotos limpos para ${tel}`);
    }
  }

  getListaOpcoes(tel) {
    const lista = this.listaOpcoes.get(tel);
    if (!lista) return null;

    if (Date.now() - lista.timestamp > 600000) return null;

    // ✅ RETORNAR OBJETO COMPLETO (não apenas o array)
    return lista;
  }

  // ← OS MÉTODOS ANTIGOS CONTINUAM AQUI
  getHistorico(tel) { // ← Método que já existe
    if (!this.conversas.has(tel)) {
      this.conversas.set(tel, []);
    }
    return this.conversas.get(tel);
  }

  addHistorico(tel, role, msg) {
    const historico = this.getHistorico(tel);

    historico.push({ role, msg, timestamp: Date.now() });
    if (historico.length > 15) historico.shift();
  }



  // ========== CONSTRUIR URL DE FOTO COM EXTENSÃO CORRETA ==========
  construirURLFoto(filename, tipo = 'galeria') {
    if (!filename) return null;

    // Se já é URL completa, retornar
    if (filename.startsWith('http')) {
      return filename;
    }

    // Remover extensão se existir
    const filenameBase = filename.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '');

    // ✅ PRIORIZAR EXTENSÃO ORIGINAL se detectada
    const extensaoOriginal = filename.match(/\.(jpg|jpeg|png|webp|gif)$/i)?.[1]?.toLowerCase();

    // Montar lista de extensões com prioridade inteligente
    let extensoes = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

    // Se detectou extensão original, colocar ela primeiro
    if (extensaoOriginal && extensoes.includes(extensaoOriginal)) {
      extensoes = [
        extensaoOriginal,
        ...extensoes.filter(ext => ext !== extensaoOriginal)
      ];
      console.log(`[URL-FOTO] 📌 Extensão original detectada: .${extensaoOriginal} (tentando primeiro)`);
    }

    // ✅ CAMINHOS DIFERENTES conforme tipo de foto:
    // - CAPA (tabela cars): /img/car/
    // - GALERIA (tabela car_images): /img/car-gallery/
    const caminho = tipo === 'capa'
      ? 'public/assets/admin/img/car'        // ← Foto de CAPA (lista)
      : 'public/assets/admin/img/car-gallery'; // ← Fotos da GALERIA (detalhes)

    // Retornar array de URLs possíveis (primeira que funcionar será usada)
    return extensoes.map(ext =>
      `${BASE_URL}/${caminho}/${filenameBase}.${ext}`
    );
  }

  // ========== VERIFICAR SE IMAGEM EXISTE (HTTP HEAD) ==========
  async verificarImagemExiste(url) {
    try {
      const response = await fetch(url, { method: 'HEAD', timeout: 3000 });

      // Verificar se é realmente uma imagem
      const contentType = response.headers.get('content-type') || '';
      const isImage = contentType.startsWith('image/');

      // Verificar tamanho (imagens placeholder geralmente são muito pequenas)
      const contentLength = parseInt(response.headers.get('content-length') || '0');
      const isSizeOk = contentLength > 1000; // Maior que 1KB

      console.log(`[VERIF-IMG] ${url.split('/').pop()} - Status: ${response.status}, Type: ${contentType}, Size: ${contentLength}b`);

      return response.ok && isImage && isSizeOk;
    } catch (error) {
      console.log(`[VERIF-IMG] ❌ Erro ao verificar ${url.split('/').pop()}: ${error.message}`);
      return false;
    }
  }

  // ========== ENVIAR FOTOS DO VEÍCULO ESCOLHIDO ==========
async enviarFotosVeiculo(veiculo, tel, sock) {
  log.info(`[FOTOS] Iniciando envio de fotos do ${veiculo.nome}`);
  console.log(`[DEBUG-FOTOS] Dados do veículo:`, {
    id: veiculo.id,
    nome: veiculo.nome,
    foto: veiculo.foto,
    image: veiculo.image
  });

  // ========== ÁUDIO ANTES DE ENVIAR AS FOTOS DO VEÍCULO (GERADO COM IA) ==========
  // ❌ DESABILITADO - Enviar apenas o áudio persuasivo APÓS as fotos
  /*
  const nomeSimplificado = simplificarNomeVeiculo(veiculo.nome, veiculo.ano);

  try {
    log.info('[AUDIO-VEICULO] 🎙️ Gerando mensagem espontânea com IA...');

    // Gerar mensagem espontânea com GPT
    const respostaIA = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'system',
        content: `Você é a Aira, vendedora de carros. Crie UMA frase curta e empolgante (máximo 2 linhas) para introduzir as fotos do veículo que o cliente escolheu.

VEÍCULO: ${nomeSimplificado}

INSTRUÇÕES:
- Seja natural e empolgada
- Mencione que vai enviar as fotos
- Use linguagem informal e calorosa
- NÃO use enumerações ou listas
- Seja ÚNICA (não repita padrões)

EXEMPLOS DE TOM (NÃO copie, apenas siga o tom):
"Olha, esse ${nomeSimplificado} é lindo demais! Vou te mandar as fotos agora pra você ver!"
"Que escolha incrível! Esse ${nomeSimplificado} é uma belezura! Já tô enviando as fotos!"

Sua mensagem:` }],
      temperature: 0.9,
      max_tokens: 100
    });

    const mensagemIA = respostaIA.choices[0].message.content.trim();
    log.info(`[AUDIO-VEICULO] 💬 IA gerou: "${mensagemIA}"`);

    log.info('[AUDIO-VEICULO] 🎙️ Gerando áudio...');
    const audioBuffer = await this.gerarAudio(mensagemIA);

    await sock.sendMessage(tel, {
      audio: audioBuffer,
      mimetype: 'audio/ogg; codecs=opus',
      ptt: true
    });

    log.success('[AUDIO-VEICULO] ✅ Áudio de introdução enviado!');
    await new Promise(r => setTimeout(r, 1500));
  } catch (error) {
    log.warning('[AUDIO-VEICULO] ⚠️ Erro ao gerar mensagem/áudio:', error.message);
    // Fallback: mensagem simples se IA falhar
    const fallback = `Vou te enviar as fotos do ${nomeSimplificado}!`;
    await sock.sendMessage(tel, { text: fallback });
    await new Promise(r => setTimeout(r, 1000));
  }
  */

  try {
    // ❌ NÃO ENVIAR FOTO DE CAPA - Já foi enviada na lista!
    // Pular direto para fotos da galeria (car_images)
    log.info('[FOTOS] ⏭️ Pulando foto de capa (já foi enviada na lista)');

    // ❌ BLOCO DE ENVIO DE FOTO DE CAPA DESATIVADO
    /*
    const caption = `*${veiculo.nome}* ${veiculo.ano}
💰 R$ ${veiculo.preco.toLocaleString('pt-BR')}
🛣️ ${veiculo.km} km
⚙️ ${veiculo.cambio}`;

    if (fotoFilename) {
      console.log(`[DEBUG-FOTOS] 📸 FOTO PRINCIPAL - Filename do banco: "${fotoFilename}"`);
      const urlsPossiveis = this.construirURLFoto(fotoFilename, 'capa'); // ← Foto de CAPA (principal)
      console.log(`[DEBUG-FOTOS] 🔗 URLs que serão tentadas (${urlsPossiveis.length}):`);
      urlsPossiveis.forEach((url, i) => console.log(`   ${i+1}. ${url}`));

      let fotoEnviada = false;
      for (const fotoURL of urlsPossiveis) {
        try {
          console.log(`[DEBUG-FOTOS] ⏳ Tentando enviar: ${fotoURL}`);
          await sock.sendMessage(tel, {
            image: { url: fotoURL },
            caption: caption
          });
          log.success(`[FOTOS] ✅ Foto principal enviada com sucesso: ${fotoURL}`);
          fotoEnviada = true;
          break; // Sucesso, parar de tentar
        } catch (err) {
          console.log(`[DEBUG-FOTOS] ❌ Falhou (${err.message}), tentando próxima extensão...`);
        }
      }

      if (!fotoEnviada) {
        log.warning(`[FOTOS] ⚠️ NENHUMA extensão funcionou! URLs testadas: ${urlsPossiveis.join(', ')}`);

        // Gerar mensagem de desculpa espontânea com IA
        try {
          // ✅ USAR CLAUDE EM VEZ DE OPENAI
          const desculpaIA = await callClaudeInsteadOfOpenAI(this.anthropic, {
            messages: [{
              role: 'system',
              content: `Você é a Aira. A foto do veículo não carregou. Crie UMA frase curta e natural (1 linha) se desculpando e dizendo que vai tentar de novo.

INSTRUÇÕES:
- Seja informal e simpática
- Use expressões naturais ("opa", "eita", "ops")
- Mencione que vai tentar novamente
- NÃO seja robótica

Sua desculpa:`
            }],
            temperature: 0.9,
            max_tokens: 50
          });

          try {
            const audioDesculpa = await this.gerarAudio(desculpaIA);

            // ✅ Salvar em arquivo temporário
            const audioDesculpaPath = path.join(__dirname, `temp_desculpa_foto_${Date.now()}.mp3`);
            fs.writeFileSync(audioDesculpaPath, audioDesculpa);

            // ✅ Mostrar "gravando" antes de enviar
            await sock.sendPresenceUpdate('recording', tel);

            await sock.sendMessage(tel, {
              audio: { url: audioDesculpaPath },
              mimetype: 'audio/ogg; codecs=opus',
              ptt: true
            });

            log.info(`[FOTOS] 🎙️ Áudio de desculpa: "${desculpaIA}"`);
            fs.unlinkSync(audioDesculpaPath);

            // ✅ Limpar status "gravando"
            await sock.sendPresenceUpdate('paused', tel);
          } catch {
            await sock.sendPresenceUpdate('composing', tel);
            await sock.sendMessage(tel, { text: desculpaIA });
            await sock.sendPresenceUpdate('paused', tel);
            log.info(`[FOTOS] 📝 Texto de desculpa: "${desculpaIA}"`);
          }
        } catch (errIA) {
          // ✅ GERAR FALLBACK ESPONTÂNEO (sem mensagens fixas)
          const fallback = await this.gerarMensagemErroEspontanea('foto_nao_carregou', `foto ${i+1} do veículo`);
          await sock.sendMessage(tel, { text: fallback });
          log.warning(`[FOTOS] ⚠️ Fallback espontâneo usado: "${fallback}"`);
        }

        // Esperar um pouco e tentar novamente
        await new Promise(r => setTimeout(r, 1500));

        // Segunda tentativa
        log.info('[FOTOS] 🔄 Tentando enviar foto novamente...');
        for (const fotoURL of urlsPossiveis) {
          try {
            await sock.sendMessage(tel, {
              image: { url: fotoURL },
              caption: caption
            });
            log.success(`[FOTOS] ✅ Foto enviada na segunda tentativa: ${fotoURL}`);
            fotoEnviada = true;
            break;
          } catch (err) {
            console.log(`[DEBUG-FOTOS] ❌ Segunda tentativa falhou (${err.message})`);
          }
        }

        // Se mesmo assim não enviou, enviar só o texto
        if (!fotoEnviada) {
          await sock.sendMessage(tel, { text: caption });
          log.warning('[FOTOS] ⚠️ Enviado apenas texto (foto não disponível)');
        }
      }
    } else {
      log.warning(`[FOTOS] ⚠️ Veículo SEM foto principal no banco (image vazio)!`);

      // Mensagem quando não há foto no banco
      const mensagemSemFoto = [
        'Opa, não tenho foto desse aqui no sistema... Mas posso te passar todos os detalhes!',
        'Eita, esse não tem foto cadastrada aqui... Mas te conto tudo sobre ele!',
        'Caramba, a foto desse não tá no banco... Mas vou te passar as informações!'
      ];

      const msg = mensagemSemFoto[Math.floor(Math.random() * mensagemSemFoto.length)];

      try {
        const audio = await this.gerarAudio(msg);
        await sock.sendMessage(tel, {
          audio: audio,
          mimetype: 'audio/ogg; codecs=opus',
          ptt: true
        });
      } catch {
        await sock.sendMessage(tel, { text: msg });
      }

      // Enviar informações em texto
      await sock.sendMessage(tel, { text: caption });
    }
    */
    // FIM DO BLOCO DESATIVADO

    // Buscar fotos adicionais
    console.log(`\n[DEBUG-FOTOS] 🔍 Buscando fotos adicionais no banco (car_images)...`);
    console.log(`[DEBUG-FOTOS] 🆔 car_id buscado: ${veiculo.id}`);
    console.log(`[DEBUG-FOTOS] 📝 Query: SELECT id, image FROM car_images WHERE car_id = ${veiculo.id} LIMIT 5`);

    // ✅ CORREÇÃO: db.execute() já retorna o array diretamente, não precisa destructuring
    const fotos = await db.execute(
      'SELECT id, image FROM car_images WHERE car_id = ? LIMIT 5',
      [veiculo.id]
    );

    console.log(`[DEBUG-FOTOS] 📊 Fotos encontradas no banco: ${fotos?.length || 0}`);
    if (fotos?.length > 0) {
      console.log(`[DEBUG-FOTOS] 📋 Lista completa de fotos:`, JSON.stringify(fotos, null, 2));
      console.log(`[DEBUG-FOTOS] 📋 Filenames extraídos:`, fotos.map(f => f.image));
    } else {
      console.log(`[DEBUG-FOTOS] ⚠️ NENHUMA foto encontrada na tabela car_images para veículo ID ${veiculo.id}`);
    }

    if (fotos && fotos.length > 0) {
      for (let i = 0; i < Math.min(fotos.length, 5); i++) { // ← SEMPRE 5 FOTOS DA GALERIA
        const foto = fotos[i];
        const fotoFilename = foto.image;

        console.log(`\n[DEBUG-FOTOS] 📸 FOTO ADICIONAL ${i+1}/${fotos.length} - Filename: "${fotoFilename}"`);

        const urlsPossiveis = this.construirURLFoto(fotoFilename, 'galeria'); // ← Fotos da GALERIA
        console.log(`[DEBUG-FOTOS] 🔗 URLs que serão tentadas (${urlsPossiveis.length}):`);
        urlsPossiveis.forEach((url, idx) => console.log(`   ${idx+1}. ${url}`));

        await new Promise(r => setTimeout(r, 800));

        let fotoEnviada = false;
        for (const urlFoto of urlsPossiveis) {
          try {
            // ✅ VERIFICAR SE IMAGEM REALMENTE EXISTE ANTES DE ENVIAR
            const imagemExiste = await this.verificarImagemExiste(urlFoto);

            if (!imagemExiste) {
              console.log(`[DEBUG-FOTOS] ⏭️ Pulando ${urlFoto.split('/').pop()} (não existe ou é placeholder)`);
              continue;
            }

            console.log(`[DEBUG-FOTOS] ⏳ Enviando imagem verificada: ${urlFoto.split('/').pop()}`);
            await sock.sendMessage(tel, {
              image: { url: urlFoto }
            });
            console.log(`[DEBUG-FOTOS] ✅ Foto adicional ${i+1} enviada com sucesso!`);
            fotoEnviada = true;
            break;
          } catch (err) {
            console.log(`[DEBUG-FOTOS] ❌ Falhou (${err.message}), tentando próxima extensão...`);
          }
        }

        if (!fotoEnviada) {
          console.log(`[DEBUG-FOTOS] ⚠️ Foto adicional ${i+1} NÃO pôde ser enviada (todas URLs falharam)`);
        }
      }
      log.success(`[FOTOS] ✓ Fotos da galeria processadas (${Math.min(fotos.length, 5)} de ${fotos.length})`);
    } else {
      log.info(`[FOTOS] ℹ️ Sem fotos adicionais no banco para o veículo ID ${veiculo.id}`);
    }

    // ✅ ÁUDIO PERSUASIVO APÓS FOTOS (com vantagens + pergunta de fechamento)
    // ========== GERAR MENSAGEM PERSUASIVA COM IA ==========
    await new Promise(r => setTimeout(r, 1500));
    
    try {
      const nomeSimplificado = simplificarNomeVeiculo(veiculo.nome, veiculo.ano);

      // Verificar se o veículo está acima do preço solicitado (pegar do histórico se possível)
      const precoSolicitado = veiculo.preco_solicitado || null;
      const acimaDoPreco = precoSolicitado && veiculo.preco > precoSolicitado;

      const promptPersuasivo = `Você é a Aira, vendedora experiente. Crie UMA mensagem persuasiva CURTA (máximo 2-3 linhas) sobre este veículo destacando seus pontos fortes:

📋 INFORMAÇÕES:
- Veículo: ${nomeSimplificado}
- Preço: R$ ${veiculo.preco.toLocaleString('pt-BR')}
- KM: ${veiculo.km}
- Câmbio: ${veiculo.cambio}
- Tipo: ${veiculo.tipo_carroceria || 'N/A'}
${acimaDoPreco ? `\n⚠️ IMPORTANTE: Este veículo está R$ ${(veiculo.preco - precoSolicitado).toLocaleString('pt-BR')} acima do orçamento inicial. DESTAQUE vantagens que JUSTIFICAM pagar um pouco mais (ex: menos km, ano mais novo, economia futura, revenda fácil).` : ''}


⚠️ ESCREVA VALORES POR EXTENSO:
- "cento e cinco mil reais" (não "R$ 105.800")
- "quarenta e sete mil quilômetros" (não "47000 km")


🎯 DIRETRIZES:
- ⛔ NUNCA use termos genéricos como "econômico", "durável", "confiável" sozinhos
- ✅ SEMPRE transforme benefícios em SITUAÇÕES PRÁTICAS do dia a dia
- Seja natural e conversacional (use "olha", "viu", "esse aqui", "e aí", "cara")
- Crie senso de urgência e valor com aplicações reais
- NÃO invente características
- ✅ OBRIGATÓRIO: TERMINE com uma pergunta persuasiva de fechamento

📋 COMO TRANSFORMAR BENEFÍCIOS EM SITUAÇÕES:
❌ "É econômico"
✅ "Você vai economizar muito no combustível, dá pra fazer aquelas viagens sem sentir no bolso!"

❌ "Mantém valor de revenda"
✅ "Quando você quiser trocar, esse aqui vende fácil e você não perde dinheiro!"

❌ "Tem baixa quilometragem"
✅ "Praticamente zero km ainda! Você pega um carro que mal rodou, sem dor de cabeça!"

❌ "É confortável"
✅ "Olha, você vai rodar o dia todo sem cansar! Perfeito pra quem passa tempo na estrada!"

✅ EXEMPLOS COMPLETOS:
"Viu, você vai economizar muito no combustível com esse aqui! Dá pra fazer suas viagens sem sentir no bolso. E aí, quer simular o financiamento?"
"Cara, praticamente zero km ainda! Você pega um carro que mal rodou, vai durar ANOS sem dor de cabeça. Bora fazer uma simulação?"
"Olha, quando você quiser trocar, esse modelo vende FÁCIL! Você não perde dinheiro. Que tal a gente agendar um test drive?"

Sua mensagem persuasiva COM situação prática + pergunta:`;

      let msgAudio;

      // ✅ USAR CLAUDE EM VEZ DE OPENAI
      try {
        log.info('[CLAUDE] Gerando mensagem persuasiva...');

        msgAudio = await callClaudeInsteadOfOpenAI(this.anthropic, {
          messages: [
            {
              role: 'system',
              content: 'Você é Aira, vendedora HUMANA carismática e persuasiva (não um robô!). Seja concisa, natural e focada em benefícios reais. Se perguntarem se você é robô, negue naturalmente.'
            },
            {
              role: 'user',
              content: promptPersuasivo
            }
          ],
          temperature: 0.8,
          max_tokens: 100
        });

        log.success('[CLAUDE] Mensagem gerada');

      } catch (errorClaude) {
        // Se Claude falhar, usar mensagem genérica simples
        log.warning('[CLAUDE] Falhou ao gerar mensagem personalizada, usando fallback simples');

        // ✅ Mensagem genérica mas persuasiva
        const mensagensFallback = [
          `E aí, o que achou desse ${nomeSimplificado}? Quer que eu simule o financiamento pra você?`,
          `Viu? Esse ${nomeSimplificado} é uma ótima opção! Bora fazer uma simulação?`,
          `Olha, esse ${nomeSimplificado} tá impecável! Quer ver as condições de pagamento?`
        ];

        msgAudio = mensagensFallback[Math.floor(Math.random() * mensagensFallback.length)];
        log.info(`[FALLBACK] Mensagem: "${msgAudio}"`);
      }

      // Limpar a mensagem (remover aspas se tiver)
      msgAudio = msgAudio
        .replace(/^["']|["']$/g, '')
        .trim();

      log.info(`[IA] Mensagem: "${msgAudio}"`);

      // ========== ENVIAR COMO ÁUDIO ==========
      try {
        const elevenLabs = new ElevenLabsService();

        // ✅ Formatar texto para TTS
        const msgAudioFormatada = FormatadorFala.prepararParaTTS(msgAudio);
        log.info(`[TTS] Formatado: "${msgAudioFormatada}"`);

        const audioPersuasivo = await elevenLabs.textToSpeech(msgAudioFormatada);

        // ✅ USAR MÉTODO SEGURO para enviar áudio
        await this.enviarAudioSeguro(audioPersuasivo, tel, sock, 'persuasivo');
        log.success('[ÁUDIO] Mensagem persuasiva enviada');

      } catch (audioErr) {
        // Fallback: enviar como texto se áudio falhar
        log.error(`[ÁUDIO] Erro ao enviar: ${audioErr.message}, enviando texto`);
        await sock.sendPresenceUpdate('composing', tel);
        await sock.sendMessage(tel, { text: msgAudio });
        await sock.sendPresenceUpdate('paused', tel);
      }

    } catch (iaError) {
      // ❌ REMOVIDO: Não enviar mensagem de emergência após as fotos
      // O cliente já viu as fotos, não é necessário enviar fallback de erro
      log.error(`[IA] Erro ao gerar mensagem persuasiva: ${iaError.message}`);
      log.warning(`[IA] ⚠️ Áudio persuasivo não foi enviado, mas fotos já foram entregues`);

      // ✅ APENAS LOGAR O ERRO - Não enviar nada para o cliente
      // O fluxo continua normalmente sem mensagem extra
    }

  } catch (err) {
    log.error(`[FOTOS] ERRO GERAL ao enviar fotos: ${err.message}`);
    console.error(`[DEBUG-FOTOS] Stack trace:`, err.stack);

    // ❌ NÃO ENVIAR NENHUM FALLBACK AQUI - O áudio persuasivo já foi enviado acima
    // Se chegou aqui, significa que as fotos podem ter falhado mas o áudio persuasivo já foi enviado
    // Apenas logar o erro sem propagar ou enviar mensagem adicional

    // ✅ NÃO re-lançar o erro para evitar que handlers externos enviem mensagens duplicadas
    // throw err; // ← REMOVIDO
  }

  log.info(`[FOTOS] ✅ Processo de envio de fotos concluído para ${veiculo.nome}`);
}




// ========== ENVIAR LISTA COM FOTOS ==========
async enviarListaComFotos(veiculos, tel, sock, incluir_fotos = false) {
  const qtd = veiculos.length;
  const textoQtd = qtd === 1 ? '1 veículo' : `${qtd} veículos`;
  log.info(`📋 [LISTA-FOTOS] Enviando ${textoQtd} com fotos ${incluir_fotos ? '+ fotos adicionais' : ''}`);

  // ========== ÁUDIO CURTO ANTES DAS FOTOS ==========
  try {
    // ✅ MENSAGEM DIFERENCIADA QUANDO SÓ TEM 1 CARRO NO ESTOQUE
    let textoIntro;
    if (qtd === 1) {
      textoIntro = `Encontrei esse modelo! É o único que temos no estoque no momento. Vou te mostrar! 😊`;
    } else {
      textoIntro = `Encontrei ${qtd} opções perfeitas! Vou mandar as fotos agora 😊`;
    }

    log.info(`[AUDIO-LISTA] 💬 Texto introdutório: "${textoIntro}"`);

    const audioIntro = await this.gerarAudio(textoIntro);

    if (audioIntro) {
      // ✅ USAR MÉTODO SEGURO para enviar áudio
      await this.enviarAudioSeguro(audioIntro, tel, sock, 'intro_lista');
      log.success('[AUDIO-LISTA] ✅ Áudio introdutório enviado');
    }

    await new Promise(r => setTimeout(r, 1000)); // Delay antes das fotos
  } catch (error) {
    log.warning('[AUDIO-LISTA] ⚠️ Erro ao gerar áudio introdutório:', error.message);
    // ✅ Limpar status mesmo em erro
    await sock.sendPresenceUpdate('paused', tel);
    // Continuar mesmo se áudio falhar
    await new Promise(r => setTimeout(r, 500));
  }

  // ✅ IMPORTANTE: Salvar apenas os veículos que serão exibidos (máximo 3)
  const veiculosExibidos = veiculos.slice(0, 3);

  // Enviar cada veículo
  for (let i = 0; i < veiculosExibidos.length; i++) {
    const v = veiculosExibidos[i];

    console.log(`\n========================================`);
    console.log(`[DEBUG-FOTO] 📸 VEÍCULO ${i+1}/${veiculosExibidos.length}`);
    console.log(`[DEBUG-FOTO] Nome completo: "${v.nome}"`);
    console.log(`[DEBUG-FOTO] ID do veículo: ${v.id}`);
    console.log(`[DEBUG-FOTO] Ano: ${v.ano}`);
    console.log(`[DEBUG-FOTO] Preço: R$ ${v.preco}`);
    console.log(`========================================`);

    // Construir URL da foto com DEBUG DETALHADO
    console.log(`\n[DEBUG-FOTO] 🔍 CAMPOS DE FOTO DO BANCO:`);
    console.log(`  - v.foto: "${v.foto}"`);
    console.log(`  - v.image: "${v.image}"`);
    console.log(`  - v.imagem: "${v.imagem}"`);

    const fotoFilename = v.foto || v.image || v.imagem;
    console.log(`\n[DEBUG-FOTO] 📋 Foto escolhida (bruta): "${fotoFilename}"`);

    // Caption formatado com nome simplificado + TODAS as informações
    const nomeSimplificado = simplificarNomeVeiculo(v.nome, v.ano);
    const caption = `${i + 1}. *${nomeSimplificado}*

💰 *R$ ${v.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}*

📋 *Informações:*
📅 Ano: ${v.ano || 'N/A'}
🛣️ KM: ${v.km ? v.km.toLocaleString('pt-BR') : 'A consultar'}
⚙️ Câmbio: ${v.cambio || 'A consultar'}
⛽ Combustível: ${v.combustivel || 'A consultar'}${v.cor ? `
🎨 Cor: ${v.cor}` : ''}

👉 Digite *"${i + 1}"* para ver mais detalhes e simular financiamento!`;

    console.log(`\n[DEBUG-FOTO] 📝 Caption preparado:`);
    console.log(caption);

    // Enviar foto com legenda (tentando todas as extensões)
    if (fotoFilename) {
      console.log(`\n[DEBUG-FOTO] 📸 VEÍCULO ${i+1} - Filename do banco: "${fotoFilename}"`);
      const urlsPossiveis = this.construirURLFoto(fotoFilename, 'capa'); // ← Foto de CAPA (lista)
      console.log(`[DEBUG-FOTO] 🔗 URLs que serão tentadas (${urlsPossiveis.length}):`);
      urlsPossiveis.forEach((url, idx) => console.log(`   ${idx+1}. ${url}`));

      let fotoEnviada = false;
      for (const fotoURL of urlsPossiveis) {
        try {
          // ✅ VERIFICAR SE IMAGEM REALMENTE EXISTE ANTES DE ENVIAR
          const imagemExiste = await this.verificarImagemExiste(fotoURL);

          if (!imagemExiste) {
            console.log(`[DEBUG-FOTO] ⏭️ Pulando ${fotoURL.split('/').pop()} (não existe ou é placeholder)`);
            continue;
          }

          console.log(`[DEBUG-FOTO] ⏳ Enviando imagem verificada: ${fotoURL.split('/').pop()}`);
          await sock.sendMessage(tel, {
            image: { url: fotoURL },
            caption
          });

          console.log(`[DEBUG-FOTO] ✅ FOTO ENVIADA COM SUCESSO!`);
          log.success(`[LISTA-FOTOS] ✓ Veículo ${i+1} enviado: ${nomeSimplificado}`);
          fotoEnviada = true;
          break;
        } catch (errorFoto) {
          console.log(`[DEBUG-FOTO] ❌ Falhou (${errorFoto.message}), tentando próxima extensão...`);
        }
      }

      if (!fotoEnviada) {
        console.log(`[DEBUG-FOTO] ⚠️ NENHUMA extensão funcionou! URLs testadas: ${urlsPossiveis.join(', ')}`);

        // Gerar desculpa espontânea com IA
        try {
          // ✅ USAR CLAUDE EM VEZ DE OPENAI
          const desculpaIA = await callClaudeInsteadOfOpenAI(this.anthropic, {
            messages: [{
              role: 'system',
              content: `Você é a Aira. A foto não carregou. Crie UMA frase curta (1 linha) se desculpando e dizendo que vai tentar de novo.

INSTRUÇÕES:
- Seja informal ("opa", "eita", "ops")
- Mencione que vai tentar novamente
- Seja natural

Sua desculpa:`
            }],
            temperature: 0.9,
            max_tokens: 40
          });

          try {
            const audioDesculpa = await this.gerarAudio(desculpaIA);

            // ✅ Salvar em arquivo temporário
            const audioDesculpaPath = path.join(__dirname, `temp_desculpa_foto2_${Date.now()}.mp3`);
            fs.writeFileSync(audioDesculpaPath, audioDesculpa);

            // ✅ Mostrar "gravando" antes de enviar
            await sock.sendPresenceUpdate('recording', tel);

            await sock.sendMessage(tel, {
              audio: { url: audioDesculpaPath },
              mimetype: 'audio/ogg; codecs=opus',
              ptt: true
            });

            console.log(`[DEBUG-FOTO] 🎙️ Áudio: "${desculpaIA}"`);
            fs.unlinkSync(audioDesculpaPath);

            // ✅ Limpar status "gravando"
            await sock.sendPresenceUpdate('paused', tel);

          } catch {
            await sock.sendPresenceUpdate('composing', tel);
            await sock.sendMessage(tel, { text: desculpaIA });
            await sock.sendPresenceUpdate('paused', tel);
            console.log(`[DEBUG-FOTO] 📝 Texto: "${desculpaIA}"`);
          }
        } catch (errIA) {
          // ✅ GERAR FALLBACK ESPONTÂNEO (sem mensagens fixas)
          const fallback = await this.gerarMensagemErroEspontanea('foto_nao_carregou', `foto ${i+1} da lista`);
          await sock.sendMessage(tel, { text: fallback });
          console.log(`[DEBUG-FOTO] ⚠️ Fallback espontâneo: "${fallback}"`);
        }

        // Esperar um pouco e tentar novamente
        await new Promise(r => setTimeout(r, 1500));

        // Segunda tentativa
        console.log('[DEBUG-FOTO] 🔄 Tentando enviar foto novamente...');
        for (const fotoURL of urlsPossiveis) {
          try {
            await sock.sendMessage(tel, {
              image: { url: fotoURL },
              caption: caption
            });
            console.log(`[DEBUG-FOTO] ✅ Foto enviada na segunda tentativa: ${fotoURL}`);
            log.success(`[LISTA-FOTOS] ✓ Veículo ${i+1} enviado na segunda tentativa: ${nomeSimplificado}`);
            fotoEnviada = true;
            break;
          } catch (err) {
            console.log(`[DEBUG-FOTO] ❌ Segunda tentativa falhou (${err.message})`);
          }
        }

        // Se mesmo assim não enviou, enviar só o texto
        if (!fotoEnviada) {
          console.log(`[DEBUG-FOTO] 📝 Enviando apenas texto (foto não disponível)...`);
          await sock.sendMessage(tel, { text: caption });
          log.warning(`[LISTA-FOTOS] ⚠️ Veículo ${i+1} enviado sem foto: ${nomeSimplificado}`);
        }
      }

      // ========== BUSCAR E ENVIAR FOTOS ADICIONAIS (SE incluir_fotos = true) ==========
      if (incluir_fotos && fotoEnviada) {
        console.log(`\n[DEBUG-FOTOS-ADICIONAIS] 🔍 Buscando fotos adicionais do veículo ID: ${v.id}`);

        try {
          // ✅ CORREÇÃO: db.execute() já retorna o array diretamente, não precisa destructuring
          const fotosAdicionais = await db.execute(
            'SELECT id, image FROM car_images WHERE car_id = ? LIMIT 5',
            [v.id]
          );

          console.log(`[DEBUG-FOTOS-ADICIONAIS] 📊 Encontradas ${fotosAdicionais?.length || 0} fotos adicionais`);

          if (fotosAdicionais && fotosAdicionais.length > 0) {
            for (let j = 0; j < Math.min(fotosAdicionais.length, 4); j++) {
              const fotoAdicional = fotosAdicionais[j];
              const fotoAdicionalFilename = fotoAdicional.image;

              console.log(`[DEBUG-FOTOS-ADICIONAIS] 📸 Foto adicional ${j+1}/${fotosAdicionais.length}: "${fotoAdicionalFilename}"`);

              const urlsAdicionaisPossiveis = this.construirURLFoto(fotoAdicionalFilename);

              let fotoAdicionalEnviada = false;
              for (const urlFotoAdicional of urlsAdicionaisPossiveis) {
                try {
                  await new Promise(r => setTimeout(r, 800)); // Delay entre fotos
                  await sock.sendMessage(tel, {
                    image: { url: urlFotoAdicional }
                  });
                  console.log(`[DEBUG-FOTOS-ADICIONAIS] ✅ Foto adicional ${j+1} enviada: ${urlFotoAdicional}`);
                  log.success(`[LISTA-FOTOS] ✓ Foto adicional ${j+1} do veículo ${i+1} enviada`);
                  fotoAdicionalEnviada = true;
                  break;
                } catch (err) {
                  console.log(`[DEBUG-FOTOS-ADICIONAIS] ❌ Falhou (${err.message}), tentando próxima extensão...`);
                }
              }

              if (!fotoAdicionalEnviada) {
                console.log(`[DEBUG-FOTOS-ADICIONAIS] ⚠️ Não foi possível enviar foto adicional ${j+1}`);
              }
            }
            log.success(`[LISTA-FOTOS] ✓ ${Math.min(fotosAdicionais.length, 4)} fotos adicionais enviadas do veículo ${i+1}`);
          } else {
            console.log(`[DEBUG-FOTOS-ADICIONAIS] ℹ️ Nenhuma foto adicional encontrada para este veículo`);
          }
        } catch (error) {
          console.error(`[DEBUG-FOTOS-ADICIONAIS] ❌ Erro ao buscar fotos adicionais:`, error);
          log.warning(`[LISTA-FOTOS] ⚠️ Erro ao buscar fotos adicionais do veículo ${i+1}`);
        }
      }
    } else {
      console.log(`[DEBUG-FOTO] ⚠️ Veículo ${i+1} SEM FOTO no banco (image vazio)!`);

      // Gerar mensagem espontânea quando não há foto
      try {
        // ✅ USAR CLAUDE EM VEZ DE OPENAI
        const mensagemSemFotoIA = await callClaudeInsteadOfOpenAI(this.anthropic, {
          messages: [{
            role: 'system',
            content: `Você é a Aira. Este veículo não tem foto cadastrada. Crie UMA frase curta (1 linha) se desculpando mas oferecendo passar os detalhes.

INSTRUÇÕES:
- Seja informal e simpática
- Reconheça que não tem foto
- Ofereça passar as informações
- Use expressões naturais

EXEMPLO DE TOM (NÃO copie):
"Opa, esse tá sem foto ainda... Mas vou te passar todos os detalhes!"

Sua mensagem:`
          }],
          temperature: 0.9,
          max_tokens: 50
        });

        try {
          const audioDesculpa = await this.gerarAudio(mensagemSemFotoIA);

          // ✅ Salvar em arquivo temporário
          const audioDesculpaPath = path.join(__dirname, `temp_sem_foto_${Date.now()}.mp3`);
          fs.writeFileSync(audioDesculpaPath, audioDesculpa);

          // ✅ Mostrar "gravando" antes de enviar
          await sock.sendPresenceUpdate('recording', tel);

          await sock.sendMessage(tel, {
            audio: { url: audioDesculpaPath },
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true
          });

          console.log(`[DEBUG-FOTO] 🎙️ Áudio: "${mensagemSemFotoIA}"`);
          fs.unlinkSync(audioDesculpaPath);

          // ✅ Limpar status "gravando"
          await sock.sendPresenceUpdate('paused', tel);

        } catch {
          await sock.sendPresenceUpdate('composing', tel);
          await sock.sendMessage(tel, { text: mensagemSemFotoIA });
          await sock.sendPresenceUpdate('paused', tel);
          console.log(`[DEBUG-FOTO] 📝 Texto: "${mensagemSemFotoIA}"`);
        }
      } catch (errIA) {
        // ✅ GERAR FALLBACK ESPONTÂNEO (sem mensagens fixas)
        const fallback = await this.gerarMensagemErroEspontanea('foto_nao_existe', `veículo ID ${veiculo.id}`);
        await sock.sendMessage(tel, { text: fallback });
        console.log(`[DEBUG-FOTO] ⚠️ Fallback espontâneo: "${fallback}"`);
      }

      await new Promise(r => setTimeout(r, 800));
      await sock.sendMessage(tel, { text: caption });
      log.warning(`[LISTA-FOTOS] ⚠️ Veículo ${i+1} sem foto no banco: ${nomeSimplificado}`);
    }

    // Delay entre veículos
    if (i < veiculosExibidos.length - 1) {
      console.log(`\n[DEBUG-FOTO] ⏳ Aguardando 1.2s antes do próximo veículo...\n`);
      await new Promise(r => setTimeout(r, 1200));
    }
  }

  // Salvar lista para seleção posterior (APENAS OS VEÍCULOS EXIBIDOS!)
this.setListaOpcoes(tel, veiculosExibidos);

// ✅ MARCAR QUE LISTA FOI ENVIADA (para bloquear nova busca automática)
if (!this.listaEnviada) {
  this.listaEnviada = new Map();
}
this.listaEnviada.set(tel, true);
log.info(`📋 Flag 'listaEnviada' marcada para ${tel} - Não enviará nova lista automaticamente`);

// ========== SE FOR APENAS 1 VEÍCULO, SALVAR AUTOMATICAMENTE COMO INTERESSE ==========
if (veiculosExibidos.length === 1) {
  this.veiculoInteresse.set(tel, veiculosExibidos[0]);
  log.info(`🚗 Veículo único salvo automaticamente como interesse: ${veiculosExibidos[0].nome}`);
}

// ========== ÁUDIO CURTO DE FECHAMENTO ==========
// ❌ DESABILITADO - A IA já envia um áudio espontâneo e personalizado após a lista
// Este áudio estava duplicando a mensagem (áudio genérico + áudio da IA)
/*
await new Promise(r => setTimeout(r, 1000)); // Delay após as fotos

try {
  const ehSingular = qtd === 1;
  const textoFechamento = ehSingular ? 'Qual você achou desse?' : 'Qual desses chamou sua atenção?';

  log.info(`[AUDIO-FECHAMENTO] 💬 Texto: "${textoFechamento}"`);

  const audioFechamento = await this.gerarAudio(textoFechamento);

  if (audioFechamento) {
    // ✅ USAR MÉTODO SEGURO para enviar áudio
    await this.enviarAudioSeguro(audioFechamento, tel, sock, 'fechamento');
    log.success('[AUDIO-FECHAMENTO] ✅ Áudio de fechamento enviado');
  } else {
    // Fallback: enviar como texto
    await sock.sendPresenceUpdate('composing', tel);
    await new Promise(r => setTimeout(r, 100));
    await sock.sendMessage(tel, { text: textoFechamento });
    await sock.sendPresenceUpdate('paused', tel);
  }

} catch (error) {
  log.error(`[AUDIO-FECHAMENTO] ⚠️ Erro: ${error.message}`);
  // Fallback: enviar texto simples
  try {
    const fallbackMsg = qtd === 1 ? "Esse te interessou? 😊" : "Qual desses te interessou? 😊";
    await sock.sendMessage(tel, { text: fallbackMsg });
    await sock.sendPresenceUpdate('paused', tel);
  } catch {
    log.error('[AUDIO-FECHAMENTO] ❌ Erro até no fallback');
    await sock.sendPresenceUpdate('paused', tel);
  }
}
*/

log.success('[LISTA-FOTOS] Enviada com sucesso');
}



  async processar(tel, msg, sock, nome = 'amigo') {
    try {
      console.log('\n==========================================');
      console.log('📱 NOVA MENSAGEM RECEBIDA');
      console.log('Telefone:', tel);
      console.log('Mensagem:', msg);
      console.log('Etapa atual:', this.etapas.get(tel) || 'INICIAL');
      console.log('==========================================\n');

      const agora = Date.now();
      const proximoPermitido = this.ultimoEnvio.get(tel) || 0;

      if (agora < proximoPermitido) {
        log.info('Muito rápido, ignorando');
        return null;
      }

      this.ultimoEnvio.set(tel, agora + 3000);

      const msgLower = msg.toLowerCase().trim();
      const etapaAtual = this.etapas.get(tel) || 'INICIO';
      const jaSeApresentou = this.jaSeApresentou.get(tel) || false;
      
      // ========== SAUDAÇÃO INICIAL (APENAS NA PRIMEIRA VEZ) ==========
if (etapaAtual === 'INICIO' && msgLower.match(/^(oi|ola|olá|hey|fala|bom dia|boa tarde|boa noite)$/i)) {
  this.etapas.set(tel, 'DESCOBERTA');
  this.jaSeApresentou.set(tel, true);

  // ✨ GERAR SAUDAÇÃO ÚNICA E HUMANA COM IA
  log.info('✨ Gerando saudação personalizada com IA...');
  const resp = await this.gerarRespostaHumana('saudacao', {
    nome: nome,
    mensagem: msg
  });

  this.addHistorico(tel, 'Cliente', msg);
  this.addHistorico(tel, 'Aira', resp);
  return resp;
}

      // ========== DETECTAR PEDIDO DE FOTOS DO VEÍCULO DE INTERESSE ==========
      const veiculoInteresse = this.veiculoInteresse.get(tel);

      // Detecção MAIS RESTRITIVA de pedido de fotos (evitar false positives)
      const pedidoFotos =
        // 1. Padrões EXPLÍCITOS com "foto/imagem" + verbo de requisição
        /\b(quero|queria|pode|manda|envia|envie|mande)\s+(ver\s+)?(as\s+|a\s+|outra?s?\s+|mais\s+)?(foto|imagem|imagens|fotos)/i.test(msg) ||
        // 2. "foto/imagem dele/dela/desse/dessa" (mais específico)
        /\b(foto|fotos|imagem|imagens)\s+(dele|dela|desse|dessa|deste|desta|do\s+carro)\b/i.test(msg) ||
        // 3. Apenas "foto(s)" ou "imagem(ns)" ISOLADO (não no meio da frase)
        /^(foto|fotos|imagem|imagens)\s*[.!?]?\s*$/i.test(msg) ||
        // 4. "tem foto?" específico (com interrogação ou "tem" explícito)
        /\b(tem|possui|há)\s+(foto|fotos|imagem|imagens)(\?|\s+\?|\s+dele|\s+desse|\s+do\s+carro)/i.test(msg);

      if (veiculoInteresse && pedidoFotos) {
        // ✅ VERIFICAR SE FOTOS JÁ FORAM ENVIADAS PARA ESTE VEÍCULO
        const chaveFotos = `${tel}_${veiculoInteresse.id}`;
        const jaEnviou = this.fotosJaEnviadas.get(chaveFotos);

        if (jaEnviou) {
          log.info(`📸 Fotos do ${veiculoInteresse.nome} JÁ foram enviadas. Ignorando pedido duplicado.`);
          // Não retornar null, deixar a IA responder normalmente
        } else {
          log.info(`📸 Cliente pediu fotos do veículo de interesse: ${veiculoInteresse.nome}`);

          // Enviar fotos do veículo de interesse
          log.info('📸 Enviando fotos do veículo de interesse...');

          try {
            await this.enviarFotosVeiculo(veiculoInteresse, tel, sock);
            log.success(`✓ Fotos do ${veiculoInteresse.nome} enviadas`);

            // ✅ MARCAR FOTOS COMO ENVIADAS
            this.fotosJaEnviadas.set(chaveFotos, Date.now());

            // ✅ LIMPAR LISTA DE OPÇÕES após enviar fotos
            // Evita que o bot continue tentando fazer match com a lista antiga
            this.clearListaOpcoes(tel);
          } catch (err) {
            log.error(`❌ Erro ao enviar fotos: ${err.message}`);
          }

          this.addHistorico(tel, 'Cliente', msg);
          this.addHistorico(tel, 'Aira', `[Enviou fotos do ${veiculoInteresse.nome}]`);

          // ✅ RETORNAR STRING VAZIA para indicar sucesso (não retornar null!)
          // Null dispara envio de mensagem de erro
          return '';
        }
      }

      // ========== VERIFICAR SE CLIENTE ESTÁ PEDINDO NOVAMENTE UM CARRO DA LISTA ==========
      const listaObj = this.getListaOpcoes(tel);
      const lista = listaObj ? listaObj.veiculos : null;

      // ✅ DETECTAR SE CLIENTE PEDIU NOVAMENTE UM MODELO QUE JÁ ESTÁ NA LISTA
      if (lista && lista.length > 0 && veiculoInteresse) {
        const modeloPedido = msg.toLowerCase();
        const modeloAtual = (veiculoInteresse.nome || '').toLowerCase();

        // Verificar se está pedindo o mesmo modelo
        const pedindoMesmoModelo =
          modeloAtual.split(' ').some(palavra =>
            palavra.length > 3 && modeloPedido.includes(palavra)
          );

        if (pedindoMesmoModelo) {
          log.info(`🔄 Cliente pediu novamente ${veiculoInteresse.nome} que já foi mostrado na lista`);

          // Verificar se fotos já foram enviadas
          const chaveFotos = `${tel}_${veiculoInteresse.id}`;
          const fotosJaEnviadas = this.fotosJaEnviadas.get(chaveFotos);

          if (fotosJaEnviadas) {
            // Já enviou fotos, perguntar se quer mais informações
            log.info(`✅ Fotos de ${veiculoInteresse.nome} já foram enviadas, oferecendo mais informações`);

            // NÃO adicionar ao histórico ainda, vai deixar o fluxo normal da IA responder
            // A IA vai detectar pelo contexto que já foi enviado
          } else {
            // Ainda não enviou fotos, oferecer enviar
            log.info(`📸 Oferecendo enviar fotos de ${veiculoInteresse.nome}`);

            try {
              await this.enviarFotosVeiculo(veiculoInteresse, tel, sock);
              log.success(`✓ Fotos do ${veiculoInteresse.nome} enviadas`);

              this.fotosJaEnviadas.set(chaveFotos, Date.now());
              this.clearListaOpcoes(tel);

              this.addHistorico(tel, 'Cliente', msg);
              this.addHistorico(tel, 'Aira', `[Enviou fotos do ${veiculoInteresse.nome}]`);

              return '';
            } catch (err) {
              log.error(`❌ Erro ao enviar fotos: ${err.message}`);
            }
          }
        }
      }

      // ← DETECÇÃO DE ESCOLHA DE VEÍCULO (mais restritiva)
      if (lista && lista.length > 0) {
        let veiculoEscolhido = null;

        // Primeiro: verificar se é um número (1, 2, 3)
        const numeroMatch = msg.match(/^([123])$/);
        if (numeroMatch) {
          const indice = parseInt(numeroMatch[1]) - 1;
          veiculoEscolhido = lista[indice];
        }

        // Segundo: verificar se menciona marca/modelo específico COM palavras-chave de interesse
        if (!veiculoEscolhido) {
          const palavrasInteresse = /\b(quero|gostei|adorei|escolho|esse|este|essa|esta|mostrar?|mostra|ver|fotos?|me\s+mostra|envia|manda)\b/i;

          // Só busca match se houver palavra de interesse
          if (palavrasInteresse.test(msg)) {
            // ✅ Extrair todas as palavras (incluindo números como 2008, 208, etc)
            const palavrasCliente = msgLower.split(/\s+/).filter(p => p.length >= 2); // Aceita palavras com 2+ caracteres

            // ✅ Também extrair números isolados que podem ser modelos (208, 2008, 3008, etc)
            const numerosModelo = msg.match(/\b(\d{3,4})\b/g) || [];

            // ✅ DETECTAR COR na mensagem
            const coresComuns = {
              'preto': ['preto', 'preta', 'black'],
              'branco': ['branco', 'branca', 'white'],
              'prata': ['prata', 'silver', 'cinza'],
              'vermelho': ['vermelho', 'vermelha', 'red'],
              'azul': ['azul', 'blue'],
              'verde': ['verde', 'green'],
              'amarelo': ['amarelo', 'amarela', 'yellow'],
              'dourado': ['dourado', 'dourada', 'gold'],
              'marrom': ['marrom', 'brown'],
              'roxo': ['roxo', 'roxa', 'purple'],
              'laranja': ['laranja', 'orange'],
              'bege': ['bege', 'beige']
            };

            let corMencionada = null;
            for (const [corBase, variacoes] of Object.entries(coresComuns)) {
              if (variacoes.some(v => msgLower.includes(v))) {
                corMencionada = corBase;
                break;
              }
            }

            console.log(`🔍 [DEBUG-VEICULO] Palavras cliente:`, palavrasCliente);
            console.log(`🔍 [DEBUG-VEICULO] Números modelo:`, numerosModelo);
            console.log(`🔍 [DEBUG-VEICULO] Cor mencionada:`, corMencionada || 'nenhuma');

            // ✅ SISTEMA DE PONTUAÇÃO para escolher o melhor match
            let melhorMatch = null;
            let melhorPontuacao = 0;

            for (const veiculo of lista) {
              const nomeVeiculo = (veiculo.nome || '').toLowerCase();
              const marcaVeiculo = (veiculo.marca || '').toLowerCase();
              const anoVeiculo = (veiculo.ano || '').toString();
              const corVeiculo = (veiculo.cor || '').toLowerCase();

              let pontuacao = 0;

              // ✅ PONTOS por palavras que fazem match
              const matchesPalavras = palavrasCliente.filter(palavra =>
                nomeVeiculo.includes(palavra) ||
                marcaVeiculo.includes(palavra)
              );
              pontuacao += matchesPalavras.length * 10; // 10 pontos por palavra

              // ✅ PONTOS por número de modelo (muito importante!)
              const matchNumero = numerosModelo.some(numero => nomeVeiculo.includes(numero));
              if (matchNumero) {
                pontuacao += 30; // 30 pontos por número de modelo
              }

              // ✅ PONTOS por ano mencionado
              const matchAno = palavrasCliente.includes(anoVeiculo);
              if (matchAno) {
                pontuacao += 15; // 15 pontos por ano
              }

              // ✅ PONTOS EXTRAS por cor mencionada (DECISIVO em caso de empate!)
              if (corMencionada && corVeiculo.includes(corMencionada)) {
                pontuacao += 50; // 50 pontos extras por cor correta!
                console.log(`✅ [DEBUG-VEICULO] Cor match! ${veiculo.nome} (${corVeiculo}) +50 pts`);
              }

              // ✅ Se tem pontuação, é candidato
              if (pontuacao > 0) {
                console.log(`🔍 [DEBUG-VEICULO] ${veiculo.nome} - Pontuação: ${pontuacao}`);
                if (pontuacao > melhorPontuacao) {
                  melhorPontuacao = pontuacao;
                  melhorMatch = veiculo;
                }
              }
            }

            if (melhorMatch) {
              console.log(`✅ [DEBUG-VEICULO] Melhor match: ${melhorMatch.nome} (${melhorPontuacao} pts)`);
              veiculoEscolhido = melhorMatch;
            }

            // ✅ FALLBACK: Se não encontrou mas tem palavra-chave, tentar busca fuzzy
            if (!veiculoEscolhido && palavrasCliente.length > 0) {
              const palavraChave = palavrasCliente.find(p =>
                p !== 'me' && p !== 'mostra' && p !== 'ver' && p !== 'quero' && p.length > 2
              );

              if (palavraChave) {
                for (const veiculo of lista) {
                  const nomeVeiculo = (veiculo.nome || '').toLowerCase();

                  // Busca parcial mais permissiva
                  if (nomeVeiculo.includes(palavraChave) || palavraChave.includes(nomeVeiculo.split(' ')[0])) {
                    console.log(`✅ [DEBUG-VEICULO] Match fuzzy: ${veiculo.nome} via "${palavraChave}"`);
                    veiculoEscolhido = veiculo;
                    break;
                  }
                }
              }
            }
          }
        }
        
        if (veiculoEscolhido) {
        log.info(`Cliente escolheu: ${veiculoEscolhido.nome}`);

        // ✅ ADICIONE ESTA LINHA:
        this.veiculoInteresse.set(tel, veiculoEscolhido);

        // ❌ REMOVIDO: Não enviar mensagem de texto de introdução
        // Ir direto para as fotos com áudio persuasivo
        log.info('📸 Enviando fotos do veículo escolhido...');

        // Enviar fotos - AGUARDAR COMPLETAR
        try {
          await this.enviarFotosVeiculo(veiculoEscolhido, tel, sock);
          log.success(`✓ Todas as fotos do ${veiculoEscolhido.nome} foram enviadas`);

          // ✅ MARCAR FOTOS COMO ENVIADAS
          const chaveFotos = `${tel}_${veiculoEscolhido.id}`;
          this.fotosJaEnviadas.set(chaveFotos, Date.now());

          // ✅ LIMPAR LISTA DE OPÇÕES após enviar fotos do veículo escolhido
          // Isso evita que o bot continue tentando fazer match com a lista antiga
          this.clearListaOpcoes(tel);
        } catch (err) {
          log.error(`❌ Erro ao enviar fotos: ${err.message}`);
        }

        this.addHistorico(tel, 'Cliente', msg);
        this.addHistorico(tel, 'Aira', `[Enviou fotos do ${veiculoEscolhido.nome}]`);

        // ✅ RETORNAR STRING VAZIA para indicar sucesso (não retornar null!)
        // Null dispara envio de mensagem de erro
        return '';
      }
    }



      const historico = this.getHistorico(tel);

log.info(`📥 ${nome} (${etapaAtual}): "${msg}"`);

// ========== DETECTAR FRASES DE INTERESSE FORTE ==========
const frasesInteresse = [
  /vamos comprar/i,
  /quero esse/i,
  /quero este/i,
  /quero ela/i,
  /quero ele/i,
  /fechado/i,
  /fechar negócio/i,
  /top essa/i,
  /top esse/i,
  /gostei desse/i,
  /gostei deste/i,
  /gostei dela/i,
  /gostei dele/i,
  /me interessa/i,
  /tenho interesse/i,
  /vou levar/i,
  /pode separar/i
];

const demonstrouInteresse = frasesInteresse.some(regex => regex.test(msg));

if (demonstrouInteresse) {
  const veiculoAtual = this.veiculoInteresse.get(tel);
  if (veiculoAtual) {
    log.success(`💚 Cliente demonstrou INTERESSE FORTE no ${veiculoAtual.nome}! Mantendo em memória.`);
    // Reforçar que este é o veículo de interesse
    this.veiculoInteresse.set(tel, veiculoAtual);
  } else {
    log.warning(`⚠️ Cliente demonstrou interesse mas não há veículo em memória`);
  }
}

// ========== INICIALIZAR CONTEXTO ==========
let contextoAdicional = `

📌 REGRA GERAL IMPORTANTE:
- Se o cliente perguntar algo FORA DO CONTEXTO DE VENDA (Instagram, telefone, horário, onde fica, etc):
  ✅ RESPONDA de forma breve e natural
  ✅ VOLTE para a venda sutilmente
  ✅ Seja conversacional e persuasiva
  ❌ NUNCA diga "não entendi", "não posso responder", "não sei"

EXEMPLOS:
Cliente: "você tem Instagram?"
Você: "Tenho sim! Mas aqui no WhatsApp consigo te ajudar melhor! 😊 E aí, qual carro te interessou?"

Cliente: "qual seu telefone?"
Você: "Pode me chamar aqui mesmo pelo WhatsApp que respondo rapidinho! Vamos ver os carros? O que procura?"

Cliente: "onde fica a loja?"
Você: "Estamos aqui no Feirão Show Car! Mas antes de vir, deixa eu te mostrar alguns modelos pra você já vir sabendo qual quer ver! Beleza?"
`;

// ✅ ADICIONAR CONTEXTO SOBRE VEÍCULO DE INTERESSE (SE HOUVER)
const veiculoAtualInteresse = this.veiculoInteresse.get(tel);
if (veiculoAtualInteresse) {
  const chaveFotos = `${tel}_${veiculoAtualInteresse.id}`;
  const fotosForamEnviadas = this.fotosJaEnviadas.get(chaveFotos);

  if (fotosForamEnviadas) {
    contextoAdicional += `\n\n📌 VEÍCULO DE INTERESSE DO CLIENTE:
O cliente já visualizou e recebeu fotos do: ${veiculoAtualInteresse.nome}

⚠️ SE CLIENTE PEDIR NOVAMENTE ESTE MODELO:
- NÃO mostre a lista novamente
- NÃO envie fotos novamente (já foram enviadas)
- Confirme que já mostrou e pergunte se quer: simulação de financiamento, mais detalhes técnicos, ou agendar visita
- Exemplo: "Sim! Já te mostrei o ${veiculoAtualInteresse.nome.split(' ').slice(0, 2).join(' ')}! Quer que eu simule um financiamento? Ou prefere agendar uma visita?"
`;
  }
}

// ========== VALIDAR SE É PRIMEIRA INTERAÇÃO ==========
const ehPrimeiraMensagem = historico.length === 0 || !jaSeApresentou;

// Detectar se cliente já está pedindo veículo na primeira mensagem
const msgLowerInicial = msg.toLowerCase();
const pedindoVeiculoPrimeiraMensagem = ehPrimeiraMensagem && (
  /\b(procuro|quero|busco|preciso|tenho interesse|gostaria|me mostra|tem)\b.*(carro|veículo|veiculo|auto|pickup|picape|suv|sedan|hatch)/i.test(msg) ||
  /\b(gol|civic|corolla|onix|hb20|sandero|ka|uno|palio|fiesta|fox|voyage|prisma|celta|argo|mobi|kwid|duster|kicks|creta|tucson|sportage|hr-v|hrv|compass|hillux|hilux|s10|ranger|toro|strada|saveiro|montana|spin|cobalt|cruze|tracker|taos|nivus|t-cross|tcross|renegade|jeep|toyota|honda|chevrolet|gm|fiat|volkswagen|vw|ford|hyundai|nissan|renault|peugeot|citroen)/i.test(msgLowerInicial)
);

if (ehPrimeiraMensagem) {
  this.jaSeApresentou.set(tel, true);

  // ✅ ANALISAR INTENÇÃO DA PRIMEIRA MENSAGEM PARA RESPOSTA CONTEXTUAL
  const msgLower = msg.toLowerCase();

  const temSaudacao = /\b(oi|olá|ola|bom dia|boa tarde|boa noite|e ai|eai)\b/i.test(msg);
  const temPerguntaPreco = /\bquanto (custa|é|ta|vale|sai)/i.test(msgLower) || /\bpreço|valor\b/i.test(msgLower);
  const temPerguntaEstoque = /\b(tem|têm|possui|vende|trabalha com)\b/i.test(msgLower);
  const temInteresseModelo = /\b(gol|civic|corolla|onix|hb20|sandero|ka|uno|compass|hilux|s10|ranger)/i.test(msgLower);
  const temVeiculoEntrada = /\btenho um.*?(carro|veículo|veiculo)\b/i.test(msgLower) || /\bdar de entrada\b/i.test(msgLower);
  const temPerguntaLocal = /\b(onde|endereço|localização|fica|fica a loja)\b/i.test(msgLower);
  const temPerguntaFinanciamento = /\b(financ|parcela|entrada)\b/i.test(msgLower);

  if (pedindoVeiculoPrimeiraMensagem) {
    // Cliente chegou pedindo veículo específico
    contextoAdicional += `\n\n⚠️ PRIMEIRA MENSAGEM + CLIENTE PEDINDO VEÍCULO!

🎯 RESPONDA DE FORMA CONTEXTUAL:
- Cumprimente brevemente
- Mencione "Feirão Show Car"
- Diga "Prazer, sou a Aira"
- RECONHEÇA ESPECIFICAMENTE o que ele pediu
- Mostre empolgação e confirme que vai buscar
- Seja DIRETA e NATURAL

💡 Exemplos baseados no contexto:
- Se pediu "quero um civic": "Olá! Prazer, sou a Aira da Feirão Show Car! Civic é ótima escolha! Deixa eu buscar os que temos!"
- Se pediu "tem gol?": "Oi! Prazer, me chamo Aira da Feirão Show Car! Temos sim, vários Gol! Vou te mostrar!"
- Se pediu "procuro suv": "Olá! Prazer, sou a Aira da Feirão Show Car! SUV é top! Temos vários modelos, já te mostro!"`;

  } else if (temVeiculoEntrada) {
    contextoAdicional += `\n\n⚠️ PRIMEIRA MENSAGEM + VEÍCULO DE ENTRADA!

🎯 RESPONDA CONTEXTUALMENTE:
- Cumprimente com entusiasmo
- Mencione "Feirão Show Car"
- Diga "Prazer, sou a Aira"
- Mostre INTERESSE no veículo dele
- Pergunte modelo/ano (se não informou)

💡 Exemplo: "Olá! Prazer, sou a Aira da Feirão Show Car! Que legal que você tem carro pra trocar! Qual modelo e ano é o seu?"`;

  } else if (temPerguntaPreco) {
    contextoAdicional += `\n\n⚠️ PRIMEIRA MENSAGEM + PERGUNTA DE PREÇO!

🎯 RESPONDA CONTEXTUALMENTE:
- Cumprimente
- Mencione "Feirão Show Car"
- Diga "Prazer, sou a Aira"
- Explique que tem várias faixas
- Pergunte o orçamento dele

💡 Exemplo: "Olá! Prazer, sou a Aira da Feirão Show Car! Temos carros de várias faixas! Qual seria seu orçamento? Assim te mostro opções certinhas!"`;

  } else if (temPerguntaLocal) {
    contextoAdicional += `\n\n⚠️ PRIMEIRA MENSAGEM + PERGUNTA DE LOCAL!

🎯 RESPONDA CONTEXTUALMENTE:
- Cumprimente
- Mencione "Feirão Show Car"
- Diga "Prazer, sou a Aira"
- REDIRECIONE para mostrar estoque antes

💡 Exemplo: "Olá! Prazer, sou a Aira da Feirão Show Car! Antes de vir, deixa eu te mostrar nosso estoque? Assim você já vem sabendo qual quer ver!"`;

  } else if (temSaudacao && !temInteresseModelo) {
    contextoAdicional += `\n\n⚠️ PRIMEIRA MENSAGEM + SAUDAÇÃO SIMPLES!

🎯 RESPONDA CONTEXTUALMENTE:
- Retorne a saudação
- Mencione "Feirão Show Car"
- Diga "Prazer, sou a Aira"
- Pergunte NATURALMENTE o que trouxe ele

💡 Exemplo: "Oi! Prazer, me chamo Aira da Feirão Show Car! Tudo bem? O que te trouxe aqui? Tá buscando algum modelo?"`;

  } else {
    contextoAdicional += `\n\n⚠️ PRIMEIRA MENSAGEM - SEJA CONTEXTUAL!

🎯 ANALISE o que o cliente disse e responda ESPECIFICAMENTE:
- Mencione "Feirão Show Car"
- Diga "Prazer, sou a Aira"
- Responda de acordo com o contexto dele
- NÃO use resposta genérica!`;
  }
} else {
  contextoAdicional += `\n\n📋 CONTEXTO DA CONVERSA:`;
  historico.slice(-3).forEach(h => {
    contextoAdicional += `\n${h.role}: "${h.msg}"`;
  });
  contextoAdicional += `\n\n⚠️ Continue a conversa naturalmente.`;
}

// ========== CONTEXTO POR ETAPA ==========
if (jaSeApresentou && !ehPrimeiraMensagem) {
  contextoAdicional += `\n\nIMPORTANTE: Você JÁ se apresentou. NÃO repita.`;
}


// ========== DETECTAR CONFIRMAÇÃO DE HORÁRIO PARA VISITA ==========
const padraoHorario = /\b(\d{1,2})(h|:|\s*hora)/i;
const confirmacoes = ['pode ser', 'confirmo', 'tá bom', 'ta bom', 'ok', 'fechado', 'combinado', 'certo', 'beleza', 'perfeito', 'amanhã', 'hoje', 'depois', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'sabado', 'domingo', 'segunda'];
const temHorario = padraoHorario.test(msgLower);
const temConfirmacao = confirmacoes.some(palavra => msgLower.includes(palavra));

// Se cliente confirmou horário específico de visita/test drive
let agendamentoConfirmadoAgora = false;
if ((temHorario && temConfirmacao) || (temHorario && msg.length < 20)) {
  log.info('✅ Cliente CONFIRMOU HORÁRIO de visita! Venda fechada!');
  this.etapas.set(tel, 'AGENDAMENTO_CONFIRMADO');
  agendamentoConfirmadoAgora = true;
}

// ⚠️ CRÍTICO: Re-capturar etapa APÓS detecção de agendamento
const etapaAtualFinal = this.etapas.get(tel) || etapaAtual;

switch(etapaAtualFinal) {
  case 'DESCOBERTA':
    contextoAdicional += `\n\nETAPA: DESCOBERTA - Pergunte sobre necessidade`;
    break;
  case 'APRESENTACAO':
    contextoAdicional += `\n\nETAPA: APRESENTAÇÃO - Liste 3 carros`;
    break;
  case 'APROFUNDAMENTO':
    contextoAdicional += `\n\nETAPA: APROFUNDAMENTO - Detalhes`;
    break;
  case 'FECHAMENTO':
    contextoAdicional += `\n\nETAPA: FECHAMENTO - Test drive`;
    break;
  case 'AGENDAMENTO_CONFIRMADO':
    contextoAdicional += `\n\n✅✅✅ ETAPA: AGENDAMENTO CONFIRMADO - VENDA FECHADA! ✅✅✅

⚠️ CRÍTICO: Cliente CONFIRMOU o horário da visita/test drive!

🚫 REGRA ABSOLUTA - NÃO BUSCAR MAIS VEÍCULOS:
❌ NUNCA use a função buscar_carros novamente
❌ NUNCA mostre outros veículos
❌ NUNCA envie fotos de outros carros
❌ Se cliente mencionar outros modelos, responda com COERÊNCIA sobre o veículo que ele JÁ ESCOLHEU

💡 SE CLIENTE MENCIONAR OUTROS VEÍCULOS APÓS FECHAR:
- Lembre gentilmente o veículo que ele escolheu: "${this.veiculoInteresse.get(tel)?.nome || 'o veículo'}"
- Reforce que ele já tem horário marcado para ver esse carro
- Seja natural: "Você já tá com horário marcado pro [modelo] amanhã! Vai adorar quando ver pessoalmente 😊"

VOCÊ DEVE:
✅ Confirmar o horário com entusiasmo ("Perfeito! Amanhã às 15h está ótimo!")
✅ Dizer que vai aguardá-lo(a) ("Vou te aguardar aqui no Feirão Show Car")
✅ Ficar à disposição ("Qualquer coisa antes, só me chamar!")
✅ Despedir-se positivamente ("Até amanhã!")
✅ Se perguntar de outro carro, lembre o que JÁ foi escolhido

VOCÊ NÃO DEVE:
❌ NÃO busque ou mostre outros veículos (VENDA JÁ FECHADA!)
❌ NÃO use buscar_carros
❌ NÃO envie fotos de outros carros
❌ NÃO continue vendendo ou oferecendo coisas
❌ NÃO pergunte "tem algum modelo específico que quer ver?"

EXEMPLO CORRETO:
"Perfeito, ${nome}! Amanhã às 15h está ótimo! 😊
Vou te aguardar aqui no Feirão Show Car.
Qualquer coisa antes disso, é só me chamar! Até amanhã!"`;
    break;
}

// ⚠️ SUPER CRÍTICO: Se agendamento foi confirmado AGORA (nesta mensagem)
if (agendamentoConfirmadoAgora) {
  contextoAdicional += `

🎉🎉🎉 ATENÇÃO MÁXIMA! CLIENTE ACABOU DE CONFIRMAR O HORÁRIO AGORA! 🎉🎉🎉

⚠️ ESTA É A MENSAGEM MAIS IMPORTANTE DA CONVERSA!

VOCÊ DEVE:
✅ Confirmar o horário com ENTUSIASMO ("Perfeito! [horário] está ótimo!")
✅ Dizer que vai aguardá-lo(a) no Feirão Show Car
✅ Ficar à disposição ("Qualquer coisa antes, só me chamar!")
✅ Despedir-se POSITIVAMENTE ("Até [dia]!" ou "Te espero aqui!")

VOCÊ NÃO DEVE:
❌ NÃO continue a conversa
❌ NÃO faça mais perguntas sobre veículos
❌ NÃO ofereça nada
❌ NÃO busque carros
❌ NÃO pergunte "tem algum modelo que quer ver?"

ESTA É A ÚLTIMA MENSAGEM DO FUNIL! ENCERRE COM CLASSE!

FORMATO IDEAL:
"[Confirmação entusiasmada do horário] + [Aguardo no Feirão Show Car] + [Disponibilidade] + [Despedida positiva]"

EXEMPLO:
"Perfeito, ${nome}! [Horário que ele mencionou] está ótimo! 😊
Vou te aguardar aqui no Feirão Show Car.
Qualquer coisa antes disso, é só me chamar! Até [dia]!"`;
}





// ========== DETECTAR ENTRADA EM DINHEIRO (ANTES DE TROCA) ==========
const entradaDinheiro = this.detectarEntradaDinheiro(msg);
if (entradaDinheiro) {
  const valorEntrada = this.extrairValorEntradaDinheiro(msg);
  log.info(`💰 Cliente mencionou entrada em DINHEIRO: R$ ${valorEntrada ? valorEntrada.toLocaleString('pt-BR') : 'não identificado'}`);

  // Adicionar contexto para IA saber
  contextoAdicional += `

💰 INFORMAÇÃO IMPORTANTE: Cliente mencionou entrada em DINHEIRO!
${valorEntrada ? `Valor: R$ ${valorEntrada.toLocaleString('pt-BR')}` : 'Valor não identificado claramente'}

⚠️ ISSO NÃO É TROCA DE VEÍCULO! É DINHEIRO EM ESPÉCIE/TRANSFERÊNCIA!

INSTRUÇÕES:
✅ Reconheça a entrada em dinheiro positivamente
✅ Se não entendeu o valor exato, confirme: "Você disse ${valorEntrada ? (valorEntrada/1000) + ' mil' : 'quanto'} de entrada, certo?"
✅ Use essa informação para buscar veículos dentro do orçamento dele
✅ Mencione que com essa entrada as parcelas ficam menores

EXEMPLO:
"Ótimo! Com ${valorEntrada ? (valorEntrada/1000) + ' mil' : 'essa entrada'} de entrada as parcelas ficam bem tranquilas! Vou buscar as melhores opções pra você! Qual faixa de preço total tá pensando?"`;
}

// ========== DETECTAR INTERESSE EM TROCA ==========
if (this.detectarIntencaoTroca(msg) && !entradaDinheiro) {
  log.info('🔄 Cliente demonstrou interesse em troca');

  // ✅ PRIMEIRO: Tentar extrair dados do veículo JÁ FORNECIDOS na mensagem
  const dadosExtraidos = this.extrairDadosVeiculo(msg);

  if (dadosExtraidos.modelo && dadosExtraidos.ano) {
    // ✅ Cliente JÁ passou modelo + ano! Consultar FIPE imediatamente
    log.info(`📋 Dados da troca EXTRAÍDOS na primeira mensagem: ${JSON.stringify(dadosExtraidos)}`);

    this.veiculoTroca.set(tel, dadosExtraidos);
    this.etapas.set(tel, 'TROCA');

    // Consultar valor FIPE
    const valorFipe = await this.consultarFIPE(dadosExtraidos.modelo, dadosExtraidos.ano);

    if (valorFipe) {
      dadosExtraidos.valorFipe = valorFipe;
      this.veiculoTroca.set(tel, dadosExtraidos);

      const resposta = `Perfeito! Vi aqui que você tem um ${dadosExtraidos.modelo.toUpperCase()} ${dadosExtraidos.ano} 🚗\n\nConsultei na Tabela FIPE e o valor médio dele é de *${this.formatarMoeda(valorFipe)}*.\n\nEsse valor pode ser usado como entrada! Quer que eu busque os carros do estoque que cabem no seu orçamento? 😊`;

      this.addHistorico(tel, 'Cliente', msg);
      this.addHistorico(tel, 'Aira', resposta);

      return resposta;
    } else {
      // Não conseguiu consultar FIPE, pedir mais detalhes
      const resposta = `Entendi! Você tem um ${dadosExtraidos.modelo.toUpperCase()} ${dadosExtraidos.ano}! 🚗\n\nPra eu avaliar certinho, me conta: qual a versão dele? Por exemplo: 1.0, 1.6, automático, manual...`;

      this.addHistorico(tel, 'Cliente', msg);
      this.addHistorico(tel, 'Aira', resposta);

      return resposta;
    }
  } else {
    // ❌ Não conseguiu extrair dados completos, perguntar
    log.info('✨ Gerando resposta de troca personalizada com IA...');
    const resposta = await this.gerarRespostaHumana('troca', {
      mensagem: msg
    });

    this.addHistorico(tel, 'Cliente', msg);
    this.addHistorico(tel, 'Aira', resposta);
    this.etapas.set(tel, 'TROCA');

    return resposta;
  }
}


// ========== DETECTAR DADOS DO VEÍCULO DE TROCA (se ainda não completo) ==========
if (this.etapas.get(tel) === 'TROCA') {
  const dadosAtuais = this.veiculoTroca.get(tel) || {};

  // Se JÁ tem modelo + ano + valor FIPE, pular
  if (dadosAtuais.modelo && dadosAtuais.ano && dadosAtuais.valorFipe) {
    log.info('✅ Dados da troca já completos, continuando fluxo...');
  } else {
    // Tentar extrair novos dados
    const dadosExtraidos = this.extrairDadosVeiculo(msg);

    if (dadosExtraidos.modelo || dadosExtraidos.ano || dadosExtraidos.km) {
      // Mesclar com dados existentes
      const dadosMesclados = { ...dadosAtuais, ...dadosExtraidos };
      this.veiculoTroca.set(tel, dadosMesclados);

      log.info(`📋 Dados da troca atualizados: ${JSON.stringify(dadosMesclados)}`);

      // Se agora tem modelo E ano, consultar FIPE
      if (dadosMesclados.modelo && dadosMesclados.ano && !dadosMesclados.valorFipe) {
        const valorFipe = await this.consultarFIPE(dadosMesclados.modelo, dadosMesclados.ano);

        if (valorFipe) {
          dadosMesclados.valorFipe = valorFipe;
          this.veiculoTroca.set(tel, dadosMesclados);
          this.etapas.set(tel, 'NEGOCIACAO');
        }
      }
    }
  }
}


switch(etapaAtual) {
  case 'DESCOBERTA':
    contextoAdicional += `\n\nETAPA: DESCOBERTA - Pergunte sobre necessidade`;
    break;
  case 'APRESENTACAO':
    contextoAdicional += `\n\nETAPA: APRESENTAÇÃO - Liste 3 carros`;
    break;
  case 'TROCA': // ← ADICIONE ISSO
    contextoAdicional += `\n\nETAPA: TROCA - Cliente quer usar carro como entrada. Pergunte: marca, modelo, ano, estado, km. NÃO mostre carros do estoque.`;
    break;
  case 'APROFUNDAMENTO':
    contextoAdicional += `\n\nETAPA: APROFUNDAMENTO - Detalhes`;
    break;
  case 'FECHAMENTO':
    contextoAdicional += `\n\nETAPA: FECHAMENTO - Test drive`;
    break;
}

// ✅ ADICIONAR INFORMAÇÕES DO VEÍCULO DE TROCA (se disponível)
const dadosTrocaGPT = this.veiculoTroca.get(tel);
if (dadosTrocaGPT && dadosTrocaGPT.modelo && dadosTrocaGPT.ano) {
  contextoAdicional += `\n\n🚗 VEÍCULO DE ENTRADA DO CLIENTE:`;
  contextoAdicional += `\n   Modelo: ${dadosTrocaGPT.modelo.toUpperCase()} ${dadosTrocaGPT.ano}`;

  if (dadosTrocaGPT.valorFipe) {
    contextoAdicional += `\n   Valor FIPE: R$ ${this.formatarMoeda(dadosTrocaGPT.valorFipe)}`;
    contextoAdicional += `\n   ✅ Este valor será usado automaticamente como entrada no financiamento!`;
    contextoAdicional += `\n   💡 Quando simular financiamento, mencione que o ${dadosTrocaGPT.modelo} dele vai ser a entrada.`;
  }

  if (dadosTrocaGPT.km) {
    contextoAdicional += `\n   Quilometragem: ${dadosTrocaGPT.km} km`;
  }
}

// ✅ DETECTAR RISADAS DO CLIENTE
const temRisada = /\b(k{2,}|rs{2,}|ha{2,}|he{2,}|hi{2,}|ho{2,}|kkk+|rsrs+|haha+|hehe+|hihi+|hoho+|keke+)\b/i.test(msg);
if (temRisada) {
  contextoAdicional += `\n\n😂 CLIENTE ESTÁ RINDO!`;
  contextoAdicional += `\n⚠️ RIA JUNTO! Use "kkkkk", "hahaha", "rsrsrs" de forma natural na sua resposta.`;
  contextoAdicional += `\n💡 Isso cria conexão emocional e mostra que você está sintonizada com ele!`;
}

// ✅ DETECTAR INTENÇÃO DE VISITAR A LOJA
const temVisitaLoja = /\b(vou (aí|ai|lá|la)|pass[oa]r (aí|ai|lá|la)|ir (aí|ai|lá|la)|aparecer|visitar|de manhã|de tarde|amanhã|hoje|daqui a pouco)\b/i.test(msg);
if (temVisitaLoja) {
  contextoAdicional += `\n\n☕ CLIENTE MENCIONOU VISITAR A LOJA!`;
  contextoAdicional += `\n⚠️ OFEREÇA CAFEZINHO! Use a estratégia do café de forma acolhedora e natural.`;
  contextoAdicional += `\n💡 Exemplos: "Vem que a gente toma um cafezinho!", "Passa aqui que preparo um café pra gente!", "Tomo um café com você enquanto vê os carros!"`;
}

// ========== PROCESSAR COM GPT ==========
// Se for primeira mensagem + pedindo veículo, NÃO usar funções (só cumprimentar)
const usarFuncoes = !pedindoVeiculoPrimeiraMensagem;

const resultado = await this.motorGPT.processarComFuncoes(
  msg,
  historico,
  etapaAtual,
  contextoAdicional,
  this,
  tel,
  sock,
  usarFuncoes // Passa false se for cumprimento inicial
);

// ✅ VERIFICAÇÃO SE LISTA FOI ENVIADA
if (resultado.lista_enviada) {
    log.success('✅ Lista com fotos já enviada pelo enviarListaComFotos, bloqueando texto');
    this.addHistorico(tel, 'Cliente', msg);
    this.addHistorico(tel, 'Aira', '[Lista com fotos enviada via buscar_carros]');
    return null; // ← BLOQUEIA O ENVIO DE TEXTO
}

let respostaFinal = String(resultado.resposta)
        .replace(/\[object Object\]/g, '')
        .replace(/undefined/g, '')
        .trim();

      // ========== VALIDAÇÃO PÓS-GPT: REMOVER APRESENTAÇÕES DUPLICADAS ==========
      if (jaSeApresentou) {
        // Lista de frases proibidas após primeira apresentação
        const frasesProibidas = [
          /sou a Aira/i,
          /feirão showcar/i,
          /como posso ajudar/i,
          /em que posso ajudar/i,
          /posso te ajudar/i
        ];

        // Se detectar alguma frase proibida, limpar
        frasesProibidas.forEach(regex => {
          if (regex.test(respostaFinal)) {
            log.error(`⚠️ GPT tentou repetir apresentação! Removendo...`);
            
            // Remover a linha inteira que contém a frase proibida
            respostaFinal = respostaFinal
              .split('\n')
              .filter(linha => !regex.test(linha))
              .join('\n')
              .trim();
          }
        });

        // Se removeu tudo e ficou vazio, chamar GPT novamente com instrução específica
        if (!respostaFinal) {
          log.warning('⚠️ Resposta ficou vazia após limpeza, gerando nova resposta...');

          const historico = this.getHistorico(tel);
          const promptRecuperacao = `Você é Aira, vendedora REAL e HUMANA do Feirão Showcar há 15 anos.

⚠️ SITUAÇÃO ESPECIAL:
O cliente disse: "${msg}"

Você JÁ se apresentou antes, então NÃO repita sua apresentação.

INSTRUÇÃO:
1. Leia o que o cliente disse
2. Responda de forma natural e coerente
3. Se for pergunta pessoal (Instagram, telefone, etc), responda brevemente e volte para a venda
4. Se for sobre veículos, ajude diretamente
5. SEMPRE seja conversacional e persuasiva

EXEMPLOS:

Cliente: "você tem Instagram?"
Aira: "Tenho sim! Mas aqui no WhatsApp consigo te ajudar melhor e mais rápido! 😊 E aí, já decidiu qual carro quer conhecer?"

Cliente: "qual seu horário?"
Aira: "Estou aqui todos os dias das 8h às 18h! Mas se quiser, posso te atender agora mesmo pelo WhatsApp. Vamos ver os carros?"

Cliente: "onde fica a loja?"
Aira: "Estamos na [endereço]. Mas antes de vir, que tal eu te mostrar alguns modelos que temos? Assim você já vem sabendo qual quer ver! O que acha?"

Sua resposta natural (máximo 3 linhas):`;

          const messages = [
            { role: 'system', content: promptRecuperacao },
            ...historico.slice(-5).map(h => ({ role: h.role === 'Cliente' ? 'user' : 'assistant', content: h.msg })),
            { role: 'user', content: msg }
          ];

          // ✅ USAR CLAUDE EM VEZ DE OPENAI
          respostaFinal = await callClaudeInsteadOfOpenAI(this.anthropic, {
            messages: messages,
            temperature: 0.8,
            max_tokens: 200
          });

          log.info(`✅ Nova resposta gerada: "${respostaFinal}"`);
        }
      }

      this.addHistorico(tel, 'Cliente', msg);
      this.addHistorico(tel, 'Aira', respostaFinal);

      log.success(`Funções: ${resultado.funcoes_chamadas?.join(', ') || 'nenhuma'}`);

      // ========== BUSCAR VEÍCULOS AUTOMATICAMENTE (se foi cumprimento inicial) ==========
      if (pedindoVeiculoPrimeiraMensagem) {
        log.info('🚗 Cumprimento enviado! Buscando veículos automaticamente...');

        return {
          resposta: respostaFinal,
          buscar_veiculos_automaticamente: true,
          mensagem_original: msg  // Passar a mensagem original para extrair critérios
        };
      }

      // ========== ENVIAR PERGUNTA SOBRE DOCUMENTAÇÃO (se foi financiamento) ==========
      if (resultado.enviar_pergunta_documentacao) {
        log.info('📄 Financiamento detectado! Gerando pergunta sobre documentação...');

        try {
          // Gerar pergunta personalizada com IA
          const perguntaDoc = await this.gerarRespostaHumana('pergunta_documentacao', {
            mensagem_anterior: respostaFinal
          });

          // Adicionar ao histórico
          this.addHistorico(tel, 'Aira', perguntaDoc);

          // Retornar objeto com resposta e mensagem adicional
          return {
            resposta: respostaFinal,
            mensagem_adicional: perguntaDoc,
            delay_adicional: 2500 // aguardar 2.5s antes de enviar
          };
        } catch (docError) {
          // ✅ FALLBACK: Se IA falhar, usar pergunta padrão simples
          log.warning(`[DOC] Erro ao gerar pergunta personalizada: ${docError.message}, usando fallback`);

          const perguntaFallback = "Você já tem tudo certo da documentação aí? 😊";
          this.addHistorico(tel, 'Aira', perguntaFallback);

          return {
            resposta: respostaFinal,
            mensagem_adicional: perguntaFallback,
            delay_adicional: 2500
          };
        }
      }

      return respostaFinal;

    } catch (error) {
    console.error('❌ ERRO NA CHAMADA OPENAI:');
    console.error('Mensagem:', error.message);
    console.error('Status:', error.status);
    console.error('Detalhes:', error.response?.data);
    throw error;
  }
}
}


// =====================================================
// WHATSAPP
// =====================================================
async function conectar() {
  console.log('\n🔌 Iniciando conexão WhatsApp...');

  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
  const { version } = await fetchLatestBaileysVersion();

  console.log('📱 Versão Baileys:', version.join('.'));
  console.log('🔑 Credenciais carregadas:', !!state.creds);
  console.log('🔐 Keys carregadas:', Object.keys(state.keys).length);

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
    browser: ['Bot Aira v10.0', 'Chrome', '10.0'],
    markOnlineOnConnect: true,
  });

  console.log('✅ Socket WhatsApp criado com sucesso\n');

  // ========== WRAPPER SEGURO PARA ENVIO DE MENSAGENS ==========
  // Adicionado em: 2025-01-13 por Helix AI Developer
  // Propósito: Interceptar todas as mensagens e adicionar tracking/retry/rate-limit
  const originalSendMessage = sock.sendMessage.bind(sock);

  sock.sendMessage = async function(jid, content, options = {}) {
    // Se options.skipTracking === true, usa método original (para casos especiais)
    if (options.skipTracking) {
      delete options.skipTracking;
      return originalSendMessage(jid, content, options);
    }

    // Determinar tipo de mensagem
    let messageType = 'unknown';
    if (content.text) messageType = 'text';
    else if (content.image) messageType = 'image';
    else if (content.audio) messageType = 'audio';
    else if (content.video) messageType = 'video';
    else if (content.document) messageType = 'document';

    // Usar messageTracker para envio seguro
    // Criar proxy do sock que usa o método original
    const sockProxy = {
      ...sock,
      sendMessage: originalSendMessage,
      user: sock.user
    };

    const result = await messageTracker.sendWithTracking(
      sockProxy,
      jid,
      content,
      messageType,
      {
        onSuccess: (res) => {
          console.log(`✅ [WRAPPER] Mensagem ${messageType} enviada para ${jid}`);
        },
        onError: (err) => {
          console.error(`❌ [WRAPPER] Falha ao enviar ${messageType} para ${jid}:`, err.message);
        }
      }
    );

    // Retornar resultado no formato esperado pelo Baileys
    return result.success ? result.result : Promise.reject(new Error(result.error));
  };

  // Adicionar método de verificação de conexão
  sock.isConnected = function() {
    return sock.user && sock.ws && sock.ws.readyState === 1; // WebSocket.OPEN = 1
  };

  // Wrapper para sendPresenceUpdate (também pode falhar silenciosamente)
  const originalSendPresenceUpdate = sock.sendPresenceUpdate.bind(sock);
  sock.sendPresenceUpdate = async function(type, jid) {
    try {
      if (!sock.isConnected()) {
        console.warn(`⚠️ [PRESENCE] Socket desconectado, ignorando presence update: ${type}`);
        return;
      }
      return await originalSendPresenceUpdate(type, jid);
    } catch (error) {
      console.warn(`⚠️ [PRESENCE] Erro ao enviar presence update (${type}):`, error.message);
      // Não propagar erro - presence update é não-crítico
    }
  };

  console.log('✅ Wrapper de envio com tracking ativado\n');

  const repo = new VeiculosRepository();
  const lucas = new LucasVendedor(repo);

  await repo.buscarVeiculos();

  // ✅ INICIALIZAR GERENCIADOR DE AGENDAMENTOS
  if (db && sock) {
    gerenciadorAgendamentos = new GerenciadorAgendamentos(db, sock);
    console.log('✅ [AGENDAMENTOS] Gerenciador de agendamentos inicializado');
  }


  sock.ev.on('connection.update', async (update) => {
  const { connection, lastDisconnect, qr } = update;

  // Log completo do update para debug
  console.log('\n🔄 [DEBUG] Connection Update:', JSON.stringify({
    connection,
    hasQR: !!qr,
    hasError: !!lastDisconnect?.error,
    errorMsg: lastDisconnect?.error?.message,
    statusCode: lastDisconnect?.error?.output?.statusCode
  }, null, 2));

  if (qr) {
    console.log('\n📱 QR CODE\n');
    qrcode.generate(qr, { small: true });
  }

  if (connection === 'close') {
    const shouldReconnect = (lastDisconnect?.error instanceof Boom)
      && lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut;

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('❌ CONEXÃO WHATSAPP FECHADA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Erro:', lastDisconnect?.error?.message || 'Desconhecido');
    console.log('📊 Status Code:', lastDisconnect?.error?.output?.statusCode || 'N/A');
    console.log('📊 Tipo do erro:', lastDisconnect?.error?.name || 'N/A');
    console.log('📊 Deve reconectar?', shouldReconnect);
    console.log('📊 Stack trace:', lastDisconnect?.error?.stack);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (shouldReconnect) {
      console.log('🔄 Reconectando em 3 segundos...');
      setTimeout(conectar, 3000);
    } else {
      console.log('🛑 Não foi possível reconectar. Sessão pode estar expirada.');
      console.log('💡 Solução: Delete a pasta auth_info_baileys e leia o QR Code novamente.');
    }
  } else if (connection === 'open') {
    console.log('\n✅ BOT CONECTADO\n');

    // Inicializar integração com backend Flask (OPCIONAL)
    const myNumber = sock.user?.id;
    if (myNumber) {
      try {
        const initialized = await botAdapter.initialize(myNumber);
        if (initialized) {
          console.log('✅ Integração com backend Flask ativa');
        } else {
          console.log('ℹ️  Integração com backend Flask não disponível (continuando sem ela)');
        }
      } catch (error) {
        console.log('ℹ️  Backend Flask não disponível, bot funcionará no modo standalone');
      }
    }
  }
});
  
  sock.ev.on('creds.update', saveCreds);
  
 let ultimoMsgID = null;

sock.ev.on('messages.upsert', async ({ messages, type }) => {
  console.log('\n🔵 ========== NOVA MENSAGEM ==========');
  console.log('📊 Type:', type);
  console.log('📊 Total de mensagens:', messages.length);
  console.log('📊 Mensagens:', JSON.stringify(messages, null, 2));
  console.log('=====================================\n');

  if (type !== 'notify') {
    console.log('⚠️ Type não é notify, ignorando');
    return;
  }

  // ✅ PROCESSAMENTO PARALELO: Todas as mensagens são processadas simultaneamente
  const processingPromises = messages.map(async (msg) => {
    try {
      console.log('\n--- [DEBUG] Processando nova mensagem ---');

      if (!msg.message) {
        console.log('⚠️ [DEBUG] Mensagem sem conteúdo');
        return; // Mudado de continue para return (dentro de map)
      }

      if (msg.key.fromMe) {
        console.log('⚠️ [DEBUG] Mensagem enviada por mim, ignorando');
        return; // Mudado de continue para return
      }

      console.log('✅ [DEBUG] Mensagem válida para processar');

      if (ultimoMsgID && msg.key.id === ultimoMsgID) {
        log.info('⚠️ Mensagem repetida ignorada');
        return; // Mudado de continue para return
      }
      ultimoMsgID = msg.key.id;

      // Pegar o número real (pode vir como @lid ou @s.whatsapp.net)
      let tel = msg.key.remoteJid;

    // Se vier com @lid, usar o senderPn que tem o número real
    if (tel.includes('@lid') && msg.key.senderPn) {
      tel = msg.key.senderPn;
      console.log(`📱 [DEBUG] Número LID detectado, usando senderPn: ${tel}`);
    }

    const nome = (msg.pushName || 'amigo').split(' ')[0];

    console.log(`📱 [DEBUG] Tel final: ${tel}`);
    console.log(`👤 [DEBUG] Nome: ${nome}`);

    // ========== 🔒 VERIFICAÇÃO DE WHITELIST (MODO TESTE) ==========
    if (!numeroEstaAutorizado(tel)) {
      console.log(`🚫 [WHITELIST] Ignorando mensagem de número não autorizado: ${tel}`);
      console.log(`🔒 [WHITELIST] MODO_TESTE=${MODO_TESTE}, Número limpo: ${tel.split('@')[0]}`);
      return; // Mudado de continue para return
    }
    console.log(`✅ [WHITELIST] Número autorizado: ${tel.split('@')[0]}`);
    // ========== FIM DA VERIFICAÇÃO ==========

    // ========== COMANDO ESPECIAL: ESTATÍSTICAS DE ENVIO ==========
    const mensagemTexto = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';

    if (mensagemTexto.toLowerCase().trim() === '/stats' || mensagemTexto.toLowerCase().trim() === '/estatisticas') {
      console.log('📊 [STATS] Comando de estatísticas recebido');

      const stats = messageTracker.getStats();
      const statsMessage = `📊 *ESTATÍSTICAS DE ENVIO*\n\n` +
        `📨 Total de envios: ${stats.total}\n` +
        `✅ Sucessos: ${stats.sucessos}\n` +
        `❌ Falhas: ${stats.falhas}\n` +
        `📈 Taxa de sucesso: ${stats.taxaSucesso}\n\n` +
        `💾 Logs completos em: bot_engine/logs/envios.log`;

      await sock.sendMessage(tel, { text: statsMessage });
      console.log('✅ [STATS] Estatísticas enviadas');
      return; // Mudado de continue para return
    }

    // Comando para limpar logs antigos
    if (mensagemTexto.toLowerCase().trim() === '/cleanlogs') {
      console.log('🧹 [STATS] Comando de limpeza de logs recebido');
      messageTracker.cleanOldLogs(7);
      await sock.sendMessage(tel, { text: '🧹 Logs antigos (>7 dias) limpos com sucesso!' });
      return; // Mudado de continue para return
    }
    // ========== FIM DOS COMANDOS ESPECIAIS ==========

    // ========== PROCESSAR ÁUDIO COM ELEVENLABS AGENT ==========
if (msg.message?.audioMessage) {
  try {
    log.info(`🎤 ${nome} enviou áudio`);
    
    const buffer = await downloadMediaMessage(
      msg,
      'buffer',
      {},
      {
        logger: pino({ level: 'silent' }),
        reuploadRequest: sock.updateMediaMessage
      }
    );

    await sock.sendPresenceUpdate('recording', tel);
    
    // ========== TENTAR USAR AGENT ELEVENLABS PRIMEIRO ==========
    try {
      log.info('[AGENT] Processando áudio com ElevenLabs Agent...');
      
      const audioResposta = await lucas.agentElevenLabs.enviarAudio(tel, buffer);
      
      const audioPath = path.join(__dirname, `temp_agent_resposta_${Date.now()}.mp3`);
      fs.writeFileSync(audioPath, audioResposta);


      await sock.sendMessage(tel, {
        audio: { url: audioPath },
        mimetype: 'audio/ogg; codecs=opus',
        ptt: true
      });

      log.success(`🔊 Resposta do Agent enviada para ${nome}`);
      fs.unlinkSync(audioPath);

      // ✅ Limpar status "gravando"
      await sock.sendPresenceUpdate('paused', tel);

      return; // Mudado de continue para return
      
    } catch (agentError) {
      // ========== FALLBACK: SE AGENT FALHAR, USAR MÉTODO ANTIGO ==========
      log.error(`[AGENT] Falhou: ${agentError.message}, usando fallback...`);
      
      const elevenLabs = new ElevenLabsService();

      await sock.sendPresenceUpdate('recording', tel);
      const textoTranscrito = await elevenLabs.transcribeAudio(buffer);

      if (!textoTranscrito) {
        // ✅ Limpar status "recording" antes de enviar desculpa
        await sock.sendPresenceUpdate('paused', tel);
        const historico = lucas.getHistorico(tel);
        await lucas.enviarDesculpaEmAudio('', historico, 'nao_entendeu', tel, sock);
        return; // Mudado de continue para return
      }

      // ✅ Limpar status "recording" após transcrição bem-sucedida
      await sock.sendPresenceUpdate('paused', tel);
      
      log.info(`📝 Transcrição: "${textoTranscrito}"`);

      const respostaTexto = await lucas.processar(tel, textoTranscrito, sock, nome);

      if (!respostaTexto || typeof respostaTexto !== 'string') {
        // ❌ PROBLEMA: Estava fazendo continue sem enviar resposta!
        // ✅ CORREÇÃO: Sempre enviar mensagem de fallback
        log.error(`[AUDIO] lucas.processar retornou valor inválido: ${typeof respostaTexto}`);
        await lucas.enviarDesculpaEmAudio('', lucas.getHistorico(tel), 'erro_sistema', tel, sock);
        return; // Mudado de continue para return
      }

      // Detectar se tem lista de veículos
      const temLista = /^\d+\./m.test(respostaTexto);

      // ========== SE TEM LISTA: SÓ ÁUDIO INTRODUTÓRIO ==========
      if (temLista) {
        console.log('📋 [DEBUG] Lista detectada, enviando só áudio introdutório');
        
        const msgIntro = respostaTexto.split('\n')[0];
        
        try {
          await sock.sendPresenceUpdate('recording', tel);
          const audioIntro = await elevenLabs.textToSpeech(msgIntro);
          
          const audioIntroPath = path.join(__dirname, `temp_intro_${Date.now()}.mp3`);
          fs.writeFileSync(audioIntroPath, audioIntro);


          await sock.sendMessage(tel, {
            audio: { url: audioIntroPath },
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true
          });

          log.success('🔊 Áudio introdutório enviado (lista já foi enviada antes)');
          fs.unlinkSync(audioIntroPath);

          // ✅ Limpar status "gravando"
          await sock.sendPresenceUpdate('paused', tel);

        } catch (audioError) {
          log.error(`[ÁUDIO-INTRO] Falhou: ${audioError.message}`);
          await sock.sendPresenceUpdate('paused', tel);
        }

        return; // Mudado de continue para return - Lista já enviada
      }

      // ========== RESPOSTA NORMAL EM ÁUDIO (SEM LISTA) ==========
      console.log('🔊 [DEBUG] Gerando áudio de resposta...');

      // ✅ DETECTAR SE É RESPOSTA SOBRE FINANCIAMENTO E ADICIONAR OFERTA DE PLANILHA
      // ⚠️ IMPORTANTE: Só oferecer planilha se tem veículo específico E fala de valores/parcelas
      const veiculoAtual = lucas.veiculoInteresse.get(tel);
      const temValoresEspecificos = /\b(parcela.*r\$|financ.*\d+|r\$\s*\d+.*mensal|vezes.*r\$|\d+x de r\$)\b/i.test(respostaTexto);
      const jaMencionaPlanilha = /\b(planilha|tabelinha|tabela|spreadsheet)\b/i.test(respostaTexto);

      let textoParaAudio = respostaTexto;
      const temFinanciamento = veiculoAtual && temValoresEspecificos && !jaMencionaPlanilha;

      if (temFinanciamento) {
        // Gerar frase de planilha aleatória para variar
        const frasesComPlanilha = [
          " Peraí que vou te mandar uma planilha aqui pra facilitar!",
          " Deixa eu te enviar uma planilhinha com tudo detalhado!",
          " Ó, vou te passar uma planilha agora pra você ver melhor!",
          " Espera que vou mandar uma tabelinha aqui pra você!",
          " Vou te enviar uma planilha agora pra ficar mais claro!",
          " Já te mando uma planilha com tudo organizadinho!"
        ];
        const fraseAleatoria = frasesComPlanilha[Math.floor(Math.random() * frasesComPlanilha.length)];
        textoParaAudio = respostaTexto + fraseAleatoria;
        log.info(`📊 [FINANCIAMENTO] Adicionada oferta de planilha ao áudio: "${fraseAleatoria}"`);
      }

      try {
        await sock.sendPresenceUpdate('recording', tel);
        const audioResposta = await elevenLabs.textToSpeech(textoParaAudio);

        const audioPath = path.join(__dirname, `temp_audio_${Date.now()}.mp3`);
        fs.writeFileSync(audioPath, audioResposta);

        await sock.sendMessage(tel, {
          audio: { url: audioPath },
          mimetype: 'audio/ogg; codecs=opus',
          ptt: true
        });

        log.success(`🔊 Áudio enviado para ${nome}`);
        fs.unlinkSync(audioPath);

        // ✅ Limpar status "gravando"
        await sock.sendPresenceUpdate('paused', tel);

        // ✅ SE MENCIONOU PLANILHA, ENVIAR PLANILHA FORMATADA LOGO APÓS O ÁUDIO
        if (temFinanciamento) {
          try {
            // Extrair valor do veículo do contexto ou histórico
            const veiculoAtual = lucas.veiculoInteresse.get(tel);

            if (veiculoAtual && veiculoAtual.preco) {
              log.info(`📊 [PLANILHA] Gerando e enviando planilha de financiamento...`);

              // Pequeno delay para parecer mais natural (como se estivesse montando a planilha)
              await lucas.aguardar(2000);

              await sock.sendPresenceUpdate('composing', tel);

              // ⚠️ CORRIGIDO: Chamar através de lucas.funcoes
              const planilha = await lucas.funcoes.gerarPlanilhaFinanciamento(veiculoAtual.preco, tel);

              await sock.sendMessage(tel, { text: planilha });

              // ✅ Limpar status "digitando"
              await sock.sendPresenceUpdate('paused', tel);

              log.success(`📊 [PLANILHA] Planilha enviada com sucesso!`);
            }
          } catch (planilhaError) {
            log.error(`[PLANILHA] Erro ao enviar: ${planilhaError.message}`);
            await sock.sendPresenceUpdate('paused', tel);
          }
        }

      } catch (audioError) {
        log.error(`[ÁUDIO] Falhou, enviando texto: ${audioError.message}`);
        await sock.sendMessage(tel, { text: respostaTexto });
        await sock.sendPresenceUpdate('paused', tel);
      }

      return; // Mudado de continue para return
    }

  } catch (error) {
    console.error('❌ [DEBUG] ERRO no processamento de áudio:');
    console.error('Mensagem:', error.message);
    console.error('Stack:', error.stack);

    log.error(`Erro processar áudio: ${error.message}`);
    const historico = lucas.getHistorico(tel);
    await lucas.enviarDesculpaEmAudio('', historico, 'nao_entendeu', tel, sock);
    return; // Mudado de continue para return
  }
}


    // ========== PROCESSAR TEXTO ==========
    console.log('📝 [DEBUG] Processando como texto...');
    const txt = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';

    console.log('📝 [DEBUG] Texto extraído:', txt);

    if (!txt) {
      console.log('⚠️ [DEBUG] Texto vazio, ignorando');
      return; // Mudado de continue para return
    }

    console.log('✅ [DEBUG] Texto válido, iniciando processamento');

    // ========== VERIFICAR SE É RESPOSTA DE LOJISTA ==========
    if (gerenciadorAgendamentos) {
      try {
        const respostaLojista = await gerenciadorAgendamentos.processarRespostaLojista(tel, txt);

        if (respostaLojista) {
          console.log('✅ [AGENDAMENTOS] Resposta de lojista processada:', respostaLojista.mensagem);

          // Enviar confirmação ao lojista
          await sock.sendMessage(tel, { text: respostaLojista.mensagem });

          // Se foi aprovação, cliente já foi notificado pelo gerenciador
          // Se foi recusa, nada é enviado ao cliente
          return; // Mudado de continue para return - Pular processamento normal
        }
      } catch (err) {
        console.error('❌ [AGENDAMENTOS] Erro ao processar resposta de lojista:', err);
      }
    }

    // ========== AGREGAÇÃO DE MENSAGENS ==========
    // Em vez de processar imediatamente, adicionar à fila e aguardar mais mensagens
    lucas.adicionarMensagemPendente(tel, txt, async (mensagemCompleta) => {
      console.log('\n🎯 ========== PROCESSANDO MENSAGEM AGREGADA ==========');
      console.log(`📱 Cliente: ${nome}`);
      console.log(`📝 Mensagem: "${mensagemCompleta}"`);
      console.log('='.repeat(70));

      try {
        await sock.readMessages([msg.key]);

        console.log('🤖 [DEBUG] Chamando aira.processar...');
        const resp = await lucas.processar(tel, mensagemCompleta, sock, nome);
        console.log('✅ [DEBUG] Aira retornou:', typeof resp, typeof resp === 'object' ? JSON.stringify(resp).substring(0, 100) : resp?.substring(0, 100));

        // ✅ PERMITIR string vazia (indica que fotos foram enviadas com sucesso)
        // Só enviar erro se for null ou undefined (não string vazia)
        if (resp === null || resp === undefined) {
          log.error('[TEXTO] lucas.processar retornou null/undefined');
          await lucas.enviarDesculpaEmAudio('', lucas.getHistorico(tel), 'erro_sistema', tel, sock);
          return;
        }

        // ✅ Se retornou string vazia, significa que a ação foi concluída (ex: fotos enviadas)
        if (resp === '') {
          log.info('[TEXTO] ✅ Ação concluída sem necessidade de resposta adicional (fotos enviadas)');
          return;
        }

        // Verificar se retornou objeto (com mensagem adicional) ou string
        let respostaLimpa;
        let mensagemAdicional = null;
        let delayAdicional = 0;

        if (typeof resp === 'object' && resp.resposta) {
          // Retornou objeto com mensagem adicional
          respostaLimpa = resp.resposta.replace(/\[object Object\]/g, '').replace(/undefined/g, '').trim();
          mensagemAdicional = resp.mensagem_adicional;
          delayAdicional = resp.delay_adicional || 0;
          log.info(`📄 Mensagem adicional detectada (será enviada após ${delayAdicional}ms)`);
        } else if (typeof resp === 'string') {
          // Retornou string simples
          respostaLimpa = resp.replace(/\[object Object\]/g, '').replace(/undefined/g, '').trim();
        } else {
          // ❌ PROBLEMA: Tipo inválido mas não envia resposta
          // ✅ CORREÇÃO: Enviar mensagem de fallback
          log.error(`❌ Resposta com tipo inválido (tipo: ${typeof resp})`);
          await lucas.enviarDesculpaEmAudio('', lucas.getHistorico(tel), 'erro_sistema', tel, sock);
          return;
        }

        if (!respostaLimpa) {
          // ❌ PROBLEMA: Resposta vazia mas não envia nada
          // ✅ CORREÇÃO: Enviar mensagem de fallback
          log.error('❌ Resposta vazia após limpeza');
          await lucas.enviarDesculpaEmAudio('', lucas.getHistorico(tel), 'erro_sistema', tel, sock);
          return;
        }

        // ========== DELAY NATURAL ANTES DE RESPONDER ==========
        const delayNatural = lucas.calcularDelayNatural(respostaLimpa);
        log.info(`⏱️ Aguardando ${delayNatural}ms (delay natural)`);
        await lucas.aguardar(delayNatural);

        // ========== ENVIAR COMO ÁUDIO ==========
        try {
          log.info('🔊 [TTS] Gerando áudio da resposta...');

          const elevenLabs = new ElevenLabsService();

          // ✅ DETECTAR SE É RESPOSTA SOBRE FINANCIAMENTO E ADICIONAR OFERTA DE PLANILHA
          // ⚠️ IMPORTANTE: Só oferecer planilha se tem veículo específico E fala de valores/parcelas
          const veiculoAtual = lucas.veiculoInteresse.get(tel);
          const temValoresEspecificos = /\b(parcela.*r\$|financ.*\d+|r\$\s*\d+.*mensal|vezes.*r\$|\d+x de r\$)\b/i.test(respostaLimpa);
          const jaMencionaPlanilha = /\b(planilha|tabelinha|tabela|spreadsheet)\b/i.test(respostaLimpa);

          let textoComPlanilha = respostaLimpa;
          const temFinanciamento = veiculoAtual && temValoresEspecificos && !jaMencionaPlanilha;

          if (temFinanciamento) {
            // Gerar frase de planilha aleatória para variar
            const frasesComPlanilha = [
              " Peraí que vou te mandar uma planilha aqui pra facilitar!",
              " Deixa eu te enviar uma planilhinha com tudo detalhado!",
              " Ó, vou te passar uma planilha agora pra você ver melhor!",
              " Espera que vou mandar uma tabelinha aqui pra você!",
              " Vou te enviar uma planilha agora pra ficar mais claro!",
              " Já te mando uma planilha com tudo organizadinho!"
            ];
            const fraseAleatoria = frasesComPlanilha[Math.floor(Math.random() * frasesComPlanilha.length)];
            textoComPlanilha = respostaLimpa + fraseAleatoria;
            log.info(`📊 [FINANCIAMENTO] Adicionada oferta de planilha ao áudio: "${fraseAleatoria}"`);
          }

          // Formatar texto para TTS
          const textoFormatado = FormatadorFala.prepararParaTTS(textoComPlanilha);
          log.info(`📝 [TTS] Texto formatado: "${textoFormatado}"`);

          // ✅ DIVIDIR TEXTO EM SEGMENTOS SE MUITO LONGO (>500 chars = ~23s de áudio)
          const segmentos = lucas.dividirTextoParaAudio(textoFormatado, 500);

          if (segmentos.length > 1) {
            log.info(`🎙️ [DIVISAO-AUDIO] Texto dividido em ${segmentos.length} áudios`);
          }

          // ✅ GERAR E ENVIAR CADA SEGMENTO SEQUENCIALMENTE
          for (let i = 0; i < segmentos.length; i++) {
            const segmento = segmentos[i];
            const isUltimoSegmento = i === segmentos.length - 1;

            log.info(`🎙️ [AUDIO-${i+1}/${segmentos.length}] Gerando: "${segmento.substring(0, 50)}${segmento.length > 50 ? '...' : ''}"`);

            // Mostrar "gravando" antes de cada áudio
            await sock.sendPresenceUpdate('recording', tel);

            // Gerar áudio do segmento
            const audioBuffer = await elevenLabs.textToSpeech(segmento);

            // Salvar temporariamente
            const audioPath = path.join(__dirname, `temp_resposta_${Date.now()}_part${i+1}.mp3`);
            fs.writeFileSync(audioPath, audioBuffer);

            // Enviar áudio
            await sock.sendMessage(tel, {
              audio: { url: audioPath },
              mimetype: 'audio/ogg; codecs=opus',
              ptt: true
            });

            log.success(`✓ Áudio ${i+1}/${segmentos.length} enviado para ${nome}`);

            // Limpar arquivo temporário
            fs.unlinkSync(audioPath);

            // Delay natural entre segmentos (exceto no último)
            if (!isUltimoSegmento) {
              await sock.sendPresenceUpdate('paused', tel);
              await lucas.aguardar(1500); // 1.5s entre áudios
            }
          }

          // ✅ Limpar status "gravando" após último áudio
          await sock.sendPresenceUpdate('paused', tel);

          // ✅ SE MENCIONOU PLANILHA, ENVIAR PLANILHA FORMATADA LOGO APÓS O ÁUDIO
          if (temFinanciamento) {
            try {
              // Extrair valor do veículo do contexto ou histórico
              const veiculoAtual = lucas.veiculoInteresse.get(tel);

              if (veiculoAtual && veiculoAtual.preco) {
                log.info(`📊 [PLANILHA] Gerando e enviando planilha de financiamento...`);

                // Pequeno delay para parecer mais natural (como se estivesse montando a planilha)
                await lucas.aguardar(2000);

                await sock.sendPresenceUpdate('composing', tel);

                // ⚠️ CORRIGIDO: Chamar através de lucas.funcoes
                const planilha = await lucas.funcoes.gerarPlanilhaFinanciamento(veiculoAtual.preco, tel);

                await sock.sendMessage(tel, { text: planilha });

                // ✅ Limpar status "digitando"
                await sock.sendPresenceUpdate('paused', tel);

                log.success(`📊 [PLANILHA] Planilha enviada com sucesso!`);
              }
            } catch (planilhaError) {
              log.error(`[PLANILHA] Erro ao enviar: ${planilhaError.message}`);
              // ✅ Limpar status em caso de erro
              await sock.sendPresenceUpdate('paused', tel);
            }
          }

        } catch (audioError) {
          // FALLBACK: Se falhar, enviar como texto com delay entre frases
          log.error(`[TTS] Erro ao gerar áudio: ${audioError.message}`);
          log.info('📤 Enviando como texto (fallback)');

          const frases = respostaLimpa
            .split(/(?<=[.!?])\s+/)
            .map(f => f.trim())
            .filter(f => f.length > 0);

          console.log(`💬 Aira vai enviar ${frases.length} frase(s)`);

          for (let j = 0; j < frases.length; j++) {
            console.log(`📤 Frase ${j+1}/${frases.length}: "${frases[j]}"`);

            // Delay antes de cada frase
            const delayFrase = lucas.calcularDelayNatural(frases[j]);
            await lucas.aguardar(delayFrase);

            await sock.sendMessage(tel, { text: frases[j] });

            // Pequeno delay entre frases
            if (j < frases.length - 1) {
              await lucas.aguardar(800);
            }
          }
        }

        // ========== ENVIAR MENSAGEM ADICIONAL (DOCUMENTAÇÃO) ==========
        if (mensagemAdicional) {
          log.info(`📄 Enviando mensagem adicional sobre documentação após ${delayAdicional}ms...`);

          // Aguardar delay adicional
          await lucas.aguardar(delayAdicional);

          try {
            const elevenLabs = new ElevenLabsService();
            const textoFormatadoDoc = FormatadorFala.prepararParaTTS(mensagemAdicional);

            // ✅ DIVIDIR MENSAGEM ADICIONAL EM SEGMENTOS SE MUITO LONGA
            const segmentosDoc = lucas.dividirTextoParaAudio(textoFormatadoDoc, 500);

            if (segmentosDoc.length > 1) {
              log.info(`🎙️ [DIVISAO-AUDIO-DOC] Mensagem adicional dividida em ${segmentosDoc.length} áudios`);
            }

            // ✅ GERAR E ENVIAR CADA SEGMENTO SEQUENCIALMENTE
            for (let i = 0; i < segmentosDoc.length; i++) {
              const segmentoDoc = segmentosDoc[i];
              const isUltimoSegmentoDoc = i === segmentosDoc.length - 1;

              await sock.sendPresenceUpdate('recording', tel);

              const audioBufferDoc = await elevenLabs.textToSpeech(segmentoDoc);
              const audioPathDoc = path.join(__dirname, `temp_doc_${Date.now()}_part${i+1}.mp3`);
              fs.writeFileSync(audioPathDoc, audioBufferDoc);

              await sock.sendMessage(tel, {
                audio: { url: audioPathDoc },
                mimetype: 'audio/ogg; codecs=opus',
                ptt: true
              });

              log.success(`✓ Pergunta documentação ${i+1}/${segmentosDoc.length} enviada`);
              fs.unlinkSync(audioPathDoc);

              // Delay natural entre segmentos (exceto no último)
              if (!isUltimoSegmentoDoc) {
                await sock.sendPresenceUpdate('paused', tel);
                await lucas.aguardar(1500); // 1.5s entre áudios
              }
            }

            // ✅ Limpar status "gravando" após último áudio
            await sock.sendPresenceUpdate('paused', tel);

          } catch (docError) {
            // Fallback: enviar como texto
            log.error(`[TTS] Erro ao gerar áudio da documentação: ${docError.message}`);
            await sock.sendMessage(tel, { text: mensagemAdicional });
            await sock.sendPresenceUpdate('paused', tel);
          }
        }

        // ========== BUSCA AUTOMÁTICA REMOVIDA ==========
        // A busca de veículos já é feita automaticamente via processarComFuncoes()
        // quando a IA chama a function buscar_carros. Não há necessidade de
        // chamar buscar_carros() novamente aqui, pois isso duplica o envio das fotos.

      } catch (error) {
        console.error('❌ [DEBUG] ERRO no processamento:');
        console.error('Mensagem:', error.message);
        console.error('Stack:', error.stack);

        const historico = lucas.getHistorico(tel);
        await lucas.enviarDesculpaEmAudio(mensagemCompleta, historico, 'geral', tel, sock);
      }
    });

      // Pular o processamento antigo (já está sendo feito via callback)
      return; // Mudado de continue para return

    } catch (error) {
      // ✅ ERRO NO PROCESSAMENTO DE UMA MENSAGEM INDIVIDUAL
      console.error('❌ [PARALELO] Erro ao processar mensagem:', error.message);
      console.error('Stack:', error.stack);
      log.error(`❌ Erro ao processar mensagem: ${error.message}`);
    }

    // ========== CÓDIGO ANTIGO (SERÁ IGNORADO) ==========
    // ========== DIVIDIR POR LINHAS ==========
    const linhas = txt.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    console.log(`📱 ${nome} enviou ${linhas.length} linha(s)`);

    for (let i = 0; i < linhas.length; i++) {
      const linhaAtual = linhas[i];
      
      console.log(`\n${'='.repeat(70)}`);
      console.log(`📱 ${nome} [Linha ${i+1}/${linhas.length}]: "${linhaAtual}"`);
      console.log('='.repeat(70));
      
      try {
        await sock.readMessages([msg.key]);

        console.log('🤖 [DEBUG] Chamando aira.processar...');
        const resp = await lucas.processar(tel, linhaAtual, sock, nome);
        console.log('✅ [DEBUG] Aira retornou:', typeof resp, resp?.substring(0, 100));
        
        if (!resp) {
          log.info('✅ Processado sem resposta textual');
          continue;
        }
        
        if (typeof resp !== 'string') {
          log.error(`❌ Resposta não é string (tipo: ${typeof resp})`);
          continue;
        }
        
        const respostaLimpa = resp
          .replace(/\[object Object\]/g, '')
          .replace(/undefined/g, '')
          .trim();
        
        if (!respostaLimpa) {
          log.error('❌ Resposta vazia após limpeza');
          continue;
        }
        
        // ========== NOVO: ENVIAR COMO ÁUDIO ==========
try {
  log.info('🔊 [TTS] Gerando áudio da resposta...');
  
  const elevenLabs = new ElevenLabsService();
  
  // Formatar texto para TTS
  const textoFormatado = FormatadorFala.prepararParaTTS(respostaLimpa);
  log.info(`📝 [TTS] Texto formatado: "${textoFormatado}"`);
  
  // Mostrar "gravando áudio"
  await sock.sendPresenceUpdate('recording', tel);
  
  // Gerar áudio
  const audioBuffer = await elevenLabs.textToSpeech(textoFormatado);
  
  // Salvar temporariamente
  const audioPath = path.join(__dirname, `temp_resposta_${Date.now()}.mp3`);
  fs.writeFileSync(audioPath, audioBuffer);

  // Enviar áudio
  await sock.sendMessage(tel, {
    audio: { url: audioPath },
    mimetype: 'audio/ogg; codecs=opus',
    ptt: true
  });

  log.success(`✓ Áudio enviado para ${nome}`);

  // Limpar arquivo temporário
  fs.unlinkSync(audioPath);

  // ✅ Limpar status "gravando"
  await sock.sendPresenceUpdate('paused', tel);

} catch (audioError) {
  // FALLBACK: Se falhar, enviar como texto
  log.error(`[TTS] Erro ao gerar áudio: ${audioError.message}`);
  log.info('📤 Enviando como texto (fallback)');
  
  const frases = respostaLimpa
    .split(/(?<=[.!?])\s+/)
    .map(f => f.trim())
    .filter(f => f.length > 0);

  for (let j = 0; j < frases.length; j++) {
    await new Promise(r => setTimeout(r, 1200));
    await sock.sendMessage(tel, { text: frases[j] });

    if (j < frases.length - 1) {
      await new Promise(r => setTimeout(r, 800));
    }
  }

  // ✅ Limpar status após fallback
  await sock.sendPresenceUpdate('paused', tel);
}

console.log('='.repeat(70) + '\n');

if (i < linhas.length - 1) {
  await new Promise(r => setTimeout(r, 2000));
}

        console.log('📤 ENVIANDO:', respostaLimpa);
        
        const frases = respostaLimpa
          .split(/(?<=[.!?])\s+/)
          .map(f => f.trim())
          .filter(f => f.length > 0);

        console.log(`💬 Aira vai enviar ${frases.length} frase(s)`);

        for (let j = 0; j < frases.length; j++) {
          console.log(`📤 Frase ${j+1}/${frases.length}: "${frases[j]}"`);
          
          await new Promise(r => setTimeout(r, 1200));
          await sock.sendMessage(tel, { text: frases[j] });
          
          console.log(`✓ Enviada`);
          
          if (j < frases.length - 1) {
            await new Promise(r => setTimeout(r, 800 + Math.random() * 400));
          }
        }

        console.log('='.repeat(70) + '\n');
                
        if (i < linhas.length - 1) {
          await new Promise(r => setTimeout(r, 2000));
        }
        
      } catch (error) {
        console.error('❌ [DEBUG] ERRO no processamento:');
        console.error('Mensagem:', error.message);
        console.error('Stack:', error.stack);
        log.error(`❌ Erro no processamento: ${error.message}`);
      }
    }
  }); // Fecha a função map

  // ✅ AGUARDAR TODAS AS MENSAGENS SEREM PROCESSADAS EM PARALELO
  // Usar Promise.allSettled para não falhar se uma mensagem der erro
  await Promise.allSettled(processingPromises);
  console.log(`\n✅ [PARALELO] ${messages.length} mensagem(ns) processada(s) simultaneamente\n`);
});
  
return new Promise(() => {});
}
// =====================================================
// INICIALIZAÇÃO
// =====================================================
(async () => {
  const dbOk = await conectarDB();
  if (!dbOk) process.exit(1);
  await conectar();
})();
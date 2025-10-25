

import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import makeWASocket, { DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, downloadMediaMessage } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import NodeCache from 'node-cache';
import { ElevenLabsClient } from 'elevenlabs';

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
  // Adicione números aqui se precisar testar com outras pessoas:
  // '5511999999999', // Exemplo: Seu número (formato: código país + DDD + número)
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
  return NUMEROS_PERMITIDOS.includes(numeroLimpo);
}

// Inicializar o cliente ElevenLabs
const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

// ID da voz padrão do ElevenLabs (ex: 'Nicole' ou outro ID de voz)
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL'; // Voz padrão: Nicole

// Função para enviar áudio via ElevenLabs
async function enviarAudioElevenLabs(tel, texto) {
  try {
    const audio = await elevenlabs.generate({
      voice: ELEVENLABS_VOICE_ID,
      text: texto,
      model_id: 'eleven_multilingual_v2',
    });

    const audioFileName = `temp_resposta_${Date.now()}.mp3`;
    const audioFilePath = path.join(__dirname, audioFileName);

    const fileStream = fs.createWriteStream(audioFilePath);
    await new Promise((resolve, reject) => {
      audio.pipe(fileStream);
      fileStream.on('finish', resolve);
      fileStream.on('error', reject);
    });

    // Enviar o áudio para o cliente (usando botAdapter ou similar)
    // Exemplo: await botAdapter.sendAudio(tel, audioFilePath);
    console.log(`✅ [ElevenLabs] Áudio enviado para ${tel}: ${texto}`);
    return audioFilePath;
  } catch (error) {
    console.error('❌ [ElevenLabs] Erro ao gerar ou enviar áudio:', error);
    return null;
  }
}



import qrcode from 'qrcode-terminal';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ffmpeg from 'fluent-ffmpeg';

import db from './database.js';

// ✅ IMPORTAR SIMULADOR DE CONDIÇÕES DE PAGAMENTO
// Adaptação do simulador de financiamento para imóveis
import { SimuladorCondicoesPagamento, GerenciadorCondicoesPagamento } from './simulador-condicoes-pagamento.js';

// ✅ IMPORTAR WRAPPER DE IMÓVEIS
// Substitui fipe-wrapper.js
import { consultarImovel, compararComMercado, buscarDetalhesPersuasaoImovel } from './property-wrapper.js';

// ✅ IMPORTAR BOT ADAPTER (Integração com Backend Flask)
import botAdapter from './bot-adapter.js';

// ✅ IMPORTAR GERENCIADOR DE AGENDAMENTOS
import { GerenciadorAgendamentos } from './modulo-agendamento.js';

// ✅ IMPORTAR MESSAGE TRACKER (Sistema de Debug e Rastreamento)
import messageTracker from './message-tracker.js';


// ========== FUNÇÃO HELPER PARA SUBSTITUIR OPENAI POR CLAUDE ==========
async function callClaudeInsteadOfOpenAI(anthropic, config) {
  const { messages, temperature = 0.7, max_tokens = 150 } = config;

  const systemMessage = messages.find(m => m.role === 'system')?.content || '';
  const userMessages = messages.filter(m => m.role !== 'system');

  const claudeMessages = userMessages.map(m => ({
    role: m.role,
    content: m.content
  }));

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
    textoFormatado = textoFormatado.replace(/\[.*?\]/g, '');
    textoFormatado = textoFormatado.replace(/\bCHAMA\s+\w+\s*\(.*?\)/gi, '');
    textoFormatado = textoFormatado.replace(/\bENVIA\s+.*?(FOTOS?|IMAGENS?|DADOS|INFORMAÇÕES)/gi, '');

    // 0. REMOVER GAGUEJADAS E REPETIÇÕES
    textoFormatado = this.removerGaguejadas(textoFormatado);

    // 0.1. FONÉTICA ESPECIAL PARA TERMOS IMOBILIÁRIOS
    textoFormatado = this.aplicarFoneticaImoveis(textoFormatado);

    // 1. ANOS (ex: "2008" → "dois mil e oito", "ano 2023" → "ano dois mil e vinte e três")
    textoFormatado = textoFormatado.replace(/\b(ano\s+)?((19|20)\d{2})\b/gi, (match, prefixoAno, ano) => {
      const anoNum = parseInt(ano);
      const anoTexto = this.anoParaTexto(anoNum);
      return prefixoAno ? `ano ${anoTexto}` : anoTexto;
    });

    // 2. METRAGEM (ex: "120m²" → "cento e vinte metros quadrados")
    textoFormatado = textoFormatado.replace(/(\d+)\s*m²|metros quadrados/gi, (match, num) => {
      return `${this.numeroParaTexto(parseInt(num))} metros quadrados`;
    });

    // 3. QUARTOS/BANHEIROS/VAGAS (ex: "3 quartos" → "três quartos")
    textoFormatado = textoFormatado.replace(/(\d+)\s*(quartos|banheiros|vagas)/gi, (match, num, tipo) => {
      return `${this.numeroParaTexto(parseInt(num))} ${tipo}`;
    });

    // 4. VALORES EM REAIS (ex: "R$ 85.000" → "oitenta e cinco mil reais")
    textoFormatado = textoFormatado.replace(/R\$\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/g, (match, valor) => {
      const valorLimpo = valor.replace(/\./g, '').replace(',', '.');
      const valorNum = parseFloat(valorLimpo);
      return `${this.numeroParaTexto(Math.round(valorNum))} reais`;
    });

    // 5. PREÇOS SEM SÍMBOLO (ex: "85000" seguido de "reais" ou isolado em contexto de preço)
    textoFormatado = textoFormatado.replace(/\b(\d{5,})\s*(reais)?/gi, (match, num, reais) => {
      const numTexto = this.numeroParaTexto(parseInt(num));
      return reais ? `${numTexto} reais` : numTexto;
    });

    // 6. REMOVER ENUMERAÇÕES ROBÓTICAS (Opção 1:, Opção 2:, etc)
    textoFormatado = textoFormatado
      .replace(/\n\s*📱\s*Opção\s+\d+:\s*/gi, '\n')
      .replace(/\n\s*🏢\s*Opção\s+\d+:\s*/gi, '\n')
      .replace(/\n\s*Opção\s+\d+:\s*/gi, '\n')
      .replace(/\n\s*\d+\)\s*/g, '\n')
      .replace(/\n\s*\d+\.\s*/g, '\n')
      .replace(/\n\s*Item\s+\d+:\s*/gi, '\n');

    // 7. REMOVER MARKDOWN
    textoFormatado = textoFormatado
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/_/g, '')
      .replace(/#{1,6}\s/g, '');

    return textoFormatado;
  }

  static anoParaTexto(ano) {
    if (ano < 1000 || ano > 2999) {
      return ano.toString();
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

    textoLimpo = textoLimpo.replace(/\b(\w+)\s+\1\b/gi, '$1');
    textoLimpo = textoLimpo.replace(/\b((?:\w+\s+){2,5})\1+/gi, '$1');
    textoLimpo = textoLimpo.replace(/\s{2,}/g, ' ');
    textoLimpo = textoLimpo.replace(/([!?.]){2,}/g, '$1');

    return textoLimpo.trim();
  }

  // ========== FONÉTICA ESPECIAL PARA TERMOS IMOBILIÁRIOS ==========
  static aplicarFoneticaImoveis(texto) {
    let textoComFonetica = texto;

    const substituicoes = [
      [/\b(m²|metros quadrados)\b/gi, 'metros quadrados'],
      [/\b(R\$\s*\d{1,3}(?:\.\d{3})*(?:,\d{2})?)\b/gi, (match, valor) => {
        const valorLimpo = valor.replace('R$', '').replace(/\./g, '').replace(',', '.');
        const valorNum = parseFloat(valorLimpo);
        return `${FormatadorFala.numeroParaTexto(Math.round(valorNum))} reais`;
      }],
      [/\b(IPTU)\b/gi, 'IPTU'],
      [/\b(condomínio)\b/gi, 'condomínio'],
      [/\b(CEP)\b/gi, 'CEP']
    ];

    for (const [regex, substituicao] of substituicoes) {
      textoComFonetica = textoComFonetica.replace(regex, substituicao);
    }

    return textoComFonetica;
  }
}

// Adaptação da classe Lucas para AIra Imobiliária
class LucasImobiliaria {
  constructor(db, sock) {
    this.db = db;
    this.sock = sock;
    
    this.historicoFuncoes = new Map();
    this.mensagensPendentes = new Map();
    this.timersAgregacao = new Map();
    this.TEMPO_ESPERA_MENSAGENS = 4000;

    this.imovelInteresse = new Map();
    this.aguardandoDetalhesImovel = new Map();
    this.fotosJaEnviadas = new Map();
    this.imoveisJaMostrados = new Map();

    // ElevenLabs
    this.elevenlabs = elevenlabs;
    this.elevenlabsVoiceId = ELEVENLABS_VOICE_ID;

    this.gerenciadorAgendamentos = new GerenciadorAgendamentos(this.db, this.sock);
    this.messageTracker = new messageTracker(this.db);
  }

  async enviarAudioElevenLabs(tel, texto) {
    return enviarAudioElevenLabs(tel, texto);
  }




  async processarComFuncoes(mensagem, historico, etapa, contextoAdicional, lucas, tel = '', sock = null, usarFuncoes = true) {
    console.log('\n🔵 ========== INICIANDO CHAMADA GPT (IMOBILIÁRIA) ==========');
    console.log('📝 Mensagem:', mensagem);
    console.log('📊 Histórico:', historico.length, 'msgs');
    console.log('🎯 Etapa:', etapa);
    console.log('🔧 Usar funções:', usarFuncoes);

    // Adaptação do retry para imóveis
    const dadosImovelRetry = lucas.aguardandoDetalhesImovel?.get(tel);
    if (dadosImovelRetry && dadosImovelRetry.tentativas < 3) {
      console.log('🔄 [IMOVEL-RETRY] Cliente pode estar fornecendo detalhes adicionais...');
      console.log('📋 [IMOVEL-RETRY] Dados armazenados:', dadosImovelRetry);

      const msgLower = mensagem.toLowerCase();
      const temTipo = /\b(casa|apartamento|sobrado|terreno|cobertura|kitnet|sala comercial|loja)\b/i.test(msgLower);
      const temMetragem = /\b(\d+)\s*m²|metros quadrados\b/i.test(msgLower);
      const temBairro = /\b(bairro|região)\s+\w+/i.test(msgLower);

      if (temTipo || temMetragem || temBairro) {
        console.log('✅ [IMOVEL-RETRY] Detectados detalhes do imóvel na mensagem!');

        const tipoMatch = msgLower.match(/\b(casa|apartamento|sobrado|terreno|cobertura|kitnet|sala comercial|loja)\b/i);
        const metragemMatch = msgLower.match(/\b(\d+)\s*m²|metros quadrados\b/i);
        const bairroMatch = msgLower.match(/\b(bairro|região)\s+(\w+)/i);

        const paramsRetry = {
          property_type: dadosImovelRetry.property_type,
          cidade: dadosImovelRetry.cidade,
          estado: dadosImovelRetry.estado
        };

        if (tipoMatch) paramsRetry.property_type = tipoMatch[0];
        if (metragemMatch) paramsRetry.metragem = parseInt(metragemMatch[1]);
        if (bairroMatch) paramsRetry.bairro = bairroMatch[2];

        console.log('🔄 [IMOVEL-RETRY] Tentando novamente com parâmetros aprimorados:', paramsRetry);

        try {
          const resultadoRetry = await this.funcoes.consultar_imovel(paramsRetry);

          if (resultadoRetry.sucesso) {
            console.log('✅ [IMOVEL-RETRY] SUCESSO! Imóvel encontrado:', resultadoRetry.property_id);
            lucas.aguardandoDetalhesImovel.delete(tel);
            contextoAdicional = `${contextoAdicional}\n\n🎯 IMPORTANTE: Você acabou de consultar um imóvel com sucesso (retry automático) e obteve:\n- Tipo: ${resultadoRetry.property_type}\n- Endereço: ${resultadoRetry.endereco.bairro}, ${resultadoRetry.endereco.cidade}\n- Valor: R$ ${resultadoRetry.preco}\n\nInforme isso ao cliente de forma NATURAL e ESPONTÂNEA. Pergunte se isso ajuda ou se quer saber mais.`;
            // Continua o processamento normal - a IA vai criar a resposta
          } else if (resultadoRetry.erro && resultadoRetry.pedir_detalhes) {
            console.log('⚠️ [IMOVEL-RETRY] Ainda não conseguiu, incrementando tentativas...');
            dadosImovelRetry.tentativas += 1;
            lucas.aguardandoDetalhesImovel.set(tel, dadosImovelRetry);
          }
        } catch (error) {
          console.error('❌ [IMOVEL-RETRY] Erro no retry:', error.message);
        }
      } else {
        console.log('ℹ️ [IMOVEL-RETRY] Mensagem não contém detalhes específicos de imóvel');
      }
    }

    // Adaptação do prompt de sistema
    const messages = [
      {
        role: 'system',
        content: `Você é AIra, Consciência Imobiliária da HelixAI, uma corretora digital experiente, empática e persuasiva, com foco em fechamento de vendas e locações imobiliárias. Você NÃO é um robô, NÃO é uma IA, você é uma pessoa de verdade respondendo mensagens.

Sua missão é entender as necessidades do cliente, apresentar os melhores imóveis do nosso portfólio, simular condições de pagamento e conduzir a negociação até o fechamento. Use gatilhos mentais sutis (exclusividade, urgência, vantagem financeira, praticidade) para persuadir o cliente, sempre com empatia e clareza.

Priorize a comunicação por áudio via ElevenLabs. Mantenha o texto apenas para tabelas, relatórios ou JSONs técnicos.

... (restante do prompt de sistema adaptado para imobiliário)
`
      },
      // ... (restante das mensagens)
    ];

    // Adaptação das ferramentas (functions)
    const tools = [
      {
        type: "function",
        function: {
          name: 'consultar_imovel',
          description: 'Consulta imóveis disponíveis com base em critérios. Use SEMPRE que o cliente buscar um imóvel ou perguntar sobre opções. Não peça confirmação de dados já fornecidos.',
          parameters: {
            type: 'object',
            properties: {
              property_type: {
                type: 'string',
                description: 'Tipo de imóvel (ex: Casa, Apartamento, Terreno, Cobertura, Kitnet, Sala comercial/Loja). Inferir da mensagem do cliente.'
              },
              finalidade: {
                type: 'string',
                description: 'Finalidade do imóvel (Venda ou Aluguel). Inferir da mensagem do cliente.'
              },
              cidade: {
                type: 'string',
                description: 'Cidade do imóvel. Inferir da mensagem do cliente.'
              },
              bairro: {
                type: 'string',
                description: 'Bairro do imóvel. Inferir da mensagem do cliente.'
              },
              min_quartos: {
                type: ['number', 'null'],
                description: 'Número mínimo de quartos.'
              },
              max_preco: {
                type: ['number', 'null'],
                description: 'Preço máximo do imóvel.'
              },
              comodidades: {
                type: 'array',
                items: { type: 'string' },
                description: 'Lista de comodidades desejadas (ex: Piscina, Academia, Varanda Gourmet).'
              }
            },
            required: []
          }
        }
      },
      {
        type: "function",
        function: {
          name: 'comparar_preco_mercado',
          description: 'Compara o preço de um imóvel com o valor médio de mercado na região. Use quando cliente perguntar se o preço está bom, abaixo ou acima do mercado.',
          parameters: {
            type: 'object',
            properties: {
              property_id: {
                type: 'number',
                description: 'ID do imóvel a ser comparado.'
              },
              preco_venda: {
                type: 'number',
                description: 'Preço de venda ou aluguel do imóvel em reais.'
              }
            },
            required: ['property_id', 'preco_venda']
          }
        }
      },
      {
        type: "function",
        function: {
          name: 'simular_condicoes_pagamento',
          description: 'Simula condições de pagamento para um imóvel (financiamento, aluguel, etc.). Use quando o cliente perguntar sobre formas de pagamento, parcelas, entrada.',
          parameters: {
            type: 'object',
            properties: {
              property_id: {
                type: 'number',
                description: 'ID do imóvel de interesse.'
              },
              valor_entrada: {
                type: ['number', 'null'],
                description: 'Valor de entrada (opcional).'
              },
              numero_parcelas: {
                type: ['number', 'null'],
                description: 'Número de parcelas (opcional).'
              }
            },
            required: ['property_id']
          }
        }
      },
      {
        type: "function",
        function: {
          name: 'agendar_visita',
          description: `📅 AGENDE UMA VISITA quando o cliente demonstrar interesse em visitar um imóvel específico.

⚠️ IMPORTANTE: Use esta função quando:
- Cliente quer ver o imóvel pessoalmente
- Cliente está pronto para fechar negócio/locação mas precisa ver presencialmente
- Cliente pede para marcar visita
- Cliente confirma interesse em comprar/alugar mas quer ir até o local

NUNCA use esta função se:
- Cliente ainda está apenas pesquisando
- Ainda não escolheu imóvel específico
- Está apenas comparando preços

O sistema irá:
1. Registrar o agendamento no banco de dados
2. Notificar o corretor responsável pelo imóvel
3. Aguardar aprovação do corretor
4. Confirmar com o cliente quando aprovado`,
          parameters: {
            type: 'object',
            properties: {
              property_id: {
                type: 'number',
                description: 'ID do imóvel de interesse.'
              },
              data_agendamento: {
                type: 'string',
                description: 'Data da visita no formato YYYY-MM-DD (ex: 2025-10-15).'
              },
              hora_agendamento: {
                type: 'string',
                description: 'Horário da visita no formato HH:MM (ex: 14:30).'
              },
              tipo_interesse: {
                type: 'string',
                description: 'Tipo de interesse do cliente (visita_imovel, proposta_compra, proposta_aluguel).',
                enum: ['visita_imovel', 'proposta_compra', 'proposta_aluguel'],
                default: 'visita_imovel'
              },
              observacoes: {
                type: 'string',
                description: 'Observações adicionais sobre a visita ou preferências do cliente.'
              }
            },
            required: ['property_id', 'data_agendamento', 'hora_agendamento']
          }
        }
      },
      {
        type: "function",
        function: {
          name: 'buscar_detalhes_persuasao_imovel',
          description: `🎯 BUSCA DETALHES COMPLETOS PARA PERSUASÃO SOBRE UM IMÓVEL

Use esta função quando:
1️⃣ Cliente demonstra CURIOSIDADE TÉCNICA sobre um imóvel específico
   - "Me fala mais sobre esse apartamento"
   - "Esse imóvel é bom?"
   - "Vale a pena?"
   - "Como é esse imóvel?"

2️⃣ Cliente COMPARA imóveis ou pede argumentos
   - "Qual a diferença desse pro outro?"
   - "Por que esse é mais caro?"
   - "Esse é melhor que o X?"

3️⃣ Cliente pergunta sobre VALOR/MERCADO
   - "É um bom preço?"
   - "Esse imóvel valoriza?"
   - "Quanto vale no mercado?"

4️⃣ Cliente precisa de PERSUASÃO para decidir
   - "Ainda não sei se é esse"
   - "Deixa eu pensar"
   - "Tá caro" (objeção de preço)

A função retorna:
✅ Dados do imóvel (tipo, localização, metragem, quartos, etc.)
✅ Análise de valor de mercado na região
✅ Argumentos de venda PRONTOS (pontos fortes, diferenciais)
✅ Análise de valorização/depreciação
✅ Comparação com nosso preço (se fornecido)
✅ Sugestões de como usar os dados na conversa

IMPORTANTE: Use para qualquer imóvel. A função tem base de conhecimento + busca de dados de mercado real.`,
          parameters: {
            type: 'object',
            properties: {
              property_id: {
                type: 'number',
                description: 'ID do imóvel (obtido de consultar_imovel ou da memória).'
              },
              preco_venda: {
                type: ['number', 'null'],
                description: 'Preço de venda/aluguel do nosso portfólio (se conhecido). Usado para comparar com o mercado e gerar argumento de oportunidade.'
              }
            },
            required: ['property_id']
          }
        }
      }
    ];

    // ... (restante da lógica de processamento de funções, adaptando as chamadas e estados)

    // Exemplo de adaptação de chamada de função
    // case 'consultar_valor_fipe': -> case 'consultar_imovel':
    // resultado = await this.funcoes.consultar_imovel(funcaoArgs);
    // if (resultado.pedir_detalhes && resultado.erro) {
    //   lucas.aguardandoDetalhesImovel.set(tel, { ... });
    // } else if (resultado.sucesso) {
    //   lucas.aguardandoDetalhesImovel.delete(tel);
    // }
    // break;

    // Adaptação da lógica de detecção de interesse em troca para imóvel de entrada
    // if (this.detectarIntencaoTroca(msg) && !entradaDinheiro) {
    //   // ... lógica para imóvel de entrada
    // }

    // Adaptação do contexto adicional para imóvel de entrada
    // const dadosImovelEntradaGPT = this.imovelEntrada.get(tel);
    // if (dadosImovelEntradaGPT && dadosImovelEntradaGPT.property_type) {
    //   contextoAdicional += `\n\n🏠 IMÓVEL DE ENTRADA DO CLIENTE:`;
    //   contextoAdicional += `\n   Tipo: ${dadosImovelEntradaGPT.property_type}`;
    //   // ... outros detalhes
    // }

    // Adaptação da lógica de ElevenLabs (já está importado, apenas garantir que as chamadas são feitas com o texto formatado)
    // const textoParaAudio = FormatadorFala.prepararParaTTS(respostaFinal);
    // await this.enviarAudioElevenLabs(tel, textoParaAudio);

    // Lógica de processamento de mensagens (adaptada do main.js original)
    // ... (Aqui entraria a lógica completa de processamento de mensagens, incluindo a chamada a LLMs e execução de funções)

    // Exemplo de como a validação de cliente seria usada:
    if (!numeroEstaAutorizado(tel)) {
      const mensagemNaoAutorizado = "Desculpe, este serviço está em modo de testes e seu número não está autorizado. Por favor, entre em contato com o suporte para mais informações.";
      await this.enviarAudioElevenLabs(tel, FormatadorFala.prepararParaTTS(mensagemNaoAutorizado));
      return mensagemNaoAutorizado;
    }

    // Exemplo de como a memória persistente seria usada (já implementado com Maps na classe)
    // Exemplo de como a integração ElevenLabs seria usada:
    // const textoParaAudio = FormatadorFala.prepararParaTTS(respostaFinal);
    // await this.enviarAudioElevenLabs(tel, textoParaAudio);

    return "Lógica da AIra Imobiliária em desenvolvimento...";
  }
}

// Exportar a classe adaptada (ou a instância, dependendo da arquitetura original)
export { LucasImobiliaria, FormatadorFala, numeroEstaAutorizado, enviarAudioElevenLabs };




async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(`Usando Baileys v${version.join('.')}, isLatest: ${isLatest}`);

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' })
  });

  const lucasImobiliaria = new LucasImobiliaria(db, sock);

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { qr } = update;
    if (qr) {
      qrcode.generate(qr, { small: true });
      console.log("Escaneie o QR code acima para conectar o WhatsApp.");
    }
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect.error instanceof Boom) && lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut;
      console.log('Conexão fechada devido a ', lastDisconnect.error, ', reconectando ', shouldReconnect);
      if (shouldReconnect) {
        connectToWhatsApp();
      }
    } else if (connection === 'open') {
      console.log('Conexão aberta!');
    }
  });

  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg.message) return;

    const tel = msg.key.remoteJid;
    const messageContent = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

    if (messageContent) {
      const resposta = await lucasImobiliaria.processarComFuncoes(messageContent, [], 'inicio', '', lucasImobiliaria, tel, sock, true);
      await sock.sendMessage(tel, { text: resposta });
    }
  });
}

connectToWhatsApp();

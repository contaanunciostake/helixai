# 🔧 Como Corrigir o Fluxo do VendeAI Bot

## 🐛 Problema Identificado

O bot **está funcionando**, mas com **fluxo incompleto**:

### ❌ O que está acontecendo AGORA:
```
Cliente envia mensagem
    ↓
IA Master analisa (✅ funciona)
    ↓
Gera resposta em TEXTO apenas (❌ problema)
    ↓
Envia só texto, SEM:
  - ❌ Fotos de veículos
  - ❌ Áudio (ElevenLabs)
  - ❌ Busca de veículos no banco
```

### ✅ O que DEVERIA acontecer:
```
Cliente envia mensagem
    ↓
IA Master analisa intenção
    ↓
Busca veículos no banco (filtros inteligentes)
    ↓
Envia 3 FOTOS dos veículos + descrição
    ↓
Gera ÁUDIO da resposta (ElevenLabs)
    ↓
Envia áudio para o cliente
```

---

## 📋 Causas do Problema

### 1. ❌ Bot está usando versão simplificada

**Arquivo**: `whatsapp_service/vendeai-bot-integration.js`
**Linha 248**: `await sock.sendMessage(message.key.remoteJid, { text: resposta });`

```javascript
// ❌ CÓDIGO ATUAL (SIMPLIFICADO)
await sock.sendMessage(message.key.remoteJid, { text: resposta });

// ✅ DEVERIA SER (COMPLETO)
// 1. Buscar veículos
const veiculos = await buscarVeiculosPorFiltros(filtros);

// 2. Enviar fotos
for (const veiculo of veiculos.slice(0, 3)) {
  await sock.sendMessage(jid, {
    image: { url: veiculo.foto_url },
    caption: formatarVeiculo(veiculo)
  });
}

// 3. Gerar e enviar áudio
if (audioAtivo) {
  const audioBuffer = await gerarAudioElevenLabs(resposta);
  await sock.sendMessage(jid, {
    audio: audioBuffer,
    mimetype: 'audio/mp4',
    ptt: true
  });
}
```

---

### 2. ❌ Configuração do áudio está desativada

**Arquivo**: `whatsapp_service/vendeai-bot-integration.js`
**Linha 111**: `audioAtivo: config?.audio_ativo || false,`

O bot está verificando `config.audio_ativo` do banco, mas esse campo está **false** ou **não existe**.

---

### 3. ❌ Não está buscando veículos do banco

O código tem funções vazias:

**Linha 399-401**:
```javascript
async function buscarVeiculos(filtros) {
  // TODO: Implementar busca real no banco
  return `Encontrei alguns veículos...`;
}
```

**❌ PROBLEMA**: Função não implementada!

---

## ✅ Solução Rápida

### Opção 1: Usar o VendeAI Bot Original (RECOMENDADO)

O VendeAI original (`VendeAI/VendeAI/bot_engine/main.js`) **JÁ TEM TUDO ISSO FUNCIONANDO**!

#### Passos:

1. **Copiar** o `main.js` do VendeAI original
2. **Adaptar** para funcionar com o Integrated Bot Server
3. **Manter** a IA Master + busca de veículos + fotos + áudio

---

### Opção 2: Completar o vendeai-bot-integration.js

Adicionar as funções que estão faltando:

#### 1. Buscar veículos do banco

```javascript
async function buscarVeiculos(filtros) {
  try {
    let query = 'SELECT * FROM veiculos WHERE empresa_id = ? AND disponivel = 1';
    const params = [empresaId];

    if (filtros.marca) {
      query += ' AND marca LIKE ?';
      params.push(`%${filtros.marca}%`);
    }

    if (filtros.modelo) {
      query += ' AND modelo LIKE ?';
      params.push(`%${filtros.modelo}%`);
    }

    if (filtros.preco_max) {
      query += ' AND preco <= ?';
      params.push(filtros.preco_max);
    }

    query += ' ORDER BY destaque DESC, criado_em DESC LIMIT 3';

    return new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  } catch (error) {
    console.error('[VENDEAI-BOT] ❌ Erro ao buscar veículos:', error);
    return [];
  }
}
```

#### 2. Enviar fotos dos veículos

```javascript
async function enviarVeiculos(jid, veiculos) {
  for (const veiculo of veiculos) {
    try {
      // Buscar foto do veículo
      const foto = await buscarFotoVeiculo(veiculo.id);

      if (foto) {
        await sock.sendMessage(jid, {
          image: { url: foto },
          caption: formatarVeiculo(veiculo)
        });
      }
    } catch (error) {
      console.error('[VENDEAI-BOT] ❌ Erro ao enviar foto:', error);
    }
  }
}

function formatarVeiculo(veiculo) {
  return `🚗 *${veiculo.marca} ${veiculo.modelo}*

📅 Ano: ${veiculo.ano_modelo}
💰 Preço: R$ ${veiculo.preco?.toLocaleString('pt-BR')}
⚙️ Motor: ${veiculo.motor || 'N/A'}
🎨 Cor: ${veiculo.cor || 'N/A'}
⛽ Combustível: ${veiculo.combustivel || 'N/A'}
${veiculo.quilometragem ? `📏 KM: ${veiculo.quilometragem}` : ''}

${veiculo.descricao || ''}`;
}
```

#### 3. Gerar e enviar áudio

```javascript
async function enviarAudio(jid, texto) {
  try {
    if (!elevenlabs || !botConfig.vozId) {
      console.log('[VENDEAI-BOT] ⚠️ ElevenLabs não configurado');
      return;
    }

    // Limpar texto para TTS
    const textoLimpo = texto
      .replace(/\*/g, '')
      .replace(/_/g, '')
      .replace(/#{1,6}\s/g, '')
      .replace(/\[.*?\]/g, '')
      .substring(0, 500);

    console.log('[VENDEAI-BOT] 🎵 Gerando áudio...');

    // Gerar áudio com ElevenLabs
    const audio = await elevenlabs.generate({
      voice: botConfig.vozId,
      text: textoLimpo,
      model_id: 'eleven_multilingual_v2'
    });

    // Converter stream para buffer
    const chunks = [];
    for await (const chunk of audio) {
      chunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(chunks);

    // Enviar áudio
    await sock.sendMessage(jid, {
      audio: audioBuffer,
      mimetype: 'audio/mp4',
      ptt: true
    });

    console.log('[VENDEAI-BOT] ✅ Áudio enviado');
  } catch (error) {
    console.error('[VENDEAI-BOT] ❌ Erro ao gerar áudio:', error);
  }
}
```

#### 4. Integrar tudo no fluxo principal

```javascript
// Linha 218 do vendeai-bot-integration.js
// DEPOIS de gerar a resposta com IA Master:

if (resultado.sucesso) {
  intencao = resultado.analises?.intencao?.intencao_principal || 'conversa_geral';
  resposta = resultado.resposta;

  // ✅ ADICIONAR AQUI: Buscar e enviar veículos
  if (intencao === 'busca' || intencao === 'interesse_compra') {
    const filtros = resultado.analises?.intencao?.filtros || {};
    const veiculos = await buscarVeiculos(filtros);

    if (veiculos.length > 0) {
      console.log(`[VENDEAI-BOT] 🚗 Enviando ${veiculos.length} veículos...`);
      await enviarVeiculos(message.key.remoteJid, veiculos);
    }
  }
}

// Salvar mensagens
await salvarMensagem(conversa.id, telefone, mensagemTexto, 'recebida');
await salvarMensagem(conversa.id, 'bot', resposta, 'enviada');

// Enviar resposta em texto
await sock.sendMessage(message.key.remoteJid, { text: resposta });

// ✅ ADICIONAR AQUI: Gerar e enviar áudio
if (botConfig.audioAtivo && elevenlabs && botConfig.vozId) {
  await enviarAudio(message.key.remoteJid, resposta);
}
```

---

## 🔧 Ativar Áudio no Banco de Dados

Execute este SQL:

```sql
-- Ativar áudio para empresa 1
UPDATE configuracoes_bot
SET
  audio_ativo = 1,
  usar_elevenlabs = 1,
  elevenlabs_api_key = 'sk_cbf174029432ab2d87a724a3b958c5d20eb796d266477ab0',
  elevenlabs_voice_id = 'r2fkFV8WAqXq2AqBpgJT'
WHERE empresa_id = 1;

-- Se não existir configuração, criar
INSERT INTO configuracoes_bot (empresa_id, audio_ativo, usar_elevenlabs, elevenlabs_api_key, elevenlabs_voice_id)
VALUES (1, 1, 1, 'sk_cbf174029432ab2d87a724a3b958c5d20eb796d266477ab0', 'r2fkFV8WAqXq2AqBpgJT')
ON DUPLICATE KEY UPDATE
  audio_ativo = 1,
  usar_elevenlabs = 1;

-- Verificar
SELECT * FROM configuracoes_bot WHERE empresa_id = 1;
```

---

## 📊 Comparação: Atual vs Corrigido

| Funcionalidade | Atual (❌) | Após Correção (✅) |
|----------------|-----------|-------------------|
| **IA Master** | ✅ Funciona | ✅ Funciona |
| **Buscar veículos** | ❌ TODO vazio | ✅ Busca real no banco |
| **Enviar fotos** | ❌ Não envia | ✅ Envia 3 fotos |
| **Gerar áudio** | ❌ Desativado | ✅ ElevenLabs ativo |
| **Simulador FIPE** | ❌ TODO | ✅ Implementado |
| **Financiamento** | ❌ TODO | ✅ Implementado |

---

## 🎯 Solução Rápida (10 minutos)

Vou criar um arquivo **vendeai-bot-integration-COMPLETO.js** que:
- ✅ Mantém IA Master
- ✅ Adiciona busca de veículos
- ✅ Adiciona envio de fotos
- ✅ Adiciona geração de áudio
- ✅ Funciona com Integrated Bot Server

---

## 📚 Próximos Passos

1. ✅ Ativar áudio no banco (SQL acima)
2. ✅ Implementar funções faltantes
3. ✅ Testar com mensagem real
4. ✅ Verificar se envia fotos + áudio

---

## 🆘 Se Quiser Ajuda

Posso:
1. Criar versão completa do `vendeai-bot-integration.js`
2. Adicionar todas as funções faltantes
3. Integrar com o VendeAI original
4. Testar o fluxo completo

Me avise se quer que eu implemente isso agora! 🚀

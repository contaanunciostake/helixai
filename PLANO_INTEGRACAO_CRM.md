# 🔄 Plano de Integração: VendeAI Bot → CRM HelixAI

## 📋 Análise da Arquitetura Atual

### Componentes Existentes

#### 1. WhatsApp Service (porta 3001)
**Localização:** `whatsapp_service/server.js`

**Funcionalidades:**
- ✅ Gerencia conexão WhatsApp via Baileys
- ✅ Gera QR Code para autenticação
- ✅ Socket.io para status em tempo real
- ✅ Webhook para Flask backend (`/api/webhook/whatsapp/message`)
- ✅ Suporte multi-empresa (sessions por empresaId)

**Status:** PRONTO - Já integrado com backend Flask

#### 2. VendeAI Bot Engine
**Localização:** `VendeAI/bot_engine/main.js` (8227 linhas)

**Funcionalidades:**
- ✅ Bot IA completo (Claude/OpenAI)
- ✅ ElevenLabs para áudio
- ✅ Módulo FIPE (consulta veículos)
- ✅ Simulador de financiamento
- ✅ Sistema de agendamento
- ✅ Message tracker (debug)
- ⚠️ Conexão WhatsApp PRÓPRIA (independente)
- ⚠️ Usa banco MySQL local
- ⚠️ NÃO consome configurações do CRM

**Problema:** Bot funciona de forma isolada, sem integração com CRM

#### 3. Backend Flask (porta 5000)
**Localização:** `backend/app.py` + `backend/routes/bot_api.py`

**Rotas bot_api.py já implementadas:**
- ✅ `GET /api/bot/config?phone=NUMERO` - Busca configuração da empresa
- ✅ `POST /api/bot/conversas` - Cria/atualiza conversa
- ✅ `POST /api/bot/mensagens` - Salva mensagem
- ✅ `POST /api/bot/leads` - Cria/atualiza lead
- ✅ `POST /api/bot/status` - Atualiza status WhatsApp
- ✅ `GET /api/bot/leads/disparo` - Busca leads para campanha
- ✅ `POST /api/bot/disparos` - Registra disparo

**Status:** API PRONTA - Aguardando bot consumir

#### 4. Banco de Dados CRM
**Localização:** `backend/database/models.py`

**Modelos implementados:**
- ✅ Empresa (multi-tenant)
- ✅ ConfiguracaoBot (configurações por empresa)
- ✅ Lead (status, temperatura, scoring)
- ✅ Conversa (contexto IA, métricas)
- ✅ Mensagem (tipos, sentimento, intenção)
- ✅ Campanha + Disparo
- ✅ Produto + Veiculo
- ✅ MetricaConversa (analytics)

**Status:** COMPLETO - Aguardando dados do bot

---

## 🎯 Problema Identificado

Existem **DOIS sistemas WhatsApp independentes:**

```
Sistema Atual (Duplicado):

┌─────────────────┐              ┌─────────────────┐
│ WhatsApp Web    │              │ WhatsApp Web    │
│   (Baileys)     │              │   (Baileys)     │
└────────┬────────┘              └────────┬────────┘
         │                                │
         ▼                                ▼
┌─────────────────┐              ┌─────────────────┐
│ WhatsApp Service│              │ VendeAI Bot     │
│  (port 3001)    │              │  (standalone)   │
│                 │              │                 │
│ - QR Code       │              │ - IA Claude/GPT │
│ - Socket.io     │              │ - ElevenLabs    │
│ - Webhook Flask │              │ - FIPE          │
└────────┬────────┘              │ - Financiamento │
         │                       └────────┬────────┘
         ▼                                │
┌─────────────────┐                       ▼
│ Flask Backend   │              ┌─────────────────┐
│  (port 5000)    │              │ MySQL Local     │
│                 │              │ (isolado)       │
│ - CRM Database  │              └─────────────────┘
└─────────────────┘
```

**Problemas:**
1. Bot não usa configurações do CRM
2. Bot não salva leads/conversas no CRM
3. Duas conexões WhatsApp (desperdício)
4. Dados isolados em bancos diferentes

---

## ✅ Solução: Arquitetura Integrada

```
Sistema Integrado (Proposto):

                    ┌─────────────────┐
                    │  WhatsApp Web   │
                    │   (Baileys)     │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ WhatsApp Service│
                    │   (port 3001)   │
                    │                 │
                    │ - Gerencia QR   │
                    │ - Socket.io     │
                    │ - Sessões       │
                    └────────┬────────┘
                             │
                ┌────────────┴────────────┐
                ▼                         ▼
       ┌─────────────────┐      ┌─────────────────┐
       │ Flask Backend   │◄─────┤ VendeAI Bot     │
       │  (port 5000)    │      │   (adaptado)    │
       │                 │      │                 │
       │ - API Config    │──────►│ - Consome API  │
       │ - Webhook       │      │ - Salva Leads   │
       │ - CRM Database  │      │ - IA + Audio    │
       └────────┬────────┘      └─────────────────┘
                │
                ▼
       ┌─────────────────┐
       │  MySQL CRM      │
       │                 │
       │ - Empresas      │
       │ - Leads         │
       │ - Conversas     │
       │ - Mensagens     │
       └─────────────────┘
```

**Fluxo:**
1. WhatsApp Service recebe mensagem
2. Notifica Flask Backend via webhook
3. Flask Backend chama VendeAI Bot (via HTTP ou fila)
4. Bot consulta configurações do CRM
5. Bot processa com IA
6. Bot salva lead/conversa no CRM via API
7. Bot retorna resposta para WhatsApp Service
8. WhatsApp Service envia mensagem ao usuário

---

## 🔧 Tarefas de Implementação

### ✅ Etapa 1: Analisar arquitetura atual e criar plano
- [x] Ler código WhatsApp Service
- [x] Ler código Bot Engine
- [x] Ler API Backend
- [x] Documentar plano de integração

### 🔄 Etapa 2: Adaptar bot_engine para consumir configurações do CRM

**Arquivo:** `VendeAI/bot_engine/main.js`

**Mudanças necessárias:**

1. **Adicionar busca de configuração ao iniciar conversa:**
```javascript
// Linha ~7500 (dentro de handleMessage)
async function buscarConfiguracaoEmpresa(numeroWhatsApp) {
  try {
    const response = await axios.get('http://localhost:5000/api/bot/config', {
      params: { phone: numeroWhatsApp }
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar config:', error);
    return null;
  }
}
```

2. **Usar configurações dinâmicas ao invés de .env:**
```javascript
// Substituir:
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

// Por:
const config = await buscarConfiguracaoEmpresa(sock.user.id);
const OPENAI_API_KEY = config.config.openai_api_key;
const ELEVENLABS_API_KEY = config.config.elevenlabs_api_key;
```

3. **Personalizar prompt do sistema por empresa:**
```javascript
// Usar config.config.prompt_sistema ao invés de hardcoded
```

### 🔄 Etapa 3: Integrar sistema de conversas com banco CRM

**Arquivo:** `VendeAI/bot_engine/main.js`

**Implementar:**

1. **Criar/atualizar conversa ao receber mensagem:**
```javascript
async function registrarConversa(empresaId, telefone, nomeContato) {
  await axios.post('http://localhost:5000/api/bot/conversas', {
    empresa_id: empresaId,
    telefone: telefone,
    nome_contato: nomeContato
  });
}
```

2. **Salvar todas as mensagens:**
```javascript
async function salvarMensagem(conversaId, tipo, conteudo, enviadaPorBot) {
  await axios.post('http://localhost:5000/api/bot/mensagens', {
    conversa_id: conversaId,
    tipo: tipo,
    conteudo: conteudo,
    enviada_por_bot: enviadaPorBot
  });
}
```

### 🔄 Etapa 4: Conectar WhatsApp Service com bot_engine

**Arquivo:** `whatsapp_service/server.js`

**Mudanças:**

1. **Linha 194: Ao receber mensagem, chamar bot ao invés de apenas notificar backend:**
```javascript
// Event: Mensagem recebida
sock.ev.on('messages.upsert', async ({ messages }) => {
  for (const message of messages) {
    if (message.key.fromMe) continue;

    const from = message.key.remoteJid;
    const text = message.message?.conversation ||
                 message.message?.extendedTextMessage?.text || '';

    // ✅ NOVO: Enviar para bot processar
    const botResponse = await callBotEngine(empresaId, from, text);

    // Enviar resposta via WhatsApp
    if (botResponse?.text) {
      await sock.sendMessage(from, { text: botResponse.text });
    }

    if (botResponse?.audio) {
      await sock.sendMessage(from, {
        audio: { url: botResponse.audio },
        mimetype: 'audio/mp4',
        ptt: true
      });
    }

    // Notificar backend Flask
    notifyBackend(empresaId, 'message_received', { from, text });
  }
});
```

2. **Adicionar função de chamada ao bot:**
```javascript
async function callBotEngine(empresaId, from, text) {
  try {
    const response = await axios.post('http://localhost:3002/process-message', {
      empresaId,
      from,
      text
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao chamar bot:', error);
    return null;
  }
}
```

### 🔄 Etapa 5: Atualizar rotas backend

**Arquivo:** `backend/routes/webhook.py`

**Adicionar endpoint para processar mensagens:**

```python
@bp.route('/webhook/whatsapp/message', methods=['POST'])
def whatsapp_message():
    data = request.json
    empresaId = data.get('empresaId')
    from_number = data.get('from')
    text = data.get('text')

    # Processar mensagem (pode ser assíncrono com Celery)
    # Por enquanto, apenas log
    print(f"[WEBHOOK] Empresa {empresaId}: {from_number} -> {text}")

    return jsonify({'success': True})
```

### 🔄 Etapa 6: Implementar webhook para registro de leads

**Arquivo:** `VendeAI/bot_engine/main.js`

**Adicionar ao processar mensagem:**

```javascript
async function detectarERegistrarLead(empresaId, telefone, mensagem, contexto) {
  // Detectar intenção de compra
  const temInteresse = detectarInteresse(mensagem);

  if (temInteresse) {
    await axios.post('http://localhost:5000/api/bot/leads', {
      empresa_id: empresaId,
      telefone: telefone,
      nome: contexto.nome || 'Lead WhatsApp',
      origem: 'whatsapp',
      temperatura: 'QUENTE',
      interesse: mensagem
    });
  }
}
```

### 🔄 Etapa 7: Atualizar frontend CRM

**Arquivos:**
- `CRM_Client/crm-client-app/src/pages/Conversas.jsx`
- `CRM_Admin/crm-admin-app/src/pages/Dashboard.jsx`

**Implementar:**

1. **Página de conversas em tempo real**
2. **Indicador de bot ativo/inativo**
3. **Métricas do bot no dashboard**
4. **Histórico de mensagens**

### 🔄 Etapa 8: Testar fluxo completo

**Checklist de testes:**

- [ ] WhatsApp conecta via QR Code
- [ ] Mensagem enviada → Bot recebe
- [ ] Bot consulta configuração do CRM
- [ ] Bot processa com IA (Claude/GPT)
- [ ] Bot salva conversa no banco
- [ ] Bot salva mensagem no banco
- [ ] Bot cria lead se detectar interesse
- [ ] Bot envia resposta (texto + áudio)
- [ ] Frontend CRM exibe conversa
- [ ] Métricas atualizadas

---

## 📝 Notas Técnicas

### Configurações que bot vai consumir do CRM:

```python
config = {
    'descricao_empresa': '...',
    'produtos_servicos': '...',
    'tom_conversa': 'casual',
    'mensagem_boas_vindas': '...',
    'auto_resposta_ativa': True,
    'enviar_audio': True,
    'openai_api_key': 'sk-...',
    'elevenlabs_api_key': '...',
    'modulo_fipe_ativo': True,
    'modulo_financiamento_ativo': True
}
```

### Dados que bot vai salvar no CRM:

**Conversa:**
- empresa_id
- telefone
- nome_contato
- contexto (JSON com histórico resumido)
- intencao_atual
- total_mensagens

**Mensagem:**
- conversa_id
- tipo (TEXTO, AUDIO)
- conteudo
- enviada_por_bot (True/False)
- intencao_detectada
- sentimento

**Lead:**
- empresa_id
- telefone
- nome
- status (NOVO, QUALIFICADO)
- temperatura (QUENTE, MORNO, FRIO)
- origem ('whatsapp')
- interesse

---

## 🚀 Próximos Passos

1. ✅ **Análise completa** (CONCLUÍDO)
2. ⏭️ **Adaptar bot_engine** (PRÓXIMO)
3. ⏭️ **Integrar conversas**
4. ⏭️ **Conectar WhatsApp Service**
5. ⏭️ **Testar integração**

---

**Data de criação:** 2025-01-18
**Autor:** Claude Code
**Status:** Em Implementação

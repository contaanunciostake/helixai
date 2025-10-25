# 🏢 Arquitetura Multi-Tenant do Bot WhatsApp

## ❌ Problema Atual

**A arquitetura atual do bot suporta APENAS 1 EMPRESA por vez!**

### Por quê?

Olhando o código `bot-api-server.js` (linhas 57-65):

```javascript
// ESTADO GLOBAL DO BOT - ❌ APENAS UMA SESSÃO!
let botState = {
  connected: false,
  connectionStatus: 'disconnected',
  qrCode: null,
  qrCodeRaw: null,
  phoneNumber: null,
  error: null
};
```

**Isso significa:**
- ❌ Apenas 1 QR Code por vez
- ❌ Apenas 1 WhatsApp conectado por vez
- ❌ Se Empresa A conectar, Empresa B não consegue conectar
- ❌ Para 10 lojas, seria necessário 10 servidores diferentes

---

## 📊 Cenário Atual vs Necessário

### Cenário Atual (Single-Tenant):
```
Bot VendeAI (Porta 3010)
  ↓
  └─ 1 ÚNICA SESSÃO WhatsApp
       ↓
       └─ Empresa A (conectada)

❌ Empresa B → Não consegue conectar
❌ Empresa C → Não consegue conectar
...
❌ Empresa J → Não consegue conectar
```

### Cenário Necessário (Multi-Tenant):
```
Bot VendeAI (Porta 3010)
  ↓
  ├─ SESSÃO 1 → Empresa A (Loja de Carros RJ)
  ├─ SESSÃO 2 → Empresa B (Loja de Carros SP)
  ├─ SESSÃO 3 → Empresa C (Loja de Carros MG)
  ├─ ...
  └─ SESSÃO 10 → Empresa J (Loja de Carros BA)
```

**Todas conectadas simultaneamente no mesmo servidor!**

---

## ✅ Solução: Arquitetura Multi-Sessão

### Mudanças Necessárias:

#### 1. Estado por Empresa (não global)

**Antes:**
```javascript
// ❌ Um único estado global
let botState = {
  connected: false,
  qrCode: null,
  phoneNumber: null
};
```

**Depois:**
```javascript
// ✅ Map de estados por empresa_id
const botSessions = new Map();

// Cada empresa tem seu próprio estado:
botSessions.set(empresaId, {
  connected: false,
  qrCode: null,
  phoneNumber: null,
  sock: null,           // Cliente WhatsApp específico
  saveCreds: null,      // Função para salvar credenciais
  wsClients: new Set()  // WebSockets da empresa
});
```

#### 2. Cliente WhatsApp por Empresa

**Antes:**
```javascript
// ❌ Um único cliente WhatsApp
const sock = makeWASocket({
  auth: state,
  printQRInTerminal: true
});
```

**Depois:**
```javascript
// ✅ Cliente WhatsApp para CADA empresa
async function createWhatsAppSession(empresaId) {
  const authPath = `./auth_info_baileys/empresa_${empresaId}`;

  const { state, saveCreds } = await useMultiFileAuthState(authPath);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false // Enviar via WebSocket
  });

  // Armazenar sessão
  botSessions.set(empresaId, {
    sock,
    saveCreds,
    connected: false,
    qrCode: null,
    phoneNumber: null,
    wsClients: new Set()
  });

  return sock;
}
```

#### 3. WebSocket por Empresa

**Antes:**
```javascript
// ❌ Todos os clientes recebem o mesmo QR Code
wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'qr', data: botState.qrCode }));
});
```

**Depois:**
```javascript
// ✅ Cliente recebe QR Code apenas da SUA empresa
wss.on('connection', (ws, req) => {
  // Extrair empresa_id da URL: ws://localhost:3010/ws?empresa_id=5
  const params = new URLSearchParams(req.url.split('?')[1]);
  const empresaId = parseInt(params.get('empresa_id'));

  // Adicionar cliente à sessão da empresa
  const session = botSessions.get(empresaId);
  if (session) {
    session.wsClients.add(ws);

    // Enviar estado específico da empresa
    ws.send(JSON.stringify({
      type: 'status',
      data: {
        connected: session.connected,
        qrCode: session.qrCode,
        phoneNumber: session.phoneNumber
      }
    }));
  }
});
```

#### 4. Endpoints com empresa_id

**Antes:**
```javascript
// ❌ Status geral (não diferencia empresas)
app.get('/api/bot/status', (req, res) => {
  res.json(botState);
});
```

**Depois:**
```javascript
// ✅ Status específico da empresa
app.get('/api/bot/status/:empresaId', (req, res) => {
  const empresaId = parseInt(req.params.empresaId);
  const session = botSessions.get(empresaId);

  if (!session) {
    return res.status(404).json({ error: 'Empresa não encontrada' });
  }

  res.json({
    connected: session.connected,
    qrCode: session.qrCode,
    phoneNumber: session.phoneNumber,
    connectionStatus: session.connected ? 'connected' : 'disconnected'
  });
});

// ✅ Gerar QR Code para empresa específica
app.post('/api/bot/connect/:empresaId', async (req, res) => {
  const empresaId = parseInt(req.params.empresaId);

  // Verificar se sessão já existe
  let session = botSessions.get(empresaId);

  if (!session || !session.connected) {
    // Criar nova sessão WhatsApp para esta empresa
    await createWhatsAppSession(empresaId);
  }

  res.json({ success: true, message: 'Conectando...' });
});
```

---

## 🗂️ Estrutura de Pastas para Multi-Sessão

```
VendeAI/bot_engine/
├── bot-api-server.js
├── main.js
└── auth_info_baileys/
    ├── empresa_1/          ← Credenciais Empresa 1 (Loja RJ)
    │   ├── creds.json
    │   └── session.json
    ├── empresa_2/          ← Credenciais Empresa 2 (Loja SP)
    │   ├── creds.json
    │   └── session.json
    ├── empresa_3/          ← Credenciais Empresa 3 (Loja MG)
    │   ├── creds.json
    │   └── session.json
    └── ...
```

**Benefícios:**
- ✅ Cada empresa tem suas próprias credenciais
- ✅ Desconectar Empresa A não afeta Empresa B
- ✅ QR Codes separados
- ✅ Fácil de gerenciar

---

## 🔄 Fluxo Multi-Tenant Completo

### Cenário: 3 Lojas Conectando Simultaneamente

```
1. Loja RJ (empresa_id=1):
   → Acessa CRM: http://localhost:5173
   → WebSocket: ws://localhost:3010/ws?empresa_id=1
   → Clica "Gerar QR Code"
   → POST /api/bot/connect/1
   → Recebe QR Code específico da Loja RJ
   → Escaneia e conecta WhatsApp da Loja RJ
   ✅ CONECTADO

2. Loja SP (empresa_id=2):
   → Acessa CRM: http://localhost:5173
   → WebSocket: ws://localhost:3010/ws?empresa_id=2
   → Clica "Gerar QR Code"
   → POST /api/bot/connect/2
   → Recebe QR Code específico da Loja SP
   → Escaneia e conecta WhatsApp da Loja SP
   ✅ CONECTADO (NÃO AFETA LOJA RJ!)

3. Loja MG (empresa_id=3):
   → Acessa CRM: http://localhost:5173
   → WebSocket: ws://localhost:3010/ws?empresa_id=3
   → Clica "Gerar QR Code"
   → POST /api/bot/connect/3
   → Recebe QR Code específico da Loja MG
   → Escaneia e conecta WhatsApp da Loja MG
   ✅ CONECTADO (NÃO AFETA LOJA RJ NEM SP!)
```

**Resultado:**
```
Bot VendeAI (Porta 3010)
  ├─ ✅ Loja RJ (WhatsApp: +5521999999999)
  ├─ ✅ Loja SP (WhatsApp: +5511888888888)
  └─ ✅ Loja MG (WhatsApp: +5531777777777)

TODAS ATIVAS SIMULTANEAMENTE! 🎉
```

---

## 📝 Mudanças no Frontend (App.jsx)

**Antes:**
```javascript
// ❌ WebSocket sem identificação da empresa
const ws = new WebSocket('ws://localhost:3010/ws');
```

**Depois:**
```javascript
// ✅ WebSocket com empresa_id
const empresaId = user.empresa_id; // Do contexto de autenticação
const ws = new WebSocket(`ws://localhost:3010/ws?empresa_id=${empresaId}`);
```

**Antes:**
```javascript
// ❌ Endpoints sem empresa_id
fetch('http://localhost:3010/api/bot/status')
fetch('http://localhost:3010/api/bot/qr')
```

**Depois:**
```javascript
// ✅ Endpoints com empresa_id
const empresaId = user.empresa_id;
fetch(`http://localhost:3010/api/bot/status/${empresaId}`)
fetch(`http://localhost:3010/api/bot/connect/${empresaId}`, { method: 'POST' })
```

---

## 🚀 Implementação Step-by-Step

### Fase 1: Refatorar bot-api-server.js
1. Substituir `botState` por `botSessions` (Map)
2. Adicionar `empresa_id` em todos os endpoints
3. Modificar WebSocket para filtrar por empresa
4. Criar função `createWhatsAppSession(empresaId)`

### Fase 2: Refatorar main.js
1. Modificar para criar múltiplos clientes WhatsApp
2. Separar pasta de auth por empresa (`auth_info_baileys/empresa_X`)
3. Handler de mensagens por sessão

### Fase 3: Atualizar Frontend (App.jsx)
1. Adicionar `empresa_id` nas URLs WebSocket
2. Adicionar `empresa_id` em todas as chamadas de API
3. Usar `user.empresa_id` do contexto de autenticação

### Fase 4: Testar Multi-Tenant
1. Criar 3 empresas de teste
2. Abrir 3 navegadores diferentes (ou abas anônimas)
3. Conectar cada um a uma empresa diferente
4. Verificar que todos se conectam simultaneamente

---

## 🎯 Benefícios da Arquitetura Multi-Tenant

✅ **Escalável**: Suporta centenas de empresas no mesmo servidor
✅ **Isolamento**: Cada empresa tem suas credenciais separadas
✅ **Eficiente**: Um único servidor ao invés de 10+
✅ **Custo**: Menor consumo de recursos (RAM, CPU)
✅ **Manutenção**: Um único código para atualizar
✅ **SaaS Ready**: Pronto para oferecer como serviço

---

## 💡 Próximos Passos

### Opção A: Implementar Agora (Recomendado)
Refatorar o código para suportar multi-sessão desde já. Evita retrabalho futuro.

### Opção B: Manter Single-Tenant Temporariamente
Continuar com arquitetura atual e refatorar depois quando tiver mais de 1 cliente. **Não recomendado** - retrabalho será maior.

---

**Qual opção você prefere? Quer que eu implemente a arquitetura multi-tenant agora?** 🚀

# 🔧 Patch: App.jsx para Multi-Tenant

## Mudanças Necessárias no Frontend

### 1. WebSocket - Adicionar empresa_id na URL

**Linha ~532:**

**Antes:**
```javascript
ws = new WebSocket(botConfig.wsUrl)
```

**Depois:**
```javascript
ws = new WebSocket(`${botConfig.wsUrl}?empresa_id=${user?.empresa_id || 1}`)
```

---

### 2. Endpoint /api/bot/reconnect - Adicionar empresa_id

**Linha ~656:**

**Antes:**
```javascript
const reconnectResponse = await fetch(`${botConfig.apiUrl}/api/bot/reconnect`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
});
```

**Depois:**
```javascript
const reconnectResponse = await fetch(`${botConfig.apiUrl}/api/bot/reconnect/${user?.empresa_id || 1}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
});
```

---

### 3. Endpoint /api/bot/disconnect - Adicionar empresa_id

**Linha ~681:**

**Antes:**
```javascript
const response = await fetch(`${botConfig.apiUrl}/api/bot/disconnect`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
});
```

**Depois:**
```javascript
const response = await fetch(`${botConfig.apiUrl}/api/bot/disconnect/${user?.empresa_id || 1}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
});
```

---

### 4. Endpoint /api/bot/clear - REMOVER

**Linha ~708:**

**Antes:**
```javascript
const response = await fetch(`${botConfig.apiUrl}/api/bot/clear`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
});
```

**Depois:**
```javascript
// ❌ REMOVER - Usar /api/bot/disconnect ao invés de /api/bot/clear
// O disconnect já faz logout completo no multi-tenant
const response = await fetch(`${botConfig.apiUrl}/api/bot/disconnect/${user?.empresa_id || 1}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
});
```

---

### 5. Função generateQRCode - Usar /api/bot/connect

**Adicionar nova chamada antes de reconnect:**

**Linha ~645 (dentro de generateQRCode):**

**Antes:**
```javascript
const generateQRCode = async () => {
  // ... validações ...

  setIsConnecting(true)
  console.log('[CRM] Gerando QR Code...')

  try {
    const botConfig = getBotConfig()

    // ✅ Forçar reconexão
    console.log('[CRM] Forçando reconexão...');
    const reconnectResponse = await fetch(`${botConfig.apiUrl}/api/bot/reconnect`, {
      method: 'POST',
      // ...
    });
  }
}
```

**Depois:**
```javascript
const generateQRCode = async () => {
  // ... validações ...

  setIsConnecting(true)
  console.log('[CRM] Gerando QR Code...')

  try {
    const botConfig = getBotConfig()
    const empresaId = user?.empresa_id || 1

    // ✅ Criar/conectar sessão
    console.log(`[CRM] Conectando empresa ${empresaId}...`);
    const connectResponse = await fetch(`${botConfig.apiUrl}/api/bot/connect/${empresaId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (connectResponse.ok) {
      showNotificationMsg('Gerando QR Code... Aguarde');
      // O QR code virá via WebSocket
    } else {
      throw new Error('Falha ao conectar');
    }
  }
}
```

---

## 📝 Resumo das Mudanças

### API Endpoints Atualizados:

| Antes | Depois |
|-------|--------|
| `ws://localhost:3010/ws` | `ws://localhost:3010/ws?empresa_id=X` |
| `POST /api/bot/reconnect` | `POST /api/bot/reconnect/:empresaId` |
| `POST /api/bot/disconnect` | `POST /api/bot/disconnect/:empresaId` |
| `POST /api/bot/clear` | **REMOVIDO** (usar disconnect) |
| *Não existia* | `POST /api/bot/connect/:empresaId` ✅ |

### Novos Endpoints Disponíveis:

- `GET /api/bot/status/:empresaId` - Status da sessão
- `POST /api/bot/connect/:empresaId` - Criar/conectar sessão
- `GET /api/bot/sessions` - Listar todas as sessões ativas

---

## 🧪 Como Testar

### 1. Empresa A (empresa_id=1):
```javascript
// WebSocket
ws://localhost:3010/ws?empresa_id=1

// API
POST http://localhost:3010/api/bot/connect/1
GET  http://localhost:3010/api/bot/status/1
POST http://localhost:3010/api/bot/disconnect/1
```

### 2. Empresa B (empresa_id=2):
```javascript
// WebSocket
ws://localhost:3010/ws?empresa_id=2

// API
POST http://localhost:3010/api/bot/connect/2
GET  http://localhost:3010/api/bot/status/2
POST http://localhost:3010/api/bot/disconnect/2
```

### 3. Listar Todas as Sessões:
```javascript
GET http://localhost:3010/api/bot/sessions

// Resposta:
{
  "success": true,
  "data": {
    "total": 2,
    "connected": 2,
    "disconnected": 0,
    "sessions": [
      {
        "empresaId": 1,
        "connected": true,
        "phoneNumber": "+5511999999999",
        "connectionStatus": "connected"
      },
      {
        "empresaId": 2,
        "connected": true,
        "phoneNumber": "+5521888888888",
        "connectionStatus": "connected"
      }
    ]
  }
}
```

---

## ✅ Benefícios

1. ✅ **Múltiplas empresas conectadas simultaneamente**
2. ✅ **Credenciais isoladas** (auth_info_baileys/empresa_X)
3. ✅ **WebSocket filtrado por empresa**
4. ✅ **Não há conflito entre sessões**
5. ✅ **Escalável para centenas de empresas**

---

## 🚀 Próximo Passo

Aplicar essas mudanças no arquivo:
```
D:\Helix\HelixAI\CRM_Client\crm-client-app\src\App.jsx
```

Ou posso criar um arquivo `App-multi-tenant.jsx` com todas as mudanças já aplicadas.

**Quer que eu crie o arquivo App-multi-tenant.jsx completo?**

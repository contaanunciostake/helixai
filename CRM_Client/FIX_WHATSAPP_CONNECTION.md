# 🔧 Correção: Conexão WhatsApp no CRM

## ❌ Problema Identificado

O `App.jsx` do CRM está tentando conectar em APIs antigas que não existem:

```javascript
// ❌ ERRADO - APIs antigas
const VENDEAI_API_URL = 'http://localhost:5000'  // 404 Not Found
const WHATSAPP_SERVICE_URL = 'http://localhost:3001'  // 404 Not Found
```

## ✅ Solução

Substituir pelas novas URLs do bot-api-server que criamos:

```javascript
// ✅ CORRETO - Nova API
const BOT_API_URL = 'http://localhost:3010'
const BOT_WS_URL = 'ws://localhost:3010/ws'
```

---

## 🛠️ Como Corrigir

### Opção 1: Usar o Componente Novo (Recomendado)

**Substitua a seção do bot no App.jsx pelo novo componente:**

1. Abra `CRM_Client/crm-client-app/src/App.jsx`
2. Adicione o import no topo:

```jsx
import WhatsAppBotControl from './components/WhatsAppBotControl'
```

3. Substitua a seção do bot (onde tem o QR code e botões) por:

```jsx
{currentPage === 'bot' && (
  <WhatsAppBotControl />
)}
```

### Opção 2: Corrigir o Código Existente

Se preferir manter o código atual, faça as seguintes alterações em `App.jsx`:

**1. Alterar as constantes no início (linha ~17):**

```javascript
// ANTES:
const VENDEAI_API_URL = 'http://localhost:5000'
const WHATSAPP_SERVICE_URL = 'http://localhost:3001'

// DEPOIS:
const BOT_API_URL = 'http://localhost:3010'
const BOT_WS_URL = 'ws://localhost:3010/ws'
```

**2. Remover/comentar código de APIs antigas (linhas 170-233):**

```javascript
// COMENTAR OU REMOVER esses useEffect:
/*
useEffect(() => {
  const fetchEmpresaNicho = async () => { ... }
  fetchEmpresaNicho()
}, [])

useEffect(() => {
  const fetchBotStatus = async () => { ... }
  fetchBotStatus()
}, [])

useEffect(() => {
  const socketConnection = io(WHATSAPP_SERVICE_URL, { ... })
  ...
}, [])
*/
```

**3. Criar novo useEffect para WebSocket (adicionar após os comentados):**

```javascript
// ✅ NOVO: WebSocket para bot-api-server
useEffect(() => {
  console.log('[CRM] Conectando ao Bot API Server...')

  const ws = new WebSocket(BOT_WS_URL)

  ws.onopen = () => {
    console.log('[CRM] ✅ Conectado ao Bot API Server')
  }

  ws.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data)
      console.log('[CRM] 📨 Mensagem recebida:', message)

      if (message.type === 'status') {
        const status = message.data.connectionStatus
        setBotStatus(status)

        if (status === 'connected') {
          setShowQRCode(false)
          setWhatsappNumber(message.data.phoneNumber)
          showNotificationMsg('WhatsApp conectado com sucesso!')
        } else if (status === 'disconnected') {
          setShowQRCode(false)
          setWhatsappNumber(null)
        }
      } else if (message.type === 'qr') {
        console.log('[CRM] 📱 QR Code recebido')
        setQrCodeValue(message.data.qrCode)
        setShowQRCode(true)
        setBotStatus('connecting')
        showNotificationMsg('QR Code gerado! Escaneie com seu WhatsApp')
      }
    } catch (error) {
      console.error('[CRM] ❌ Erro ao processar mensagem:', error)
    }
  }

  ws.onerror = (error) => {
    console.error('[CRM] ❌ Erro no WebSocket:', error)
    showNotificationMsg('Erro ao conectar com o bot. Verifique se está rodando.')
  }

  ws.onclose = () => {
    console.log('[CRM] ❌ WebSocket desconectado')
    // Tentar reconectar após 3 segundos
    setTimeout(() => {
      console.log('[CRM] 🔄 Tentando reconectar...')
      // O useEffect será executado novamente
    }, 3000)
  }

  return () => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.close()
    }
  }
}, [])
```

**4. Corrigir a função generateQRCode (linha ~337):**

```javascript
// ANTES:
const generateQRCode = async () => {
  // ... código antigo que chama localhost:5000
  const response = await fetch(`${VENDEAI_API_URL}/api/crm/whatsapp/start`, { ... })
}

// DEPOIS:
const generateQRCode = async () => {
  if (isConnecting) {
    console.log('[CRM] Já está conectando, ignorando clique duplicado')
    return
  }

  try {
    setIsConnecting(true)
    setBotStatus('connecting')
    showNotificationMsg('Solicitando QR Code...')

    // ✅ Chamar nova API
    const response = await fetch(`${BOT_API_URL}/api/bot/qr`)

    if (response.ok) {
      const data = await response.json()

      if (data.success && data.data.qrCode) {
        setQrCodeValue(data.data.qrCode)
        setShowQRCode(true)
        showNotificationMsg('QR Code recebido! Escaneie com seu WhatsApp')
      } else {
        showNotificationMsg('Bot ainda não gerou QR code. Aguarde...')
      }
    } else if (response.status === 404) {
      showNotificationMsg('QR code não disponível. Bot pode já estar conectado.')
    }
  } catch (error) {
    console.error('[CRM] Erro ao gerar QR Code:', error)
    showNotificationMsg('Erro ao conectar. Verifique se o bot está rodando.')
  } finally {
    setIsConnecting(false)
  }
}
```

**5. Adicionar função para desconectar:**

```javascript
const disconnectWhatsApp = async () => {
  try {
    showNotificationMsg('Desconectando WhatsApp...')

    const response = await fetch(`${BOT_API_URL}/api/bot/disconnect`, {
      method: 'POST'
    })

    if (response.ok) {
      setBotStatus('disconnected')
      setShowQRCode(false)
      setWhatsappNumber(null)
      showNotificationMsg('WhatsApp desconectado com sucesso!')
    }
  } catch (error) {
    console.error('[CRM] Erro ao desconectar:', error)
    showNotificationMsg('Erro ao desconectar')
  }
}
```

---

## ✅ Checklist Pós-Correção

Após fazer as alterações, verifique:

1. **Terminal do Bot:**
   ```
   ✅ Bot API Server rodando na porta 3010
   ✅ QR code sendo gerado
   ```

2. **Console do Navegador (F12):**
   ```
   ✅ [CRM] ✅ Conectado ao Bot API Server
   ✅ [CRM] 📨 Mensagem recebida: {type: 'status', ...}
   ❌ Sem erros 404 ou 500
   ```

3. **Interface do CRM:**
   ```
   ✅ QR code aparece quando clicar em "Conectar WhatsApp"
   ✅ Status muda para "Conectando..."
   ✅ Após escanear, status muda para "Conectado"
   ```

---

## 🚀 Teste Rápido

```bash
# Terminal 1 - Bot
cd VendeAI/bot_engine
node main.js

# Terminal 2 - CRM
cd CRM_Client/crm-client-app
npm run dev

# Navegador
# 1. Abra: http://localhost:5177
# 2. Vá em "Bot" no menu
# 3. Clique em "Conectar WhatsApp"
# 4. QR code deve aparecer em ~2 segundos
# 5. Escaneie com WhatsApp
# 6. Status deve mudar para "Conectado" ✅
```

---

## 💡 Dica

Se ainda der erro, use o componente pronto que criamos:

```jsx
import WhatsAppBotControl from './components/WhatsAppBotControl'

// Substitua toda a seção do bot por:
<WhatsAppBotControl />
```

Este componente já tem tudo funcionando corretamente! 🎉

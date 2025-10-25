# 🔧 Correção Manual Simples - App.jsx

## ❌ Problema

O CRM está tentando conectar em APIs antigas (porta 5000 e 3001) que não existem.

## ✅ Solução Rápida (2 Minutos)

### Passo 1: Abrir App.jsx

Abra o arquivo: `CRM_Client/crm-client-app/src/App.jsx`

### Passo 2: Localizar Linha ~16-18

Procure por (pressione Ctrl+F e busque por "VENDEAI_API"):

```javascript
const VENDEAI_API_URL = 'http://localhost:5000'
const WHATSAPP_SERVICE_URL = 'http://localhost:3001'
```

### Passo 3: Comentar e Adicionar Novas Linhas

**SUBSTITUA por:**

```javascript
// ✅ Nova API do bot-api-server
const BOT_API_URL = 'http://localhost:3010'
const BOT_WS_URL = 'ws://localhost:3010/ws'

// APIs antigas (não funcionam mais)
// const VENDEAI_API_URL = 'http://localhost:5000'
// const WHATSAPP_SERVICE_URL = 'http://localhost:3001'
```

### Passo 4: Comentar Socket.IO (Linha ~242-303)

Procure por "// Conectar ao WhatsApp Service via Socket.io" (linha ~242)

**COMENTE toda essa seção** colocando `/*` no início e `*/` no final:

```javascript
/* // Conectar ao WhatsApp Service via Socket.io
  useEffect(() => {
    console.log('[CRM] Conectando ao WhatsApp Service...')
    const socketConnection = io(WHATSAPP_SERVICE_URL, {
      transports: ['websocket', 'polling']
    })

    ... TUDO ATÉ O FINAL DO useEffect ...

    return () => {
      socketConnection.disconnect()
    }
  }, [])
*/
```

### Passo 5: Adicionar Novo WebSocket

Logo após o Socket.IO comentado, adicione:

```javascript
// ✅ NOVO: WebSocket para bot-api-server
useEffect(() => {
  if (typeof window === 'undefined') return

  console.log('[CRM] Conectando ao Bot API Server...')
  let ws = null

  const connectWebSocket = () => {
    try {
      ws = new WebSocket(BOT_WS_URL)

      ws.onopen = () => {
        console.log('[CRM] ✅ Conectado ao Bot API Server')
      }

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          console.log('[CRM] 📨 Mensagem:', message)

          if (message.type === 'status') {
            const status = message.data.connectionStatus
            setBotStatus(status)

            if (status === 'connected') {
              setShowQRCode(false)
              setWhatsappNumber(message.data.phoneNumber)
              showNotificationMsg('WhatsApp conectado!')
            } else if (status === 'disconnected') {
              setShowQRCode(false)
              setWhatsappNumber(null)
            }
          } else if (message.type === 'qr') {
            console.log('[CRM] 📱 QR Code recebido')
            setQrCodeValue(message.data.qrCode)
            setShowQRCode(true)
            setBotStatus('connecting')
            setIsConnecting(false)
            showNotificationMsg('QR Code gerado! Escaneie')
          }
        } catch (error) {
          console.error('[CRM] ❌ Erro:', error)
        }
      }

      ws.onerror = (error) => {
        console.error('[CRM] ❌ Erro no WebSocket:', error)
        showNotificationMsg('Erro ao conectar. Verifique se o bot está rodando.')
      }

      ws.onclose = () => {
        console.log('[CRM] ❌ WebSocket desconectado')
        setTimeout(() => {
          console.log('[CRM] 🔄 Reconectando...')
          connectWebSocket()
        }, 3000)
      }
    } catch (error) {
      console.error('[CRM] ❌ Erro:', error)
    }
  }

  connectWebSocket()

  return () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close()
    }
  }
}, [])
```

### Passo 6: Salvar e Testar

1. **Salve o arquivo** (Ctrl+S)
2. **Certifique-se que o bot está rodando:**
   ```bash
   cd VendeAI/bot_engine
   node main.js
   ```
3. **Reinicie o CRM** (se já estiver rodando):
   ```bash
   # No terminal do CRM, pressione Ctrl+C e depois:
   npm run dev
   ```
4. **Acesse:** http://localhost:5177
5. **Vá na página "Bot"**
6. **Clique em "Conectar WhatsApp"**

---

## ✅ O Que Deve Acontecer

1. **Console do navegador (F12):**
   ```
   [CRM] Conectando ao Bot API Server...
   [CRM] ✅ Conectado ao Bot API Server
   ```

2. **QR code aparece** automaticamente quando o bot gerar

3. **Status muda para "Conectando..."** e depois **"Conectado"** após escanear

---

## 🆘 Se Ainda Não Funcionar

### Opção Alternativa: Usar o Componente Pronto

Se a correção manual estiver complicada, use o componente que já criamos:

1. **Abra App.jsx**
2. **Adicione no import (linha ~1-14):**
   ```javascript
   import WhatsAppBotControl from './components/WhatsAppBotControl'
   ```

3. **Procure onde renderiza a página "bot" (linha ~700-800)**

4. **Substitua todo o conteúdo da página bot por:**
   ```javascript
   {currentPage === 'bot' && (
     <div className="p-6">
       <WhatsAppBotControl />
     </div>
   )}
   ```

Pronto! O componente já tem tudo funcionando! 🎉

---

## 📋 Checklist

- [ ] Alterei as URLs para `localhost:3010`
- [ ] Comentei o Socket.IO antigo
- [ ] Adicionei o novo WebSocket
- [ ] Salvei o arquivo
- [ ] Bot está rodando (`node main.js`)
- [ ] CRM reiniciado
- [ ] QR code aparece quando clico em "Conectar"
- [ ] Console não mostra erros 404

---

**Precisa de mais ajuda?** Veja: `INTEGRACAO_BOT_CRM_COMPLETO.md`

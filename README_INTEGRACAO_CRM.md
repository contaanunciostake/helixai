# 🚀 Início Rápido - VendeAI Bot + CRM

## ⚡ Modo Mais Rápido (3 Passos)

### 1️⃣ Execute o Script de Inicialização

```bash
# No diretório raiz (D:\Helix\HelixAI)
INICIAR_BOT_COM_CRM.bat
```

Este script:
- ✅ Instala dependências automaticamente
- ✅ Integra o bot com a API
- ✅ Inicia o bot VendeAI

### 2️⃣ Adicione o Componente ao CRM

Edite `CRM_Client/crm-client-app/src/App.jsx`:

```jsx
import WhatsAppBotControl from './components/WhatsAppBotControl'

// Adicione dentro do seu component:
<WhatsAppBotControl />
```

### 3️⃣ Inicie o CRM

```bash
cd CRM_Client/crm-client-app
npm run dev
```

Acesse: **http://localhost:5177**

---

## ✨ O Que Você Vai Ver

### No Terminal do Bot:
```
════════════════════════════════════════════════════════════════
🚀 BOT API SERVER - VendeAI
════════════════════════════════════════════════════════════════
📡 API REST:    http://localhost:3010
🔌 WebSocket:   ws://localhost:3010/ws
════════════════════════════════════════════════════════════════

📱 QR CODE

[QR code será exibido aqui]
```

### No CRM (Navegador):

![WhatsApp Bot Control Interface](https://i.imgur.com/example.png)

**Componente com:**
- 📱 QR code em tempo real
- 🟢 Status da conexão (Conectado/Desconectado)
- 🔄 Botão para atualizar
- 🔌 Botões conectar/desconectar
- ⚡ Atualizações instantâneas via WebSocket

---

## 📝 Arquivos Importantes

| Arquivo | Descrição |
|---------|-----------|
| `VendeAI/bot_engine/bot-api-server.js` | Servidor API + WebSocket |
| `VendeAI/bot_engine/integrate-bot-api.js` | Script de integração |
| `CRM_Client/crm-client-app/src/components/WhatsAppBotControl.jsx` | Componente React |
| `INTEGRACAO_BOT_CRM_COMPLETO.md` | Documentação completa |

---

## 🆘 Problemas Comuns

### ❌ QR Code não aparece

```bash
# Verifique se o bot está rodando
# Se sim, clique em "Atualizar Status" no CRM
```

### ❌ Erro de CORS

```bash
# Reinstale as dependências
cd VendeAI/bot_engine
npm install cors qrcode ws express
```

### ❌ WebSocket não conecta

```bash
# Teste se a API está online
curl http://localhost:3010/health

# Se retornar 404, o bot não está rodando corretamente
```

---

## 📚 Documentação Completa

Para informações detalhadas, veja:
- **[INTEGRACAO_BOT_CRM_COMPLETO.md](./INTEGRACAO_BOT_CRM_COMPLETO.md)** - Documentação completa
- **[API Reference](#)** - Endpoints e WebSocket events

---

## 🎯 Como Funciona

```
CRM (React) → WebSocket → Bot API Server → VendeAI Bot → WhatsApp
     ↑                                                         ↓
     └──────────── QR Code + Status em Tempo Real ────────────┘
```

1. **Bot gera QR code** → Envia para API Server
2. **API Server** → Notifica CRM via WebSocket
3. **CRM exibe QR** → Cliente escaneia
4. **WhatsApp conecta** → Status atualizado automaticamente

---

## ✅ Checklist de Integração

- [ ] Executei `INICIAR_BOT_COM_CRM.bat`
- [ ] Bot está rodando sem erros
- [ ] Adicionei `<WhatsAppBotControl />` no App.jsx
- [ ] CRM está acessível em localhost:5177
- [ ] QR code aparece no CRM
- [ ] WebSocket conectado (vejo "● Tempo Real" no componente)
- [ ] Escaneei QR code com WhatsApp
- [ ] Status mudou para "Conectado e Ativo" ✅

---

**🎉 Tudo funcionando? Perfeito! Seu cliente agora pode conectar o WhatsApp direto pelo CRM!**

---

Desenvolvido por **Helix AI** | VendeAI © 2025

# Integração CRM Cliente com AIra Auto

## Modificações Realizadas

### 1. Backend Flask - Novas Rotas API (backend/routes/api.py)

Adicionei duas rotas essenciais que o CRM Cliente precisa:

#### GET /api/empresa/nicho
Retorna o nicho da empresa logada.

**Resposta:**
```json
{
  "nicho": "veiculos",
  "nome": "Nome da Empresa"
}
```

####GET /api/empresa/info
Retorna informações completas da empresa + status do bot em tempo real.

**Resposta:**
```json
{
  "id": 1,
  "nome": "AIra Auto",
  "nicho": "veiculos",
  "whatsapp_conectado": true,
  "whatsapp_numero": "5567999999999",
  "whatsapp_status": "connected",  // "disconnected", "qr_code", "connected"
  "bot_ativo": true,
  "bot_ready": true  // Verifica se AIra Auto (porta 4000) está pronto
}
```

### 2. WhatsApp Service - Rota de Status (whatsapp_service_stable/server.js)

Adicionei rota adicional que aceita query params (compatibilidade com Flask):

#### GET /api/session/status?empresaId=1

**Resposta:**
```json
{
  "success": true,
  "connected": true,
  "qr": "data:image/png;base64,...",  // ou null se conectado
  "numero": "5567999999999",
  "lastUpdate": "2025-10-17T..."
}
```

---

## Fluxo de Conexão do CRM Cliente

```
┌─────────────────────────────────────────────────────────────┐
│                  CRM CLIENTE (React)                         │
│                http://localhost:5177                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
         1️⃣ Busca nicho e status da empresa
                          ↓
┌─────────────────────────────────────────────────────────────┐
│               BACKEND FLASK (Python)                         │
│               http://localhost:5000                          │
│                                                              │
│  GET /api/empresa/nicho   ← Retorna "veiculos"              │
│  GET /api/empresa/info     ← Retorna status completo        │
└─────────────────────────────────────────────────────────────┘
                          ↓
         2️⃣ Flask verifica status real do WhatsApp
                          ↓
┌─────────────────────────────────────────────────────────────┐
│          WHATSAPP SERVICE STABLE (Node.js)                   │
│               http://localhost:3001                          │
│                                                              │
│  GET /api/session/status?empresaId=1  ← Status WhatsApp     │
│  Socket.io em ws://localhost:3001     ← Eventos em tempo real│
└─────────────────────────────────────────────────────────────┘
                          ↓
         3️⃣ CRM Cliente conecta ao Socket.io
                          ↓
         socket.emit('join-empresa', empresaId)
                          ↓
         socket.on('qr-generated', ...)      ← Recebe QR Code
         socket.on('connection-success', ...)  ← WhatsApp conectado
         socket.on('connection-lost', ...)     ← Desconectou
```

---

## Como Testar a Integração

### 1. Certificar que Todos os Serviços Estão Rodando

```bash
# Usar o launcher automático
D:\Helix\HelixAI\INICIAR_SISTEMA.bat
```

Ou manualmente:
```bash
# 1. MySQL (XAMPP)

# 2. Backend Flask
cd D:\Helix\HelixAI\backend
python app.py

# 3. WhatsApp Service
cd D:\Helix\HelixAI\whatsapp_service_stable
npm start

# 4. AIra Auto Bot
cd D:\Helix\HelixAI\AIra_Auto
npm start

# 5. CRM Cliente
cd D:\Helix\HelixAI\CRM_Client\crm-client-app
npm run dev
```

### 2. Configurar Empresa no Banco de Dados

```sql
USE helixai_db;

-- Verificar empresa
SELECT id, nome, nicho, bot_ativo, whatsapp_conectado FROM empresas WHERE id = 1;

-- Configurar nicho e ativar bot
UPDATE empresas
SET nicho = 'veiculos',
    bot_ativo = TRUE
WHERE id = 1;
```

### 3. Testar Rotas no Navegador/Postman

```bash
# 1. Health check do WhatsApp Service
curl http://localhost:3001/health

# 2. Health check do AIra Auto Bot
curl http://localhost:4000/health

# 3. Status da sessão WhatsApp (deve estar rodando com login)
curl "http://localhost:3001/api/session/status?empresaId=1"

# 4. Testar rotas do Flask (precisa estar logado no CRM)
# Acesse no navegador após login:
http://localhost:5000/api/empresa/nicho
http://localhost:5000/api/empresa/info
```

### 4. Acessar CRM Cliente e Testar

1. Acesse: **http://localhost:5177/**
2. Faça login:
   - Email: `cliente@empresa.com`
   - Senha: `cliente123`
3. Vá para: **Bot WhatsApp** (menu lateral)
4. Clique em: **Conectar WhatsApp**
5. Aguarde o QR Code aparecer (5-10 segundos)
6. Escaneie com WhatsApp (WhatsApp > Aparelhos Conectados)
7. Status deve mudar para: **Conectado ✅**

---

## Solução de Problemas

### Status fica "Conectando..." indefinidamente

**Causa**: whatsapp_service_stable não está rodando ou não consegue gerar QR Code

**Solução**:
```bash
# Verificar se porta 3001 está aberta
curl http://localhost:3001/health

# Ver logs do WhatsApp Service
# (Verificar janela do INICIAR_SISTEMA.bat - "WhatsApp Service ESTÁVEL")

# Se não estiver rodando, iniciar manualmente
cd D:\Helix\HelixAI\whatsapp_service_stable
npm start
```

### Erros 404 em /api/empresa/nicho ou /api/empresa/info

**Causa**: Backend Flask desatualizado

**Solução**:
```bash
# Reiniciar Backend Flask
# (Parar com Ctrl+C e reiniciar)
cd D:\Helix\HelixAI\backend
python app.py
```

### WebSocket não conecta (ws://localhost:3001)

**Causa**: CORS ou Socket.io não está configurado

**Solução**:
- Verificar se whatsapp_service_stable está com Socket.io ativo
- Verificar console do navegador para erros específicos
- Limpar cache do navegador (Ctrl+Shift+Del)

### QR Code não aparece

**Causa 1**: Sessão anterior ainda existe

**Solução**:
```bash
# Limpar sessão antiga
curl -X POST http://localhost:3001/api/session/clear \
  -H "Content-Type: application/json" \
  -d '{"empresaId": 1}'

# Gerar novo QR
# Clicar em "Conectar WhatsApp" novamente no CRM
```

**Causa 2**: Sessão whatsapp-web.js está corrompida

**Solução**:
```bash
# Parar whatsapp_service_stable
# Deletar pasta de sessões
cd D:\Helix\HelixAI\whatsapp_service_stable
rm -rf sessions

# Reiniciar whatsapp_service_stable
npm start
```

### Bot não responde mensagens

**Verificar:**

1. **Bot está ativo no banco?**
```sql
SELECT bot_ativo FROM empresas WHERE id = 1;
-- Deve ser 1 (TRUE)
```

2. **AIra Auto está rodando?**
```bash
curl http://localhost:4000/health
# Deve retornar: {"bot_pronto": true}
```

3. **Backend Flask recebe mensagem?**
```bash
# Ver logs do Flask
# (Procurar por "[WEBHOOK] Mensagem recebida")
```

4. **Nicho está correto?**
```sql
SELECT nicho FROM empresas WHERE id = 1;
-- Deve ser 'veiculos'
```

---

## URLs e Endpoints de Referência

### CRM Cliente
- **Login**: http://localhost:5177/
- **Dashboard**: http://localhost:5177/dashboard
- **Bot WhatsApp**: http://localhost:5177/bot

### Backend Flask (API)
- **Base**: http://localhost:5000/api
- **Empresa Nicho**: http://localhost:5000/api/empresa/nicho
- **Empresa Info**: http://localhost:5000/api/empresa/info
- **Webhook WhatsApp**: http://localhost:5000/api/webhook/whatsapp/message

### WhatsApp Service
- **Base**: http://localhost:3001/api
- **Health**: http://localhost:3001/health
- **Iniciar Sessão**: POST http://localhost:3001/api/session/start
- **Status**: GET http://localhost:3001/api/session/status?empresaId=1
- **Enviar Mensagem**: POST http://localhost:3001/api/message/send
- **Socket.io**: ws://localhost:3001/socket.io/

### AIra Auto Bot
- **Health**: http://localhost:4000/health
- **Processar Mensagem**: POST http://localhost:4000/api/processar-mensagem

---

## Checklist Final

- [ ] MySQL rodando (XAMPP)
- [ ] Backend Flask rodando (porta 5000)
- [ ] WhatsApp Service rodando (porta 3001)
- [ ] AIra Auto Bot rodando (porta 4000)
- [ ] CRM Cliente rodando (porta 5177)
- [ ] Empresa configurada no banco (nicho = 'veiculos', bot_ativo = TRUE)
- [ ] WhatsApp conectado via QR Code
- [ ] Bot responde mensagens recebidas

**Tudo pronto! 🎉**

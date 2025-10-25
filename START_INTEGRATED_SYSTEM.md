# 🚀 Guia de Inicialização - Sistema Integrado

## ⚡ Início Rápido (3 Passos)

### Passo 1: Iniciar VendeAI Backend
```bash
cd D:\Helix\HelixAI\VendeAI
python backend/app.py
```

**Aguarde até ver:**
```
VENDEAI BACKEND - SERVIDOR FLASK
Acesse:
  Dashboard: http://localhost:5000
```

### Passo 2: Iniciar WhatsApp Service
```bash
cd D:\Helix\HelixAI\VendeAI\whatsapp_service
npm start
```

**Aguarde até ver:**
```
WhatsApp Service rodando na porta 3001
```

### Passo 3: Iniciar CRM Client
```bash
cd D:\Helix\HelixAI\CRM_Client\crm-client-app
npm run dev
```

**Aguarde até ver:**
```
VITE ready in XXXms
Local: http://localhost:5173
```

## ✅ Checklist de Verificação

### Backend VendeAI ✓
- [ ] Porta 5000 respondendo
- [ ] Mensagem de inicialização apareceu
- [ ] Sem erros no terminal

### WhatsApp Service ✓
- [ ] Porta 3001 respondendo
- [ ] Socket.io iniciado
- [ ] Sem erros no terminal

### CRM Client ✓
- [ ] Porta 5173 respondendo
- [ ] Página carregou
- [ ] Sem erros no console (F12)

## 🧪 Teste da Integração

### 1. Acesse o CRM
Abra: `http://localhost:5173`

### 2. Faça Login
**Credenciais:**
- Email: `demo@vendeai.com`
- Senha: `demo123`

**Ou crie nova conta em:**
`http://localhost:5000/auth/register`

### 3. Navegue até Bot WhatsApp
No menu lateral, clique em **"Bot WhatsApp"**

### 4. Conectar WhatsApp

**Você deve ver:**
- ✅ Card "Status da Conexão"
- ✅ Card "Status do Bot"
- ✅ Botão "Conectar WhatsApp"

**Clique em "Conectar WhatsApp"**

**Resultado esperado:**
```
✓ Status muda para "Conectando..."
✓ QR Code aparece na tela
✓ Instruções de como escanear
```

### 5. Escanear QR Code

**No seu celular:**
1. Abra WhatsApp
2. Menu → Aparelhos conectados
3. Conectar um aparelho
4. Escaneie o QR code

**Resultado esperado:**
```
✓ Mensagem: "WhatsApp conectado!"
✓ Status: "Conectado"
✓ Número aparece na tela
✓ QR code desaparece
```

### 6. Ativar Bot

**Clique em "Ativar Bot"**

**Resultado esperado:**
```
✓ Status do bot: "Ativo (Respondendo)"
✓ Estatísticas aparecem
✓ Cards de métricas atualizam
```

### 7. Testar Conversa

**Envie mensagem para o WhatsApp conectado**

**No CRM:**
1. Vá para "Conversas"
2. Deve aparecer nova conversa
3. Mensagem deve estar salva

## 🐛 Problemas Comuns

### ❌ Porta 5000 já em uso
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

### ❌ Porta 3001 já em uso
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### ❌ Porta 5173 já em uso
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5173 | xargs kill -9
```

### ❌ QR Code não aparece

**Possíveis causas:**
1. WhatsApp Service não está rodando
2. Backend não consegue conectar ao Service
3. Sessão travada

**Soluções:**
1. Verificar Terminal 2 (whatsapp_service)
2. Clicar em "Limpar Sessão"
3. Tentar gerar QR novamente

### ❌ Erro 401 Unauthorized

**Causa:** Não está autenticado

**Solução:**
1. Fazer login em `http://localhost:5000`
2. Depois acessar CRM em `http://localhost:5173`

### ❌ CORS Error

**Causa:** Backend não permite requisições do CRM

**Solução:**
- Verificar se CORS está habilitado no `backend/__init__.py`
- Linha deve ter: `CORS(app, resources={r"/api/*": {"origins": "*"}})`

## 📊 Verificar Logs

### Backend VendeAI
**Terminal 1** - Ver requests chegando:
```
[CRM Bridge] GET /api/crm/info
[CRM Bridge] POST /api/crm/whatsapp/start
```

### WhatsApp Service
**Terminal 2** - Ver eventos WhatsApp:
```
[WhatsApp] QR Code gerado
[WhatsApp] Conectado: +5511999999999
```

### CRM Client
**Console do navegador (F12)** - Ver chamadas API:
```
[CRM Client] Buscando nicho da empresa...
[CRM Client] Dados da empresa recebidos: {...}
[CRM] Sessão WhatsApp iniciada
```

## 🎯 Funcionalidades para Testar

### ✅ Autenticação
- [ ] Login funciona
- [ ] Cookies persistem
- [ ] Logout funciona

### ✅ Bot WhatsApp
- [ ] Gerar QR code
- [ ] Conectar WhatsApp
- [ ] Desconectar WhatsApp
- [ ] Limpar sessão
- [ ] Ativar/desativar bot

### ✅ Conversas
- [ ] Lista de conversas carrega
- [ ] Mensagens são salvas
- [ ] Kanban funciona (arrastar cards)

### ✅ Leads
- [ ] Leads aparecem
- [ ] Filtros funcionam
- [ ] Detalhes abrem

### ✅ Dashboard
- [ ] Estatísticas carregam
- [ ] Cards atualizam
- [ ] Gráficos aparecem

## 📱 Teste Completo de Fluxo

### Cenário: Cliente envia mensagem

**1. Cliente envia:** "Olá, gostaria de informações sobre carros"

**2. Bot responde automaticamente**

**3. No CRM você deve ver:**
- ✅ Nova conversa em "Conversas"
- ✅ Mensagem do cliente salva
- ✅ Resposta do bot salva
- ✅ Lead criado em "Leads"
- ✅ Estatísticas atualizadas

**4. Você pode:**
- Ver histórico completo
- Responder manualmente
- Mover no Kanban
- Marcar como favorito

## 🔧 Reiniciar Tudo do Zero

Se algo der muito errado, reinicie:

```bash
# Parar todos os serviços
# CTRL+C em cada terminal

# Limpar sessão WhatsApp
cd D:\Helix\HelixAI\VendeAI\whatsapp_service
rm -rf sessions/

# Reiniciar banco (CUIDADO: apaga dados)
cd D:\Helix\HelixAI\VendeAI
python database/init_db.py

# Iniciar novamente (Passos 1, 2, 3 acima)
```

## 📞 Suporte

**Documentação:**
- `INTEGRACAO_CRM_VENDEAI.md` - Detalhes técnicos
- `VendeAI/STATUS_FINAL.md` - Status do VendeAI
- `VendeAI/WHATSAPP_SETUP.md` - Setup WhatsApp

**Logs para enviar em caso de erro:**
1. Terminal do Backend VendeAI
2. Terminal do WhatsApp Service
3. Console do navegador (F12)

---

**Status:** ✅ **Sistema Pronto para Uso**

**Última atualização:** 18/10/2025

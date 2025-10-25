# 🔗 Integração CRM_Client + VendeAI

## 📋 Visão Geral

Esta integração conecta o **CRM_Client** (frontend React) com o **VendeAI** (backend Flask + Bot WhatsApp), permitindo que clientes gerenciem seu bot WhatsApp diretamente através do painel CRM.

## 🏗️ Arquitetura da Integração

```
┌────────────────────────────────────────────────────────────────────┐
│                     SISTEMA INTEGRADO                              │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────┐         HTTP REST          ┌──────────────┐ │
│  │  CRM_Client      │ ←─────────────────────────→ │  VendeAI     │ │
│  │  (React Vite)    │   /api/crm/*               │  Backend     │ │
│  │  Porta: 5173     │   (CRM Bridge API)         │  (Flask)     │ │
│  │                  │                             │  Porta: 5000 │ │
│  └──────────────────┘                             └──────┬───────┘ │
│                                                           │         │
│                                                           │         │
│                                                           ↓         │
│                                                   ┌──────────────┐ │
│                                                   │  WhatsApp    │ │
│                                                   │  Service     │ │
│                                                   │  (Node.js)   │ │
│                                                   │  Porta: 3001 │ │
│                                                   └──────┬───────┘ │
│                                                           │         │
│                                                           ↓         │
│                                                   ┌──────────────┐ │
│                                                   │  WhatsApp    │ │
│                                                   │  (Baileys)   │ │
│                                                   └──────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔌 API Endpoints Criados

### 1. Informações da Empresa

**GET /api/crm/nicho**
- Retorna o nicho da empresa (veículos ou imóveis)
- Requer autenticação
```json
{
  "success": true,
  "nicho": "veiculos",
  "empresa_nome": "Empresa Demo"
}
```

**GET /api/crm/info**
- Retorna informações completas da empresa
- Requer autenticação
```json
{
  "success": true,
  "empresa": {
    "id": 1,
    "nome": "Empresa Demo",
    "whatsapp_conectado": true,
    "whatsapp_numero": "+5511999999999",
    "bot_ativo": true,
    "plano": "gratuito",
    "nicho": "veiculos"
  }
}
```

### 2. Gerenciamento do Bot

**POST /api/crm/bot/toggle**
- Ativa/desativa o bot
- Requer autenticação
```json
{
  "success": true,
  "message": "Bot ativado com sucesso",
  "bot_ativo": true
}
```

### 3. WhatsApp Connection

**POST /api/crm/whatsapp/start**
- Inicia sessão WhatsApp e gera QR code
- Requer autenticação
```json
{
  "success": true,
  "qr": "1@ABC123...",
  "connected": false
}
```

**GET /api/crm/whatsapp/status/:empresa_id**
- Retorna status da conexão WhatsApp
- Requer autenticação
```json
{
  "success": true,
  "connected": true,
  "numero": "+5511999999999",
  "bot_ativo": true
}
```

**POST /api/crm/whatsapp/disconnect**
- Desconecta WhatsApp
- Requer autenticação

**POST /api/crm/whatsapp/clear**
- Limpa sessão WhatsApp (força novo QR code)
- Requer autenticação

### 4. Dados do CRM

**GET /api/crm/conversas**
- Retorna conversas da empresa
```json
{
  "success": true,
  "conversas": [
    {
      "id": 1,
      "nome": "João Silva",
      "telefone": "+5511999999999",
      "status": "ATIVO",
      "ultima_mensagem": "Olá!",
      "ultima_mensagem_data": "2025-10-18T10:00:00",
      "origem": "WhatsApp"
    }
  ]
}
```

**GET /api/crm/conversas/:conversa_id/mensagens**
- Retorna mensagens de uma conversa específica

**GET /api/crm/leads**
- Retorna leads da empresa
```json
{
  "success": true,
  "leads": [...],
  "total": 150
}
```

**GET /api/crm/stats**
- Retorna estatísticas da empresa
```json
{
  "success": true,
  "stats": {
    "conversas_ativas": 47,
    "leads_qualificados": 156,
    "total_leads": 200,
    "taxa_conversao": 34.5
  }
}
```

### 5. Webhooks (para whatsapp_service)

**POST /api/crm/webhook/whatsapp/connection**
- Recebe eventos de conexão/desconexão

**POST /api/crm/webhook/whatsapp/message**
- Recebe mensagens do WhatsApp

## 📁 Arquivos Modificados/Criados

### Backend VendeAI

1. **`VendeAI/backend/routes/crm_bridge.py`** (NOVO)
   - API Bridge completa com todos os endpoints
   - 600+ linhas de código

2. **`VendeAI/backend/__init__.py`** (MODIFICADO)
   - Adicionado registro do blueprint `crm_bridge`

### Frontend CRM_Client

3. **`CRM_Client/crm-client-app/src/App.jsx`** (MODIFICADO)
   - Atualizado para usar `VENDEAI_API_URL`
   - Todas as funções agora chamam `/api/crm/*`
   - Mantém compatibilidade com Socket.io

## 🚀 Como Usar

### 1. Iniciar Todos os Serviços

**Terminal 1 - VendeAI Backend:**
```bash
cd D:\Helix\HelixAI\VendeAI
python backend/app.py
```

**Terminal 2 - WhatsApp Service:**
```bash
cd D:\Helix\HelixAI\VendeAI\whatsapp_service
npm install
npm start
```

**Terminal 3 - CRM Client:**
```bash
cd D:\Helix\HelixAI\CRM_Client\crm-client-app
npm install
npm run dev
```

### 2. Acessar o Sistema

1. Abra o CRM: `http://localhost:5173`
2. Faça login (credenciais do VendeAI):
   - Email: `demo@vendeai.com`
   - Senha: `demo123`

3. Navegue até **Bot WhatsApp** no menu
4. Clique em **Conectar WhatsApp**
5. Escaneie o QR code com seu WhatsApp
6. Ative o bot

### 3. Fluxo de Funcionamento

```
1. Usuário clica "Conectar WhatsApp" no CRM
   ↓
2. CRM chama POST /api/crm/whatsapp/start
   ↓
3. VendeAI Backend chama WhatsApp Service
   ↓
4. WhatsApp Service gera QR code via Baileys
   ↓
5. QR code retorna para CRM e é exibido
   ↓
6. Usuário escaneia QR code
   ↓
7. WhatsApp Service notifica VendeAI via webhook
   ↓
8. VendeAI atualiza status no banco
   ↓
9. CRM via Socket.io recebe atualização
   ↓
10. Interface atualiza para "Conectado"
```

## 🔐 Autenticação

- Todas as rotas `/api/crm/*` requerem autenticação
- Usa Flask-Login com cookies de sessão
- Credenciais devem ser incluídas: `credentials: 'include'`

## 📊 Sincronização de Dados

### Conversas
- Salvas automaticamente via webhook quando mensagem chega
- Acessíveis em `/api/crm/conversas`

### Leads
- Criados pelo bot automaticamente
- Acessíveis em `/api/crm/leads`

### Status WhatsApp
- Atualizado em tempo real via webhooks
- Consultável via `/api/crm/whatsapp/status/:empresa_id`

## 🛠️ Troubleshooting

### QR Code não aparece

**Problema:** Backend não consegue conectar ao whatsapp_service

**Solução:**
1. Verifique se `whatsapp_service` está rodando na porta 3001
2. Execute `npm start` na pasta `whatsapp_service`

### Erro de autenticação

**Problema:** CRM retorna 401 Unauthorized

**Solução:**
1. Faça login no VendeAI: `http://localhost:5000`
2. Use as mesmas credenciais no CRM
3. Certifique-se que cookies estão habilitados

### WhatsApp desconecta sozinho

**Problema:** Normal! WhatsApp Web desconecta após inatividade

**Solução:**
1. Clique em "Limpar Sessão"
2. Gere novo QR code
3. Reconecte

## 📝 Próximas Melhorias

- [ ] Dashboard com gráficos em tempo real
- [ ] Notificações push quando nova mensagem chega
- [ ] Integração com calendário de agendamentos
- [ ] Relatórios de performance do bot
- [ ] Múltiplos números WhatsApp por empresa
- [ ] Respostas rápidas configuráveis no CRM

## 🎯 Benefícios da Integração

### Antes (Sem Integração)
- ❌ Dois sistemas separados
- ❌ Login em 2 lugares
- ❌ Dados duplicados
- ❌ Configuração manual

### Depois (Integrado)
- ✅ Sistema unificado
- ✅ Login único
- ✅ Dados sincronizados
- ✅ Configuração via interface
- ✅ Estatísticas em tempo real
- ✅ QR code direto no painel

## 📞 Suporte

**Documentação relacionada:**
- `VendeAI/README.md` - Visão geral do VendeAI
- `VendeAI/STATUS_FINAL.md` - Status do sistema
- `VendeAI/WHATSAPP_SETUP.md` - Setup do WhatsApp

**Logs importantes:**
- Backend VendeAI: Terminal onde rodou `python backend/app.py`
- WhatsApp Service: Terminal onde rodou `npm start`
- CRM Client: Console do navegador (F12)

---

**Status:** ✅ **Integração 100% Funcional**

**Última atualização:** 18/10/2025
**Versão:** 1.0.0

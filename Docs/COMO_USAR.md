# 🚀 VendeAI - Como Usar

## ✅ Sistema está PRONTO e RODANDO!

---

## 🎯 Acesso Rápido:

### 🌐 Frontend (Painel Web):
**URL:** http://localhost:5000

**Credenciais:**
- **Empresa Demo:**
  - Email: `demo@vendeai.com`
  - Senha: `demo123`

- **Super Admin:**
  - Email: `admin@vendeai.com`
  - Senha: `admin123`

---

## 📱 Páginas Disponíveis:

### Para Usuários da Empresa:
- 🏠 **Dashboard:** http://localhost:5000/
- 👥 **Leads:** http://localhost:5000/leads
- 💬 **Conversas:** http://localhost:5000/conversas
- 📢 **Campanhas:** http://localhost:5000/campanhas
- ⚙️ **Configurações:** http://localhost:5000/configuracoes

### Para Super Admin:
- 🔐 **Admin Dashboard:** http://localhost:5000/admin
- 🏢 **Gerenciar Empresas:** http://localhost:5000/admin/empresas
- 👤 **Gerenciar Usuários:** http://localhost:5000/admin/usuarios

### API:
- 📚 **Documentação API:** http://localhost:5000/api/docs
- 📊 **Estatísticas:** http://localhost:5000/api/stats
- 🤖 **API Bot:** http://localhost:5000/api/bot/config?phone={numero}

---

## 🎮 Como Iniciar:

### Método 1 - Scripts Automáticos (RECOMENDADO):

#### 1️⃣ Iniciar Backend:
```
Duplo clique em: START.bat
```

#### 2️⃣ Iniciar Bot WhatsApp:
```
Duplo clique em: START_BOT.bat
```

#### 3️⃣ Parar Tudo:
```
Duplo clique em: PARAR_TUDO.bat
```

### Método 2 - Manual:

#### Terminal 1 - Backend:
```bash
cd C:\Users\Victor\Documents\VendeAI
python backend/app.py
```

#### Terminal 2 - Bot (opcional):
```bash
cd C:\Users\Victor\Documents\VendeAI\bot_engine
node main.js
```

---

## 📋 Passo a Passo - Primeiro Uso:

### 1. Fazer Login
1. Acesse: http://localhost:5000/login
2. Use: `demo@vendeai.com` / `demo123`

### 2. Ver Dashboard
- Automaticamente abrirá o dashboard com métricas
- Veja total de leads, conversas, campanhas

### 3. Configurar Bot WhatsApp (Admin)
1. Acesse: http://localhost:5000/admin
2. Login: `admin@vendeai.com` / `admin123`
3. Clique em "Empresas"
4. Edite "Empresa Demo"
5. Configure:
   - ✅ **Número WhatsApp** (ex: 5511999999999)
   - ✅ **OpenAI API Key**
   - ✅ **Groq API Key**
   - ✅ **ElevenLabs API Key**
   - ✅ **ElevenLabs Voice ID**
   - ✅ **ElevenLabs Agent ID**
6. Ative módulos:
   - ✅ Auto-resposta
   - ✅ Enviar áudio
   - ✅ Módulo FIPE
   - ✅ Módulo Financiamento
7. Salvar

### 4. Iniciar Bot WhatsApp
1. Duplo clique em `START_BOT.bat`
2. Aguarde carregar
3. Escanear QR Code com WhatsApp
4. Bot conectado!

### 5. Testar
1. Envie mensagem para o número do bot
2. Bot responde automaticamente
3. Veja mensagens em: http://localhost:5000/conversas
4. Veja leads em: http://localhost:5000/leads

---

## 🎨 Frontend Disponível:

### ✅ Páginas Migradas:

#### Templates Base:
- ✅ `base.html` - Layout base com Bootstrap 5
- ✅ `auth/login.html` - Página de login
- ✅ `auth/register.html` - Página de registro

#### Dashboard:
- ✅ `dashboard/index.html` - Dashboard principal com métricas

#### Leads:
- ✅ `leads/index.html` - Lista de leads
- ✅ `leads/detalhe.html` - Detalhes do lead

#### Conversas:
- ✅ `conversas/index.html` - Histórico de conversas

#### Campanhas:
- ✅ `campanhas/index.html` - Gerenciar campanhas

#### Admin:
- ✅ `admin/dashboard.html` - Painel administrativo

#### Disparos (RoboVendedor):
- ✅ `disparos/dashboard.html` - Dashboard disparos
- ✅ `disparos/lojas.html` - Gerenciar lojas
- ✅ `disparos/campanhas.html` - Campanhas de disparo
- ✅ `disparos/disparos.html` - Histórico de disparos
- ✅ `disparos/leads_quentes.html` - Leads quentes
- ✅ `disparos/configuracoes.html` - Configurações

#### Cliente (RoboVendedorPro):
- ✅ `client/dashboard/index.html` - Dashboard cliente
- ✅ `client/dashboard/leads.html` - Leads do cliente
- ✅ `client/dashboard/configuracoes.html` - Config cliente

---

## 🔧 Funcionalidades:

### Backend Flask:
- ✅ Sistema multi-tenant (múltiplas empresas)
- ✅ Autenticação e autorização
- ✅ Dashboard com métricas em tempo real
- ✅ Gerenciamento de leads
- ✅ Histórico de conversas
- ✅ Campanhas de disparo
- ✅ Painel super admin
- ✅ API REST completa
- ✅ Integração com bot via API

### Bot WhatsApp:
- ✅ Multi-tenant (por número)
- ✅ OpenAI GPT-4 (respostas inteligentes)
- ✅ Groq (alternativa rápida)
- ✅ ElevenLabs (síntese de voz)
- ✅ ElevenLabs Agent (IA conversacional)
- ✅ API FIPE (valores de veículos)
- ✅ Simulador de financiamento
- ✅ Auto-resposta configurável
- ✅ Envio de áudio ou texto
- ✅ Registro automático de leads
- ✅ Salvamento de conversas

---

## 📂 Estrutura de Arquivos:

```
VendeAI/
├── START.bat              ← Iniciar backend
├── START_BOT.bat          ← Iniciar bot
├── PARAR_TUDO.bat         ← Parar tudo
├── COMO_USAR.md           ← Este arquivo
│
├── backend/               ← Backend Flask
│   ├── app.py            ← Arquivo principal
│   ├── routes/           ← Rotas (8 módulos)
│   ├── templates/        ← Templates HTML
│   └── static/           ← CSS/JS/Imagens
│
├── bot_engine/           ← Bot WhatsApp
│   ├── main.js           ← Bot principal
│   ├── database_client.js ← Cliente HTTP
│   ├── bot-adapter.js    ← Adapter multi-tenant
│   └── INTEGRACAO.md     ← Guia de integração
│
├── database/             ← Banco de dados
│   ├── models.py         ← 15 tabelas
│   └── init_db.py        ← Inicializador
│
└── vendeai.db            ← Banco SQLite
```

---

## ❓ Troubleshooting:

### Backend não inicia:
```bash
# Verificar se porta 5000 está ocupada
netstat -ano | findstr :5000

# Matar processo
taskkill /F /PID [numero]
```

### Bot não conecta:
1. Verifique se backend está rodando
2. Configure número WhatsApp no painel admin
3. Configure API keys (OpenAI, ElevenLabs, Groq)
4. Verifique internet

### Erro ao fazer login:
1. Use credenciais corretas
2. Verifique se banco foi criado: `vendeai.db`
3. Reinicie backend

### Página não carrega:
1. Limpe cache do navegador (Ctrl+Shift+Del)
2. Tente em modo anônimo
3. Verifique console do navegador (F12)

---

## 📞 Suporte:

### Documentação:
- **README.md** - Visão geral
- **INSTALL.md** - Instalação
- **STATUS_FINAL.md** - Status completo
- **bot_engine/INTEGRACAO.md** - Integração do bot

### Comandos Úteis:
```bash
# Resetar banco de dados
python database/init_db.py

# Testar API bot
curl http://localhost:5000/api/bot/config?phone=5511999999999

# Ver processos rodando
tasklist | findstr python
tasklist | findstr node
```

---

## ✨ Pronto!

Seu sistema VendeAI está **100% funcional** e pronto para uso!

**Acesse agora:** http://localhost:5000
**Login:** demo@vendeai.com / demo123

---

**Última atualização:** 10/10/2025

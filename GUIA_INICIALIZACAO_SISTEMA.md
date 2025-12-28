# 🚀 GUIA DE INICIALIZAÇÃO - HELIXAI SISTEMA MULTI-TENANT

**Data de atualização:** 03/11/2025
**Versão:** 2.0 - Multi-Agente Ativado

---

## 📋 ÍNDICE

1. [Pré-requisitos](#pré-requisitos)
2. [Banco de Dados](#banco-de-dados)
3. [Inicialização do Sistema](#inicialização-do-sistema)
4. [Credenciais de Acesso](#credenciais-de-acesso)
5. [URLs do Sistema](#urls-do-sistema)
6. [Modo Multi-Tenant](#modo-multi-tenant)
7. [Solução de Problemas](#solução-de-problemas)

---

## ✅ PRÉ-REQUISITOS

Antes de iniciar o sistema, certifique-se de que você tem:

- ✅ **MySQL rodando** (XAMPP Control Panel)
- ✅ **Node.js** instalado (v18+ recomendado)
- ✅ **Python 3.x** instalado
- ✅ **Todas as dependências instaladas** (o script .bat faz isso automaticamente)

---

## 💾 BANCO DE DADOS

### **Localização do Banco**
```
D:\Helix\HelixAI\vendeai.db
```

### **Tipo de Banco**
- **SQLite** (local)
- Configuração: `USE_REMOTE_DB=False` no `.env`

### **Estrutura do Banco**

#### **Tabelas Principais:**
- `empresas` - Empresas clientes (multi-tenant)
- `usuarios` - Usuários do sistema (admin, cliente, etc.)
- `configuracoes_bot` - Configurações do bot por empresa
- `leads` - Leads capturados
- `conversas` - Conversas do WhatsApp
- `mensagens` - Mensagens trocadas
- `campanhas` - Campanhas de marketing
- `produtos` - Produtos/Serviços
- `veiculos` - Veículos (para empresas do nicho veículos)

#### **Valores de Enum Corretos:**

**Tipos de Usuário (`usuarios.tipo`):**
- `super_admin` - Administrador do sistema
- `admin_empresa` - Administrador da empresa cliente
- `usuario` - Usuário comum
- `visualizador` - Apenas visualização

**Nichos de Empresa (`empresas.nicho`):**
- `veiculos` - Bot especializado em veículos (VendeAI)
- `imoveis` - Bot especializado em imóveis (AIra Imob)
- `NULL` - Bot genérico

**Planos de Assinatura (`empresas.plano`):**
- `GRATUITO` - Plano free (limitado)
- `BASICO` - R$ 97/mês
- `PROFISSIONAL` - R$ 197/mês
- `ENTERPRISE` - R$ 497/mês

### **Scripts de Manutenção**

```bash
# Corrigir valores de enum inválidos
python backend/fix_database_enums.py

# Criar usuários de teste
python backend/criar_usuarios_teste.py

# Recriar banco de dados do zero
python backend/database/models.py
```

---

## 🚀 INICIALIZAÇÃO DO SISTEMA

### **Passo 1: Verificar MySQL**
Abra o **XAMPP Control Panel** e certifique-se de que o MySQL está rodando.

### **Passo 2: Executar o Script de Inicialização**

```bash
INICIAR_SISTEMA_CORRETO.bat
```

### **O que o script faz:**

1. ✅ Limpa cache dos projetos Node.js
2. ✅ Verifica se MySQL está rodando
3. ✅ Verifica processos anteriores
4. ✅ Instala dependências faltantes
5. ✅ Inicia os serviços na ordem correta:

   - **Backend Flask** (porta 5000) - API REST
   - **Integrated Bot Server** (porta 3010) - Multi-Agente
   - **WhatsApp Service Backup** (porta 3002)
   - **AIra Auto Bot** (porta 4000) - Bot de veículos
   - **AIra Imob Bot** (porta 4001) - Bot de imóveis
   - **LocalTunnel Webhook** (ElevenLabs)
   - **CRM Admin** (porta 5175)
   - **CRM Cliente** (porta 5177)
   - **Landing Page** (porta 5173)

### **Tempo de inicialização:**
- Total: ~30 segundos
- Cada serviço aguarda alguns segundos antes de iniciar o próximo

---

## 🔐 CREDENCIAIS DE ACESSO

### **Super Admin (Acesso Total)**
```
Email: admin@admin.com
Senha: admin123
Empresa: VendeAI Sistema
URL: http://localhost:5175/
```

### **Cliente CRM (Bot Genérico)**
```
Email: cliente@teste.com
Senha: cliente123
Empresa: Empresa Cliente Teste
URL: http://localhost:5177/
```

### **Demo (Bot de Veículos)**
```
Email: demo@demo.com
Senha: demo123
Empresa: Empresa Demo (nicho: veículos)
URL: http://localhost:5177/
```

### **⚠️ IMPORTANTE - Primeiro Login**

**Após a compra/cadastro**, o primeiro login sempre passa pelo **Wizard de Configuração**:

1. ✅ **Wizard de Setup** (executado apenas UMA vez)
   - Configuração do nome do bot
   - Definição do nicho (veículos, imóveis, genérico)
   - Configuração de horário de atendimento
   - Mensagens personalizadas (boas-vindas, ausência)
   - Integração com APIs de IA (opcional)

2. ✅ **Após o Wizard**
   - Campo `setup_completo` na tabela `empresas` = `TRUE`
   - Configurações salvas na tabela `configuracoes_bot`
   - Próximos logins vão direto para o dashboard

3. ✅ **Verificar se Wizard foi Completado**
```sql
SELECT id, nome, setup_completo, nome_bot
FROM empresas
WHERE id = :empresa_id;
```

---

## 🌐 URLS DO SISTEMA

### **Frontend**
- Landing Page: http://localhost:5173/
- CRM Admin: http://localhost:5175/
- CRM Cliente: http://localhost:5177/

### **Backend**
- Backend Flask: http://localhost:5000/
- API REST: http://localhost:5000/api/*
- Auth API: http://localhost:5000/api/auth/*

### **Bot Services**
- Integrated Bot Server: http://localhost:3010/
- Bot API: http://localhost:3010/api/bot/*
- WebSocket: ws://localhost:3010/ws?empresa_id=X
- AIra Auto Bot: http://localhost:4000/health
- AIra Imob Bot: http://localhost:4001/health

### **Webhook Público**
- Webhook ElevenLabs: https://meuapp.loca.lt

---

## 🏢 MODO MULTI-TENANT

### **Como Funciona**

O sistema suporta **múltiplas empresas** simultaneamente, cada uma com:

- ✅ Configurações próprias de bot
- ✅ Banco de dados compartilhado (isolamento por `empresa_id`)
- ✅ Sessão WhatsApp independente
- ✅ Bot especializado por nicho (automático)

### **Seleção Automática de Bot por Nicho**

O **Integrated Bot Server** seleciona automaticamente o bot correto baseado no nicho da empresa:

```javascript
// Consulta ao banco de dados
SELECT nicho FROM empresas WHERE id = :empresa_id

// Se nicho = 'veiculos' → VendeAI Bot (AIra Auto)
// Se nicho = 'imoveis'  → AIra Imob Bot
// Se nicho = NULL       → Bot Genérico
```

### **Configurar Nicho de uma Empresa**

```sql
-- Bot de veículos
UPDATE empresas SET nicho = 'veiculos' WHERE id = 5;

-- Bot de imóveis
UPDATE empresas SET nicho = 'imoveis' WHERE id = 6;

-- Bot genérico
UPDATE empresas SET nicho = NULL WHERE id = 7;
```

### **Isolamento de Dados**

Cada empresa tem seus dados isolados:

```sql
-- Exemplo: Leads da empresa 5
SELECT * FROM leads WHERE empresa_id = 5;

-- Conversas da empresa 6
SELECT * FROM conversas WHERE empresa_id = 6;
```

---

## 🔧 SOLUÇÃO DE PROBLEMAS

### **Problema: Erro ao fazer login**

**Erro:** `'geral' is not among the defined enum values. Enum name: nichoempresa`

**Solução:**
```bash
python backend/fix_database_enums.py
```

### **Problema: Backend não inicia**

**Erro:** `ModuleNotFoundError: No module named 'flask'`

**Solução:**
```bash
cd backend
pip install -r requirements.txt
```

### **Problema: Bot não se conecta ao WhatsApp**

**Passos:**
1. Verificar se o **Integrated Bot Server** está rodando (porta 3010)
2. Acessar CRM Cliente: http://localhost:5177/
3. Ir em "Bot WhatsApp" e conectar (escanear QR Code)
4. Verificar no console do servidor se a conexão foi bem-sucedida

### **Problema: Página não carrega (CORS error)**

**Solução:**
Verificar se o backend está rodando e se as origens permitidas estão corretas em `backend/backend/__init__.py`:

```python
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:5175",
    "http://localhost:5177",
    # ...
]
```

### **Problema: Banco de dados vazio**

**Solução:**
```bash
# Recriar tabelas
python backend/database/models.py

# Criar usuários de teste
python backend/criar_usuarios_teste.py
```

### **Problema: LocalTunnel não conecta**

**Solução:**
1. Verificar se o backend está rodando na porta 5000
2. Reiniciar a janela do LocalTunnel
3. Verificar o arquivo `VendeAI/start-tunnel-reconnect.bat`

---

## 📝 CHECKLIST PRÉ-TESTE

Antes de testar o sistema, verifique:

- [ ] VendeAI Backend iniciado (porta 5000)
- [ ] Integrated Bot Server rodando (porta 3010)
- [ ] CRM Cliente acessível (porta 5177)
- [ ] Landing Page acessível (porta 5173)
- [ ] WhatsApp conectado via QR Code
- [ ] Bot ATIVADO usando toggle verde no CRM Cliente
- [ ] WebSocket conectado (verificar console do navegador)

---

## 🎯 FLUXO DE MENSAGENS MULTI-TENANT

```
WhatsApp (Usuário envia mensagem)
       ↓
Integrated Bot Server (porta 3010)
       ↓
Bot Selector (consulta nicho no BD)
       ↓
   ┌───────────────┐
   │               │
   ▼               ▼
VendeAI Bot   AIra Imob Bot   Bot Genérico
(veículos)     (imóveis)        (outros)
   │               │               │
   └───────────────┴───────────────┘
                   ↓
        Backend Flask (porta 5000)
                   ↓
        Banco de Dados SQLite
                   ↓
        CRM Cliente (exibe conversa)
```

---

## 📚 DOCUMENTAÇÃO ADICIONAL

- **Arquitetura Completa:** `ARQUITETURA_SISTEMA_COMPLETA.md`
- **Correções de Pagamento:** `CORRECOES_PAGAMENTO.md`
- **Frontend Implementation:** `CRM_Client/crm-client-app/IMPLEMENTACAO_FRONTEND.md`

---

## 🆘 SUPORTE

Para dúvidas ou problemas:

1. Verificar logs do backend Flask
2. Consultar console do navegador (F12)
3. Verificar logs do Integrated Bot Server
4. Consultar documentação do projeto

---

**Sistema desenvolvido por HelixAI - Novembro 2025**

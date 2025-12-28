# 🏗️ ARQUITETURA COMPLETA DO SISTEMA HELIXAI

**Última atualização:** 31/10/2025

---

## 📊 BANCO DE DADOS

### **Banco Principal: SQLite (vendeai.db)**

**Localização:** `D:\Helix\HelixAI\vendeai.db`

**Modo Atual:** Local (SQLite)
- `USE_REMOTE_DB=False` no `.env`
- Não está usando banco remoto
- Todas as operações são locais

### **Tabelas Existentes (25 tabelas)**

#### **1. Sistema Core**
- `empresas` - Empresas clientes (multi-tenant)
- `usuarios` - Usuários do sistema
- `configuracoes_bot` - Configurações de bot por empresa

#### **2. WhatsApp & Leads**
- `leads` - Leads capturados
- `conversas` - Conversas do WhatsApp
- `mensagens` - Mensagens trocadas
- `metricas_conversas` - Métricas de conversas
- `interacoes_lead` - Interações com leads

#### **3. Campanhas & Disparos**
- `campanhas` - Campanhas de marketing
- `disparos` - Disparos individuais
- `logs_disparo_massa` - Logs de disparo em massa
- `configuracao_robo_disparador` - Config do robô de disparo

#### **4. Produtos**
- `produtos` - Produtos cadastrados
- `veiculos` - Veículos (para empresas do nicho veículos)

#### **5. Assinaturas (NOVO - criado agora)**
- `planos` - Planos de assinatura
- `assinaturas` - Assinaturas ativas
- `pagamentos` - Histórico de pagamentos

#### **6. Afiliados**
- `afiliados` - Afiliados cadastrados
- `referencias` - Referências de afiliados
- `comissoes` - Comissões geradas
- `saques_afiliados` - Saques realizados
- `configuracoes_afiliados` - Configurações

#### **7. Sistema**
- `logs_sistema` - Logs do sistema
- `arquivos_importacao` - Arquivos importados
- `leads_importacao` - Leads importados
- `templates_mensagem` - Templates de mensagens
- `integracoes` - Integrações externas

---

## 💰 PLANOS DE ASSINATURA

### **Planos Cadastrados**

| ID | Nome | Preço | Período | Limite Mensagens | Limite Tokens |
|----|------|-------|---------|------------------|---------------|
| 1  | Free | R$ 0,00 | mensal | 100 | 10.000 |
| 2  | Professional | R$ 997,00 | mensal | 5.000 | 500.000 |
| 3  | Enterprise | R$ 1.997,00 | mensal | 999.999 | 999.999.999 |

### **Recursos por Plano**

**Free:**
- Bot simples
- IA básica

**Professional:**
- Bot avançado
- IA avançada (Claude/GPT)
- ElevenLabs (áudio)
- Multi-agente
- CRM completo

**Enterprise:**
- Tudo liberado
- Suporte prioritário
- Multi-agente
- White label

---

## 🏢 MULTI-TENANT (MÚLTIPLAS EMPRESAS)

### **Como Funciona**

O sistema suporta **múltiplas empresas** simultaneamente, cada uma com:
- ✅ Configurações próprias de bot
- ✅ Banco de dados compartilhado (SQLite)
- ✅ Sessão WhatsApp independente
- ✅ Bot especializado por nicho

### **Empresas Cadastradas**

```
ID: 1  - VendeAI Sistema      - Nicho: geral
ID: 2  - Empresa Demonstração - Nicho: geral
ID: 22 - Empresa Teste        - Nicho: geral
ID: 23 - Empresa Teste        - Nicho: não definido
```

### **Isolamento de Dados**

Cada empresa tem seus próprios dados isolados através de `empresa_id`:

```sql
-- Exemplo: Leads da empresa 22
SELECT * FROM leads WHERE empresa_id = 22;

-- Conversas da empresa 23
SELECT * FROM conversas WHERE empresa_id = 23;
```

### **Configuração de Nicho**

Para definir o nicho de uma empresa e ativar o bot especializado:

```sql
-- VendeAI Bot (veículos)
UPDATE empresas SET nicho = 'veiculos' WHERE id = 22;

-- AIra Imob Bot (imóveis)
UPDATE empresas SET nicho = 'imoveis' WHERE id = 23;

-- Bot genérico
UPDATE empresas SET nicho = NULL WHERE id = 24;
```

---

## 🤖 MULTI-AGENTE (BOT AUTOMÁTICO POR NICHO)

### **Status Atual: SINGLE-TENANT**

⚠️ **IMPORTANTE:** O script `INICIAR_SISTEMA_CORRETO.bat` está iniciando o bot em modo **SINGLE-TENANT**, não multi-agente!

**Linha 150 do script (ATUAL):**
```bat
node main.js  ← Modo single-tenant (uma empresa por vez)
```

**Para ativar multi-agente (CORREÇÃO NECESSÁRIA):**
```bat
node integrated-bot-server.js  ← Modo multi-agente (múltiplas empresas)
```

### **Arquitetura Multi-Agente (quando ativado)**

```
┌─────────────────────────────────────┐
│  Integrated Bot Server (porta 3010) │
│  - Gerencia múltiplas empresas      │
│  - Seleciona bot por nicho          │
└───────────┬─────────────────────────┘
            │
            ▼
    ┌───────────────┐
    │ Bot Selector  │ (consulta nicho no BD)
    └───────┬───────┘
            │
     ┌──────┴──────┐
     ▼             ▼
┌─────────┐   ┌──────────┐
│ VendeAI │   │ AIra Imob│
│  Bot    │   │   Bot    │
│(veículos│   │ (imóveis)│
└─────────┘   └──────────┘
```

### **Como o Bot é Selecionado**

1. **Cliente envia mensagem** via WhatsApp
2. **Bot Selector** consulta o banco:
   ```sql
   SELECT nicho FROM empresas WHERE id = :empresa_id
   ```
3. **Se nicho = 'veiculos'** → Carrega VendeAI Bot
4. **Se nicho = 'imoveis'** → Carrega AIra Imob Bot
5. **Se nicho = NULL** → Carrega bot genérico

---

## 🔄 BANCO DE DADOS HÍBRIDO (OPCIONAL)

### **Modo Atual: DESATIVADO**

```env
USE_REMOTE_DB=False
```

### **Se Ativado (USE_REMOTE_DB=True)**

```
┌────────────────────┐
│   SQLite (Local)   │ ← Cache + operações rápidas
└──────┬─────────────┘
       │
       ▼
┌────────────────────┐
│  API Remota        │ ← Fonte principal de dados
│  (MySQL/Postgres)  │
└────────────────────┘
```

**Vantagens:**
- ✅ Sincronização automática
- ✅ Backup em nuvem
- ✅ Acesso de múltiplos servidores
- ✅ Cache local para performance

**Desvantagens:**
- ❌ Complexidade maior
- ❌ Dependência de API externa
- ❌ Latência de rede

---

## 🚀 ARQUITETURA GERAL DO SISTEMA

```
┌───────────────────────────────────────────────────┐
│           FRONTEND (React + Vite)                 │
│  - Landing Page (porta 5173)                      │
│  - CRM Admin (porta 5175)                         │
│  - CRM Cliente (porta 5177)                       │
└──────────────┬────────────────────────────────────┘
               │
               ▼
┌───────────────────────────────────────────────────┐
│        BACKEND FLASK (porta 5000)                 │
│  - API REST (/api/*)                              │
│  - Sistema de Assinaturas (/api/assinatura/*)    │
│  - Webhook MercadoPago (/api/webhook/mercadopago)│
│  - CRM Bridge (/api/crm/*)                        │
└──────────────┬────────────────────────────────────┘
               │
               ▼
┌───────────────────────────────────────────────────┐
│         BANCO DE DADOS (SQLite)                   │
│  - vendeai.db (25 tabelas)                        │
│  - Multi-tenant (empresa_id)                      │
│  - Planos e Assinaturas                           │
└───────────────────────────────────────────────────┘

               ┌────────────────┐
               │                │
               ▼                ▼
┌──────────────────────┐  ┌──────────────────────┐
│  VendeAI Bot Engine  │  │  WhatsApp Service    │
│  (porta 3010)        │  │  (Baileys)           │
│  - Single-tenant     │  │  - Conexão WA        │
│  - IA Master         │  │  - QR Code           │
│  - Function Calling  │  │  - WebSocket         │
└──────────────────────┘  └──────────────────────┘
```

---

## 📡 INTEGRAÇÃO MERCADOPAGO

### **Configuração Atual**

```env
MERCADOPAGO_ACCESS_TOKEN=TEST-8516809093490659-101823-...
MERCADOPAGO_PUBLIC_KEY=TEST-c93f534c-1b3e-4f1c-...
```

### **Endpoints de Pagamento**

```
GET  /api/assinatura/config             - Chave pública MP
GET  /api/assinatura/planos             - Listar planos
POST /api/assinatura/processar-pagamento - Processar pagamento
POST /api/webhook/mercadopago           - Webhook notificações
GET  /api/assinatura/status             - Status da assinatura
POST /api/assinatura/cancelar           - Cancelar assinatura
```

### **Fluxo de Pagamento**

1. Frontend carrega `public_key` do backend
2. MercadoPago SDK cria `token` do cartão
3. Frontend envia `POST /api/assinatura/processar-pagamento`
4. Backend cria pagamento no MercadoPago
5. MercadoPago envia notificação via webhook
6. Backend atualiza status da assinatura
7. Usuário é ativado/desativado baseado no status

---

## ✅ PRÓXIMOS PASSOS

### **1. Ativar Multi-Agente (RECOMENDADO)**

Editar `INICIAR_SISTEMA_CORRETO.bat` linha 150:

```bat
:: ANTES (single-tenant):
node main.js

:: DEPOIS (multi-agente):
node integrated-bot-server.js
```

### **2. Definir Nichos das Empresas**

```sql
-- Empresa de veículos
UPDATE empresas SET nicho = 'veiculos' WHERE id = 22;

-- Empresa de imóveis
UPDATE empresas SET nicho = 'imoveis' WHERE id = 23;
```

### **3. Testar Sistema de Pagamento**

1. Iniciar backend: `python backend/app.py`
2. Acessar checkout: `http://localhost:5173/checkout.html`
3. Usar cartão de teste do MercadoPago
4. Verificar webhook no console do backend

### **4. Configurar Webhook em Produção**

1. Expor backend publicamente (ngrok/localtunnel)
2. Configurar URL no painel do MercadoPago
3. Testar notificações de pagamento

---

## 📞 SUPORTE

Para dúvidas ou problemas:
- Verificar logs do backend Flask
- Consultar documentação MercadoPago
- Verificar tabelas do banco com:
  ```bash
  python -c "import sqlite3; conn = sqlite3.connect('vendeai.db'); cursor = conn.cursor(); cursor.execute('SELECT name FROM sqlite_master WHERE type=\"table\";'); print([t[0] for t in cursor.fetchall()]); conn.close()"
  ```

---

**Sistema desenvolvido para HelixAI - Outubro 2025**

# VendeAI - Sistema Integrado de Automação WhatsApp

## 🎯 Visão Geral

**VendeAI** é um sistema completo de automação de vendas via WhatsApp que integra 3 componentes principais:

1. **Bot Engine** - Motor de IA conversacional (FeiraoShowCar)
2. **Admin Dashboard** - Painel de disparos em massa (RoboVendedor)
3. **Client Dashboard** - Painel do usuário final (RoboVendedorPro)

## 🏗️ Arquitetura do Sistema

```
VendeAI/
├── backend/              # API Backend Flask/Python
│   ├── api/             # Endpoints REST API
│   ├── services/        # Lógica de negócio
│   └── middleware/      # Autenticação, CORS, etc
│
├── bot_engine/          # Motor do Bot WhatsApp (Node.js)
│   ├── core/           # Core do bot (Baileys)
│   ├── ia/             # Módulos de IA (OpenAI, Groq, ElevenLabs)
│   ├── handlers/       # Manipuladores de mensagens
│   └── integrations/   # Integrações (FIPE, Financiamento)
│
├── frontend/            # Interface Web (Flask Templates)
│   ├── admin/          # Dashboard Admin
│   ├── client/         # Dashboard Cliente
│   └── components/     # Componentes reutilizáveis
│
├── database/            # Banco de Dados Unificado
│   ├── models.py       # Modelos SQLAlchemy
│   ├── migrations/     # Migrações de BD
│   └── seeds/          # Dados iniciais
│
├── shared/              # Código compartilhado
│   ├── utils/          # Utilitários
│   ├── constants/      # Constantes
│   └── types/          # Tipos/Interfaces
│
└── config/              # Configurações
    ├── .env            # Variáveis de ambiente
    └── settings.py     # Configurações gerais
```

## 🗄️ Banco de Dados Unificado

### Tabelas Principais:

#### 1. **Empresas/Clientes**
- `usuarios` - Usuários do sistema (admin e clientes)
- `empresas` - Empresas cadastradas
- `assinaturas` - Planos e pagamentos

#### 2. **Conversas e Leads**
- `conversas` - Todas as conversas WhatsApp
- `mensagens` - Mensagens individuais
- `leads` - Leads capturados
- `interacoes` - Histórico de interações

#### 3. **Campanhas**
- `campanhas` - Campanhas de disparo
- `templates_mensagem` - Templates de mensagens
- `disparos` - Log de disparos realizados

#### 4. **Configurações**
- `configuracoes_bot` - Configurações do bot por empresa
- `integrações` - APIs configuradas (OpenAI, ElevenLabs)
- `webhooks` - Webhooks do ElevenLabs

#### 5. **Analytics**
- `metricas_conversas` - Métricas de performance
- `analytics_vendas` - Analytics de vendas
- `relatorios` - Relatórios gerados

## 🚀 Funcionalidades Integradas

### Bot Engine (Core)
- ✅ Conexão WhatsApp via Baileys
- ✅ IA Conversacional (GPT-4, Groq)
- ✅ Síntese de voz (ElevenLabs)
- ✅ Análise de intenções
- ✅ Simulador de financiamento
- ✅ Integração FIPE
- ✅ Gerenciamento de contexto
- ✅ Webhooks ElevenLabs Agent

### Admin Dashboard
- ✅ Disparos em massa
- ✅ Gerenciamento de leads
- ✅ Templates de mensagens
- ✅ Analytics em tempo real
- ✅ Relatórios de conversão

### Client Dashboard
- ✅ Login multi-tenant
- ✅ Configuração do bot via frontend
- ✅ Visualização de conversas
- ✅ Métricas personalizadas
- ✅ Gerenciamento de campanhas
- ✅ Integração com ElevenLabs Agent ID

## 🔄 Fluxo de Integração

```
┌─────────────────┐
│   WhatsApp      │
└────────┬────────┘
         │
    ┌────▼────┐
    │ Bot     │◄──────┐
    │ Engine  │       │
    └────┬────┘       │
         │            │
    ┌────▼────────────▼───────┐
    │  Backend API (Flask)    │
    │  - Gerenciamento        │
    │  - Analytics            │
    │  - Webhooks             │
    └────┬─────────┬──────────┘
         │         │
  ┌──────▼───┐  ┌─▼──────┐
  │  Admin   │  │ Client │
  │Dashboard │  │Dashboard│
  └──────────┘  └────────┘
         │         │
    ┌────▼─────────▼────┐
    │  Database Unified │
    └───────────────────┘
```

## 🔧 Tecnologias Utilizadas

### Backend
- **Python 3.13+** - Linguagem principal
- **Flask 3.0** - Framework web
- **SQLAlchemy 2.0** - ORM
- **Flask-Login** - Autenticação
- **Flask-CORS** - Cross-Origin

### Bot Engine
- **Node.js 18+** - Runtime
- **Baileys** - WhatsApp Web API
- **OpenAI GPT-4** - IA Conversacional
- **Groq** - IA rápida
- **ElevenLabs** - Síntese de voz

### Frontend
- **Jinja2** - Templates
- **Bootstrap 5** - UI Framework
- **Chart.js** - Gráficos
- **Alpine.js** - Reatividade

### Database
- **SQLite** (dev) / **PostgreSQL** (prod)

## 📦 Instalação

```bash
# 1. Clone o repositório
cd C:\Users\Victor\Documents\VendeAI

# 2. Instale dependências Python
pip install -r requirements.txt

# 3. Instale dependências Node.js
cd bot_engine && npm install

# 4. Configure variáveis de ambiente
cp config/.env.example config/.env
# Edite config/.env com suas chaves API

# 5. Inicialize o banco de dados
python database/init_db.py

# 6. Inicie o sistema
python run.py
```

## 🎬 Início Rápido

```bash
# Iniciar todos os serviços
python run.py --all

# Iniciar apenas backend
python run.py --backend

# Iniciar apenas bot
python run.py --bot

# Acessar dashboards
Admin: http://localhost:5000/admin
Client: http://localhost:5000
```

## 🔐 Credenciais Padrão

**Admin:**
- Email: admin@vendeai.com
- Senha: admin123

**Cliente Demo:**
- Email: demo@vendeai.com
- Senha: demo123

## 📊 Integrações

### ElevenLabs Agent
O sistema está integrado com o ElevenLabs Conversational AI via webhooks:
- **Agent ID**: Configurável por empresa
- **Webhooks**: Recebe eventos de conversas
- **Síntese de Voz**: Gera áudios personalizados

### OpenAI GPT
- **Modelo**: GPT-4 Turbo
- **Uso**: Análise de intenções, respostas inteligentes
- **Personalização**: Configurável por usuário via dashboard

### API FIPE
- Consulta de valores de veículos
- Comparação de preços
- Análise de mercado

## 🛠️ Desenvolvimento

### Estrutura de Commits
```
feat: nova funcionalidade
fix: correção de bug
docs: documentação
refactor: refatoração
test: testes
```

### Branches
- `main` - Produção
- `develop` - Desenvolvimento
- `feature/*` - Novas features
- `fix/*` - Correções

## 📝 Migração dos Sistemas Antigos

### 1. FeiraoShowCar → bot_engine/
- ✅ Copiar bot-lucas.js
- ✅ Copiar módulos IA
- ✅ Copiar integrações (FIPE, Financiamento)
- ✅ Adaptar para multi-tenant

### 2. RoboVendedor → Admin Dashboard
- ✅ Migrar disparos em massa
- ✅ Migrar gerenciamento de leads
- ✅ Unificar banco de dados

### 3. RoboVendedorPro → Client Dashboard
- ✅ Migrar interface do usuário
- ✅ Migrar configurações de bot
- ✅ Integrar com bot_engine

## 🎯 Roadmap

- [x] Análise dos sistemas existentes
- [ ] Criação do banco unificado
- [ ] Migração do bot engine
- [ ] Migração do admin dashboard
- [ ] Migração do client dashboard
- [ ] Testes de integração
- [ ] Deploy em produção

## 📞 Suporte

Para dúvidas ou problemas, entre em contato com o time de desenvolvimento.

---

**VendeAI** - Automatize suas vendas com inteligência artificial 🚀

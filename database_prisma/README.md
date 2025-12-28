# 🗄️ VendeAI Bot System - Database Documentation

Sistema de banco de dados PostgreSQL com Prisma ORM para o VendeAI Bot System.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Tabelas e Relacionamentos](#tabelas-e-relacionamentos)
- [Instalação e Configuração](#instalação-e-configuração)
- [Migrations](#migrations)
- [Seeds](#seeds)
- [Queries de Exemplo](#queries-de-exemplo)
- [Performance e Otimização](#performance-e-otimização)
- [Segurança](#segurança)

---

## 🎯 Visão Geral

O banco de dados foi projetado para suportar:

- **Multi-tenancy**: Isolamento completo de dados por empresa
- **Escalabilidade**: Preparado para milhões de mensagens
- **Flexibilidade**: Campos JSON para dados variáveis
- **Auditoria**: Log completo de todas as ações
- **Analytics**: Métricas detalhadas de performance
- **LGPD Compliance**: Soft deletes e anonimização

---

## 🏗️ Arquitetura

### Diagrama de Relacionamentos

```
┌──────────────┐
│   Empresa    │ (Multi-tenant Root)
└──────┬───────┘
       │
       ├──────┬─────────────────┬────────────┬──────────────┬────────────┐
       │      │                 │            │              │            │
       ▼      ▼                 ▼            ▼              ▼            ▼
   ┌──────┐ ┌────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
   │Users │ │ Bots   │  │Vehicles  │  │Messages  │  │Analytics │  │Knowledge │
   └──────┘ │Config  │  └──────────┘  │ +        │  └──────────┘  │  Base    │
            └────────┘                 │Convs     │                 └──────────┘
                                      └──────────┘
```

### Principais Entidades

| Entidade | Descrição | Relacionamentos |
|----------|-----------|-----------------|
| **Empresa** | Root entity (multi-tenant) | → Users, Vehicles, Conversations, etc |
| **User** | Usuários do sistema (admins, vendedores) | → Conversations, Appointments |
| **BotConfiguration** | Configurações do bot por empresa | → Empresa |
| **Vehicle** | Estoque de veículos | → ConversationContext |
| **Conversation** | Conversas com clientes | → Messages, Context, Appointments |
| **Message** | Mensagens individuais | → Conversation |
| **ConversationContext** | Estado da conversa | → Conversation, Vehicle |
| **Appointment** | Agendamentos | → Conversation, User |

---

## 📊 Tabelas e Relacionamentos

### 🏢 Empresas (Multi-tenant)

```prisma
model Empresa {
  id              Int       @id @default(autoincrement())
  nome            String
  cnpj            String?   @unique
  whatsapp_numero String?
  bot_ativo       Boolean   @default(false)
  plano           String    @default("free")
  // ... outros campos
}
```

**Relacionamentos:**
- `1:N` com Users (uma empresa pode ter vários usuários)
- `1:N` com Vehicles (uma empresa pode ter vários veículos)
- `1:N` com Conversations (uma empresa pode ter várias conversas)
- `1:1` com BotConfiguration (uma configuração por empresa)

**Índices:**
- `cnpj` (unique)
- `whatsapp_numero`
- `ativo, bot_ativo` (composite)

---

### 👥 Users

```prisma
model User {
  id          Int       @id @default(autoincrement())
  empresa_id  Int
  nome        String
  email       String    @unique
  senha_hash  String
  tipo        String    @default("vendedor") // admin, vendedor, gestor
  // ... outros campos
}
```

**Relacionamentos:**
- `N:1` com Empresa
- `1:N` com Conversations (conversas atribuídas)
- `1:N` com Appointments

**Índices:**
- `empresa_id`
- `email` (unique)
- `tipo`

---

### 🤖 BotConfiguration

Configurações centralizadas do bot por empresa.

```prisma
model BotConfiguration {
  id                   Int      @id
  empresa_id           Int      @unique
  nome_bot             String   @default("AIra")
  modelo_ia            String   @default("claude-3-sonnet")
  temperatura          Float    @default(0.7)
  auto_resposta_ativa  Boolean  @default(true)
  funcionalidades      Json
  // ... outros campos
}
```

**Campos JSON - funcionalidades:**
```json
{
  "busca_veiculos": true,
  "agendamento": true,
  "fipe": true,
  "financiamento": true,
  "avaliacao_troca": true
}
```

---

### 💬 AutomatedMessage

Mensagens automáticas configuráveis.

```prisma
model AutomatedMessage {
  id                Int      @id
  empresa_id        Int
  tipo              String   // boas_vindas, fora_horario, follow_up
  mensagem          String
  trigger_evento    String?
  trigger_condicao  Json?
  ativo             Boolean  @default(true)
  prioridade        Int      @default(0)
}
```

**Tipos de mensagens:**
- `boas_vindas`: Primeira mensagem
- `fora_horario`: Fora do expediente
- `follow_up`: Acompanhamento após X tempo
- `reengajamento`: Cliente inativo
- `confirmacao_agendamento`: Confirmar test drive

---

### 🕐 BusinessHours

Horários de funcionamento por dia da semana.

```prisma
model BusinessHours {
  id               Int    @id
  empresa_id       Int
  dia_semana       Int    // 0=domingo, 6=sábado
  horario_inicio   String // "08:00"
  horario_fim      String // "18:00"
  ativo            Boolean @default(true)
}
```

---

### 🚗 Vehicle

Estoque de veículos.

```prisma
model Vehicle {
  id              Int      @id
  empresa_id      Int
  marca           String
  modelo          String
  ano             Int
  preco           Decimal  @db.Decimal(10, 2)
  status          String   @default("disponivel")
  caracteristicas Json?
  fotos_urls      Json?
  // ... outros campos
}
```

**Campos JSON - caracteristicas:**
```json
{
  "ar_condicionado": true,
  "direcao_hidraulica": true,
  "vidros_eletricos": true,
  "central_multimidia": true,
  "sensor_estacionamento": true,
  "camera_re": true
}
```

**Índices de busca:**
- Fulltext em `marca, modelo, descricao`
- Índice em `preco`
- Índice em `ano`
- Índice em `status`

---

### 💬 Conversation

Conversas com clientes.

```prisma
model Conversation {
  id                       Int      @id
  empresa_id               Int
  cliente_telefone         String
  cliente_nome             String?
  status                   String   @default("ativa")
  etapa                    String   @default("inicial")
  vendedor_id              Int?
  temperatura_lead         Int      @default(0)  // 0-100
  probabilidade_fechamento Int      @default(0)  // 0-100
  // ... outros campos
}
```

**Status possíveis:**
- `ativa`: Em andamento
- `finalizada`: Concluída
- `abandonada`: Cliente parou de responder
- `convertida`: Vendeu o veículo

**Etapas do funil:**
- `inicial`: Primeiro contato
- `descoberta`: Identificando necessidades
- `apresentacao`: Mostrando veículos
- `negociacao`: Discutindo valores
- `fechamento`: Finalizando venda

---

### ✉️ Message

Mensagens individuais da conversa.

```prisma
model Message {
  id                  Int      @id
  conversa_id         Int
  remetente_tipo      String   // cliente, bot, vendedor
  tipo_mensagem       String   // texto, imagem, audio, video
  conteudo            String
  intencao            String?  // buscar_veiculo, agendar, negociar
  sentimento          String?  // positivo, neutro, negativo
  entidades_extraidas Json?
  // ... outros campos
}
```

**Entidades extraídas (JSON):**
```json
{
  "veiculos": ["Onix", "Gol"],
  "valores": [50000, 70000],
  "datas": ["2024-01-15"],
  "preferencias": ["automatico", "branco"]
}
```

**Fulltext search** habilitado em `conteudo`

---

### 🧠 ConversationContext

Contexto mantido durante a conversa.

```prisma
model ConversationContext {
  id                   Int      @id
  conversa_id          Int      @unique
  veiculo_principal_id Int?
  orcamento_max        Decimal?
  forma_pagamento      String?
  preferencias         Json?
  perfil_cliente       String?  // indeciso, decidido, pesquisador
  resumo_conversa      String?
  proximos_passos      Json?
}
```

Este modelo mantém o "estado" da conversa, permitindo que a IA seja contextual.

---

### 📅 Appointment

Agendamentos de test drives e visitas.

```prisma
model Appointment {
  id                  Int      @id
  empresa_id          Int
  conversa_id         Int?
  tipo                String   // test_drive, visita, avaliacao_troca
  data_hora           DateTime
  status              String   @default("agendado")
  vendedor_id         Int?
  // ... outros campos
}
```

**Status:**
- `agendado`: Criado
- `confirmado`: Cliente confirmou
- `realizado`: Aconteceu
- `cancelado`: Cancelado
- `nao_compareceu`: No-show

---

### 🔌 Integration

Integrações com serviços externos.

```prisma
model Integration {
  id                  Int      @id
  empresa_id          Int
  tipo                String   // whatsapp, anthropic, elevenlabs, fipe
  config              Json     // CRIPTOGRAFADO
  ativo               Boolean  @default(true)
  conectado           Boolean  @default(false)
  total_requisicoes   Int      @default(0)
  // ... outros campos
}
```

**IMPORTANTE:** O campo `config` deve armazenar credenciais **criptografadas**.

---

### 📚 KnowledgeBase

Base de conhecimento / FAQ.

```prisma
model KnowledgeBase {
  id                  Int      @id
  empresa_id          Int
  categoria           String
  titulo              String
  pergunta            String
  resposta            String
  palavras_chave      String[]
  vezes_usado         Int      @default(0)
  relevancia_score    Float    @default(0)
}
```

**Fulltext search** habilitado em `titulo, pergunta, resposta`

---

### 📊 AnalyticsMetric

Métricas e analytics.

```prisma
model AnalyticsMetric {
  id                      Int      @id
  empresa_id              Int
  data                    DateTime @db.Date
  hora                    Int?     // 0-23, null = dia completo
  conversas_iniciadas     Int      @default(0)
  conversas_convertidas   Int      @default(0)
  mensagens_enviadas      Int      @default(0)
  valor_total_vendas      Decimal?
  custo_ia_usd            Decimal?
  // ... outros campos
}
```

Agregação por data e hora permite análises detalhadas.

---

### 📝 AuditLog

Logs de auditoria (LGPD compliance).

```prisma
model AuditLog {
  id                  Int      @id
  empresa_id          Int
  acao                String   // create, update, delete, login
  entidade_tipo       String   // Vehicle, User, etc
  entidade_id         Int?
  usuario_id          Int?
  dados_anteriores    Json?
  dados_novos         Json?
  descricao           String?
  created_at          DateTime @default(now())
}
```

Registra todas as ações críticas no sistema.

---

## 🚀 Instalação e Configuração

### 1. Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### 2. Instalação

```bash
cd database_prisma
npm install
```

### 3. Configurar ambiente

```bash
cp .env.example .env
```

Edite `.env` e configure sua DATABASE_URL:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/vendeai_db?schema=public"
```

### 4. Criar banco de dados

```bash
# Criar banco no PostgreSQL
createdb vendeai_db

# Ou via psql
psql -U postgres
CREATE DATABASE vendeai_db;
```

### 5. Executar migrations

```bash
npm run prisma:migrate
```

### 6. Popular com dados de exemplo

```bash
npm run prisma:seed
```

### 7. Abrir Prisma Studio (opcional)

```bash
npm run prisma:studio
```

Acesse: http://localhost:5555

---

## 🔄 Migrations

### Criar nova migration

```bash
npx prisma migrate dev --name nome_da_migration
```

### Aplicar migrations em produção

```bash
npx prisma migrate deploy
```

### Resetar banco (CUIDADO!)

```bash
npx prisma migrate reset
```

---

## 🌱 Seeds

O arquivo `prisma/seed.js` cria dados de exemplo incluindo:

- 2 empresas
- 3 usuários
- 5 veículos
- 2 conversas
- Configurações completas do bot
- Mensagens automáticas
- Horários de funcionamento
- Base de conhecimento
- Métricas de exemplo

### Executar seed

```bash
npm run prisma:seed
```

---

## 📖 Queries de Exemplo

Ver arquivo `docs/QUERIES.md` para exemplos detalhados.

Exemplos rápidos:

### Buscar veículos disponíveis

```javascript
const veiculos = await prisma.vehicle.findMany({
  where: {
    empresa_id: 1,
    status: 'disponivel',
    preco: {
      lte: 70000 // menor ou igual a 70k
    }
  },
  orderBy: {
    preco: 'asc'
  }
});
```

### Criar nova conversa

```javascript
const conversa = await prisma.conversation.create({
  data: {
    empresa_id: 1,
    cliente_telefone: '5567999887766',
    cliente_nome: 'João Silva',
    status: 'ativa',
    etapa: 'inicial',
    mensagens: {
      create: {
        remetente_tipo: 'cliente',
        tipo_mensagem: 'texto',
        conteudo: 'Olá, procuro um carro'
      }
    }
  },
  include: {
    mensagens: true
  }
});
```

### Analytics diárias

```javascript
const metricas = await prisma.analyticsMetric.findMany({
  where: {
    empresa_id: 1,
    data: {
      gte: new Date('2024-01-01'),
      lte: new Date('2024-01-31')
    }
  },
  orderBy: {
    data: 'asc'
  }
});

const totalConversoes = metricas.reduce(
  (acc, m) => acc + m.conversas_convertidas,
  0
);
```

---

## ⚡ Performance e Otimização

### Índices criados

Todos os índices críticos já estão definidos no schema:

- `empresa_id` em todas as tabelas (multi-tenant)
- `status` em Conversation, Vehicle
- `created_at` em tabelas com timestamps
- Fulltext em Vehicle, Message, KnowledgeBase

### Queries otimizadas

```javascript
// ✅ BOM: Usar select para campos específicos
const veiculos = await prisma.vehicle.findMany({
  select: {
    id: true,
    marca: true,
    modelo: true,
    preco: true
  }
});

// ❌ RUIM: Buscar todos os campos
const veiculos = await prisma.vehicle.findMany();
```

### Pagination

```javascript
const page = 1;
const pageSize = 20;

const [total, veiculos] = await Promise.all([
  prisma.vehicle.count({ where: { empresa_id: 1 } }),
  prisma.vehicle.findMany({
    where: { empresa_id: 1 },
    skip: (page - 1) * pageSize,
    take: pageSize
  })
]);
```

---

## 🔒 Segurança

### Multi-tenancy

**SEMPRE** filtrar por `empresa_id`:

```javascript
// ✅ CORRETO
const veiculos = await prisma.vehicle.findMany({
  where: {
    empresa_id: userEmpresaId // Do token JWT
  }
});

// ❌ INSEGURO
const veiculos = await prisma.vehicle.findMany(); // Retorna de TODAS empresas!
```

### Soft Deletes

Implementar usando `deleted_at`:

```javascript
// Soft delete
await prisma.vehicle.update({
  where: { id: vehicleId },
  data: { deleted_at: new Date() }
});

// Buscar apenas não deletados
const veiculos = await prisma.vehicle.findMany({
  where: {
    empresa_id: 1,
    deleted_at: null
  }
});
```

### Senhas

```javascript
const bcrypt = require('bcrypt');

// Hash ao criar usuário
const senhaHash = await bcrypt.hash(senha, 10);

await prisma.user.create({
  data: {
    email,
    senha_hash: senhaHash
  }
});

// Verificar ao fazer login
const user = await prisma.user.findUnique({ where: { email } });
const senhaValida = await bcrypt.compare(senha, user.senha_hash);
```

### Criptografia de credenciais

Para `Integration.config`, use crypto:

```javascript
const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const key = Buffer.from(process.env.ENCRYPTION_KEY, 'base64');

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text) {
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedText = parts[1];
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

---

## 📞 Suporte

Para dúvidas sobre o banco de dados:

1. Consulte esta documentação
2. Veja `docs/QUERIES.md` para exemplos de queries
3. Use Prisma Studio para explorar os dados: `npm run prisma:studio`

---

## 📄 Licença

MIT License - VendeAI Bot System

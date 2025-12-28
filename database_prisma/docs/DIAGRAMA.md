# 📊 VendeAI Database - Diagrama de Relacionamentos

Visualização completa da arquitetura do banco de dados.

## 🎯 Visão Geral

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         MULTI-TENANT ROOT                                │
│                           🏢 EMPRESA                                     │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ id, nome, cnpj, whatsapp_numero, bot_ativo, plano               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────┬─────────────────────────────────────────────────────────────┘
             │
             │  (1:N para todas as entidades abaixo)
             │
    ┌────────┴────────┬─────────────┬──────────────┬───────────────┐
    │                 │             │              │               │
    ▼                 ▼             ▼              ▼               ▼
┌──────────┐  ┌──────────────┐  ┌────────┐  ┌──────────┐  ┌──────────┐
│  USERS   │  │ BOT CONFIG   │  │VEHICLES│  │KNOWLEDGE │  │ANALYTICS │
│          │  │              │  │        │  │   BASE   │  │ METRICS  │
└─────┬────┘  └──────────────┘  └───┬────┘  └──────────┘  └──────────┘
      │                             │
      │                             │
      ▼                             ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        CONVERSATIONS                                  │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │ id, cliente_telefone, status, etapa, vendedor_id          │     │
│  │ temperatura_lead, probabilidade_fechamento                 │     │
│  └────────────────────────────────────────────────────────────┘     │
└───┬──────────────────┬────────────────┬──────────────────┬──────────┘
    │                  │                │                  │
    │                  │                │                  │
    ▼                  ▼                ▼                  ▼
┌──────────┐   ┌──────────────┐  ┌────────────┐  ┌──────────────┐
│MESSAGES  │   │CONVERSATION  │  │APPOINTMENT │  │  AUDIT LOG   │
│          │   │   CONTEXT    │  │            │  │              │
└──────────┘   └──────────────┘  └────────────┘  └──────────────┘
```

---

## 📐 Relacionamentos Detalhados

### 1️⃣ Empresa (Root Entity)

```
EMPRESA (1)
   ├─────→ (N) Users
   ├─────→ (1) BotConfiguration
   ├─────→ (N) AutomatedMessage
   ├─────→ (N) BusinessHours
   ├─────→ (N) BotBehavior
   ├─────→ (N) Vehicles
   ├─────→ (N) Conversations
   ├─────→ (N) Appointments
   ├─────→ (N) Integrations
   ├─────→ (N) KnowledgeBase
   ├─────→ (N) AnalyticsMetrics
   └─────→ (N) AuditLogs
```

**Cardinalidade:**
- 1 empresa → N registros (todas as tabelas)
- 1 empresa → 1 configuração de bot (unique)

---

### 2️⃣ Users

```
USER
   ├─────→ belongs to (1) Empresa
   ├─────→ has many (N) Conversations (atribuídas)
   └─────→ has many (N) Appointments
```

**Campos chave:**
- `empresa_id` (FK → Empresa)
- `tipo`: admin, vendedor, gestor
- `permissoes`: JSON com permissões customizadas

---

### 3️⃣ Conversations (Hub Central)

```
CONVERSATION
   ├─────→ belongs to (1) Empresa
   ├─────→ has one (1) ConversationContext
   ├─────→ has many (N) Messages
   ├─────→ has many (N) Appointments
   └─────→ assigned to (0-1) User (vendedor)
```

**Fluxo de Estados:**

```
┌─────────┐     ┌───────────┐     ┌──────────────┐     ┌────────────┐     ┌────────────┐
│INICIAL  │ --> │DESCOBERTA │ --> │APRESENTACAO  │ --> │NEGOCIACAO  │ --> │FECHAMENTO  │
└─────────┘     └───────────┘     └──────────────┘     └────────────┘     └────────────┘
                                                                                   │
                                                                                   ▼
                                                    ┌──────────────────────────────────┐
                                                    │ Status: convertida / finalizada  │
                                                    └──────────────────────────────────┘
```

---

### 4️⃣ ConversationContext

```
CONVERSATION_CONTEXT
   ├─────→ belongs to (1) Conversation (1:1)
   ├─────→ references (0-1) Vehicle (veiculo_principal_id)
   └─────→ stores: preferencias, orcamento, forma_pagamento (JSON)
```

**Estrutura do contexto:**

```json
{
  "orcamento_max": 70000.00,
  "forma_pagamento": "financiamento",
  "preferencias": {
    "cambio": "automatico",
    "combustivel": "flex",
    "cor": "branco",
    "ano_minimo": 2020
  },
  "perfil_cliente": "decidido",
  "proximos_passos": [
    "Enviar simulação de financiamento",
    "Agendar test drive"
  ]
}
```

---

### 5️⃣ Messages

```
MESSAGE
   ├─────→ belongs to (1) Conversation
   └─────→ stores: conteudo, intencao, sentimento, entidades_extraidas
```

**Tipos de remetente:**
- `cliente`: Mensagem do cliente
- `bot`: Resposta automática da IA
- `vendedor`: Mensagem manual do vendedor

**Análise IA:**

```
┌───────────┐
│  MESSAGE  │
└─────┬─────┘
      │
      ├──→ Intenção (intencao): buscar_veiculo, agendar, negociar, duvida
      ├──→ Sentimento (sentimento): positivo, neutro, negativo
      └──→ Entidades (entidades_extraidas): JSON
           {
             "veiculos": ["Onix", "Gol"],
             "valores": [50000, 70000],
             "preferencias": ["automatico", "branco"]
           }
```

---

### 6️⃣ Vehicles

```
VEHICLE
   ├─────→ belongs to (1) Empresa
   └─────→ referenced by (N) ConversationContext
```

**Status Flow:**

```
┌────────────┐     ┌──────────┐     ┌─────────┐
│DISPONIVEL  │ --> │RESERVADO │ --> │ VENDIDO │
└────────────┘     └──────────┘     └─────────┘
```

**Características (JSON):**

```json
{
  "ar_condicionado": true,
  "direcao_hidraulica": true,
  "vidros_eletricos": true,
  "travas_eletricas": true,
  "alarme": true,
  "sensor_estacionamento": true,
  "camera_re": true,
  "central_multimidia": true,
  "bancos_couro": false
}
```

---

### 7️⃣ Appointments

```
APPOINTMENT
   ├─────→ belongs to (1) Empresa
   ├─────→ references (0-1) Conversation
   └─────→ assigned to (0-1) User (vendedor)
```

**Tipos de agendamento:**
- `test_drive`: Test drive
- `visita`: Visita à loja
- `avaliacao_troca`: Avaliação de veículo de troca
- `entrega`: Entrega do veículo

**Status Flow:**

```
┌──────────┐     ┌───────────┐     ┌──────────┐
│AGENDADO  │ --> │CONFIRMADO │ --> │REALIZADO │
└──────────┘     └───────────┘     └──────────┘
     │
     └──→ CANCELADO
     └──→ NAO_COMPARECEU
```

---

### 8️⃣ BotConfiguration

```
BOT_CONFIGURATION (1:1 com Empresa)
   └─────→ belongs to (1) Empresa
```

**Funcionalidades (JSON):**

```json
{
  "busca_veiculos": true,
  "agendamento": true,
  "fipe": true,
  "financiamento": true,
  "avaliacao_troca": true,
  "audio_resposta": true,
  "follow_up_automatico": true
}
```

---

### 9️⃣ Integration

```
INTEGRATION
   ├─────→ belongs to (1) Empresa
   └─────→ stores: config (ENCRYPTED JSON)
```

**Tipos de integração:**
- `whatsapp`: WhatsApp Business API
- `anthropic`: Claude AI
- `elevenlabs`: Text-to-Speech
- `fipe`: Tabela FIPE
- `mercadopago`: Gateway de pagamento

**Config (exemplo):**

```json
{
  "api_key": "ENCRYPTED_VALUE",
  "webhook_url": "https://...",
  "enabled_features": ["messages", "media"]
}
```

---

### 🔟 AnalyticsMetric

```
ANALYTICS_METRIC
   └─────→ belongs to (1) Empresa
```

**Agregação por período:**

```
┌─────────────────────────────────────┐
│  empresa_id + data + hora (unique)  │
├─────────────────────────────────────┤
│  hora = NULL → Métricas do dia      │
│  hora = 0-23 → Métricas da hora     │
└─────────────────────────────────────┘
```

---

## 🔗 Índices e Performance

### Índices Compostos

```sql
-- Empresas
CREATE INDEX idx_empresa_ativo ON empresas(ativo, bot_ativo);

-- Conversas
CREATE INDEX idx_conversation_status ON conversations(empresa_id, status, ultima_mensagem);

-- Mensagens
CREATE INDEX idx_message_conversa ON messages(conversa_id, enviada_em DESC);

-- Veículos
CREATE INDEX idx_vehicle_search ON vehicles(empresa_id, status, preco);

-- Analytics
CREATE INDEX idx_analytics_periodo ON analytics_metrics(empresa_id, data, hora);
```

### Fulltext Search

```sql
-- Veículos
CREATE INDEX idx_vehicle_fulltext ON vehicles
  USING GIN(to_tsvector('portuguese', marca || ' ' || modelo || ' ' || COALESCE(descricao, '')));

-- Mensagens
CREATE INDEX idx_message_fulltext ON messages
  USING GIN(to_tsvector('portuguese', conteudo));

-- Knowledge Base
CREATE INDEX idx_knowledge_fulltext ON knowledge_base
  USING GIN(to_tsvector('portuguese', titulo || ' ' || pergunta || ' ' || resposta));
```

---

## 🛡️ Segurança e Isolamento

### Multi-tenancy (Row-Level Security)

```sql
-- Exemplo de policy para RLS no PostgreSQL
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY empresa_isolation ON conversations
  FOR ALL
  TO authenticated_user
  USING (empresa_id = current_setting('app.current_empresa_id')::int);
```

### Soft Deletes

Todas as tabelas críticas têm `deleted_at`:

```javascript
// Sempre filtrar por deleted_at = null
const veiculos = await prisma.vehicle.findMany({
  where: {
    empresa_id: 1,
    deleted_at: null  // ← Importante!
  }
});

// Soft delete
await prisma.vehicle.update({
  where: { id: vehicleId },
  data: { deleted_at: new Date() }
});
```

---

## 📈 Fluxo Completo de uma Conversa

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. Cliente envia primeira mensagem via WhatsApp                         │
└────────────┬────────────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 2. Sistema cria Conversation + ConversationContext + Message            │
│    Status: ativa, Etapa: inicial                                        │
└────────────┬────────────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 3. IA analisa mensagem e extrai:                                       │
│    - Intenção (buscar_veiculo, agendar, etc)                           │
│    - Sentimento (positivo, neutro, negativo)                           │
│    - Entidades (veiculos, valores, preferencias)                       │
└────────────┬────────────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 4. IA responde e atualiza ConversationContext:                         │
│    - orcamento_max                                                      │
│    - preferencias (cambio, cor, etc)                                    │
│    - veiculos_interesse []                                              │
└────────────┬────────────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 5. Cliente demonstra interesse → Conversation.etapa = "negociacao"     │
│    Temperatura_lead aumenta (0 → 75)                                    │
└────────────┬────────────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 6. Bot oferece test drive → cria Appointment                           │
│    Status: agendado                                                     │
└────────────┬────────────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 7. Test drive realizado → Appointment.status = "realizado"             │
│    Conversation.etapa = "fechamento"                                    │
│    Temperatura_lead = 95                                                │
└────────────┬────────────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 8. Venda concluída:                                                     │
│    - Conversation.status = "convertida"                                 │
│    - Vehicle.status = "vendido"                                         │
│    - AnalyticsMetric.conversas_convertidas += 1                         │
│    - AuditLog registra a venda                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Queries Otimizadas

### 1. Dashboard principal (1 query)

```javascript
const dashboard = await prisma.empresa.findUnique({
  where: { id: empresaId },
  include: {
    _count: {
      select: {
        veiculos: {
          where: { status: 'disponivel', deleted_at: null }
        },
        conversas: {
          where: { status: 'ativa' }
        }
      }
    },
    metricas: {
      where: {
        data: hoje,
        hora: null
      },
      take: 1
    }
  }
});
```

### 2. Busca inteligente de veículos (1 query com joins)

```javascript
const veiculos = await prisma.vehicle.findMany({
  where: {
    empresa_id: empresaId,
    status: 'disponivel',
    deleted_at: null,
    preco: { lte: contexto.orcamento_max }
  },
  include: {
    conversas: {
      where: {
        status: 'ativa'
      },
      take: 1
    }
  },
  orderBy: [
    { destaque: 'desc' },
    { preco: 'asc' }
  ],
  take: 10
});
```

---

## 📚 Recursos

- [Schema Prisma](../prisma/schema.prisma)
- [Queries de Exemplo](./QUERIES.md)
- [Guia de Instalação](./SETUP.md)
- [README Principal](../README.md)

---

**VendeAI Bot System** - Diagrama de Relacionamentos © 2024

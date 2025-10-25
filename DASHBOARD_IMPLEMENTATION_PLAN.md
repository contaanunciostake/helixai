# DASHTRANS DASHBOARD - PLANO DE IMPLEMENTACAO COMPLETO

## 1. ESTRUTURA ATUAL DO SISTEMA

### Backend
- **Tecnologia**: Flask (Python) + SQLAlchemy ORM
- **Banco de Dados**: MySQL (helixai_db)
- **Servidor**: http://localhost:5000
- **APIs Existentes**:
  - `/api/bot/*` - Bot WhatsApp
  - `/leads/api/*` - CRUD de Leads
  - `/dashboard` - Metricas basicas (HTML)
  - Outras: campanhas, conversas, produtos, veiculos

### Frontends Existentes
- **CRM Admin**: http://localhost:5173 (React + Vite)
- **CRM Client**: http://localhost:5174 (React + Vite)

### Banco de Dados - Estrutura Atual
```
helixai_db (17 tabelas):
├── empresas (2 registros)
├── usuarios (1 registro)
├── leads (0 registros)
├── conversas (0 registros)
├── mensagens (0 registros)
├── campanhas (0 registros)
├── disparos (0 registros)
├── produtos_catalogo (0 registros)
├── configuracoes_bot
├── arquivos_importacao
├── clientes_contexto
├── integracoes
├── interacoes_lead
├── logs_sistema
├── metricas_conversas
├── properties
└── templates_mensagem
```

---

## 2. MAPEAMENTO: REQUISITOS DO DASHBOARD → BANCO DE DADOS

### Dashboard Principal - Metricas Superiores

| Metrica Dashboard | Fonte de Dados | Status | Implementacao |
|-------------------|----------------|--------|---------------|
| **Revenue** (Receita) | `leads.valor_venda` WHERE `vendido = True` | ✅ EXISTE | SUM dos leads convertidos |
| **Customers** (Clientes) | `leads` WHERE `vendido = True` | ✅ EXISTE | COUNT de leads vendidos |
| **Total Visitors** | FALTA | ❌ NAO EXISTE | Precisa criar `analytics` ou usar `metricas_conversas` |
| **Bounce Rate** | FALTA | ❌ NAO EXISTE | Precisa tracking de sessoes |

### Graficos de Linha (30 dias)

| Grafico | Fonte de Dados | Status | Query SQL |
|---------|----------------|--------|-----------|
| **Receita por Dia** | `leads.valor_venda` + `leads.data_venda` | ✅ PARCIAL | GROUP BY DATE(data_venda) - campo data_venda existe? |
| **Clientes por Dia** | `leads.criado_em` WHERE vendido=True | ✅ EXISTE | GROUP BY DATE(criado_em) |
| **Visitantes por Dia** | FALTA | ❌ NAO EXISTE | Criar tabela analytics |
| **Taxa Rejeicao** | FALTA | ❌ NAO EXISTE | Criar tabela analytics |

### Top 10 Produtos/Servicos

| Requisito | Fonte de Dados | Status | Notas |
|-----------|----------------|--------|-------|
| Lista de produtos | `produtos_catalogo` | ✅ EXISTE | Tabela ja existe |
| Vendas por produto | FALTA | ❌ NAO EXISTE | Precisa campo `produto_id` em `leads` |
| Preco, receita, vendas | FALTA | ❌ PARCIAL | Produtos tem preco, mas falta vincular a vendas |

### Historico de Transacoes

| Campo Dashboard | Campo DB | Status | Notas |
|-----------------|----------|--------|-------|
| Order ID | `leads.id` ou criar `orders.id` | ✅ EXISTE | Usar leads como "pedidos" |
| Date | `leads.criado_em` | ✅ EXISTE | Data de criacao do lead |
| Customer Name | `leads.nome` | ✅ EXISTE | Nome do cliente |
| Payment Status | FALTA | ❌ NAO EXISTE | Adicionar enum `status_pagamento` |
| Total | `leads.valor_venda` | ✅ EXISTE | Valor da venda |
| Payment Method | FALTA | ❌ NAO EXISTE | Adicionar campo `metodo_pagamento` |
| Status | `leads.status` | ✅ EXISTE | Status do lead/venda |

---

## 3. GAPS IDENTIFICADOS E SOLUCOES

### GAP 1: Analytics/Tracking de Visitantes
**Problema**: Dashboard precisa metricas de visitantes, sessoes, bounce rate

**Solucao 1 - Rapida** (Usar dados do WhatsApp como proxy):
```sql
-- Usar conversas como "sessoes" e mensagens como "interacoes"
SELECT
    DATE(c.criado_em) as data,
    COUNT(DISTINCT c.telefone) as visitantes_unicos,
    COUNT(c.id) as sessoes,
    AVG(c.total_mensagens) as engagement
FROM conversas c
WHERE c.criado_em >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(c.criado_em)
```

**Solucao 2 - Ideal** (Criar tabela de analytics):
```sql
CREATE TABLE analytics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    empresa_id INT NOT NULL,
    data DATE NOT NULL,
    visitantes_unicos INT DEFAULT 0,
    pageviews INT DEFAULT 0,
    sessoes INT DEFAULT 0,
    bounce_rate DECIMAL(5,2),
    tempo_medio_sessao INT,
    origem VARCHAR(50),
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);
```

### GAP 2: Relacionamento Produto → Vendas
**Problema**: Nao ha ligacao entre produtos e vendas/leads

**Solucao**:
```sql
-- Adicionar campos em leads
ALTER TABLE leads
ADD COLUMN produto_id INT,
ADD COLUMN produto_nome VARCHAR(255),
ADD COLUMN quantidade INT DEFAULT 1,
ADD FOREIGN KEY (produto_id) REFERENCES produtos_catalogo(id);
```

### GAP 3: Dados de Pagamento
**Problema**: Faltam informacoes de pagamento e status financeiro

**Solucao**:
```sql
-- Adicionar campos em leads
ALTER TABLE leads
ADD COLUMN metodo_pagamento VARCHAR(50),
ADD COLUMN status_pagamento ENUM('PENDENTE', 'PAGO', 'CANCELADO', 'REEMBOLSADO') DEFAULT 'PENDENTE',
ADD COLUMN data_pagamento DATETIME;
```

### GAP 4: Campo data_venda em Leads
**Problema**: Verificar se existe campo para data de conversao

**Solucao**: Se nao existir:
```sql
ALTER TABLE leads
ADD COLUMN data_venda DATETIME,
ADD COLUMN valor_venda DECIMAL(10,2);
```

---

## 4. ESTRUTURA DE APIs A CRIAR

### 4.1 Endpoint: Dashboard Metrics (Metricas Principais)
```
GET /api/dashboard/metrics?periodo=30d
```

**Response:**
```json
{
  "periodo": {
    "inicio": "2025-09-16",
    "fim": "2025-10-16"
  },
  "metricas": {
    "revenue": {
      "valor": 125000.00,
      "variacao": 12.5,
      "comparacao_periodo_anterior": "+R$ 13,900"
    },
    "customers": {
      "total": 145,
      "variacao": 8.3,
      "comparacao_periodo_anterior": "+12 clientes"
    },
    "visitors": {
      "total": 2340,
      "variacao": -3.2,
      "comparacao_periodo_anterior": "-75 visitantes"
    },
    "bounce_rate": {
      "taxa": 42.5,
      "variacao": -2.1,
      "status": "improved"
    }
  }
}
```

**SQL Queries:**
```sql
-- Revenue
SELECT
    SUM(valor_venda) as total_revenue,
    (SELECT SUM(valor_venda) FROM leads
     WHERE vendido = 1
     AND data_venda BETWEEN DATE_SUB(NOW(), INTERVAL 60 DAY)
     AND DATE_SUB(NOW(), INTERVAL 30 DAY)) as revenue_anterior
FROM leads
WHERE vendido = 1
AND empresa_id = :empresa_id
AND data_venda >= DATE_SUB(NOW(), INTERVAL 30 DAY);

-- Customers
SELECT
    COUNT(*) as total_customers,
    (SELECT COUNT(*) FROM leads
     WHERE vendido = 1
     AND criado_em BETWEEN DATE_SUB(NOW(), INTERVAL 60 DAY)
     AND DATE_SUB(NOW(), INTERVAL 30 DAY)) as customers_anterior
FROM leads
WHERE vendido = 1
AND empresa_id = :empresa_id
AND criado_em >= DATE_SUB(NOW(), INTERVAL 30 DAY);
```

---

### 4.2 Endpoint: Charts Data (Dados dos Graficos)
```
GET /api/dashboard/charts?periodo=30d&tipo=revenue,customers,visitors
```

**Response:**
```json
{
  "revenue_chart": [
    {"date": "2025-09-16", "value": 4500},
    {"date": "2025-09-17", "value": 5200},
    ...
  ],
  "customers_chart": [
    {"date": "2025-09-16", "value": 5},
    {"date": "2025-09-17", "value": 7},
    ...
  ],
  "visitors_chart": [
    {"date": "2025-09-16", "value": 89},
    {"date": "2025-09-17", "value": 102},
    ...
  ]
}
```

**SQL Query:**
```sql
-- Revenue Chart (30 dias)
SELECT
    DATE(data_venda) as date,
    SUM(valor_venda) as value
FROM leads
WHERE vendido = 1
AND empresa_id = :empresa_id
AND data_venda >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(data_venda)
ORDER BY date ASC;

-- Customers Chart
SELECT
    DATE(criado_em) as date,
    COUNT(*) as value
FROM leads
WHERE vendido = 1
AND empresa_id = :empresa_id
AND criado_em >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(criado_em)
ORDER BY date ASC;

-- Visitors Chart (usando conversas como proxy)
SELECT
    DATE(criado_em) as date,
    COUNT(DISTINCT telefone) as value
FROM conversas
WHERE empresa_id = :empresa_id
AND criado_em >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(criado_em)
ORDER BY date ASC;
```

---

### 4.3 Endpoint: Top Products
```
GET /api/dashboard/top-products?limit=10&periodo=30d
```

**Response:**
```json
{
  "products": [
    {
      "id": 1,
      "name": "Apartamento 3 Quartos Centro",
      "price": 450000.00,
      "sales": 8,
      "revenue": 3600000.00,
      "percentage": 28.8
    },
    ...
  ],
  "total_revenue": 12500000.00
}
```

**SQL Query:**
```sql
SELECT
    p.id,
    p.nome as name,
    p.preco as price,
    COUNT(l.id) as sales,
    SUM(l.valor_venda) as revenue,
    (SUM(l.valor_venda) / (SELECT SUM(valor_venda) FROM leads WHERE vendido=1 AND empresa_id=:empresa_id) * 100) as percentage
FROM produtos_catalogo p
LEFT JOIN leads l ON l.produto_id = p.id AND l.vendido = 1
WHERE p.empresa_id = :empresa_id
AND l.data_venda >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY p.id, p.nome, p.preco
ORDER BY revenue DESC
LIMIT :limit;
```

---

### 4.4 Endpoint: Transaction History
```
GET /api/dashboard/transactions?page=1&limit=10&status=all&sort=date_desc
```

**Response:**
```json
{
  "transactions": [
    {
      "order_id": "ORD-001245",
      "date": "2025-10-15T14:30:00Z",
      "customer_name": "João Silva",
      "payment_status": "Pago",
      "total": 450000.00,
      "payment_method": "Financiamento",
      "status": "Concluído"
    },
    ...
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 15,
    "total_items": 145,
    "items_per_page": 10
  }
}
```

**SQL Query:**
```sql
SELECT
    CONCAT('ORD-', LPAD(l.id, 6, '0')) as order_id,
    l.criado_em as date,
    l.nome as customer_name,
    l.status_pagamento as payment_status,
    l.valor_venda as total,
    l.metodo_pagamento as payment_method,
    l.status as status
FROM leads l
WHERE l.empresa_id = :empresa_id
AND l.vendido = 1
ORDER BY l.criado_em DESC
LIMIT :limit OFFSET :offset;
```

---

### 4.5 Endpoint: Export Data
```
POST /api/dashboard/export
Body: {
  "tipo": "csv|pdf",
  "dados": "transactions|products|analytics",
  "filtros": {...}
}
```

---

## 5. MIGRACAO DO BANCO DE DADOS

### Script de Migracao SQL
```sql
-- ============================================
-- MIGRATION: Dashboard Analytics Support
-- Data: 2025-10-16
-- ============================================

-- 1. Adicionar campos faltantes em leads
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS data_venda DATETIME,
ADD COLUMN IF NOT EXISTS valor_venda DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS produto_id INT,
ADD COLUMN IF NOT EXISTS produto_nome VARCHAR(255),
ADD COLUMN IF NOT EXISTS quantidade INT DEFAULT 1,
ADD COLUMN IF NOT EXISTS metodo_pagamento VARCHAR(50),
ADD COLUMN IF NOT EXISTS status_pagamento ENUM('PENDENTE', 'PAGO', 'CANCELADO', 'REEMBOLSADO') DEFAULT 'PENDENTE',
ADD COLUMN IF NOT EXISTS data_pagamento DATETIME;

-- 2. Criar foreign key para produtos
ALTER TABLE leads
ADD CONSTRAINT fk_leads_produto
FOREIGN KEY (produto_id) REFERENCES produtos_catalogo(id)
ON DELETE SET NULL;

-- 3. Criar tabela de analytics
CREATE TABLE IF NOT EXISTS analytics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    empresa_id INT NOT NULL,
    data DATE NOT NULL,
    visitantes_unicos INT DEFAULT 0,
    pageviews INT DEFAULT 0,
    sessoes INT DEFAULT 0,
    bounce_rate DECIMAL(5,2),
    tempo_medio_sessao INT,
    origem VARCHAR(50),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    UNIQUE KEY unique_empresa_data (empresa_id, data)
);

-- 4. Criar indices para performance
CREATE INDEX idx_leads_data_venda ON leads(data_venda);
CREATE INDEX idx_leads_vendido_empresa ON leads(vendido, empresa_id);
CREATE INDEX idx_leads_produto ON leads(produto_id);
CREATE INDEX idx_analytics_empresa_data ON analytics(empresa_id, data);

-- 5. Popular dados iniciais de analytics (usar conversas como proxy)
INSERT INTO analytics (empresa_id, data, visitantes_unicos, sessoes)
SELECT
    empresa_id,
    DATE(criado_em) as data,
    COUNT(DISTINCT telefone) as visitantes_unicos,
    COUNT(*) as sessoes
FROM conversas
GROUP BY empresa_id, DATE(criado_em)
ON DUPLICATE KEY UPDATE
    visitantes_unicos = VALUES(visitantes_unicos),
    sessoes = VALUES(sessoes);
```

---

## 6. STACK TECNOLOGICO DO DASHBOARD

### Frontend
```
- React 18
- TypeScript
- Vite
- TailwindCSS
- shadcn/ui
- React Query (TanStack Query)
- Recharts (graficos)
- React Table (tabelas)
- Axios
- date-fns
- lucide-react (icones)
```

### Backend (Adicoes)
```python
# backend/backend/routes/dashboard_api.py

from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from sqlalchemy import func, desc
from datetime import datetime, timedelta

bp = Blueprint('dashboard_api', __name__, url_prefix='/api/dashboard')

@bp.route('/metrics', methods=['GET'])
@login_required
def get_metrics():
    # Implementacao...
    pass

@bp.route('/charts', methods=['GET'])
@login_required
def get_charts():
    # Implementacao...
    pass

# ... outros endpoints
```

---

## 7. ESTRUTURA DE PASTAS DO NOVO DASHBOARD

```
CRM_Admin/crm-admin-app/src/
├── pages/
│   └── Dashboard/
│       ├── Dashboard.tsx              # Pagina principal
│       ├── index.ts
│       └── components/
│           ├── MetricCard.tsx         # Card de metrica individual
│           ├── MetricsGrid.tsx        # Grid com 4 cards
│           ├── RevenueChart.tsx       # Grafico de receita
│           ├── CustomersChart.tsx     # Grafico de clientes
│           ├── VisitorsChart.tsx      # Grafico de visitantes
│           ├── TopProducts.tsx        # Tabela de top produtos
│           ├── TransactionHistory.tsx # Historico de transacoes
│           └── ExportButtons.tsx      # Botoes de exportacao
├── hooks/
│   └── useDashboard.ts                # React Query hooks
├── services/
│   └── dashboardService.ts            # Chamadas API
├── types/
│   └── dashboard.ts                   # TypeScript types
└── utils/
    ├── formatters.ts                  # Formatacao de dados
    └── exportUtils.ts                 # Logica de exportacao
```

---

## 8. PLANO DE IMPLEMENTACAO (FASES)

### FASE 1: Preparacao do Banco de Dados (2-3 horas)
- [ ] Executar script de migracao SQL
- [ ] Validar estrutura das tabelas
- [ ] Popular dados de teste para validacao
- [ ] Verificar indices de performance

### FASE 2: Backend APIs (4-6 horas)
- [ ] Criar `/api/dashboard/metrics`
- [ ] Criar `/api/dashboard/charts`
- [ ] Criar `/api/dashboard/top-products`
- [ ] Criar `/api/dashboard/transactions`
- [ ] Criar `/api/dashboard/export`
- [ ] Testar todos endpoints com Postman/Thunder Client

### FASE 3: Frontend Base (3-4 horas)
- [ ] Configurar React Query
- [ ] Criar types TypeScript
- [ ] Criar services/API calls
- [ ] Criar hooks customizados (useDashboard)
- [ ] Criar pagina Dashboard base

### FASE 4: Componentes de UI (6-8 horas)
- [ ] MetricCard component
- [ ] MetricsGrid (4 cards principais)
- [ ] RevenueChart (Recharts Line Chart)
- [ ] CustomersChart
- [ ] VisitorsChart
- [ ] TopProducts table
- [ ] TransactionHistory table com paginacao
- [ ] ExportButtons

### FASE 5: Integracao e Polish (3-4 horas)
- [ ] Conectar todos componentes
- [ ] Implementar loading states
- [ ] Implementar error handling
- [ ] Adicionar refresh automatico
- [ ] Otimizar queries
- [ ] Responsive design
- [ ] Testes finais

### FASE 6: Features Avancadas (Opcional - 4-6 horas)
- [ ] Filtros de data personalizados
- [ ] Comparacao entre periodos
- [ ] Exportacao CSV/PDF
- [ ] Real-time updates (WebSocket)
- [ ] Dashboard customizavel (drag & drop)

---

## 9. ESTIMATIVA DE TEMPO TOTAL

| Fase | Tempo Estimado | Prioridade |
|------|----------------|------------|
| Fase 1 - Database | 2-3h | ALTA |
| Fase 2 - Backend | 4-6h | ALTA |
| Fase 3 - Frontend Base | 3-4h | ALTA |
| Fase 4 - UI Components | 6-8h | ALTA |
| Fase 5 - Integracao | 3-4h | ALTA |
| Fase 6 - Avancado | 4-6h | MEDIA |
| **TOTAL** | **22-31h** | - |

**Tempo realista**: 3-4 dias de trabalho focado

---

## 10. PROXIMOS PASSOS IMEDIATOS

1. **Validar estrutura do banco**:
   ```bash
   mysql -u root helixai_db -e "DESCRIBE leads;"
   ```

2. **Executar migracao**:
   ```bash
   mysql -u root helixai_db < migrations/dashboard_migration.sql
   ```

3. **Criar arquivo de rotas**:
   ```bash
   touch backend/backend/routes/dashboard_api.py
   ```

4. **Comecar implementacao das APIs**

---

## 11. DECISOES TECNICAS IMPORTANTES

### Por que usar conversas como proxy de visitantes?
- Sistema e focado em WhatsApp
- Cada conversa representa uma "sessao" de usuario
- Metricas de engajamento sao mais relevantes que pageviews tradicionais

### Por que adicionar campos em leads ao inves de criar tabela orders?
- Simplicidade: leads ja funcionam como "pedidos"
- Menos joins: queries mais rapidas
- Menos refatoracao: codigo existente continua funcionando

### Por que React Query?
- Cache automatico
- Refetch inteligente
- Loading/Error states padronizados
- Otimizacoes de performance out-of-the-box

---

## CONCLUSAO

O sistema HelixAI possui uma base solida para implementar o dashboard Dashtrans. As principais necessidades sao:

1. ✅ **Backend Flask** ja funcional
2. ✅ **Database MySQL** ja estruturado
3. ✅ **Dados de leads** (principal fonte)
4. ⚠️ **Campos adicionais** necessarios (migracao SQL)
5. ❌ **APIs de dashboard** precisam ser criadas
6. ❌ **Frontend do dashboard** precisa ser criado do zero

**Status**: Pronto para iniciar a implementacao!

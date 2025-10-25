# HelixAI - Arquitetura Multi-Tenant (Múltiplos Clientes)

## 🎯 Objetivo

Criar uma arquitetura onde:
- **1 HelixAI Master** (gerencia tudo)
- **Múltiplos Robôs** (VendeAI Carros, Imóveis, etc)
- **Cada robô tem múltiplos clientes** (10 garagens, 15 imobiliárias)
- **Cada cliente tem dados isolados** (não pode ver dados de concorrentes)
- **Controle de tokens individual** por cliente

---

## 🏗️ Arquitetura Recomendada: **Schema-per-Tenant (MySQL)**

### Por que Schema-per-Tenant?

✅ **Vantagens:**
- Isolamento total de dados (cada cliente em schema separado)
- Fácil backup/restore individual por cliente
- Segurança: leak de dados é impossível
- Performance: índices e queries isolados
- Escalável: pode migrar clientes grandes para servidor dedicado

❌ **Database-per-Tenant seria PIOR:**
- Limite de conexões do MySQL (cada DB = conexões)
- Difícil gerenciar 100+ bancos de dados
- Custo alto de infraestrutura
- Backups complexos

---

## 📁 Estrutura Proposta

```
HelixAI/
├── master_backend/                  # API Master (gerencia tudo)
│   ├── app.py
│   ├── routes/
│   │   ├── tenants.py              # CRUD de clientes
│   │   ├── assinaturas.py          # Sistema de assinatura
│   │   └── analytics.py            # Métricas globais
│   └── database/
│       └── master_db (MySQL)       # Banco MASTER
│           ├── tenants             # Tabela de clientes
│           ├── assinaturas         # Assinaturas (Mercado Pago)
│           ├── uso_tokens          # Tokens usados por cliente
│           └── usuarios_admin      # Admins da Helix

├── vendeai_carros/                 # Robô especializado em CARROS
│   ├── backend/
│   │   ├── app.py                  # Flask multi-tenant
│   │   ├── middleware/
│   │   │   └── tenant_resolver.py # Identifica cliente pela URL/header
│   │   └── routes/
│   │       ├── veiculos.py
│   │       └── conversas.py
│   └── database/
│       └── vendeai_carros_db (MySQL)
│           ├── schema_garage_alpha/     # Cliente 1: Feirão ShowCar
│           │   ├── cars
│           │   ├── leads
│           │   ├── conversas
│           │   └── mensagens
│           ├── schema_garage_beta/      # Cliente 2: Auto Center XYZ
│           │   ├── cars
│           │   ├── leads
│           │   └── ...
│           └── schema_garage_gamma/     # Cliente 3: Carros Premium
│               └── ...

├── vendeai_imoveis/                # Robô especializado em IMÓVEIS
│   ├── backend/
│   │   └── app.py
│   └── database/
│       └── vendeai_imoveis_db (MySQL)
│           ├── schema_imob_alpha/       # Cliente 1: Imobiliária A
│           ├── schema_imob_beta/        # Cliente 2: Imobiliária B
│           └── ...

└── frontend_client/                # Frontend único (multi-tenant)
    ├── src/
    │   ├── components/
    │   └── config/
    │       └── tenant.js           # Detecta tenant por subdomínio
    └── build/
```

---

## 🔧 Implementação Técnica

### 1. **Banco MASTER (HelixAI)**

```sql
-- master_db.tenants
CREATE TABLE tenants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_key VARCHAR(50) UNIQUE NOT NULL,  -- Ex: 'garage_alpha'
    nome VARCHAR(255) NOT NULL,               -- Ex: 'Feirão ShowCar'
    dominio VARCHAR(255),                     -- Ex: 'feiraoshowcar.vendeai.com'
    robo_tipo VARCHAR(50),                    -- 'carros', 'imoveis', etc
    schema_name VARCHAR(100),                 -- 'schema_garage_alpha'
    database_name VARCHAR(100),               -- 'vendeai_carros_db'
    status VARCHAR(20) DEFAULT 'active',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- master_db.assinaturas (Mercado Pago)
CREATE TABLE assinaturas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    plano_id INT NOT NULL,
    status VARCHAR(50),
    data_inicio DATETIME,
    data_fim DATETIME,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- master_db.uso_tokens
CREATE TABLE uso_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    mes VARCHAR(7) NOT NULL,              -- '2025-10'
    mensagens_usadas INT DEFAULT 0,
    tokens_usados BIGINT DEFAULT 0,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    UNIQUE KEY (tenant_id, mes)
);
```

### 2. **Middleware de Tenant (Backend VendeAI)**

```python
# vendeai_carros/backend/middleware/tenant_resolver.py

import mysql.connector
from flask import request, g, abort

class TenantMiddleware:
    """
    Resolve qual cliente está fazendo a requisição
    baseado no subdomínio ou header X-Tenant-Key
    """

    def __init__(self, app):
        self.app = app
        app.before_request(self.resolve_tenant)

    def resolve_tenant(self):
        """Identifica tenant antes de cada request"""

        # Opção 1: Via subdomínio (feiraoshowcar.vendeai.com)
        host = request.host.split(':')[0]
        subdomain = host.split('.')[0]

        # Opção 2: Via header (útil para API)
        tenant_key = request.headers.get('X-Tenant-Key') or subdomain

        # Buscar tenant no banco MASTER
        tenant = self._buscar_tenant(tenant_key)

        if not tenant:
            abort(404, f"Cliente '{tenant_key}' não encontrado")

        # Verificar assinatura ativa
        if not self._verificar_assinatura(tenant['id']):
            abort(403, "Assinatura inativa. Entre em contato com o suporte.")

        # Armazenar no contexto da request
        g.tenant = tenant
        g.schema_name = tenant['schema_name']

        # Definir schema para esta conexão
        self._set_schema(g.schema_name)

    def _buscar_tenant(self, tenant_key):
        """Busca tenant no banco master"""
        db = mysql.connector.connect(
            host='localhost',
            user='root',
            password='',
            database='master_db'
        )
        cursor = db.cursor(dictionary=True)

        cursor.execute("""
            SELECT * FROM tenants
            WHERE tenant_key = %s AND status = 'active'
        """, (tenant_key,))

        tenant = cursor.fetchone()
        cursor.close()
        db.close()

        return tenant

    def _verificar_assinatura(self, tenant_id):
        """Verifica se tenant tem assinatura ativa"""
        db = mysql.connector.connect(
            host='localhost',
            user='root',
            password='',
            database='master_db'
        )
        cursor = db.cursor(dictionary=True)

        cursor.execute("""
            SELECT status FROM assinaturas
            WHERE tenant_id = %s
            AND status = 'active'
            AND (data_fim IS NULL OR data_fim > NOW())
            LIMIT 1
        """, (tenant_id,))

        assinatura = cursor.fetchone()
        cursor.close()
        db.close()

        return assinatura is not None

    def _set_schema(self, schema_name):
        """Define schema para queries subsequentes"""
        # Armazenar para uso nas queries
        g.db_schema = schema_name


# Em vendeai_carros/backend/app.py
from middleware.tenant_resolver import TenantMiddleware

app = Flask(__name__)
TenantMiddleware(app)  # Ativar middleware
```

### 3. **Queries com Schema Dinâmico**

```python
# vendeai_carros/backend/routes/veiculos.py

from flask import g

@veiculos_bp.route('/veiculos', methods=['GET'])
def listar_veiculos():
    """Lista veículos do cliente (tenant) atual"""

    # Schema já foi definido pelo middleware
    schema = g.db_schema

    db = mysql.connector.connect(
        host='localhost',
        user='root',
        password='',
        database='vendeai_carros_db'
    )
    cursor = db.cursor(dictionary=True)

    # Query com schema dinâmico
    cursor.execute(f"""
        SELECT * FROM {schema}.cars
        WHERE status = 1
        ORDER BY created_at DESC
        LIMIT 50
    """)

    veiculos = cursor.fetchall()

    cursor.close()
    db.close()

    return jsonify({
        'success': True,
        'tenant': g.tenant['nome'],
        'veiculos': veiculos
    })
```

### 4. **Controle de Tokens Centralizado**

```python
# master_backend/services/token_manager.py

def registrar_uso_tokens(tenant_id, mensagens=1, tokens=0):
    """
    Registra uso de tokens no banco MASTER
    Chamado pelo backend de cada robô após processar IA
    """
    db = mysql.connector.connect(
        host='localhost',
        user='root',
        password='',
        database='master_db'
    )
    cursor = db.cursor()

    mes_atual = datetime.now().strftime('%Y-%m')

    cursor.execute("""
        INSERT INTO uso_tokens (tenant_id, mes, mensagens_usadas, tokens_usados)
        VALUES (%s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
            mensagens_usadas = mensagens_usadas + VALUES(mensagens_usadas),
            tokens_usados = tokens_usados + VALUES(tokens_usados)
    """, (tenant_id, mes_atual, mensagens, tokens))

    db.commit()
    cursor.close()
    db.close()


def verificar_limite_tokens(tenant_id):
    """Verifica se tenant excedeu limite de tokens"""
    # Buscar plano da assinatura
    # Buscar uso do mês
    # Retornar se pode usar IA ou não
    pass
```

---

## 🚀 Fluxo de uma Requisição

1. Cliente acessa: `https://feiraoshowcar.vendeai.com/veiculos`
2. Middleware detecta `tenant_key = 'feiraoshowcar'`
3. Busca tenant no `master_db.tenants`
4. Verifica assinatura ativa em `master_db.assinaturas`
5. Define schema: `schema_garage_alpha`
6. Query executa em: `vendeai_carros_db.schema_garage_alpha.cars`
7. Retorna dados APENAS desse cliente

**Cliente concorrente (garage_beta) NUNCA vê dados do garage_alpha!**

---

## 🔐 Segurança e Isolamento

### Níveis de Isolamento:

1. **Banco MASTER**: Credenciais de assinaturas e tokens
2. **Schema por Tenant**: Dados de negócio isolados
3. **API Keys**: Cada cliente tem API key única
4. **Logs separados**: `logs/tenant_garage_alpha.log`

### Prevenção de Vazamento:

```python
# ERRADO ❌ - Pode vazar dados
cursor.execute(f"SELECT * FROM cars WHERE id = {car_id}")

# CERTO ✅ - Sempre usar schema do tenant
cursor.execute(f"""
    SELECT * FROM {g.db_schema}.cars
    WHERE id = %s
""", (car_id,))
```

---

## 📊 Criação de Novo Cliente (Onboarding)

```python
# master_backend/routes/tenants.py

@tenants_bp.route('/criar-cliente', methods=['POST'])
def criar_cliente():
    """
    Cria novo cliente (tenant) no sistema
    """
    data = request.json

    tenant_key = data['tenant_key']      # Ex: 'garage_omega'
    nome = data['nome']                  # Ex: 'Auto Peças Omega'
    robo_tipo = data['robo_tipo']        # Ex: 'carros'

    # 1. Criar registro no master_db.tenants
    tenant_id = criar_tenant_master(tenant_key, nome, robo_tipo)

    # 2. Criar schema no banco do robô
    schema_name = f"schema_{tenant_key}"
    criar_schema_tenant(robo_tipo, schema_name)

    # 3. Criar assinatura no Mercado Pago
    preferencia = criar_preferencia_pagamento(tenant_id, plano_id=1)

    return jsonify({
        'success': True,
        'tenant_id': tenant_id,
        'schema_name': schema_name,
        'checkout_url': preferencia['init_point']
    })


def criar_schema_tenant(robo_tipo, schema_name):
    """Cria schema com tabelas para novo cliente"""

    if robo_tipo == 'carros':
        db_name = 'vendeai_carros_db'
        sql_template = 'templates/schema_carros.sql'
    elif robo_tipo == 'imoveis':
        db_name = 'vendeai_imoveis_db'
        sql_template = 'templates/schema_imoveis.sql'

    db = mysql.connector.connect(host='localhost', user='root', password='')
    cursor = db.cursor()

    # Criar schema
    cursor.execute(f"CREATE SCHEMA {schema_name}")

    # Executar template SQL
    with open(sql_template) as f:
        sql = f.read().replace('{{SCHEMA}}', schema_name)
        cursor.execute(sql, multi=True)

    db.commit()
    cursor.close()
    db.close()
```

---

## 🎯 Resumo da Solução

| Aspecto | Solução |
|---------|---------|
| **Isolamento de Dados** | 1 schema MySQL por cliente |
| **Banco de Assinaturas** | `master_db` centralizado |
| **Controle de Tokens** | `master_db.uso_tokens` |
| **Identificação** | Middleware via subdomínio ou header |
| **Robôs** | 1 backend por nicho (carros, imóveis) |
| **Escalabilidade** | Pode migrar schema para servidor dedicado |

---

## ✅ Vantagens desta Arquitetura

1. **1 robô = N clientes** (não precisa duplicar código)
2. **Dados 100% isolados** (impossível vazar para concorrente)
3. **Tokens individuais** por cliente
4. **Fácil onboarding** (criar schema automaticamente)
5. **Backup individual** (`mysqldump schema_garage_alpha`)
6. **Escalável** (pode mover cliente grande para servidor dedicado)

---

## 🚨 Próximos Passos

1. Criar banco `master_db` com tabelas `tenants`, `assinaturas`, `uso_tokens`
2. Implementar `TenantMiddleware` no VendeAI
3. Migrar `u161861600_feiraoshow` para ser `schema_garage_alpha`
4. Criar API master de onboarding de clientes
5. Integrar controle de tokens com IA

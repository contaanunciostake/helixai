# Arquitetura Multi-Tenant - VendeAI/HelixAI

## 🎯 Objetivo
Permitir que múltiplas empresas usem o mesmo bot/sistema, cada uma com seus próprios dados isolados.

## 📊 Modelo de Dados

### Estrutura Principal

```
helixai_db (Banco Principal)
├── usuarios (tabela global)
│   ├── id
│   ├── email
│   ├── senha_hash
│   ├── empresa_id (FK para empresas) ⭐
│   └── plano_id
│
├── empresas (tabela de tenants)
│   ├── id
│   ├── nome (ex: "Feirão ShowCar", "AutoPeças XYZ")
│   ├── slug (ex: "feirao-showcar", "autopecas-xyz")
│   ├── setor (ex: "veiculos", "autopecas", "imoveis")
│   ├── configuracoes_json (QR Code WhatsApp, API Keys, etc)
│   ├── database_name (ex: "empresa_1_db", "empresa_2_db")
│   ├── ativo
│   └── criado_em
│
├── planos (tabela global)
├── assinaturas (tabela global)
└── pagamentos (tabela global)
```

### Bancos de Dados por Empresa (Opção 1 - Mais Isolado)

```
empresa_1_db (Feirão ShowCar)
├── veiculos
├── leads
├── conversas
├── mensagens
└── produtos_catalogo

empresa_2_db (AutoPeças XYZ)
├── produtos
├── leads
├── conversas
├── mensagens
└── produtos_catalogo

empresa_3_db (Imobiliária Premium)
├── imoveis
├── leads
├── conversas
├── mensagens
└── produtos_catalogo
```

### OU - Banco Único com empresa_id (Opção 2 - Mais Simples)

```
helixai_db
├── usuarios
├── empresas
├── leads (com empresa_id)
├── conversas (com empresa_id)
├── mensagens (com empresa_id)
├── produtos_catalogo (com empresa_id)
└── veiculos (com empresa_id)
```

## 🏗️ Estratégias de Multi-Tenancy

### **Opção 1: Database per Tenant (Recomendado para HelixAI)**
**Vantagens:**
- ✅ Isolamento total de dados
- ✅ Fácil backup/restore por cliente
- ✅ Escalabilidade (pode mover cliente para outro servidor)
- ✅ Segurança máxima (cliente não acessa dados de outros)

**Desvantagens:**
- ❌ Mais complexo de gerenciar
- ❌ Migrations precisam rodar em todos os bancos

**Como funciona:**
1. Cada empresa tem seu próprio banco de dados
2. Na autenticação, identificamos a empresa do usuário
3. Conectamos no banco correto da empresa
4. Bot usa configurações específicas da empresa (QR Code, catálogo, etc)

### **Opção 2: Schema per Tenant**
- Compartilha banco, schemas diferentes
- Menos isolamento que Opção 1

### **Opção 3: Shared Database + empresa_id (Mais Simples)**
**Vantagens:**
- ✅ Mais simples de implementar
- ✅ Uma migration serve para todos
- ✅ Fácil de gerenciar

**Desvantagens:**
- ❌ Menos isolamento
- ❌ Risco de vazamento de dados se query esquecer WHERE empresa_id
- ❌ Performance pode degradar com muitos clientes

**Como funciona:**
1. Todas as tabelas têm coluna `empresa_id`
2. Toda query filtra por `empresa_id`
3. Middleware injeta filtro automaticamente

## 🎯 Recomendação para HelixAI

**Usar OPÇÃO 1 (Database per Tenant)** porque:
1. Você já tem `u161861600_feiraoshow` como exemplo de banco de cliente
2. Cada setor (veículos, imóveis, etc) tem estrutura diferente
3. Clientes querem seus dados totalmente isolados
4. Facilita venda White Label no futuro

## 📝 Implementação Recomendada

### 1. Estrutura de Pastas

```
HelixAI/
├── helixai_db/ (Banco principal - usuários, empresas, assinaturas)
│
├── tenants/ (Bancos de clientes)
│   ├── empresa_1_feirao_showcar/
│   ├── empresa_2_autopecas_xyz/
│   └── empresa_3_imoveis_premium/
│
├── bots/ (Templates de bots por setor)
│   ├── veiculos/
│   │   ├── prompts/
│   │   ├── functions/
│   │   └── config.json
│   │
│   ├── imoveis/
│   │   ├── prompts/
│   │   ├── functions/
│   │   └── config.json
│   │
│   └── autopecas/
│       ├── prompts/
│       ├── functions/
│       └── config.json
│
└── backend/
    └── services/
        ├── tenant_manager.py (Gerencia conexões por tenant)
        ├── bot_factory.py (Cria bot específico por setor)
        └── database_router.py (Roteia queries para DB correto)
```

### 2. Fluxo de Autenticação

```
1. Cliente faz login → API valida em helixai_db.usuarios
2. API retorna: { usuario_id, empresa_id, empresa_slug, setor }
3. Frontend/Bot carrega configurações da empresa
4. Todas as queries vão para o banco da empresa
```

### 3. Fluxo do Bot WhatsApp

```
1. Mensagem chega no webhook
2. Identificar empresa pelo número/QR Code
3. Conectar no banco da empresa
4. Carregar catálogo específico da empresa
5. Bot responde usando dados da empresa
6. Salvar conversa no banco da empresa
```

### 4. Tabela `empresas` (helixai_db)

```sql
CREATE TABLE empresas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    setor ENUM('veiculos', 'imoveis', 'autopecas', 'varejo', 'servicos') NOT NULL,

    -- Banco de dados dedicado
    database_name VARCHAR(100) NOT NULL,
    database_host VARCHAR(100) DEFAULT 'localhost',
    database_port INT DEFAULT 3306,

    -- Configurações do Bot
    whatsapp_numero VARCHAR(20),
    whatsapp_qr_code TEXT,
    whatsapp_token VARCHAR(255),

    -- Configurações de IA
    openai_api_key VARCHAR(255),
    prompt_customizado TEXT,

    -- Status
    ativo TINYINT(1) DEFAULT 1,
    plano_id INT,

    -- Timestamps
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (plano_id) REFERENCES planos(id)
);
```

### 5. Modificar tabela `usuarios`

```sql
ALTER TABLE usuarios
ADD COLUMN empresa_id INT NULL,
ADD FOREIGN KEY (empresa_id) REFERENCES empresas(id);
```

## 🚀 Próximos Passos

1. ✅ Criar tabela `empresas` no helixai_db
2. ✅ Modificar tabela `usuarios` para incluir `empresa_id`
3. ✅ Criar serviço `TenantManager` para gerenciar conexões
4. ✅ Criar serviço `BotFactory` para instanciar bots por setor
5. ✅ Modificar autenticação para retornar dados da empresa
6. ✅ Atualizar webhook WhatsApp para identificar empresa
7. ✅ Criar interface admin para gerenciar empresas

## 🔑 Pontos Críticos

### Segurança
- **NUNCA** usar empresa_id do frontend diretamente
- **SEMPRE** validar empresa_id contra o usuário logado
- **ISOLAR** completamente os dados entre tenants

### Performance
- Usar connection pooling por tenant
- Cache de configurações por empresa
- Lazy loading dos bancos de dados

### Manutenção
- Script para criar novo tenant automaticamente
- Migrations devem rodar em todos os tenants
- Backup automatizado por tenant

## 💡 Exemplo de Uso

### Quando usuário faz login:
```python
# 1. Autenticar
usuario = auth_service.fazer_login(email, senha)

# 2. Carregar empresa
empresa = tenant_manager.get_empresa(usuario.empresa_id)

# 3. Conectar no banco da empresa
db_empresa = tenant_manager.get_database(empresa.database_name)

# 4. Carregar configurações do bot
bot_config = bot_factory.create_bot_config(empresa.setor, empresa.configuracoes)

# 5. Retornar ao frontend
return {
    'usuario': usuario,
    'empresa': empresa,
    'bot_config': bot_config
}
```

### Quando webhook WhatsApp recebe mensagem:
```python
# 1. Identificar empresa pelo número
empresa = tenant_manager.get_empresa_by_whatsapp(numero_recebido)

# 2. Conectar no banco da empresa
db_empresa = tenant_manager.get_database(empresa.database_name)

# 3. Buscar catálogo da empresa
catalogo = db_empresa.query("SELECT * FROM produtos_catalogo")

# 4. Criar bot com contexto da empresa
bot = bot_factory.create_bot(
    setor=empresa.setor,
    catalogo=catalogo,
    prompt=empresa.prompt_customizado
)

# 5. Processar mensagem
resposta = bot.processar_mensagem(mensagem)

# 6. Salvar no banco da empresa
db_empresa.insert_mensagem(conversa_id, resposta)
```

---

**Decisão Final:** Implementar **Database per Tenant** (Opção 1)

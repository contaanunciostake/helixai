# 🚀 GUIA RÁPIDO: Sistema Multi-Database

## ✅ O que foi implementado?

Sistema onde **cada empresa tem seu próprio banco de dados MySQL**.

```
helixai_db (central)       empresa_5_db       empresa_6_db
├── empresas               ├── cars           ├── cars
│   ├── id: 5 ───────────┬→├── customers      ├── customers
│   ├── db_name          │  └── ...           └── ...
│   └── ...              │
│                        │
│   ├── id: 6 ───────────┘
│   └── ...
```

---

## 📋 PASSO A PASSO: Adicionar Nova Empresa

### **1. Executar Migration no Banco Central**

```bash
cd D:\Helix\HelixAI\VendeAI\bot_engine
mysql -u root helixai_db < migrations/add_database_fields_empresas.sql
```

Isso adiciona os campos `db_name`, `db_host`, `db_port`, etc. na tabela `empresas`.

---

### **2. Criar Banco da Nova Empresa**

**Opção A: Usar Script Automático (RECOMENDADO)**

```bash
node setup-empresa.js --empresa-id=7 --nome="Auto Show Curitiba"
```

**O que o script faz:**
- ✅ Cria banco `empresa_7_db`
- ✅ Cria todas as tabelas (cars, customers, conversations, etc.)
- ✅ Insere 3 veículos de exemplo
- ✅ Atualiza registro no `helixai_db`

---

**Opção B: Manual**

```sql
-- 1. Criar banco
CREATE DATABASE empresa_7_db;
USE empresa_7_db;

-- 2. Executar estrutura
source D:/Helix/HelixAI/VendeAI/bot_engine/migrations/empresa_template.sql;

-- 3. Atualizar registro
USE helixai_db;
UPDATE empresas SET
  db_name = 'empresa_7_db',
  db_host = 'localhost',
  db_port = 3306,
  db_user = 'root',
  db_password = ''
WHERE id = 7;
```

---

### **3. Verificar**

```sql
-- Ver empresas configuradas
USE helixai_db;
SELECT id, nome, db_name FROM empresas;

-- Ver veículos da empresa 7
USE empresa_7_db;
SELECT * FROM cars;
```

---

### **4. Conectar WhatsApp no CRM**

1. Acessar o CRM da empresa
2. Ir na aba "Bot"
3. Clicar em "Conectar WhatsApp"
4. Escanear QR Code
5. ✅ Pronto! O bot vai buscar veículos do `empresa_7_db`

---

## 🔄 Como Funciona Internamente?

### **Quando uma mensagem chega:**

```javascript
1. Cliente envia "olá" no WhatsApp
   ↓
2. Session Manager identifica empresa_id=7
   ↓
3. Database Pool Manager busca configuração:
   - SELECT db_name FROM empresas WHERE id=7
   - Retorna: empresa_7_db
   ↓
4. Cria pool de conexão para empresa_7_db
   ↓
5. VeiculosRepository(pool) busca veículos:
   - SELECT * FROM empresa_7_db.cars
   ↓
6. IA processa com dados do banco correto
   ↓
7. Responde cliente com informações dos veículos
```

---

## 📊 Estrutura de Cada Banco de Empresa

```sql
empresa_X_db
├── cars              -- Veículos disponíveis
├── car_images        -- Fotos dos veículos
├── customers         -- Clientes/Leads
├── conversations     -- Histórico de conversas
├── mensagens         -- Mensagens trocadas
└── agendamentos      -- Test drives agendados
```

---

## 🛠️ Gerenciando Empresas Existentes

### **Configurar empresas já cadastradas:**

```bash
# Configurar empresa 5 (já existe mas sem banco)
node setup-empresa.js --empresa-id=5 --nome="Feirão ShowCar"

# Configurar empresa 6
node setup-empresa.js --empresa-id=6 --nome="Outro Cliente"
```

---

## 🔍 Troubleshooting

### **Erro: "Empresa X não possui banco configurado"**

**Solução:**
```sql
USE helixai_db;
UPDATE empresas SET
  db_name = 'empresa_X_db',
  db_host = 'localhost'
WHERE id = X;
```

---

### **Erro: "Table 'empresa_X_db.cars' doesn't exist"**

**Solução:**
```bash
# Recriar banco
node setup-empresa.js --empresa-id=X --nome="Nome da Empresa"
```

---

### **Como importar veículos de um CSV/Excel?**

```bash
# 1. Converter CSV para SQL
# 2. Importar no banco da empresa
mysql -u root empresa_X_db < veiculos_empresa_X.sql
```

---

## 📦 Backup por Empresa

```bash
# Backup de uma empresa específica
mysqldump -u root empresa_7_db > backup_empresa_7_2025-10-19.sql

# Restore
mysql -u root empresa_7_db < backup_empresa_7_2025-10-19.sql
```

---

## ✅ Vantagens Dessa Arquitetura

✅ **Isolamento Total** - Dados 100% separados
✅ **Escalabilidade** - Bancos podem ficar em servidores diferentes
✅ **Performance** - Índices otimizados por empresa
✅ **Segurança** - Cada empresa pode ter senha diferente
✅ **Backup Independente** - Backup por empresa
✅ **Customização** - Cada empresa pode ter estrutura única

---

## 🎯 Checklist: Nova Empresa

- [ ] Executar migration do helixai_db (só 1x)
- [ ] Cadastrar empresa no helixai_db (se não existir)
- [ ] Executar `setup-empresa.js`
- [ ] Verificar se banco foi criado
- [ ] Importar veículos (opcional)
- [ ] Conectar WhatsApp no CRM
- [ ] Testar bot enviando mensagem

---

**Sistema pronto para escalar infinitamente!** 🚀

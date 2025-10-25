# 🏢 ARQUITETURA MULTI-DATABASE - Cada Empresa = 1 Banco

## 🎯 Conceito

```
helixai_db (CENTRAL)           empresa_5_db            empresa_6_db
├── empresas                   ├── cars                ├── cars
│   ├── id: 5                  ├── customers           ├── customers
│   ├── nome                   ├── conversations       ├── conversations
│   ├── db_name ───────────────┤ mensagens             ├── mensagens
│   ├── db_host                └── agendamentos        └── agendamentos
│   ├── db_user
│   └── db_password
└── (configs globais)
```

---

## 📊 ESTRUTURA DO BANCO CENTRAL

### **Tabela: `empresas` (helixai_db)**

```sql
USE helixai_db;

-- Adicionar campos de conexão ao banco da empresa
ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS db_name VARCHAR(100) DEFAULT NULL COMMENT 'Nome do banco de dados da empresa',
ADD COLUMN IF NOT EXISTS db_host VARCHAR(255) DEFAULT 'localhost' COMMENT 'Host do MySQL',
ADD COLUMN IF NOT EXISTS db_port INT DEFAULT 3306 COMMENT 'Porta do MySQL',
ADD COLUMN IF NOT EXISTS db_user VARCHAR(100) DEFAULT 'root' COMMENT 'Usuário do banco',
ADD COLUMN IF NOT EXISTS db_password VARCHAR(255) DEFAULT '' COMMENT 'Senha do banco (criptografada)';

-- Exemplo de dados:
-- empresa_id=5 → db_name='empresa_5_db'
-- empresa_id=6 → db_name='empresa_6_db'
```

**Dados de exemplo:**
```sql
UPDATE empresas SET
  db_name = 'empresa_5_db',
  db_host = 'localhost',
  db_port = 3306,
  db_user = 'root',
  db_password = ''
WHERE id = 5;

UPDATE empresas SET
  db_name = 'empresa_6_db',
  db_host = 'localhost',
  db_port = 3306,
  db_user = 'root',
  db_password = ''
WHERE id = 6;
```

---

## 🗄️ ESTRUTURA DO BANCO DE CADA EMPRESA

Cada empresa terá seu próprio banco com estrutura padrão:

### **Template: `empresa_X_db`**

```sql
CREATE DATABASE IF NOT EXISTS empresa_5_db;
USE empresa_5_db;

-- Tabela de veículos
CREATE TABLE IF NOT EXISTS cars (
  id INT PRIMARY KEY AUTO_INCREMENT,
  brand VARCHAR(100),
  model VARCHAR(255),
  year INT,
  year_model INT,
  price DECIMAL(12,2),
  mileage INT,
  color VARCHAR(50),
  fuel_type VARCHAR(50),
  transmission VARCHAR(50),
  description TEXT,
  status ENUM('available', 'reserved', 'sold') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_brand_model (brand, model)
);

-- Tabela de fotos dos veículos
CREATE TABLE IF NOT EXISTS car_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  car_id INT NOT NULL,
  url VARCHAR(500),
  ordem INT DEFAULT 0,
  is_principal BOOLEAN DEFAULT 0,
  FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
  INDEX idx_car (car_id)
);

-- Tabela de clientes/leads
CREATE TABLE IF NOT EXISTS customers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  cpf VARCHAR(14),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_phone (phone)
);

-- Tabela de conversas
CREATE TABLE IF NOT EXISTS conversations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  customer_id INT NOT NULL,
  status ENUM('novo', 'em_andamento', 'negociando', 'fechado', 'perdido') DEFAULT 'novo',
  last_message TEXT,
  last_interaction TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  INDEX idx_customer (customer_id),
  INDEX idx_status (status)
);

-- Tabela de mensagens
CREATE TABLE IF NOT EXISTS mensagens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  conversation_id INT NOT NULL,
  customer_id INT NOT NULL,
  tipo ENUM('recebida', 'enviada') NOT NULL,
  conteudo TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  INDEX idx_conversation (conversation_id),
  INDEX idx_timestamp (timestamp)
);

-- Tabela de agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  customer_id INT NOT NULL,
  car_id INT,
  tipo ENUM('test_drive', 'visita', 'entrega') NOT NULL,
  data_agendada DATETIME NOT NULL,
  status ENUM('pendente', 'confirmado', 'realizado', 'cancelado') DEFAULT 'pendente',
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (car_id) REFERENCES cars(id),
  INDEX idx_data (data_agendada),
  INDEX idx_status (status)
);
```

---

## 🔌 GERENCIADOR DE CONEXÕES DINÂMICAS

### **Arquivo: `database-pool-manager.js`**

```javascript
/**
 * ════════════════════════════════════════════════════════════════
 * DATABASE POOL MANAGER - Gerenciador de Pools Multi-Database
 * ════════════════════════════════════════════════════════════════
 *
 * Mantém um pool de conexões para cada empresa
 * Conecta automaticamente no banco correto baseado no empresa_id
 */

import mysql from 'mysql2/promise';

class DatabasePoolManager {
  constructor() {
    // Map: empresa_id → pool de conexões
    this.pools = new Map();

    // Pool central (helixai_db)
    this.centralPool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'helixai_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    console.log('✅ [DB-POOL-MANAGER] Inicializado');
  }

  /**
   * 🔌 Obter pool de conexão para uma empresa
   */
  async getPool(empresaId) {
    // Se já existe pool, retorna
    if (this.pools.has(empresaId)) {
      return this.pools.get(empresaId);
    }

    // Buscar configuração da empresa no banco central
    const [rows] = await this.centralPool.execute(
      `SELECT db_name, db_host, db_port, db_user, db_password
       FROM empresas WHERE id = ?`,
      [empresaId]
    );

    if (rows.length === 0) {
      throw new Error(`Empresa ${empresaId} não encontrada`);
    }

    const config = rows[0];

    if (!config.db_name) {
      throw new Error(`Empresa ${empresaId} não possui banco configurado`);
    }

    // Criar novo pool
    const pool = mysql.createPool({
      host: config.db_host || 'localhost',
      port: config.db_port || 3306,
      user: config.db_user || 'root',
      password: config.db_password || '',
      database: config.db_name,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0
    });

    // Testar conexão
    try {
      const [testRows] = await pool.execute('SELECT 1 as test');
      console.log(`✅ [DB-POOL] Pool criado para empresa ${empresaId} → ${config.db_name}`);
    } catch (error) {
      throw new Error(`Erro ao conectar no banco ${config.db_name}: ${error.message}`);
    }

    // Salvar pool
    this.pools.set(empresaId, pool);

    return pool;
  }

  /**
   * 📊 Executar query no banco da empresa
   */
  async executeOnEmpresa(empresaId, sql, params = []) {
    const pool = await this.getPool(empresaId);
    return await pool.execute(sql, params);
  }

  /**
   * 📊 Executar query no banco central
   */
  async executeOnCentral(sql, params = []) {
    return await this.centralPool.execute(sql, params);
  }

  /**
   * 🗑️ Fechar pool de uma empresa
   */
  async closePool(empresaId) {
    if (this.pools.has(empresaId)) {
      const pool = this.pools.get(empresaId);
      await pool.end();
      this.pools.delete(empresaId);
      console.log(`🗑️ [DB-POOL] Pool fechado para empresa ${empresaId}`);
    }
  }

  /**
   * 🗑️ Fechar todos os pools
   */
  async closeAll() {
    console.log('🗑️ [DB-POOL] Fechando todos os pools...');

    for (const [empresaId, pool] of this.pools) {
      await pool.end();
    }

    await this.centralPool.end();

    this.pools.clear();
    console.log('✅ [DB-POOL] Todos os pools fechados');
  }
}

// Singleton
const dbPoolManager = new DatabasePoolManager();

export default dbPoolManager;
```

---

## 🔄 REPOSITÓRIO ADAPTADO

### **Arquivo: `VeiculosRepository` atualizado**

```javascript
class VeiculosRepository {
  constructor(dbPool) {
    this.dbPool = dbPool; // Pool específico da empresa
    this.veiculos = [];
    this.cacheValido = false;
  }

  async buscarVeiculos() {
    try {
      console.log('ℹ️  [INFO] Buscando veículos do banco de dados da empresa...');

      const [rows] = await this.dbPool.execute(`
        SELECT
          c.id,
          c.brand,
          c.model,
          c.year,
          c.year_model,
          c.price,
          c.mileage,
          c.color,
          c.fuel_type,
          c.transmission,
          c.description,
          GROUP_CONCAT(ci.url ORDER BY ci.ordem) as images
        FROM cars c
        LEFT JOIN car_images ci ON c.id = ci.car_id
        WHERE c.status = 'available'
        GROUP BY c.id
        ORDER BY c.created_at DESC
      `);

      this.veiculos = rows.map(row => ({
        id: row.id,
        marca: row.brand,
        modelo: row.model,
        ano: row.year,
        anoModelo: row.year_model,
        preco: parseFloat(row.price),
        km: row.mileage,
        cor: row.color,
        combustivel: row.fuel_type,
        cambio: row.transmission,
        descricao: row.description,
        fotos: row.images ? row.images.split(',') : []
      }));

      console.log(`✅ ${this.veiculos.length} veículos carregados do banco da empresa`);
      this.cacheValido = true;

      return this.veiculos;
    } catch (error) {
      console.error('[ERRO] Falha ao buscar veículos:', error);
      return [];
    }
  }

  // ... resto dos métodos
}
```

---

## 🔄 SESSION-MANAGER ADAPTADO

```javascript
async createSession(empresaId, options = {}) {
  try {
    // ... código existente ...

    // ✅ OBTER POOL DE CONEXÃO DA EMPRESA
    const empresaDbPool = await dbPoolManager.getPool(empresaId);

    // ✅ Criar instâncias de IA com pool específico
    const repo = new VeiculosRepository(empresaDbPool);
    const lucas = new LucasVendedor(repo);

    // Inicializar repositório
    await repo.buscarVeiculos();

    // ... resto do código ...
  }
}
```

---

## 🚀 SCRIPT DE INSTALAÇÃO PARA NOVA EMPRESA

### **Arquivo: `setup-empresa.js`**

```javascript
/**
 * Script para criar banco de dados de nova empresa
 *
 * Uso: node setup-empresa.js --empresa-id=7 --nome="Auto Show Curitiba"
 */

import mysql from 'mysql2/promise';
import fs from 'fs';

async function setupEmpresa(empresaId, nomeEmpresa) {
  const dbName = `empresa_${empresaId}_db`;

  console.log(`\n🏢 Configurando empresa: ${nomeEmpresa}`);
  console.log(`📊 Banco de dados: ${dbName}\n`);

  // Conectar ao MySQL
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: ''
  });

  // 1. Criar banco da empresa
  console.log('1️⃣ Criando banco de dados...');
  await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
  console.log(`   ✅ Banco ${dbName} criado`);

  // 2. Executar SQL de estrutura
  console.log('2️⃣ Criando tabelas...');
  const sql = fs.readFileSync('./migrations/empresa_template.sql', 'utf-8');
  await connection.execute(`USE ${dbName}`);

  const statements = sql.split(';').filter(s => s.trim());
  for (const statement of statements) {
    if (statement.trim()) {
      await connection.execute(statement);
    }
  }
  console.log('   ✅ Tabelas criadas');

  // 3. Atualizar registro no banco central
  console.log('3️⃣ Atualizando registro central...');
  await connection.execute(`USE helixai_db`);
  await connection.execute(
    `UPDATE empresas SET db_name = ?, db_host = 'localhost', db_port = 3306
     WHERE id = ?`,
    [dbName, empresaId]
  );
  console.log('   ✅ Registro atualizado');

  await connection.end();

  console.log(`\n✅ Empresa ${nomeEmpresa} configurada com sucesso!`);
  console.log(`📊 Banco: ${dbName}`);
  console.log(`🔗 Agora você pode conectar o WhatsApp no CRM\n`);
}

// Executar
const args = process.argv.slice(2);
const empresaId = args.find(a => a.startsWith('--empresa-id'))?.split('=')[1];
const nome = args.find(a => a.startsWith('--nome'))?.split('=')[1];

if (!empresaId || !nome) {
  console.error('❌ Uso: node setup-empresa.js --empresa-id=7 --nome="Nome da Empresa"');
  process.exit(1);
}

setupEmpresa(parseInt(empresaId), nome);
```

---

## 📋 WORKFLOW: Adicionar Nova Empresa

```bash
# 1. Cadastrar empresa no banco central
mysql -u root helixai_db -e "
INSERT INTO empresas (nome, endereco, telefone, bot_ativo)
VALUES ('Auto Show Curitiba', 'Av. Brasil, 1000', '41999999999', 1);
"

# 2. Pegar o ID gerado
mysql -u root helixai_db -e "SELECT id, nome FROM empresas ORDER BY id DESC LIMIT 1;"

# 3. Criar banco e estrutura
node setup-empresa.js --empresa-id=7 --nome="Auto Show Curitiba"

# 4. Importar veículos iniciais (opcional)
mysql -u root empresa_7_db < inicial_veiculos.sql

# 5. Pronto! Conectar WhatsApp no CRM
```

---

## ✅ VANTAGENS DESSA ARQUITETURA

✅ **Isolamento Total** - Dados de cada empresa 100% separados
✅ **Escalabilidade** - Bancos podem ficar em servidores diferentes
✅ **Backup Independente** - Cada empresa tem seu backup
✅ **Estrutura Customizada** - Empresa pode ter tabelas extras
✅ **Performance** - Índices otimizados por empresa
✅ **Segurança** - Senhas diferentes por banco

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ Criar migration para adicionar campos de DB na tabela empresas
2. ✅ Implementar `database-pool-manager.js`
3. ✅ Adaptar `VeiculosRepository` para receber pool
4. ✅ Atualizar `session-manager.js`
5. ✅ Criar template SQL `empresa_template.sql`
6. ✅ Criar script `setup-empresa.js`
7. ✅ Testar com empresa_5_db e empresa_6_db

---

**Sistema pronto para escalar infinitamente!** 🚀

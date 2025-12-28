# 🚀 VendeAI Database - Guia de Instalação

Guia completo para configurar o banco de dados PostgreSQL com Prisma ORM.

## 📋 Pré-requisitos

- **Node.js** 18.x ou superior
- **PostgreSQL** 14.x ou superior
- **npm** ou **yarn**
- **Git** (opcional)

## 🛠️ Instalação Passo a Passo

### 1. Instalar PostgreSQL

#### Windows
```bash
# Baixar e instalar PostgreSQL do site oficial
https://www.postgresql.org/download/windows/

# Ou usar Chocolatey
choco install postgresql

# Ou usar Docker
docker run --name vendeai-postgres -e POSTGRES_PASSWORD=senha123 -p 5432:5432 -d postgres:14
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### macOS
```bash
# Usando Homebrew
brew install postgresql@14
brew services start postgresql@14

# Ou usar Docker
docker run --name vendeai-postgres -e POSTGRES_PASSWORD=senha123 -p 5432:5432 -d postgres:14
```

### 2. Criar banco de dados

```bash
# Conectar ao PostgreSQL
psql -U postgres

# Criar banco de dados
CREATE DATABASE vendeai_db;

# Criar usuário (opcional)
CREATE USER vendeai_user WITH PASSWORD 'senha_segura';
GRANT ALL PRIVILEGES ON DATABASE vendeai_db TO vendeai_user;

# Sair do psql
\q
```

### 3. Clonar e configurar projeto

```bash
# Navegar para o diretório do projeto
cd D:\Helix\HelixAI\database_prisma

# Instalar dependências
npm install

# Ou com yarn
yarn install
```

### 4. Configurar variáveis de ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar .env com suas configurações
```

**Exemplo de `.env`:**

```env
# PostgreSQL local
DATABASE_URL="postgresql://postgres:senha123@localhost:5432/vendeai_db?schema=public"

# PostgreSQL remoto (exemplo)
# DATABASE_URL="postgresql://user:password@host.com:5432/vendeai_db?schema=public"

# Encryption key (gerar com: openssl rand -base64 32)
ENCRYPTION_KEY="sua-chave-de-criptografia-de-32-chars"

# Ambiente
NODE_ENV="development"
```

### 5. Executar migrations

```bash
# Criar o banco e aplicar todas as migrations
npm run prisma:migrate

# Isto irá:
# 1. Criar todas as tabelas
# 2. Criar todos os índices
# 3. Configurar relacionamentos
```

### 6. Popular com dados de exemplo (opcional)

```bash
# Executar seed
npm run prisma:seed

# Isto irá criar:
# - 2 empresas de exemplo
# - 3 usuários (admin e vendedores)
# - 5 veículos
# - 2 conversas
# - Configurações completas do bot
# - Base de conhecimento
# - Métricas de exemplo
```

### 7. Verificar instalação

```bash
# Abrir Prisma Studio
npm run prisma:studio

# Acesse: http://localhost:5555
# Você verá todas as tabelas com os dados seed
```

---

## ✅ Verificação de Saúde

### Testar conexão com o banco

Criar arquivo `test-connection.js`:

```javascript
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Conexão com banco de dados OK!');

    const empresas = await prisma.empresa.findMany();
    console.log(`📊 Total de empresas: ${empresas.length}`);

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Erro ao conectar:', error);
    process.exit(1);
  }
}

testConnection();
```

Executar:

```bash
node test-connection.js
```

---

## 🔧 Configurações Avançadas

### Connection Pooling

Para ambientes de produção, configure o pool de conexões no `.env`:

```env
DATABASE_URL="postgresql://user:password@host:5432/db?schema=public&connection_limit=10&pool_timeout=20"
```

Parâmetros:
- `connection_limit`: Número máximo de conexões (padrão: 10)
- `pool_timeout`: Timeout em segundos para adquirir conexão (padrão: 10)

### Shadow Database (Recomendado para Produção)

```env
DATABASE_URL="postgresql://user:password@host:5432/vendeai_db?schema=public"
SHADOW_DATABASE_URL="postgresql://user:password@host:5432/vendeai_shadow?schema=public"
```

Isto permite que o Prisma crie migrations sem afetar o banco principal.

### SSL/TLS para conexões remotas

```env
DATABASE_URL="postgresql://user:password@host:5432/db?schema=public&sslmode=require"
```

Modos SSL disponíveis:
- `disable`: Sem SSL
- `prefer`: SSL se disponível
- `require`: Exige SSL
- `verify-ca`: Verifica certificado CA
- `verify-full`: Verificação completa

---

## 🐳 Usando Docker

### Docker Compose

Criar `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    container_name: vendeai-postgres
    environment:
      POSTGRES_USER: vendeai_user
      POSTGRES_PASSWORD: senha_segura
      POSTGRES_DB: vendeai_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U vendeai_user -d vendeai_db"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Opcional: PgAdmin para gerenciamento visual
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: vendeai-pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@vendeai.com
      PGADMIN_DEFAULT_PASSWORD: admin123
    ports:
      - "5050:80"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

Executar:

```bash
# Iniciar containers
docker-compose up -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f postgres

# Parar containers
docker-compose down

# Parar e remover dados
docker-compose down -v
```

Atualizar `.env`:

```env
DATABASE_URL="postgresql://vendeai_user:senha_segura@localhost:5432/vendeai_db?schema=public"
```

---

## 📦 Scripts Disponíveis

```json
{
  "prisma:generate": "Gera Prisma Client",
  "prisma:migrate": "Cria e aplica migrations em desenvolvimento",
  "prisma:deploy": "Aplica migrations em produção",
  "prisma:studio": "Abre Prisma Studio (GUI)",
  "prisma:seed": "Popula banco com dados de exemplo",
  "prisma:reset": "Reseta banco (CUIDADO!)",
  "db:push": "Sincroniza schema sem criar migration",
  "db:pull": "Gera schema a partir do banco existente"
}
```

### Quando usar cada comando:

**Desenvolvimento:**
```bash
npm run prisma:migrate     # Criar migration após alterar schema
npm run prisma:generate    # Regenerar cliente após migration
npm run prisma:studio      # Visualizar dados
npm run prisma:seed        # Popular com dados de teste
```

**Produção:**
```bash
npm run prisma:deploy      # Aplicar migrations pendentes
npm run prisma:generate    # Regenerar cliente
```

---

## 🚨 Troubleshooting

### Erro: "Can't reach database server"

**Possíveis causas:**
1. PostgreSQL não está rodando
2. Credenciais incorretas
3. Porta incorreta
4. Firewall bloqueando

**Soluções:**

```bash
# Verificar se PostgreSQL está rodando
# Windows
sc query postgresql-x64-14

# Linux
sudo systemctl status postgresql

# Docker
docker ps | grep postgres

# Testar conexão manualmente
psql -h localhost -U postgres -d vendeai_db
```

### Erro: "P1001: Can't connect to database"

Verificar `DATABASE_URL` no `.env`:

```bash
# Formato correto
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA"

# Exemplos
DATABASE_URL="postgresql://postgres:senha@localhost:5432/vendeai_db?schema=public"
DATABASE_URL="postgresql://user:pass@192.168.1.100:5432/db?schema=public"
```

### Erro: "Migration already applied"

```bash
# Ver status das migrations
npx prisma migrate status

# Resolver conflitos
npx prisma migrate resolve --applied "migration_name"

# Ou resetar completamente (CUIDADO!)
npm run prisma:reset
```

### Erro: "Table already exists"

```bash
# Resetar banco de desenvolvimento
npm run prisma:reset

# Ou drop manual
psql -U postgres -d vendeai_db
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
\q

# Re-aplicar migrations
npm run prisma:migrate
```

### Performance lenta em queries

```javascript
// 1. Ativar logging de queries
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
});

// 2. Analisar query específica
const result = await prisma.vehicle.findMany({
  where: { empresa_id: 1 }
});

// 3. Verificar índices no PostgreSQL
psql -U postgres -d vendeai_db
\d vehicles  -- Ver índices da tabela

// 4. Adicionar índice se necessário (ver schema.prisma)
```

---

## 📊 Monitoramento

### Conexões ativas

```sql
-- Ver conexões ativas
SELECT
  pid,
  usename,
  application_name,
  client_addr,
  state,
  query
FROM pg_stat_activity
WHERE datname = 'vendeai_db';

-- Matar conexão específica (se necessário)
SELECT pg_terminate_backend(pid) WHERE pid = 12345;
```

### Tamanho do banco

```sql
-- Tamanho total do banco
SELECT pg_size_pretty(pg_database_size('vendeai_db'));

-- Tamanho por tabela
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Backup e Restore

```bash
# Backup
pg_dump -U postgres -d vendeai_db -F c -f vendeai_backup.dump

# Ou apenas SQL
pg_dump -U postgres -d vendeai_db > vendeai_backup.sql

# Restore
pg_restore -U postgres -d vendeai_db vendeai_backup.dump

# Ou SQL
psql -U postgres -d vendeai_db < vendeai_backup.sql

# Backup automático (cron job)
0 2 * * * pg_dump -U postgres -d vendeai_db -F c -f /backups/vendeai_$(date +\%Y\%m\%d).dump
```

---

## 🌐 Deploy em Produção

### Preparação

1. **Configurar variáveis de ambiente**

```env
NODE_ENV="production"
DATABASE_URL="postgresql://user:password@prod-host:5432/vendeai_prod?schema=public&sslmode=require"
SHADOW_DATABASE_URL="postgresql://user:password@prod-host:5432/vendeai_shadow?schema=public"
```

2. **Executar migrations**

```bash
# Gerar cliente de produção
npm run prisma:generate

# Aplicar migrations
npm run prisma:deploy
```

3. **NÃO execute seed em produção!**

### Providers recomendados:

- **Railway**: PostgreSQL gerenciado + deploy fácil
- **Render**: PostgreSQL gratuito (tier inicial)
- **Heroku**: PostgreSQL Hobby (gratuito)
- **AWS RDS**: PostgreSQL escalável
- **Digital Ocean**: Managed PostgreSQL

### Exemplo: Deploy no Railway

```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Criar projeto
railway init

# 4. Adicionar PostgreSQL
railway add postgresql

# 5. Deploy
railway up

# 6. Aplicar migrations
railway run npm run prisma:deploy
```

---

## 📚 Próximos Passos

Após configuração bem-sucedida:

1. ✅ Ler [README.md](../README.md) para entender a estrutura
2. ✅ Ver [QUERIES.md](./QUERIES.md) para exemplos de uso
3. ✅ Explorar dados no Prisma Studio
4. ✅ Integrar com sua aplicação

---

## 🆘 Suporte

- **Documentação Prisma**: https://www.prisma.io/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Issues GitHub**: [Criar issue]

---

**VendeAI Bot System** - Guia de Instalação © 2024

# 🚀 VendeAI API

API REST completa para gerenciamento do sistema de bot vendedor VendeAI, construída com Node.js, Express, TypeScript e Prisma.

## 📋 Índice

- [Características](#características)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Executando](#executando)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Endpoints da API](#endpoints-da-api)
- [Autenticação](#autenticação)
- [Testes](#testes)
- [Docker](#docker)
- [Deploy](#deploy)
- [Contribuindo](#contribuindo)

## ✨ Características

- **TypeScript** - Type safety e melhor DX
- **Express.js** - Framework web minimalista
- **Prisma ORM** - Type-safe database access
- **JWT Authentication** - Autenticação segura
- **Multi-tenant** - Suporte a múltiplas empresas
- **Validação Zod** - Validação robusta de dados
- **Swagger/OpenAPI** - Documentação automática
- **Rate Limiting** - Proteção contra abuse
- **Logging Winston** - Logs estruturados
- **Docker** - Containerização completa
- **Redis Cache** - Cache de alta performance (opcional)
- **Soft Deletes** - Deleção segura de dados
- **Pagination** - Paginação em todas as listagens

## 🛠 Tecnologias

- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.x
- **Framework**: Express 4.x
- **ORM**: Prisma 5.x
- **Database**: PostgreSQL 15+
- **Cache**: Redis 7+ (opcional)
- **Validation**: Zod
- **Authentication**: JWT
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Supertest
- **Linting**: ESLint + Prettier

## 📦 Pré-requisitos

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL >= 15
- Redis >= 7 (opcional)

## 🚀 Instalação

### 1. Clone o repositório

```bash
cd D:\Helix\HelixAI\api_rest
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações.

### 4. Configure o banco de dados

```bash
# Crie o banco de dados
createdb vendeai_db

# Execute as migrations
npm run migrate

# (Opcional) Popule com dados de exemplo
npm run seed
```

## ⚙️ Configuração

### Variáveis de Ambiente Essenciais

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/vendeai_db"

# JWT
JWT_SECRET="your-super-secret-key"

# Application
NODE_ENV=development
PORT=3000
```

## 🏃‍♂️ Executando

### Modo Desenvolvimento

```bash
npm run dev
```

A API estará disponível em `http://localhost:3000`

### Modo Produção

```bash
# Build
npm run build

# Start
npm start
```

### Verificar Health Check

```bash
curl http://localhost:3000/health
```

## 📁 Estrutura do Projeto

```
api_rest/
├── src/
│   ├── config/           # Configurações (DB, Swagger)
│   ├── controllers/      # Controllers da API
│   ├── middlewares/      # Middlewares (auth, validation, etc)
│   ├── repositories/     # Camada de acesso a dados
│   ├── routes/           # Definição de rotas
│   ├── services/         # Lógica de negócio
│   ├── types/            # Type definitions
│   ├── utils/            # Utilitários (logger, etc)
│   ├── app.ts            # Configuração do Express
│   └── server.ts         # Entry point
├── prisma/
│   ├── schema.prisma     # Schema do banco
│   └── migrations/       # Migrations
├── tests/                # Testes
├── logs/                 # Arquivos de log
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## 🔌 Endpoints da API

### Autenticação

```
POST   /api/auth/login       # Login
POST   /api/auth/register    # Registro
GET    /api/auth/me          # Perfil atual
POST   /api/auth/refresh     # Refresh token
POST   /api/auth/logout      # Logout
```

### Configuração do Bot

```
GET    /api/bot-config       # Listar configs
GET    /api/bot-config/:id   # Obter config
POST   /api/bot-config       # Criar config
PUT    /api/bot-config/:id   # Atualizar config
DELETE /api/bot-config/:id   # Deletar config
PATCH  /api/bot-config/:id/toggle # Ativar/Desativar
```

### Conversas

```
GET    /api/conversations              # Listar conversas
GET    /api/conversations/:id          # Obter conversa
GET    /api/conversations/phone/:phone # Buscar por telefone
PATCH  /api/conversations/:id/status   # Atualizar status
GET    /api/conversations/:id/messages # Obter mensagens
GET    /api/conversations/:id/context  # Obter contexto
GET    /api/conversations/active/count # Contar ativas
```

### Veículos

```
GET    /api/vehicles                   # Listar veículos
GET    /api/vehicles/:id               # Obter veículo
POST   /api/vehicles                   # Criar veículo
PUT    /api/vehicles/:id               # Atualizar veículo
DELETE /api/vehicles/:id               # Deletar veículo
PATCH  /api/vehicles/:id/toggle        # Disponível/Indisponível
GET    /api/vehicles/search/available  # Buscar disponíveis
```

### Analytics

```
GET    /api/analytics/overview        # Overview geral
GET    /api/analytics/conversations   # Stats de conversas
GET    /api/analytics/messages        # Stats de mensagens
GET    /api/analytics/performance     # Métricas de performance
GET    /api/analytics/conversion      # Funil de conversão
GET    /api/analytics/top-vehicles    # Veículos mais procurados
```

### Usuários

```
GET    /api/users           # Listar usuários
GET    /api/users/:id       # Obter usuário
PUT    /api/users/:id       # Atualizar usuário
DELETE /api/users/:id       # Deletar usuário
PATCH  /api/users/:id/role  # Atualizar role
```

## 🔐 Autenticação

Todas as rotas (exceto `/auth/login` e `/auth/register`) requerem autenticação JWT.

### Exemplo de uso:

```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Response: { "token": "eyJhbGc..." }

# 2. Use o token em requisições
curl http://localhost:3000/api/bot-config \
  -H "Authorization: Bearer eyJhbGc..."
```

## 📖 Documentação

A documentação Swagger está disponível em:

```
http://localhost:3000/api/docs
```

## 🧪 Testes

```bash
# Todos os testes
npm test

# Watch mode
npm run test:watch

# Coverage
npm test -- --coverage

# E2E tests
npm run test:e2e
```

## 🐳 Docker

### Desenvolvimento com Docker Compose

```bash
# Subir todos os serviços
npm run docker:dev

# Parar serviços
npm run docker:down
```

### Build da imagem

```bash
docker build -t vendeai-api .
```

### Run do container

```bash
docker run -p 3000:3000 --env-file .env vendeai-api
```

## 🚀 Deploy

### Deploy com Docker

1. Configure as variáveis de ambiente de produção
2. Build a imagem: `docker build -t vendeai-api .`
3. Push para registry: `docker push your-registry/vendeai-api`
4. Deploy no seu provedor (AWS, GCP, Azure, etc)

### Deploy Manual

1. Build: `npm run build`
2. Execute migrations: `npm run migrate:deploy`
3. Start: `npm start`

### Checklist de Produção

- [ ] Configure `JWT_SECRET` forte
- [ ] Configure `DATABASE_URL` de produção
- [ ] Configure CORS adequadamente
- [ ] Habilite rate limiting
- [ ] Configure logging para arquivo
- [ ] Configure Sentry para error tracking
- [ ] Execute com `NODE_ENV=production`
- [ ] Configure SSL/HTTPS
- [ ] Configure backup do banco de dados

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Scripts Disponíveis

```bash
npm run dev              # Desenvolvimento com hot reload
npm run build            # Build para produção
npm start                # Rodar build de produção
npm test                 # Executar testes
npm run lint             # Lint do código
npm run lint:fix         # Fix de problemas de lint
npm run format           # Format código com Prettier
npm run typecheck        # Type checking
npm run migrate          # Executar migrations
npm run migrate:deploy   # Deploy migrations em produção
npm run prisma:generate  # Gerar Prisma Client
npm run prisma:studio    # Abrir Prisma Studio
npm run seed             # Popular banco com dados de exemplo
```

## 📄 Licença

MIT

## 👨‍💻 Autor

**HelixAI**

---

🌟 Se este projeto foi útil, deixe uma estrela!

# 🚀 Quick Start Guide - VendeAI API

Guia rápido para começar a desenvolver com a VendeAI API em menos de 5 minutos!

## ⚡ Setup Rápido (5 minutos)

### 1. Pré-requisitos

```bash
# Verifique as versões
node --version  # >= 18.0.0
npm --version   # >= 9.0.0
```

### 2. Instalação

```bash
# Já está no diretório do projeto
cd D:\Helix\HelixAI\api_rest

# Instale as dependências
npm install
```

### 3. Configuração do Banco de Dados

```bash
# Inicie o PostgreSQL (se usando Docker)
docker run --name vendeai-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=vendeai_db \
  -p 5432:5432 \
  -d postgres:15-alpine

# Ou use o docker-compose
docker-compose up -d postgres
```

### 4. Configure as Variáveis de Ambiente

O arquivo `.env` já foi criado com configurações padrão. Ajuste se necessário:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vendeai_db?schema=public"
JWT_SECRET="your-super-secret-key-change-in-production"
PORT=3000
```

### 5. Execute as Migrations

```bash
# Gere o Prisma Client
npm run prisma:generate

# Execute as migrations
npm run migrate

# (Opcional) Popule com dados de exemplo
npm run seed
```

### 6. Inicie o Servidor

```bash
# Modo desenvolvimento (com hot reload)
npm run dev
```

✅ **Pronto!** A API está rodando em `http://localhost:3000`

## 🧪 Teste a API

### 1. Health Check

```bash
curl http://localhost:3000/health
```

Resposta esperada:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 12.345,
  "environment": "development"
}
```

### 2. Acesse a Documentação

Abra no navegador:
```
http://localhost:3000/api/docs
```

### 3. Crie um Usuário

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@example.com",
    "password": "senha123"
  }'
```

### 4. Faça Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "password": "senha123"
  }'
```

Copie o `token` da resposta.

### 5. Use a API Autenticada

```bash
# Substitua SEU_TOKEN pelo token recebido
curl http://localhost:3000/api/bot-config \
  -H "Authorization: Bearer SEU_TOKEN"
```

## 🐳 Usando Docker (Alternativa)

Se preferir usar Docker para tudo:

```bash
# Suba todos os serviços (PostgreSQL, Redis, API)
docker-compose up -d

# Veja os logs
docker-compose logs -f api

# Pare os serviços
docker-compose down
```

## 📝 Scripts Úteis

```bash
npm run dev              # Desenvolvimento com hot reload
npm run build            # Build para produção
npm start                # Rodar build de produção
npm test                 # Executar testes
npm run lint             # Lint do código
npm run prisma:studio    # Abrir interface visual do banco
```

## 🔧 Desenvolvimento

### Estrutura de Pastas

```
src/
├── config/           # Configurações (DB, Swagger)
├── controllers/      # Controllers da API
├── middlewares/      # Middlewares (auth, validation)
├── repositories/     # Acesso a dados
├── routes/           # Rotas da API
├── services/         # Lógica de negócio
├── types/            # Type definitions
└── utils/            # Utilitários
```

### Criar uma Nova Rota

1. **Crie o controller** em `src/controllers/`
2. **Crie o service** em `src/services/`
3. **Crie o repository** em `src/repositories/`
4. **Adicione as rotas** em `src/routes/`
5. **Registre as rotas** em `src/routes/index.ts`

### Executar Testes

```bash
# Todos os testes
npm test

# Watch mode
npm run test:watch

# Com coverage
npm test -- --coverage

# Apenas E2E
npm run test:e2e
```

## 🔍 Debugging

### VS Code

Crie `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug API",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

## 🚨 Troubleshooting

### Erro de Conexão com Banco

```bash
# Verifique se o PostgreSQL está rodando
docker ps | grep postgres

# Verifique as variáveis de ambiente
cat .env | grep DATABASE_URL
```

### Erro de Prisma Client

```bash
# Regenere o Prisma Client
npm run prisma:generate

# Limpe e reinstale
rm -rf node_modules
npm install
```

### Porta em Uso

```bash
# Mude a porta no .env
PORT=3001

# Ou mate o processo na porta 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

## 📚 Próximos Passos

1. ✅ Leia o [README.md](./README.md) completo
2. ✅ Explore a [documentação Swagger](http://localhost:3000/api/docs)
3. ✅ Veja exemplos de uso em `tests/e2e/`
4. ✅ Configure seu editor com ESLint e Prettier
5. ✅ Comece a desenvolver! 🎉

## 💡 Dicas

- Use `npm run prisma:studio` para visualizar e editar dados
- Use `npm run lint:fix` para corrigir problemas de código
- Use o Swagger para testar endpoints rapidamente
- Sempre crie testes para novas funcionalidades
- Use Git branches para novas features

## 🆘 Precisa de Ajuda?

- Documentação completa: `README.md`
- API Docs: `http://localhost:3000/api/docs`
- Issues: GitHub Issues

---

**Bom desenvolvimento! 🚀**

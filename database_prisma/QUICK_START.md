# ⚡ VendeAI Database - Início Rápido

Começar a usar o banco de dados em **5 minutos**.

## 🚀 Instalação Express

### Windows

```bash
# 1. PostgreSQL via Docker (mais rápido)
docker run --name vendeai-db -e POSTGRES_PASSWORD=senha123 -p 5432:5432 -d postgres:14

# 2. Clonar/entrar no projeto
cd D:\Helix\HelixAI\database_prisma

# 3. Instalar dependências
npm install

# 4. Configurar .env
echo DATABASE_URL="postgresql://postgres:senha123@localhost:5432/vendeai_db?schema=public" > .env

# 5. Criar banco
docker exec -it vendeai-db psql -U postgres -c "CREATE DATABASE vendeai_db;"

# 6. Executar migrations
npm run prisma:migrate

# 7. Popular com dados de exemplo
npm run prisma:seed

# 8. Abrir Prisma Studio
npm run prisma:studio
```

### Linux/Mac

```bash
# 1. PostgreSQL via Docker
docker run --name vendeai-db -e POSTGRES_PASSWORD=senha123 -p 5432:5432 -d postgres:14

# 2-8: Mesmos comandos acima
cd database_prisma
npm install
echo 'DATABASE_URL="postgresql://postgres:senha123@localhost:5432/vendeai_db?schema=public"' > .env
docker exec -it vendeai-db psql -U postgres -c "CREATE DATABASE vendeai_db;"
npm run prisma:migrate
npm run prisma:seed
npm run prisma:studio
```

---

## 📝 Primeiro Uso

### 1. Gerar Prisma Client

```bash
npm run prisma:generate
```

### 2. Criar arquivo de teste: `test.js`

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Buscar empresas
  const empresas = await prisma.empresa.findMany();
  console.log('Empresas:', empresas);

  // Buscar veículos disponíveis
  const veiculos = await prisma.vehicle.findMany({
    where: {
      empresa_id: 1,
      status: 'disponivel',
      deleted_at: null
    },
    select: {
      marca: true,
      modelo: true,
      ano: true,
      preco: true
    },
    take: 5
  });
  console.log('\nVeículos disponíveis:', veiculos);

  // Buscar conversas ativas
  const conversas = await prisma.conversation.findMany({
    where: {
      empresa_id: 1,
      status: 'ativa'
    },
    include: {
      _count: {
        select: { mensagens: true }
      }
    }
  });
  console.log(`\nConversas ativas: ${conversas.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### 3. Executar

```bash
node test.js
```

---

## 🎯 Casos de Uso Comuns

### Buscar veículos com filtros

```javascript
const veiculos = await prisma.vehicle.findMany({
  where: {
    empresa_id: 1,
    status: 'disponivel',
    deleted_at: null,
    preco: {
      gte: 40000,  // Maior ou igual a 40k
      lte: 80000   // Menor ou igual a 80k
    },
    cambio: 'automatico',
    ano: {
      gte: 2020  // Ano 2020 ou mais novo
    }
  },
  orderBy: {
    preco: 'asc'
  },
  take: 10  // Primeiros 10 resultados
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
        conteudo: 'Olá, procuro um carro',
        enviada_em: new Date()
      }
    },
    contexto: {
      create: {} // Cria contexto vazio
    }
  },
  include: {
    mensagens: true,
    contexto: true
  }
});

console.log('Nova conversa:', conversa);
```

### Adicionar mensagem

```javascript
const mensagem = await prisma.message.create({
  data: {
    conversa_id: conversa.id,
    remetente_tipo: 'bot',
    tipo_mensagem: 'texto',
    conteudo: 'Olá João! Como posso ajudar?',
    intencao: 'saudacao',
    enviada_em: new Date()
  }
});

// Atualizar contador de mensagens
await prisma.conversation.update({
  where: { id: conversa.id },
  data: {
    total_mensagens: { increment: 1 },
    ultima_mensagem: new Date()
  }
});
```

### Buscar conversas do vendedor

```javascript
const conversasVendedor = await prisma.conversation.findMany({
  where: {
    empresa_id: 1,
    vendedor_id: 5,
    status: 'ativa'
  },
  include: {
    contexto: true,
    _count: {
      select: {
        mensagens: true,
        agendamentos: true
      }
    }
  },
  orderBy: {
    ultima_mensagem: 'desc'
  }
});

console.log(`Conversas do vendedor: ${conversasVendedor.length}`);
```

### Criar agendamento

```javascript
const agendamento = await prisma.appointment.create({
  data: {
    empresa_id: 1,
    conversa_id: conversa.id,
    cliente_nome: 'João Silva',
    cliente_telefone: '5567999887766',
    tipo: 'test_drive',
    data_hora: new Date('2024-02-15T10:00:00'),
    duracao_minutos: 30,
    vendedor_id: 5,
    status: 'agendado',
    observacoes: 'Cliente interessado no Onix Turbo'
  },
  include: {
    conversa: true,
    vendedor: {
      select: { nome: true, email: true }
    }
  }
});

console.log('Agendamento criado:', agendamento);
```

---

## 🔍 Queries Avançadas

### Buscar com múltiplos filtros OR/AND

```javascript
const veiculos = await prisma.vehicle.findMany({
  where: {
    empresa_id: 1,
    status: 'disponivel',
    deleted_at: null,
    OR: [
      { marca: 'Volkswagen' },
      { marca: 'Chevrolet' }
    ],
    AND: [
      { ano: { gte: 2020 } },
      { preco: { lte: 70000 } }
    ]
  }
});
```

### Agregação (count, sum, avg)

```javascript
// Total de vendas do mês
const resultado = await prisma.analyticsMetric.aggregate({
  where: {
    empresa_id: 1,
    data: {
      gte: new Date('2024-01-01'),
      lte: new Date('2024-01-31')
    }
  },
  _sum: {
    veiculos_vendidos: true,
    valor_total_vendas: true
  },
  _avg: {
    tempo_resposta_medio_ms: true
  },
  _count: {
    id: true
  }
});

console.log('Vendas do mês:', resultado._sum.veiculos_vendidos);
console.log('Receita total:', resultado._sum.valor_total_vendas);
console.log('Tempo médio de resposta:', resultado._avg.tempo_resposta_medio_ms, 'ms');
```

### Group by

```javascript
const vendas = await prisma.conversation.groupBy({
  by: ['status'],
  where: {
    empresa_id: 1,
    primeira_mensagem: {
      gte: new Date('2024-01-01')
    }
  },
  _count: {
    id: true
  }
});

vendas.forEach(v => {
  console.log(`${v.status}: ${v._count.id} conversas`);
});
```

---

## 📊 Monitoramento

### Ver conexões ativas

```javascript
// Query raw SQL
const conexoes = await prisma.$queryRaw`
  SELECT count(*) as total
  FROM pg_stat_activity
  WHERE datname = 'vendeai_db'
`;

console.log('Conexões ativas:', conexoes[0].total);
```

### Verificar tamanho do banco

```javascript
const tamanho = await prisma.$queryRaw`
  SELECT pg_size_pretty(pg_database_size('vendeai_db')) as tamanho
`;

console.log('Tamanho do banco:', tamanho[0].tamanho);
```

---

## 🛠️ Ferramentas

### Prisma Studio (GUI visual)

```bash
npm run prisma:studio
```

Acesse: http://localhost:5555

Você poderá:
- ✅ Visualizar todos os dados
- ✅ Criar novos registros
- ✅ Editar registros existentes
- ✅ Deletar registros
- ✅ Filtrar e buscar

### Ver SQL das queries

```javascript
const prisma = new PrismaClient({
  log: ['query'] // Mostra SQL de todas as queries
});

// Agora todas as queries aparecerão no console
const veiculos = await prisma.vehicle.findMany(...);
// Console: SELECT "id", "marca", "modelo" FROM "vehicles" WHERE ...
```

---

## 🐛 Resolução Rápida de Problemas

### Erro: "Can't reach database"

```bash
# Verificar se Docker está rodando
docker ps

# Verificar se PostgreSQL está acessível
docker exec -it vendeai-db psql -U postgres -c "SELECT 1"

# Se não estiver rodando, iniciar
docker start vendeai-db
```

### Erro: "Table does not exist"

```bash
# Verificar status das migrations
npx prisma migrate status

# Re-aplicar migrations
npm run prisma:migrate
```

### Resetar banco completamente

```bash
# CUIDADO: Apaga TODOS os dados!
npm run prisma:reset

# Confirme com 'y'
# Isso irá:
# 1. Dropar todas as tabelas
# 2. Re-criar schema
# 3. Executar migrations
# 4. Executar seed (dados de exemplo)
```

---

## 📚 Próximos Passos

1. ✅ Ler [README.md](README.md) completo
2. ✅ Explorar [QUERIES.md](docs/QUERIES.md) para exemplos avançados
3. ✅ Ver [DIAGRAMA.md](docs/DIAGRAMA.md) para entender relacionamentos
4. ✅ Consultar [SETUP.md](docs/SETUP.md) para deploy em produção

---

## 🆘 Ajuda

- **Documentação Prisma**: https://www.prisma.io/docs
- **Prisma Examples**: https://github.com/prisma/prisma-examples
- **PostgreSQL Tutorial**: https://www.postgresqltutorial.com/

---

## ✅ Checklist de Validação

Após seguir este guia, você deve ter:

- [ ] PostgreSQL rodando (Docker ou local)
- [ ] Banco `vendeai_db` criado
- [ ] Migrations aplicadas (todas as tabelas criadas)
- [ ] Seed executado (dados de exemplo carregados)
- [ ] Prisma Studio funcionando (http://localhost:5555)
- [ ] Teste básico executando sem erros

---

**VendeAI Bot System** - Início Rápido © 2024

**Tempo estimado:** 5-10 minutos ⏱️

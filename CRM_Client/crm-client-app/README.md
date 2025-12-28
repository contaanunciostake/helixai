# 🚀 CRM VendeAI - Frontend

Sistema de CRM moderno e profissional para gerenciamento completo de bot vendedor de veículos e imóveis.

## ✨ Features Principais

- 🤖 Configuração completa do bot (mensagens, personalidade, comportamento)
- 💬 Gerenciamento de conversas em tempo real
- 📊 Dashboard com métricas e gráficos interativos
- 🚗 Gestão de estoque (veículos/imóveis)
- 📅 Agendamentos e calendário
- 📈 Relatórios e analytics
- 👥 Gestão de equipe e permissões
- 🔗 Integrações com CRMs (Pipedrive, HubSpot, RD Station)
- 🌙 Dark mode nativo
- 📱 Responsivo (mobile-first)
- ♿ Acessível (WCAG 2.1 AA)

## 🛠️ Stack Tecnológico

### Core
- **React 19** - UI Library
- **Vite** - Build tool e dev server
- **TypeScript** - Tipagem estática (preparado para migração)

### UI/UX
- **Tailwind CSS 4** - Utility-first CSS
- **shadcn/ui** - Componentes acessíveis
- **Framer Motion** - Animações suaves
- **Lucide React** - Ícones modernos

### State Management & Data Fetching
- **React Query (@tanstack/react-query)** - Server state
- **React Hook Form** - Formulários performáticos
- **Zod** - Validação de schemas

### Visualização de Dados
- **Recharts** - Gráficos e charts
- **date-fns** - Manipulação de datas

### Comunicação
- **Axios** - HTTP client
- **Socket.io Client** - WebSocket/real-time

### DX (Developer Experience)
- **ESLint** - Linting
- **Prettier** - Code formatting (recomendado adicionar)

## 📦 Instalação

```bash
# Clone o repositório (se ainda não clonou)
git clone <repo-url>

# Entre no diretório
cd CRM_Client/crm-client-app

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

O app estará disponível em `http://localhost:5177`

## 🏗️ Estrutura do Projeto

```
src/
├── assets/                  # Imagens, fontes
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── common/              # Componentes reutilizáveis
│   ├── features/            # Componentes de features específicas
│   └── layout/              # Layouts (Header, Sidebar, etc)
├── features/                # Módulos por feature
│   ├── messages/            # ✅ Mensagens automatizadas
│   ├── personality/         # ✅ Personalidade do bot
│   ├── behavior/            # ⏳ Comportamento
│   ├── schedule/            # ⏳ Horários
│   ├── business/            # ⏳ Negócio
│   ├── knowledge-base/      # ⏳ Base de conhecimento
│   ├── integrations/        # ⏳ Integrações
│   ├── team/                # ⏳ Equipe
│   └── ...
├── hooks/                   # Custom React hooks
│   ├── useTheme.jsx         # Theme management
│   ├── useMediaQuery.jsx    # Media queries
│   ├── useLocalStorage.jsx  # LocalStorage sync
│   └── useDebounce.jsx      # Debounce utility
├── lib/                     # Utilities e helpers
│   ├── utils.js             # Funções utilitárias
│   └── react-query.jsx      # React Query config
├── services/                # API services
│   └── api.js               # API client e endpoints
├── stores/                  # State management (global)
├── config/                  # Configurações
│   └── design-tokens.js     # Design system tokens
├── styles/                  # Estilos globais
│   └── globals.css          # CSS global com variáveis
├── App.jsx                  # Componente raiz
└── main.jsx                 # Entry point
```

## 🎨 Design System

### Design Tokens
Tokens completos definidos em `src/config/design-tokens.js`:
- Cores (primary, secondary, semantic)
- Tipografia
- Espaçamentos
- Bordas e sombras
- Animações
- Breakpoints

### Temas
- 🌙 **Dark Mode** (padrão)
- ☀️ **Light Mode**

Trocar tema:
```javascript
import { useTheme } from '@/hooks/useTheme'

function Component() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button onClick={toggleTheme}>
      Tema atual: {theme}
    </button>
  )
}
```

## 📡 API Integration

### Configuração
Arquivo: `src/services/api.js`

Endpoints configurados para:
- Autenticação
- Dashboard e métricas
- Mensagens do bot
- Configuração do bot
- Conversas
- Produtos/Veículos
- Negócios e financiamento
- Base de conhecimento
- Integrações
- Relatórios
- Equipe

### Uso com React Query

```javascript
import { useQuery } from '@tanstack/react-query'
import { apiService } from '@/services/api'
import { queryKeys } from '@/lib/react-query'

function MessagesPage({ user }) {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.messages.all(user.empresa_id),
    queryFn: () => apiService.messages.getAll(user.empresa_id),
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return <div>{/* Render messages */}</div>
}
```

### Mutations

```javascript
import { useMutation, useQueryClient } from '@tanstack/react-query'

function Component() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data) => apiService.messages.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.messages.all())
    },
  })

  return (
    <button onClick={() => mutation.mutate({ content: 'Hello' })}>
      Create Message
    </button>
  )
}
```

## 🧩 Páginas Implementadas

### ✅ Mensagens Automatizadas (`/messages`)
- Editor de mensagens com preview ao vivo
- Variáveis dinâmicas
- Simulação de chat
- CRUD completo

### ✅ Personalidade do Bot (`/personality`)
- 6 sliders de personalidade
- Preview ao vivo em 3 cenários
- Presets rápidos
- Análise da configuração

### ⏳ Outras páginas em desenvolvimento
Ver `IMPLEMENTACAO_FRONTEND.md` para detalhes completos

## 🚀 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview da build
npm run preview

# Linting
npm run lint

# Testes (quando configurado)
npm test

# Storybook (quando configurado)
npm run storybook
```

## 🔧 Configuração do Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=http://localhost:5000
VITE_BOT_API_URL=http://localhost:3010
VITE_WS_URL=ws://localhost:3010/ws
```

## 📚 Documentação Adicional

- **Implementação Completa**: Ver `IMPLEMENTACAO_FRONTEND.md`
- **Design System**: Ver `src/config/design-tokens.js`
- **API Services**: Ver `src/services/api.js`
- **Hooks Utilitários**: Ver pasta `src/hooks/`

## 🤝 Contribuindo

1. Clone o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Convenções de Código

- **Componentes**: PascalCase (`MessagesPage.jsx`)
- **Hooks**: camelCase com prefixo `use` (`useTheme.jsx`)
- **Utilities**: camelCase (`formatPrice.js`)
- **Constantes**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **CSS Classes**: Tailwind utilities (prefira utilities sobre classes customizadas)

## 🐛 Troubleshooting

### Erro ao instalar dependências
```bash
npm install --legacy-peer-deps
```

### Porta já em uso
Edite `vite.config.js`:
```javascript
server: {
  port: 5178, // Outra porta
}
```

### Build falha
```bash
# Limpar cache e node_modules
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📞 Suporte

- **Email**: suporte@vendeai.com
- **Documentação**: `IMPLEMENTACAO_FRONTEND.md`
- **Issues**: [GitHub Issues](link)

## 📄 Licença

Este projeto é propriedade da VendeAI / HelixAI.

---

**Desenvolvido com ❤️ pela equipe VendeAI**

Versão 1.0.0 - Janeiro 2025

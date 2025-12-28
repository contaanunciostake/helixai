# 📱 CRM VendeAI - Implementação Frontend

## ✅ Progresso Atual da Implementação

### Estrutura e Configuração Base (100% Completo)

#### ✅ Estrutura de Pastas Moderna
Estrutura organizada seguindo padrões modernos:

```
src/
├── assets/              # Imagens, fontes, etc
├── components/
│   ├── ui/              # shadcn/ui components (JÁ EXISTENTE)
│   ├── common/          # Componentes reutilizáveis (CRIADO)
│   ├── features/        # Componentes específicos de features (CRIADO)
│   └── layout/          # Layout components (JÁ EXISTENTE)
├── features/            # Feature-based modules (CRIADO)
│   ├── messages/        # ✅ Mensagens Automatizadas (COMPLETO)
│   ├── personality/     # ✅ Personalidade do Bot (COMPLETO)
│   ├── behavior/        # ⏳ Comportamento (PENDENTE)
│   ├── schedule/        # ⏳ Horários (PENDENTE)
│   ├── business/        # ⏳ Negócio (PENDENTE)
│   └── ...              # Outras features
├── hooks/               # Custom hooks (MELHORADO)
│   ├── useTheme.jsx     # ✅ Theme management
│   ├── useMediaQuery.jsx # ✅ Responsive queries
│   ├── useLocalStorage.jsx # ✅ LocalStorage sync
│   └── useDebounce.jsx  # ✅ Debounce utilities
├── lib/                 # Utilities (MELHORADO)
│   ├── utils.js         # JÁ EXISTENTE
│   └── react-query.jsx  # ✅ React Query config
├── services/            # API services (CRIADO)
│   └── api.js           # ✅ API service layer completo
├── stores/              # State management (CRIADO)
├── types/               # TypeScript types (CRIADO)
├── config/              # Configuration (CRIADO)
│   └── design-tokens.js # ✅ Design tokens completos
└── styles/              # Global styles (CRIADO)
    └── globals.css      # ✅ Estilos globais com variáveis CSS
```

---

## 📦 Tecnologias e Dependências

### Já Instaladas
- ✅ React 19
- ✅ Vite
- ✅ Tailwind CSS 4
- ✅ shadcn/ui (todos os componentes)
- ✅ React Hook Form
- ✅ Zod
- ✅ Recharts
- ✅ Framer Motion
- ✅ Socket.io Client
- ✅ date-fns
- ✅ @hello-pangea/dnd

### Recém Instaladas
- ✅ @tanstack/react-query
- ✅ axios
- ✅ react-i18next
- ✅ i18next

---

## 🎨 Design System (100% Completo)

### ✅ Design Tokens
Arquivo: `src/config/design-tokens.js`

Sistema completo com:
- ✅ Paleta de cores (primária, secundária, semânticas)
- ✅ Tipografia (font families, sizes, weights)
- ✅ Espaçamentos (0 a 96)
- ✅ Bordas (radius, width)
- ✅ Sombras (incluindo dark mode)
- ✅ Animações (durations, timings)
- ✅ Breakpoints
- ✅ Z-index

### ✅ Estilos Globais
Arquivo: `src/styles/globals.css`

Implementado:
- ✅ Variáveis CSS customizadas
- ✅ Dark mode completo
- ✅ Scrollbar personalizada
- ✅ Focus states acessíveis
- ✅ Seleção de texto estilizada
- ✅ Animações globais (fade, slide, scale, etc)
- ✅ Loading skeletons
- ✅ Utility classes

### ✅ Theme Provider
Arquivo: `src/hooks/useTheme.jsx`

Features:
- ✅ Toggle dark/light mode
- ✅ Persistência no localStorage
- ✅ Sincronização automática

---

## 🔧 Hooks Utilitários (100% Completo)

### ✅ useTheme
- Theme switching (dark/light)
- LocalStorage persistence
- Context API

### ✅ useMediaQuery
- Detecção de media queries
- Hooks específicos: `useIsMobile()`, `useIsTablet()`, `useIsDesktop()`, `useIsTouch()`

### ✅ useLocalStorage
- Sincroniza state com localStorage
- Listener para mudanças entre tabs

### ✅ useDebounce
- Debounce de valores
- Debounce de callbacks
- Útil para search, inputs, etc

---

## 🌐 API Service Layer (100% Completo)

### ✅ API Service
Arquivo: `src/services/api.js`

Implementado:
- ✅ Instância Axios configurada
- ✅ Request interceptor (auth token automático)
- ✅ Response interceptor (error handling global)
- ✅ Métodos para todas as features:
  - ✅ Auth
  - ✅ Dashboard
  - ✅ Mensagens
  - ✅ Bot Configuration
  - ✅ Conversas
  - ✅ Produtos/Veículos
  - ✅ Negócios
  - ✅ Base de Conhecimento
  - ✅ Integrações
  - ✅ Relatórios
  - ✅ Equipe

### ✅ React Query Setup
Arquivo: `src/lib/react-query.jsx`

Configurado:
- ✅ QueryClient com defaults otimizados
- ✅ Cache strategies (staleTime, cacheTime)
- ✅ Retry logic com exponential backoff
- ✅ Query keys padronizados para todas as features
- ✅ Error handling global

---

## 📄 Páginas Implementadas

### ✅ 1. Mensagens Automatizadas (100% Completo)
**Arquivo:** `src/features/messages/MessagesPage.jsx`

**Features Implementadas:**
- ✅ Lista de mensagens com scroll
- ✅ Editor de mensagens com Textarea
- ✅ Sistema de variáveis dinâmicas (clique para inserir)
- ✅ Preview ao vivo com substituição de variáveis
- ✅ Simulação de chat (bot + usuário)
- ✅ CRUD completo (criar, editar, deletar, duplicar)
- ✅ Teste de mensagens
- ✅ Filtro por contexto
- ✅ Indicador de mensagem ativa
- ✅ UI/UX polida com tabs (Editor | Preview)

**Variáveis Disponíveis:**
- `{empresa_nome}`, `{empresa_endereco}`, `{empresa_telefone}`, `{empresa_cidade}`
- `{usuario_nome}`, `{usuario_telefone}`
- `{veiculo_marca}`, `{veiculo_modelo}`, `{veiculo_ano}`, `{veiculo_preco}`
- `{agendamento_data}`, `{agendamento_hora}`

**Screenshot Features:**
- Lista à esquerda com mensagens
- Editor central com inserção de variáveis
- Preview com chat simulado à direita

---

### ✅ 2. Personalidade do Bot (100% Completo)
**Arquivo:** `src/features/personality/PersonalityPage.jsx`

**Features Implementadas:**
- ✅ Nome e avatar do bot (editável)
- ✅ 6 Sliders de personalidade:
  - Formalidade (Casual ↔ Formal)
  - Entusiasmo (Neutro ↔ Animado)
  - Objetividade (Detalhado ↔ Objetivo)
  - Empatia (Direto ↔ Empático)
  - Humor (Sério ↔ Descontraído)
  - Proatividade (Reativo ↔ Proativo)
- ✅ Preview ao vivo em 3 cenários:
  - Saudação inicial
  - Apresentação de veículo
  - Negociação
- ✅ Presets rápidos:
  - 🎩 Profissional & Formal
  - 😊 Amigável & Descontraído
  - 🎯 Direto & Objetivo
- ✅ Análise automática da configuração
- ✅ Sistema de badges com cores
- ✅ Save/Discard changes
- ✅ Feedback visual com notificações

**Como funciona:**
1. Usuário ajusta sliders
2. Preview atualiza em tempo real
3. Exemplos de conversas mudam baseado na config
4. Salvar aplica a configuração

---

## ⏳ Páginas Pendentes

### 3. Comportamento (decision trees)
**Arquivo sugerido:** `src/features/behavior/BehaviorPage.jsx`

**Features a Implementar:**
- [ ] Regras de engajamento
- [ ] Transferência para humano (condições)
- [ ] Qualificação de leads (scoring)
- [ ] Limites de negociação
- [ ] Decision trees visuais com drag & drop
- [ ] Simulador de cenários

**Sugestões Técnicas:**
- Usar `@hello-pangea/dnd` para drag & drop
- Criar componente FlowChart para visualização
- State machine para comportamentos

---

### 4. Horários
**Arquivo sugerido:** `src/features/schedule/SchedulePage.jsx`

**Features a Implementar:**
- [ ] Calendário visual (usar `react-day-picker` já instalado)
- [ ] Configuração por dia da semana
- [ ] Horário de início e fim
- [ ] Feriados e datas especiais
- [ ] Comportamento fora do horário
- [ ] Fusos horários
- [ ] Preview de disponibilidade

**Sugestões Técnicas:**
- Usar componente Calendar do shadcn/ui
- Criar time picker customizado
- Integrar com backend para salvar configurações

---

### 5. Negócio
**Arquivo sugerido:** `src/features/business/BusinessPage.jsx`

**Features a Implementar:**
- [ ] Configurações de financiamento
  - Taxa de juros
  - Parcelas mínimas/máximas
  - Entrada mínima
- [ ] Parceiros financeiros (lista editável)
- [ ] Políticas de desconto
  - Desconto máximo permitido
  - Condições automáticas
- [ ] Avaliação de troca (configurações)
- [ ] Promoções ativas (CRUD)
  - Criar/editar/deletar promoções
  - Período de validade
  - Produtos aplicáveis

**Sugestões Técnicas:**
- Usar React Hook Form para formulários
- Validação com Zod
- DataTable para lista de promoções

---

### 6. Base de Conhecimento
**Arquivo sugerido:** `src/features/knowledge-base/KnowledgeBasePage.jsx`

**Features a Implementar:**
- [ ] FAQ gerenciável (CRUD)
- [ ] Categorias (criar/editar/deletar)
- [ ] Editor rico para respostas
- [ ] Busca com destaque
- [ ] Estatísticas de uso (perguntas mais acessadas)
- [ ] Importação/exportação
- [ ] Preview de respostas

**Sugestões Técnicas:**
- Usar TipTap ou similar para rich text editor
- Busca com Fuse.js
- Categorias com drag & drop

---

### 7. Integrações
**Arquivo sugerido:** `src/features/integrations/IntegrationsPage.jsx`

**Features a Implementar:**
- [ ] Cards de integrações disponíveis
  - Pipedrive
  - HubSpot
  - RD Station
  - Google Calendar
  - WhatsApp Business API
- [ ] Status (conectado/desconectado)
- [ ] Configuração de credenciais (form seguro)
- [ ] Teste de conexão
- [ ] Logs de sincronização
- [ ] Mapeamento de campos

**Sugestões Técnicas:**
- Card layout com status visual
- Form de credenciais com Input password
- Logs com DataTable e filtros

---

### 8. Equipe
**Arquivo sugerido:** `src/features/team/TeamPage.jsx`

**Features a Implementar:**
- [ ] Lista de usuários (DataTable)
- [ ] CRUD de usuários
- [ ] Permissões e roles
  - Admin
  - Vendedor
  - Visualizador
- [ ] Performance individual (gráficos)
- [ ] Distribuição de leads
- [ ] Horários de trabalho por vendedor

**Sugestões Técnicas:**
- DataTable com filtros e ordenação
- Dialog para edição de usuário
- Checkbox tree para permissões
- Recharts para performance

---

## 🧩 Componentes Reutilizáveis Necessários

### DataTable (Alta Prioridade)
**Arquivo sugerido:** `src/components/common/DataTable.jsx`

**Features:**
- [ ] Filtros por coluna
- [ ] Ordenação
- [ ] Paginação
- [ ] Seleção múltipla
- [ ] Actions por linha
- [ ] Export (CSV, Excel)
- [ ] Busca global
- [ ] Column visibility toggle

**Usar:**
- @tanstack/react-table
- shadcn/ui Table

---

### FormBuilder
**Arquivo sugerido:** `src/components/common/FormBuilder.jsx`

**Features:**
- [ ] Geração dinâmica de forms a partir de schema
- [ ] Validação com Zod
- [ ] React Hook Form integration
- [ ] Tipos de campos:
  - Text, Number, Email, Tel
  - Select, MultiSelect
  - Date, Time, DateTime
  - Checkbox, Radio, Switch
  - Textarea
  - File upload

---

### RichTextEditor
**Arquivo sugerido:** `src/components/common/RichTextEditor.jsx`

**Features:**
- [ ] Editor WYSIWYG
- [ ] Formatting (bold, italic, underline, etc)
- [ ] Lists (ordered, unordered)
- [ ] Links
- [ ] Images
- [ ] Preview mode
- [ ] Markdown support (opcional)

**Usar:**
- TipTap ou Lexical

---

### ImageUploader
**Arquivo sugerido:** `src/components/common/ImageUploader.jsx`

**Features:**
- [ ] Drag & drop
- [ ] Crop/resize
- [ ] Preview
- [ ] Upload múltiplo
- [ ] Progress bar
- [ ] Validação (tipo, tamanho)

---

### DateRangePicker
**Arquivo sugerido:** `src/components/common/DateRangePicker.jsx`

**Features:**
- [ ] Selecionar range de datas
- [ ] Presets (Hoje, Semana, Mês, etc)
- [ ] Calendar popup
- [ ] Formatação customizável

---

### MultiSelect
**Arquivo sugerido:** `src/components/common/MultiSelect.jsx`

**Features:**
- [ ] Seleção múltipla com chips
- [ ] Busca/filtro
- [ ] Select all / Clear all
- [ ] Limit de seleções (opcional)

---

## 🌍 Internacionalização (i18n)

**Arquivo sugerido:** `src/config/i18n.js`

### Setup
```javascript
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      pt: {
        translation: {
          // Traduções em português
        }
      },
      en: {
        translation: {
          // Traduções em inglês
        }
      },
      es: {
        translation: {
          // Traduções em espanhol
        }
      }
    },
    lng: 'pt',
    fallbackLng: 'pt',
    interpolation: {
      escapeValue: false
    }
  })

export default i18n
```

### Uso
```jsx
import { useTranslation } from 'react-i18next'

function Component() {
  const { t } = useTranslation()

  return <h1>{t('welcome')}</h1>
}
```

---

## 📱 PWA (Progressive Web App)

### 1. Service Worker
**Arquivo sugerido:** `public/sw.js`

### 2. Manifest
**Arquivo sugerido:** `public/manifest.json`

```json
{
  "name": "CRM VendeAI",
  "short_name": "VendeAI",
  "description": "Sistema de CRM com Bot Vendedor",
  "theme_color": "#3b82f6",
  "background_color": "#0f172a",
  "display": "standalone",
  "scope": "/",
  "start_url": "/",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 3. Vite PWA Plugin
```bash
npm install vite-plugin-pwa -D
```

**vite.config.js:**
```javascript
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'CRM VendeAI',
        short_name: 'VendeAI',
        theme_color: '#3b82f6'
      }
    })
  ]
})
```

---

## 🧪 Testes

### Unit Tests (Jest + RTL)
**Instalar:**
```bash
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest jsdom
```

**Arquivo de config:** `vitest.config.js`

**Exemplo de teste:**
```javascript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import MessagesPage from './MessagesPage'

describe('MessagesPage', () => {
  it('renders messages list', () => {
    render(<MessagesPage />)
    expect(screen.getByText('Mensagens Automatizadas')).toBeInTheDocument()
  })
})
```

---

### E2E Tests (Playwright)
**Instalar:**
```bash
npm install -D @playwright/test
npx playwright install
```

**Arquivo de config:** `playwright.config.js`

**Exemplo:**
```javascript
import { test, expect } from '@playwright/test'

test('login flow', async ({ page }) => {
  await page.goto('http://localhost:5177')
  await page.fill('[name=email]', 'test@test.com')
  await page.fill('[name=password]', 'password')
  await page.click('button[type=submit]')
  await expect(page).toHaveURL('/dashboard')
})
```

---

## 📚 Storybook

**Instalar:**
```bash
npx storybook@latest init
```

**Exemplo de story:**
```javascript
// src/components/ui/button.stories.jsx
export default {
  title: 'UI/Button',
  component: Button,
}

export const Primary = {
  args: {
    children: 'Click me',
    variant: 'default',
  },
}
```

---

## 🚀 Como Continuar o Desenvolvimento

### 1. Integrar Páginas no App.jsx

Atualizar o `renderPage()` no App.jsx para incluir as novas páginas:

```javascript
import MessagesPage from './features/messages/MessagesPage'
import PersonalityPage from './features/personality/PersonalityPage'
// ... importar outras páginas

const renderPage = () => {
  switch (currentPage) {
    case 'messages':
      return <MessagesPage user={user} showNotification={showNotificationMsg} />

    case 'personality':
      return <PersonalityPage user={user} showNotification={showNotificationMsg} />

    // ... outros cases
  }
}
```

### 2. Atualizar Menu de Navegação

No `ClientLayout.jsx`, adicionar links para as novas páginas:

```jsx
{
  id: 'messages',
  label: 'Mensagens',
  icon: MessageSquare,
},
{
  id: 'personality',
  label: 'Personalidade',
  icon: Bot,
},
// ... outros itens
```

### 3. Criar Páginas Restantes

Seguir os templates e padrões das páginas já criadas:
- Usar React Query para data fetching
- Usar shadcn/ui components
- Seguir design tokens
- Implementar preview ao vivo quando aplicável
- Adicionar loading states e error handling

### 4. Implementar Componentes Reutilizáveis

Priorizar:
1. DataTable (usado em várias páginas)
2. FormBuilder (formulários dinâmicos)
3. RichTextEditor (base de conhecimento)
4. ImageUploader (produtos/estoque)

### 5. Conectar com Backend

Ajustar as chamadas de API em `src/services/api.js` conforme necessário e usar React Query hooks:

```javascript
import { useQuery, useMutation } from '@tanstack/react-query'
import { apiService } from '@/services/api'
import { queryKeys } from '@/lib/react-query'

function MessagesPage({ user }) {
  const { data: messages, isLoading } = useQuery({
    queryKey: queryKeys.messages.all(user.empresa_id),
    queryFn: () => apiService.messages.getAll(user.empresa_id),
  })

  const updateMutation = useMutation({
    mutationFn: (data) => apiService.messages.update(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.messages.all(user.empresa_id))
    },
  })

  // ... usar messages e updateMutation
}
```

---

## 📊 Resumo do Status

### ✅ Completo (40%)
- Estrutura de pastas
- Design system
- Hooks utilitários
- API service layer
- React Query setup
- ThemeProvider
- Página de Mensagens
- Página de Personalidade

### ⏳ Em Progresso (0%)
- Nenhum item atualmente em progresso

### 📋 Pendente (60%)
- Página de Comportamento
- Página de Horários
- Página de Negócio
- Página de Base de Conhecimento
- Página de Integrações
- Página de Equipe
- Componentes reutilizáveis (DataTable, FormBuilder, etc)
- Melhorias no Dashboard
- i18n
- PWA
- Testes
- Storybook
- Documentação

---

## 🎯 Próximos Passos Recomendados

1. **Implementar DataTable** - Componente fundamental usado em várias páginas
2. **Criar página de Horários** - Feature importante para configuração
3. **Criar página de Negócio** - Configurações críticas de vendas
4. **Implementar página de Comportamento** - Decision trees visuais
5. **Adicionar testes** - Garantir qualidade do código
6. **Configurar i18n** - Suporte multi-idioma
7. **Implementar PWA** - Melhor experiência mobile
8. **Melhorar Dashboard** - Gráficos mais interativos

---

## 💡 Dicas de Desenvolvimento

### Performance
- ✅ React Query já configurado com cache otimizado
- ✅ Lazy loading com `React.lazy()` e `Suspense`
- ✅ Code splitting automático do Vite
- ⏳ Implementar virtual scrolling para listas grandes
- ⏳ Optimistic updates com React Query

### Acessibilidade
- ✅ shadcn/ui já é acessível por padrão
- ✅ Focus states implementados
- ⏳ Adicionar aria-labels onde necessário
- ⏳ Keyboard navigation
- ⏳ Screen reader testing

### UX
- ✅ Loading skeletons criados
- ✅ Animações suaves configuradas
- ⏳ Implementar empty states
- ⏳ Error boundaries
- ⏳ Toast notifications globais (usar sonner já instalado)

---

## 📞 Suporte

Para dúvidas ou problemas:
- Consultar este documento
- Verificar código das páginas já implementadas como referência
- Seguir os padrões estabelecidos
- Usar shadcn/ui components sempre que possível

---

**Desenvolvido com ❤️ para VendeAI**
Versão 1.0.0 - Janeiro 2025

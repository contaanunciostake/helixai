# Painel CRM de Afiliados - AIRA

## Visão Geral

Painel completo para gerenciamento de afiliados com dashboard interativo, visualização de comissões, solicitação de saques e gerenciamento de perfil.

## Características Principais

### 1. Dashboard Interativo
- Visualização de métricas em tempo real
- Link de referência com cópia fácil
- Estatísticas de clicks, cadastros e vendas
- Taxa de conversão automática
- Últimas referências e comissões

### 2. Gestão de Comissões
- Listagem completa de comissões
- Filtros por status (pendente, aprovada, paga)
- Filtros por tipo (primeira venda, recorrente, bônus)
- Visualização detalhada de valores
- Cards com totais por status
- Paginação

### 3. Sistema de Saques
- Solicitação de saques via PIX ou transferência
- Validação de valor mínimo
- Histórico completo de saques
- Status em tempo real
- Informações de taxas e valores líquidos

### 4. Perfil do Afiliado
- Edição de dados pessoais
- Gerenciamento de dados bancários
- Configuração de chave PIX
- Visualização de estatísticas pessoais
- Status de aprovação

## Estrutura de Arquivos

```
Afiliados_Panel/
├── src/
│   ├── components/
│   │   ├── AfiliadoDashboard.jsx      # Dashboard principal
│   │   ├── AfiliadoComissoes.jsx      # Gestão de comissões
│   │   ├── AfiliadoSaques.jsx         # Solicitação e histórico de saques
│   │   ├── AfiliadoPerfil.jsx         # Perfil e dados do afiliado
│   │   └── AfiliadoLayout.jsx         # Layout com sidebar
│   ├── pages/
│   │   ├── Login.jsx                  # Página de login
│   │   └── Registro.jsx               # Formulário de cadastro
│   ├── App.jsx                        # Componente principal
│   └── main.jsx                       # Entry point
├── package.json
└── vite.config.js
```

## Como Iniciar

### 1. Instalar Dependências

```bash
cd Afiliados_Panel
npm install
```

### 2. Iniciar em Desenvolvimento

```bash
npm run dev
```

O painel estará disponível em: **http://localhost:5178**

### 3. Build para Produção

```bash
npm run build
```

## Rotas Disponíveis

- `/` - Dashboard do afiliado (requer autenticação)
- `/login` - Página de login
- `/registro` - Cadastro de novo afiliado

## Integração com Backend

O painel se conecta ao backend através das seguintes APIs:

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Afiliados
- `GET /api/afiliados/meu-perfil` - Dados do afiliado
- `PUT /api/afiliados/atualizar-perfil` - Atualizar perfil
- `GET /api/afiliados/dashboard` - Métricas e estatísticas
- `GET /api/afiliados/meu-link` - Link de referência

### Comissões
- `GET /api/afiliados/comissoes` - Listar comissões
  - Filtros: `status`, `tipo`, `page`, `per_page`

### Saques
- `GET /api/afiliados/saques` - Listar saques
- `POST /api/afiliados/solicitar-saque` - Solicitar novo saque

### Referências
- `GET /api/afiliados/referencias` - Listar referências
  - Filtros: `status`, `page`, `per_page`

## Fluxo de Uso

### 1. Cadastro de Afiliado

1. Usuário acessa `/registro`
2. Preenche dados pessoais (Step 1)
3. Preenche dados bancários e PIX (Step 2)
4. Sistema cria afiliado com status "pendente"
5. Aguarda aprovação do admin

### 2. Login e Acesso

1. Usuário faz login em `/login`
2. Sistema verifica se é afiliado cadastrado
3. Redireciona para dashboard principal

### 3. Uso do Dashboard

1. Visualiza métricas e estatísticas
2. Copia link de referência
3. Compartilha link para gerar indicações
4. Acompanha conversões em tempo real

### 4. Gestão de Comissões

1. Acessa seção "Comissões"
2. Visualiza comissões pendentes, aprovadas e pagas
3. Filtra por tipo e status
4. Acompanha valores e datas

### 5. Solicitação de Saque

1. Acessa seção "Saques"
2. Verifica saldo disponível
3. Clica em "Solicitar Saque"
4. Informa valor e método de pagamento
5. Aguarda aprovação e processamento

### 6. Atualização de Perfil

1. Acessa "Meu Perfil"
2. Clica em "Editar Perfil"
3. Atualiza dados pessoais ou bancários
4. Salva alterações

## Design e UX

### Tema
- **Dark Mode** com gradientes verde/esmeralda
- **Glass morphism** nos cards
- **Animações suaves** nas transições
- **Grid pattern** no background
- **Efeitos de estrelas** (twinkle)

### Layout Responsivo
- Desktop: Sidebar lateral completa
- Tablet/Mobile: Sidebar colapsável
- Cards adaptáveis por grid

### Componentes Visuais
- **Cards com gradiente** para destaque
- **Badges coloridos** por status
- **Tabelas responsivas** com hover
- **Botões com shadow/glow** effect
- **Loading states** animados

## Status e Badges

### Status de Afiliado
- `ativo` - Verde (pode receber comissões)
- `pendente` - Amarelo (aguardando aprovação)
- `inativo` - Vermelho (sem atividade)
- `bloqueado` - Vermelho (bloqueado pelo admin)

### Status de Comissão
- `pendente` - Amarelo (aguardando aprovação)
- `aprovada` - Verde (aprovada, aguardando pagamento)
- `paga` - Azul (já paga)
- `cancelada` - Vermelho (cancelada)

### Status de Saque
- `pendente` - Amarelo (aguardando processamento)
- `aprovado` - Verde (aprovado, será pago)
- `pago` - Azul (já pago)
- `rejeitado` - Vermelho (rejeitado)

### Tipos de Comissão
- `primeira_venda` - Roxo (comissão da primeira compra)
- `recorrente` - Ciano (comissão mensal)
- `bonus` - Laranja (bônus por meta)

## Configurações

### Valores Padrão
- **Porta**: 5178
- **API Base URL**: http://localhost:5000
- **Comissão Primeira Venda**: 30%
- **Comissão Recorrente**: 20%
- **Valor Mínimo Saque**: R$ 50,00

### Variáveis de Ambiente (Opcional)

Criar arquivo `.env` na raiz:

```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=AIRA Afiliados
```

## Funcionalidades Avançadas

### 1. Cópia de Link
- Botão com feedback visual
- Copia para clipboard automaticamente
- Mensagem de confirmação temporária

### 2. Paginação
- Suporte a múltiplas páginas
- Navegação anterior/próxima
- Indicador de página atual

### 3. Filtros Dinâmicos
- Filtragem em tempo real
- Múltiplos critérios combinados
- Reset automático de página ao filtrar

### 4. Validações
- Valor mínimo de saque
- Saldo disponível
- Dados bancários obrigatórios para saque PIX
- CPF/CNPJ formatado

### 5. Feedback ao Usuário
- Mensagens de erro claras
- Confirmações de sucesso
- Loading states
- Estados vazios informativos

## Próximas Melhorias

- [ ] Gráficos de desempenho (Chart.js)
- [ ] Exportação de relatórios PDF
- [ ] Notificações push
- [ ] Chat de suporte integrado
- [ ] Sistema de metas com progresso
- [ ] Ranking de afiliados
- [ ] Materiais de marketing para download
- [ ] Deep links personalizados
- [ ] QR Code do link de afiliado
- [ ] Integração com redes sociais

## Troubleshooting

### Erro ao conectar com API
- Verifique se o backend está rodando na porta 5000
- Verifique as configurações de CORS no backend
- Confirme que as rotas de API estão registradas

### Sidebar não aparece
- Verifique se o usuário está autenticado
- Confirme que o perfil de afiliado existe
- Verifique o console para erros

### Link de referência não copia
- Navegador pode bloquear clipboard API
- Necessário HTTPS ou localhost
- Verificar permissões do navegador

### Saque não é solicitado
- Verifique saldo disponível
- Confirme valor mínimo
- Valide dados bancários cadastrados

## Suporte

Para dúvidas ou problemas:
1. Verifique este README
2. Consulte logs do console (F12)
3. Verifique logs do backend
4. Entre em contato com a equipe de desenvolvimento

---

**Desenvolvido para AIRA - Sistema Multi-tenant de Automação com IA**

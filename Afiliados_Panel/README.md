# 🎯 AIRA - Painel do Afiliado

Painel exclusivo para afiliados AIRA acompanharem ganhos, comissões e gerenciarem saques.

## 🚀 Como Iniciar

### 1. Instalar Dependências

```bash
cd D:\Helix\HelixAI\Afiliados_Panel
npm install
```

### 2. Iniciar Servidor de Desenvolvimento

```bash
npm run dev
```

O painel será iniciado em: **http://localhost:5178**

## 📁 Estrutura

```
Afiliados_Panel/
├── src/
│   ├── components/
│   │   ├── AfiliadoDashboard.jsx   # Dashboard principal
│   │   ├── AfiliadoComissoes.jsx   # Página de comissões
│   │   ├── AfiliadoSaques.jsx      # Página de saques
│   │   ├── AfiliadoPerfil.jsx      # Perfil do afiliado
│   │   └── AfiliadoLayout.jsx      # Layout base
│   ├── pages/
│   │   ├── Login.jsx               # Tela de login
│   │   └── Registro.jsx            # Cadastro de afiliado
│   ├── App.jsx                     # Aplicação principal
│   └── main.jsx                    # Entry point
├── index.html
└── package.json
```

## 🔗 Integrações

- **API Backend:** `http://localhost:5000/api/afiliados/*`
- **Landing de Afiliados:** `http://localhost:5173/afiliados`
- **CRM Cliente:** `http://localhost:5177`

## 🎨 Funcionalidades

✅ Dashboard com métricas em tempo real
✅ Link de referência personalizado
✅ Histórico de comissões
✅ Solicitação de saques
✅ Gerenciamento de perfil
✅ Design verde neon consistente

## 📊 Páginas

### Dashboard
- Cards de métricas (Clicks, Cadastros, Vendas, Saldo)
- Últimas referências
- Últimas comissões
- Taxa de conversão

### Comissões
- Lista completa de comissões
- Filtros por status e tipo
- Detalhes de cada comissão

### Saques
- Histórico de saques
- Solicitar novo saque
- Status de cada solicitação

### Perfil
- Atualizar dados bancários
- Chave PIX
- Informações pessoais

## 🔐 Autenticação

O painel usa cookies de sessão do backend Flask.

Login: `/login`
Registro: `/registro`

## 🎯 Fluxo do Usuário

1. Visitante acessa `/afiliados` na landing page
2. Preenche formulário de interesse
3. É redirecionado para `/registro` no painel
4. Completa cadastro com dados bancários
5. Aguarda aprovação
6. Faz login em `/login`
7. Acessa dashboard em `/`

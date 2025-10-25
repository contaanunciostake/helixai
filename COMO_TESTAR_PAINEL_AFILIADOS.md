# Como Testar o Painel de Afiliados

## 📋 Pré-requisitos

1. **Backend** rodando na porta 5000
2. **MySQL** com banco de dados `vendeai_db`
3. **Node.js** instalado

## 🗄️ Passo 1: Criar Dados de Teste no Banco

### Opção A: Via MySQL Workbench (Recomendado)

1. Abra o MySQL Workbench
2. Conecte ao banco `vendeai_db`
3. Abra o arquivo `criar_afiliado_teste.sql`
4. Execute o script completo (Ctrl+Shift+Enter)

### Opção B: Via Linha de Comando

```bash
mysql -u root -p vendeai_db < criar_afiliado_teste.sql
```

### O que o script cria:

- ✅ **Configurações** do sistema de afiliados
- ✅ **Usuário** afiliado com login
- ✅ **Afiliado** ativo com dados completos
- ✅ **10 Referências** (5 clicks, 3 cadastros, 2 vendas)
- ✅ **4 Comissões** (1 pendente, 1 aprovada, 2 pagas)
- ✅ **2 Saques** (1 pago, 1 pendente)

## 🚀 Passo 2: Iniciar o Painel

```bash
cd Afiliados_Panel
npm install  # (se ainda não instalou)
npm run dev
```

O painel estará disponível em: **http://localhost:5178**

## 🔑 Passo 3: Fazer Login

Use as credenciais de teste:

```
Email: afiliado@teste.com
Senha: 123456
```

## 🎯 Passo 4: Testar Funcionalidades

### 1. Dashboard
- ✅ Visualize as métricas do afiliado
- ✅ Veja o link de referência: `http://localhost:5000/r/teste2025`
- ✅ Copie o link (botão "Copiar")
- ✅ Veja últimas referências e comissões

### 2. Comissões
- ✅ Navegue para seção "Comissões"
- ✅ Veja 4 comissões criadas
- ✅ Filtre por status (pendente, aprovada, paga)
- ✅ Filtre por tipo (primeira venda, recorrente, bônus)
- ✅ Veja cards com totais

### 3. Saques
- ✅ Navegue para seção "Saques"
- ✅ Veja histórico de saques
- ✅ Clique em "Solicitar Saque"
- ✅ Tente solicitar valor menor que R$ 50 (deve dar erro)
- ✅ Tente solicitar valor maior que saldo (deve dar erro)
- ✅ Solicite saque de R$ 50 (deve funcionar)

### 4. Perfil
- ✅ Navegue para "Meu Perfil"
- ✅ Veja dados do afiliado
- ✅ Clique em "Editar Perfil"
- ✅ Altere dados pessoais
- ✅ Altere dados bancários
- ✅ Salve as alterações

## 📊 Dados de Teste Criados

### Métricas
- **Clicks**: 10
- **Cadastros**: 5
- **Vendas**: 2
- **Comissões Geradas**: R$ 317,60
- **Comissões Pagas**: R$ 139,40
- **Saldo Disponível**: R$ 149,10

### Comissões
1. **Pendente**: R$ 29,10 (Primeira venda - Plano Básico)
2. **Aprovada**: R$ 149,10 (Primeira venda - Enterprise)
3. **Paga**: R$ 39,40 (Recorrente - Profissional)
4. **Paga**: R$ 100,00 (Bônus por meta)

### Saques
1. **Pago**: R$ 139,40 (PIX - 15 dias atrás)
2. **Pendente**: R$ 50,00 (PIX - 2 dias atrás)

### Configurações
- **Comissão Primeira Venda**: 30%
- **Comissão Recorrente**: 20%
- **Valor Mínimo Saque**: R$ 50,00
- **Prazo Cookie**: 30 dias
- **Prazo Aprovação**: 7 dias

## 🔗 Testar Link de Referência

1. Copie o link: `http://localhost:5000/r/teste2025`
2. Abra em nova aba (com backend rodando)
3. O sistema deve registrar o click
4. As métricas devem atualizar

## 🧪 Testar Integrações Backend

### Verificar APIs Funcionando

```bash
# Testar perfil do afiliado
curl http://localhost:5000/api/afiliados/meu-perfil

# Testar dashboard
curl http://localhost:5000/api/afiliados/dashboard

# Testar comissões
curl http://localhost:5000/api/afiliados/comissoes

# Testar saques
curl http://localhost:5000/api/afiliados/saques

# Testar link de referência
curl http://localhost:5000/api/afiliados/meu-link
```

## ⚠️ Troubleshooting

### Erro: "Afiliado não encontrado"
- Verifique se o script SQL foi executado
- Confirme que o email está correto
- Verifique se o backend está conectado ao MySQL correto

### Erro ao conectar API
- Verifique se o backend está rodando (porta 5000)
- Verifique CORS no backend
- Verifique se as rotas `/api/afiliados/*` estão registradas

### Painel não carrega dados
- Abra DevTools (F12) e veja erros no console
- Verifique aba Network para ver requisições
- Confirme que está logado corretamente

### Erro de senha
- A senha foi gerada com hash Werkzeug
- Use exatamente: `123456` (sem espaços)
- Se não funcionar, reexecute o script SQL

## 🎨 Features do Painel

### Design
- ✅ Dark mode com gradientes verde/esmeralda
- ✅ Glass morphism nos cards
- ✅ Animações suaves
- ✅ Grid pattern background
- ✅ Efeito de estrelas (twinkle)
- ✅ Sidebar responsiva e colapsável

### Funcionalidades
- ✅ Dashboard com métricas em tempo real
- ✅ Link de referência com cópia fácil
- ✅ Listagem de comissões com filtros
- ✅ Sistema de saques com validações
- ✅ Perfil editável
- ✅ Paginação automática
- ✅ Loading states
- ✅ Feedback visual

### Validações
- ✅ Valor mínimo de saque (R$ 50)
- ✅ Saldo disponível
- ✅ Dados bancários obrigatórios
- ✅ Autenticação via cookies
- ✅ Redirecionamento automático

## 📈 Próximos Passos

Após testar o painel, você pode:

1. **Criar mais afiliados** com diferentes status
2. **Simular vendas** criando mais referências
3. **Testar aprovação** de comissões (admin)
4. **Testar pagamento** de saques (admin)
5. **Integrar com sistema** de assinaturas real
6. **Adicionar gráficos** de desempenho
7. **Criar painel admin** para gerenciar afiliados

## 🎯 Verificação Final

Checklist de funcionalidades testadas:

- [ ] Login com credenciais de teste
- [ ] Dashboard carrega métricas corretas
- [ ] Link de referência pode ser copiado
- [ ] Seção de comissões mostra 4 comissões
- [ ] Filtros de comissões funcionam
- [ ] Seção de saques mostra histórico
- [ ] Solicitar saque valida valor mínimo
- [ ] Solicitar saque valida saldo disponível
- [ ] Perfil mostra dados corretos
- [ ] Edição de perfil salva alterações
- [ ] Logout funciona corretamente

---

**Desenvolvido para AIRA - Sistema Multi-tenant de Automação com IA**

Para suporte: Verifique logs do console (F12) e logs do backend Flask

# 🚀 ACESSO RÁPIDO - PAINEL ADMIN VENDEAI

## ✅ SERVIDOR ESTÁ RODANDO!

O servidor Flask está ativo e pronto para uso em:
- **Local:** http://localhost:5000
- **Rede:** http://192.168.0.15:5000

---

## 🔐 CREDENCIAIS DE ACESSO

### Super Admin Existente:
- **Email:** `admin@vendeai.com`
- **Nome:** Administrador VendeAI
- **Senha:** *(sua senha configurada)*

---

## 📱 URLS DE ACESSO DIRETO

### 1. Login
**URL:** http://localhost:5000/login

### 2. Painel Admin (após login)
**URL:** http://localhost:5000/admin

### 3. Páginas Admin Específicas:

| Página | URL |
|--------|-----|
| 📊 Dashboard | http://localhost:5000/admin |
| 📱 WhatsApp Config | http://localhost:5000/admin/whatsapp-config |
| 🏢 Empresas | http://localhost:5000/admin/empresas |
| 👥 Usuários | http://localhost:5000/admin/usuarios |
| 📋 Leads | http://localhost:5000/admin/leads |
| 💬 Conversas | http://localhost:5000/admin/conversas |
| 📤 Disparador | http://localhost:5000/admin/disparador |

---

## 🎯 COMO USAR

### Passo 1: Fazer Login
1. Acesse: http://localhost:5000/login
2. Digite: `admin@vendeai.com`
3. Digite sua senha
4. Clique em "Entrar"

### Passo 2: Acessar Painel Admin
1. Após o login, você será redirecionado
2. Ou acesse diretamente: http://localhost:5000/admin

### Passo 3: Configurar WhatsApp
1. No menu lateral, clique em "WhatsApp"
2. Ou acesse: http://localhost:5000/admin/whatsapp-config
3. Clique em "Gerar QR Code" para a empresa desejada
4. Escaneie com o WhatsApp
5. Pronto! WhatsApp conectado

---

## 🛠️ FUNCIONALIDADES DISPONÍVEIS

### ✅ Dashboard
- Visão geral do sistema
- Estatísticas de empresas
- WhatsApp conectados
- Bots ativos

### ✅ WhatsApp Config
- Gerar QR Code para qualquer empresa
- Conectar/desconectar WhatsApp
- Simular conexão (dev)
- Ver status em tempo real

### ✅ Gestão de Empresas
- Listar todas as empresas
- Ver status WhatsApp e Bot
- Quantidade de usuários
- Acesso rápido às configs

### ✅ Gestão de Usuários
- Todos os usuários do sistema
- Filtrar por tipo
- Ver último login
- Status ativo/inativo

### ✅ Gestão de Leads
- Todos os leads cadastrados
- Filtrar por temperatura
- Ver status de conversão
- Últimos 100 leads

### ✅ Gestão de Conversas
- Todas as conversas
- Ativas e encerradas
- Quantidade de mensagens
- Ver detalhes

### ✅ Disparador de Mensagens
- Enviar mensagem de teste
- Disparo em massa
- Filtros avançados
- Histórico de disparos

---

## 📝 COMANDOS ÚTEIS

### Parar o Servidor
Pressione `Ctrl+C` no terminal

### Reiniciar o Servidor
```bash
python backend/app.py
```

### Criar Novo Super Admin
```bash
python criar_admin.py
```

### Testar Acesso
```bash
python test_admin_access.py
```

---

## 🎨 RECURSOS DO PAINEL

- ✅ Dark Theme profissional
- ✅ Interface responsiva
- ✅ Animações suaves
- ✅ QR Code em tempo real
- ✅ Estatísticas ao vivo
- ✅ Controle total do sistema

---

## 🔧 SOLUÇÃO DE PROBLEMAS

### Não consigo fazer login
- Verifique se está usando: `admin@vendeai.com`
- Verifique a senha
- Execute: `python criar_admin.py` para criar novo admin

### Erro 403 no Admin
- Você precisa ser Super Admin
- Verifique seu tipo de usuário
- Execute: `python test_admin_access.py`

### WhatsApp não conecta
- Verifique se o serviço Baileys está rodando
- Use "Simular Conexão" para testar
- Verifique os logs do servidor

### Servidor não inicia
- Verifique se a porta 5000 está livre
- Execute: `python backend/app.py`
- Verifique os logs de erro

---

## 📞 SUPORTE

Para mais informações, consulte:
- `PAINEL_ADMIN.md` - Documentação completa
- `CREDENCIAIS_ADMIN.md` - Gerenciar credenciais
- Logs do sistema: `/admin/logs`

---

**VendeAI** - Sistema de Vendas com IA 🚀

*Última atualização: 10/10/2025*

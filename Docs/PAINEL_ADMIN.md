# 🛡️ Painel Admin - VendeAI

## 📋 Visão Geral

O Painel Admin é o centro de controle total do sistema VendeAI. Através dele, o Super Admin pode:

- ✅ Gerenciar todas as empresas e suas conexões WhatsApp
- ✅ Visualizar e gerenciar todos os usuários do sistema
- ✅ Monitorar leads e conversas de todas as empresas
- ✅ Configurar WhatsApp com QR Code para cada empresa
- ✅ Usar o disparador de mensagens em massa
- ✅ Ter controle total sobre o sistema

## 🚀 Como Acessar

### 1. Criar Super Admin

Primeiro, você precisa criar um usuário Super Admin:

```bash
python criar_admin.py
```

O script irá solicitar:
- Nome completo
- Email
- Senha (mínimo 6 caracteres)

### 2. Iniciar o Servidor

```bash
python backend/app.py
```

O servidor estará disponível em: `http://localhost:5000`

### 3. Fazer Login

1. Acesse: `http://localhost:5000/login`
2. Entre com as credenciais do Super Admin criadas
3. Você será redirecionado para o dashboard

### 4. Acessar Painel Admin

Após o login, acesse: `http://localhost:5000/admin`

## 🎯 Funcionalidades do Painel Admin

### 📊 Dashboard
- Visão geral de todas as empresas
- Estatísticas de WhatsApp conectados
- Bots ativos
- Ações rápidas

**Rota:** `/admin` ou `/admin/dashboard`

### 📱 Configuração WhatsApp
- Ver todas as empresas e seus status de conexão
- Gerar QR Code para conectar WhatsApp de qualquer empresa
- Desconectar WhatsApp de empresas
- Simular conexão (modo desenvolvimento)

**Rota:** `/admin/whatsapp-config`

**Como usar:**
1. Clique em "Gerar QR Code" na empresa desejada
2. Escaneie o QR Code com o WhatsApp da empresa
3. Aguarde a confirmação de conexão
4. O WhatsApp ficará conectado e disponível para o bot

### 🏢 Gestão de Empresas
- Lista todas as empresas cadastradas
- Mostra status de WhatsApp e Bot
- Quantidade de usuários por empresa
- Acesso rápido à configuração WhatsApp

**Rota:** `/admin/empresas`

### 👥 Gestão de Usuários
- Lista todos os usuários do sistema
- Mostra tipo de usuário (Super Admin, Admin, Usuário)
- Status (Ativo/Inativo)
- Empresa vinculada
- Último login

**Rota:** `/admin/usuarios`

### 📋 Gestão de Leads
- Visualiza todos os leads do sistema
- Filtra por temperatura (Quente, Morno, Frio)
- Mostra status (Novo, Contatado, Qualificado, Convertido)
- Exibe últimos 100 leads

**Rota:** `/admin/leads`

### 💬 Gestão de Conversas
- Visualiza todas as conversas do sistema
- Mostra conversas ativas e encerradas
- Quantidade de mensagens
- Última mensagem

**Rota:** `/admin/conversas`

### 📤 Disparador de Mensagens
- Enviar mensagens de teste
- Disparos em massa para leads
- Filtros por temperatura e status
- Histórico de disparos
- Estatísticas de envio

**Rota:** `/admin/disparador`

## 🔐 Permissões

### Super Admin
- ✅ Acesso total ao painel admin
- ✅ Gerenciar todas as empresas
- ✅ Configurar WhatsApp de qualquer empresa
- ✅ Ver e gerenciar todos os usuários
- ✅ Acessar todos os leads e conversas
- ✅ Usar disparador de mensagens

### Admin (Empresa)
- ❌ Sem acesso ao painel admin
- ✅ Gerenciar apenas sua empresa
- ✅ Ver leads e conversas de sua empresa

### Usuário
- ❌ Sem acesso ao painel admin
- ✅ Acesso limitado aos recursos de sua empresa

## 🛠️ API Admin

### Gerar QR Code
```http
POST /admin/api/whatsapp/gerar-qr/<empresa_id>
```

### Desconectar WhatsApp
```http
POST /admin/api/whatsapp/desconectar/<empresa_id>
```

### Simular Conexão (Dev)
```http
POST /admin/api/whatsapp/simular-conexao/<empresa_id>
```

### Enviar Mensagem Teste
```http
POST /admin/api/disparo-teste
Content-Type: application/json

{
  "telefone": "5511999999999",
  "mensagem": "Teste de mensagem"
}
```

### Disparo em Massa
```http
POST /admin/api/disparo-massa
Content-Type: application/json

{
  "mensagem": "Olá {nome}, tudo bem?",
  "filtro_temperatura": "QUENTE",
  "filtro_status": "NOVO"
}
```

## 📝 Estrutura de Arquivos

```
backend/
├── routes/
│   └── admin.py              # Rotas do admin
├── templates/
│   └── admin/
│       ├── base_admin.html   # Template base
│       ├── dashboard.html    # Dashboard principal
│       ├── whatsapp_config.html  # Config WhatsApp
│       ├── empresas.html     # Gestão empresas
│       ├── usuarios.html     # Gestão usuários
│       ├── leads.html        # Gestão leads
│       ├── conversas.html    # Gestão conversas
│       └── disparador.html   # Disparador
```

## 🎨 Design

O painel admin utiliza:
- **Dark Theme** moderno e profissional
- **Bootstrap 5.3** para componentes
- **Bootstrap Icons** para ícones
- **Gradientes** e animações suaves
- **Responsivo** para mobile e desktop

## 🔧 Configuração

### Variáveis de Ambiente (.env)

```env
# Flask
SECRET_KEY=seu-secret-key-aqui

# Banco de Dados
DATABASE_URL=sqlite:///vendeai.db

# WhatsApp Service (Baileys)
WHATSAPP_SERVICE_URL=http://localhost:3001

# Banco Remoto (opcional)
USE_REMOTE_DB=False
DB_API_URL=https://sua-api.com
DB_API_TOKEN=seu-token-aqui
```

## 🐛 Solução de Problemas

### Erro 403 (Forbidden) no Admin
- Verifique se o usuário é Super Admin
- Use o script `criar_admin.py` para criar um Super Admin

### WhatsApp não conecta
- Verifique se o serviço Baileys está rodando na porta 3001
- Use "Simular Conexão" para testar sem o serviço

### QR Code não aparece
- Verifique os logs do console do navegador
- Teste a rota API diretamente: `/admin/api/whatsapp/gerar-qr/1`

### Disparador não envia mensagens
- Verifique se WhatsApp está conectado
- Confirme que os leads têm telefone cadastrado
- Verifique logs do servidor Flask

## 📞 Suporte

Para mais informações ou suporte:
- Documentação completa: `/admin/documentacao`
- Logs do sistema: `/admin/logs`

---

**VendeAI** - Sistema de Vendas com IA 🚀

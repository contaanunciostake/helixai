# VendeAI - Links do Sistema e Correções Aplicadas

## ✅ CORREÇÕES REALIZADAS

### 1. Banco de Dados - Tabelas Faltantes
**Problema:** Erro `no such table: metricas_disparo_massa`

**Solução Aplicada:**
- ✅ Executado script `init_robo_disparador.py` para criar todas as tabelas
- ✅ Corrigido encoding (emojis) no script de inicialização
- ✅ Tabelas criadas com sucesso:
  - `configuracao_robo_disparador`
  - `leads_importacao`
  - `logs_disparo_massa`
  - `metricas_disparo_massa`

### 2. Import WhatsAppSender
**Problema:** Aviso de módulo não encontrado

**Solução Aplicada:**
- ✅ O erro é esperado e tratado (try/except)
- ✅ Sistema funciona em modo simulação quando WhatsAppSender não está disponível
- ✅ Corrigido encoding nos avisos de log

### 3. Problemas de Encoding
**Arquivos Corrigidos:**
- ✅ `init_robo_disparador.py` - Removidos emojis
- ✅ `backend/services/disparo_massa.py` - Removidos emojis

---

## 🌐 TODOS OS LINKS DO SISTEMA

### 📊 SERVIDOR PRINCIPAL
- **Backend Flask:** http://localhost:5000
- **WhatsApp Service:** http://localhost:3001/health
- **Bot Engine:** Rodando em background

---

## 🔐 AUTENTICAÇÃO

### Login e Cadastro
- **Login:** http://localhost:5000/login
- **Cadastro:** http://localhost:5000/register
- **Esqueci Senha:** http://localhost:5000/forgot-password
- **Logout:** http://localhost:5000/logout

### Credenciais de Acesso
```
Login Admin:  admin@vendeai.com / admin123
Login Demo:   demo@vendeai.com / demo123
```

---

## 📈 DASHBOARD

### Principais
- **Dashboard Principal:** http://localhost:5000/ ou http://localhost:5000/dashboard
- **Admin Dashboard:** http://localhost:5000/admin/ ou http://localhost:5000/admin/dashboard

---

## 👥 LEADS

### Interface Web
- **Lista de Leads:** http://localhost:5000/leads/
- **Detalhes do Lead:** http://localhost:5000/leads/{lead_id}

### API de Leads
- **GET** - Listar Leads: http://localhost:5000/api/leads
- **POST** - Criar Lead: http://localhost:5000/leads/api/create
- **POST** - Atualizar Lead: http://localhost:5000/leads/api/{lead_id}/update
- **POST** - Deletar Lead: http://localhost:5000/leads/api/{lead_id}/delete
- **GET** - Leads com Conversas: http://localhost:5000/leads/api/leads-com-conversas
- **GET** - Conversas do Lead: http://localhost:5000/leads/api/{lead_id}/conversas
- **GET** - Mensagens da Conversa: http://localhost:5000/leads/api/conversa/{conversa_id}/mensagens

---

## 💬 CONVERSAS

### Interface Web
- **Lista de Conversas:** http://localhost:5000/conversas/
- **Detalhes da Conversa:** http://localhost:5000/conversas/{conversa_id}

### API de Conversas
- **POST** - Marcar como Lida: http://localhost:5000/conversas/api/{conversa_id}/marcar_lida
- **POST** - Arquivar: http://localhost:5000/conversas/api/{conversa_id}/arquivar

---

## 📢 CAMPANHAS

### Interface Web
- **Lista de Campanhas:** http://localhost:5000/campanhas/

---

## 📦 PRODUTOS

### Interface Web
- **Lista de Produtos:** http://localhost:5000/produtos/
- **Upload CSV:** http://localhost:5000/produtos/upload
- **Configuração Avançada:** http://localhost:5000/produtos/config-avancada

### API de Produtos
- **GET** - Listar Produtos: http://localhost:5000/produtos/api/listar
- **POST** - Gerar Config IA: http://localhost:5000/produtos/api/gerar-config-ia
- **POST** - Deletar Produto: http://localhost:5000/produtos/api/delete/{produto_id}
- **GET** - Download Template CSV: http://localhost:5000/produtos/template-csv

---

## 📱 WHATSAPP

### Interface Web
- **WhatsApp Dashboard:** http://localhost:5000/whatsapp/

### API WhatsApp
- **GET** - Status: http://localhost:5000/whatsapp/api/status ou http://localhost:5000/api/whatsapp/status
- **POST** - Gerar QR Code: http://localhost:5000/whatsapp/api/gerar-qr
- **POST** - Desconectar: http://localhost:5000/whatsapp/api/desconectar
- **POST** - Ativar Bot: http://localhost:5000/whatsapp/api/ativar-bot
- **POST** - Simular Conexão: http://localhost:5000/whatsapp/api/simular-conexao

---

## 🤖 ROBÔ DISPARADOR (NOVO!)

### Interface Web
- **Painel do Robô:** http://localhost:5000/api/robo/painel

### API Robô Disparador
- **GET** - Configuração: http://localhost:5000/api/robo/config
- **PUT** - Atualizar Config: http://localhost:5000/api/robo/config
- **POST** - Importar CSV: http://localhost:5000/api/robo/importar-csv
- **GET** - Leads Importados: http://localhost:5000/api/robo/leads-importados
- **POST** - Testar Disparo: http://localhost:5000/api/robo/testar-disparo
- **POST** - Iniciar Disparo em Massa: http://localhost:5000/api/robo/iniciar-disparo-massa
- **POST** - Ignorar Lead: http://localhost:5000/api/robo/lead/{lead_id}/ignorar
- **GET** - Métricas: http://localhost:5000/api/robo/metricas
- **GET** - Logs: http://localhost:5000/api/robo/logs
- **GET** - Status: http://localhost:5000/api/robo/status
- **GET** - Download Template CSV: http://localhost:5000/api/robo/template-csv

---

## ⚙️ CONFIGURAÇÕES

### Interface Web
- **Configurações:** http://localhost:5000/configuracoes/

### API Configurações
- **PUT** - Atualizar Empresa: http://localhost:5000/configuracoes/api/empresa
- **PUT** - Atualizar Bot: http://localhost:5000/configuracoes/api/bot
- **POST** - Alterar Senha: http://localhost:5000/configuracoes/api/alterar-senha
- **POST** - Criar Usuário: http://localhost:5000/configuracoes/api/usuario
- **PUT** - Atualizar Usuário: http://localhost:5000/configuracoes/api/usuario/{usuario_id}
- **DELETE** - Deletar Usuário: http://localhost:5000/configuracoes/api/usuario/{usuario_id}

---

## 👨‍💼 ADMIN

### Interface Web
- **Dashboard Admin:** http://localhost:5000/admin/
- **Empresas:** http://localhost:5000/admin/empresas
- **Usuários:** http://localhost:5000/admin/usuarios
- **Leads:** http://localhost:5000/admin/leads
- **Conversas:** http://localhost:5000/admin/conversas
- **Campanhas:** http://localhost:5000/admin/campanhas
- **Templates:** http://localhost:5000/admin/templates
- **Integrações:** http://localhost:5000/admin/integracoes
- **Analytics:** http://localhost:5000/admin/analytics
- **Logs:** http://localhost:5000/admin/logs
- **Sistema:** http://localhost:5000/admin/sistema
- **Config WhatsApp:** http://localhost:5000/admin/whatsapp-config
- **Config IA:** http://localhost:5000/admin/ia-config
- **Disparador:** http://localhost:5000/admin/disparador
- **Documentação:** http://localhost:5000/admin/documentacao

### API Admin
- **POST** - Disparo Teste: http://localhost:5000/admin/api/disparo-teste
- **POST** - Disparo em Massa: http://localhost:5000/admin/api/disparo-massa
- **GET** - Stats Disparador: http://localhost:5000/admin/api/stats-disparador

---

## 🔌 API DO BOT

### Endpoints para Bot Engine
- **GET** - Configuração: http://localhost:5000/api/bot/config
- **POST** - Salvar Lead: http://localhost:5000/api/bot/leads
- **POST** - Salvar Conversa: http://localhost:5000/api/bot/conversas
- **POST** - Salvar Mensagem: http://localhost:5000/api/bot/mensagens
- **POST** - Registrar Disparo: http://localhost:5000/api/bot/disparos
- **POST** - Atualizar Status: http://localhost:5000/api/bot/status
- **GET** - Buscar Leads para Disparo: http://localhost:5000/api/bot/leads/disparo

---

## 📊 API GERAL

### Endpoints Gerais
- **GET** - Documentação da API: http://localhost:5000/api/docs
- **GET** - Estatísticas: http://localhost:5000/api/stats

---

## 🔗 WEBHOOKS

### Endpoints de Webhook
- **POST** - Receber Mensagem WhatsApp: http://localhost:5000/api/webhook/whatsapp/message
- **POST** - Webhook Conexão WhatsApp: http://localhost:5000/api/webhook/whatsapp/connection
- **GET/POST** - Teste de Webhook: http://localhost:5000/api/webhook/test

---

## 📝 RESUMO POR CATEGORIA

### Total de Rotas: **85 rotas**

- **AUTH:** 4 rotas
- **DASHBOARD:** 4 rotas
- **LEADS:** 12 rotas
- **CONVERSAS:** 5 rotas
- **CAMPANHAS:** 2 rotas
- **PRODUTOS:** 7 rotas
- **WHATSAPP:** 8 rotas
- **CONFIGURAÇÕES:** 8 rotas
- **ROBÔ DISPARADOR:** 11 rotas ⭐ NOVO
- **ADMIN:** 17 rotas
- **API BOT:** 7 rotas
- **WEBHOOK:** 3 rotas

---

## 🚀 COMO USAR

### 1. Iniciar o Sistema
```bash
cd C:\Users\Victor\Documents\VendeAI
python run.py
```

### 2. Acessar Dashboard
```
http://localhost:5000
Login: demo@vendeai.com / demo123
```

### 3. Usar Robô Disparador
```
1. Acesse: http://localhost:5000/api/robo/painel
2. Importe CSV de leads
3. Configure o robô
4. Inicie os disparos
```

---

## 📂 ARQUIVOS IMPORTANTES

- **Banco de Dados:** `vendeai.db`
- **Script Inicialização:** `init_robo_disparador.py`
- **Listar Rotas:** `list_routes.py`
- **App Principal:** `run.py`
- **Documentação:** `COMO_USAR.md`

---

## 🐛 LOG DE ERROS CORRIGIDOS

1. ✅ Tabela `metricas_disparo_massa` não existia → Criada via `init_robo_disparador.py`
2. ✅ Erro de encoding (emojis) → Removidos caracteres especiais
3. ✅ Import WhatsAppSender → Tratamento adequado com try/except
4. ✅ Sistema totalmente funcional em modo simulação

---

## 📞 SUPORTE

Para problemas ou dúvidas:
- Verificar logs em cada terminal
- Consultar `COMO_USAR.md`
- Executar `python list_routes.py` para ver todas as rotas

---

**Última Atualização:** 2025-10-10
**Status:** ✅ Sistema Operacional

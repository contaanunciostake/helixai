# AIra - Sistema de Gestão de Vendas com IA

Sistema completo de automação de vendas com WhatsApp e IA para empresas.

## 🚀 Features

- ✅ **API REST de Autenticação** com JWT
- ✅ **Sistema de Assinaturas** integrado com Mercado Pago
- ✅ **CRM Cliente** React para gestão de leads
- ✅ **CRM Admin** para super admins
- ✅ **Bot WhatsApp** com IA (VendeAI Auto para veículos, AIra Imob para imóveis)
- ✅ **Landing Page** com checkout Mercado Pago

## 📦 Estrutura do Projeto

```
HelixAI/
├── backend/              # Backend Flask
│   ├── routes/          # Rotas da API
│   │   ├── auth_api.py  # ✅ API REST de autenticação
│   │   ├── api.py       # Endpoints gerais
│   │   └── ...
│   ├── templates/       # Templates HTML
│   └── static/          # Arquivos estáticos
├── database/            # Modelos e gerenciamento de DB
│   ├── models.py        # ✅ Modelos completos (inclui ConfiguracaoBot)
│   └── ...
├── AIra_Landing/        # Landing page + Checkout
├── CRM_Client/          # CRM React (cliente)
└── CRM_Admin/           # CRM React (admin)
```

## 🛠️ Setup Local

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Servidor rodará em: http://localhost:5000

### Frontend

```bash
# CRM Cliente
cd CRM_Client/crm-client-app
npm install
npm run dev  # http://localhost:5177

# Landing Page
cd AIra_Landing
npm install
npm run dev  # http://localhost:5173
```

## 🔐 API de Autenticação

Endpoints disponíveis:

- `POST /api/auth/login` - Login com email/senha
- `POST /api/auth/definir-senha` - Definir senha após pagamento
- `POST /api/auth/verificar-token` - Validar token JWT
- `GET /api/auth/test` - Testar se API está online

## 🗄️ Banco de Dados

### Desenvolvimento
SQLite local: `vendeai.db`

### Produção (Render)
PostgreSQL configurado via variáveis de ambiente:
- `DATABASE_URL` - URL do PostgreSQL

## 🚀 Deploy no Render

### Requisitos
1. Criar serviço Web no Render
2. Conectar este repositório GitHub
3. Configurar variáveis de ambiente:
   - `SECRET_KEY` - Chave secreta Flask
   - `DATABASE_URL` - URL PostgreSQL
   - `MERCADO_PAGO_ACCESS_TOKEN` - Token Mercado Pago
   - `MERCADO_PAGO_PUBLIC_KEY` - Chave pública MP

### Build Command
```bash
pip install -r backend/requirements.txt
```

### Start Command
```bash
cd backend && gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120
```

## 📝 Variáveis de Ambiente

Crie um arquivo `.env` na pasta `backend/`:

```env
SECRET_KEY=sua_chave_secreta_aqui
DATABASE_URL=sqlite:///vendeai.db
MERCADO_PAGO_ACCESS_TOKEN=APP-...
MERCADO_PAGO_PUBLIC_KEY=APP_USR-...
USE_REMOTE_DB=False
```

## 🧪 Testes

```bash
# Testar API de autenticação
curl http://localhost:5000/api/auth/test

# Testar login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@teste.com","senha":"Teste123!"}'
```

## 📚 Documentação

- [Integração Mercado Pago](backend/INTEGRACAO_MERCADOPAGO.md)
- API Docs: http://localhost:5000/api/docs

## 🤝 Suporte

- Email: suporte@helixai.com.br
- GitHub Issues: [Criar issue](https://github.com/seu-usuario/helixai/issues)

---

**Desenvolvido por Helix AI** 🚀

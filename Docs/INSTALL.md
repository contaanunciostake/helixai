# 🚀 Guia de Instalação - VendeAI

## Pré-requisitos

- **Python 3.13+**
- **Node.js 18+**
- **Git**

## 📦 Instalação Completa

### 1. Instalar Dependências Python

```bash
cd C:\Users\Victor\Documents\VendeAI
pip install -r requirements.txt
```

### 2. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
copy config\.env.example config\.env

# Editar config\.env e adicionar suas chaves API:
# - OPENAI_API_KEY
# - ELEVENLABS_API_KEY
# - GROQ_API_KEY
```

### 3. Inicializar Banco de Dados

```bash
python database\init_db.py
```

**Credenciais criadas:**
- Super Admin: `admin@vendeai.com` / `admin123`
- Empresa Demo: `demo@vendeai.com` / `demo123`

### 4. Instalar Dependências Node.js (Bot Engine)

```bash
cd bot_engine
npm install
cd ..
```

### 5. Iniciar o Sistema

**Opção A - Iniciar tudo junto:**
```bash
python run.py --all
```

**Opção B - Iniciar separadamente:**
```bash
# Terminal 1 - Backend
python run.py --backend

# Terminal 2 - Bot Engine
python run.py --bot
```

## 🌐 Acessar o Sistema

- **Dashboard Cliente**: http://localhost:5000
- **Dashboard Admin**: http://localhost:5000/admin
- **API Docs**: http://localhost:5000/api/docs
- **Bot WhatsApp**: http://localhost:3000

## 🔧 Configuração Inicial

### 1. Login no Sistema

Acesse http://localhost:5000/login e entre com:
- Email: `demo@vendeai.com`
- Senha: `demo123`

### 2. Configurar o Bot

1. Vá em **Configurações** > **Bot**
2. Preencha:
   - Descrição da empresa
   - Produtos/Serviços
   - Público-alvo
   - Diferenciais
3. Clique em **Gerar Configuração com IA** (usa GPT-4)
4. Adicione suas API Keys (OpenAI, ElevenLabs)

### 3. Conectar WhatsApp

1. Vá em **WhatsApp** > **Conectar**
2. Escaneie o QR Code com seu WhatsApp
3. Aguarde conexão

### 4. Criar Primeira Campanha

1. Vá em **Campanhas** > **Nova Campanha**
2. Configure:
   - Nome da campanha
   - Público-alvo
   - Mensagem
   - Agendamento
3. Clique em **Iniciar Campanha**

## 📊 Estrutura do Sistema

```
VendeAI/
├── backend/          # Flask API (Python)
│   ├── routes/      # Rotas modulares
│   ├── templates/   # Interface web
│   └── app.py       # Aplicação principal
│
├── bot_engine/      # Motor WhatsApp (Node.js)
│   └── main.js      # Bot principal
│
├── database/        # Banco de dados
│   ├── models.py    # 15 tabelas
│   ├── init_db.py   # Inicializador
│   └── vendeai.db   # SQLite
│
└── config/          # Configurações
    └── .env         # Variáveis de ambiente
```

## 🔐 Segurança

**IMPORTANTE:** Antes de colocar em produção:

1. Altere o `SECRET_KEY` em `config/.env`
2. Use PostgreSQL em vez de SQLite
3. Configure HTTPS
4. Altere senhas padrão

## 🆘 Solução de Problemas

### Erro: "ModuleNotFoundError: No module named 'flask'"

```bash
pip install -r requirements.txt
```

### Erro: "vendeai.db não encontrado"

```bash
python database\init_db.py
```

### Bot WhatsApp não conecta

1. Verifique se Node.js está instalado: `node --version`
2. Instale dependências: `cd bot_engine && npm install`
3. Reinicie o bot

### Erro de importação no Flask

```bash
# Adicione a pasta raiz ao PYTHONPATH
set PYTHONPATH=C:\Users\Victor\Documents\VendeAI
```

## 📚 Próximos Passos

1. ✅ Sistema instalado e rodando
2. 🔄 **Próximo**: Migrar bot FeiraoShowCar
3. 🔄 **Próximo**: Copiar templates dos sistemas antigos
4. 🔄 **Próximo**: Testar integração completa

## 💡 Dicas

- Use `python run.py --init-db` para resetar banco
- Logs ficam em `logs/vendeai.log`
- Para produção, use Gunicorn + Nginx

---

**VendeAI** - Sistema Integrado de Automação WhatsApp 🚀

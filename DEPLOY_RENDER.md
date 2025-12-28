# VendeFacil - Guia de Deploy no Render.com

## Visao Geral dos Servicos

| Servico | Tipo | URL |
|---------|------|-----|
| PostgreSQL | Database | (interno) |
| Backend Flask | Web Service | vendefacil-backend.onrender.com |
| WhatsApp Service | Web Service | vendefacil-whatsapp.onrender.com |
| Landing Page | Static Site | vendefacil-landing.onrender.com |
| CRM Admin | Static Site | vendefacil-admin.onrender.com |
| CRM Client | Static Site | vendefacil-client.onrender.com |
| Afiliados | Static Site | vendefacil-afiliados.onrender.com |

---

## PASSO 1: Subir Codigo para GitHub

```bash
# Na pasta do projeto
cd D:\Helix\HelixAI

# Iniciar git (se ainda nao tiver)
git init

# Adicionar remote do seu repositorio
git remote add origin https://github.com/contaanunciostake/vendefacil.git

# Adicionar todos os arquivos
git add .

# Commit inicial
git commit -m "Deploy inicial VendeFacil - Sistema completo"

# Push para o GitHub
git push -u origin main
```

---

## PASSO 2: Criar PostgreSQL no Render

1. Acesse https://dashboard.render.com
2. Clique em **"New +"** > **"PostgreSQL"**
3. Configure:
   - **Name:** `vendefacil-db`
   - **Database:** `vendefacil`
   - **User:** `vendefacil`
   - **Region:** Oregon (US West)
   - **Plan:** Free
4. Clique em **"Create Database"**
5. **IMPORTANTE:** Copie a **Internal Database URL** (comeca com `postgres://`)

---

## PASSO 3: Criar Backend Flask

1. Clique em **"New +"** > **"Web Service"**
2. Conecte seu repositorio GitHub `contaanunciostake/vendefacil`
3. Configure:

| Campo | Valor |
|-------|-------|
| **Name** | `vendefacil-backend` |
| **Region** | Oregon (US West) |
| **Branch** | main |
| **Root Directory** | backend |
| **Runtime** | Python 3 |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `gunicorn wsgi:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120` |
| **Plan** | Free |

4. Em **"Environment Variables"**, adicione (copie e cole no formato .env):

```env
DATABASE_URL=postgres://vendefacil:SENHA@HOST:5432/vendefacil
SECRET_KEY=sua-chave-secreta-super-segura-aqui-2024
FLASK_ENV=production
FLASK_DEBUG=False
PYTHON_VERSION=3.11.9
OPENAI_API_KEY=sk-proj-sua-chave-openai
ANTHROPIC_API_KEY=sk-ant-sua-chave-anthropic
MERCADOPAGO_ACCESS_TOKEN=seu-token-mercadopago
MERCADOPAGO_PUBLIC_KEY=sua-public-key-mercadopago
WHATSAPP_SERVICE_URL=https://vendefacil-whatsapp.onrender.com
```

5. Clique em **"Create Web Service"**

---

## PASSO 4: Criar WhatsApp Service

1. Clique em **"New +"** > **"Web Service"**
2. Conecte o mesmo repositorio
3. Configure:

| Campo | Valor |
|-------|-------|
| **Name** | `vendefacil-whatsapp` |
| **Region** | Oregon (US West) |
| **Branch** | main |
| **Root Directory** | whatsapp_service |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `node integrated-bot-server.js` |
| **Plan** | Free |

4. Variaveis de ambiente:

```env
NODE_VERSION=18.19.0
PORT=3010
API_URL=https://vendefacil-backend.onrender.com
OPENAI_API_KEY=sk-proj-sua-chave-openai
ANTHROPIC_API_KEY=sk-ant-sua-chave-anthropic
ELEVENLABS_API_KEY=sua-chave-elevenlabs
```

5. Clique em **"Create Web Service"**

---

## PASSO 5: Criar Landing Page (Static Site)

1. Clique em **"New +"** > **"Static Site"**
2. Conecte o repositorio
3. Configure:

| Campo | Valor |
|-------|-------|
| **Name** | `vendefacil-landing` |
| **Branch** | main |
| **Root Directory** | AIra_Landing |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | dist |

4. Em **"Redirects/Rewrites"**, adicione:
   - Source: `/*`
   - Destination: `/index.html`
   - Type: Rewrite

5. Clique em **"Create Static Site"**

---

## PASSO 6: Criar CRM Admin (Static Site)

1. Clique em **"New +"** > **"Static Site"**
2. Configure:

| Campo | Valor |
|-------|-------|
| **Name** | `vendefacil-admin` |
| **Branch** | main |
| **Root Directory** | CRM_Admin/crm-admin-app |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | dist |

3. Variaveis de ambiente:

```env
VITE_API_URL=https://vendefacil-backend.onrender.com
VITE_WHATSAPP_SERVICE_URL=https://vendefacil-whatsapp.onrender.com
```

4. Adicione Rewrite: `/* -> /index.html`
5. Clique em **"Create Static Site"**

---

## PASSO 7: Criar CRM Client (Static Site)

1. Clique em **"New +"** > **"Static Site"**
2. Configure:

| Campo | Valor |
|-------|-------|
| **Name** | `vendefacil-client` |
| **Branch** | main |
| **Root Directory** | CRM_Client/crm-client-app |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | dist |

3. Variaveis de ambiente:

```env
VITE_API_URL=https://vendefacil-backend.onrender.com
VITE_BOT_API_URL=https://vendefacil-whatsapp.onrender.com
VITE_WS_URL=wss://vendefacil-whatsapp.onrender.com/ws
```

4. Adicione Rewrite: `/* -> /index.html`
5. Clique em **"Create Static Site"**

---

## PASSO 8: Criar Afiliados Panel (Static Site)

1. Clique em **"New +"** > **"Static Site"**
2. Configure:

| Campo | Valor |
|-------|-------|
| **Name** | `vendefacil-afiliados` |
| **Branch** | main |
| **Root Directory** | Afiliados_Panel |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | dist |

3. Variaveis de ambiente:

```env
VITE_API_URL=https://vendefacil-backend.onrender.com
```

4. Adicione Rewrite: `/* -> /index.html`
5. Clique em **"Create Static Site"**

---

## PASSO 9: Migrar Dados do SQLite para PostgreSQL

Apos o backend estar funcionando, migre os dados:

```bash
# No seu computador local
cd D:\Helix\HelixAI\backend

# Gerar arquivo SQL de exportacao
python migrar_sqlite_para_postgres.py

# Conectar ao PostgreSQL do Render e importar
# Use a External Database URL do Render
psql "postgres://vendefacil:SENHA@HOST:5432/vendefacil" < dados_exportados.sql
```

Ou via Render Shell:
1. Va no servico `vendefacil-backend`
2. Clique em "Shell"
3. Execute: `python migrar_sqlite_para_postgres.py`

---

## PASSO 10: Criar Super Admin no PostgreSQL

Apos migrar os dados, crie o super admin:

```bash
# Via Render Shell do backend
python -c "
from database.models import DatabaseManager
import os
db = DatabaseManager(os.getenv('DATABASE_URL'))
db.create_all()
db.criar_super_admin()
print('Super admin criado!')
"
```

---

## Variaveis de Ambiente Completas (Formato .env)

### Backend (.env)
```env
# Database (substituir pela URL do PostgreSQL do Render)
DATABASE_URL=postgres://vendefacil:SENHA@oregon-postgres.render.com:5432/vendefacil

# Flask
SECRET_KEY=vendefacil-secret-key-producao-2024-segura
FLASK_ENV=production
FLASK_DEBUG=False
PYTHON_VERSION=3.11.9

# AI APIs
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxx
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxx
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxx
MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxxxxxxxxx

# WhatsApp Service
WHATSAPP_SERVICE_URL=https://vendefacil-whatsapp.onrender.com
```

### WhatsApp Service (.env)
```env
NODE_VERSION=18.19.0
PORT=3010
API_URL=https://vendefacil-backend.onrender.com
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxx
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxx
ELEVENLABS_API_KEY=sk_xxxxxxxxxxxxxxxxxxxx
```

### CRM Admin (.env)
```env
VITE_API_URL=https://vendefacil-backend.onrender.com
VITE_WHATSAPP_SERVICE_URL=https://vendefacil-whatsapp.onrender.com
```

### CRM Client (.env)
```env
VITE_API_URL=https://vendefacil-backend.onrender.com
VITE_BOT_API_URL=https://vendefacil-whatsapp.onrender.com
VITE_WS_URL=wss://vendefacil-whatsapp.onrender.com/ws
```

### Afiliados (.env)
```env
VITE_API_URL=https://vendefacil-backend.onrender.com
```

---

## Verificacao Final

Apos o deploy, teste:

1. **Backend:** https://vendefacil-backend.onrender.com/health
2. **WhatsApp:** https://vendefacil-whatsapp.onrender.com/api/status
3. **Landing:** https://vendefacil-landing.onrender.com
4. **Admin:** https://vendefacil-admin.onrender.com
5. **Client:** https://vendefacil-client.onrender.com
6. **Afiliados:** https://vendefacil-afiliados.onrender.com

---

## Troubleshooting

### Erro de CORS
- Verifique se os dominios estao corretos no `backend/backend/__init__.py`

### Erro de conexao com banco
- Verifique se o DATABASE_URL esta correto
- Deve comecar com `postgresql://` (nao `postgres://`)

### WhatsApp nao conecta
- Verifique se o API_URL esta apontando para o backend correto
- Reinicie o servico WhatsApp

### Build falha
- Verifique os logs no Render Dashboard
- Certifique-se que o Root Directory esta correto

---

## Comandos Uteis

```bash
# Ver logs do backend
render logs vendefacil-backend

# Reiniciar servico
render restart vendefacil-backend

# Abrir shell
render shell vendefacil-backend
```

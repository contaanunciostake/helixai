# HelixAI - Sistema Completo de Vendas com IA

Sistema integrado de vendas com bots de WhatsApp para veículos e imóveis, CRM completo e landing page.

## Estrutura do Sistema

O sistema é composto por 7 serviços principais:

1. **Backend Flask API** (porta 5000) - API principal do sistema
2. **Landing Page** (porta 5176) - Página inicial do sistema
3. **CRM Cliente** (porta 5177) - Interface para clientes
4. **CRM Admin** (porta 5175) - Interface administrativa
5. **WhatsApp Service** - Serviço de conexão WhatsApp
6. **AIra Auto** - Bot de vendas de veículos
7. **AIra Imob** - Bot de vendas de imóveis

## Pré-requisitos

Antes de iniciar, certifique-se de ter instalado:

- **Node.js** (versão 16 ou superior)
- **Python** (versão 3.9 ou superior)
- **XAMPP** (para MySQL)
- **Git** (opcional)

## Instalação Inicial

### 1. Configurar o Banco de Dados MySQL

1. Abra o **XAMPP Control Panel**
2. Clique em **Start** no MySQL
3. Aguarde até o MySQL estar rodando (luz verde)
4. Execute o script de setup:

```batch
SETUP_DATABASE.bat
```

Este script irá:
- Verificar se o MySQL está rodando
- Criar o banco de dados `helixai_db`
- Criar as tabelas necessárias (`cars`, `vendors`)

### 2. Instalar Dependências

#### Frontend (Node.js)

Para cada projeto frontend, execute:

```batch
cd AIra_Landing
npm install

cd ../CRM_Client/crm-client-app
npm install

cd ../../CRM_Admin/crm-admin-app
npm install

cd ../../whatsapp_service
npm install

cd ../AIra_Auto
npm install

cd ../AIra_Imob
npm install
```

#### Backend (Python)

```batch
cd backend
python -m venv venv
venv\Scripts\activate
pip install flask flask-cors flask-login python-dotenv sqlalchemy pymysql cryptography
```

### 3. Configurar Variáveis de Ambiente

Os arquivos `.env` já estão configurados nos seguintes diretórios:
- `D:\Helix\HelixAI\.env` - Configurações globais
- `D:\Helix\HelixAI\AIra_Auto\.env` - Bot de veículos
- `D:\Helix\HelixAI\AIra_Imob\.env` - Bot de imóveis

**Importante:** Verifique se as chaves de API estão corretas antes de usar em produção.

## Como Iniciar o Sistema

### Opção 1: Iniciar Tudo de Uma Vez (Recomendado)

```batch
INICIAR_TUDO.bat
```

Este script irá:
1. Verificar se o MySQL está rodando
2. Limpar cache dos projetos
3. Iniciar o Backend Flask (porta 5000)
4. Aguardar 5 segundos para o backend inicializar
5. Iniciar todos os frontends e bots

### Opção 2: Iniciar Serviços Individualmente

#### Backend Flask
```batch
INICIAR_BACKEND.bat
```

#### Landing Page
```batch
cd AIra_Landing
npm run dev
```

#### CRM Cliente
```batch
cd CRM_Client/crm-client-app
npm run dev
```

#### CRM Admin
```batch
cd CRM_Admin/crm-admin-app
npm run dev
```

#### WhatsApp Service
```batch
cd whatsapp_service
npm start
```

#### Bot AIra Auto (Veículos)
```batch
cd AIra_Auto
npm start
```

#### Bot AIra Imob (Imóveis)
```batch
cd AIra_Imob
npm start
```

## Acessar o Sistema

Após iniciar todos os serviços:

### URLs de Acesso

| Serviço | URL | Descrição |
|---------|-----|-----------|
| Backend API | http://localhost:5000/ | API principal |
| Landing Page | http://localhost:5176/ | Página inicial |
| CRM Cliente | http://localhost:5177/ | Interface do cliente |
| CRM Admin | http://localhost:5175/ | Painel administrativo |

### Credenciais de Acesso

#### Cliente
- **Email:** cliente@empresa.com
- **Senha:** cliente123
- **URL:** http://localhost:5177/

#### Administrador
- **Email:** admin@aira.com
- **Senha:** admin123
- **URL:** http://localhost:5175/

## Solução de Problemas

### Erro: "Table 'helixai_db.cars' doesn't exist"

**Solução:** Execute o script `SETUP_DATABASE.bat` para criar as tabelas.

### Erro: "MySQL não está rodando"

**Solução:**
1. Abra o XAMPP Control Panel
2. Clique em "Start" no MySQL
3. Aguarde a luz verde
4. Execute novamente o script

### Erro: "BACKEND_URL env: NÃO DEFINIDO"

**Solução:** Este erro foi corrigido. Os arquivos `.env` agora incluem `BACKEND_URL=http://localhost:5000/api`

### Bots não conectam ao WhatsApp

**Solução:**
1. Verifique se o WhatsApp Service está rodando
2. Escaneie o QR Code que aparece no terminal
3. Aguarde a conexão ser estabelecida

### Porta já em uso

**Solução:**
1. Feche todas as janelas de terminal
2. Abra o Gerenciador de Tarefas (Ctrl+Shift+Esc)
3. Finalize processos Node.js e Python
4. Execute novamente

## Configurações Avançadas

### Webhooks ElevenLabs

Para configurar webhooks do ElevenLabs (áudio/voz):

```batch
INICIAR_WEBHOOK_ELEVENLABS.bat
```

### Modo de Teste dos Bots

Os bots estão configurados em **MODO_TESTE**, respondendo apenas para números específicos:
- 554299300611
- 556799222756

Para desativar o modo teste:
1. Abra `AIra_Auto/bot-lucas.js` ou arquivo equivalente
2. Encontre `MODO_TESTE = true` (linha ~163)
3. Mude para `MODO_TESTE = false`

### Configurar Módulos

No arquivo `.env` de cada bot, você pode ativar/desativar módulos:

```env
MODULO_FIPE_ATIVO=True
MODULO_FINANCIAMENTO_ATIVO=True
MODULO_AGENDAMENTO_ATIVO=True
```

## Estrutura de Diretórios

```
D:\Helix\HelixAI\
├── backend/                    # API Flask (Python)
├── AIra_Landing/              # Landing Page (React)
├── CRM_Client/crm-client-app/ # CRM Cliente (React)
├── CRM_Admin/crm-admin-app/   # CRM Admin (React)
├── whatsapp_service/          # Serviço WhatsApp (Node.js)
├── AIra_Auto/                 # Bot Veículos (Node.js)
├── AIra_Imob/                 # Bot Imóveis (Node.js)
├── Databases/                 # Scripts SQL
├── .env                       # Variáveis de ambiente globais
├── SETUP_DATABASE.bat         # Script de setup do banco
├── INICIAR_TUDO.bat          # Inicia todos os serviços
└── INICIAR_BACKEND.bat       # Inicia apenas o backend
```

## Tecnologias Utilizadas

- **Frontend:** React, Vite, TailwindCSS
- **Backend:** Flask (Python), SQLAlchemy
- **Banco de Dados:** MySQL
- **IA:** OpenAI GPT-4, Anthropic Claude
- **Áudio/Voz:** ElevenLabs
- **WhatsApp:** Baileys (WhatsApp Web API)

## Suporte

Para problemas ou dúvidas:
1. Verifique a seção "Solução de Problemas" acima
2. Consulte os logs nos terminais abertos
3. Verifique os arquivos de log em `logs/`

## Licença

Propriedade de HelixAI - Todos os direitos reservados

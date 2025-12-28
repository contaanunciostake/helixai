# Integração VendeAI Bot com CRM do Cliente

## Arquitetura Completa

A integração entre o **VendeAI Bot** e o **CRM do Cliente** já está implementada e funcional. Este documento explica como tudo está conectado e como usar o sistema.

## Componentes Principais

### 1. VendeAI Bot (`VendeAI/VendeAI/bot_engine/`)
Bot completo com IA avançada para vendas de veículos:
- **IA Master** (`ia-modules/00-ia-master.js`)
  - Análise de intenções
  - Análise de sentimento
  - Recomendações inteligentes
  - Predição de fechamento
  - Gerador de respostas
  - Memória e contexto

- **Recursos Avançados**
  - Integração com API FIPE (consulta de valores)
  - Simulador de financiamento
  - Sistema de agendamento
  - Geração de áudio (ElevenLabs)
  - Busca inteligente de veículos

### 2. Integrated Bot Server (`whatsapp_service/integrated-bot-server.js`)
Servidor multi-tenant que gerencia múltiplas conexões WhatsApp:
- **Porta**: 3010
- **WebSocket**: `ws://localhost:3010/ws?empresa_id=X`
- **API REST**: `http://localhost:3010/api/bot/*`

#### Endpoints Disponíveis:
```
GET  /api/bot/status/:empresaId          - Status da conexão
POST /api/bot/connect/:empresaId         - Conectar/gerar QR code
POST /api/bot/disconnect/:empresaId      - Desconectar bot
GET  /api/bot/sessions                   - Listar todas as sessões
GET  /api/bot/nicho/:empresaId           - Ver nicho e tipo de bot
POST /api/bot/send-message               - Enviar mensagem manual
POST /api/bot/clear-cache/:empresaId     - Limpar cache de nicho
```

### 3. Session Manager (`whatsapp_service/integrated-session-manager.js`)
Gerencia sessões WhatsApp e seleciona o bot correto:
- Cria e gerencia conexões Baileys
- Gera e distribui QR Codes via WebSocket
- Reconexão automática
- Isolamento entre empresas

### 4. Bot Selector (`whatsapp_service/bot-selector-by-niche.js`)
Seleciona automaticamente o bot baseado no nicho da empresa:
- **VEICULOS** → VendeAI Bot (IA completa)
- **IMOVEIS** → AIra Imob Bot (em desenvolvimento)
- **Outros** → Bot Genérico

### 5. VendeAI Integration (`whatsapp_service/vendeai-bot-integration.js`)
Ponte entre o VendeAI Bot e o sistema multi-tenant:
- Importa módulos do VendeAI
- Adapta IA Master para SQLite
- Processa mensagens com IA avançada
- Gerencia histórico de conversas
- Integra áudio, FIPE, financiamento

### 6. CRM Frontend (`CRM_Client/crm-client-app/`)
Interface do cliente para conectar WhatsApp:

#### Componente: `WhatsAppConnection.jsx`
- **Localização**: `src/components/WhatsAppConnection.jsx`
- **URL API Bot**: `http://localhost:3010`
- **WebSocket**: `ws://localhost:3010/ws`

**Funcionalidades**:
- Gera QR Code para conexão
- Exibe status em tempo real (WebSocket)
- Controle de bot ativo/inativo
- Estatísticas de conversas
- Desconexão segura

## Fluxo de Conexão

```
┌─────────────────────────────────────────────────────────────────┐
│                     CRM DO CLIENTE                               │
│                  (React - Porta 5173)                            │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │        WhatsAppConnection.jsx                            │   │
│  │                                                           │   │
│  │  1. Usuário clica "Conectar WhatsApp"                   │   │
│  │  2. POST /api/bot/connect/:empresaId                    │   │
│  │  3. WebSocket conecta para receber QR Code              │   │
│  └──────────────────┬──────────────────────────────────────┘   │
└────────────────────│────────────────────────────────────────────┘
                     │
                     │ HTTP/WS
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│            INTEGRATED BOT SERVER                                 │
│              (Express + WS - Porta 3010)                         │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  integrated-bot-server.js                                │  │
│  │                                                           │  │
│  │  ▪ Recebe requisição de conexão                         │  │
│  │  ▪ Chama Session Manager                                │  │
│  │  ▪ Distribui QR Code via WebSocket                      │  │
│  └───────────────────┬──────────────────────────────────────┘  │
└─────────────────────│──────────────────────────────────────────┘
                      │
                      │ Session Management
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│         INTEGRATED SESSION MANAGER                               │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  integrated-session-manager.js                           │  │
│  │                                                           │  │
│  │  ▪ Cria sessão Baileys (WhatsApp)                       │  │
│  │  ▪ Gera QR Code                                          │  │
│  │  ▪ Envia QR via WebSocket                                │  │
│  │  ▪ Monitora status da conexão                            │  │
│  │  ▪ Quando conectado, chama Bot Selector                 │  │
│  └───────────────────┬──────────────────────────────────────┘  │
└─────────────────────│──────────────────────────────────────────┘
                      │
                      │ Bot Selection
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│              BOT SELECTOR BY NICHE                               │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  bot-selector-by-niche.js                                │  │
│  │                                                           │  │
│  │  1. Consulta nicho da empresa no banco                   │  │
│  │     SELECT nicho FROM empresas WHERE id = ?              │  │
│  │                                                           │  │
│  │  2. Seleciona bot baseado no nicho:                      │  │
│  │     ▪ VEICULOS → VendeAI Bot                            │  │
│  │     ▪ IMOVEIS  → AIra Imob Bot                          │  │
│  │     ▪ Outros   → Bot Genérico                           │  │
│  └───────────────────┬──────────────────────────────────────┘  │
└─────────────────────│──────────────────────────────────────────┘
                      │
                      │ (Se nicho = VEICULOS)
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│           VENDEAI BOT INTEGRATION                                │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  vendeai-bot-integration.js                              │  │
│  │                                                           │  │
│  │  ▪ Importa módulos do VendeAI Bot                       │  │
│  │  ▪ Cria instância do IA Master                          │  │
│  │  ▪ Configura clientes (OpenAI, Anthropic, ElevenLabs)  │  │
│  │  ▪ Retorna função processMessage()                      │  │
│  └───────────────────┬──────────────────────────────────────┘  │
└─────────────────────│──────────────────────────────────────────┘
                      │
                      │ Bot Instance
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                  VENDEAI BOT                                     │
│             (VendeAI/VendeAI/bot_engine/)                       │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  IA MASTER (ia-modules/00-ia-master.js)                 │  │
│  │                                                           │  │
│  │  ▪ Analisa intenções (interesse, dúvida, negociação)    │  │
│  │  ▪ Recomenda veículos inteligentemente                  │  │
│  │  ▪ Analisa sentimento do cliente                        │  │
│  │  ▪ Mantém memória e contexto da conversa               │  │
│  │  ▪ Prediz probabilidade de fechamento                   │  │
│  │  ▪ Gera respostas personalizadas                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Módulos Complementares:                                         │
│  ▪ fipe-wrapper.js          - Consulta valores FIPE             │
│  ▪ simulador-financiamento.js - Simula financiamentos           │
│  ▪ modulo-agendamento.js    - Agendamento de visitas            │
│  ▪ bot-adapter.js           - Adaptador de banco de dados       │
└─────────────────────────────────────────────────────────────────┘
```

## Como o Cliente Conecta o WhatsApp

### Passo 1: Acessar o CRM
1. Abrir navegador em `http://localhost:5173`
2. Fazer login no CRM
3. Navegar até a página "WhatsApp" ou "Configurações"

### Passo 2: Conectar WhatsApp
1. Clicar no botão **"Conectar WhatsApp"**
2. Aguardar geração do QR Code (2-5 segundos)
3. Abrir WhatsApp no celular
4. Ir em **Menu (⋮) → Aparelhos conectados**
5. Tocar em **"Conectar um aparelho"**
6. Escanear o QR Code exibido na tela

### Passo 3: Aguardar Autenticação
- QR Code fica amarelo e mostra "Autenticando..."
- Após 2-3 segundos, conexão é estabelecida
- Número do WhatsApp é exibido
- Status muda para "Conectado" (verde)

### Passo 4: Ativar o Bot
- O toggle "Status do Bot" deve estar em **"Bot Ativo"**
- Se desativado, o bot não responderá mensagens
- Ativar clicando no switch verde

## Estrutura de Diretórios

```
HelixAI/
├── VendeAI/                        # Bot VendeAI completo
│   └── VendeAI/
│       ├── .env                    # Configurações (API keys)
│       └── bot_engine/             # Engine do bot
│           ├── ia-modules/         # Módulos de IA
│           │   ├── 00-ia-master.js
│           │   ├── 01-analisador-intencoes.js
│           │   ├── 02-recomendador-inteligente.js
│           │   ├── 03-analisador-sentimento.js
│           │   ├── 04-memoria-contexto.js
│           │   ├── 05-preditor-fechamento.js
│           │   └── 06-gerador-respostas.js
│           ├── fipe-wrapper.js
│           ├── simulador-financiamento.js
│           └── modulo-agendamento.js
│
├── whatsapp_service/               # Servidor multi-tenant
│   ├── integrated-bot-server.js   # Servidor Express + WebSocket
│   ├── integrated-session-manager.js  # Gerenciador de sessões
│   ├── bot-selector-by-niche.js   # Seletor de bots
│   ├── vendeai-bot-integration.js # Integração VendeAI
│   └── vendeai-bot-wrapper.js     # Wrapper alternativo
│
├── CRM_Client/                     # CRM Frontend
│   └── crm-client-app/
│       └── src/
│           └── components/
│               └── WhatsAppConnection.jsx  # Interface de conexão
│
└── backend/                        # Backend Python
    └── backend/
        └── routes/
            └── api.py              # API bot toggle
```

## Configurações Necessárias

### 1. Variáveis de Ambiente (`.env`)

Arquivo: `VendeAI/.env`
```bash
# Banco de Dados
DATABASE_URL=mysql+pymysql://root:@localhost:3306/u161861600_feiraoshow
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=u161861600_feiraoshow

# APIs de IA
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-api03-...

# ElevenLabs (Áudio)
ELEVENLABS_API_KEY=sk_...
ELEVENLABS_VOICE_ID=r2fkFV8WAqXq2AqBpgJT
ELEVENLABS_AGENT_ID=agent_...

# Configurações do Negócio
VENDEDOR_NOME=Aira
LOJA_NOME=Feirão ShowCar
LOJA_CIDADE=Campo Grande
LOJA_TELEFONE=5567999887766
```

### 2. Banco de Dados

#### Tabelas Necessárias:

**empresas**
```sql
CREATE TABLE empresas (
  id INT PRIMARY KEY,
  nome VARCHAR(255),
  nicho ENUM('veiculos', 'imoveis', 'servicos', 'generic'),
  bot_ativo BOOLEAN DEFAULT false,
  whatsapp_conectado BOOLEAN DEFAULT false,
  whatsapp_numero VARCHAR(20),
  whatsapp_qr_code TEXT
);
```

**conversas**
```sql
CREATE TABLE conversas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  empresa_id INT,
  telefone VARCHAR(20),
  nome_contato VARCHAR(255),
  ativa BOOLEAN DEFAULT true,
  iniciada_em DATETIME,
  ultima_mensagem DATETIME
);
```

**mensagens**
```sql
CREATE TABLE mensagens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  conversa_id INT,
  tipo ENUM('recebida', 'enviada'),
  conteudo TEXT,
  enviada_por_bot BOOLEAN,
  enviada_em DATETIME
);
```

**veiculos**
```sql
CREATE TABLE veiculos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  empresa_id INT,
  marca VARCHAR(100),
  modelo VARCHAR(100),
  ano_modelo INT,
  preco DECIMAL(10, 2),
  disponivel BOOLEAN DEFAULT true,
  destaque BOOLEAN DEFAULT false,
  -- ... outros campos
);
```

## Inicialização do Sistema

### 1. Iniciar Backend (Python Flask)
```bash
cd backend
python -m flask run
# Roda na porta 5000
```

### 2. Iniciar Bot Server (Node.js)
```bash
cd whatsapp_service
node integrated-bot-server.js
# Roda na porta 3010
```

### 3. Iniciar CRM Frontend (React)
```bash
cd CRM_Client/crm-client-app
npm run dev
# Roda na porta 5173
```

### Ordem Recomendada:
1. **Backend** (porta 5000)
2. **Bot Server** (porta 3010)
3. **Frontend CRM** (porta 5173)

## Como Funciona o Processamento de Mensagens

### Fluxo quando cliente envia mensagem:

```
1. Cliente envia mensagem no WhatsApp
   ↓
2. Baileys (integrated-session-manager.js) recebe a mensagem
   ↓
3. Session Manager identifica a empresa pela sessão
   ↓
4. Chama bot.processMessage(message)
   ↓
5. vendeai-bot-integration.js processa a mensagem:
   a. Extrai telefone, nome e texto
   b. Busca ou cria conversa no banco
   c. Busca histórico das últimas 20 mensagens
   d. Chama IA Master com histórico completo
   ↓
6. IA Master (00-ia-master.js) processa:
   a. Módulo 01: Analisa intenção
   b. Módulo 02: Recomenda veículos
   c. Módulo 03: Analisa sentimento
   d. Módulo 04: Atualiza memória/contexto
   e. Módulo 05: Calcula probabilidade de fechamento
   f. Módulo 06: Gera resposta personalizada
   ↓
7. Resposta é salva no banco de dados
   ↓
8. Mensagem é enviada via Baileys
   ↓
9. (Opcional) Se áudio ativo, gera e envia áudio via ElevenLabs
```

## Toggle Bot Ativo/Inativo

### Backend: `backend/backend/routes/api.py`

```python
@app.route('/api/empresa/bot/toggle', methods=['POST'])
def toggle_bot():
    data = request.json
    empresa_id = data.get('empresa_id')
    bot_ativo = data.get('bot_ativo')

    # Atualizar no banco
    db.session.query(Empresa).filter_by(id=empresa_id)\
        .update({'bot_ativo': bot_ativo})
    db.session.commit()

    return jsonify({'success': True})
```

### Frontend: `WhatsAppConnection.jsx`

```javascript
const toggleBot = async () => {
  const novoStatus = !botAtivo;
  const response = await fetch('http://localhost:5000/api/empresa/bot/toggle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      empresa_id: empresaId,
      bot_ativo: novoStatus
    })
  });

  if (response.ok) {
    setBotAtivo(novoStatus);
    showNotification(`Bot ${novoStatus ? 'ativado' : 'desativado'}!`);
  }
};
```

## Recursos da IA Master

### 1. Análise de Intenções
- Identifica o que o cliente quer (comprar, tirar dúvida, negociar)
- Extrai filtros mencionados (marca, modelo, preço, ano)

### 2. Recomendador Inteligente
- Busca veículos no banco baseado nos filtros
- Ranqueia por relevância
- Considera histórico do cliente

### 3. Análise de Sentimento
- Detecta se cliente está satisfeito, neutro ou insatisfeito
- Mede "temperatura" do lead (quente, morno, frio)
- Ajusta tom da resposta

### 4. Memória e Contexto
- Mantém histórico de conversas
- Lembra preferências do cliente
- Contexto temporal (última interação)

### 5. Preditor de Fechamento
- Calcula probabilidade de venda (0-100%)
- Identifica sinais de compra
- Sugere próximos passos

### 6. Gerador de Respostas
- Cria respostas naturais e personalizadas
- Adapta linguagem ao cliente
- Inclui CTAs (call to actions)

## Logs e Debug

### Logs do Bot Server
```bash
# Logs estruturados com prefixos
[SESSION-MANAGER] 📱 QR Code gerado para empresa 9
[BOT-SELECTOR] 🤖 Selecionando bot para empresa 9
[VENDEAI-BOT] 📨 Processando mensagem...
[VENDEAI-BOT] 🎯 Intenção detectada: interesse_compra
[VENDEAI-BOT] 🎭 Sentimento: positivo (quente)
[VENDEAI-BOT] ✅ Mensagem processada com sucesso
```

### Verificar Status
```bash
# Via API
curl http://localhost:3010/api/bot/status/9

# Resposta
{
  "success": true,
  "data": {
    "connected": true,
    "phoneNumber": "5567999887766",
    "nicho": "veiculos",
    "botType": "vendeai"
  }
}
```

## Troubleshooting

### Problema: QR Code não aparece
**Solução**:
- Verificar se bot server está rodando (porta 3010)
- Verificar WebSocket no console do navegador
- Tentar refresh da página

### Problema: Bot não responde mensagens
**Solução**:
- Verificar se "Bot Ativo" está ligado
- Verificar logs do bot server
- Conferir se empresa tem nicho "veiculos" no banco
- Verificar API keys no .env

### Problema: Erro de banco de dados
**Solução**:
- Verificar se todas as tabelas existem
- Conferir credenciais no .env
- Verificar se MySQL está rodando

## Próximos Passos

1. ✅ **Integração completa** - PRONTO
2. ✅ **IA Master funcionando** - PRONTO
3. 🔄 **Testes de ponta a ponta** - EM ANDAMENTO
4. 📋 **Melhorias futuras**:
   - Dashboard de analytics
   - Relatórios de conversas
   - Treinamento personalizado da IA
   - Multi-idioma
   - Integração com CRMs externos

---

## Suporte

Para dúvidas ou problemas:
1. Verificar logs do sistema
2. Consultar esta documentação
3. Verificar configurações do .env
4. Testar endpoints da API manualmente

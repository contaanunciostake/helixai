# ✅ Integração Completa: VendeAI Bot + CRM HelixAI

## 📋 Resumo da Integração

A integração entre o bot VendeAI e o CRM HelixAI foi concluída com sucesso! Agora o bot consome configurações do CRM, salva conversas e leads automaticamente no banco de dados.

---

## 🆕 Arquivos Criados

### 1. `VendeAI/bot_engine/crm-adapter.js`
**Descrição:** Módulo de integração do bot com o CRM

**Funcionalidades:**
- ✅ Buscar configurações da empresa do CRM
- ✅ Registrar conversas no banco de dados
- ✅ Salvar mensagens (cliente e bot)
- ✅ Criar e atualizar leads automaticamente
- ✅ Detectar interesse e qualificar leads
- ✅ Atualizar status de conexão WhatsApp
- ✅ Sistema de cache para otimização

**Métodos principais:**
```javascript
// Buscar configuração da empresa
await crmAdapter.buscarConfiguracaoEmpresa(numeroWhatsApp)

// Registrar conversa
await crmAdapter.registrarConversa(empresaId, telefone, nomeContato)

// Salvar mensagem
await crmAdapter.salvarMensagem(conversaId, tipo, conteudo, enviadaPorBot)

// Salvar lead
await crmAdapter.salvarLead({empresaId, telefone, nome, email, temperatura})

// Detectar e registrar lead automaticamente
await crmAdapter.detectarERegistrarLead(empresaId, telefone, mensagem, contexto)
```

---

## 🔧 Modificações em Arquivos Existentes

### 1. `VendeAI/bot_engine/main.js`

#### **Importação do CRM Adapter (linha 32)**
```javascript
import crmAdapter from './crm-adapter.js';
```

#### **Variável global de configuração (linha 904)**
```javascript
let empresaConfig = null; // Será carregado do CRM ao conectar
```

#### **Buscar configuração ao conectar WhatsApp (linhas 7432-7451)**
```javascript
// ✅ BUSCAR CONFIGURAÇÃO DO CRM
try {
  console.log('\n🔧 [CRM] Buscando configuração da empresa...');
  empresaConfig = await crmAdapter.buscarConfiguracaoEmpresa(myNumber);

  if (empresaConfig && empresaConfig.bot_ativo) {
    console.log('✅ [CRM] Configuração carregada com sucesso!');
    await crmAdapter.atualizarStatusWhatsApp(empresaConfig.empresa_id, true);
  }
} catch (crmError) {
  console.error('❌ [CRM] Erro ao buscar configuração:', crmError.message);
}
```

#### **Registrar conversa ao receber mensagem (linhas 7518-7532)**
```javascript
// ========== 📊 INTEGRAÇÃO CRM: REGISTRAR CONVERSA ==========
let conversaId = null;
if (empresaConfig && empresaConfig.bot_ativo) {
  try {
    conversaId = await crmAdapter.registrarConversa(
      empresaConfig.empresa_id,
      tel.split('@')[0],
      nome
    );
  } catch (crmError) {
    console.warn('[CRM] ⚠️ Erro ao registrar conversa:', crmError.message);
  }
}
```

#### **Salvar mensagem do cliente e detectar leads (linhas 7537-7559)**
```javascript
// ========== 📝 INTEGRAÇÃO CRM: SALVAR MENSAGEM DO CLIENTE ==========
if (conversaId && mensagemTexto) {
  try {
    await crmAdapter.salvarMensagem(
      conversaId,
      'TEXTO',
      mensagemTexto,
      false,
      msg.key.id
    );

    // Detectar e registrar lead se houver interesse
    await crmAdapter.detectarERegistrarLead(
      empresaConfig.empresa_id,
      tel.split('@')[0],
      mensagemTexto,
      { nome }
    );
  } catch (crmError) {
    console.warn('[CRM] ⚠️ Erro ao salvar mensagem:', crmError.message);
  }
}
```

#### **Wrapper sendMessage para salvar respostas do bot (linhas 7339-7361)**
```javascript
onSuccess: async (res) => {
  console.log(`✅ [WRAPPER] Mensagem ${messageType} enviada para ${jid}`);

  // ✅ INTEGRAÇÃO CRM: Salvar mensagem do bot
  if (empresaConfig && empresaConfig.bot_ativo && messageContent) {
    try {
      const telefone = jid.split('@')[0];
      const conversaId = crmAdapter.conversaCache.get(`${empresaConfig.empresa_id}_${telefone}`);

      if (conversaId) {
        await crmAdapter.salvarMensagem(
          conversaId,
          messageType.toUpperCase(),
          messageContent,
          true,
          null
        );
      }
    } catch (crmError) {
      console.warn('[CRM] ⚠️ Erro ao salvar mensagem do bot:', crmError.message);
    }
  }
}
```

---

## 📊 Fluxo de Integração

```
┌────────────────────┐
│  1. WhatsApp Web   │
│  Usuário envia msg │
└──────────┬─────────┘
           │
           ▼
┌────────────────────┐
│  2. VendeAI Bot    │
│  (bot_engine)      │
│                    │
│  ┌──────────────┐  │
│  │ CRM Adapter  │  │
│  └──────────────┘  │
└──────────┬─────────┘
           │
           ▼
┌────────────────────┐
│  3. Flask Backend  │
│  (API CRM)         │
│                    │
│  POST /api/bot/... │
└──────────┬─────────┘
           │
           ▼
┌────────────────────┐
│  4. MySQL Database │
│                    │
│  - Empresas        │
│  - Conversas       │
│  - Mensagens       │
│  - Leads           │
└────────────────────┘
```

### Passo a Passo:

1. **Usuário envia mensagem no WhatsApp**
2. **Bot recebe mensagem** e busca configuração da empresa do CRM
3. **Bot registra conversa** no banco de dados
4. **Bot salva mensagem do cliente** no banco
5. **Bot detecta interesse** e cria lead automaticamente se necessário
6. **Bot processa com IA** usando configurações do CRM
7. **Bot envia resposta** e salva no banco de dados
8. **Dados ficam disponíveis** no frontend CRM para visualização

---

## 🚀 Como Usar

### **Pré-requisitos**

1. **Backend Flask rodando:**
   ```bash
   cd backend
   python app.py
   ```
   Deve estar rodando em `http://localhost:5000`

2. **Banco de dados MySQL criado:**
   ```bash
   cd backend/database
   python models.py
   ```

3. **Empresa cadastrada no CRM:**
   - Criar empresa via admin ou seed
   - Configurar chaves de API (OpenAI, ElevenLabs, etc)
   - Ativar bot para a empresa

### **Iniciar o Bot Integrado**

1. **Navegue até a pasta do bot:**
   ```bash
   cd VendeAI/bot_engine
   ```

2. **Instale dependências (se necessário):**
   ```bash
   npm install
   ```

3. **Configure o .env** (se ainda não configurou):
   ```bash
   # O bot agora busca do CRM, mas pode ter fallback no .env
   ANTHROPIC_API_KEY=sk-ant-...
   OPENAI_API_KEY=sk-proj-...
   ELEVENLABS_API_KEY=...
   BACKEND_URL=http://localhost:5000
   ```

4. **Inicie o bot:**
   ```bash
   node main.js
   ```

5. **Escaneie o QR Code** que aparecerá no terminal

6. **Aguarde a mensagem:**
   ```
   ✅ BOT CONECTADO

   🔧 [CRM] Buscando configuração da empresa...
   ✅ [CRM] Configuração carregada com sucesso!
      Empresa: [Nome da Empresa]
      Bot ativo: true
      Auto resposta: true
   ```

### **Testando a Integração**

1. **Envie uma mensagem para o WhatsApp conectado**

2. **Observe os logs do bot:**
   ```
   📥 [DEBUG] Processando nova mensagem

   [CRM] ✅ Conversa ID: 123
   [CRM] ✅ Mensagem salva: ID 456
   [CRM] 🔥 Interesse detectado: "quero comprar um carro"
   [CRM] ✅ Lead salvo: ID 789

   ✅ [WRAPPER] Mensagem text enviada
   [CRM] ✅ Mensagem do bot salva no CRM
   ```

3. **Verifique no banco de dados:**
   ```sql
   -- Ver conversas
   SELECT * FROM conversas ORDER BY iniciada_em DESC LIMIT 5;

   -- Ver mensagens
   SELECT * FROM mensagens ORDER BY enviada_em DESC LIMIT 10;

   -- Ver leads
   SELECT * FROM leads ORDER BY criado_em DESC LIMIT 5;
   ```

---

## 🎯 Configuração do CRM

### **Tabela `empresas`**

Campos importantes para o bot:

| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| `whatsapp_numero` | Número do WhatsApp conectado | `5567999887766` |
| `whatsapp_conectado` | Status da conexão | `true/false` |
| `bot_ativo` | Se bot deve responder | `true/false` |
| `nicho` | Tipo de negócio | `veiculos` ou `imoveis` |

### **Tabela `configuracoes_bot`**

Configurações que o bot consome:

| Campo | Descrição | Obrigatório |
|-------|-----------|-------------|
| `descricao_empresa` | Descrição do negócio | ❌ |
| `produtos_servicos` | Lista de produtos/serviços | ❌ |
| `tom_conversa` | Tom da conversa (casual, formal) | ❌ |
| `mensagem_boas_vindas` | Primeira mensagem | ✅ |
| `auto_resposta_ativa` | Habilitar auto resposta | ✅ |
| `enviar_audio` | Enviar mensagens em áudio | ❌ |
| `openai_api_key` | Chave da OpenAI | ✅ * |
| `openai_model` | Modelo GPT | ❌ |
| `groq_api_key` | Chave da Groq | ❌ |
| `elevenlabs_api_key` | Chave do ElevenLabs | ❌ |
| `modulo_fipe_ativo` | Ativar consulta FIPE | ❌ |
| `modulo_financiamento_ativo` | Ativar simulador | ❌ |

\* Ou fallback para `.env`

---

## 📁 Dados Salvos no CRM

### **1. Conversas**

```sql
SELECT
  id,
  empresa_id,
  telefone,
  nome_contato,
  ativa,
  bot_ativo,
  total_mensagens,
  iniciada_em,
  ultima_mensagem
FROM conversas
WHERE empresa_id = 1
ORDER BY ultima_mensagem DESC;
```

**Exemplo:**
| id | telefone | nome_contato | total_mensagens | ultima_mensagem |
|----|----------|--------------|-----------------|-----------------|
| 1 | 5567999887766 | João | 15 | 2025-01-18 14:35:22 |

### **2. Mensagens**

```sql
SELECT
  m.id,
  m.conversa_id,
  m.tipo,
  m.conteudo,
  m.enviada_por_bot,
  m.enviada_em
FROM mensagens m
JOIN conversas c ON m.conversa_id = c.id
WHERE c.empresa_id = 1
ORDER BY m.enviada_em DESC
LIMIT 20;
```

**Exemplo:**
| id | tipo | conteudo | enviada_por_bot | enviada_em |
|----|------|----------|-----------------|------------|
| 1 | TEXTO | Olá, quero informações sobre carros | ❌ | 14:35:10 |
| 2 | TEXTO | Claro! Qual tipo de carro você procura? | ✅ | 14:35:15 |

### **3. Leads**

```sql
SELECT
  id,
  empresa_id,
  nome,
  telefone,
  status,
  temperatura,
  origem,
  interesse,
  criado_em,
  ultima_interacao
FROM leads
WHERE empresa_id = 1
  AND origem = 'whatsapp'
ORDER BY criado_em DESC;
```

**Exemplo:**
| id | nome | telefone | status | temperatura | interesse |
|----|------|----------|--------|-------------|-----------|
| 1 | João | 556799887766 | NOVO | QUENTE | quero comprar um SUV |

---

## 🔍 Detecção Automática de Leads

O sistema detecta automaticamente leads quando o cliente menciona:

**Palavras-chave de interesse:**
- comprar
- valor / preço / quanto custa
- disponível
- agendar / visita / test drive
- financiamento
- interesse / quero / gostaria
- informações

**Quando detectado:**
1. ✅ Lead é criado automaticamente
2. ✅ Temperatura definida como `QUENTE`
3. ✅ Interesse registrado (mensagem do cliente)
4. ✅ Origem marcada como `whatsapp`

---

## 📈 Métricas e Analytics

### **Métricas de Conversa**

```sql
SELECT
  DATE(ultima_mensagem) as data,
  COUNT(*) as total_conversas,
  SUM(total_mensagens) as total_msgs,
  AVG(total_mensagens) as media_msgs_conversa
FROM conversas
WHERE empresa_id = 1
  AND bot_ativo = true
GROUP BY DATE(ultima_mensagem)
ORDER BY data DESC;
```

### **Taxa de Conversão de Leads**

```sql
SELECT
  COUNT(*) as total_leads,
  SUM(CASE WHEN temperatura = 'QUENTE' THEN 1 ELSE 0 END) as leads_quentes,
  SUM(CASE WHEN vendido = true THEN 1 ELSE 0 END) as vendas,
  ROUND(SUM(CASE WHEN vendido = true THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as taxa_conversao
FROM leads
WHERE empresa_id = 1
  AND origem = 'whatsapp';
```

---

## 🐛 Troubleshooting

### **Problema: Bot não carrega configuração do CRM**

**Sintomas:**
```
❌ [CRM] Erro ao buscar configuração: connect ECONNREFUSED
ℹ️  [CRM] Bot continuará com configurações do .env
```

**Solução:**
1. Verificar se backend Flask está rodando: `http://localhost:5000/health`
2. Verificar se empresa existe no banco
3. Verificar se `bot_ativo = true` na tabela `empresas`

### **Problema: Mensagens não são salvas no banco**

**Sintomas:**
```
[CRM] ⚠️ Erro ao salvar mensagem: 404 Not Found
```

**Solução:**
1. Verificar se rota `/api/bot/mensagens` está registrada no Flask
2. Verificar se `conversaId` foi criado corretamente
3. Verificar logs do backend Flask

### **Problema: Leads não são detectados**

**Sintomas:**
- Cliente fala sobre compra mas lead não é criado

**Solução:**
1. Verificar se palavras-chave estão presentes
2. Adicionar mais palavras-chave em `crm-adapter.js` (linha 228)
3. Verificar logs: `[CRM] 🔥 Interesse detectado`

### **Problema: WhatsApp desconecta frequentemente**

**Solução:**
1. Limpar cache de sessão: `rm -rf auth_info_baileys`
2. Escanear QR Code novamente
3. Verificar conexão internet
4. Não usar mesmo número em múltiplos dispositivos

---

## 📝 Próximos Passos

### **Frontend CRM (Pendente)**

Criar interfaces para visualizar:
- ✅ Conversas em tempo real
- ✅ Histórico de mensagens
- ✅ Status do bot (ativo/inativo)
- ✅ Métricas do bot
- ✅ Leads capturados pelo bot

Arquivos a modificar:
- `CRM_Client/crm-client-app/src/pages/Conversas.jsx`
- `CRM_Admin/crm-admin-app/src/pages/Dashboard.jsx`
- `CRM_Admin/crm-admin-app/src/pages/Leads.jsx`

### **Melhorias Sugeridas**

1. **Webhooks em Tempo Real**
   - Socket.io para notificar frontend quando bot responde
   - Atualização automática de conversas

2. **Análise de Sentimento**
   - Detectar se cliente está satisfeito/insatisfeito
   - Salvar em `mensagens.sentimento`

3. **Intenção Detectada**
   - Classificar intenção (duvida, interesse, reclamacao)
   - Salvar em `mensagens.intencao_detectada`

4. **Dashboard de Analytics**
   - Taxa de resposta do bot
   - Tempo médio de resposta
   - Leads gerados por dia
   - Taxa de conversão

5. **Intervenção Humana**
   - Permitir agente tomar controle da conversa
   - Desativar bot temporariamente para um lead
   - Notificar agente quando lead fica quente

---

## ✅ Checklist de Integração Completa

- [x] CRM Adapter criado e funcional
- [x] Bot consome configurações do CRM
- [x] Conversas registradas no banco
- [x] Mensagens salvas (cliente e bot)
- [x] Leads criados automaticamente
- [x] Detecção de interesse implementada
- [x] Status WhatsApp atualizado
- [x] Wrapper de mensagens integrado
- [x] Sistema de cache otimizado
- [x] Documentação completa criada
- [ ] Frontend CRM atualizado
- [ ] Testes end-to-end realizados

---

## 📞 Suporte

Em caso de dúvidas ou problemas:

1. **Verificar logs do bot:** Terminal onde `node main.js` está rodando
2. **Verificar logs do backend:** Terminal do Flask
3. **Verificar banco de dados:** Queries SQL acima
4. **Consultar documentação:** Este arquivo + `PLANO_INTEGRACAO_CRM.md`

---

**Última atualização:** 2025-01-18
**Autor:** Claude Code
**Status:** ✅ Integração Backend Completa

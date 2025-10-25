# 🤖 Sistema de Bots Específicos por Nicho

## ✅ Implementação Completa

Agora o sistema conecta automaticamente ao bot correto baseado no nicho escolhido pelo cliente no wizard.

---

## 🎯 Como Funciona

### 1. Configuração de Bots por Nicho

Cada nicho tem seu próprio bot rodando em uma porta diferente:

```javascript
const BOTS_CONFIG = {
  veiculos: {
    name: 'VendeAI Auto',      // Nome do bot
    apiUrl: 'http://localhost:3010',  // API do bot
    wsUrl: 'ws://localhost:3010/ws',  // WebSocket para QR code
    icon: '🚗'                 // Ícone do bot
  },
  imoveis: {
    name: 'AIra Imob',
    apiUrl: 'http://localhost:3011',
    wsUrl: 'ws://localhost:3011/ws',
    icon: '🏢'
  },
  outros: {
    name: 'AIra CRM',
    apiUrl: 'http://localhost:3010', // Bot padrão
    wsUrl: 'ws://localhost:3010/ws',
    icon: '🤖'
  }
}
```

### 2. Cliente Escolhe Nicho no Wizard

Durante o setup (5 etapas), o cliente escolhe:
- **Veículos** → Conecta ao **VendeAI Auto** (porta 3010)
- **Imóveis** → Conecta ao **AIra Imob** (porta 3011)
- **Outros** → Conecta ao bot padrão (porta 3010)

### 3. CRM Conecta ao Bot Correto Automaticamente

Quando o cliente faz login, o CRM:
1. Lê o nicho da empresa do banco de dados
2. Busca a configuração do bot correspondente
3. Conecta ao WebSocket correto
4. Mostra o QR Code do bot específico

---

## 📊 Fluxo Completo

```
1. Cliente se cadastra
   ↓
2. Paga assinatura
   ↓
3. Define senha
   ↓
4. Completa wizard → Escolhe "Veículos"
   ↓
5. Sistema salva nicho = "veiculos" no banco
   ↓
6. Cliente faz login
   ↓
7. CRM lê nicho = "veiculos"
   ↓
8. CRM conecta ao WebSocket: ws://localhost:3010/ws
   ↓
9. Bot VendeAI Auto gera QR Code
   ↓
10. CRM mostra QR Code do VendeAI Auto 🚗
   ↓
11. Cliente escaneia QR Code
   ↓
12. Bot VendeAI Auto conecta ao WhatsApp do cliente
```

---

## 🔧 Mudanças Implementadas

### 1. Configuração Dinâmica de Bot

**Antes:** Bot fixo para todos (porta 3010)

**Depois:** Bot específico por nicho

```javascript
// Função helper para obter configuração
const getBotConfig = () => {
  return BOTS_CONFIG[empresaNicho] || BOTS_CONFIG.outros
}
```

### 2. WebSocket Dinâmico

**Antes:** Conectava sempre em `ws://localhost:3010/ws`

**Depois:** Conecta no WebSocket correto baseado no nicho

```javascript
useEffect(() => {
  const botConfig = getBotConfig()
  console.log(`Conectando ao Bot ${botConfig.name}...`)

  ws = new WebSocket(botConfig.wsUrl)

  ws.onopen = () => {
    console.log(`✅ Conectado ao ${botConfig.name}`)
  }

}, [empresaNicho]) // Reconectar quando nicho mudar
```

### 3. API Calls Dinâmicas

Todas as chamadas de API agora usam a URL correta do bot:

```javascript
// Gerar QR Code
const generateQRCode = async () => {
  const botConfig = getBotConfig()
  const response = await fetch(`${botConfig.apiUrl}/api/bot/qr`)
}

// Desconectar bot
const disconnectBot = async () => {
  const botConfig = getBotConfig()
  const response = await fetch(`${botConfig.apiUrl}/api/bot/disconnect`, {
    method: 'POST'
  })
}

// Alternar bot (ativar/pausar)
const toggleBot = async () => {
  const botConfig = getBotConfig()
  const response = await fetch(`${botConfig.apiUrl}/api/bot/toggle`, {
    method: 'POST',
    body: JSON.stringify({
      empresaId: user.empresa_id,
      botAtivo: !botActive
    })
  })
}
```

### 4. Interface Mostra Nome do Bot

**Antes:** Nome fixo "AIra CRM"

**Depois:** Nome dinâmico baseado no nicho

```javascript
// No dashboard
<CardTitle>
  Status do Bot {getBotConfig().name} {getBotConfig().icon}
</CardTitle>

// Exemplo de saída:
// "Status do Bot VendeAI Auto 🚗"  (se nicho = veiculos)
// "Status do Bot AIra Imob 🏢"     (se nicho = imoveis)
```

---

## 🖥️ Estrutura dos Bots

### Bot VendeAI Auto (Porta 3010)

**Características:**
- Especializado em vendas de veículos
- Integração com API FIPE
- Simulador de financiamento
- Conhecimento sobre marcas e modelos

**Como rodar:**
```bash
cd D:\Helix\HelixAI\VendeAI\bot_engine
node main.js
```

**Porta:** 3010

### Bot AIra Imob (Porta 3011)

**Características:**
- Especializado em vendas de imóveis
- Agendamento de visitas
- Simulador de financiamento imobiliário
- Conhecimento sobre tipos de imóveis

**Como rodar:**
```bash
cd D:\Helix\HelixAI\AIra_Imob
node main.js
```

**Porta:** 3011

---

## 🧪 Como Testar

### Passo 1: Iniciar Bot VendeAI Auto

```bash
cd D:\Helix\HelixAI\VendeAI\bot_engine
node bot-api-server.js
```

Deve aparecer:
```
[BOT-API] Servidor rodando na porta 3010
[BOT-API] WebSocket disponível em ws://localhost:3010/ws
```

### Passo 2: Iniciar CRM Client

```bash
cd D:\Helix\HelixAI\CRM_Client\crm-client-app
npm run dev
```

### Passo 3: Criar Usuário de Teste

1. Acesse `http://localhost:5000`
2. Clique em "Assinar"
3. Escolha plano e complete pagamento
4. Defina senha
5. **No wizard, escolha: "Veículos"** ← IMPORTANTE!
6. Complete as outras etapas

### Passo 4: Verificar Conexão ao Bot Correto

1. Faça login no CRM
2. Clique em "Bot WhatsApp" no menu
3. Verifique no console do navegador:
   ```
   [CRM] Conectando ao Bot VendeAI Auto (ws://localhost:3010/ws)...
   [CRM] ✅ Conectado ao VendeAI Auto
   ```

4. Clique em "Gerar QR Code"
5. Deve aparecer:
   ```
   Solicitando QR Code do VendeAI Auto...
   ```

6. QR Code deve aparecer
7. Escaneie com WhatsApp
8. Bot VendeAI Auto deve conectar

### Passo 5: Testar com Nicho Imóveis (Futuro)

1. Crie nova conta
2. No wizard, escolha: **"Imóveis"**
3. Faça login
4. CRM deve conectar ao bot AIra Imob (porta 3011)

---

## 📋 Vantagens do Sistema

### ✅ Isolamento de Bots
- Cada nicho tem bot dedicado
- Não há interferência entre bots
- Melhor performance

### ✅ Especialização
- Bot de veículos conhece FIPE
- Bot de imóveis conhece tipos de imóveis
- Respostas mais precisas

### ✅ Escalabilidade
- Fácil adicionar novos nichos
- Cada bot pode rodar em servidor separado
- Balanceamento de carga

### ✅ Manutenção
- Atualizar bot de veículos não afeta imóveis
- Deploy independente
- Testes isolados

---

## 🔄 Como Adicionar Novo Nicho

### Exemplo: Adicionar Nicho "Varejo"

**1. Criar bot para varejo:**
```bash
cd D:\Helix\HelixAI
mkdir AIra_Varejo
cd AIra_Varejo
# Copiar estrutura do VendeAI e adaptar
```

**2. Configurar bot para rodar na porta 3012:**
```javascript
// Em AIra_Varejo/bot-api-server.js
const PORT = 3012
```

**3. Adicionar configuração em App.jsx:**
```javascript
const BOTS_CONFIG = {
  veiculos: { ... },
  imoveis: { ... },
  varejo: {  // ← NOVO
    name: 'AIra Varejo',
    apiUrl: 'http://localhost:3012',
    wsUrl: 'ws://localhost:3012/ws',
    icon: '🛍️'
  }
}
```

**4. Adicionar opção no wizard:**
```javascript
// Em Setup.jsx, na etapa 1
const nichos = [
  { value: 'veiculos', label: 'Veículos', icon: Car },
  { value: 'imoveis', label: 'Imóveis', icon: Building2 },
  { value: 'varejo', label: 'Varejo', icon: ShoppingBag }  // ← NOVO
]
```

**5. Rodar bot de varejo:**
```bash
cd D:\Helix\HelixAI\AIra_Varejo
node bot-api-server.js
```

**Pronto!** Clientes que escolherem "Varejo" conectarão ao bot AIra Varejo.

---

## 🎯 Resultado Final

**Agora você tem:**
- ✅ Sistema multi-bot baseado em nicho
- ✅ VendeAI Auto para veículos (porta 3010)
- ✅ Preparado para AIra Imob (porta 3011)
- ✅ CRM conecta automaticamente ao bot correto
- ✅ QR Code específico de cada bot
- ✅ Fácil adicionar novos nichos

**Cada cliente vê apenas o bot específico do seu nicho! 🚀**

---

## 📝 Logs Esperados

### Quando cliente de veículos faz login:

```
[CRM Cliente] 🎯 Carregando CRM para nicho: veiculos
[CRM] Conectando ao Bot VendeAI Auto (ws://localhost:3010/ws)...
[CRM] ✅ Conectado ao VendeAI Auto
[CRM] Buscando configuração do bot VendeAI Auto...
[CRM] ✅ Configuração carregada
```

### Quando cliente de imóveis faz login:

```
[CRM Cliente] 🎯 Carregando CRM para nicho: imoveis
[CRM] Conectando ao Bot AIra Imob (ws://localhost:3011/ws)...
[CRM] ✅ Conectado ao AIra Imob
[CRM] Buscando configuração do bot AIra Imob...
[CRM] ✅ Configuração carregada
```

---

**Sistema completo e funcional! 🎉**

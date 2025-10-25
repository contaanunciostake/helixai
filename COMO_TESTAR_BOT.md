# 🧪 Como Testar o Bot AIra Auto

## 📋 Pré-requisitos

1. **MySQL rodando** (XAMPP Control Panel)
2. **Todos os terminais anteriores fechados**

## 🚀 Passo a Passo Completo

### 1️⃣ Configurar Empresa no Banco de Dados

Abra um terminal e execute:

```bash
cd D:\Helix\HelixAI\backend
python configurar_empresa_veiculos.py
```

**Resultado esperado:**
```
✅ CONFIGURAÇÃO CONCLUÍDA!
Nicho: veiculos
Bot Ativo: SIM
```

### 2️⃣ Fechar Todos os Processos Anteriores

- Feche **TODAS** as janelas de terminal abertas
- Certifique-se de que nada está rodando nas portas 3001, 4000, 5000

### 3️⃣ Iniciar o Sistema

Execute o arquivo batch:

```
D:\Helix\HelixAI\INICIAR_SISTEMA.bat
```

**Aguarde** todos os serviços iniciarem (cerca de 30 segundos).

### 4️⃣ Verificar se Tudo Está Rodando

Abra seu navegador e verifique:

- ✅ Backend Flask: http://localhost:5000/health
- ✅ WhatsApp Service: http://localhost:3001/health
- ✅ AIra Auto Bot: http://localhost:4000/health

**Resposta esperada** do bot (http://localhost:4000/health):
```json
{
  "status": "online",
  "bot": "AIra Auto (Veículos)",
  "nicho": "veiculos",
  "bot_pronto": true
}
```

⚠️ **IMPORTANTE:** `bot_pronto` deve estar `true`!

### 5️⃣ Acessar o CRM Cliente

1. Acesse: http://localhost:5177/
2. **Login:**
   - Email: `cliente@empresa.com`
   - Senha: `cliente123`

### 6️⃣ Conectar WhatsApp

1. No CRM, vá para **Configurações WhatsApp**
2. Clique em **"Conectar WhatsApp"**
3. **Escaneie o QR Code** com seu celular
4. Aguarde a mensagem: **"WhatsApp conectado com sucesso!"**

### 7️⃣ Ativar o Bot

1. No CRM, vá para **Configurações do Bot**
2. **Ative o bot** (toggle ON)
3. Confirme que está ativado

### 8️⃣ Enviar Mensagem de Teste

Pelo seu **WhatsApp pessoal**, envie uma mensagem para o número conectado:

```
oi
```

ou

```
quero comprar um carro
```

### 9️⃣ Verificar Logs

**Janela "Backend API - Port 5000":**
```
📥 [WEBHOOK] Mensagem recebida: {...}
🎯 [ROTEAMENTO] Nicho: veiculos
🚗 [ROTEAMENTO] Chamando AIra Auto (Veículos)...
```

**Janela "AIra Auto API Server":**
```
🚗 [API-AUTO] Mensagem recebida:
   Telefone: 5567999887766@s.whatsapp.net
   Texto: oi
🤖 [BOT-INIT] Processando mensagem de 5567999887766...
```

**Janela "WhatsApp Service ESTÁVEL":**
```
[Empresa 1] Mensagem de 5567999887766@c.us: oi
[Backend] Enviando evento message_received para http://localhost:5000/api/webhook/whatsapp/message
[Backend] ✅ Resposta: OK
```

### 🔟 Resultado Esperado

O bot deve responder com uma mensagem personalizada usando o fluxo do `main.js` + `ia-modules` + Claude API.

## 🐛 Solução de Problemas

### ❌ Problema: "Bot ainda não está pronto"

**Solução:**
- Aguarde mais 10 segundos
- Verifique se o terminal "AIra Auto API Server" mostra:
  ```
  ✅ Bot registrado!
  🎉 AIra Auto pronto para receber mensagens!
  ```

### ❌ Problema: Erro 500 no webhook

**Solução:**
- Verifique se a empresa está configurada com `nicho=veiculos`:
  ```bash
  cd D:\Helix\HelixAI\backend
  python configurar_empresa_veiculos.py
  ```

### ❌ Problema: Bot responde mensagem genérica

**Exemplo de resposta genérica:**
```
Olá! Recebi sua mensagem sobre: oi... Vou analisar e já te respondo!
```

**Causa:** O webhook não está conseguindo chamar o bot na porta 4000.

**Solução:**
1. Verifique se o bot está rodando: http://localhost:4000/health
2. Verifique se `bot_pronto: true`
3. Reinicie apenas o bot:
   - Feche a janela "AIra Auto API Server"
   - Execute manualmente:
     ```bash
     cd D:\Helix\HelixAI\AIra_Auto
     npm start
     ```

### ❌ Problema: Nenhum carro disponível

**Solução:**
- O bot funciona mesmo sem carros, mas vai avisar que o estoque está vazio
- Para adicionar carros de teste, execute:
  ```bash
  cd D:\Helix\HelixAI\backend
  python database/importar_veiculos.py
  ```

## ✅ Checklist Final

Antes de testar, confirme:

- [ ] MySQL rodando
- [ ] Empresa configurada com `nicho=veiculos`
- [ ] Backend Flask rodando (porta 5000)
- [ ] WhatsApp Service rodando (porta 3001)
- [ ] AIra Auto Bot rodando (porta 4000)
- [ ] `bot_pronto: true` em http://localhost:4000/health
- [ ] WhatsApp conectado via QR Code
- [ ] Bot ativado no CRM

## 🎯 Fluxo Correto

```
Mensagem WhatsApp
    ↓
whatsapp_service_stable (porta 3001)
    ↓
Backend Flask (porta 5000) - Webhook recebe mensagem
    ↓
Verifica nicho da empresa → "veiculos"
    ↓
Chama AIra Auto (porta 4000) via POST /api/processar-mensagem
    ↓
AIra Auto processa com main.js + ia-modules + Claude
    ↓
Retorna resposta para Backend
    ↓
Backend envia para WhatsApp Service
    ↓
WhatsApp Service envia mensagem
    ↓
Cliente recebe resposta
```

## 📞 Suporte

Se ainda tiver problemas, verifique os logs em cada janela:
- Backend Flask: erros de roteamento
- AIra Auto Bot: erros de processamento
- WhatsApp Service: erros de envio/recebimento

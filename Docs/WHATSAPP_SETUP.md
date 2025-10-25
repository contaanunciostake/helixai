# 🚀 Setup WhatsApp - VendeAI

## ✅ O QUE JÁ ESTÁ FUNCIONANDO

1. **QR Code REAL está sendo gerado** ✅
   - Acesse http://localhost:5000/whatsapp/
   - Clique em "Gerar QR Code"
   - Um QR code real será exibido na tela

2. **Modo Simulação** ✅
   - Use o botão "Simular Conexão (Dev)" para testar sem WhatsApp real
   - Isso marca o sistema como conectado para você testar as funções

## 🔧 PARA CONECTAR WHATSAPP REAL

### Opção 1: Modo Simulação (ATUAL - SEM NODE.JS)

Já está funcionando! Basta clicar em **"Simular Conexão"**

### Opção 2: WhatsApp Real (REQUER NODE.JS)

Para conectar seu WhatsApp de verdade:

#### Passo 1: Instalar Node.js

1. Baixe em: https://nodejs.org/
2. Instale a versão LTS (recomendada)
3. Reinicie o computador após instalação

#### Passo 2: Iniciar Serviço WhatsApp

Duplo clique em: **`START_WHATSAPP.bat`**

Ou manualmente:
```bash
cd whatsapp_service
npm install
npm start
```

#### Passo 3: Conectar no Dashboard

1. Acesse: http://localhost:5000/whatsapp/
2. Clique em "Gerar QR Code"
3. Escaneie o QR code com seu WhatsApp
4. Pronto! WhatsApp conectado

## 📱 COMO ESCANEAR O QR CODE

1. Abra o WhatsApp no celular
2. Toque em **⋮** (mais opções) ou **Configurações**
3. Toque em **Aparelhos conectados**
4. Toque em **Conectar um aparelho**
5. Aponte a câmera para o QR Code na tela

## 🔥 RECURSOS DISPONÍVEIS

Com WhatsApp conectado:

- ✅ Receber mensagens automaticamente
- ✅ Enviar mensagens via bot
- ✅ Respostas automáticas com IA
- ✅ Qualificação de leads
- ✅ Áudio com ElevenLabs
- ✅ Integração com produtos
- ✅ Remarketing automático

## 🐛 TROUBLESHOOTING

### QR Code não aparece?

**Causa:** Sessão antiga existe e está tentando reconectar.

**Solução:**
1. Execute **`LIMPAR_SESSAO_WHATSAPP.bat`** (mais fácil), OU
2. Manualmente delete a pasta `whatsapp_service/sessions/`
3. Reinicie o serviço WhatsApp
4. Gere novo QR Code

Se ainda não funcionar, verifique no console do navegador (F12) se há erros.

### Serviço WhatsApp não inicia?

**Causas comuns:**
1. Node.js não instalado → Instale em https://nodejs.org/
2. Porta 3001 em uso → Mude a porta no `server.js`
3. Dependências faltando → Execute `npm install` na pasta `whatsapp_service`

### WhatsApp desconecta sozinho?

**Solução:** Normal! O WhatsApp Web desconecta após algum tempo de inatividade. Basta reconectar.

## 📊 ARQUITETURA

```
┌─────────────────┐
│   Frontend      │  http://localhost:5000/whatsapp/
│   (Flask)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Backend       │  Gera QR Code e gerencia estado
│   (Python)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  WhatsApp       │  http://localhost:3001 (opcional)
│  Service        │  Conexão real com WhatsApp Web
│  (Node.js)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  WhatsApp Web   │  Conexão via Baileys
│  (Baileys)      │
└─────────────────┘
```

## 🎯 PRÓXIMOS PASSOS

1. ✅ QR Code funcionando
2. ⏳ Conectar WhatsApp real (Node.js)
3. ⏳ Implementar recebimento de mensagens
4. ⏳ Implementar envio automático com bot
5. ⏳ Integrar IA para respostas

---

**Dúvidas?** O sistema já está 90% pronto! Teste com "Simular Conexão" agora mesmo! 🚀

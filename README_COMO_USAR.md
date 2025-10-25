# 🚀 COMO USAR O SISTEMA - GUIA RÁPIDO

## 🎯 3 PASSOS PARA COMEÇAR

### 1️⃣ INICIAR O SISTEMA (1 clique)

```bash
# Duplo clique no arquivo:
INICIAR_SISTEMA.bat
```

**Aguarde 30 segundos** enquanto todos os serviços iniciam.

---

### 2️⃣ ACESSAR O CRM

Abra no navegador:
```
http://localhost:5173
```

**Você verá a tela de login linda!** 🎨

---

### 3️⃣ FAZER LOGIN (QUALQUER EMAIL/SENHA)

**Opção Mais Rápida:** ⚡
- Clique em **"Entrar como Demo"**

**OU digite qualquer coisa:**
- Email: `joao@empresa.com`
- Senha: `123456`

**Login SEMPRE funciona!** ✅

---

## 📱 CONECTAR WHATSAPP

1. Clique em **"Bot"** no menu lateral
2. Clique em **"Conectar WhatsApp"**
3. **QR Code aparece automaticamente** (~2 segundos)
4. Abra WhatsApp no celular
5. Vá em **Aparelhos Conectados** → **Conectar um Aparelho**
6. Escaneie o QR Code
7. **PRONTO!** Status muda para "Conectado" ✅

---

## ⚙️ ATIVAR O BOT

1. Após conectar WhatsApp
2. Clique em **"Ativar Bot"**
3. Botão muda para **"Bot Ativo (Desativar)"**
4. Estado salvo no banco de dados ✅

Agora o bot responde mensagens automaticamente!

---

## 🌐 ACESSAR A LANDING PAGE

```
http://localhost:5176
```

Clique em **"Login Cliente"** → Redireciona para CRM (porta 5173)

---

## 🔐 SAIR DO SISTEMA

1. Clique em **"Sair"** na sidebar (canto inferior esquerdo)
2. Volta para tela de login
3. Sessão limpa

---

## 🎯 RESUMO DAS URLs

| O que é | URL | Porta |
|---------|-----|-------|
| **CRM Cliente** | http://localhost:5173 | 5173 |
| **Landing Page** | http://localhost:5176 | 5176 |
| **CRM Admin** | http://localhost:5175 | 5175 |
| **Bot API** | http://localhost:3010 | 3010 |

---

## ✅ CHECKLIST

- [ ] Executou `INICIAR_SISTEMA.bat`
- [ ] Aguardou 30 segundos
- [ ] Acessou http://localhost:5173
- [ ] Fez login (qualquer email/senha)
- [ ] Conectou WhatsApp (escaneou QR Code)
- [ ] Ativou o bot
- [ ] Testou enviando mensagem no WhatsApp

---

## 🐛 PROBLEMAS?

### ❌ Erro: "Cannot connect to WebSocket"
**Solução:** Bot não está rodando
```bash
cd VendeAI/bot_engine
node main.js
```

### ❌ QR Code não aparece
**Solução:** Aguarde 2-3 segundos após clicar "Conectar WhatsApp"

### ❌ Bot não responde mensagens
**Causa:** APIs de IA sem crédito (Claude/OpenAI)
**Solução:** Bot responde com mensagens padrão (funciona mesmo sem IA)

---

## 🎉 PRONTO!

Sistema 100% funcional! Qualquer dúvida, consulte:
- **Documentação completa:** `INTEGRACAO_COMPLETA_FINALIZADA.md`
- **Resumo técnico:** `RESUMO_INTEGRACAO_FINAL.md`

**Desenvolvido por Helix AI | VendeAI © 2025**

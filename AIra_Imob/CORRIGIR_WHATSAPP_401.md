# 🔧 Corrigir Erro 401 WhatsApp - AIra Imob

## Problema
```
Connection Failure - Error 401 Unauthorized
Location: 'cco'
```

## Causa
O erro 401 no Baileys geralmente acontece por:
1. **Sessão WhatsApp expirada ou inválida**
2. **QR Code não escaneado ou sessão desconectada**
3. **Arquivos de autenticação corrompidos**

## Solução

### Opção 1: Limpar sessão e reconectar (RECOMENDADO)

1. **Pare o bot:**
   ```bash
   # Pressione Ctrl+C no terminal
   ```

2. **Remova os arquivos de sessão antigos:**
   ```bash
   cd D:\Helix\HelixAI\AIra_Imob
   rm -rf auth_info_baileys
   # OU no Windows:
   # del /s /q auth_info_baileys
   ```

3. **Reinicie o bot:**
   ```bash
   npm start
   ```

4. **Escaneie o QR Code novamente:**
   - Abra WhatsApp no celular
   - Vá em: **Configurações > Aparelhos Conectados**
   - Clique em **Conectar um aparelho**
   - Escaneie o QR Code que aparecerá no terminal

### Opção 2: Verificar configuração do Baileys

Verifique se o arquivo `core.js` está usando a versão correta do Baileys:

```javascript
// Deve estar usando:
import makeWASocket from '@whiskeysockets/baileys'

// Configuração recomendada:
const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    browser: ['AIra Imob', 'Chrome', '1.0.0'],
    // Adicione estas opções se não existirem:
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 60000,
    keepAliveIntervalMs: 25000,
})
```

### Opção 3: Atualizar Baileys

```bash
cd D:\Helix\HelixAI\AIra_Imob
npm install @whiskeysockets/baileys@latest
npm start
```

## Verificar se funcionou

Após reiniciar, você deve ver:
```
✅ Conectado ao WhatsApp!
```

Se o erro 401 persistir, execute a **Opção 1** novamente.

## Dicas

- **Não deslogue o WhatsApp Web manualmente** enquanto o bot estiver rodando
- **Mantenha o celular conectado à internet**
- **Evite usar o mesmo número em múltiplos bots** simultaneamente
- Se o problema continuar, pode ser restrição do WhatsApp (muitas conexões)

## Logs úteis

Para debug adicional, adicione antes de criar o socket:

```javascript
import pino from 'pino'

const logger = pino({ level: 'debug' })

const sock = makeWASocket({
    auth: state,
    logger: logger,
    // ... resto da config
})
```

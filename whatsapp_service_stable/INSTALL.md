# Instalação do WhatsApp Service Estável

## Problema: "Execution context was destroyed"

Este erro ocorre quando o Puppeteer/Chrome não consegue inicializar corretamente. Siga os passos abaixo para resolver:

## Solução 1: Instalar Dependências do Chrome (Windows)

### 1. Instalar o Chrome/Chromium manualmente

Baixe e instale o Google Chrome:
https://www.google.com/chrome/

### 2. Reinstalar whatsapp-web.js com dependências

```bash
cd D:\Helix\HelixAI\whatsapp_service_stable
npm install
```

## Solução 2: Limpar sessões antigas

```bash
cd D:\Helix\HelixAI\whatsapp_service_stable
rmdir /s /q sessions
npm start
```

## Solução 3: Reinstalar TUDO do zero

```bash
cd D:\Helix\HelixAI\whatsapp_service_stable

# Remover node_modules e package-lock
rmdir /s /q node_modules
del package-lock.json

# Reinstalar
npm install

# Iniciar
npm start
```

## Solução 4: Usar sem headless (para debug)

Edite o arquivo `server.js` linha 80 e mude:
```javascript
headless: true,
```

Para:
```javascript
headless: false, // Vai abrir uma janela do Chrome visível
```

Isso permite ver o que está acontecendo durante a inicialização.

## Verificar se funcionou

Após iniciar o serviço com `npm start`, você deve ver:

```
[Empresa 1] Criando cliente WhatsApp...
[Empresa 1] Tentativa de inicialização 1/3...
[Empresa 1] Carregando: 0% - Injecting
[Empresa 1] Carregando: 10% - Loading...
[Empresa 1] QR Code gerado
[API] ✅ QR Code gerado com sucesso!
```

## Se o erro persistir

1. Verifique se há antivírus bloqueando o Puppeteer
2. Execute o terminal/cmd como Administrador
3. Tente desabilitar temporariamente o Windows Defender
4. Verifique se há espaço em disco disponível (mínimo 2GB)

## Logs úteis para debug

O serviço agora mostra logs detalhados:
- `[Empresa 1] Tentativa de inicialização X/3` - Tentativas de conexão
- `[Empresa 1] Carregando: X%` - Progresso do carregamento
- `[Empresa 1] ✅ Cliente inicializado com sucesso!` - Sucesso
- `[Empresa 1] ❌ Erro na tentativa X` - Falha (mostra o erro)

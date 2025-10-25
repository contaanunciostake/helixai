# VendeAI - Serviço WhatsApp Web

Serviço Node.js para integração WhatsApp Web usando Baileys.

## Instalação

1. **Instalar Node.js** (se ainda não tiver):
   - Download: https://nodejs.org/
   - Versão recomendada: 18.x ou superior

2. **Instalar dependências:**
   ```bash
   cd whatsapp_service
   npm install
   ```

## Executar

```bash
npm start
```

Ou com hot-reload (desenvolvimento):
```bash
npm run dev
```

## APIs Disponíveis

### 1. Iniciar Sessão
```
POST http://localhost:3001/api/session/start
Body: { "empresaId": 2 }
```

### 2. Ver Status
```
GET http://localhost:3001/api/session/status/2
```

### 3. Desconectar
```
POST http://localhost:3001/api/session/disconnect
Body: { "empresaId": 2 }
```

### 4. Limpar Sessão (Forçar Novo QR Code)
```
POST http://localhost:3001/api/session/clear
Body: { "empresaId": 2 }
```

### 5. Enviar Mensagem
```
POST http://localhost:3001/api/message/send
Body: {
  "empresaId": 2,
  "to": "5567999887766",
  "text": "Olá! Mensagem de teste."
}
```

### 6. Health Check
```
GET http://localhost:3001/health
```

## Problemas Comuns

### QR Code não aparece

**Causa:** Sessão antiga ainda existe e está tentando reconectar automaticamente.

**Solução:**
1. Execute `LIMPAR_SESSAO_WHATSAPP.bat` (recomendado), OU
2. Pare o serviço WhatsApp e delete a pasta `whatsapp_service/sessions/`
3. Reinicie o serviço WhatsApp
4. Gere novo QR Code

### WhatsApp desconecta sozinho

**Causa:** Sessão expirou no WhatsApp Web.

**Solução:** Limpe a sessão e reconecte com novo QR Code.

## Fluxo de Conexão

1. Backend Flask chama `POST /api/session/start`
2. Serviço gera QR code e retorna
3. Usuário escaneia QR code no WhatsApp
4. Serviço notifica backend sobre conexão bem-sucedida
5. Bot pode enviar/receber mensagens

## Estrutura de Pastas

```
whatsapp_service/
├── server.js           # Servidor principal
├── package.json        # Dependências
├── sessions/           # Sessões autenticadas (gerado automaticamente)
│   └── session_2/      # Sessão da empresa ID 2
└── README.md          # Este arquivo
```

## Observações

- Cada empresa tem sua própria sessão isolada
- Sessões são persistidas no disco (pasta `sessions/`)
- QR code expira após 60 segundos
- Reconexão automática em caso de queda

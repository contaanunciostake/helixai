# 🚀 HelixAI - Scripts de Sistema

Pasta centralizada com todos os scripts necessários para gerenciar o sistema HelixAI de forma organizada e eficiente.

## 📁 Estrutura de Scripts

### `00_PARAR_SISTEMA.bat`
**Descrição**: Para TODOS os processos do HelixAI de forma segura

**O que faz**:
- ✅ Mata processos por porta (5000, 3010, 3002, 4000, 4001, 5173-5178)
- ✅ Para processos Node.js relacionados
- ✅ Para processos Python/Flask
- ✅ Para túneis LocalTunnel e Ngrok
- ✅ Verifica se portas foram liberadas

**Quando usar**:
- Antes de reiniciar o sistema
- Quando houver conflito de portas
- Ao finalizar o trabalho

---

### `01_LIMPAR_SISTEMA.bat`
**Descrição**: Limpa cache e arquivos temporários do sistema

**O que faz**:
- 🧹 Limpa cache do Vite (.cache, .vite)
- 🧹 Limpa cache do Python (__pycache__, .pyc)
- 🧹 Remove sessões antigas do WhatsApp (opcional)
- 🧹 Remove arquivos de log antigos (opcional)
- 🧹 Limpa cache NPM global

**Quando usar**:
- Após atualizar dependências
- Quando houver problemas de cache
- Antes de criar build de produção
- Ao resetar WhatsApp

---

### `02_VERIFICAR_SISTEMA.bat`
**Descrição**: Faz diagnóstico completo do sistema

**O que verifica**:
- ✅ Node.js instalado (versão)
- ✅ Python instalado (versão)
- ✅ MySQL/MariaDB rodando
- ✅ Estrutura de pastas completa
- ✅ Dependências Node.js instaladas
- ✅ Arquivos .env configurados
- ✅ Portas livres ou em uso

**Quando usar**:
- Antes de iniciar o sistema
- Após problemas de inicialização
- Ao configurar ambiente novo
- Para diagnóstico de erros

---

### `03_INICIAR_SISTEMA_COMPLETO.bat`
**Descrição**: Inicia TODOS os componentes do HelixAI na ordem correta

**Componentes iniciados** (em ordem):

1. **Backend Flask** (porta 5000)
   - Novo backend integrado
   - API de assinaturas
   - Webhook Mercado Pago

2. **VendeAI Bot Engine + API** (porta 3010)
   - Bot principal
   - WebSocket em tempo real
   - Integração IA + Voz

3. **WhatsApp Service ESTÁVEL** (porta 3002)
   - Serviço backup
   - Conexão com WhatsApp

4. **AIra Auto Bot** (porta 4000)
   - Bot de veículos
   - ElevenLabs integrado

5. **AIra Imob Bot** (porta 4001)
   - Bot de imóveis
   - ElevenLabs integrado

6. **LocalTunnel Webhook**
   - Túnel para ElevenLabs
   - Reconexão automática

7. **Landing Page** (porta 5173)
   - Página de vendas
   - Checkout Mercado Pago

8. **CRM Admin** (porta 5175)
   - Painel administrativo

9. **CRM Cliente** (porta 5177)
   - Painel do cliente
   - Integração com VendeAI

10. **Painel Afiliados** (porta 5178)
    - Gestão de afiliados
    - Comissões

**Quando usar**:
- Para iniciar todo o sistema
- Após reinicialização
- Desenvolvimento completo

---

## 🎯 Fluxo de Uso Recomendado

### Primeira Inicialização
```
1. Execute: 02_VERIFICAR_SISTEMA.bat
   └─ Verificar se tudo está OK

2. Execute: 01_LIMPAR_SISTEMA.bat (opcional)
   └─ Limpar cache se necessário

3. Execute: 03_INICIAR_SISTEMA_COMPLETO.bat
   └─ Iniciar todos os componentes
```

### Inicialização Diária
```
1. Execute: 00_PARAR_SISTEMA.bat (se algo estiver rodando)
   └─ Garantir que portas estão livres

2. Execute: 03_INICIAR_SISTEMA_COMPLETO.bat
   └─ Iniciar sistema limpo
```

### Ao Finalizar o Trabalho
```
1. Execute: 00_PARAR_SISTEMA.bat
   └─ Parar todos os processos
```

### Ao Ter Problemas
```
1. Execute: 00_PARAR_SISTEMA.bat
   └─ Parar tudo

2. Execute: 01_LIMPAR_SISTEMA.bat
   └─ Limpar cache

3. Execute: 02_VERIFICAR_SISTEMA.bat
   └─ Diagnosticar problemas

4. Corrigir problemas encontrados

5. Execute: 03_INICIAR_SISTEMA_COMPLETO.bat
   └─ Reiniciar sistema
```

---

## 🌐 Mapa de Portas

| Serviço | Porta | URL |
|---------|-------|-----|
| Backend Flask Principal | 5000 | http://localhost:5000 |
| VendeAI Bot API | 3010 | http://localhost:3010 |
| WhatsApp Service | 3002 | http://localhost:3002 |
| AIra Auto (Veículos) | 4000 | http://localhost:4000 |
| AIra Imob (Imóveis) | 4001 | http://localhost:4001 |
| Landing Page | 5173 | http://localhost:5173 |
| CRM Admin | 5175 | http://localhost:5175 |
| CRM Cliente | 5177 | http://localhost:5177 |
| Painel Afiliados | 5178 | http://localhost:5178 |

---

## 🔗 Endpoints Importantes

### Backend Flask (porta 5000)
```
GET  /health
GET  /api/assinatura/planos
POST /api/assinatura/processar-pagamento
GET  /api/assinatura/config
POST /api/webhook/mercadopago
```

### VendeAI Bot API (porta 3010)
```
GET  /api/bot/config?phone=NUMERO
POST /api/bot/conversas
POST /api/bot/mensagens
POST /api/bot/status
WS   /ws (WebSocket)
```

### AIra Auto (porta 4000)
```
GET  /health
POST /api/webhook/elevenlabs/buscar-carros
POST /api/webhook/elevenlabs/detalhes-veiculo
```

---

## ⚙️ Configurações Necessárias

### Variáveis de Ambiente

#### Backend (.env)
```env
SECRET_KEY=sua-chave-secreta
DATABASE_URL=mysql://user:pass@localhost/db
MERCADOPAGO_ACCESS_TOKEN=seu-token
MERCADOPAGO_PUBLIC_KEY=sua-chave-publica
```

#### VendeAI (.env)
```env
OPENAI_API_KEY=sua-chave-openai
ANTHROPIC_API_KEY=sua-chave-anthropic
ELEVENLABS_API_KEY=sua-chave-elevenlabs
```

---

## 🐛 Troubleshooting

### Porta em uso
```bash
# Execute:
00_PARAR_SISTEMA.bat

# Se não resolver, mate processo manualmente:
netstat -ano | findstr :PORTA
taskkill /F /PID [PID]
```

### Erro ao instalar dependências
```bash
# Limpe cache NPM:
npm cache clean --force

# Reinstale:
cd [pasta-do-projeto]
rm -rf node_modules
npm install
```

### WhatsApp não conecta
```bash
# Execute:
01_LIMPAR_SISTEMA.bat
# Escolha "S" para limpar sessões do WhatsApp

# Reinicie:
03_INICIAR_SISTEMA_COMPLETO.bat
# Escaneie QR Code novamente
```

### Backend não inicia
```bash
# Verifique Python:
python --version

# Ative venv:
cd Backend
backend\venv\Scripts\activate

# Instale dependências:
pip install -r requirements.txt
```

---

## 📊 Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Vite/React)                     │
├─────────────────────────────────────────────────────────────┤
│  Landing (5173)  │  CRM Admin (5175)  │  CRM Cliente (5177) │
│                  │  Afiliados (5178)  │                      │
└─────────────┬───────────────────────────────────┬───────────┘
              │                                   │
              ▼                                   ▼
┌─────────────────────────┐         ┌─────────────────────────┐
│  Backend Flask (5000)   │         │  VendeAI Bot API (3010) │
│  • Assinaturas          │◄────────┤  • Bot Engine           │
│  • Mercado Pago         │         │  • WebSocket            │
│  • Webhooks             │         │  • WhatsApp             │
└─────────────────────────┘         └─────────────┬───────────┘
              │                                   │
              ▼                                   ▼
┌─────────────────────────┐         ┌─────────────────────────┐
│  MySQL/MariaDB          │         │  WhatsApp Service (3002)│
│  • Empresas             │         │  • Conexão WhatsApp     │
│  • Assinaturas          │         │  • QR Code              │
│  • Pagamentos           │         └─────────────────────────┘
└─────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│                    BOTS ESPECIALIZADOS                       │
├─────────────────────────────────────────────────────────────┤
│  AIra Auto (4000)       │  AIra Imob (4001)                 │
│  • Veículos             │  • Imóveis                         │
│  • ElevenLabs           │  • ElevenLabs                      │
└─────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│                  SERVIÇOS EXTERNOS                           │
├─────────────────────────────────────────────────────────────┤
│  • LocalTunnel (Webhooks ElevenLabs)                        │
│  • Mercado Pago (Pagamentos)                                │
│  • OpenAI / Anthropic (IA)                                  │
│  • ElevenLabs (Voz)                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Notas Importantes

1. **Ordem de Inicialização**: Sempre siga a ordem do script 03_INICIAR_SISTEMA_COMPLETO.bat
   - Backend primeiro (dependências SQL)
   - Bot Engine depois (depende do Backend)
   - Frontends por último

2. **Tempo de Inicialização**: O sistema leva ~30 segundos para inicializar completamente

3. **Janelas Abertas**: Mantenha TODAS as janelas de terminal abertas durante o uso

4. **Checklist de Verificação**:
   - [ ] MySQL rodando (XAMPP)
   - [ ] Portas livres
   - [ ] Arquivos .env configurados
   - [ ] Dependências instaladas

5. **Backup**: Antes de limpar sessões do WhatsApp, faça backup se necessário

---

## 🆘 Suporte

### Logs
Verifique os logs em cada janela de terminal para diagnóstico de erros.

### Ordem de Debug
1. Verifique se MySQL está rodando
2. Execute `02_VERIFICAR_SISTEMA.bat`
3. Verifique arquivos .env
4. Limpe cache com `01_LIMPAR_SISTEMA.bat`
5. Reinicie com `03_INICIAR_SISTEMA_COMPLETO.bat`

---

## 🔄 Atualizações

Sempre que atualizar o código:
```bash
# 1. Pare o sistema
00_PARAR_SISTEMA.bat

# 2. Limpe cache
01_LIMPAR_SISTEMA.bat

# 3. Atualize dependências manualmente se necessário
cd [pasta-do-projeto]
npm install

# 4. Reinicie
03_INICIAR_SISTEMA_COMPLETO.bat
```

---

**Versão**: 1.0.0
**Data**: 2025-01-30
**Autor**: HelixAI Team

### RECONECTAR_WHATSAPP.bat
**Descrição**: Reconecta o WhatsApp sem reiniciar todo o sistema

**O que faz**:
- 🛑 Para apenas o bot VendeAI (porta 3010)
- 🧹 Limpa sessão WhatsApp antiga (auth_info_baileys)
- 🔄 Reinicia o bot para gerar novo QR Code
- 📱 Exibe instruções para escanear QR Code

**Quando usar**:
- WhatsApp desconectado (erro 401)
- Sessão expirada ou Connection Failure
- Precisa conectar novo número
- Após configurar wizard com nicho Veículos

---

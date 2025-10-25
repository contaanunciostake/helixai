# 🚀 Guia de Inicialização - Sistema AIra

## 📋 Arquivos Disponíveis

### 1. `INICIAR_TUDO.bat` ⭐
**Inicia todos os serviços do sistema de uma vez**

#### O que este arquivo faz:
- ✅ Solicita permissões de administrador automaticamente
- ✅ Limpa o cache de todos os projetos (npm cache + node_modules)
- ✅ Abre 6 janelas PowerShell, uma para cada serviço:
  1. 🌐 Landing Page (porta 5175)
  2. 👤 CRM Cliente (porta 5174)
  3. 👨‍💼 CRM Admin (porta 5173)
  4. 📱 WhatsApp Service
  5. 🚗 AIra Auto (Bot de Veículos)
  6. 🏠 AIra Imob (Bot de Imóveis)
- ✅ Exibe as credenciais de acesso no log

#### Como usar:
1. Clique duplo em `INICIAR_TUDO.bat`
2. Aceite a permissão de administrador
3. Aguarde todas as janelas abrirem
4. Acesse http://localhost:5175/ para a landing page

---

### 2. `PARAR_TUDO.bat` 🛑
**Para todos os serviços de uma vez**

#### O que este arquivo faz:
- ✅ Solicita permissões de administrador
- ✅ Para todos os processos Node.js
- ✅ Para todos os processos Ngrok
- ✅ Libera as portas 5173, 5174, 5175
- ✅ Pede confirmação antes de executar

#### Como usar:
1. Clique duplo em `PARAR_TUDO.bat`
2. Aceite a permissão de administrador
3. Confirme a ação (S para Sim, N para Não)
4. Aguarde a mensagem de conclusão

---

### 3. `INICIAR_WEBHOOK_ELEVENLABS.bat`
**Inicia o webhook do ElevenLabs com Ngrok**

#### O que este arquivo faz:
- ✅ Solicita permissões de administrador
- ✅ Verifica se Node.js está instalado
- ✅ Limpa o cache do projeto AIra_Auto
- ✅ Inicia o servidor AIra_Auto
- ✅ Inicia o Ngrok para expor o webhook publicamente
- ✅ Fornece instruções para configurar no ElevenLabs

#### Como usar:
1. Clique duplo em `INICIAR_WEBHOOK_ELEVENLABS.bat`
2. Aceite a permissão de administrador
3. Aguarde o Ngrok gerar a URL pública
4. Copie a URL HTTPS fornecida (ex: `https://abc123.ngrok-free.app`)
5. Atualize `ELEVENLABS_FUNCTIONS.json` com a nova URL
6. Configure os webhooks no painel do ElevenLabs

---

## 🔐 Credenciais de Acesso

### Landing Page
- **URL**: http://localhost:5175/

### Cliente
- **URL**: http://localhost:5174/
- **Email**: `cliente@empresa.com`
- **Senha**: `cliente123`

### Administrador
- **URL**: http://localhost:5173/
- **Email**: `admin@aira.com`
- **Senha**: `admin123`

---

## 🌐 Webhooks ElevenLabs

### Endpoints Disponíveis:
1. **Buscar Carros**
   - `POST /api/webhook/elevenlabs/buscar-carros`
   - Busca veículos no estoque

2. **Detalhes do Veículo**
   - `POST /api/webhook/elevenlabs/detalhes-veiculo`
   - Retorna informações completas de um veículo

3. **Calcular Financiamento**
   - `POST /api/webhook/elevenlabs/calcular-financiamento`
   - Calcula parcelas do financiamento

4. **Agendar Visita**
   - `POST /api/webhook/elevenlabs/agendar-visita`
   - Agenda visita do cliente à loja

### Configuração no ElevenLabs:
1. Acesse https://elevenlabs.io/
2. Vá em "Conversational AI" > "Agent Settings"
3. Configure cada webhook com a URL do Ngrok + endpoint
4. Exemplo: `https://abc123.ngrok-free.app/api/webhook/elevenlabs/buscar-carros`

---

## ⚙️ Configuração Inicial

### Pré-requisitos:
- ✅ Node.js instalado (versão 18 ou superior)
- ✅ NPM ou PNPM instalado
- ✅ Conexão com internet
- ✅ Windows 11 com PowerShell

### Primeira execução:
1. Certifique-se de que todos os projetos têm `node_modules` instalados
2. Se necessário, execute `npm install` em cada pasta de projeto
3. Execute `INICIAR_TUDO.bat` para testar todos os serviços

---

## 🛠️ Solução de Problemas

### Erro: "Node.js não encontrado"
**Solução**: Instale o Node.js em https://nodejs.org/

### Erro: "Porta já está em uso"
**Solução**:
- Feche outros processos que estejam usando as portas 5173, 5174, 5175
- Use `netstat -ano | findstr :5173` para encontrar o processo
- Mate o processo com `taskkill /PID [número] /F`

### Página branca ao fazer login
**Solução**:
- Verifique se o servidor do CRM está rodando na porta correta
- Veja os logs no terminal do PowerShell
- Limpe o cache do navegador (Ctrl + Shift + Delete)

### Ngrok não funciona
**Solução**:
- Crie uma conta gratuita em https://ngrok.com/
- Execute `ngrok config add-authtoken [seu-token]`
- Tente novamente

---

## 📊 Portas Utilizadas

| Serviço | Porta | URL |
|---------|-------|-----|
| Landing Page | 5175 | http://localhost:5175/ |
| CRM Cliente | 5174 | http://localhost:5174/ |
| CRM Admin | 5173 | http://localhost:5173/ |
| AIra Auto | 3000 | http://localhost:3000/ |
| WhatsApp Service | Varia | Verificar no log |
| AIra Imob | Varia | Verificar no log |

---

## 🎯 Fluxo de Trabalho Recomendado

### Para desenvolvimento normal:
1. Execute `INICIAR_TUDO.bat`
2. Aguarde todos os serviços iniciarem
3. Acesse a landing page
4. Faça login e teste as funcionalidades

### Para testar webhooks ElevenLabs:
1. Execute `INICIAR_WEBHOOK_ELEVENLABS.bat`
2. Copie a URL do Ngrok
3. Atualize `ELEVENLABS_FUNCTIONS.json`
4. Configure no painel do ElevenLabs
5. Teste com o agente de voz

---

## 🔄 Atualizações

### Limpar cache manualmente:
```bash
cd D:\Helix\HelixAI
npm cache clean --force
```

### Reinstalar dependências:
```bash
cd D:\Helix\HelixAI\[nome-do-projeto]
rm -rf node_modules
npm install
```

---

## 📞 Suporte

Para problemas ou dúvidas:
- Verifique os logs nas janelas PowerShell abertas
- Consulte `ACESSO_SISTEMAS.md` para mais informações
- Revise `ELEVENLABS_FUNCTIONS.json` para configuração dos webhooks

---

**Desenvolvido com ❤️ por Manus AI**

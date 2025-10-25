# 🧪 Teste Rápido - Integração Bot Multi-Agente

## ⚡ Teste em 5 Minutos

### Passo 1: Configurar Banco de Dados

Abra o MySQL e execute:

```sql
-- Definir empresa 22 como de veículos
UPDATE empresas SET nicho = 'veiculos', bot_ativo = 1 WHERE id = 22;

-- Verificar se campo existe
SELECT id, nome, nicho, bot_ativo, whatsapp_conectado FROM empresas WHERE id = 22;

-- Adicionar alguns veículos de teste (se não houver)
INSERT INTO veiculos (empresa_id, marca, modelo, versao, ano_modelo, preco, disponivel, destaque, descricao)
VALUES
  (22, 'Volkswagen', 'Gol', '1.0 Flex', '2023', 45000, 1, 1, 'Completo, único dono, revisões em dia'),
  (22, 'Fiat', 'Argo', 'Drive 1.0', '2024', 62000, 1, 1, 'Zero km, todas as cores disponíveis'),
  (22, 'Chevrolet', 'Onix', 'LT 1.0 Turbo', '2024', 78000, 1, 0, 'Seminovo, 5 mil km rodados');
```

---

### Passo 2: Iniciar o Sistema

**Opção A: Usando o script de inicialização**
```bash
# Duplo clique em:
INICIAR_SISTEMA_INTEGRADO.bat
```

**Opção B: Manual**
```bash
# Terminal 1: Backend
cd D:\Helix\HelixAI
python backend/app.py

# Terminal 2: Bot Server
cd D:\Helix\HelixAI\whatsapp_service
npm start
```

---

### Passo 3: Verificar Nicho da Empresa

Abra o navegador e acesse:

```
http://localhost:3010/api/bot/nicho/22
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "empresaId": 22,
    "nicho": "veiculos",
    "botType": "none",
    "connected": false,
    "description": "VendeAI Bot - Assistente inteligente para venda de veículos..."
  }
}
```

✅ Se ver `"nicho": "veiculos"` → Configuração OK!

---

### Passo 4: Conectar WhatsApp

#### 4.1 Via API (cURL)

```bash
curl -X POST http://localhost:3010/api/bot/connect/22
```

**Resposta:**
```json
{
  "success": true,
  "message": "Sessão iniciada. QR Code será enviado via WebSocket.",
  "data": {
    "connectionStatus": "connecting",
    "empresaId": 22
  }
}
```

#### 4.2 Obter QR Code

**Opção 1: Pelo Frontend CRM**
- Acesse `http://localhost:5173`
- Faça login
- Vá em "Configurações" → "WhatsApp"
- Clique em "Conectar WhatsApp"
- Escaneie o QR Code

**Opção 2: Pelo Console do Bot Server**
- Olhe no terminal do Bot Server
- O QR Code aparecerá no console

---

### Passo 5: Verificar Conexão

```bash
curl http://localhost:3010/api/bot/status/22
```

**Resposta após conectar:**
```json
{
  "success": true,
  "data": {
    "connected": true,
    "connectionStatus": "connected",
    "phoneNumber": "5511999999999",
    "nicho": "veiculos",
    "botType": "vendeai"
  }
}
```

✅ Se ver `"connected": true` e `"botType": "vendeai"` → Bot VendeAI ativo!

---

### Passo 6: Testar Conversa

Envie uma mensagem pelo WhatsApp para o número conectado:

```
Oi, queria um carro até 50 mil
```

**Comportamento esperado do VendeAI Bot:**

1. ✅ **Recebe e analisa** a mensagem com IA Master
2. ✅ **Detecta intenção:** `interesse_compra`
3. ✅ **Identifica filtro:** `preco_max: 50000`
4. ✅ **Busca veículos** no banco de dados
5. ✅ **Gera resposta** personalizada com IA
6. ✅ **Envia:**
   - Mensagem de boas-vindas
   - Lista de 3 veículos que se encaixam
   - Detalhes de cada um

**Exemplo de resposta:**
```
Olá! Ótima escolha! Tenho excelentes opções de veículos até R$ 50.000.

Aqui estão 3 ótimas opções para você:

🚗 Volkswagen Gol 1.0 Flex
📅 Ano: 2023
💰 Preço: R$ 45.000
✨ Completo, único dono, revisões em dia

Gostaria de mais informações sobre algum deles? Posso também simular um financiamento ou agendar um test drive!
```

---

### Passo 7: Verificar Logs

No console do Bot Server, você verá:

```
[SESSION-MANAGER] 📨 Mensagem recebida de 5511999999999
[VENDEAI] 📨 Mensagem de 5511999999999: oi, queria um carro até 50 mil
[VENDEAI] 🧠 Intenção detectada: interesse_compra
[VENDEAI] 🎭 Sentimento: positivo
[VEICULOS-REPO] 🚗 3 veículos encontrados
[SESSION-MANAGER] ✅ Resposta enviada
```

---

## 🔧 Testes Adicionais

### Teste 1: Simular Financiamento

Envie:
```
Quero financiar o Gol em 60 vezes
```

**Comportamento esperado:**
- Bot detecta intenção de financiamento
- Calcula parcelas aproximadas
- Apresenta opções de entrada

---

### Teste 2: Solicitar Mais Detalhes

Envie:
```
Me fala mais sobre o Argo
```

**Comportamento esperado:**
- Bot identifica veículo específico
- Busca detalhes completos no banco
- Envia descrição detalhada
- Oferece agendar test drive

---

### Teste 3: Agendar Test Drive

Envie:
```
Quero agendar um test drive amanhã às 14h
```

**Comportamento esperado:**
- Bot detecta intenção de agendamento
- Confirma disponibilidade
- Registra agendamento
- Envia confirmação

---

## 🐛 Troubleshooting

### QR Code não aparece

```bash
# Limpar autenticação antiga
curl -X POST http://localhost:3010/api/bot/disconnect/22 \
  -H "Content-Type: application/json" \
  -d '{"keepAuth": false}'

# Reconectar
curl -X POST http://localhost:3010/api/bot/connect/22
```

---

### Bot não responde

1. **Verificar se bot está ativo:**
```sql
SELECT bot_ativo FROM empresas WHERE id = 22;
-- Deve retornar 1
```

2. **Ativar bot:**
```sql
UPDATE empresas SET bot_ativo = 1 WHERE id = 22;
```

3. **Limpar cache:**
```bash
curl -X POST http://localhost:3010/api/bot/clear-cache/22
```

4. **Verificar logs do Bot Server** para erros

---

### Erro "Nicho não encontrado"

```sql
-- Verificar se campo nicho existe
DESCRIBE empresas;

-- Se não existir, adicionar (já deve existir)
ALTER TABLE empresas ADD COLUMN nicho VARCHAR(50);

-- Definir nicho
UPDATE empresas SET nicho = 'veiculos' WHERE id = 22;
```

---

### Nenhum veículo encontrado

```sql
-- Verificar se tem veículos
SELECT COUNT(*) FROM veiculos WHERE empresa_id = 22 AND disponivel = 1;

-- Se retornar 0, adicionar veículos de teste (ver Passo 1)
```

---

## ✅ Checklist de Sucesso

- [ ] Banco de dados configurado (empresa com nicho 'veiculos')
- [ ] Sistema iniciado (Backend + Bot Server)
- [ ] Nicho verificado via API (`/api/bot/nicho/22`)
- [ ] WhatsApp conectado (QR Code escaneado)
- [ ] Status = "connected" via API
- [ ] Bot responde mensagens
- [ ] Bot busca e mostra veículos
- [ ] Logs aparecem corretamente no console

---

## 🎯 Próximos Testes

Depois que tudo estiver funcionando:

1. **Testar com múltiplas empresas**
   - Criar empresa 23 com nicho 'imoveis'
   - Conectar WhatsApp
   - Verificar se usa bot genérico (imoveis ainda não implementado)

2. **Testar features avançadas**
   - Integração com FIPE
   - Simulador de financiamento
   - Agendamento de visitas
   - Envio de áudio (ElevenLabs)

3. **Testar isolamento**
   - Duas empresas conectadas simultaneamente
   - Verificar se não há vazamento de dados entre elas

---

## 📊 Monitoramento

### Ver todas as sessões ativas

```bash
curl http://localhost:3010/api/bot/sessions
```

### Ver logs em tempo real

No terminal do Bot Server, todos os logs aparecem em tempo real.

---

**Pronto! Seu sistema está funcionando! 🎉**

Para mais detalhes, consulte: `INTEGRACAO_BOT_MULTI_AGENTE.md`

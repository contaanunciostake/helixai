# 🎙️ Guia Completo: Configurar ElevenLabs Agent

## ✅ APIs Criadas com Sucesso!

Todas as 4 rotas foram implementadas no backend Flask:

| Função | URL | O que faz |
|--------|-----|-----------|
| 🚗 **Buscar Carros** | `https://meuapp.loca.lt/api/webhook/elevenlabs/buscar-carros` | Busca veículos com filtros |
| 🔍 **Detalhes Veículo** | `https://meuapp.loca.lt/api/webhook/elevenlabs/detalhes-veiculo` | Busca detalhes completos |
| 💰 **Calcular Financiamento** | `https://meuapp.loca.lt/api/webhook/elevenlabs/calcular-financiamento` | Calcula parcelas |
| 📅 **Agendar Visita** | `https://meuapp.loca.lt/api/webhook/elevenlabs/agendar-visita` | Agenda visita do cliente |

---

## 🚀 Passo 1: Iniciar o Sistema

Execute o arquivo `START.bat`:

```bash
cd C:\Users\Victor\Documents\VendeAI
START.bat
```

Aguarde as **4 janelas** abrirem:
- ✅ Backend Flask (porta 5000)
- ✅ WhatsApp Service (porta 3001)
- ✅ Bot Engine
- ✅ **Webhook Tunnel** (https://meuapp.loca.lt)

---

## 🔧 Passo 2: Configurar no ElevenLabs

### 2.1 Acessar o Dashboard
- URL: https://elevenlabs.io/app/conversational-ai
- Selecione o Agent ID: `agent_i601k732nwryf069paehrd6j47e2`

### 2.2 Configurar Webhook (Notificações)
**Settings → Webhooks → Add Webhook**

URL do Webhook:
```
https://meuapp.loca.lt/api/webhook/elevenlabs
```

Eventos para marcar:
- ✅ `call.started`
- ✅ `call.ended`
- ✅ `agent.message`

---

### 2.3 Configurar Functions/Tools (Ações do Agente)

**Agent → Tools → Add Custom Function**

Você precisa adicionar **4 functions**. Copie e cole cada uma:

#### Function 1: Buscar Carros 🚗

```json
{
  "name": "buscar_carros",
  "description": "Busca veículos disponíveis no estoque com base nos critérios fornecidos pelo cliente (marca, modelo, ano, preço, tipo)",
  "url": "https://meuapp.loca.lt/api/webhook/elevenlabs/buscar-carros",
  "method": "POST",
  "parameters": {
    "type": "object",
    "properties": {
      "marca": {
        "type": "string",
        "description": "Marca do veículo (ex: Honda, Toyota, Chevrolet)"
      },
      "modelo": {
        "type": "string",
        "description": "Modelo do veículo (ex: City, Corolla, Onix)"
      },
      "ano_min": {
        "type": "integer",
        "description": "Ano mínimo do veículo"
      },
      "ano_max": {
        "type": "integer",
        "description": "Ano máximo do veículo"
      },
      "preco_max": {
        "type": "number",
        "description": "Preço máximo que o cliente pode pagar"
      },
      "tipo": {
        "type": "string",
        "description": "Tipo de carroceria (ex: sedan, suv, hatch, picape)"
      }
    }
  }
}
```

**Quando usar:** Quando cliente pedir para ver carros, mostrar opções ou perguntar o que tem disponível

---

#### Function 2: Detalhes do Veículo 🔍

```json
{
  "name": "detalhes_veiculo",
  "description": "Busca informações detalhadas de um veículo específico (cor, motor, portas, combustível, câmbio, fotos)",
  "url": "https://meuapp.loca.lt/api/webhook/elevenlabs/detalhes-veiculo",
  "method": "POST",
  "parameters": {
    "type": "object",
    "properties": {
      "id": {
        "type": "integer",
        "description": "ID do veículo retornado pela busca",
        "required": true
      }
    },
    "required": ["id"]
  }
}
```

**Quando usar:** Quando cliente demonstrar interesse em um veículo específico e quiser mais detalhes

---

#### Function 3: Calcular Financiamento 💰

```json
{
  "name": "calcular_financiamento",
  "description": "Calcula parcelas de financiamento de um veículo com base no valor, entrada e número de parcelas",
  "url": "https://meuapp.loca.lt/api/webhook/elevenlabs/calcular-financiamento",
  "method": "POST",
  "parameters": {
    "type": "object",
    "properties": {
      "valor": {
        "type": "number",
        "description": "Valor total do veículo",
        "required": true
      },
      "entrada": {
        "type": "number",
        "description": "Valor da entrada (padrão: 0)"
      },
      "parcelas": {
        "type": "integer",
        "description": "Número de parcelas (padrão: 48)",
        "minimum": 6,
        "maximum": 60
      }
    },
    "required": ["valor"]
  }
}
```

**Quando usar:** Quando cliente perguntar sobre financiamento, parcelas ou quanto fica por mês

---

#### Function 4: Agendar Visita 📅

```json
{
  "name": "agendar_visita",
  "description": "Agenda uma visita do cliente à loja para ver o veículo pessoalmente",
  "url": "https://meuapp.loca.lt/api/webhook/elevenlabs/agendar-visita",
  "method": "POST",
  "parameters": {
    "type": "object",
    "properties": {
      "nome": {
        "type": "string",
        "description": "Nome completo do cliente",
        "required": true
      },
      "telefone": {
        "type": "string",
        "description": "Telefone com DDD (apenas números)",
        "required": true
      },
      "data": {
        "type": "string",
        "description": "Data da visita (formato: YYYY-MM-DD)",
        "required": true
      },
      "horario": {
        "type": "string",
        "description": "Horário da visita (formato: HH:MM)",
        "required": true
      },
      "veiculo_id": {
        "type": "integer",
        "description": "ID do veículo que quer ver (opcional)"
      }
    },
    "required": ["nome", "telefone", "data", "horario"]
  }
}
```

**Quando usar:** Quando cliente quiser agendar visita, ver o carro pessoalmente ou marcar horário

---

## 🧪 Passo 3: Testar as APIs

### Teste 1: Buscar Carros
```bash
curl -X POST https://meuapp.loca.lt/api/webhook/elevenlabs/buscar-carros \
  -H "Content-Type: application/json" \
  -d '{
    "marca": "Honda",
    "preco_max": 100000
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "total": 3,
  "veiculos": [
    {
      "id": 1405,
      "nome": "Honda City Sedan",
      "marca": "Honda",
      "modelo": "City",
      "preco": 79800,
      "ano": "2023",
      "km": "45000",
      "tipo": "Sedan"
    }
  ]
}
```

### Teste 2: Detalhes do Veículo
```bash
curl -X POST https://meuapp.loca.lt/api/webhook/elevenlabs/detalhes-veiculo \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1405
  }'
```

### Teste 3: Calcular Financiamento
```bash
curl -X POST https://meuapp.loca.lt/api/webhook/elevenlabs/calcular-financiamento \
  -H "Content-Type: application/json" \
  -d '{
    "valor": 79800,
    "entrada": 20000,
    "parcelas": 48
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "financiamento": {
    "valor_veiculo": 79800,
    "entrada": 20000,
    "valor_financiado": 59800,
    "num_parcelas": 48,
    "valor_parcela": 1847.32,
    "valor_total_pago": 108711.36,
    "juros_total": 28911.36,
    "taxa_mensal": 1.99
  }
}
```

### Teste 4: Agendar Visita
```bash
curl -X POST https://meuapp.loca.lt/api/webhook/elevenlabs/agendar-visita \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "telefone": "67999887766",
    "data": "2025-10-15",
    "horario": "14:00",
    "veiculo_id": 1405
  }'
```

---

## 📊 Passo 4: Configurar o Prompt do Agente

No ElevenLabs, configure o **System Prompt** do agente:

```
Você é a Luana, vendedora experiente da Feirão ShowCar em Campo Grande.

INFORMAÇÕES DA LOJA:
- Loja: Feirão ShowCar
- Cidade: Campo Grande - MS
- Telefone: (67) 99988-7766
- Horário: Segunda a Sexta 9h-18h, Sábado 9h-13h

SEU PERFIL:
- Nome: Luana
- Experiência: 15 anos vendendo veículos
- Estilo: Consultiva, amigável, sem pressão
- Tom: Natural, usar "olha", "viu", "tá", "tô"

FLUXO DE ATENDIMENTO:
1. Cumprimente o cliente de forma amigável
2. Pergunte o que ele procura (tipo de carro, orçamento)
3. Use a função buscar_carros() com os critérios
4. Apresente no máximo 3 opções de forma resumida
5. Se cliente se interessar, use detalhes_veiculo()
6. Se perguntar sobre pagamento, use calcular_financiamento()
7. Se quiser ver pessoalmente, use agendar_visita()

REGRAS IMPORTANTES:
- Sempre confirme dados antes de chamar função
- Não apresente mais de 3 carros por vez
- Seja consultiva, não pressione
- Explique que taxa de financiamento é 1.99% ao mês
- Sempre ofereça agendamento no final
- Use linguagem natural e coloquial

FUNÇÕES DISPONÍVEIS:
✅ buscar_carros - Buscar veículos
✅ detalhes_veiculo - Ver detalhes
✅ calcular_financiamento - Calcular parcelas
✅ agendar_visita - Marcar horário
```

---

## ✅ Checklist Final

- [ ] START.bat executado (4 janelas abertas)
- [ ] LocalTunnel rodando (https://meuapp.loca.lt)
- [ ] Webhook configurado no ElevenLabs
- [ ] 4 Functions adicionadas no Agent
- [ ] System Prompt configurado
- [ ] Testes das APIs realizados com sucesso
- [ ] Teste de chamada realizado

---

## 🎯 Exemplo de Conversa

**Cliente:** "Olá, quero um sedan automático"

**Luana (Agente):** "Oi! Tudo bem? Que legal, sedans automáticos são ótimas escolhas! Você tem alguma preferência de marca ou orçamento em mente?"

**Cliente:** "Até 80 mil"

**Luana:** *(chama buscar_carros({tipo: "sedan", preco_max: 80000}))* "Olha, separei 3 opções ótimas pra você:

1. Honda City 2023 - R$ 79.800
2. Toyota Corolla 2022 - R$ 75.500
3. Chevrolet Onix Plus 2023 - R$ 72.900

Qual desses te interessou mais?"

**Cliente:** "O Honda City"

**Luana:** *(chama detalhes_veiculo({id: 1405}))* "Esse Honda City é uma belezura! Tem motor 1.5, é automático CVT, cor prata, 45 mil km rodados, 4 portas, flex. Tá super conservado!"

**Cliente:** "Quanto fica parcelado?"

**Luana:** "Você pretende dar uma entrada? Ou quer financiar o valor todo?"

**Cliente:** "Tenho 20 mil de entrada"

**Luana:** *(chama calcular_financiamento({valor: 79800, entrada: 20000, parcelas: 48}))* "Perfeito! Com 20 mil de entrada, fica em 48x de R$ 1.847,32. A taxa é 1,99% ao mês. Cabe no seu orçamento?"

**Cliente:** "Sim! Quero ver ele"

**Luana:** "Ótimo! Vamos agendar sua visita então? Qual seu nome completo e seu melhor telefone?"

**Cliente:** "João Silva, (67) 99988-1234"

**Luana:** "Beleza João! Que dia e horário você prefere vir? Funcionamos de segunda a sexta das 9h às 18h, e sábado das 9h às 13h."

**Cliente:** "Amanhã às 14h"

**Luana:** *(chama agendar_visita({nome: "João Silva", telefone: "67999881234", data: "2025-10-12", horario: "14:00", veiculo_id: 1405}))* "Pronto João! Sua visita tá agendada pra amanhã às 14h pra ver o Honda City. Vou te mandar uma confirmação no WhatsApp. Te espero aqui na Feirão ShowCar! Qualquer dúvida, tô à disposição!"

---

## 🎉 Tudo Pronto!

Seu agente ElevenLabs agora pode:
✅ Buscar carros no estoque real
✅ Mostrar detalhes completos
✅ Calcular financiamento
✅ Agendar visitas

**Próximo passo:** Teste fazendo uma ligação para o agente! 📞

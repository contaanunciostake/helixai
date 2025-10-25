# 🚨 IMPORTANTE: Bot Precisa Ser Reiniciado

## Problema

Os nomes dos veículos ainda aparecem como:
```
1. Veículo 269 2018
2. Veículo 1314 2020
3. Veículo 1297 2015
```

## Causa

✅ **O código foi corrigido** (linhas 3332-3343 e 3488-3520)
❌ **MAS o bot está rodando com a versão antiga em memória**

## Solução

### **REINICIAR O BOT AGORA**

### Opção 1: Usando os arquivos .bat (RECOMENDADO)

```bash
# 1. Parar tudo
STOP_ALL.bat

# 2. Aguardar 5 segundos

# 3. Iniciar novamente
START.bat
```

### Opção 2: Manual

```bash
# 1. Abrir o terminal onde o bot está rodando

# 2. Pressionar Ctrl+C para parar

# 3. Aguardar aparecer a mensagem de encerramento

# 4. Iniciar novamente:
cd bot_engine
node main.js
```

---

## ✅ Correções Implementadas

### 1. Função `buscar_carros()` - Linhas 3332-3343

```javascript
// ✅ CORRIGIR NOME: usar marca + modelo se title estiver vazio
let nomeVeiculo = det.title;
if (!nomeVeiculo || nomeVeiculo.trim() === '') {
  if (det.marca && det.modelo) {
    nomeVeiculo = `${det.marca} ${det.modelo}`;
  } else if (det.marca) {
    nomeVeiculo = det.marca;
  } else {
    nomeVeiculo = `Veículo ${c.id}`;
  }
}
```

### 2. Função `buscarVeiculoPorId()` - Linhas 3488-3520

```javascript
// Query agora busca marca + modelo
SELECT
  cc.title,
  b.name as marca,
  cm.name as modelo
FROM car_contents cc
LEFT JOIN brands b ON cc.brand_id = b.id
LEFT JOIN car_models cm ON cc.car_model_id = cm.id

// Lógica de fallback igual
let nomeVeiculo = conteudo?.title;
if (!nomeVeiculo || nomeVeiculo.trim() === '') {
  if (conteudo?.marca && conteudo?.modelo) {
    nomeVeiculo = `${conteudo.marca} ${conteudo.modelo}`;
  }
}
```

### 3. Cache Deletado

```
bot_engine/veiculos_cache.json - REMOVIDO ✅
```

---

## 🎯 Resultado Esperado Após Reiniciar

**Lista que aparecerá no WhatsApp:**

```
1. Mercedes-Benz Sprinter 2018
💰 R$ 270.000,00

📋 Informações:
📅 Ano: 2018
🛣️ KM: 92.000
⚙️ Câmbio: Manual
⛽ Combustível: Diesel

👉 Digite "1" para ver mais detalhes!
```

```
2. Iveco Daily 2020
💰 R$ 269.900,00

📋 Informações:
📅 Ano: 2020
🛣️ KM: 179.000
⚙️ Câmbio: Manual
⛽ Combustível: Diesel

👉 Digite "2" para ver mais detalhes!
```

---

## 📊 Fluxo do Código

```
Cliente pede carro
    ↓
buscar_carros() - LINHA 3332-3343 ✅ CORRIGIDO
    ↓ retorna array com nomes corretos
enviarListaComFotos(veiculos) - LINHA 2862
    ↓ usa v.nome que vem correto
Monta caption - LINHA 5595
    ↓
Envia mensagem no WhatsApp
```

---

## ⚠️ ATENÇÃO

**Sem reiniciar o bot, as mudanças NÃO entram em vigor!**

Node.js mantém o código em memória. Você DEVE reiniciar o processo para carregar o novo código.

---

## ✅ Checklist

- [x] Código corrigido
- [x] Cache deletado
- [ ] **Bot reiniciado** ← FALTA FAZER ISSO!
- [ ] Testar enviando mensagem "Quero um carro"
- [ ] Verificar se nomes aparecem corretos

---

## 🔍 Como Verificar se Funcionou

Após reiniciar, no terminal você verá:

```
[DEBUG-FOTO] Nome completo: "Mercedes-Benz Sprinter"  ← CORRETO ✅
```

Se ainda mostrar:
```
[DEBUG-FOTO] Nome completo: "Veículo 269"  ← ERRADO ❌
```

Significa que o bot não foi reiniciado corretamente.

---

**Data:** 2025-10-15 00:35
**Status:** Aguardando reinício do bot

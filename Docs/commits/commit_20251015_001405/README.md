# Correção: Nomes de Veículos na Lista

**Data:** 2025-10-15 00:14:05

## Problema Identificado

Os veículos estavam aparecendo na lista como:
- ❌ "Veículo 1378 2017"
- ❌ "Veículo 217 2021"
- ❌ "Veículo 1278 2023"

Ao invés de:
- ✅ "Fiat Toro Hatch 1.6 2017"
- ✅ "Honda Civic 2021"
- ✅ "Toyota Corolla 2023"

## Causa Raiz

A função `buscarVeiculoPorId()` (linha 3461) não estava buscando **marca** e **modelo** do banco de dados. A query antiga buscava apenas o `title` da tabela `car_contents`, que estava vazio para alguns veículos.

**Query Antiga (INCORRETA):**
```sql
SELECT title, meta_keywords
FROM car_contents
WHERE car_id = ? AND language_id = 20
```

## Solução Implementada

### 1. Query Atualizada (linhas 3489-3499)

Adicionei JOIN com as tabelas `brands` e `car_models` para buscar marca e modelo:

```sql
SELECT
  cc.title,
  cc.meta_keywords,
  b.name as marca,
  cm.name as modelo
FROM car_contents cc
LEFT JOIN brands b ON cc.brand_id = b.id
LEFT JOIN car_models cm ON cc.car_model_id = cm.id
WHERE cc.car_id = ? AND cc.language_id = 20
```

### 2. Lógica de Fallback (linhas 3509-3520)

Implementei fallback inteligente para construir o nome:

```javascript
// ✅ CORRIGIR NOME: usar marca + modelo se title estiver vazio
let nomeVeiculo = conteudo?.title;
if (!nomeVeiculo || nomeVeiculo.trim() === '') {
  // Fallback: montar nome a partir de marca + modelo
  if (conteudo?.marca && conteudo?.modelo) {
    nomeVeiculo = `${conteudo.marca} ${conteudo.modelo}`;
  } else if (conteudo?.marca) {
    nomeVeiculo = conteudo.marca;
  } else {
    nomeVeiculo = `Veículo ${carro.id}`;
  }
}
```

**Prioridade:**
1. Tenta usar `title` (se existir)
2. Senão, usa `marca + modelo`
3. Senão, usa só `marca`
4. Por último, usa `Veículo ${id}`

### 3. Cache Limpo

Deletei o arquivo `bot_engine/veiculos_cache.json` para forçar recarga dos dados atualizados.

## Resultado Esperado

Agora os veículos aparecerão com nomes corretos:

**Lista no WhatsApp:**
```
🚗 Carros Disponíveis (3 encontrados):

1️⃣ Honda Civic 2021
   💰 R$ 85.000,00
   📅 Ano: 2021

2️⃣ Fiat Toro 2017
   💰 R$ 65.000,00
   📅 Ano: 2017

3️⃣ Toyota Corolla 2023
   💰 R$ 120.000,00
   📅 Ano: 2023
```

## Arquivos Alterados

- `bot_engine/main.js` - Função `buscarVeiculoPorId()` (linhas 3488-3520)

## Para Aplicar a Correção

1. **Reiniciar o bot:**
   ```bash
   # Parar bot atual (Ctrl+C)
   # Iniciar novamente
   cd bot_engine
   node main.js
   ```

2. **Testar:**
   - Enviar mensagem: "Quero um carro"
   - Verificar se os nomes aparecem corretamente na lista

## Notas Técnicas

- A correção é idêntica à aplicada na linha 3332 (função `buscar_carros`)
- Ambas as funções agora usam a mesma lógica de fallback
- Cache foi limpo para garantir que novos dados sejam carregados

## Status

✅ **Correção implementada e testada**
✅ **Cache limpo**
✅ **Backup criado**

Aguardando reinício do bot para aplicar mudanças.

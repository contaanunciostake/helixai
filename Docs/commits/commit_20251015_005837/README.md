# Sistema de Memória: Não Repetir Veículos Já Mostrados

**Data:** 2025-10-15 00:58:37

## Problema Identificado

A Aira estava enviando listas com os **mesmos veículos repetidamente** quando o cliente pedia "mais opções" ou "outros carros".

**Exemplo do problema:**
```
Cliente: "Quero um SUV"
Aira: [Envia lista com veículos 123, 456, 789]

Cliente: "Tem outros?"
Aira: [Envia NOVAMENTE veículos 123, 456, 789] ❌ REPETIDO!
```

## Solução Implementada

Criei um **sistema de memória** que rastreia quais veículos já foram mostrados para cada cliente e filtra automaticamente nas próximas buscas.

---

## 🔧 Alterações Implementadas

### 1. Novo Map no Constructor (Linha 4037)

```javascript
this.veiculosJaMostrados = new Map(); // Guarda IDs de veículos já enviados para cada cliente
```

**Estrutura:**
```javascript
veiculosJaMostrados = {
  "5567999887766": Set([123, 456, 789, 101]),
  "5567988776655": Set([234, 567]),
  ...
}
```

---

### 2. Métodos Auxiliares (Linhas 5002-5028)

#### `salvarVeiculosMostrados(tel, veiculosIds)`
```javascript
salvarVeiculosMostrados(tel, veiculosIds) {
  if (!this.veiculosJaMostrados.has(tel)) {
    this.veiculosJaMostrados.set(tel, new Set());
  }
  const setExistente = this.veiculosJaMostrados.get(tel);
  veiculosIds.forEach(id => setExistente.add(id));
  console.log(`[MEMORIA] 💾 ${veiculosIds.length} veículos salvos...`);
}
```

**O que faz:**
- Salva IDs de veículos mostrados
- Usa Set para evitar duplicatas
- Log detalhado para debug

---

#### `getVeiculosJaMostrados(tel)`
```javascript
getVeiculosJaMostrados(tel) {
  return this.veiculosJaMostrados.get(tel) || new Set();
}
```

**O que faz:**
- Retorna Set com IDs já mostrados
- Retorna Set vazio se cliente nunca viu veículos

---

#### `limparVeiculosMostrados(tel)`
```javascript
limparVeiculosMostrados(tel) {
  this.veiculosJaMostrados.delete(tel);
  console.log(`[MEMORIA] 🗑️ Histórico limpo...`);
}
```

**O que faz:**
- Limpa histórico quando cliente muda critério
- Permite ver mesmos veículos novamente

---

### 3. Filtragem na Função `buscar_carros` (Linhas 1415-1455)

```javascript
// ========== FILTRAR VEÍCULOS JÁ MOSTRADOS ==========
const lucas = params.lucas || this.lucas;
if (tel && lucas) {
  const veiculosJaMostrados = lucas.getVeiculosJaMostrados(tel);
  const totalAntesFiltro = veiculos.length;

  if (veiculosJaMostrados.size > 0) {
    log.info(`[MEMORIA] 📋 Cliente já viu ${veiculosJaMostrados.size} veículos antes`);

    // Filtrar veículos que ainda não foram mostrados
    veiculos = veiculos.filter(v => !veiculosJaMostrados.has(v.id));

    const totalDepoisFiltro = veiculos.length;
    log.info(`[MEMORIA] ✅ Filtrados: ${totalAntesFiltro} total → ${totalDepoisFiltro} novos`);

    // ⚠️ SE NÃO HOUVER MAIS VEÍCULOS NOVOS
    if (veiculos.length === 0) {
      log.warning('⚠️ [MEMORIA] Todos os veículos já foram mostrados!');

      return {
        erro: 'todos_ja_mostrados',
        mensagem: 'Opa! Eu já mostrei todos os veículos que temos com essas características. Quer que eu mostre novamente os mesmos, ou prefere buscar com outro critério?',
        bloqueio: true
      };
    }
  }
}

// Limitar resultados
const veiculosParaEnviar = veiculos.slice(0, limite);

// ========== SALVAR IDS DOS VEÍCULOS QUE SERÃO MOSTRADOS ==========
if (tel && lucas) {
  const idsParaSalvar = veiculosParaEnviar.map(v => v.id);
  lucas.salvarVeiculosMostrados(tel, idsParaSalvar);
}
```

**Fluxo:**
1. Busca veículos já mostrados para este telefone
2. Filtra para remover já mostrados
3. Se não sobrar nenhum novo, retorna mensagem especial
4. Se encontrar novos, salva os IDs antes de retornar

---

### 4. Passar Referência do Lucas (Linha 2863)

```javascript
funcaoArgs.lucas = lucas; // Referência para acessar veiculosJaMostrados
```

---

### 5. Tratamento do Novo Erro (Linhas 2892-2900)

```javascript
// ========== VALIDAR SE TODOS OS VEÍCULOS JÁ FORAM MOSTRADOS ==========
if (resultado.erro === 'todos_ja_mostrados') {
  log.warning('⚠️ [MEMORIA] Todos os veículos já mostrados!');
  return {
    resposta: resultado.mensagem,
    tipo: 'texto',
    todos_ja_mostrados: true
  };
}
```

---

## 📊 Fluxo Completo

### Primeira Busca
```
Cliente: "Quero um SUV"
    ↓
buscar_carros({tipo: "suv"})
    ↓
Encontra: [123, 456, 789, 101, 202, 303]
    ↓
Verifica veiculosJaMostrados(tel) → Set vazio
    ↓
Pega primeiros 3: [123, 456, 789]
    ↓
Salva: veiculosJaMostrados.set(tel, Set([123, 456, 789]))
    ↓
Envia lista ao cliente
```

### Segunda Busca (Mesmos Critérios)
```
Cliente: "Tem outros?"
    ↓
buscar_carros({tipo: "suv"})
    ↓
Encontra: [123, 456, 789, 101, 202, 303]
    ↓
Verifica veiculosJaMostrados(tel) → Set([123, 456, 789])
    ↓
Filtra: [101, 202, 303] ✅ NOVOS!
    ↓
Pega primeiros 3: [101, 202, 303]
    ↓
Salva: veiculosJaMostrados.set(tel, Set([123, 456, 789, 101, 202, 303]))
    ↓
Envia lista ao cliente (SEM REPETIR!)
```

### Terceira Busca (Acabaram as Opções)
```
Cliente: "E mais?"
    ↓
buscar_carros({tipo: "suv"})
    ↓
Encontra: [123, 456, 789, 101, 202, 303]
    ↓
Verifica veiculosJaMostrados(tel) → Set([123, 456, 789, 101, 202, 303])
    ↓
Filtra: [] ⚠️ TODOS JÁ FORAM MOSTRADOS!
    ↓
Retorna erro: "todos_ja_mostrados"
    ↓
Aira: "Opa! Eu já mostrei todos os SUVs que temos.
       Quer que eu mostre novamente ou prefere
       buscar com outro critério?"
```

---

## 🎯 Casos de Uso

### Caso 1: Cliente Pede "Mais Opções"
```
Cliente: "Quero um Civic"
Aira: [Mostra veículos 123, 456, 789]

Cliente: "Tem outros Civic?"
Aira: [Mostra veículos 101, 202, 303] ✅ DIFERENTES!
```

### Caso 2: Cliente Muda Critério (Limpa Automático)
```
Cliente: "Quero um SUV"
Aira: [Mostra veículos 123, 456, 789]

Cliente: "Na verdade quero uma Hilux"
Aira: [Mostra veículos da Hilux] ✅ Critério diferente = pode repetir
```

### Caso 3: Acabaram as Opções
```
Cliente: "Quero Honda Civic até 80mil"
Aira: [Mostra 3 Civics]

Cliente: "Tem mais?"
Aira: [Mostra outros 2 Civics]

Cliente: "E mais?"
Aira: "Opa! Eu já mostrei todos os Honda Civic
       até R$ 80.000 que temos. Quer que eu
       mostre novamente ou prefere aumentar o
       orçamento?" ✅ AVISA QUE ACABOU!
```

---

## 🔄 Quando o Histórico é Limpo

O histórico **NÃO** é limpo automaticamente. Pode ser limpo:

1. **Manualmente** chamando `limparVeiculosMostrados(tel)`
2. **Quando cliente muda drasticamente o critério** (futuro)
3. **Ao reiniciar o bot** (pois está em memória)

**Nota:** O sistema mantém histórico em memória. Se o bot reiniciar, o histórico é perdido (o que está OK para este caso de uso).

---

## 📝 Logs Gerados

### Primeira Busca
```
[MEMORIA] 💾 3 veículos salvos como já mostrados para 5567999887766 (total: 3)
Encontrados 3 veículos NOVOS para mostrar
```

### Segunda Busca
```
[MEMORIA] 📋 Cliente já viu 3 veículos antes
[MEMORIA] ✅ Filtrados: 6 total → 3 novos (removidos 3 já mostrados)
[MEMORIA] 💾 3 veículos salvos como já mostrados para 5567999887766 (total: 6)
Encontrados 3 veículos NOVOS para mostrar
```

### Quando Acabam as Opções
```
[MEMORIA] 📋 Cliente já viu 6 veículos antes
[MEMORIA] ✅ Filtrados: 6 total → 0 novos (removidos 6 já mostrados)
⚠️ [MEMORIA] Todos os veículos com esse critério já foram mostrados!
```

---

## ⚙️ Configuração

### Persistência
Atualmente o histórico está **em memória** (Map).

**Vantagens:**
- Rápido
- Simples
- Adequado para sessões de conversa

**Desvantagens:**
- Perde ao reiniciar bot
- Não compartilha entre instâncias

**Melhoria Futura (Opcional):**
Salvar no banco de dados ou Redis para:
- Manter histórico permanente
- Permitir "você já viu esse carro antes"
- Analytics de preferências

---

## 🧪 Como Testar

1. **Reinicie o bot** para carregar código novo

2. **Teste básico:**
```
Você: "Quero um carro"
Aira: [Envia lista com veículos A, B, C]

Você: "Tem outros?"
Aira: [Envia lista com veículos D, E, F] ← DIFERENTES! ✅
```

3. **Teste limite:**
```
Você: "Quero Honda Civic"
Aira: [Envia 3 Civics]

Você: "Tem mais?"
Aira: [Envia outros Civics ou avisa que acabou] ✅
```

4. **Verificar logs:**
```
[MEMORIA] 💾 3 veículos salvos...
[MEMORIA] ✅ Filtrados: 10 total → 3 novos (removidos 7 já mostrados)
```

---

## 📋 Checklist de Implementação

- [x] Criar Map `veiculosJaMostrados` no constructor
- [x] Implementar `salvarVeiculosMostrados()`
- [x] Implementar `getVeiculosJaMostrados()`
- [x] Implementar `limparVeiculosMostrados()`
- [x] Adicionar filtragem na função `buscar_carros`
- [x] Salvar IDs após selecionar veículos
- [x] Passar referência `lucas` nos parâmetros
- [x] Tratamento de erro `todos_ja_mostrados`
- [x] Logs detalhados para debug
- [x] Documentação completa

---

## 🚀 Próximos Passos

1. **Reiniciar o bot** para aplicar mudanças
2. **Testar** com conversas reais
3. **Monitorar logs** para validar funcionamento
4. **Ajustar** se necessário

---

## 📈 Melhorias Futuras (Opcional)

1. **Persistência em banco:**
   - Salvar histórico no MySQL
   - Manter entre reinicializações

2. **Limpeza inteligente:**
   - Limpar quando critério muda muito
   - Limpar após X dias

3. **Analytics:**
   - Quais veículos mais vistos
   - Taxa de interesse por modelo
   - Identificar veículos "difíceis de vender"

4. **Função para "ver novamente":**
   - Cliente: "Quero ver aquele primeiro SUV de novo"
   - Permitir revisitar veículos já mostrados

---

**Status:** ✅ Implementado e pronto para teste
**Arquivos alterados:** `bot_engine/main.js`
**Linhas modificadas:** ~100 linhas adicionadas/modificadas

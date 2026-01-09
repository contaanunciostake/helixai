# 🤖 Sistema de IA para Bot de Vendas - Feirão ShowCar

Sistema completo de Inteligência Artificial com **6 módulos integrados** para maximizar conversões de vendas.

---

## 📁 Estrutura dos Módulos

```
ia-modules/
├── 00-ia-master.js              # Orquestrador principal
├── 01-analisador-intencoes.js   # Detecta intenções do cliente
├── 02-recomendador-inteligente.js # Recomenda veículos personalizados
├── 03-analisador-sentimento.js  # Mede temperatura do lead
├── 04-memoria-contexto.js       # Salva contexto no banco
├── 05-preditor-fechamento.js    # Prevê probabilidade de venda
├── 06-gerador-respostas.js      # Gera respostas personalizadas
└── README.md                    # Este arquivo
```

---

## 🚀 Instalação

### 1. Rodar migração do banco de dados

```bash
mysql -u root -p feiraoshowcarr < migration.sql
```

### 2. Verificar dependências do package.json

Todas as dependências já estão instaladas:
- `openai` - Para GPT-4
- `groq-sdk` - Para Groq (fallback)
- `mysql2` - Para banco de dados

---

## 🔧 Integração no `bot-lucas.js`

### Passo 1: Importar o IA Master

No início do arquivo `bot-lucas.js`, adicione:

```javascript
import { IAMaster } from './ia-modules/00-ia-master.js';
```

### Passo 2: Inicializar dentro da classe LucasVendedor

Na classe `LucasVendedor`, adicione no constructor:

```javascript
class LucasVendedor {
  constructor(repo) {
    this.repo = repo;
    // ... código existente ...

    // ✅ ADICIONE ESTA LINHA:
    this.iaMaster = new IAMaster(
      process.env.OPENAI_API_KEY,
      process.env.GROQ_API_KEY,
      db // Conexão MySQL
    );
  }

  // ... resto do código ...
}
```

### Passo 3: Usar no método `processar()`

Substitua a chamada do GPT antigo por:

```javascript
async processar(tel, msg, sock, nome = 'amigo') {
  try {
    const historico = this.getHistorico(tel);

    // ✅ USAR IA MASTER (substitui GPT antigo)
    const resultado = await this.iaMaster.processar(
      tel,
      msg,
      historico,
      this.repo.veiculos // Passar lista de veículos
    );

    // Se a IA sugeriu buscar carros
    if (resultado.acoes.buscar_carros) {
      const recomendacoes = await this.iaMaster.recomendarVeiculos(
        tel,
        this.repo.veiculos,
        historico
      );

      if (recomendacoes.sucesso) {
        await this.enviarListaComFotos(recomendacoes.veiculos, tel, sock);
        return null; // Lista já foi enviada
      }
    }

    // Se deve fechar agora (probabilidade alta)
    if (resultado.acoes.fechar_agora) {
      console.log('🔥 MOMENTO CRÍTICO: Cliente pronto para fechar!');
      // Adicionar urgência à resposta
      const urgencia = this.iaMaster.gerador.gerarUrgencia(resultado.analises);
      if (urgencia) {
        resultado.resposta += `\n\n${urgencia}`;
      }
    }

    // Adicionar ao histórico
    this.addHistorico(tel, 'Cliente', msg);
    this.addHistorico(tel, 'Lucas', resultado.resposta);

    return resultado.resposta;

  } catch (error) {
    console.error('[PROCESSAR] Erro:', error.message);
    return 'Desculpa, tive um problema. Pode repetir?';
  }
}
```

---

## 📊 Funcionalidades Disponíveis

### 1. Processamento Completo

```javascript
const resultado = await iaMaster.processar(telefone, mensagem, historico, veiculos);

// Retorna:
{
  sucesso: true,
  resposta: "Resposta personalizada gerada",
  analises: {
    intencao: { intencao_principal: "busca", ... },
    sentimento: { temperatura_lead: "quente", score_temperatura: 85 },
    perfil: { tipo_comprador: "emocional", ... },
    predicao: { probabilidade_fechamento: 75 }
  },
  acoes: {
    buscar_carros: true,
    recomendar: true,
    fechar_agora: false
  }
}
```

### 2. Recomendações Personalizadas

```javascript
const recomendacoes = await iaMaster.recomendarVeiculos(telefone, veiculos, historico);

// Retorna veículos com score de relevância
recomendacoes.veiculos.forEach(v => {
  console.log(v.nome, 'Score:', v.score_relevancia);
});
```

### 3. Relatório Completo do Cliente

```javascript
const relatorio = await iaMaster.gerarRelatorio(telefone);

console.log('Temperatura:', relatorio.temperatura.score_atual);
console.log('Probabilidade:', relatorio.evolucao_predicao.probabilidade_atual);
console.log('Insights:', relatorio.insights);
```

### 4. Tratar Objeções

```javascript
const objecao = await iaMaster.tratarObjecao(mensagem, contexto);

if (objecao) {
  console.log('Objeção:', objecao.objecao_detectada.tipo);
  console.log('Contra-argumento:', objecao.contra_argumento);
}
```

---

## 🎯 Como Funciona (Pipeline)

Quando uma mensagem chega:

```
1. ANALISADOR DE INTENÇÕES
   ↓ Detecta: busca, interesse, dúvida, objeção, negociação

2. ANALISADOR DE SENTIMENTO
   ↓ Calcula temperatura: frio/morno/quente (0-100)

3. RECOMENDADOR
   ↓ Cria perfil: prático/emocional/pesquisador

4. PREDITOR DE FECHAMENTO
   ↓ Prevê: probabilidade 0-100%

5. MEMÓRIA/CONTEXTO
   ↓ Salva tudo no banco de dados

6. GERADOR DE RESPOSTAS
   ↓ Cria resposta personalizada baseada em TUDO
```

---

## 🔥 Indicadores de Performance

### Dashboard (Views SQL)

```sql
-- Leads mais promissores
SELECT * FROM v_leads_quentes;

-- Estatísticas gerais
SELECT * FROM v_estatisticas_gerais;

-- Performance por fase
SELECT * FROM v_performance_por_fase;
```

### Exemplo de Uso:

```javascript
// Ver clientes quentes agora
const [leadsQuentes] = await db.execute('SELECT * FROM v_leads_quentes LIMIT 10');

leadsQuentes.forEach(lead => {
  console.log(`${lead.telefone}: ${lead.probabilidade_fechamento}% - ${lead.nivel_temperatura}`);
});
```

---

## 📈 Métricas Geradas Automaticamente

O sistema salva automaticamente:

✅ **Temperatura do lead** (histórico completo)
✅ **Probabilidade de fechamento** (evolução)
✅ **Perfil do cliente** (preferências)
✅ **Veículos vistos** (interesse)
✅ **Resumo de conversas** (pontos principais)
✅ **Métricas de conversão** (taxa de sucesso)

---

## 🧪 Testando o Sistema

### Teste 1: Análise de Intenção

```javascript
const intencao = await iaMaster.analisadorIntencoes.analisar(
  'Procuro um SUV automático até 80 mil',
  []
);

console.log(intencao.intencao_principal); // "busca"
console.log(intencao.entidades.tipo_veiculo); // "suv"
console.log(intencao.entidades.preco_mencionado); // 80000
```

### Teste 2: Temperatura do Lead

```javascript
const temperatura = await iaMaster.analisadorSentimento.analisar(
  '5511999999999',
  'Adorei! Quando posso fazer test drive?',
  historico
);

console.log(temperatura.temperatura_lead); // "quente"
console.log(temperatura.score_temperatura); // 85
```

### Teste 3: Predição

```javascript
const predicao = await iaMaster.preditor.prever('5511999999999', {
  historico: historicoCompleto,
  temperatura: dadosTemperatura,
  perfil: perfilCliente,
  sentimento: dadosSentimento,
  veiculosVistos: 3
});

console.log(predicao.probabilidade_fechamento); // 75%
console.log(predicao.momento_ideal_fechar); // true
```

---

## ⚙️ Configuração Avançada

### Ajustar Pesos da Predição

Em `05-preditor-fechamento.js:_calcularScoreBase()`:

```javascript
// Ajuste os pesos conforme sua operação
score += (temperatura.score_temperatura * 0.4); // 40% temperatura
score += scoresSentimento[sentimento?.sentimento] || 10; // 20% sentimento
// ... etc
```

### Ajustar Prompts

Cada módulo tem prompts configuráveis. Ex: `06-gerador-respostas.js`:

```javascript
// Customize o tom do vendedor
content: 'Você é Lucas, vendedor expert. Seja persuasivo mas genuíno.'
```

---

## 🐛 Troubleshooting

### Erro: "Cannot find module './ia-modules/00-ia-master.js'"

✅ Certifique-se que a pasta `ia-modules` está no mesmo diretório que `bot-lucas.js`

### Erro: "Table 'clientes_contexto' doesn't exist"

✅ Execute a migração: `mysql -u root -p feiraoshowcarr < migration.sql`

### Erro: "OpenAI API rate limit"

✅ O sistema já tem fallback automático para Groq. Confira se `GROQ_API_KEY` está no `.env`

### Respostas muito genéricas

✅ Aumente `temperature` em `06-gerador-respostas.js` de `0.8` para `0.9`

---

## 📊 Exemplo de Log Real

```
🤖 ========== IA MASTER PROCESSANDO ==========
📞 Cliente: 5511999999999
📝 Mensagem: "Tenho interesse no Civic 2020"

[1/6] Analisando intenção...
✓ Intenção: interesse

[2/6] Analisando sentimento...
✓ Sentimento: positivo
✓ Temperatura: quente (78)

[3/6] Criando perfil do cliente...
✓ Tipo: emocional
✓ Prioridades: conforto, status

[4/6] Prevendo probabilidade de fechamento...
✓ Probabilidade: 72%
✓ Classificação: ALTA

[5/6] Salvando contexto...
✓ Contexto salvo

[6/6] Gerando resposta personalizada...
✓ Resposta gerada

✅ ========== PROCESSAMENTO COMPLETO ==========
```

---

## 🎓 Próximos Passos

1. ✅ Execute a migração do banco
2. ✅ Integre o IA Master no bot-lucas.js
3. ✅ Teste com alguns clientes reais
4. ✅ Monitore o dashboard SQL
5. ✅ Ajuste prompts conforme necessário

---

## 🚀 Performance

- **Tempo médio de processamento**: 2-4 segundos
- **Fallback automático**: OpenAI → Groq
- **Cache inteligente**: 5-10 minutos
- **Banco de dados**: MySQL otimizado com índices

---

## 📞 Suporte

Dúvidas? Verifique:
1. Logs do console (debug detalhado)
2. Tabela `interacoes_log` (histórico completo)
3. Views SQL (métricas em tempo real)

---

**Desenvolvido com ❤️ para o Feirão ShowCar**

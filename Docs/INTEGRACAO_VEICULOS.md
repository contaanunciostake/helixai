# Integração de Veículos - VendeAI

Sistema completo para gerenciar veículos integrado ao bot WhatsApp.

## 📋 O que foi feito

### 1. **Model de Veículos** (`database/models.py`)
- ✅ Criada classe `Veiculo` com todos os campos necessários
- ✅ Campos: marca, modelo, versão, ano, preço, quilometragem, cor, etc
- ✅ Relacionamento com empresa
- ✅ Método `to_dict()` para API
- ✅ Suporte a imagens, opcionais (JSON), FIPE, localização

### 2. **API de Veículos** (`backend/routes/veiculos.py`)
- ✅ `GET /api/veiculos` - Lista veículos com filtros
- ✅ `GET /api/veiculos/<id>` - Busca veículo por ID
- ✅ `POST /api/veiculos/buscar` - Busca inteligente (para o bot)
- ✅ `GET /api/veiculos/destaques/<empresa_id>` - Veículos em destaque
- ✅ `GET /api/veiculos/ofertas/<empresa_id>` - Ofertas especiais
- ✅ `GET /api/veiculos/estatisticas/<empresa_id>` - Estatísticas

### 3. **Módulo do Bot** (`bot_engine/veiculos_api.js`)
- ✅ Funções de busca integradas com backend
- ✅ Formatação de mensagens WhatsApp
- ✅ Busca inteligente por texto
- ✅ Formatação de lista e detalhes

### 4. **Script de Importação** (`database/importar_veiculos.py`)
- ✅ Importa dados do `cars.sql` para o banco VendeAI
- ✅ Parser de SQL com regex
- ✅ Tratamento de erros
- ✅ Relatório de importação

## 🚀 Como Usar

### Passo 1: Importar Veículos do SQL

```bash
cd C:\Users\Victor\Documents\VendeAI
python database/importar_veiculos.py
```

Este comando irá:
1. Ler o arquivo `bot_engine/cars.sql`
2. Extrair dados dos veículos
3. Importar para a tabela `veiculos` do banco `vendeai.db`
4. Associar à empresa ID 2 (Empresa Demonstração)

### Passo 2: Testar API de Veículos

#### Listar todos os veículos:
```bash
curl http://localhost:5000/api/veiculos?empresa_id=2
```

#### Buscar veículos em destaque:
```bash
curl http://localhost:5000/api/veiculos/destaques/2
```

#### Buscar ofertas:
```bash
curl http://localhost:5000/api/veiculos/ofertas/2
```

#### Busca inteligente (para o bot):
```bash
curl -X POST http://localhost:5000/api/veiculos/buscar \
  -H "Content-Type: application/json" \
  -d '{"empresa_id": 2, "texto": "gol"}'
```

### Passo 3: Usar no Bot

No arquivo `main.js` do bot, importe o módulo:

```javascript
import {
    buscarVeiculos,
    buscarVeiculosInteligente,
    formatarVeiculoParaMensagem,
    formatarListaVeiculos
} from './veiculos_api.js';
```

Exemplo de uso quando o cliente pedir para ver carros:

```javascript
// Quando detectar interesse em veículos
if (mensagem.includes('carros') || mensagem.includes('veículos')) {
    const veiculos = await buscarDestaques(botAdapter.empresaId, 5);
    const resposta = formatarListaVeiculos(veiculos);
    await sock.sendMessage(telefone, { text: resposta });
}

// Busca específica
if (mensagem.includes('gol') || mensagem.includes('civic')) {
    const veiculos = await buscarVeiculosInteligente(
        botAdapter.empresaId,
        mensagem
    );
    const resposta = formatarListaVeiculos(veiculos);
    await sock.sendMessage(telefone, { text: resposta });
}
```

## 📊 Estrutura do Banco

### Tabela `veiculos`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | Integer | ID único |
| empresa_id | Integer | ID da empresa |
| marca | String | Marca do veículo |
| modelo | String | Modelo |
| versao | String | Versão |
| ano_modelo | String | Ano do modelo |
| preco | Float | Preço de venda |
| preco_anterior | Float | Preço anterior (para promoções) |
| quilometragem | String | KM rodados |
| cor | String | Cor |
| combustivel | String | Tipo de combustível |
| cambio | String | Tipo de câmbio |
| imagem_principal | String | URL da imagem |
| disponivel | Boolean | Se está disponível |
| destaque | Boolean | Se está em destaque |
| oferta_especial | Boolean | Se é oferta especial |

## 🔧 Filtros Disponíveis na API

### GET /api/veiculos

Parâmetros:
- `empresa_id` (obrigatório) - ID da empresa
- `marca` - Filtrar por marca
- `modelo` - Filtrar por modelo
- `ano_min` - Ano mínimo
- `ano_max` - Ano máximo
- `preco_min` - Preço mínimo
- `preco_max` - Preço máximo
- `destaque` - Apenas destaques (true/false)
- `disponivel` - Apenas disponíveis (padrão: true)
- `limite` - Quantidade máxima de resultados (padrão: 50)

### Exemplos de Busca

```bash
# Veículos Honda entre 2015 e 2020
curl "http://localhost:5000/api/veiculos?empresa_id=2&marca=Honda&ano_min=2015&ano_max=2020"

# Veículos até R$ 50.000
curl "http://localhost:5000/api/veiculos?empresa_id=2&preco_max=50000"

# Apenas destaques
curl "http://localhost:5000/api/veiculos?empresa_id=2&destaque=true&limite=5"
```

## 🤖 Integração com IA do Bot

O bot pode usar a busca inteligente para entender perguntas como:

- "Tem algum Gol?"
- "Quero ver carros até 40 mil"
- "Tem Civic automático?"
- "Mostre os carros em promoção"

Exemplo de integração na IA:

```javascript
// No processamento da mensagem
const intencao = await detectarIntencao(mensagem);

if (intencao === 'buscar_veiculo') {
    const termoBusca = extrairTermoBusca(mensagem); // Ex: "gol", "civic"
    const veiculos = await buscarVeiculosInteligente(empresaId, termoBusca);

    if (veiculos.length > 0) {
        const resposta = formatarListaVeiculos(veiculos);
        await enviarMensagem(telefone, resposta);

        // Enviar primeira imagem se disponível
        if (veiculos[0].imagem) {
            await enviarImagem(telefone, veiculos[0].imagem);
        }
    }
}
```

## 📝 Próximos Passos (Opcional)

1. **Adicionar Imagens ao Banco**
   - Baixar imagens dos veículos
   - Salvar em `backend/static/veiculos/`
   - Atualizar campo `imagem_principal`

2. **Melhorar Parser do SQL**
   - Extrair marca e modelo do nome do arquivo de imagem
   - Parsear descrições mais detalhadas

3. **Criar Interface Web**
   - CRUD de veículos no painel admin
   - Upload de imagens
   - Gestão de estoque

4. **Integrar com FIPE**
   - Buscar valor FIPE automaticamente
   - Calcular porcentagem do valor de tabela
   - Alertar quando preço está muito abaixo

## 🐛 Troubleshooting

### Erro ao importar veículos
```bash
# Verificar se tabela existe
python -c "from database.models import DatabaseManager; db = DatabaseManager(); db.create_all()"
```

### API retorna erro 500
```bash
# Verificar logs do Flask
# Verificar se banco existe em: C:\Users\Victor\Documents\VendeAI\vendeai.db
```

### Bot não encontra veículos
```bash
# Testar endpoint diretamente
curl http://localhost:5000/api/veiculos?empresa_id=2

# Verificar se backend está rodando
netstat -ano | findstr :5000
```

## ✅ Checklist de Implementação

- [x] Model `Veiculo` criado
- [x] Tabela criada no banco
- [x] API de veículos funcionando
- [x] Blueprint registrado no Flask
- [x] Módulo JavaScript para o bot
- [x] Script de importação
- [ ] Dados importados do SQL
- [ ] Bot integrado (usar veiculos_api.js)
- [ ] Testar busca completa
- [ ] Adicionar imagens

## 📚 Documentação das Funções

### `buscarVeiculos(empresaId, filtros)`
Busca veículos com filtros personalizados.

```javascript
const veiculos = await buscarVeiculos(2, {
    marca: 'Honda',
    ano_min: '2015',
    preco_max: 50000,
    limite: 10
});
```

### `buscarVeiculosInteligente(empresaId, texto)`
Busca baseada em texto livre (marca, modelo ou descrição).

```javascript
const veiculos = await buscarVeiculosInteligente(2, 'civic preto');
```

### `formatarVeiculoParaMensagem(veiculo)`
Formata um veículo para envio no WhatsApp.

```javascript
const mensagem = formatarVeiculoParaMensagem(veiculo);
// Retorna texto formatado com emojis
```

### `formatarListaVeiculos(veiculos)`
Formata uma lista de veículos para WhatsApp.

```javascript
const mensagem = formatarListaVeiculos(veiculos);
// Retorna lista numerada com resumo dos veículos
```

---

**Pronto!** 🎉 Agora você tem um sistema completo de veículos integrado ao VendeAI!

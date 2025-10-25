# 🎉 Sistema de Produtos e Configuração com IA - VendeAI

## 📋 O que foi adicionado?

### ✅ **1. Gestão Completa de Produtos**

Agora você pode cadastrar todo o catálogo de produtos da sua empresa, e o bot terá acesso automático a essas informações para apresentar aos clientes!

**Funcionalidades:**
- 📤 Upload de CSV com catálogo completo
- 📊 Painel de gestão de produtos
- 🔍 Busca e filtros avançados
- 📈 Estatísticas de estoque e valores
- 🗂️ Categorização de produtos
- 💰 Controle de preços e promoções
- 📦 Gestão de estoque
- 🔗 Links e imagens dos produtos

### ✅ **2. Configuração Inteligente do Bot via IA**

Use o GPT-4 para configurar automaticamente o comportamento do seu robô! Basta descrever seu negócio e a IA cria:
- 🧠 Prompt personalizado para o bot
- 💬 Mensagens de boas-vindas, ausência e encerramento
- 🎯 Tom de conversa adaptado ao seu negócio
- 🔑 Palavras-chave de interesse
- ❓ Perguntas de qualificação de leads
- 📝 Respostas frequentes

---

## 🚀 Como Usar

### **Passo 1: Acessar o Sistema de Produtos**

1. Inicie o VendeAI normalmente:
   ```bash
   cd C:\Users\Victor\Documents\VendeAI
   python backend/app.py
   ```

2. Faça login com suas credenciais:
   - **Email:** demo@vendeai.com
   - **Senha:** demo123

3. No menu superior, clique em **"Produtos"** 📦

### **Passo 2: Importar Produtos via CSV**

1. Na página de Produtos, clique em **"Importar CSV"**

2. **Baixe o template CSV** para ver o formato correto

3. Preencha seu CSV com os produtos:
   ```csv
   nome,descricao,categoria,preco,preco_promocional,estoque,sku,marca,disponivel,palavras_chave,link,imagem_url
   Camiseta Básica,100% algodão,Roupas,59.90,49.90,100,CAM-001,MarcaX,true,"camiseta,básica",https://loja.com/cam-001,https://img.com/cam-001.jpg
   ```

4. Faça o upload do arquivo

5. **Pronto!** Seus produtos já estão no sistema

### **Passo 3: Configurar o Bot com IA**

1. Na página de Produtos, clique em **"Configurar Bot IA"** 🤖

2. Preencha as informações do seu negócio:
   - **Descrição da empresa:** O que sua empresa faz?
   - **Produtos/Serviços:** O que você vende?
   - **Público-Alvo:** Quem são seus clientes?
   - **Diferenciais:** Por que comprar de você?

3. Clique em **"Gerar Configuração com IA"** ✨

4. Aguarde alguns segundos enquanto o GPT-4 cria sua configuração

5. Revise a configuração gerada:
   - Prompt do Sistema
   - Mensagens personalizadas
   - Palavras-chave
   - Perguntas de qualificação

6. Clique em **"Aceitar e Salvar"**

7. **Pronto!** Seu bot está configurado e conhece todos os seus produtos

---

## 📁 Estrutura de Arquivos Adicionados

```
VendeAI/
├── backend/
│   ├── ia_configurador.py              ← Módulo de IA (GPT-4)
│   ├── routes/
│   │   └── produtos.py                 ← Rotas de produtos
│   └── templates/
│       └── produtos/
│           ├── index.html              ← Painel de produtos
│           ├── upload.html             ← Upload de CSV
│           └── config_avancada.html    ← Configuração com IA
│
├── database/
│   └── models.py                       ← +2 tabelas (produtos, arquivos_importacao)
│
├── uploads/
│   └── produtos/                       ← Arquivos CSV importados
│
└── atualizar_banco.py                  ← Script de atualização
```

---

## 🗂️ Estrutura do Banco de Dados

### **Tabela: produtos**
```
- id (int)
- empresa_id (int) - FK para empresas
- nome (string) - Nome do produto
- descricao (text) - Descrição completa
- categoria (string) - Categoria
- subcategoria (string) - Subcategoria
- preco (float) - Preço normal
- preco_promocional (float) - Preço em promoção
- moeda (string) - BRL
- estoque (int) - Quantidade em estoque
- disponivel (bool) - Disponível para venda?
- sku (string) - Código SKU
- codigo_barras (string) - Código de barras
- marca (string) - Marca do produto
- peso (float) - Peso em kg
- dimensoes (string) - Dimensões LxAxP
- palavras_chave (JSON) - Palavras-chave para busca
- tags (JSON) - Tags adicionais
- link (string) - URL do produto
- imagem_url (string) - URL da imagem
- dados_extras (JSON) - Dados adicionais flexíveis
- ativo (bool) - Produto ativo?
- criado_em (datetime)
- atualizado_em (datetime)
- importado_csv (bool) - Veio de importação?
```

### **Tabela: arquivos_importacao**
```
- id (int)
- empresa_id (int) - FK para empresas
- nome_arquivo (string) - Nome do CSV
- tipo (string) - Tipo (produtos, leads)
- caminho (string) - Caminho do arquivo
- total_linhas (int) - Total de linhas
- importados_sucesso (int) - Importados com sucesso
- importados_erro (int) - Erros
- erros_detalhes (JSON) - Detalhes dos erros
- status (string) - processando/concluido/erro
- importado_por_id (int) - FK para usuarios
- criado_em (datetime)
```

---

## 🎯 Casos de Uso

### **Caso 1: Loja de Roupas**

1. Importa CSV com 500 produtos (vestidos, blusas, calças...)
2. Configura bot via IA:
   - "Somos uma loja de roupas femininas jovens"
   - Público: Mulheres 18-35 anos
3. Bot agora conhece todo catálogo e pode:
   - Recomendar produtos baseado no interesse
   - Informar preços e disponibilidade
   - Sugerir combos e promoções

### **Caso 2: Concessionária de Veículos**

1. Importa CSV com veículos disponíveis
2. Configura bot via IA:
   - "Vendemos carros seminovos e 0km"
   - Diferencial: Melhor preço da região
3. Bot pode:
   - Mostrar veículos disponíveis
   - Filtrar por preço/marca/ano
   - Agendar test drive

### **Caso 3: Loja de Eletrônicos**

1. Importa catálogo de notebooks, celulares, TVs...
2. Bot configurado com tom técnico
3. Bot pode:
   - Comparar especificações
   - Sugerir produtos similares
   - Informar garantias e condições

---

## 🔧 Configuração Avançada

### **Personalizar Prompt do Bot Manualmente**

Se você quiser ajustar o prompt gerado pela IA:

1. Acesse **Produtos > Configurar Bot IA**
2. Gere a configuração com IA
3. Edite os campos da seção "Configuração Gerada"
4. Salve as alterações

### **API Keys Necessárias**

Para usar a geração com IA, você precisa de:

- **OpenAI API Key** (GPT-4)
  - Obtenha em: https://platform.openai.com/api-keys
  - Configure em: Configurações > Integrações
  - Ou adicione no arquivo `.env`: `OPENAI_API_KEY=sk-...`

---

## 📊 Formatos Suportados de CSV

### **Campos Obrigatórios:**
- `nome` - Nome do produto (obrigatório)

### **Campos Opcionais:**
- `descricao` - Descrição do produto
- `categoria` - Categoria
- `preco` - Preço (formato: 59.90)
- `preco_promocional` - Preço promocional
- `estoque` - Quantidade em estoque
- `sku` - Código SKU
- `marca` - Marca
- `disponivel` - true/false
- `palavras_chave` - Separadas por vírgula: "camiseta,básica,preta"
- `link` - URL do produto
- `imagem_url` - URL da imagem

### **Exemplo de CSV:**

```csv
nome,descricao,categoria,preco,estoque,disponivel
Notebook Dell,Core i5 8GB RAM,Informática,2999.90,5,true
Mouse Logitech,Mouse sem fio,Acessórios,89.90,50,true
Teclado Mecânico,RGB retroiluminado,Acessórios,299.90,0,false
```

---

## 🐛 Solução de Problemas

### **Erro ao importar CSV**

**Problema:** "Erro ao processar CSV"

**Solução:**
1. Verifique se o arquivo está codificado em UTF-8
2. Certifique-se de que a primeira linha contém os cabeçalhos
3. Use ponto (.) para separar decimais, não vírgula
4. Baixe o template e compare com seu arquivo

### **IA não gera configuração**

**Problema:** "API Key do OpenAI não configurada"

**Solução:**
1. Obtenha uma API Key em https://platform.openai.com
2. Configure no sistema ou arquivo .env
3. Certifique-se de ter créditos na conta OpenAI

### **Produtos não aparecem no bot**

**Problema:** Bot não menciona os produtos

**Solução:**
1. Verifique se os produtos estão marcados como "disponível"
2. Gere novamente a configuração do bot com IA
3. O bot precisará "conhecer" o catálogo no prompt

---

## 🎓 Próximos Passos

Agora que você tem o sistema de produtos integrado:

1. **Importe seu catálogo completo** via CSV
2. **Configure o bot com IA** para conhecer seus produtos
3. **Teste o bot** enviando mensagens perguntando sobre produtos
4. **Monitore os resultados** no dashboard
5. **Ajuste conforme necessário** a configuração do bot

---

## 🤝 Suporte

Se precisar de ajuda:

1. Consulte a documentação em `/api/docs`
2. Revise os logs em `logs/`
3. Verifique o `COMO_USAR.md` para instruções gerais

---

## ✨ Funcionalidades Futuras (Roadmap)

- [ ] Recomendação automática de produtos baseada em IA
- [ ] Integração com e-commerce (WooCommerce, Shopify)
- [ ] Catálogo de produtos em PDF para envio via WhatsApp
- [ ] Análise de produtos mais procurados
- [ ] Alertas de estoque baixo
- [ ] Sincronização automática de preços

---

**Desenvolvido com ❤️ para o VendeAI**

**Versão:** 2.0 - Sistema de Produtos e IA
**Data:** Outubro 2025

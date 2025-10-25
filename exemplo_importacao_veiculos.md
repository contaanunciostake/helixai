# 📊 Exemplo de Excel para Importação de Veículos

## ✅ Formato do Arquivo Excel

Crie um arquivo Excel (.xlsx) com as seguintes colunas:

| Marca | Modelo | Ano | KM | Preço | Combustível | Cor | Descrição | Fotos |
|-------|--------|-----|-------|--------|------------|-----|-----------|-------|
| Volkswagen | Gol | 2020 | 50000 | 45000 | Flex | Preto | Completo, único dono | https://exemplo.com/gol1.jpg,https://exemplo.com/gol2.jpg |
| Chevrolet | Onix | 2021 | 30000 | 55000 | Flex | Branco | Semi-novo, revisado | https://exemplo.com/onix.jpg |
| Fiat | Uno | 2019 | 60000 | 35000 | Gasolina | Prata | Básico, econômico | |
| Honda | Civic | 2022 | 15000 | 85000 | Flex | Cinza | Top de linha | https://exemplo.com/civic1.jpg;https://exemplo.com/civic2.jpg;https://exemplo.com/civic3.jpg |
| Toyota | Corolla | 2020 | 40000 | 75000 | Flex | Branco | Automático | https://exemplo.com/corolla.jpg |

## 📋 Descrição das Colunas:

### Obrigatórias ✅

1. **Marca** (ex: Volkswagen, Chevrolet, Fiat)
2. **Modelo** (ex: Gol, Onix, Uno)
3. **Ano** (ex: 2020, 2021)
4. **KM** (ex: 50000, 30000)
5. **Preço** (ex: 45000, 55000.50)
   - Aceita vírgula ou ponto: 45.000 ou 45,000
   - Com ou sem R$: R$ 45.000 ou 45000
6. **Combustível** (ex: Flex, Gasolina, Diesel, Álcool)

### Opcionais 📝

7. **Cor** (ex: Preto, Branco, Prata)
8. **Descrição** (ex: "Completo, único dono, revisado")
9. **Fotos** (URLs das fotos, separadas por vírgula ou ponto-e-vírgula)
   - Exemplo com vírgula: `https://site.com/foto1.jpg,https://site.com/foto2.jpg`
   - Exemplo com ponto-e-vírgula: `https://site.com/foto1.jpg;https://site.com/foto2.jpg`

## 🎨 Formatos Aceitos:

- **Excel:** `.xlsx` ou `.xls`
- **CSV:** `.csv` (UTF-8)

## 📸 Como Adicionar Fotos:

### Opção 1: URLs Públicas
```
https://exemplo.com/carro1.jpg,https://exemplo.com/carro2.jpg
```

### Opção 2: Links do Google Drive
```
https://drive.google.com/file/d/ID_DO_ARQUIVO/view,https://drive.google.com/file/d/OUTRO_ID/view
```

### Opção 3: Imgur ou outras plataformas
```
https://i.imgur.com/ABC123.jpg,https://i.imgur.com/DEF456.jpg
```

**Importante:** As fotos devem estar hospedadas online e serem acessíveis publicamente.

## ⚙️ Variações de Nome Aceitas:

O sistema aceita variações nos nomes das colunas:

| Coluna Padrão | Aceita Também |
|---------------|---------------|
| Preço | Preco, Valor, Price |
| Combustível | Combustivel, Comb |
| Descrição | Descricao, Desc, Description |
| KM | Quilometragem, Odometro |

## ✅ Exemplo de Dados Reais:

```csv
Marca,Modelo,Ano,KM,Preço,Combustível,Cor,Descrição,Fotos
Volkswagen,Gol,2020,50000,45000,Flex,Preto,Completo único dono,https://exemplo.com/gol1.jpg
Chevrolet,Onix,2021,30000,55000,Flex,Branco,Semi-novo revisado,https://exemplo.com/onix1.jpg,https://exemplo.com/onix2.jpg
Fiat,Uno,2019,60000,35000,Gasolina,Prata,Básico econômico,
Honda,Civic,2022,15000,85000,Flex,Cinza,Top de linha,https://exemplo.com/civic1.jpg
Toyota,Corolla,2020,40000,75000,Flex,Branco,Automático,https://exemplo.com/corolla.jpg
```

## 🧪 Como Testar:

1. **Crie um arquivo Excel** com os dados acima
2. **Salve como** `meu_estoque.xlsx`
3. **No CRM de Veículos:**
   - Clique em "Importar Estoque"
   - Arraste o arquivo ou clique para selecionar
   - Clique "Importar Estoque"
4. ✅ **Veículos importados com sucesso!**

## ❌ Erros Comuns:

### Erro: "Colunas faltando"
**Solução:** Certifique-se de que todas as colunas obrigatórias existem:
- Marca
- Modelo
- Ano
- KM
- Preço
- Combustível

### Erro: "Formato não suportado"
**Solução:** Use apenas:
- Excel: `.xlsx` ou `.xls`
- CSV: `.csv`

### Erro na linha específica
**Solução:** Verifique se:
- Ano é número (2020, não "dois mil e vinte")
- KM é número (50000, não "50 mil")
- Preço é número (45000 ou 45.000, não "quarenta e cinco mil")

## 📊 Template Excel Pronto:

Baixe o template vazio:
[Disponível em: `D:\Helix\HelixAI\template_importacao_veiculos.xlsx`]

**Basta preencher e importar!** 🚀

---

## 🎯 Resultado Esperado:

Após importar, os veículos aparecerão:
- ✅ No dashboard (estatísticas)
- ✅ Na página de Estoque
- ✅ Disponíveis para consulta do bot WhatsApp
- ✅ Com fotos (se fornecidas)

**Cada foto será exibida no CRM e enviada para clientes via WhatsApp!** 📸

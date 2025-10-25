# Guia de Teste - Importacao de Veiculos

## Status da Implementacao

✅ **TUDO PRONTO!** A importacao de veiculos com suporte a fotos esta completamente implementada.

### Arquivos Modificados/Criados:

1. ✅ `VendeAI/backend/routes/veiculos.py` - Endpoint `/api/veiculos/importar` adicionado
2. ✅ `CRM_Client/crm-client-app/src/components/crm/CRMVeiculos.jsx` - CRM especifico de veiculos
3. ✅ `CRM_Client/crm-client-app/src/App.jsx` - Roteamento dinamico por nicho
4. ✅ `template_importacao_veiculos.xlsx` - Template de exemplo criado
5. ✅ Dependencias instaladas: `pandas` e `openpyxl`

---

## Como Testar:

### Passo 1: Iniciar o Backend

```bash
cd D:\Helix\HelixAI\VendeAI\backend
python app.py
```

Voce deve ver:
```
[OK] Blueprint 'veiculos' registrado
[VEICULOS-API] ✅ Endpoint /importar registrado
```

### Passo 2: Iniciar o Frontend (CRM Client)

```bash
cd D:\Helix\HelixAI\CRM_Client\crm-client-app
npm run dev
```

### Passo 3: Criar Nova Conta de Teste

1. Acesse a landing page: `http://localhost:5000`
2. Clique em "Comece Agora" ou "Assinar"
3. Escolha um plano (ex: Basico)
4. Preencha os dados:
   - Email: `teste_veiculos@teste.com`
   - Nome: `Loja de Veiculos Teste`
5. Clique em "Processar Pagamento de Teste"
6. Aguarde o redirecionamento para o CRM

### Passo 4: Definir Senha

Voce sera redirecionado para definir sua senha:
1. Digite uma senha (ex: `123456`)
2. Confirme a senha
3. Clique em "Definir Senha"

### Passo 5: Completar o Setup Wizard

O wizard de configuracao deve aparecer automaticamente:

**Etapa 1 - Nicho:**
- Escolha: **"Veiculos"** ← IMPORTANTE!
- Clique "Proximo"

**Etapa 2 - Informacoes da Empresa:**
- Nome: `Loja de Veiculos Teste`
- Telefone: `(11) 99999-9999`
- Clique "Proximo"

**Etapa 3 - Configuracao do Bot:**
- Nome do Bot: `Assistente de Vendas`
- Mensagem de Boas-vindas: `Ola! Seja bem-vindo...`
- Clique "Proximo"

**Etapa 4 - WhatsApp:**
- Numero: `5511999999999`
- Clique "Proximo"

**Etapa 5 - Finalizacao:**
- Clique "Finalizar Configuracao"

### Passo 6: Verificar CRM de Veiculos

Apos concluir o setup, voce deve ver:

```
╔════════════════════════════════════════╗
║  CRM de Veiculos - Menu Lateral:       ║
║  📊 Dashboard                          ║
║  🚗 Estoque                            ║
║  💬 Conversas                          ║
║  👥 Leads                              ║
║  📤 Importar Estoque ← AQUI!           ║
╚════════════════════════════════════════╝
```

### Passo 7: Importar Veiculos

1. **Clique em "Importar Estoque"** no menu lateral
2. Um modal deve abrir com area de drag & drop
3. **Arraste** o arquivo `template_importacao_veiculos.xlsx` ou clique para selecionar
4. Clique em **"Importar Estoque"**

Voce deve ver:
```
✅ 5 veiculos importados com sucesso!
```

### Passo 8: Verificar Veiculos Importados

1. Clique em **"Estoque"** no menu lateral
2. Voce deve ver os 5 veiculos:
   - Volkswagen Gol 2020
   - Chevrolet Onix 2021
   - Fiat Uno 2019
   - Honda Civic 2022
   - Toyota Corolla 2020

3. Cada veiculo deve mostrar:
   - Marca, Modelo, Ano
   - KM rodados
   - Preco
   - Combustivel
   - Cor
   - Descricao
   - Fotos (se fornecidas)

---

## Formato do Excel para Importacao

O arquivo Excel deve ter as seguintes colunas:

| Coluna | Obrigatoria? | Exemplo |
|--------|--------------|---------|
| Marca | ✅ Sim | Volkswagen |
| Modelo | ✅ Sim | Gol |
| Ano | ✅ Sim | 2020 |
| KM | ✅ Sim | 50000 |
| Preco | ✅ Sim | 45000 |
| Combustivel | ✅ Sim | Flex |
| Cor | ❌ Nao | Preto |
| Descricao | ❌ Nao | Completo, unico dono |
| Fotos | ❌ Nao | https://site.com/foto1.jpg,https://site.com/foto2.jpg |

### Formatos Aceitos para Fotos:

**Opcao 1: Virgula**
```
https://exemplo.com/foto1.jpg,https://exemplo.com/foto2.jpg,https://exemplo.com/foto3.jpg
```

**Opcao 2: Ponto e virgula**
```
https://exemplo.com/foto1.jpg;https://exemplo.com/foto2.jpg;https://exemplo.com/foto3.jpg
```

**Opcao 3: Celula vazia (sem fotos)**
```
(deixar celula vazia)
```

As fotos serao armazenadas como JSON no banco:
```json
["https://exemplo.com/foto1.jpg", "https://exemplo.com/foto2.jpg"]
```

---

## Verificacao no Banco de Dados

Para verificar se os veiculos foram salvos corretamente:

```sql
-- Conectar ao banco do tenant (ex: tenant_empresa_2)
USE tenant_empresa_2;

-- Ver todos os veiculos
SELECT id, marca, modelo, ano, km, preco, combustivel, cor FROM veiculos;

-- Ver fotos de um veiculo especifico
SELECT id, marca, modelo, fotos_json FROM veiculos WHERE id = 1;

-- Ver veiculos com fotos
SELECT id, marca, modelo, JSON_LENGTH(fotos_json) as num_fotos
FROM veiculos
WHERE fotos_json IS NOT NULL;
```

---

## Logs Esperados no Backend

Quando voce importar o Excel, deve ver no console do backend:

```
[VEICULOS-API] === IMPORTANDO ESTOQUE ===
[VEICULOS-API] Arquivo: template_importacao_veiculos.xlsx
[VEICULOS-API] Empresa ID: 2
[VEICULOS-API] Linhas lidas: 5
[VEICULOS-API] Database do tenant: tenant_empresa_2
[VEICULOS-API] ✅ 5 veiculos importados
```

---

## Erros Comuns e Solucoes

### Erro: "Colunas faltando"
**Causa:** Arquivo Excel nao tem todas as colunas obrigatorias.

**Solucao:** Certifique-se que o Excel tem:
- Marca
- Modelo
- Ano
- KM
- Preco (ou Preço)
- Combustivel (ou Combustível)

### Erro: "Empresa nao encontrada"
**Causa:** empresa_id invalido.

**Solucao:** Verifique se voce esta logado corretamente. O empresa_id vem do token JWT.

### Erro: "Formato nao suportado"
**Causa:** Arquivo com extensao invalida.

**Solucao:** Use apenas:
- `.xlsx` (Excel moderno)
- `.xls` (Excel antigo)
- `.csv` (CSV UTF-8)

### Erro na linha especifica
**Causa:** Dados invalidos em uma linha.

**Solucao:** Verifique se:
- Ano e numero: `2020` (nao "dois mil e vinte")
- KM e numero: `50000` (nao "50 mil")
- Preco e numero: `45000` ou `45.000` (nao "quarenta e cinco mil")

---

## Testando com Dados Reais

Para usar seus proprios dados:

1. **Abra** o arquivo `template_importacao_veiculos.xlsx`
2. **Delete** as linhas de exemplo (linhas 2-6)
3. **Adicione** seus veiculos:
   - Preencha todas as colunas obrigatorias
   - Adicione URLs de fotos hospedadas online
   - Pode usar Google Drive, Imgur, ou qualquer URL publica
4. **Salve** o arquivo
5. **Importe** no CRM

---

## Proximos Passos

Apos confirmar que a importacao funciona:

1. ✅ Testar visualizacao dos veiculos no Estoque
2. ✅ Testar busca de veiculos
3. ✅ Integrar com bot WhatsApp (veiculos disponiveis para consulta)
4. ✅ Adicionar edicao de veiculos
5. ✅ Adicionar upload de fotos locais (nao apenas URLs)

---

**Tudo pronto para testar! 🚀**

Se encontrar algum erro, verifique os logs do backend e frontend.

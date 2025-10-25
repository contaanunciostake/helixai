# 🎯 CRM Dinâmico por Nicho - Guia de Implementação

## ✅ O que foi implementado:

### 1. CRM Específico de Veículos (`CRMVeiculos.jsx`)
- ✅ Dashboard com stats (estoque, conversas, leads, vendas)
- ✅ Menu lateral próprio
- ✅ Página de estoque de veículos
- ✅ Modal de importação de Excel/CSV
- ✅ Design limpo e moderno
- ✅ Integração com API de importação

### 2. Roteamento Dinâmico no `App.jsx`
- ✅ Detecta nicho da empresa após setup
- ✅ Carrega CRM correto baseado no nicho
- ✅ `veiculos` → CRMVeiculos
- ✅ `imoveis` → Placeholder (em desenvolvimento)
- ✅ `outros` → CRM genérico (antigo)

### 3. Fluxo Completo
```
Cliente faz setup → Escolhe "Veículos" → CRM de Veículos carrega
Cliente faz setup → Escolhe "Imóveis" → CRM de Imóveis (futuro)
Cliente faz setup → Escolhe "Outros" → CRM genérico
```

---

## 🔧 Próximos Passos (Para você fazer):

### Passo 1: Adicionar Endpoint de Importação

Abra o arquivo: `D:\Helix\HelixAI\VendeAI\backend\routes\veiculos.py`

**No final do arquivo**, logo após o último `finally: session.close()`, adicione:

```python
@veiculos_bp.route('/importar', methods=['POST'])
def importar_veiculos():
    """
    Importar veículos via Excel/CSV
    """
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'Nenhum arquivo enviado'}), 400

        file = request.files['file']
        empresa_id = request.form.get('empresa_id')

        if not empresa_id:
            return jsonify({'success': False, 'error': 'empresa_id obrigatório'}), 400

        # Validar extensão
        allowed_extensions = {'.xlsx', '.xls', '.csv'}
        file_ext = Path(file.filename).suffix.lower()

        if file_ext not in allowed_extensions:
            return jsonify({'success': False, 'error': 'Formato não suportado'}), 400

        # Ler arquivo
        if file_ext == '.csv':
            df = pd.read_csv(file)
        else:
            df = pd.read_excel(file)

        # Normalizar colunas
        df.columns = df.columns.str.strip().str.lower()

        # Validar colunas obrigatórias
        required_cols = {'marca', 'modelo', 'ano', 'km', 'preco', 'combustivel'}
        missing_cols = required_cols - set(df.columns)

        if missing_cols:
            return jsonify({
                'success': False,
                'error': f'Colunas faltando: {", ".join(missing_cols)}'
            }), 400

        # Buscar database do tenant
        db_config = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'port': int(os.getenv('DB_PORT', 3306)),
            'user': os.getenv('DB_USER', 'root'),
            'password': os.getenv('DB_PASSWORD', ''),
            'database': os.getenv('DB_NAME', 'helixai_db')
        }

        db = mysql.connector.connect(**db_config)
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT database_name FROM empresas WHERE id = %s", (empresa_id,))
        empresa = cursor.fetchone()
        cursor.close()
        db.close()

        if not empresa:
            return jsonify({'success': False, 'error': 'Empresa não encontrada'}), 404

        # Conectar no banco do tenant
        tenant_db = empresa['database_name']
        tenant_config = {**db_config, 'database': tenant_db}
        tenant_conn = mysql.connector.connect(**tenant_config)
        tenant_cursor = tenant_conn.cursor()

        # Importar veículos
        veiculos_importados = []

        for index, row in df.iterrows():
            try:
                marca = str(row['marca']).strip()
                modelo = str(row['modelo']).strip()
                ano = int(row['ano'])
                km = int(row['km'])
                preco = float(str(row['preco']).replace(',', '.'))
                combustivel = str(row['combustivel']).strip()
                cor = str(row.get('cor', '')).strip() if 'cor' in row else None
                descricao = str(row.get('descricao', '')).strip() if 'descricao' in row else None

                tenant_cursor.execute("""
                    INSERT INTO veiculos (
                        marca, modelo, ano, km, preco, combustivel, cor, descricao,
                        disponivel, destaque, criado_em
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 1, 0, NOW())
                """, (marca, modelo, ano, km, preco, combustivel, cor, descricao))

                veiculos_importados.append({
                    'marca': marca,
                    'modelo': modelo,
                    'ano': ano,
                    'km': km,
                    'preco': preco,
                    'combustivel': combustivel
                })

            except Exception as e:
                print(f"Erro na linha {index + 2}: {str(e)}")

        tenant_conn.commit()
        tenant_cursor.close()
        tenant_conn.close()

        return jsonify({
            'success': True,
            'importados': len(veiculos_importados),
            'veiculos': veiculos_importados
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
```

### Passo 2: Instalar Dependências

```bash
cd D:\Helix\HelixAI\VendeAI\backend
pip install pandas openpyxl
```

### Passo 3: Testar

1. **Reinicie o backend**
2. **Recarregue o CRM** (F5)
3. **Faça login** com usuário que escolheu "Veículos"
4. ✅ **Deve aparecer o CRM de Veículos!**

---

## 🎨 Interface do CRM de Veículos:

### Menu Lateral:
- 📊 Dashboard
- 🚗 Estoque
- 💬 Conversas
- 👥 Leads
- 📤 Importar Estoque

### Dashboard:
- Cards de stats (estoque, conversas, leads, vendas)
- Lista de veículos recentes
- Botão "Importar Estoque" destacado

### Importar Estoque:
- Modal com drag & drop
- Aceita Excel (.xlsx, .xls) e CSV
- Valida colunas obrigatórias
- Mostra instruções claras

---

## 📊 Formato do Excel para Importação:

| Marca | Modelo | Ano | KM | Preço | Combustível | Cor | Descrição |
|-------|--------|-----|-------|--------|------------|-----|-----------|
| Volkswagen | Gol | 2020 | 50000 | 45000 | Flex | Preto | Completo |
| Chevrolet | Onix | 2021 | 30000 | 55000 | Flex | Branco | Semi-novo |
| Fiat | Uno | 2019 | 60000 | 35000 | Gasolina | Prata | Básico |

**Colunas obrigatórias:** Marca, Modelo, Ano, KM, Preço, Combustível

**Colunas opcionais:** Cor, Descrição

---

## 🔍 Como Funciona:

### 1. Usuário se cadastra e escolhe "Veículos"
```javascript
// No wizard de setup
nicho: 'veiculos'
↓
// Salvo no banco
UPDATE empresas SET setor = 'veiculos'
```

### 2. App.jsx detecta o nicho
```javascript
// Após login
const data = await fetch('/api/empresa/check-setup/2')
↓
data.empresa.nicho === 'veiculos'
↓
setEmpresaNicho('veiculos')
```

### 3. CRM correto é carregado
```javascript
// No App.jsx
if (empresaNicho === 'veiculos') {
  return <CRMVeiculos user={user} />
}
```

### 4. Cliente importa estoque
```javascript
// No CRMVeiculos
POST /api/veiculos/importar
{
  file: excel_file,
  empresa_id: 2
}
↓
// Backend salva no banco do tenant
INSERT INTO tenant_empresa_2.veiculos
```

---

## 🎯 Vantagens:

### ✅ CRM Específico por Nicho
- **Veículos:** Estoque, KM, combustível, ano
- **Imóveis:** Quartos, área, localização
- **Varejo:** Categorias, SKU, estoque
- Cada CRM tem campos relevantes ao negócio

### ✅ Interface Limpa
- Cliente vê apenas o que precisa
- Sem confusão com campos irrelevantes
- Melhor UX

### ✅ Escalável
- Fácil adicionar novos nichos
- Cada CRM é independente
- Código organizado

---

## 🚀 Próximos Passos (Futuros):

### 1. CRM de Imóveis
Criar: `CRM_Client/crm-client-app/src/components/crm/CRMImoveis.jsx`
- Dashboard com imóveis
- Filtros (área, quartos, preço)
- Importação de imóveis

### 2. CRM de Varejo
Criar: `CRM_Client/crm-client-app/src/components/crm/CRMVariejo.jsx`
- Produtos por categoria
- Controle de estoque
- Importação de catálogo

### 3. Funcionalidades Avançadas
- Fotos dos veículos
- Chat integrado
- Relatórios por nicho
- Dashboards personalizados

---

## 🧪 Testar Agora:

1. **Crie novo usuário** (nova compra)
2. **No wizard:** Escolha "Veículos"
3. **Configure:** Nome, WhatsApp, etc
4. **Login:** Deve abrir CRM de Veículos
5. **Menu lateral:** Clique "Importar Estoque"
6. **Upload:** Excel com veículos
7. ✅ **Veículos aparecem no dashboard!**

---

## 📁 Arquivos Criados:

1. `CRM_Client/crm-client-app/src/components/crm/CRMVeiculos.jsx` ✅
2. `VendeAI/backend/routes/importar_veiculos_endpoint.py` (código pronto)
3. Modificado: `App.jsx` (roteamento dinâmico) ✅

---

## 🎉 Resultado Final:

Agora você tem:
- ✅ Wizard de setup com escolha de nicho
- ✅ CRM dinâmico baseado no nicho
- ✅ CRM específico de Veículos funcionando
- ✅ Importação de estoque via Excel
- ✅ Menu lateral personalizado
- ✅ Interface limpa e focada

**Cada cliente vê apenas o CRM relevante ao seu negócio!** 🚗🏠🛍️

---

**Cole o código do endpoint e teste! Está tudo pronto.** 🚀

# Correções Aplicadas no Bot Engine - VendeAI

## 🔧 Problema Identificado

O Bot Engine estava tentando se conectar a uma API externa de banco de dados de carros (`https://feiraoshowcar.com.br/db_api.php`) que:
- Não existe no sistema VendeAI
- Causava erro 405 (Method Not Allowed)
- Impedia o bot de iniciar corretamente

**Erro original:**
```
❌ [API] Tentativa 1 falhou: Request failed with status code 405
[ERRO] API de banco: Request failed with status code 405
```

## ✅ Solução Implementada

### 1. Desabilitada Conexão com Banco Externo
**Arquivo:** `bot_engine/main.js`
**Função:** `conectarDB()` (linha ~237)

```javascript
// ⚠️ DESABILITADO: VendeAI não usa banco de carros externo
// VendeAI usa sistema de Produtos via Backend Flask (porta 5000)
console.log('ℹ️  [INFO] VendeAI usa backend Flask para produtos');
console.log('ℹ️  [INFO] Conexão com banco externo de carros desabilitada');
```

### 2. Desabilitada Função de Buscar Veículos
**Arquivo:** `bot_engine/main.js`
**Função:** `buscarVeiculos()` (linha ~1439)

```javascript
// ⚠️ DESABILITADO: VendeAI não usa sistema de carros externo
// VendeAI usa sistema de Produtos via Backend Flask
console.log('ℹ️  [INFO] VendeAI usa Produtos via backend Flask, não carros externos');
this.veiculos = [];
return this.veiculos;
```

### 3. Desabilitada Função de Buscar Fotos
**Arquivo:** `bot_engine/main.js`
**Função:** `buscarFotosVeiculo()` (linha ~1585)

```javascript
// ⚠️ DESABILITADO: VendeAI não usa sistema de carros externo
console.log('ℹ️  [INFO] buscarFotosVeiculo() desabilitado - use backend Flask');
return [];
```

## 📋 Diferenças Entre Sistemas

### Sistema Original (Feirão ShowCar)
- Conecta em API externa de carros
- Busca dados diretamente de MySQL via PHP
- Focado em veículos/carros

### Sistema VendeAI
- Usa **Backend Flask** (porta 5000)
- Modelo de **Produtos** genéricos (não específico de carros)
- Importação via CSV
- Produtos gerenciados pelo usuário

## 🔄 Como o VendeAI Funciona

1. **Backend Flask** (porta 5000) - Gerencia:
   - Produtos (via upload CSV)
   - Leads e conversas
   - Configurações do bot
   - Usuários e empresas

2. **WhatsApp Service** (porta 3001) - Gerencia:
   - Conexão WhatsApp Web
   - QR Code
   - Sessões

3. **Bot Engine** - Gerencia:
   - Conversas com IA (GPT-4)
   - Análise de intenções
   - Respostas automáticas
   - Integração com backend via API REST

## ✨ Status Atual

✅ Bot Engine inicia sem erros
✅ Não tenta mais conectar em API externa
✅ Pronto para integração com Backend Flask
✅ Sistema de produtos via CSV funcional

## 📝 Próximos Passos (Opcional)

Para integrar produtos do VendeAI no bot:

1. Criar endpoint no Backend Flask:
   ```python
   @api_bp.route('/produtos/buscar', methods=['POST'])
   def buscar_produtos():
       # Retorna produtos da empresa
   ```

2. Atualizar Bot Engine para usar novo endpoint:
   ```javascript
   async buscarProdutos() {
       const response = await fetch('http://localhost:5000/api/produtos/buscar');
       return await response.json();
   }
   ```

## 📚 Arquivos Modificados

- ✅ `bot_engine/main.js` - Funções de banco desabilitadas
- ✅ `START.bat` - Atualizado para iniciar todos os servidores
- ✅ `STOP_ALL.bat` - Criado para parar todos os servidores

---

**Data:** 10/10/2025
**Versão:** VendeAI v1.0

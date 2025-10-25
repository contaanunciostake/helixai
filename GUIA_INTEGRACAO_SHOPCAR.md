# 🔌 GUIA: Integração Multi-Tenant com Sistemas Externos

## 🎯 Objetivo
Sincronizar veículos de múltiplas lojas (multi-tenant) que usam plataformas como ShopCar, Webmotors, etc.

---

## 📋 ESTRATÉGIAS DE INTEGRAÇÃO (em ordem de preferência)

### **1. API Oficial (IDEAL)** ⭐⭐⭐⭐⭐

**Como verificar:**
- Acessar site do ShopCar → "Desenvolvedores" ou "Integrações"
- Contatar suporte técnico do ShopCar
- Verificar se cliente tem "API Key" na conta dele

**Vantagens:**
- ✅ Legal e permitido
- ✅ Estável (não quebra)
- ✅ Documentação oficial
- ✅ Suporte técnico

**Desvantagens:**
- ❌ Pode ter custo adicional
- ❌ Nem sempre existe

---

### **2. Reverse Engineering da API (RECOMENDADO)** ⭐⭐⭐⭐

**Como fazer:**

1. **Abrir o site do ShopCar no navegador**
2. **Abrir DevTools (F12)**
3. **Ir na aba Network**
4. **Navegar pela plataforma:**
   - Listar veículos
   - Cadastrar veículo
   - Editar veículo
   - Deletar veículo
5. **Analisar as requisições:**
   - Procurar por chamadas XHR/Fetch
   - Ver URLs (ex: `api.shopcar.com/v1/vehicles`)
   - Ver Headers (Authorization, API Keys)
   - Ver Payloads (formato JSON)

**Exemplo do que procurar:**
```javascript
// Requisição encontrada no DevTools:
POST https://api.shopcar.com/v1/vehicles
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "store_id": 123,
  "model": "Civic",
  "brand": "Honda",
  "year": 2023,
  "price": 120000
}
```

**Vantagens:**
- ✅ Geralmente funciona
- ✅ Mais estável que scraping
- ✅ Dados estruturados (JSON)
- ✅ Sem custo adicional

**Desvantagens:**
- ⚠️ Pode quebrar em atualizações
- ⚠️ Área cinzenta legal
- ⚠️ Sem suporte oficial

---

### **3. Web Scraping (ÚLTIMA OPÇÃO)** ⭐⭐

**Como fazer:**
```javascript
// Usar Puppeteer ou Cheerio
import puppeteer from 'puppeteer';

async function scrapVehicles(storeUrl) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(storeUrl);

  const vehicles = await page.evaluate(() => {
    // Extrair dados do HTML
    return Array.from(document.querySelectorAll('.vehicle-card')).map(card => ({
      title: card.querySelector('.title').textContent,
      price: card.querySelector('.price').textContent,
      image: card.querySelector('img').src
    }));
  });

  await browser.close();
  return vehicles;
}
```

**Vantagens:**
- ✅ Funciona quando não há API

**Desvantagens:**
- ❌ Quebra facilmente
- ❌ Lento (precisa renderizar HTML)
- ❌ Pode ser bloqueado
- ❌ Contra termos de uso
- ❌ Difícil de manter

---

### **4. Export Manual + Automação (HÍBRIDO)** ⭐⭐⭐

**Processo:**
1. Cliente exporta CSV/XML do ShopCar diariamente
2. Upload automático para servidor (FTP/S3)
3. Cron job importa o arquivo

**Vantagens:**
- ✅ 100% confiável
- ✅ Legal
- ✅ Simples

**Desvantagens:**
- ⚠️ Requer ação manual do cliente
- ⚠️ Não é tempo real

---

## 🏗️ ARQUITETURA MULTI-TENANT RECOMENDADA

### **Estrutura do Banco de Dados:**

```sql
-- Tabela de empresas (já existe)
CREATE TABLE empresas (
  id INT PRIMARY KEY,
  nome VARCHAR(255),
  shopcar_store_id VARCHAR(100),    -- ID da loja no ShopCar
  shopcar_api_key VARCHAR(255),     -- API Key (se tiver)
  shopcar_url VARCHAR(500),         -- URL pública da loja
  sync_enabled BOOLEAN DEFAULT 1,   -- Habilitar sincronização?
  sync_interval INT DEFAULT 60,     -- Intervalo em minutos
  last_sync TIMESTAMP
);

-- Tabela centralizada de veículos (multi-tenant)
CREATE TABLE veiculos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  empresa_id INT NOT NULL,          -- FK para empresas
  external_id VARCHAR(100),         -- ID no sistema externo

  -- Dados do veículo
  marca VARCHAR(100),
  modelo VARCHAR(255),
  ano_fabricacao INT,
  ano_modelo INT,
  quilometragem INT,
  preco DECIMAL(12,2),
  descricao TEXT,
  cor VARCHAR(50),
  cambio VARCHAR(50),
  combustivel VARCHAR(50),

  -- Controle de sincronização
  sync_status ENUM('synced', 'pending', 'error', 'deleted'),
  sync_error TEXT,
  last_synced TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (empresa_id) REFERENCES empresas(id),
  UNIQUE KEY unique_external (empresa_id, external_id),
  INDEX idx_empresa_status (empresa_id, sync_status)
);

-- Tabela de fotos (separada para múltiplas imagens)
CREATE TABLE veiculo_fotos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  veiculo_id INT NOT NULL,
  url VARCHAR(500),
  external_url VARCHAR(500),        -- URL original no ShopCar
  ordem INT DEFAULT 0,
  is_principal BOOLEAN DEFAULT 0,

  FOREIGN KEY (veiculo_id) REFERENCES veiculos(id) ON DELETE CASCADE,
  INDEX idx_veiculo (veiculo_id)
);

-- Tabela de log de sincronização
CREATE TABLE sync_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  empresa_id INT NOT NULL,
  sync_type ENUM('full', 'incremental'),
  vehicles_added INT DEFAULT 0,
  vehicles_updated INT DEFAULT 0,
  vehicles_deleted INT DEFAULT 0,
  status ENUM('success', 'partial', 'error'),
  error_message TEXT,
  started_at TIMESTAMP,
  finished_at TIMESTAMP,

  FOREIGN KEY (empresa_id) REFERENCES empresas(id),
  INDEX idx_empresa_date (empresa_id, started_at)
);
```

---

## 🔄 SISTEMA DE SINCRONIZAÇÃO

### **Arquivo: `sync-manager.js`**

```javascript
/**
 * ════════════════════════════════════════════════════════════════
 * SYNC MANAGER - Sincronizador Multi-Tenant de Veículos
 * ════════════════════════════════════════════════════════════════
 */

import mysql from 'mysql2/promise';
import axios from 'axios';
import cron from 'node-cron';

class SyncManager {
  constructor() {
    this.dbPool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'helixai_db'
    });
  }

  /**
   * 🚀 Iniciar sincronizador automático
   */
  start() {
    console.log('🔄 [SYNC-MANAGER] Iniciando sincronizador multi-tenant...');

    // Rodar a cada 30 minutos
    cron.schedule('*/30 * * * *', async () => {
      console.log('\n⏰ [SYNC] Executando sincronização programada...');
      await this.syncAllCompanies();
    });

    // Sincronizar na inicialização
    setTimeout(() => this.syncAllCompanies(), 5000);
  }

  /**
   * 🏢 Sincronizar todas as empresas
   */
  async syncAllCompanies() {
    try {
      const [empresas] = await this.dbPool.execute(
        `SELECT id, nome, shopcar_store_id, shopcar_api_key, sync_enabled
         FROM empresas
         WHERE sync_enabled = 1 AND shopcar_store_id IS NOT NULL`
      );

      console.log(`📊 [SYNC] ${empresas.length} empresa(s) para sincronizar`);

      for (const empresa of empresas) {
        await this.syncCompany(empresa);
        // Aguardar 2 segundos entre empresas
        await new Promise(r => setTimeout(r, 2000));
      }

      console.log('✅ [SYNC] Sincronização completa!\n');
    } catch (error) {
      console.error('❌ [SYNC] Erro na sincronização:', error);
    }
  }

  /**
   * 🔄 Sincronizar uma empresa específica
   */
  async syncCompany(empresa) {
    const startTime = new Date();
    let stats = { added: 0, updated: 0, deleted: 0 };

    try {
      console.log(`\n🏢 [SYNC] Empresa: ${empresa.nome} (ID ${empresa.id})`);

      // 1. BUSCAR VEÍCULOS DO SHOPCAR (API ou Scraping)
      const externalVehicles = await this.fetchVehiclesFromShopCar(empresa);
      console.log(`   📥 ${externalVehicles.length} veículos encontrados no ShopCar`);

      // 2. BUSCAR VEÍCULOS LOCAIS
      const [localVehicles] = await this.dbPool.execute(
        'SELECT id, external_id FROM veiculos WHERE empresa_id = ?',
        [empresa.id]
      );

      const localMap = new Map(localVehicles.map(v => [v.external_id, v.id]));

      // 3. PROCESSAR CADA VEÍCULO
      for (const extVehicle of externalVehicles) {
        if (localMap.has(extVehicle.id)) {
          // Atualizar existente
          await this.updateVehicle(empresa.id, extVehicle);
          stats.updated++;
          localMap.delete(extVehicle.id);
        } else {
          // Inserir novo
          await this.insertVehicle(empresa.id, extVehicle);
          stats.added++;
        }
      }

      // 4. MARCAR VEÍCULOS DELETADOS (que não vieram na sincronização)
      for (const [externalId, localId] of localMap) {
        await this.dbPool.execute(
          `UPDATE veiculos SET sync_status = 'deleted'
           WHERE id = ? AND empresa_id = ?`,
          [localId, empresa.id]
        );
        stats.deleted++;
      }

      // 5. REGISTRAR LOG
      await this.logSync(empresa.id, stats, 'success', startTime);

      console.log(`   ✅ Adicionados: ${stats.added} | Atualizados: ${stats.updated} | Deletados: ${stats.deleted}`);

    } catch (error) {
      console.error(`   ❌ Erro ao sincronizar ${empresa.nome}:`, error.message);
      await this.logSync(empresa.id, stats, 'error', startTime, error.message);
    }
  }

  /**
   * 🌐 Buscar veículos do ShopCar (ADAPTAR CONFORME API DESCOBERTA)
   */
  async fetchVehiclesFromShopCar(empresa) {
    // OPÇÃO A: API Oficial
    if (empresa.shopcar_api_key) {
      const response = await axios.get(
        `https://api.shopcar.com/v1/stores/${empresa.shopcar_store_id}/vehicles`,
        {
          headers: {
            'Authorization': `Bearer ${empresa.shopcar_api_key}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data.vehicles || [];
    }

    // OPÇÃO B: Reverse Engineering
    // TODO: Implementar após descobrir endpoints reais

    // OPÇÃO C: Scraping (última opção)
    // return await this.scrapVehicles(empresa.shopcar_url);

    return [];
  }

  /**
   * ➕ Inserir novo veículo
   */
  async insertVehicle(empresaId, vehicle) {
    const [result] = await this.dbPool.execute(
      `INSERT INTO veiculos (
        empresa_id, external_id, marca, modelo, ano_fabricacao,
        ano_modelo, preco, quilometragem, descricao, cor,
        cambio, combustivel, sync_status, last_synced
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', NOW())`,
      [
        empresaId,
        vehicle.id,
        vehicle.brand || '',
        vehicle.model || '',
        vehicle.year || null,
        vehicle.year_model || null,
        vehicle.price || 0,
        vehicle.mileage || 0,
        vehicle.description || '',
        vehicle.color || '',
        vehicle.transmission || '',
        vehicle.fuel || ''
      ]
    );

    // Inserir fotos
    if (vehicle.images && vehicle.images.length > 0) {
      for (let i = 0; i < vehicle.images.length; i++) {
        await this.dbPool.execute(
          `INSERT INTO veiculo_fotos (veiculo_id, url, external_url, ordem, is_principal)
           VALUES (?, ?, ?, ?, ?)`,
          [result.insertId, vehicle.images[i], vehicle.images[i], i, i === 0 ? 1 : 0]
        );
      }
    }
  }

  /**
   * 🔄 Atualizar veículo existente
   */
  async updateVehicle(empresaId, vehicle) {
    await this.dbPool.execute(
      `UPDATE veiculos SET
        marca = ?, modelo = ?, ano_fabricacao = ?, ano_modelo = ?,
        preco = ?, quilometragem = ?, descricao = ?, cor = ?,
        cambio = ?, combustivel = ?, sync_status = 'synced',
        last_synced = NOW()
       WHERE empresa_id = ? AND external_id = ?`,
      [
        vehicle.brand || '',
        vehicle.model || '',
        vehicle.year || null,
        vehicle.year_model || null,
        vehicle.price || 0,
        vehicle.mileage || 0,
        vehicle.description || '',
        vehicle.color || '',
        vehicle.transmission || '',
        vehicle.fuel || '',
        empresaId,
        vehicle.id
      ]
    );
  }

  /**
   * 📝 Registrar log de sincronização
   */
  async logSync(empresaId, stats, status, startTime, errorMsg = null) {
    await this.dbPool.execute(
      `INSERT INTO sync_logs (
        empresa_id, sync_type, vehicles_added, vehicles_updated,
        vehicles_deleted, status, error_message, started_at, finished_at
      ) VALUES (?, 'full', ?, ?, ?, ?, ?, ?, NOW())`,
      [
        empresaId,
        stats.added,
        stats.updated,
        stats.deleted,
        status,
        errorMsg,
        startTime
      ]
    );
  }
}

export default SyncManager;
```

---

## 🚀 COMO USAR

### **1. Descobrir a API Real do ShopCar:**

**Passo a passo:**
```bash
1. Acesse o painel do ShopCar com login de um cliente
2. Abra DevTools (F12) → Aba Network
3. Navegue e cadastre um veículo
4. Veja as requisições XHR/Fetch
5. Copie:
   - URL base (ex: api.shopcar.com.br)
   - Headers necessários
   - Formato dos dados
```

### **2. Criar as Tabelas:**

```bash
cd D:\Helix\HelixAI\VendeAI\bot_engine
mysql -u root helixai_db < migrations/create_sync_tables.sql
```

### **3. Integrar no main.js:**

```javascript
import SyncManager from './sync-manager.js';

// Depois de iniciar o bot
const syncManager = new SyncManager();
syncManager.start();
```

---

## 📊 DASHBOARD NO CRM

Adicionar tela para mostrar:
- Status da última sincronização
- Total de veículos sincronizados
- Erros (se houver)
- Botão "Sincronizar Agora"

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ **Investigar API do ShopCar** (usar DevTools)
2. ✅ **Criar tabelas de sincronização**
3. ✅ **Implementar sync-manager.js**
4. ✅ **Testar com 1 cliente**
5. ✅ **Adicionar dashboard no CRM**
6. ✅ **Escalar para todos os clientes**

---

**Essa arquitetura funciona para QUALQUER plataforma externa!** 🚀

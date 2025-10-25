-- ============================================
-- MIGRATION: Dashboard Analytics Support
-- Data: 2025-10-16
-- Versao: 001
-- Descricao: Adiciona campos e tabelas necessarias para o dashboard Dashtrans
-- ============================================

-- ===========================================
-- 1. ADICIONAR CAMPOS FALTANTES EM LEADS
-- ===========================================

-- Campos de produto (para vincular vendas a produtos)
ALTER TABLE leads
ADD COLUMN produto_id INT NULL COMMENT 'ID do produto vendido' AFTER vendido,
ADD COLUMN produto_nome VARCHAR(255) NULL COMMENT 'Nome do produto (cache)' AFTER produto_id,
ADD COLUMN quantidade INT DEFAULT 1 COMMENT 'Quantidade vendida' AFTER produto_nome;

-- Campos de pagamento
ALTER TABLE leads
ADD COLUMN metodo_pagamento VARCHAR(50) NULL COMMENT 'Ex: Pix, Boleto, Credito, Financiamento' AFTER valor_venda,
ADD COLUMN status_pagamento ENUM('PENDENTE', 'PAGO', 'CANCELADO', 'REEMBOLSADO', 'PARCIAL') DEFAULT 'PENDENTE' COMMENT 'Status do pagamento' AFTER metodo_pagamento,
ADD COLUMN data_pagamento DATETIME NULL COMMENT 'Data de confirmacao do pagamento' AFTER status_pagamento;

-- Foreign key para produtos
ALTER TABLE leads
ADD CONSTRAINT fk_leads_produto
FOREIGN KEY (produto_id) REFERENCES produtos_catalogo(id)
ON DELETE SET NULL;

-- ===========================================
-- 2. CRIAR TABELA DE ANALYTICS
-- ===========================================

CREATE TABLE IF NOT EXISTS analytics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    empresa_id INT NOT NULL,
    data DATE NOT NULL COMMENT 'Data da metrica',

    -- Metricas de trafego
    visitantes_unicos INT DEFAULT 0 COMMENT 'Visitantes unicos no dia',
    pageviews INT DEFAULT 0 COMMENT 'Total de visualizacoes de pagina',
    sessoes INT DEFAULT 0 COMMENT 'Total de sessoes',

    -- Metricas de engajamento
    bounce_rate DECIMAL(5,2) NULL COMMENT 'Taxa de rejeicao (%)',
    tempo_medio_sessao INT NULL COMMENT 'Tempo medio de sessao (segundos)',
    paginas_por_sessao DECIMAL(5,2) NULL COMMENT 'Media de paginas por sessao',

    -- Origem do trafego
    origem VARCHAR(50) NULL COMMENT 'Ex: whatsapp, website, campanha, direto',

    -- Metricas de conversao
    leads_gerados INT DEFAULT 0 COMMENT 'Leads gerados no dia',
    conversoes INT DEFAULT 0 COMMENT 'Vendas realizadas no dia',
    taxa_conversao DECIMAL(5,2) NULL COMMENT 'Taxa de conversao (%)',

    -- Metadata
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    UNIQUE KEY unique_empresa_data_origem (empresa_id, data, origem),
    INDEX idx_empresa_data (empresa_id, data)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Metricas diarias de analytics por empresa';

-- ===========================================
-- 3. CRIAR INDICES PARA PERFORMANCE
-- ===========================================

-- Indices em leads para queries do dashboard
CREATE INDEX idx_leads_data_venda ON leads(data_venda) COMMENT 'Para graficos de receita por data';
CREATE INDEX idx_leads_vendido_empresa ON leads(vendido, empresa_id) COMMENT 'Para contagem de vendas por empresa';
CREATE INDEX idx_leads_produto ON leads(produto_id) COMMENT 'Para top produtos';
CREATE INDEX idx_leads_status_pagamento ON leads(status_pagamento) COMMENT 'Para filtros de pagamento';

-- Indices em conversas para analytics
CREATE INDEX idx_conversas_iniciada_empresa ON conversas(iniciada_em, empresa_id) COMMENT 'Para metricas de visitantes';

-- ===========================================
-- 4. POPULAR DADOS INICIAIS DE ANALYTICS
-- ===========================================

-- Usar conversas como proxy de visitantes/sessoes
INSERT INTO analytics (empresa_id, data, visitantes_unicos, sessoes, origem, leads_gerados)
SELECT
    c.empresa_id,
    DATE(c.iniciada_em) as data,
    COUNT(DISTINCT c.telefone) as visitantes_unicos,
    COUNT(*) as sessoes,
    'whatsapp' as origem,
    0 as leads_gerados
FROM conversas c
GROUP BY c.empresa_id, DATE(c.iniciada_em)
ON DUPLICATE KEY UPDATE
    visitantes_unicos = VALUES(visitantes_unicos),
    sessoes = VALUES(sessoes);

-- Popular leads gerados por dia
INSERT INTO analytics (empresa_id, data, leads_gerados, origem)
SELECT
    empresa_id,
    DATE(criado_em) as data,
    COUNT(*) as leads_gerados,
    COALESCE(origem, 'desconhecido') as origem
FROM leads
GROUP BY empresa_id, DATE(criado_em), origem
ON DUPLICATE KEY UPDATE
    leads_gerados = VALUES(leads_gerados);

-- Popular conversoes por dia
UPDATE analytics a
SET a.conversoes = (
    SELECT COUNT(*)
    FROM leads l
    WHERE l.empresa_id = a.empresa_id
    AND DATE(l.data_venda) = a.data
    AND l.vendido = 1
);

-- Calcular taxa de conversao
UPDATE analytics
SET taxa_conversao = CASE
    WHEN leads_gerados > 0 THEN (conversoes / leads_gerados * 100)
    ELSE NULL
END
WHERE taxa_conversao IS NULL;

-- ===========================================
-- 5. ATUALIZAR MODELO DE DADOS (SQLAlchemy)
-- ===========================================

-- NOTA: Apos executar esta migration, atualizar:
-- Databases/database/models.py
-- Adicionar novos campos no modelo Lead:
--   - produto_id: Mapped[int | None]
--   - produto_nome: Mapped[str | None]
--   - quantidade: Mapped[int] = mapped_column(default=1)
--   - metodo_pagamento: Mapped[str | None]
--   - status_pagamento: Mapped[StatusPagamento]
--   - data_pagamento: Mapped[datetime | None]
--
-- Criar novo modelo Analytics
--
-- Criar novo enum StatusPagamento

-- ===========================================
-- 6. VERIFICACAO DA MIGRATION
-- ===========================================

-- Verificar campos adicionados em leads
SELECT
    'leads table updated' as status,
    COUNT(*) as total_leads,
    SUM(CASE WHEN produto_id IS NOT NULL THEN 1 ELSE 0 END) as leads_com_produto,
    SUM(CASE WHEN metodo_pagamento IS NOT NULL THEN 1 ELSE 0 END) as leads_com_pagamento
FROM leads;

-- Verificar tabela analytics
SELECT
    'analytics table created' as status,
    COUNT(*) as total_registros,
    COUNT(DISTINCT empresa_id) as empresas,
    MIN(data) as data_inicial,
    MAX(data) as data_final
FROM analytics;

-- ===========================================
-- MIGRATION CONCLUIDA
-- ===========================================

SELECT '============================================' as '';
SELECT 'MIGRATION 001 EXECUTADA COM SUCESSO!' as '';
SELECT '============================================' as '';
SELECT CONCAT('Data: ', NOW()) as '';
SELECT CONCAT('Versao: 001') as '';
SELECT CONCAT('Descricao: Dashboard Analytics Support') as '';
SELECT '============================================' as '';

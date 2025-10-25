-- ============================================
-- MIGRATION: Dashboard Analytics Support (Continue)
-- Continua a partir do ponto onde falhou
-- ============================================

-- Verificar se quantidade existe, se nao, adicionar
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'helixai_db'
AND TABLE_NAME = 'leads'
AND COLUMN_NAME = 'quantidade';

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE leads ADD COLUMN quantidade INT DEFAULT 1 COMMENT ''Quantidade vendida'' AFTER produto_nome',
    'SELECT ''quantidade column already exists'' AS Info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Tentar adicionar foreign key (pode falhar se ja existir, mas nao tem problema)
SET @fk_sql = '
ALTER TABLE leads
ADD CONSTRAINT fk_leads_produto
FOREIGN KEY (produto_id) REFERENCES produtos_catalogo(id)
ON DELETE SET NULL';

SET @fk_exists = 0;
SELECT COUNT(*) INTO @fk_exists
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'helixai_db'
AND TABLE_NAME = 'leads'
AND CONSTRAINT_NAME = 'fk_leads_produto';

SET @sql = IF(@fk_exists = 0, @fk_sql, 'SELECT ''FK already exists'' AS Info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Criar tabela analytics
CREATE TABLE IF NOT EXISTS analytics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    empresa_id INT NOT NULL,
    data DATE NOT NULL COMMENT 'Data da metrica',

    visitantes_unicos INT DEFAULT 0 COMMENT 'Visitantes unicos no dia',
    pageviews INT DEFAULT 0 COMMENT 'Total de visualizacoes de pagina',
    sessoes INT DEFAULT 0 COMMENT 'Total de sessoes',

    bounce_rate DECIMAL(5,2) NULL COMMENT 'Taxa de rejeicao (%)',
    tempo_medio_sessao INT NULL COMMENT 'Tempo medio de sessao (segundos)',
    paginas_por_sessao DECIMAL(5,2) NULL COMMENT 'Media de paginas por sessao',

    origem VARCHAR(50) NULL COMMENT 'Ex: whatsapp, website, campanha, direto',

    leads_gerados INT DEFAULT 0 COMMENT 'Leads gerados no dia',
    conversoes INT DEFAULT 0 COMMENT 'Vendas realizadas no dia',
    taxa_conversao DECIMAL(5,2) NULL COMMENT 'Taxa de conversao (%)',

    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    UNIQUE KEY unique_empresa_data_origem (empresa_id, data, origem),
    INDEX idx_empresa_data (empresa_id, data)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Metricas diarias de analytics por empresa';

-- Criar indices (ignorar erros se ja existirem)
CREATE INDEX IF NOT EXISTS idx_leads_data_venda ON leads(data_venda);
CREATE INDEX IF NOT EXISTS idx_leads_vendido_empresa ON leads(vendido, empresa_id);
CREATE INDEX IF NOT EXISTS idx_leads_produto ON leads(produto_id);
CREATE INDEX IF NOT EXISTS idx_leads_status_pagamento ON leads(status_pagamento);
CREATE INDEX IF NOT EXISTS idx_conversas_iniciada_empresa ON conversas(iniciada_em, empresa_id);

-- Popular dados de analytics (se houver conversas)
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
WHERE criado_em IS NOT NULL
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

-- Verificacao
SELECT 'Analytics table created' as status,
       COUNT(*) as total_registros,
       COUNT(DISTINCT empresa_id) as empresas,
       MIN(data) as data_inicial,
       MAX(data) as data_final
FROM analytics;

SELECT '============================================' as '';
SELECT 'MIGRATION CONCLUIDA COM SUCESSO!' as '';
SELECT '============================================' as '';

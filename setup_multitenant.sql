-- Setup Multi-Tenant Helix AI
USE helixai_db;

-- Remover constraints antigas se existirem
SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS empresas;

SET FOREIGN_KEY_CHECKS=1;

-- Remover coluna empresa_id da tabela usuarios se existir
SET @column_exists = (
    SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = 'helixai_db'
    AND table_name = 'usuarios'
    AND column_name = 'empresa_id'
);

SET @sql = IF(@column_exists > 0,
    'ALTER TABLE usuarios DROP COLUMN empresa_id',
    'SELECT "Coluna não existe" AS status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Criar tabela empresas
CREATE TABLE empresas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    setor ENUM('veiculos', 'imoveis', 'autopecas', 'varejo', 'servicos', 'outros') DEFAULT 'outros',
    database_name VARCHAR(100) NOT NULL,
    whatsapp_numero VARCHAR(20) NULL,
    whatsapp_conectado TINYINT(1) DEFAULT 0,
    configuracoes_json JSON NULL COMMENT 'Configurações da empresa (setup_completo, nome_bot, etc)',
    ativo TINYINT(1) DEFAULT 1,
    plano_id INT NULL,
    data_ativacao DATETIME NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_ativo (ativo),
    FOREIGN KEY (plano_id) REFERENCES planos(id) ON DELETE SET NULL
);

-- Adicionar empresa_id na tabela usuarios
ALTER TABLE usuarios
ADD COLUMN empresa_id INT NULL AFTER id,
ADD INDEX idx_empresa_id (empresa_id),
ADD FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE SET NULL;

-- Inserir empresa Feirão ShowCar com setup já concluído
INSERT INTO empresas (nome, slug, setor, database_name, whatsapp_numero, ativo, configuracoes_json)
VALUES (
    'Feirão ShowCar',
    'feirao-showcar',
    'veiculos',
    'u161861600_feiraoshow',
    '5567999887766',
    1,
    JSON_OBJECT('setup_completo', true, 'nome_bot', 'VendeAI')
);

SELECT 'Setup Multi-Tenant concluído!' AS status;
SELECT * FROM empresas;

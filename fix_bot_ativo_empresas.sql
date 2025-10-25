-- ════════════════════════════════════════════════════════════════
-- FIX: Adicionar coluna bot_ativo na tabela empresas
-- ════════════════════════════════════════════════════════════════
--
-- Erro atual:
-- "Unknown column 'bot_ativo' in 'field list'"
--
-- Esse script adiciona a coluna bot_ativo que está faltando
-- ════════════════════════════════════════════════════════════════

USE helixai_db;

-- Verificar se a coluna já existe
SELECT
    COLUMN_NAME
FROM
    INFORMATION_SCHEMA.COLUMNS
WHERE
    TABLE_SCHEMA = 'helixai_db'
    AND TABLE_NAME = 'empresas'
    AND COLUMN_NAME = 'bot_ativo';

-- Adicionar coluna bot_ativo se não existir
ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS bot_ativo BOOLEAN DEFAULT true COMMENT 'Bot WhatsApp ativo para esta empresa';

-- Adicionar coluna whatsapp_numero se não existir
ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS whatsapp_numero VARCHAR(20) DEFAULT NULL COMMENT 'Número WhatsApp conectado (formato: 5511999999999)';

-- Adicionar coluna whatsapp_status se não existir
ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS whatsapp_status ENUM('disconnected', 'connecting', 'connected', 'error') DEFAULT 'disconnected' COMMENT 'Status da conexão WhatsApp';

-- Verificar resultado
SELECT
    COLUMN_NAME,
    COLUMN_TYPE,
    COLUMN_DEFAULT,
    IS_NULLABLE
FROM
    INFORMATION_SCHEMA.COLUMNS
WHERE
    TABLE_SCHEMA = 'helixai_db'
    AND TABLE_NAME = 'empresas'
    AND COLUMN_NAME IN ('bot_ativo', 'whatsapp_numero', 'whatsapp_status')
ORDER BY
    ORDINAL_POSITION;

-- ════════════════════════════════════════════════════════════════
-- ✅ CONCLUÍDO!
-- ════════════════════════════════════════════════════════════════

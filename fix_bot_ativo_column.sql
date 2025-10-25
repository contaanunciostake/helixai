-- Adicionar coluna bot_ativo na tabela empresas
-- Execute este SQL no banco helixai_db

USE helixai_db;

-- Adicionar coluna bot_ativo se não existir
ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS bot_ativo TINYINT(1) DEFAULT 1
COMMENT 'Bot WhatsApp ativo (1=sim, 0=não)';

-- Setar valor padrão para empresas existentes
UPDATE empresas
SET bot_ativo = 1
WHERE bot_ativo IS NULL;

-- Verificar
SELECT id, nome, bot_ativo FROM empresas LIMIT 5;

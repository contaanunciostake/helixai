-- ════════════════════════════════════════════════════════════════
-- FIX COMPLETO: Adicionar TODAS as colunas necessárias em empresas
-- ════════════════════════════════════════════════════════════════
--
-- Erros atuais:
-- 1. Unknown column 'bot_ativo'
-- 2. Unknown column 'nome_fantasia'
-- 3. Unknown column 'whatsapp_numero'
-- 4. E muitas outras...
--
-- Este script adiciona TODAS as colunas que o backend Flask precisa
-- ════════════════════════════════════════════════════════════════

USE helixai_db;

-- ════════════════════════════════════════════════════════════════
-- 1. INFORMAÇÕES DA EMPRESA
-- ════════════════════════════════════════════════════════════════

ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS nome_fantasia VARCHAR(255) DEFAULT NULL
COMMENT 'Nome fantasia da empresa';

ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS cnpj VARCHAR(18) DEFAULT NULL
COMMENT 'CNPJ da empresa (formato: 00.000.000/0000-00)';

ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS telefone VARCHAR(20) DEFAULT NULL
COMMENT 'Telefone principal da empresa';

ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS email VARCHAR(255) DEFAULT NULL
COMMENT 'Email da empresa';

ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS website VARCHAR(255) DEFAULT NULL
COMMENT 'Website da empresa';

-- ════════════════════════════════════════════════════════════════
-- 2. WHATSAPP / BOT
-- ════════════════════════════════════════════════════════════════

ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS whatsapp_numero VARCHAR(20) DEFAULT NULL
COMMENT 'Número WhatsApp conectado (formato: 5511999999999)';

ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS whatsapp_conectado BOOLEAN DEFAULT false
COMMENT 'WhatsApp está conectado?';

ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS whatsapp_qr_code TEXT DEFAULT NULL
COMMENT 'Último QR Code gerado (base64)';

ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS whatsapp_status ENUM('disconnected', 'connecting', 'connected', 'error') DEFAULT 'disconnected'
COMMENT 'Status da conexão WhatsApp';

ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS bot_ativo BOOLEAN DEFAULT true
COMMENT 'Bot WhatsApp ativo para esta empresa';

-- ════════════════════════════════════════════════════════════════
-- 3. PLANOS E ASSINATURAS
-- ════════════════════════════════════════════════════════════════

ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS plano ENUM('free', 'basic', 'pro', 'enterprise') DEFAULT 'free'
COMMENT 'Plano atual da empresa';

ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS plano_ativo BOOLEAN DEFAULT true
COMMENT 'Plano está ativo?';

ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS data_inicio_plano DATETIME DEFAULT NULL
COMMENT 'Data de início do plano atual';

ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS data_fim_plano DATETIME DEFAULT NULL
COMMENT 'Data de fim do plano atual';

-- ════════════════════════════════════════════════════════════════
-- 4. LIMITES DO PLANO
-- ════════════════════════════════════════════════════════════════

ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS limite_leads INT DEFAULT 100
COMMENT 'Limite de leads por mês';

ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS limite_disparos_mes INT DEFAULT 500
COMMENT 'Limite de disparos WhatsApp por mês';

ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS limite_usuarios INT DEFAULT 5
COMMENT 'Limite de usuários da empresa';

-- ════════════════════════════════════════════════════════════════
-- 5. ENDEREÇO
-- ════════════════════════════════════════════════════════════════

ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS endereco VARCHAR(255) DEFAULT NULL
COMMENT 'Endereço completo da empresa';

ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS cidade VARCHAR(100) DEFAULT NULL
COMMENT 'Cidade da empresa';

ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS estado VARCHAR(2) DEFAULT NULL
COMMENT 'Estado da empresa (UF)';

ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS cep VARCHAR(9) DEFAULT NULL
COMMENT 'CEP da empresa (formato: 00000-000)';

-- ════════════════════════════════════════════════════════════════
-- 6. TIMESTAMPS
-- ════════════════════════════════════════════════════════════════

ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
COMMENT 'Data de criação do registro';

ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
COMMENT 'Data da última atualização';

-- ════════════════════════════════════════════════════════════════
-- 7. VERIFICAR RESULTADO
-- ════════════════════════════════════════════════════════════════

SELECT
    COLUMN_NAME AS 'Coluna',
    COLUMN_TYPE AS 'Tipo',
    IS_NULLABLE AS 'Nulo?',
    COLUMN_DEFAULT AS 'Padrão',
    COLUMN_COMMENT AS 'Comentário'
FROM
    INFORMATION_SCHEMA.COLUMNS
WHERE
    TABLE_SCHEMA = 'helixai_db'
    AND TABLE_NAME = 'empresas'
ORDER BY
    ORDINAL_POSITION;

-- ════════════════════════════════════════════════════════════════
-- ✅ CONCLUÍDO!
-- ════════════════════════════════════════════════════════════════
-- Total de colunas adicionadas: 21
--
-- Colunas principais:
-- - nome_fantasia, cnpj, telefone, email, website
-- - whatsapp_numero, whatsapp_conectado, whatsapp_qr_code, whatsapp_status
-- - bot_ativo
-- - plano, plano_ativo, data_inicio_plano, data_fim_plano
-- - limite_leads, limite_disparos_mes, limite_usuarios
-- - endereco, cidade, estado, cep
-- - criado_em, atualizado_em
-- ════════════════════════════════════════════════════════════════

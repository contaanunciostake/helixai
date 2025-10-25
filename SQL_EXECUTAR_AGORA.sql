-- ========================================
-- EXECUTE ESTE SQL AGORA NO phpMyAdmin
-- ========================================

USE helixai_db;

-- Passo 1: Adicionar a coluna configuracoes_json
ALTER TABLE empresas
ADD COLUMN configuracoes_json JSON NULL COMMENT 'Configurações da empresa',
ADD COLUMN whatsapp_conectado TINYINT(1) DEFAULT 0,
ADD COLUMN data_ativacao DATETIME NULL,
ADD COLUMN atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Passo 2: Atualizar empresas existentes com setup_completo = false
UPDATE empresas
SET configuracoes_json = JSON_OBJECT('setup_completo', false)
WHERE configuracoes_json IS NULL;

-- Passo 3: Atualizar Feirão ShowCar com setup já concluído
UPDATE empresas
SET configuracoes_json = JSON_OBJECT('setup_completo', true, 'nome_bot', 'VendeAI')
WHERE slug = 'feirao-showcar';

-- Passo 4: Verificar resultado
SELECT id, nome, slug, configuracoes_json FROM empresas;

-- ========================================
-- ✅ PRONTO! Agora a coluna existe
-- ========================================

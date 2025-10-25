-- ====================================================================
-- ADICIONAR TABELA: clientes_contexto
-- Database: u161861600_feiraoshow
-- ====================================================================
-- Esta tabela armazena o contexto das conversas dos clientes
-- Utilizada pelo módulo 04-memoria-contexto.js
-- ====================================================================



-- Tabela de Contexto dos Clientes
CREATE TABLE IF NOT EXISTS `clientes_contexto` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `telefone` VARCHAR(20) NOT NULL,
  `dados_json` JSON NOT NULL COMMENT 'Contexto completo da conversa em JSON',

  -- Métricas
  `total_interacoes` INT(11) DEFAULT 1,

  -- Timestamps
  `primeira_interacao` DATETIME NOT NULL,
  `ultima_atualizacao` DATETIME NOT NULL,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_telefone` (`telefone`),
  KEY `idx_ultima_atualizacao` (`ultima_atualizacao`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Contexto e histórico de conversas dos clientes';

-- ====================================================================
-- CONCLUÍDO
-- ====================================================================

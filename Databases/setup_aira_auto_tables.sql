-- ====================================================================
-- SETUP RÁPIDO - AIra Auto (Bot de Veículos)
-- Database: helixai_db
-- ====================================================================
-- Este script cria APENAS as tabelas essenciais para o bot funcionar
-- Execute este arquivo no phpMyAdmin ou MySQL Workbench
-- ====================================================================

USE `helixai_db`;

-- 1. Tabela de Vendors/Vendedores (CRIAR PRIMEIRO)
CREATE TABLE IF NOT EXISTS `vendors` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `amount` decimal(11,2) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '0 - deactive, 1 - active',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabela de Carros (CRIAR DEPOIS - com tipo correto para vendor_id)
CREATE TABLE IF NOT EXISTS `cars` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `feature_image` varchar(255) DEFAULT NULL,
  `vendor_id` bigint(20) UNSIGNED DEFAULT NULL,
  `price` decimal(12,2) DEFAULT NULL,
  `previous_price` decimal(12,2) DEFAULT NULL,
  `speed` varchar(255) DEFAULT NULL,
  `year` varchar(255) DEFAULT NULL,
  `mileage` varchar(255) DEFAULT NULL,
  `is_featured` varchar(255) DEFAULT NULL,
  `is_special_offer` tinyint(4) NOT NULL DEFAULT 0,
  `specification` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_vendor_id` (`vendor_id`),
  CONSTRAINT `fk_cars_vendor`
    FOREIGN KEY (`vendor_id`)
    REFERENCES `vendors` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Inserir dados de exemplo (opcional - comentado)
-- INSERT INTO `vendors` (`id`, `first_name`, `last_name`, `username`, `email`, `status`) VALUES
-- (1, 'Sistema', 'HelixAI', 'helixai', 'sistema@helixai.com', 1);

-- INSERT INTO `cars` (`id`, `vendor_id`, `price`, `year`, `mileage`, `status`) VALUES
-- (1, 1, 50000.00, '2020', '30000', '1');

-- ====================================================================
-- ✅ CONCLUÍDO
-- ====================================================================
-- Execute este script e reinicie o bot AIra Auto
--
-- COMANDOS PARA TESTAR:
-- 1. Verifique se as tabelas foram criadas:
--    SELECT COUNT(*) as total FROM cars;
--
-- 2. Se aparecer 0, está funcionando!
-- ====================================================================

USE `helixai_db`;

CREATE TABLE IF NOT EXISTS `properties` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `property_id` INT NOT NULL UNIQUE,
    `property_type` VARCHAR(255) NOT NULL,
    `finalidade` VARCHAR(255) NOT NULL,
    `preco` DECIMAL(12,2) NOT NULL,
    `endereco_logradouro` VARCHAR(255),
    `endereco_bairro` VARCHAR(255),
    `endereco_cidade` VARCHAR(255),
    `endereco_estado` VARCHAR(2),
    `endereco_cep` VARCHAR(10),
    `metragem` INT,
    `quartos` INT,
    `banheiros` INT,
    `vagas` INT,
    `condominio` DECIMAL(10,2),
    `iptu` DECIMAL(10,2),
    `ano_construcao` INT,
    `comodidades` JSON,
    `descricao` TEXT,
    `condicoes_pagamento` JSON,
    `status` VARCHAR(50),
    `url_imagens` JSON,
    `link_site` VARCHAR(500)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

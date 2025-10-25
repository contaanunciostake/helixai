-- ====================================================================
-- VENDEAI - Adicionar Tabelas ao Banco MySQL Existente
-- Database: u161861600_feiraoshow
-- ====================================================================
-- Este script adiciona as tabelas do sistema VendeAI ao banco existente
-- Mantém todas as tabelas atuais (cars, vendors, etc)
-- ====================================================================



-- ==================== TABELAS DO VENDEAI ====================

-- 1. Tabela de Empresas (Clientes Multi-Tenant)
CREATE TABLE IF NOT EXISTS `empresas` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(200) NOT NULL,
  `nome_fantasia` VARCHAR(200) DEFAULT NULL,
  `cnpj` VARCHAR(18) UNIQUE DEFAULT NULL,
  `telefone` VARCHAR(20) DEFAULT NULL,
  `email` VARCHAR(200) DEFAULT NULL,
  `website` VARCHAR(200) DEFAULT NULL,

  -- WhatsApp
  `whatsapp_numero` VARCHAR(20) DEFAULT NULL COMMENT 'Número WhatsApp conectado',
  `whatsapp_conectado` TINYINT(1) DEFAULT 0,
  `whatsapp_qr_code` TEXT DEFAULT NULL,
  `bot_ativo` TINYINT(1) DEFAULT 0,

  -- Assinatura
  `plano` ENUM('gratuito', 'basico', 'profissional', 'enterprise') DEFAULT 'gratuito',
  `plano_ativo` TINYINT(1) DEFAULT 1,
  `data_inicio_plano` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `data_fim_plano` DATETIME DEFAULT NULL,

  -- Limites
  `limite_leads` INT(11) DEFAULT 100,
  `limite_disparos_mes` INT(11) DEFAULT 500,
  `limite_usuarios` INT(11) DEFAULT 3,

  -- Endereço
  `endereco` VARCHAR(500) DEFAULT NULL,
  `cidade` VARCHAR(100) DEFAULT NULL,
  `estado` VARCHAR(2) DEFAULT NULL,
  `cep` VARCHAR(9) DEFAULT NULL,

  -- Timestamps
  `criado_em` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  INDEX `idx_cnpj` (`cnpj`),
  INDEX `idx_whatsapp` (`whatsapp_numero`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Empresas clientes do VendeAI';


-- 2. Tabela de Usuários (Multi-Tenant)
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `empresa_id` INT(11) DEFAULT NULL,
  `nome` VARCHAR(200) NOT NULL,
  `email` VARCHAR(200) NOT NULL,
  `senha_hash` VARCHAR(256) NOT NULL,
  `tipo` ENUM('super_admin', 'admin_empresa', 'usuario', 'visualizador') DEFAULT 'usuario',
  `ativo` TINYINT(1) DEFAULT 1,

  -- Metadados
  `telefone` VARCHAR(20) DEFAULT NULL,
  `avatar_url` VARCHAR(500) DEFAULT NULL,
  `timezone` VARCHAR(50) DEFAULT 'America/Sao_Paulo',

  -- Timestamps
  `criado_em` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `ultimo_acesso` DATETIME DEFAULT NULL,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_email` (`email`),
  KEY `fk_empresa` (`empresa_id`),
  CONSTRAINT `fk_usuarios_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Usuários do sistema VendeAI';


-- 3. Configurações do Bot por Empresa
CREATE TABLE IF NOT EXISTS `configuracoes_bot` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `empresa_id` INT(11) NOT NULL UNIQUE,

  -- Informações do Negócio
  `descricao_empresa` TEXT DEFAULT NULL,
  `produtos_servicos` TEXT DEFAULT NULL,
  `publico_alvo` TEXT DEFAULT NULL,
  `diferenciais` TEXT DEFAULT NULL,
  `horario_atendimento` VARCHAR(200) DEFAULT NULL,

  -- Configurações de IA
  `prompt_sistema` TEXT DEFAULT NULL,
  `tom_conversa` VARCHAR(100) DEFAULT 'profissional e amigável',
  `mensagem_boas_vindas` TEXT DEFAULT NULL,
  `mensagem_ausencia` TEXT DEFAULT NULL,
  `mensagem_encerramento` TEXT DEFAULT NULL,
  `palavras_chave_interesse` TEXT DEFAULT NULL COMMENT 'JSON array',

  -- Comportamento
  `auto_resposta_ativa` TINYINT(1) DEFAULT 1,
  `enviar_audio` TINYINT(1) DEFAULT 1,
  `usar_elevenlabs` TINYINT(1) DEFAULT 1,
  `tempo_resposta_segundos` INT(11) DEFAULT 5,
  `max_tentativas_contato` INT(11) DEFAULT 3,
  `intervalo_entre_mensagens` INT(11) DEFAULT 10,

  -- APIs de IA
  `openai_api_key` VARCHAR(200) DEFAULT NULL,
  `openai_model` VARCHAR(50) DEFAULT 'gpt-4-turbo',
  `groq_api_key` VARCHAR(200) DEFAULT NULL,
  `elevenlabs_api_key` VARCHAR(200) DEFAULT NULL,
  `elevenlabs_voice_id` VARCHAR(100) DEFAULT NULL,
  `elevenlabs_agent_id` VARCHAR(100) DEFAULT NULL,

  -- Módulos Específicos
  `modulo_fipe_ativo` TINYINT(1) DEFAULT 0,
  `modulo_financiamento_ativo` TINYINT(1) DEFAULT 0,
  `modulo_agendamento_ativo` TINYINT(1) DEFAULT 0,

  -- Configuração Customizada (JSON)
  `configuracao_customizada` JSON DEFAULT NULL,

  `atualizado_em` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `fk_config_empresa` (`empresa_id`),
  CONSTRAINT `fk_configuracoes_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Configurações personalizadas do bot por empresa';


-- 4. Tabela de Leads
CREATE TABLE IF NOT EXISTS `leads` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `empresa_id` INT(11) NOT NULL,

  -- Dados do Lead
  `nome` VARCHAR(200) DEFAULT NULL,
  `telefone` VARCHAR(20) NOT NULL,
  `email` VARCHAR(200) DEFAULT NULL,
  `empresa_lead` VARCHAR(200) DEFAULT NULL,
  `cargo` VARCHAR(100) DEFAULT NULL,

  -- Classificação
  `status` ENUM('novo', 'contato_inicial', 'qualificado', 'proposta', 'negociacao', 'ganho', 'perdido', 'frio') DEFAULT 'novo',
  `temperatura` ENUM('quente', 'morno', 'frio') DEFAULT 'frio',
  `pontuacao` INT(11) DEFAULT 0 COMMENT 'Score 0-100',

  -- Origem e Interesse
  `origem` VARCHAR(100) DEFAULT NULL COMMENT 'whatsapp, site, indicacao, campanha',
  `campanha_id` INT(11) DEFAULT NULL,
  `interesse` TEXT DEFAULT NULL,
  `necessidade` TEXT DEFAULT NULL,
  `observacoes` TEXT DEFAULT NULL,
  `tags` TEXT DEFAULT NULL COMMENT 'JSON array',

  -- Dados Customizados (JSON)
  `dados_customizados` JSON DEFAULT NULL,

  -- Controle
  `criado_em` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `ultima_interacao` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `proxima_acao` DATETIME DEFAULT NULL,
  `vendido` TINYINT(1) DEFAULT 0,
  `data_venda` DATETIME DEFAULT NULL,
  `valor_venda` DECIMAL(12,2) DEFAULT NULL,

  `usuario_responsavel_id` INT(11) DEFAULT NULL,

  PRIMARY KEY (`id`),
  KEY `idx_empresa_telefone` (`empresa_id`, `telefone`),
  KEY `idx_status` (`status`),
  KEY `idx_criado_em` (`criado_em`),
  KEY `fk_lead_empresa` (`empresa_id`),
  KEY `fk_lead_usuario` (`usuario_responsavel_id`),
  CONSTRAINT `fk_leads_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_leads_usuario` FOREIGN KEY (`usuario_responsavel_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Leads capturados pelo sistema';


-- 5. Tabela de Conversas WhatsApp
CREATE TABLE IF NOT EXISTS `conversas` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `empresa_id` INT(11) NOT NULL,
  `lead_id` INT(11) DEFAULT NULL,

  `telefone` VARCHAR(20) NOT NULL,
  `nome_contato` VARCHAR(200) DEFAULT NULL,
  `ativa` TINYINT(1) DEFAULT 1,
  `bot_ativo` TINYINT(1) DEFAULT 1 COMMENT 'Se bot está respondendo',

  -- Contexto (JSON)
  `contexto` JSON DEFAULT NULL COMMENT 'Histórico resumido, intenções detectadas',
  `intencao_atual` VARCHAR(100) DEFAULT NULL,

  -- Métricas
  `total_mensagens` INT(11) DEFAULT 0,
  `mensagens_enviadas` INT(11) DEFAULT 0,
  `mensagens_recebidas` INT(11) DEFAULT 0,
  `tempo_resposta_medio` FLOAT DEFAULT NULL,

  -- Timestamps
  `iniciada_em` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `ultima_mensagem` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `finalizada_em` DATETIME DEFAULT NULL,

  PRIMARY KEY (`id`),
  KEY `idx_empresa_telefone` (`empresa_id`, `telefone`),
  KEY `idx_ultima_mensagem` (`ultima_mensagem`),
  KEY `fk_conversa_lead` (`lead_id`),
  CONSTRAINT `fk_conversas_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_conversas_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Conversas do WhatsApp';


-- 6. Tabela de Mensagens
CREATE TABLE IF NOT EXISTS `mensagens` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `conversa_id` INT(11) NOT NULL,

  `tipo` ENUM('texto', 'audio', 'imagem', 'video', 'documento', 'localizacao', 'contato', 'sticker') DEFAULT 'texto',
  `conteudo` TEXT DEFAULT NULL,
  `arquivo_url` VARCHAR(500) DEFAULT NULL,
  `arquivo_mimetype` VARCHAR(100) DEFAULT NULL,

  `enviada_por_bot` TINYINT(1) DEFAULT 0,
  `enviada_em` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `lida` TINYINT(1) DEFAULT 0,
  `lida_em` DATETIME DEFAULT NULL,

  -- Metadados WhatsApp
  `whatsapp_id` VARCHAR(100) UNIQUE DEFAULT NULL,
  `respondendo_id` INT(11) DEFAULT NULL COMMENT 'Se é resposta a outra mensagem',

  -- IA / Analytics
  `intencao_detectada` VARCHAR(100) DEFAULT NULL,
  `sentimento` VARCHAR(50) DEFAULT NULL COMMENT 'positivo, neutro, negativo',
  `palavras_chave` TEXT DEFAULT NULL COMMENT 'JSON array',

  PRIMARY KEY (`id`),
  KEY `idx_conversa` (`conversa_id`),
  KEY `idx_enviada_em` (`enviada_em`),
  KEY `fk_mensagem_resposta` (`respondendo_id`),
  CONSTRAINT `fk_mensagens_conversa` FOREIGN KEY (`conversa_id`) REFERENCES `conversas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_mensagens_resposta` FOREIGN KEY (`respondendo_id`) REFERENCES `mensagens` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Mensagens individuais das conversas';


-- 7. Tabela de Campanhas
CREATE TABLE IF NOT EXISTS `campanhas` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `empresa_id` INT(11) NOT NULL,

  `nome` VARCHAR(200) NOT NULL,
  `descricao` TEXT DEFAULT NULL,
  `status` ENUM('rascunho', 'agendada', 'em_andamento', 'pausada', 'concluida', 'cancelada') DEFAULT 'rascunho',

  -- Segmentação
  `temperatura_alvo` VARCHAR(50) DEFAULT NULL,
  `tags_alvo` TEXT DEFAULT NULL COMMENT 'JSON array',
  `dias_sem_contato` INT(11) DEFAULT NULL,
  `filtro_customizado` JSON DEFAULT NULL,

  -- Mensagem
  `template_id` INT(11) DEFAULT NULL,
  `enviar_audio` TINYINT(1) DEFAULT 0,

  -- Agendamento
  `agendada_para` DATETIME DEFAULT NULL,
  `hora_envio` VARCHAR(5) DEFAULT NULL,
  `dias_semana` VARCHAR(50) DEFAULT NULL,
  `fuso_horario` VARCHAR(50) DEFAULT 'America/Sao_Paulo',

  -- Métricas
  `total_destinatarios` INT(11) DEFAULT 0,
  `total_enviados` INT(11) DEFAULT 0,
  `total_erros` INT(11) DEFAULT 0,
  `total_respostas` INT(11) DEFAULT 0,
  `total_conversoes` INT(11) DEFAULT 0,
  `taxa_abertura` FLOAT DEFAULT 0.0,
  `taxa_resposta` FLOAT DEFAULT 0.0,
  `taxa_conversao` FLOAT DEFAULT 0.0,

  -- Timestamps
  `criada_em` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `iniciada_em` DATETIME DEFAULT NULL,
  `concluida_em` DATETIME DEFAULT NULL,
  `criada_por_id` INT(11) DEFAULT NULL,

  PRIMARY KEY (`id`),
  KEY `fk_campanha_empresa` (`empresa_id`),
  KEY `fk_campanha_criador` (`criada_por_id`),
  CONSTRAINT `fk_campanhas_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_campanhas_usuario` FOREIGN KEY (`criada_por_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Campanhas de disparo em massa';


-- 8. Tabela de Templates de Mensagem
CREATE TABLE IF NOT EXISTS `templates_mensagem` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `empresa_id` INT(11) NOT NULL,

  `nome` VARCHAR(200) NOT NULL,
  `descricao` TEXT DEFAULT NULL,
  `conteudo` TEXT NOT NULL,

  -- Variáveis dinâmicas (JSON)
  `variaveis` TEXT DEFAULT NULL COMMENT 'JSON array: {nome}, {empresa}, {produto}, {preco}',

  `tipo` VARCHAR(50) DEFAULT NULL COMMENT 'boas_vindas, remarketing, proposta, etc',
  `ativo` TINYINT(1) DEFAULT 1,

  -- Métricas
  `total_usos` INT(11) DEFAULT 0,
  `taxa_resposta_media` FLOAT DEFAULT 0.0,

  `criado_em` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `fk_template_empresa` (`empresa_id`),
  CONSTRAINT `fk_templates_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Templates de mensagens reutilizáveis';


-- 9. Tabela de Disparos (Log Individual)
CREATE TABLE IF NOT EXISTS `disparos` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `campanha_id` INT(11) NOT NULL,
  `lead_id` INT(11) DEFAULT NULL,

  `telefone` VARCHAR(20) NOT NULL,
  `mensagem_enviada` TEXT DEFAULT NULL,
  `status` ENUM('pendente', 'enviando', 'enviado', 'erro', 'respondido') DEFAULT 'pendente',

  -- Timestamps
  `agendado_para` DATETIME DEFAULT NULL,
  `enviado_em` DATETIME DEFAULT NULL,
  `lido_em` DATETIME DEFAULT NULL,
  `respondido_em` DATETIME DEFAULT NULL,

  -- Erro
  `erro_descricao` TEXT DEFAULT NULL,
  `tentativas` INT(11) DEFAULT 0,

  PRIMARY KEY (`id`),
  KEY `idx_campanha` (`campanha_id`),
  KEY `idx_status` (`status`),
  KEY `fk_disparo_lead` (`lead_id`),
  CONSTRAINT `fk_disparos_campanha` FOREIGN KEY (`campanha_id`) REFERENCES `campanhas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_disparos_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Log individual de cada disparo de campanha';


-- 10. Tabela de Interações com Lead
CREATE TABLE IF NOT EXISTS `interacoes_lead` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `lead_id` INT(11) NOT NULL,
  `usuario_id` INT(11) DEFAULT NULL,

  `tipo` VARCHAR(100) DEFAULT NULL COMMENT 'remarketing, follow_up, proposta, ligacao',
  `descricao` TEXT DEFAULT NULL,
  `resultado` VARCHAR(100) DEFAULT NULL COMMENT 'sucesso, sem_resposta, interessado',

  `canal` VARCHAR(50) DEFAULT NULL COMMENT 'whatsapp, telefone, email',
  `duracao_segundos` INT(11) DEFAULT NULL,
  `proxima_acao` DATETIME DEFAULT NULL,

  `criada_em` DATETIME DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `fk_interacao_lead` (`lead_id`),
  KEY `fk_interacao_usuario` (`usuario_id`),
  CONSTRAINT `fk_interacoes_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_interacoes_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro de interações com leads';


-- 11. Tabela de Integrações
CREATE TABLE IF NOT EXISTS `integracoes` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `empresa_id` INT(11) NOT NULL,

  `nome` VARCHAR(100) NOT NULL COMMENT 'openai, elevenlabs, zapier',
  `tipo` VARCHAR(50) DEFAULT NULL COMMENT 'ia, audio, crm, pagamento',
  `ativa` TINYINT(1) DEFAULT 1,

  -- Credenciais
  `api_key` VARCHAR(500) DEFAULT NULL,
  `api_secret` VARCHAR(500) DEFAULT NULL,
  `configuracao` JSON DEFAULT NULL,

  -- Webhooks
  `webhook_url` VARCHAR(500) DEFAULT NULL,
  `webhook_secret` VARCHAR(200) DEFAULT NULL,

  -- Métricas
  `total_chamadas` INT(11) DEFAULT 0,
  `ultima_chamada` DATETIME DEFAULT NULL,

  `criada_em` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `atualizada_em` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `fk_integracao_empresa` (`empresa_id`),
  CONSTRAINT `fk_integracoes_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Integrações externas configuradas';


-- 12. Tabela de Métricas Agregadas
CREATE TABLE IF NOT EXISTS `metricas_conversas` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `empresa_id` INT(11) NOT NULL,
  `data` DATE NOT NULL,

  -- Métricas Diárias
  `total_conversas_iniciadas` INT(11) DEFAULT 0,
  `total_conversas_finalizadas` INT(11) DEFAULT 0,
  `total_mensagens_enviadas` INT(11) DEFAULT 0,
  `total_mensagens_recebidas` INT(11) DEFAULT 0,

  -- Performance do Bot
  `tempo_resposta_medio` FLOAT DEFAULT 0.0,
  `taxa_resolucao_bot` FLOAT DEFAULT 0.0,
  `satisfacao_media` FLOAT DEFAULT 0.0,

  -- Conversão
  `leads_gerados` INT(11) DEFAULT 0,
  `leads_qualificados` INT(11) DEFAULT 0,
  `vendas_realizadas` INT(11) DEFAULT 0,
  `receita_total` DECIMAL(12,2) DEFAULT 0.0,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_empresa_data` (`empresa_id`, `data`),
  KEY `idx_data` (`data`),
  CONSTRAINT `fk_metricas_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Métricas agregadas de conversas';


-- 13. Tabela de Logs do Sistema
CREATE TABLE IF NOT EXISTS `logs_sistema` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `empresa_id` INT(11) DEFAULT NULL,
  `usuario_id` INT(11) DEFAULT NULL,

  `tipo` VARCHAR(50) DEFAULT NULL COMMENT 'login, config_alterada, bot_ativado',
  `acao` VARCHAR(200) DEFAULT NULL,
  `descricao` TEXT DEFAULT NULL,

  -- Detalhes Técnicos
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` VARCHAR(500) DEFAULT NULL,
  `dados_adicionais` JSON DEFAULT NULL,

  `criado_em` DATETIME DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_tipo` (`tipo`),
  KEY `idx_criado_em` (`criado_em`),
  KEY `fk_log_usuario` (`usuario_id`),
  CONSTRAINT `fk_logs_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Logs de atividades do sistema';


-- 14. Tabela de Produtos (Catálogo para o Bot)
CREATE TABLE IF NOT EXISTS `produtos_catalogo` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `empresa_id` INT(11) NOT NULL,

  -- Dados do Produto
  `nome` VARCHAR(200) NOT NULL,
  `descricao` TEXT DEFAULT NULL,
  `categoria` VARCHAR(100) DEFAULT NULL,
  `subcategoria` VARCHAR(100) DEFAULT NULL,

  -- Preços
  `preco` DECIMAL(12,2) DEFAULT NULL,
  `preco_promocional` DECIMAL(12,2) DEFAULT NULL,
  `moeda` VARCHAR(3) DEFAULT 'BRL',

  -- Estoque
  `estoque` INT(11) DEFAULT NULL,
  `disponivel` TINYINT(1) DEFAULT 1,

  -- Informações Adicionais
  `sku` VARCHAR(100) DEFAULT NULL,
  `codigo_barras` VARCHAR(100) DEFAULT NULL,
  `marca` VARCHAR(100) DEFAULT NULL,
  `peso` FLOAT DEFAULT NULL COMMENT 'kg',
  `dimensoes` VARCHAR(100) DEFAULT NULL COMMENT 'LxAxP em cm',

  -- Metadados para o Bot
  `palavras_chave` TEXT DEFAULT NULL COMMENT 'JSON array',
  `tags` TEXT DEFAULT NULL COMMENT 'JSON array',
  `link` VARCHAR(500) DEFAULT NULL,
  `imagem_url` VARCHAR(500) DEFAULT NULL,

  -- Dados Extras (JSON)
  `dados_extras` JSON DEFAULT NULL,

  -- Controle
  `ativo` TINYINT(1) DEFAULT 1,
  `criado_em` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `importado_csv` TINYINT(1) DEFAULT 0,

  PRIMARY KEY (`id`),
  KEY `idx_disponivel` (`disponivel`),
  KEY `fk_produto_empresa` (`empresa_id`),
  CONSTRAINT `fk_produtos_catalogo_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Catálogo de produtos para conhecimento do bot';


-- 15. Tabela de Arquivos Importados
CREATE TABLE IF NOT EXISTS `arquivos_importacao` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `empresa_id` INT(11) NOT NULL,

  `nome_arquivo` VARCHAR(200) NOT NULL,
  `tipo` VARCHAR(50) DEFAULT 'produtos' COMMENT 'produtos, leads, contatos',
  `caminho` VARCHAR(500) DEFAULT NULL,

  -- Métricas
  `total_linhas` INT(11) DEFAULT 0,
  `importados_sucesso` INT(11) DEFAULT 0,
  `importados_erro` INT(11) DEFAULT 0,
  `erros_detalhes` JSON DEFAULT NULL,

  -- Status
  `status` VARCHAR(50) DEFAULT 'processando' COMMENT 'processando, concluido, erro',

  `importado_por_id` INT(11) DEFAULT NULL,
  `criado_em` DATETIME DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `fk_arquivo_empresa` (`empresa_id`),
  KEY `fk_arquivo_usuario` (`importado_por_id`),
  CONSTRAINT `fk_arquivos_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_arquivos_usuario` FOREIGN KEY (`importado_por_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Log de arquivos CSV importados';


-- ==================== INSERIR DADOS INICIAIS ====================

-- Inserir Super Admin do VendeAI
INSERT INTO `empresas` (`nome`, `plano`, `plano_ativo`) VALUES
('VendeAI Sistema', 'enterprise', 1)
ON DUPLICATE KEY UPDATE `nome` = `nome`;

SET @empresa_id = LAST_INSERT_ID();

INSERT INTO `usuarios` (`empresa_id`, `nome`, `email`, `senha_hash`, `tipo`) VALUES
(@empresa_id, 'Administrador VendeAI', 'admin@vendeai.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super_admin')
ON DUPLICATE KEY UPDATE `email` = `email`;

-- Senha padrão: admin123


-- ==================== CONCLUÍDO ====================
-- Todas as tabelas do VendeAI foram adicionadas ao banco MySQL
-- As tabelas existentes (cars, vendors, etc) foram preservadas
-- ====================================================================

-- ============================================================
-- TABELA DE AGENDAMENTOS DE VISITAS
-- ============================================================
-- Sistema completo de agendamento de visitas com aprovação do lojista

CREATE TABLE IF NOT EXISTS agendamentos_visitas (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Cliente
    cliente_telefone VARCHAR(20) NOT NULL,
    cliente_nome VARCHAR(255),

    -- Veículo
    imovel_id INT NOT NULL,
    imovel_endereco VARCHAR(255) NOT NULL,
    imovel_preco DECIMAL(10, 2),

    -- Lojista/Vendedor
    lojista_telefone VARCHAR(20) NOT NULL,
    lojista_nome VARCHAR(255),

    -- Agendamento
    data_agendamento DATE NOT NULL,
    hora_agendamento TIME NOT NULL,
    data_hora_completa DATETIME,

    -- Status do agendamento
    status ENUM('pendente', 'aprovado', 'recusado', 'cancelado', 'realizado') DEFAULT 'pendente',

    -- Tipo de interesse
    tipo_interesse ENUM('financiamento', 'visita_loja', 'test_drive') DEFAULT 'visita_loja',

    -- Financiamento (se aplicável)
    valor_entrada DECIMAL(10, 2),
    numero_parcelas INT,
    valor_parcela DECIMAL(10, 2),
    tem_imovel_troca BOOLEAN DEFAULT FALSE,

    -- Dados da troca (se aplicável)
    imovel_troca_tipo VARCHAR(100),
    imovel_troca_endereco VARCHAR(100),
    imovel_troca_ano INT,
    imovel_troca_valor_estimado DECIMAL(10, 2),

    -- Observações
    observacoes TEXT,
    observacoes_lojista TEXT,
    motivo_recusa TEXT,

    -- Timestamps
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    aprovado_em DATETIME,
    recusado_em DATETIME,

    -- Índices
    INDEX idx_cliente (cliente_telefone),
    INDEX idx_lojista (lojista_telefone),
    INDEX idx_veiculo (imovel_id),
    INDEX idx_status (status),
    INDEX idx_data (data_agendamento),

    -- Foreign key
    FOREIGN KEY (imovel_id) REFERENCES properties(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABELA DE MENSAGENS DE AGENDAMENTO (LOG)
-- ============================================================
-- Registra todas as mensagens trocadas sobre agendamentos

CREATE TABLE IF NOT EXISTS mensagens_agendamento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    agendamento_id INT NOT NULL,

    -- Mensagem
    remetente ENUM('bot', 'cliente', 'lojista') NOT NULL,
    destinatario ENUM('cliente', 'lojista') NOT NULL,
    mensagem TEXT NOT NULL,

    -- Status
    enviada BOOLEAN DEFAULT FALSE,
    lida BOOLEAN DEFAULT FALSE,
    respondida BOOLEAN DEFAULT FALSE,

    -- Timestamps
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    enviada_em DATETIME,
    lida_em DATETIME,
    respondida_em DATETIME,

    -- Índices
    INDEX idx_agendamento (agendamento_id),

    -- Foreign key
    FOREIGN KEY (agendamento_id) REFERENCES agendamentos_visitas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- ADICIONAR CAMPO DE LOJISTA NA TABELA CARS (se não existir)
-- ============================================================
-- Vincula cada veículo a um lojista/vendedor responsável

-- ALTER TABLE cars
-- ADD COLUMN IF NOT EXISTS lojista_telefone VARCHAR(20) AFTER seller,
-- ADD COLUMN IF NOT EXISTS lojista_nome VARCHAR(255) AFTER lojista_telefone,
-- ADD INDEX IF NOT EXISTS idx_lojista_tel (lojista_telefone);

-- ============================================================
-- ATUALIZAR LOJISTA PADRÃO (ajuste conforme necessário)
-- ============================================================
-- Se você tem um lojista principal, configure aqui:

-- Exemplo: Definir lojista padrão para todos os veículos sem lojista
-- UPDATE cars
-- SET lojista_telefone = '5567999887766',
--     lojista_nome = 'Feirão ShowCar - Vendas'
-- WHERE lojista_telefone IS NULL OR lojista_telefone = '';

-- ============================================================
-- VIEWS ÚTEIS
-- ============================================================

-- View de agendamentos pendentes para lojistas
CREATE OR REPLACE VIEW agendamentos_pendentes_lojista AS
SELECT
    a.id,
    a.cliente_nome,
    a.cliente_telefone,
    a.imovel_endereco,
    a.imovel_preco,
    a.data_agendamento,
    a.hora_agendamento,
    a.tipo_interesse,
    a.lojista_telefone,
    a.lojista_nome,
    a.criado_em,
    TIMESTAMPDIFF(MINUTE, a.criado_em, NOW()) as minutos_aguardando
FROM agendamentos_visitas a
WHERE a.status = 'pendente'
ORDER BY a.criado_em ASC;

-- View de agendamentos aprovados (agenda do dia)
CREATE OR REPLACE VIEW agenda_do_dia AS
SELECT
    a.id,
    a.cliente_nome,
    a.cliente_telefone,
    a.imovel_endereco,
    a.data_agendamento,
    a.hora_agendamento,
    a.tipo_interesse,
    a.lojista_nome,
    a.aprovado_em,
    p.property_type,
    p.metragem,
    p.preco
FROM agendamentos_visitas a
LEFT JOIN properties p ON a.imovel_id = p.id
WHERE a.status = 'aprovado'
  AND a.data_agendamento = CURDATE()
ORDER BY a.hora_agendamento ASC;

-- View de estatísticas de agendamentos
CREATE OR REPLACE VIEW estatisticas_agendamentos AS
SELECT
    DATE(criado_em) as data,
    COUNT(*) as total_agendamentos,
    SUM(CASE WHEN status = 'pendente' THEN 1 ELSE 0 END) as pendentes,
    SUM(CASE WHEN status = 'aprovado' THEN 1 ELSE 0 END) as aprovados,
    SUM(CASE WHEN status = 'recusado' THEN 1 ELSE 0 END) as recusados,
    SUM(CASE WHEN status = 'realizado' THEN 1 ELSE 0 END) as realizados,
    ROUND(AVG(CASE WHEN status IN ('aprovado', 'realizado') THEN imovel_preco END), 2) as ticket_medio
FROM agendamentos_visitas
GROUP BY DATE(criado_em)
ORDER BY data DESC;

-- ============================================================
-- PROCEDURES ÚTEIS
-- ============================================================

DELIMITER //

-- Procedure para aprovar agendamento
CREATE PROCEDURE IF NOT EXISTS aprovar_agendamento(
    IN p_agendamento_id INT,
    IN p_observacoes_lojista TEXT
)
BEGIN
    UPDATE agendamentos_visitas
    SET status = 'aprovado',
        aprovado_em = NOW(),
        observacoes_lojista = p_observacoes_lojista
    WHERE id = p_agendamento_id;

    SELECT 'Agendamento aprovado com sucesso!' as mensagem;
END //

-- Procedure para recusar agendamento
CREATE PROCEDURE IF NOT EXISTS recusar_agendamento(
    IN p_agendamento_id INT,
    IN p_motivo_recusa TEXT
)
BEGIN
    UPDATE agendamentos_visitas
    SET status = 'recusado',
        recusado_em = NOW(),
        motivo_recusa = p_motivo_recusa
    WHERE id = p_agendamento_id;

    SELECT 'Agendamento recusado.' as mensagem;
END //

-- Procedure para buscar agendamentos do lojista
CREATE PROCEDURE IF NOT EXISTS buscar_agendamentos_lojista(
    IN p_lojista_telefone VARCHAR(20)
)
BEGIN
    SELECT
        a.id,
        a.cliente_nome,
        a.cliente_telefone,
        a.imovel_endereco,
        a.imovel_preco,
        a.data_agendamento,
        a.hora_agendamento,
        a.tipo_interesse,
        a.status,
        a.criado_em,
    p.property_type,
    p.metragem,
    p.preco,
    p.url_imagens
    FROM agendamentos_visitas a
    LEFT JOIN properties p ON a.imovel_id = p.id
    WHERE a.lojista_telefone = p_lojista_telefone
      AND a.status IN ('pendente', 'aprovado')
    ORDER BY a.data_agendamento ASC, a.hora_agendamento ASC;
END //

DELIMITER ;

-- ============================================================
-- TRIGGERS
-- ============================================================

DELIMITER //

-- Trigger para preencher data_hora_completa automaticamente
CREATE TRIGGER IF NOT EXISTS before_insert_agendamento
BEFORE INSERT ON agendamentos_visitas
FOR EACH ROW
BEGIN
    SET NEW.data_hora_completa = CONCAT(NEW.data_agendamento, ' ', NEW.hora_agendamento);
END //

CREATE TRIGGER IF NOT EXISTS before_update_agendamento
BEFORE UPDATE ON agendamentos_visitas
FOR EACH ROW
BEGIN
    IF NEW.data_agendamento != OLD.data_agendamento OR NEW.hora_agendamento != OLD.hora_agendamento THEN
        SET NEW.data_hora_completa = CONCAT(NEW.data_agendamento, ' ', NEW.hora_agendamento);
    END IF;
END //

DELIMITER ;

-- ============================================================
-- FIM DO SCHEMA
-- ============================================================

SELECT '✅ Tabelas de agendamento criadas com sucesso!' as status;

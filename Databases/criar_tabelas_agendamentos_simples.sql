-- ============================================================
-- TABELA DE AGENDAMENTOS DE VISITAS (Simplificado)
-- ============================================================

CREATE TABLE IF NOT EXISTS agendamentos_visitas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_telefone VARCHAR(20) NOT NULL,
    cliente_nome VARCHAR(255),
    imovel_id INT NOT NULL,
    imovel_endereco VARCHAR(500) NOT NULL,
    imovel_preco DECIMAL(12,2),
    lojista_telefone VARCHAR(20) NOT NULL,
    lojista_nome VARCHAR(255),
    data_agendamento DATE NOT NULL,
    hora_agendamento TIME NOT NULL,
    status ENUM('pendente', 'aprovado', 'recusado', 'cancelado', 'realizado') DEFAULT 'pendente',
    tipo_interesse ENUM('financiamento', 'visita_loja', 'test_drive') DEFAULT 'visita_loja',
    valor_entrada DECIMAL(10, 2),
    numero_parcelas INT,
    valor_parcela DECIMAL(10, 2),
    tem_veiculo_troca BOOLEAN DEFAULT FALSE,
    veiculo_troca_marca VARCHAR(100),
    veiculo_troca_modelo VARCHAR(100),
    veiculo_troca_ano INT,
    veiculo_troca_valor_fipe DECIMAL(10, 2),
    observacoes TEXT,
    observacoes_lojista TEXT,
    motivo_recusa TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    aprovado_em DATETIME,
    recusado_em DATETIME,
    INDEX idx_cliente (cliente_telefone),
    INDEX idx_lojista (lojista_telefone),
    INDEX idx_veiculo (veiculo_id),
    INDEX idx_status (status),
    INDEX idx_data (data_agendamento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABELA DE MENSAGENS DE AGENDAMENTO
-- ============================================================

CREATE TABLE IF NOT EXISTS mensagens_agendamento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    agendamento_id INT NOT NULL,
    remetente ENUM('bot', 'cliente', 'lojista') NOT NULL,
    destinatario ENUM('cliente', 'lojista') NOT NULL,
    mensagem TEXT NOT NULL,
    enviada BOOLEAN DEFAULT FALSE,
    lida BOOLEAN DEFAULT FALSE,
    respondida BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    enviada_em DATETIME,
    lida_em DATETIME,
    respondida_em DATETIME,
    INDEX idx_agendamento (agendamento_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- VIEWS ÚTEIS
-- ============================================================

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
    a.aprovado_em
FROM agendamentos_visitas a
WHERE a.status = 'aprovado'
  AND a.data_agendamento = CURDATE()
ORDER BY a.hora_agendamento ASC;

SELECT 'Tabelas criadas com sucesso!' as status;

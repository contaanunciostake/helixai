-- ==========================================
-- MIGRATION 004: Sistema de Assinaturas
-- VendeAI - Mercado Pago Integration
-- ==========================================

-- Tabela de planos de assinatura
CREATE TABLE IF NOT EXISTS planos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(50) NOT NULL UNIQUE,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    periodicidade VARCHAR(20) NOT NULL DEFAULT 'mensal',
    limite_mensagens INTEGER NOT NULL DEFAULT 1000,
    limite_tokens BIGINT NOT NULL DEFAULT 500000,
    recursos_extras TEXT,  -- JSON armazenado como TEXT no SQLite
    ativo BOOLEAN DEFAULT 1,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de assinaturas dos usuários
CREATE TABLE IF NOT EXISTS assinaturas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    plano_id INTEGER NOT NULL,
    mercadopago_subscription_id VARCHAR(100) UNIQUE,
    mercadopago_preapproval_id VARCHAR(100) UNIQUE,
    mercadopago_preference_id VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending',  -- pending, active, paused, cancelled, expired
    data_inicio DATE,
    data_fim DATE,
    proximo_pagamento DATE,
    valor_pago DECIMAL(10,2),
    metodo_pagamento VARCHAR(50),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (plano_id) REFERENCES planos(id)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_assinaturas_usuario_status ON assinaturas(usuario_id, status);
CREATE INDEX IF NOT EXISTS idx_assinaturas_status ON assinaturas(status);
CREATE INDEX IF NOT EXISTS idx_assinaturas_mp_subscription ON assinaturas(mercadopago_subscription_id);

-- Tabela de controle de uso mensal
CREATE TABLE IF NOT EXISTS uso_mensal (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    mes_referencia DATE NOT NULL,
    mensagens_usadas INTEGER DEFAULT 0,
    tokens_usados BIGINT DEFAULT 0,
    conversas_criadas INTEGER DEFAULT 0,
    ultima_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE(usuario_id, mes_referencia)
);

-- Índices para uso mensal
CREATE INDEX IF NOT EXISTS idx_uso_mes ON uso_mensal(mes_referencia);
CREATE INDEX IF NOT EXISTS idx_uso_usuario ON uso_mensal(usuario_id);

-- Tabela de histórico de pagamentos
CREATE TABLE IF NOT EXISTS pagamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    assinatura_id INTEGER,
    mercadopago_payment_id VARCHAR(100) UNIQUE,
    tipo VARCHAR(20) DEFAULT 'subscription',  -- subscription, one_time
    status VARCHAR(20) DEFAULT 'pending',  -- pending, approved, rejected, refunded, cancelled
    valor DECIMAL(10,2) NOT NULL,
    metodo_pagamento VARCHAR(50),
    descricao TEXT,
    data_pagamento TIMESTAMP,
    data_expiracao TIMESTAMP,
    webhook_data TEXT,  -- JSON armazenado como TEXT no SQLite
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (assinatura_id) REFERENCES assinaturas(id)
);

-- Índices para pagamentos
CREATE INDEX IF NOT EXISTS idx_pagamentos_status ON pagamentos(status);
CREATE INDEX IF NOT EXISTS idx_pagamentos_usuario ON pagamentos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_mp_id ON pagamentos(mercadopago_payment_id);

-- ==========================================
-- INSERIR PLANOS PADRÃO
-- ==========================================

INSERT OR IGNORE INTO planos (nome, descricao, preco, periodicidade, limite_mensagens, limite_tokens, recursos_extras) VALUES
('Básico', 'Ideal para começar seu negócio com IA', 89.90, 'mensal', 1000, 500000, '{"suporte": "email", "bots": 1, "integrações": "básicas"}'),
('Profissional', 'Para negócios em crescimento', 299.90, 'mensal', 5000, 2000000, '{"suporte": "prioritário", "bots": 3, "integrações": "avançadas", "analytics": true}'),
('Empresarial', 'Solução completa para grandes volumes', 899.90, 'mensal', 20000, 10000000, '{"suporte": "dedicado", "bots": "ilimitado", "integrações": "customizadas", "analytics": true, "white_label": true}');

-- ==========================================
-- TRIGGERS para atualizar timestamp
-- ==========================================

-- Trigger para atualizar atualizado_em na tabela assinaturas
CREATE TRIGGER IF NOT EXISTS update_assinaturas_timestamp
AFTER UPDATE ON assinaturas
FOR EACH ROW
BEGIN
    UPDATE assinaturas SET atualizado_em = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger para atualizar ultima_atualizacao na tabela uso_mensal
CREATE TRIGGER IF NOT EXISTS update_uso_mensal_timestamp
AFTER UPDATE ON uso_mensal
FOR EACH ROW
BEGIN
    UPDATE uso_mensal SET ultima_atualizacao = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- ==========================================
-- MIGRATION COMPLETA
-- ==========================================

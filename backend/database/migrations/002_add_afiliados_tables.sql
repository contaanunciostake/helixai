-- ==========================================
-- MIGRAÇÃO: Sistema de Afiliados
-- Data: 2025-01-24
-- Descrição: Adiciona tabelas para programa de afiliados
-- ==========================================

-- Tabela de Afiliados
CREATE TABLE IF NOT EXISTS afiliados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER UNIQUE NOT NULL,

    -- Chave de referência única
    chave_referencia VARCHAR(50) UNIQUE NOT NULL,

    -- Status
    status VARCHAR(20) DEFAULT 'pendente',

    -- Informações pessoais
    nome_completo VARCHAR(200),
    cpf_cnpj VARCHAR(18),
    telefone VARCHAR(20),

    -- Dados bancários
    banco VARCHAR(100),
    agencia VARCHAR(10),
    conta VARCHAR(20),
    tipo_conta VARCHAR(20),
    pix_tipo VARCHAR(20),
    pix_chave VARCHAR(200),

    -- Métricas
    total_clicks INTEGER DEFAULT 0,
    total_cadastros INTEGER DEFAULT 0,
    total_vendas INTEGER DEFAULT 0,
    total_comissoes_geradas REAL DEFAULT 0.0,
    total_comissoes_pagas REAL DEFAULT 0.0,
    saldo_disponivel REAL DEFAULT 0.0,

    -- Configurações personalizadas
    comissao_primeira_venda REAL,
    comissao_recorrente REAL,

    -- Timestamps
    data_inscricao DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_aprovacao DATETIME,
    data_ultimo_saque DATETIME,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX idx_afiliados_chave ON afiliados(chave_referencia);
CREATE INDEX idx_afiliados_status ON afiliados(status);

-- Tabela de Referências (Rastreamento de Cliques)
CREATE TABLE IF NOT EXISTS referencias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    afiliado_id INTEGER NOT NULL,

    -- Rastreamento
    ip_origem VARCHAR(50),
    user_agent VARCHAR(500),
    url_origem VARCHAR(500),
    url_destino VARCHAR(500),

    -- Dados do lead/cliente
    cliente_novo_id INTEGER,
    lead_id INTEGER,

    -- Status
    status VARCHAR(20) DEFAULT 'click',

    -- Informações de conversão
    valor_primeira_compra REAL,
    plano_contratado VARCHAR(50),

    -- Timestamps
    data_clique DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_cadastro DATETIME,
    data_conversao DATETIME,
    data_expiracao DATETIME,

    FOREIGN KEY (afiliado_id) REFERENCES afiliados(id) ON DELETE CASCADE,
    FOREIGN KEY (cliente_novo_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL
);

CREATE INDEX idx_referencias_afiliado ON referencias(afiliado_id);
CREATE INDEX idx_referencias_status ON referencias(status);
CREATE INDEX idx_referencias_data_clique ON referencias(data_clique);

-- Tabela de Comissões
CREATE TABLE IF NOT EXISTS comissoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    afiliado_id INTEGER NOT NULL,
    referencia_id INTEGER,

    -- Tipo e valor
    tipo VARCHAR(20) NOT NULL,
    valor REAL NOT NULL,
    percentual REAL,
    valor_base REAL,

    -- Status
    status VARCHAR(20) DEFAULT 'pendente',

    -- Referência ao pagamento
    pagamento_id INTEGER,
    assinatura_id INTEGER,

    -- Descrição
    descricao TEXT,
    observacoes TEXT,

    -- Timestamps
    data_geracao DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_aprovacao DATETIME,
    data_pagamento DATETIME,
    data_cancelamento DATETIME,

    -- Saque relacionado
    saque_id INTEGER,

    FOREIGN KEY (afiliado_id) REFERENCES afiliados(id) ON DELETE CASCADE,
    FOREIGN KEY (referencia_id) REFERENCES referencias(id) ON DELETE SET NULL,
    FOREIGN KEY (saque_id) REFERENCES saques_afiliados(id) ON DELETE SET NULL
);

CREATE INDEX idx_comissoes_afiliado ON comissoes(afiliado_id);
CREATE INDEX idx_comissoes_status ON comissoes(status);
CREATE INDEX idx_comissoes_data ON comissoes(data_geracao);

-- Tabela de Saques
CREATE TABLE IF NOT EXISTS saques_afiliados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    afiliado_id INTEGER NOT NULL,

    -- Valor
    valor_solicitado REAL NOT NULL,
    valor_pago REAL,
    taxa REAL DEFAULT 0.0,

    -- Status
    status VARCHAR(50) DEFAULT 'pendente',

    -- Método de pagamento
    metodo_pagamento VARCHAR(50),

    -- Comprovante
    comprovante_url VARCHAR(500),
    comprovante_dados TEXT,

    -- Timestamps
    data_solicitacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_aprovacao DATETIME,
    data_pagamento DATETIME,
    data_rejeicao DATETIME,

    -- Observações
    observacoes TEXT,
    motivo_rejeicao TEXT,

    FOREIGN KEY (afiliado_id) REFERENCES afiliados(id) ON DELETE CASCADE
);

CREATE INDEX idx_saques_afiliado ON saques_afiliados(afiliado_id);
CREATE INDEX idx_saques_status ON saques_afiliados(status);
CREATE INDEX idx_saques_data ON saques_afiliados(data_solicitacao);

-- Tabela de Configurações de Afiliados
CREATE TABLE IF NOT EXISTS configuracoes_afiliados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Comissões padrão (%)
    comissao_primeira_venda_padrao REAL DEFAULT 30.0,
    comissao_recorrente_padrao REAL DEFAULT 20.0,

    -- Regras
    prazo_cookie_dias INTEGER DEFAULT 30,
    minimo_saque REAL DEFAULT 50.0,
    prazo_aprovacao_comissao_dias INTEGER DEFAULT 30,

    -- Bonificações
    bonus_meta_5_vendas REAL DEFAULT 100.0,
    bonus_meta_10_vendas REAL DEFAULT 250.0,
    bonus_meta_20_vendas REAL DEFAULT 500.0,

    -- Status do programa
    programa_ativo BOOLEAN DEFAULT 1,
    aceitar_novos_afiliados BOOLEAN DEFAULT 1,

    -- Termos e políticas
    termos_uso TEXT,
    politica_pagamento TEXT,

    -- Timestamps
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Inserir configuração padrão
INSERT INTO configuracoes_afiliados (
    comissao_primeira_venda_padrao,
    comissao_recorrente_padrao,
    prazo_cookie_dias,
    minimo_saque,
    prazo_aprovacao_comissao_dias,
    bonus_meta_5_vendas,
    bonus_meta_10_vendas,
    bonus_meta_20_vendas,
    programa_ativo,
    aceitar_novos_afiliados,
    termos_uso,
    politica_pagamento
) VALUES (
    30.0,
    20.0,
    30,
    50.0,
    30,
    100.0,
    250.0,
    500.0,
    1,
    1,
    'Termos de uso do programa de afiliados AIRA. Ao se cadastrar você concorda em promover nossos produtos de forma ética e verdadeira.',
    'As comissões são aprovadas após 30 dias da venda confirmada. O pagamento é realizado via PIX em até 7 dias úteis após a solicitação de saque.'
);

-- ==========================================
-- FIM DA MIGRAÇÃO
-- ==========================================

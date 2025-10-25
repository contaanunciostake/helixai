-- ============================================
-- SCRIPT DE DADOS DE TESTE - AFILIADO
-- Execute DEPOIS do script de criação de tabelas
-- ============================================

-- 1. Criar configurações do sistema de afiliados (se não existir)
INSERT OR IGNORE INTO configuracoes_afiliados (
    id,
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
    1,
    30.0,
    20.0,
    30,
    50.0,
    7,
    100.0,
    300.0,
    1000.0,
    1,
    1,
    'Termos e condições do programa de afiliados AIRA. Ao se cadastrar você concorda com as regras estabelecidas.',
    'Política de pagamento: Os saques são processados em até 7 dias úteis após aprovação. Valor mínimo de R$ 50,00.'
);

-- 2. Criar usuário afiliado
INSERT INTO usuarios (
    empresa_id,
    nome,
    email,
    senha_hash,
    tipo,
    ativo,
    criado_em
) VALUES (
    1,  -- Assumindo empresa_id = 1
    'João Silva - Afiliado',
    'afiliado@teste.com',
    'scrypt:32768:8:1$qeaQvL6E1TdLDU4J$c1a2adc3d60d87e20a53de7e6e863e9b0cc1f0a6a5b1e1e0e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1',
    'usuario',
    1,
    datetime('now')
);

-- 3. Criar afiliado
INSERT INTO afiliados (
    usuario_id,
    chave_referencia,
    status,
    nome_completo,
    cpf_cnpj,
    telefone,
    banco,
    agencia,
    conta,
    tipo_conta,
    pix_tipo,
    pix_chave,
    total_clicks,
    total_cadastros,
    total_vendas,
    total_comissoes_geradas,
    total_comissoes_pagas,
    saldo_disponivel,
    comissao_primeira_venda,
    comissao_recorrente,
    data_inscricao,
    data_aprovacao,
    criado_em
) VALUES (
    (SELECT id FROM usuarios WHERE email = 'afiliado@teste.com'),
    'teste2025',
    'ativo',
    'João Silva dos Santos',
    '123.456.789-00',
    '(11) 98765-4321',
    'Banco do Brasil',
    '1234',
    '56789-0',
    'corrente',
    'cpf',
    '12345678900',
    10,
    5,
    2,
    317.60,
    139.40,
    149.10,
    30.0,
    20.0,
    datetime('now'),
    datetime('now'),
    datetime('now')
);

-- 4. Criar referências (clicks, cadastros e vendas)
-- Clicks simples
INSERT INTO referencias (afiliado_id, ip_origem, user_agent, url_origem, status, data_clique)
VALUES
((SELECT id FROM afiliados WHERE chave_referencia = 'teste2025'), '192.168.1.101', 'Mozilla/5.0', 'https://www.google.com', 'click', datetime('now', '-5 days')),
((SELECT id FROM afiliados WHERE chave_referencia = 'teste2025'), '192.168.1.102', 'Mozilla/5.0', 'https://www.google.com', 'click', datetime('now', '-10 days')),
((SELECT id FROM afiliados WHERE chave_referencia = 'teste2025'), '192.168.1.103', 'Mozilla/5.0', 'https://www.google.com', 'click', datetime('now', '-15 days')),
((SELECT id FROM afiliados WHERE chave_referencia = 'teste2025'), '192.168.1.104', 'Mozilla/5.0', 'https://www.google.com', 'click', datetime('now', '-20 days')),
((SELECT id FROM afiliados WHERE chave_referencia = 'teste2025'), '192.168.1.105', 'Mozilla/5.0', 'https://www.google.com', 'click', datetime('now', '-25 days'));

-- Cadastros
INSERT INTO referencias (afiliado_id, ip_origem, user_agent, url_origem, status, data_clique, data_cadastro)
VALUES
((SELECT id FROM afiliados WHERE chave_referencia = 'teste2025'), '192.168.1.106', 'Mozilla/5.0', 'https://www.google.com', 'cadastro', datetime('now', '-8 days'), datetime('now', '-7 days')),
((SELECT id FROM afiliados WHERE chave_referencia = 'teste2025'), '192.168.1.107', 'Mozilla/5.0', 'https://www.google.com', 'cadastro', datetime('now', '-12 days'), datetime('now', '-10 days')),
((SELECT id FROM afiliados WHERE chave_referencia = 'teste2025'), '192.168.1.108', 'Mozilla/5.0', 'https://www.google.com', 'cadastro', datetime('now', '-18 days'), datetime('now', '-15 days'));

-- Vendas convertidas
INSERT INTO referencias (afiliado_id, ip_origem, user_agent, url_origem, status, data_clique, data_cadastro, data_conversao, valor_primeira_compra, plano_contratado)
VALUES
((SELECT id FROM afiliados WHERE chave_referencia = 'teste2025'), '192.168.1.109', 'Mozilla/5.0', 'https://www.google.com', 'convertido', datetime('now', '-25 days'), datetime('now', '-20 days'), datetime('now', '-15 days'), 97.00, 'basico'),
((SELECT id FROM afiliados WHERE chave_referencia = 'teste2025'), '192.168.1.110', 'Mozilla/5.0', 'https://www.google.com', 'convertido', datetime('now', '-30 days'), datetime('now', '-25 days'), datetime('now', '-20 days'), 497.00, 'enterprise');

-- 5. Criar comissões
-- Comissão pendente
INSERT INTO comissoes (afiliado_id, tipo, valor, percentual, valor_base, status, descricao, data_geracao)
VALUES ((SELECT id FROM afiliados WHERE chave_referencia = 'teste2025'), 'primeira_venda', 29.10, 30.0, 97.0, 'pendente', 'Comissão da primeira venda - Plano Básico', datetime('now', '-5 days'));

-- Comissão aprovada (disponível para saque)
INSERT INTO comissoes (afiliado_id, tipo, valor, percentual, valor_base, status, descricao, data_geracao, data_aprovacao)
VALUES ((SELECT id FROM afiliados WHERE chave_referencia = 'teste2025'), 'primeira_venda', 149.10, 30.0, 497.0, 'aprovada', 'Comissão da primeira venda - Plano Enterprise', datetime('now', '-20 days'), datetime('now', '-10 days'));

-- Comissões pagas
INSERT INTO comissoes (afiliado_id, tipo, valor, percentual, valor_base, status, descricao, data_geracao, data_aprovacao, data_pagamento)
VALUES
((SELECT id FROM afiliados WHERE chave_referencia = 'teste2025'), 'recorrente', 39.40, 20.0, 197.0, 'paga', 'Comissão recorrente - Plano Profissional (Mês 2)', datetime('now', '-30 days'), datetime('now', '-20 days'), datetime('now', '-10 days')),
((SELECT id FROM afiliados WHERE chave_referencia = 'teste2025'), 'bonus', 100.00, 0.0, 0.0, 'paga', 'Bônus por atingir 5 vendas no mês', datetime('now', '-15 days'), datetime('now', '-10 days'), datetime('now', '-5 days'));

-- 6. Criar histórico de saques
-- Saque pago
INSERT INTO saques_afiliados (afiliado_id, valor_solicitado, valor_pago, taxa, status, metodo_pagamento, data_solicitacao, data_aprovacao, data_pagamento, observacoes)
VALUES ((SELECT id FROM afiliados WHERE chave_referencia = 'teste2025'), 139.40, 139.40, 0.0, 'pago', 'pix', datetime('now', '-15 days'), datetime('now', '-10 days'), datetime('now', '-5 days'), 'Pagamento realizado via PIX');

-- Saque pendente
INSERT INTO saques_afiliados (afiliado_id, valor_solicitado, status, metodo_pagamento, data_solicitacao)
VALUES ((SELECT id FROM afiliados WHERE chave_referencia = 'teste2025'), 50.00, 'pendente', 'pix', datetime('now', '-2 days'));

-- ============================================
-- RESULTADO DO CADASTRO
-- ============================================

SELECT '============================================';
SELECT 'AFILIADO DE TESTE CRIADO COM SUCESSO!';
SELECT '============================================';
SELECT '';
SELECT '📧 CREDENCIAIS DE LOGIN:';
SELECT '   Email: afiliado@teste.com';
SELECT '   Senha: 123456';
SELECT '';
SELECT '👤 DADOS DO AFILIADO:';
SELECT '   Nome: ' || nome_completo FROM afiliados WHERE chave_referencia = 'teste2025';
SELECT '   Status: ' || status FROM afiliados WHERE chave_referencia = 'teste2025';
SELECT '   Chave: ' || chave_referencia FROM afiliados WHERE chave_referencia = 'teste2025';
SELECT '   🔗 Link: http://localhost:5000/r/' || chave_referencia FROM afiliados WHERE chave_referencia = 'teste2025';
SELECT '';
SELECT '📊 MÉTRICAS:';
SELECT '   Clicks: ' || total_clicks FROM afiliados WHERE chave_referencia = 'teste2025';
SELECT '   Cadastros: ' || total_cadastros FROM afiliados WHERE chave_referencia = 'teste2025';
SELECT '   Vendas: ' || total_vendas FROM afiliados WHERE chave_referencia = 'teste2025';
SELECT '   Comissões Geradas: R$ ' || printf('%.2f', total_comissoes_geradas) FROM afiliados WHERE chave_referencia = 'teste2025';
SELECT '   Comissões Pagas: R$ ' || printf('%.2f', total_comissoes_pagas) FROM afiliados WHERE chave_referencia = 'teste2025';
SELECT '   💰 Saldo Disponível: R$ ' || printf('%.2f', saldo_disponivel) FROM afiliados WHERE chave_referencia = 'teste2025';
SELECT '';
SELECT '✅ Pronto para testar o sistema de afiliados!';
SELECT '============================================';
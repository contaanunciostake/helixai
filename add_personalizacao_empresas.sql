-- ════════════════════════════════════════════════════════════════
-- SQL: Adicionar Campos de Personalização por Loja
-- ════════════════════════════════════════════════════════════════
-- Executa em: helixai_db
-- Propósito: Permitir que cada loja configure seu bot individualmente
-- ════════════════════════════════════════════════════════════════

USE helixai_db;

-- ════════════════════════════════════════════════════════════════
-- SEÇÃO 1: POLÍTICA COMERCIAL
-- ════════════════════════════════════════════════════════════════

-- Aceita veículo usado como entrada/troca?
ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS aceita_troca BOOLEAN DEFAULT false
COMMENT 'Aceita veículo usado como parte do pagamento';

-- Brindes oferecidos pela loja
ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS brindes TEXT
COMMENT 'Brindes oferecidos (ex: kit tapetes + película)';

-- Desconto máximo que o bot pode oferecer
ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS desconto_maximo DECIMAL(10,2) DEFAULT 0
COMMENT 'Desconto máximo em reais que o bot pode oferecer';

-- Formas de pagamento aceitas
ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS formas_pagamento TEXT
COMMENT 'Formas de pagamento aceitas (JSON ou texto separado por vírgula)';

-- Número máximo de parcelas
ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS parcelas_maximas INT DEFAULT 48
COMMENT 'Número máximo de parcelas para financiamento';

-- Entrada mínima em percentual
ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS entrada_minima_percentual INT DEFAULT 20
COMMENT 'Percentual mínimo de entrada para financiamento';

-- Taxa de juros praticada
ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS taxa_juros_media DECIMAL(5,2) DEFAULT 1.99
COMMENT 'Taxa de juros média mensal (%)';

-- Política de desconto (texto livre)
ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS politica_desconto TEXT
COMMENT 'Regras de desconto da loja (texto livre)';

-- ════════════════════════════════════════════════════════════════
-- SEÇÃO 2: PERSONALIZAÇÃO DO ATENDIMENTO
-- ════════════════════════════════════════════════════════════════

-- Tom de conversa (já existe no setup original, mas garantir)
ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS tom_conversa ENUM('casual', 'formal', 'amigavel') DEFAULT 'casual'
COMMENT 'Tom de conversa do bot';

-- Mensagem de boas-vindas personalizada
ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS mensagem_boas_vindas TEXT
COMMENT 'Mensagem inicial quando cliente fala com o bot';

-- Mensagem de despedida personalizada
ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS mensagem_despedida TEXT
COMMENT 'Mensagem de encerramento da conversa';

-- Nome do vendedor virtual (personalidade do bot)
ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS nome_vendedor_virtual VARCHAR(100) DEFAULT 'Assistente Virtual'
COMMENT 'Nome do bot (ex: Lucas, Ana, Vendedor Virtual)';

-- ════════════════════════════════════════════════════════════════
-- SEÇÃO 3: INFORMAÇÕES DO SHOWROOM
-- ════════════════════════════════════════════════════════════════

-- Horário de atendimento
ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS horario_atendimento VARCHAR(100) DEFAULT 'Segunda a sexta, 9h às 18h'
COMMENT 'Horário de funcionamento da loja';

-- Endereço do showroom
ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS endereco_showroom TEXT
COMMENT 'Endereço completo da loja física';

-- Link do Google Maps
ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS link_maps TEXT
COMMENT 'Link do Google Maps para localização';

-- Oferece test drive?
ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS oferece_test_drive BOOLEAN DEFAULT true
COMMENT 'Loja oferece test drive';

-- Como agendar test drive
ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS como_agendar_test_drive TEXT
COMMENT 'Instruções para agendamento de test drive';

-- ════════════════════════════════════════════════════════════════
-- SEÇÃO 4: DIFERENCIAIS COMPETITIVOS
-- ════════════════════════════════════════════════════════════════

-- Especialidades da loja
ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS especialidades TEXT
COMMENT 'Especialidades da loja (ex: SUVs, seminovos premium, carros importados)';

-- Diferenciais competitivos
ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS diferenciais TEXT
COMMENT 'Diferenciais da loja em relação à concorrência';

-- Garantia oferecida
ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS garantia_oferecida VARCHAR(255)
COMMENT 'Garantia oferecida (ex: 3 meses, 1 ano, garantia de fábrica)';

-- Serviços adicionais
ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS servicos_adicionais TEXT
COMMENT 'Serviços adicionais (ex: despachante, seguro, proteção veicular)';

-- ════════════════════════════════════════════════════════════════
-- SEÇÃO 5: POLÍTICA DE VEÍCULOS USADOS (se aceita troca)
-- ════════════════════════════════════════════════════════════════

-- Desconto no usado se comprar zero
ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS desconto_troca_compra_zero DECIMAL(10,2) DEFAULT 0
COMMENT 'Bônus adicional se trocar usado e comprar zero km';

-- Avalia veículos de outras marcas?
ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS avalia_outras_marcas BOOLEAN DEFAULT true
COMMENT 'Aceita veículos usados de outras marcas';

-- Critérios de avaliação
ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS criterios_avaliacao_usado TEXT
COMMENT 'Critérios para avaliação de veículos usados';

-- ════════════════════════════════════════════════════════════════
-- SEÇÃO 6: CONFIGURAÇÕES TÉCNICAS DO BOT
-- ════════════════════════════════════════════════════════════════

-- Configurações já existentes (garantir que existem)
ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS auto_resposta_ativa BOOLEAN DEFAULT true
COMMENT 'Bot responde automaticamente';

ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS enviar_audio BOOLEAN DEFAULT true
COMMENT 'Bot envia respostas em áudio';

-- Módulos opcionais
ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS modulo_fipe_ativo BOOLEAN DEFAULT true
COMMENT 'Habilitar consulta de tabela FIPE';

ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS modulo_financiamento_ativo BOOLEAN DEFAULT true
COMMENT 'Habilitar simulador de financiamento';

ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS modulo_agendamento_ativo BOOLEAN DEFAULT true
COMMENT 'Habilitar agendamento de test drive';

-- ════════════════════════════════════════════════════════════════
-- SEÇÃO 7: REDES SOCIAIS E CONTATO
-- ════════════════════════════════════════════════════════════════

ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS instagram_url VARCHAR(255)
COMMENT 'Link do Instagram da loja';

ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS facebook_url VARCHAR(255)
COMMENT 'Link do Facebook da loja';

ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS site_url VARCHAR(255)
COMMENT 'Site da loja';

ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS email_contato VARCHAR(255)
COMMENT 'E-mail de contato da loja';

ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS telefone_vendas VARCHAR(20)
COMMENT 'Telefone para vendas (pode ser diferente do WhatsApp)';

-- ════════════════════════════════════════════════════════════════
-- EXEMPLOS DE DADOS
-- ════════════════════════════════════════════════════════════════

-- LOJA RJ: Agressiva em vendas, aceita troca, casual
UPDATE empresas SET
  aceita_troca = true,
  brindes = 'Kit tapetes + película + tanque cheio',
  desconto_maximo = 8000.00,
  formas_pagamento = 'À vista, Financiamento, Consórcio, Leasing',
  parcelas_maximas = 60,
  entrada_minima_percentual = 10,
  taxa_juros_media = 1.79,
  tom_conversa = 'casual',
  mensagem_boas_vindas = 'E aí! Beleza? Procurando um carrão? Temos várias opções pra você!',
  mensagem_despedida = 'Valeu! Qualquer coisa, só chamar! Estamos aqui! 🚗',
  nome_vendedor_virtual = 'Lucas',
  horario_atendimento = 'Segunda a sábado, 8h às 20h',
  oferece_test_drive = true,
  como_agendar_test_drive = 'Só me passar seu nome, CPF e quando quer fazer o test! A gente agenda na hora!',
  especialidades = 'Seminovos premium, SUVs, carros importados',
  diferenciais = 'Maior estoque do RJ, melhores condições de financiamento, aprovação na hora',
  garantia_oferecida = '1 ano de garantia mecânica',
  servicos_adicionais = 'Despachante grátis, seguro com desconto, proteção veicular',
  desconto_troca_compra_zero = 2000.00,
  avalia_outras_marcas = true,
  criterios_avaliacao_usado = 'Avaliação pela FIPE + estado do veículo',
  modulo_fipe_ativo = true,
  modulo_financiamento_ativo = true,
  modulo_agendamento_ativo = true,
  instagram_url = 'https://instagram.com/lojarjauto',
  site_url = 'https://lojarjauto.com.br',
  email_contato = 'vendas@lojarjauto.com.br',
  telefone_vendas = '21999999999'
WHERE id = 1;

-- LOJA SP: Premium, formal, NÃO aceita troca
UPDATE empresas SET
  aceita_troca = false,
  brindes = 'Primeira revisão de 10.000 km grátis',
  desconto_maximo = 3000.00,
  formas_pagamento = 'À vista, Financiamento',
  parcelas_maximas = 48,
  entrada_minima_percentual = 20,
  taxa_juros_media = 1.99,
  tom_conversa = 'formal',
  mensagem_boas_vindas = 'Seja bem-vindo à SP Premium Motors. Como podemos ajudá-lo hoje?',
  mensagem_despedida = 'Agradecemos o contato. Estamos à disposição para atendê-lo.',
  nome_vendedor_virtual = 'Assistente Premium',
  horario_atendimento = 'Segunda a sexta, 9h às 18h. Sábado, 9h às 13h',
  oferece_test_drive = true,
  como_agendar_test_drive = 'Para agendar, solicitamos nome completo, CPF e preferência de data/horário.',
  especialidades = 'Veículos premium 0km, carros de luxo',
  diferenciais = 'Showroom climatizado, atendimento personalizado, carros zero com procedência',
  garantia_oferecida = 'Garantia de fábrica',
  servicos_adicionais = 'Seguro auto, blindagem, instalação de acessórios premium',
  desconto_troca_compra_zero = 0,
  avalia_outras_marcas = false,
  modulo_fipe_ativo = false,
  modulo_financiamento_ativo = true,
  modulo_agendamento_ativo = true,
  instagram_url = 'https://instagram.com/sppremiummotors',
  facebook_url = 'https://facebook.com/sppremiummotors',
  site_url = 'https://sppremiummotors.com.br',
  email_contato = 'contato@sppremiummotors.com.br',
  telefone_vendas = '1133334444'
WHERE id = 2;

-- LOJA MG: Foco em consórcio, amigável
UPDATE empresas SET
  aceita_troca = true,
  brindes = 'Seguro do primeiro ano grátis',
  desconto_maximo = 5000.00,
  formas_pagamento = 'Consórcio, Financiamento, À vista',
  parcelas_maximas = 80,
  entrada_minima_percentual = 0,
  taxa_juros_media = 1.49,
  tom_conversa = 'amigavel',
  mensagem_boas_vindas = 'Olá, amigo! Aqui na MG Auto temos as melhores condições de consórcio! Vamos conversar?',
  mensagem_despedida = 'Foi um prazer conversar com você! Estamos aqui sempre que precisar!',
  nome_vendedor_virtual = 'Ana',
  horario_atendimento = 'Segunda a sexta, 8h às 18h',
  oferece_test_drive = true,
  como_agendar_test_drive = 'Me passa seu nome e quando você quer vir, a gente marca! É rapidinho!',
  especialidades = 'Consórcios contemplados, carros para todos os bolsos',
  diferenciais = 'Sem entrada, parcelas que cabem no bolso, aprovação facilitada',
  garantia_oferecida = '6 meses de garantia',
  servicos_adicionais = 'Consórcio próprio, financiamento facilitado, seguro com desconto',
  desconto_troca_compra_zero = 3000.00,
  avalia_outras_marcas = true,
  criterios_avaliacao_usado = 'Aceitamos como lance no consórcio, avaliação justa pela FIPE',
  modulo_fipe_ativo = true,
  modulo_financiamento_ativo = true,
  modulo_agendamento_ativo = true,
  instagram_url = 'https://instagram.com/mgautoconsorcios',
  site_url = 'https://mgauto.com.br',
  email_contato = 'vendas@mgauto.com.br',
  telefone_vendas = '3134445555'
WHERE id = 3;

-- ════════════════════════════════════════════════════════════════
-- VERIFICAR DADOS
-- ════════════════════════════════════════════════════════════════

-- Ver configurações de todas as empresas
SELECT
  id,
  nome,
  aceita_troca,
  brindes,
  desconto_maximo,
  tom_conversa,
  nome_vendedor_virtual,
  oferece_test_drive
FROM empresas
ORDER BY id;

-- Ver configuração completa de uma empresa específica
SELECT * FROM empresas WHERE id = 1;

-- ════════════════════════════════════════════════════════════════
-- DONE! 🎉
-- ════════════════════════════════════════════════════════════════
-- Agora cada loja pode ter configurações totalmente diferentes!
-- O bot vai carregar essas configurações automaticamente via CRM Adapter
-- ════════════════════════════════════════════════════════════════

"""
Popular MySQL com dados completos para Comercial Mariano (empresa 23)
Inclui: clientes, pedidos, entregas, agendamentos, equipe, fornecedores
"""

import mysql.connector
from datetime import datetime, timedelta
import random

EMPRESA_ID = 23

def get_connection():
    return mysql.connector.connect(
        host='localhost',
        user='root',
        password='',
        database='helixai_db'
    )

conn = get_connection()
cursor = conn.cursor(dictionary=True)

print("="*60)
print("POPULANDO MYSQL - COMERCIAL MARIANO (ID 23)")
print("="*60)

# ============================================================
# 1. CLIENTES
# ============================================================
print("\n[1/7] Inserindo CLIENTES...")

clientes = [
    ('Auto Mecanica Silva', 'PJ', '12.345.678/0001-90', 'contato@mecsilva.com.br', '11999001001', 'Rua das Oficinas, 123', 'Centro', 'Sao Paulo', 'SP'),
    ('Posto Ipiranga Centro', 'PJ', '23.456.789/0001-01', 'posto.centro@email.com', '11999002002', 'Av. Brasil, 500', 'Centro', 'Sao Paulo', 'SP'),
    ('Oficina do Joao', 'PF', '123.456.789-00', 'joao.oficina@gmail.com', '11999003003', 'Rua dos Mecanicos, 45', 'Vila Nova', 'Guarulhos', 'SP'),
    ('Transportadora Rapido Express', 'PJ', '34.567.890/0001-12', 'compras@rapidotrans.com.br', '11999004004', 'Rod. Anhanguera km 30', 'Industrial', 'Jundiai', 'SP'),
    ('Retifica Motores SA', 'PJ', '45.678.901/0001-23', 'retifica@motores.com', '11999005005', 'Rua Industrial, 789', 'Distrito Industrial', 'Campinas', 'SP'),
    ('Auto Pecas Dois Irmaos', 'PJ', '56.789.012/0001-34', 'compras@doisirmaos.com', '11999006006', 'Av. Comercial, 321', 'Centro', 'Osasco', 'SP'),
    ('Moto Center 21', 'PJ', '67.890.123/0001-45', 'motocenter@email.com', '11999007007', 'Rua das Motos, 100', 'Vila Moto', 'Santo Andre', 'SP'),
    ('Agro Tratores Ltda', 'PJ', '78.901.234/0001-56', 'agro@tratores.com.br', '11999008008', 'Estrada Rural km 15', 'Zona Rural', 'Campinas', 'SP'),
    ('Frota Express Logistica', 'PJ', '89.012.345/0001-67', 'frota@express.com.br', '11999009009', 'Av. dos Caminhoes, 999', 'Industrial', 'Guarulhos', 'SP'),
    ('Lava Jato Premium', 'PJ', '90.123.456/0001-78', 'premium@lavajato.com', '11999010010', 'Rua Limpa, 50', 'Centro', 'Sao Bernardo', 'SP'),
    ('Borracharia 24h', 'PF', '234.567.890-11', 'borracharia24@gmail.com', '11999011011', 'Rua dos Pneus, 24', 'Rodovia', 'Maua', 'SP'),
    ('Auto Eletrica Estrela', 'PJ', '01.234.567/0001-89', 'estrela@autoeletrica.com', '11999012012', 'Av. Eletrica, 200', 'Centro', 'Diadema', 'SP'),
    ('Garagem Tuning Performance', 'PJ', '12.345.678/0001-90', 'tuning@garagem.com', '11999013013', 'Rua Performance, 150', 'Vila Auto', 'Sao Paulo', 'SP'),
    ('Taxi Cidade Cooperativa', 'PJ', '23.456.789/0001-01', 'frota@taxicidade.com.br', '11999014014', 'Rua dos Taxis, 300', 'Centro', 'Sao Paulo', 'SP'),
    ('Onibus Urbano SA', 'PJ', '34.567.890/0001-12', 'manutencao@onibus.com', '11999015015', 'Terminal Rodoviario', 'Terminal', 'Sao Paulo', 'SP'),
    ('Carlos Mecanico', 'PF', '345.678.901-22', 'carlos.mec@gmail.com', '11999016016', 'Rua do Carlos, 77', 'Bairro Novo', 'Cotia', 'SP'),
    ('Maria Auto Pecas', 'PF', '456.789.012-33', 'maria.pecas@gmail.com', '11999017017', 'Av. Maria, 88', 'Centro', 'Barueri', 'SP'),
    ('Pedro Caminhoes', 'PF', '567.890.123-44', 'pedro.cam@gmail.com', '11999018018', 'Rod. Pedro, km 5', 'Rodovia', 'Cajamar', 'SP'),
    ('Frota Municipal', 'PJ', '45.678.901/0001-23', 'frota@prefeitura.gov.br', '11999019019', 'Praca Central, 1', 'Centro', 'Sao Paulo', 'SP'),
    ('Concessionaria Premium', 'PJ', '56.789.012/0001-34', 'pecas@premium.com.br', '11999020020', 'Av. Premium, 1000', 'Jardins', 'Sao Paulo', 'SP'),
]

cursor.execute("SELECT COUNT(*) as c FROM clientes WHERE empresa_id = %s", (EMPRESA_ID,))
if cursor.fetchone()['c'] == 0:
    for c in clientes:
        cursor.execute("""
            INSERT INTO clientes (empresa_id, nome, tipo, cpf_cnpj, email, telefone, celular, endereco, bairro, cidade, estado, ativo, criado_em)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 1, NOW())
        """, (EMPRESA_ID, c[0], c[1], c[2], c[3], c[4], c[4], c[5], c[6], c[7], c[8]))
    print(f"  {len(clientes)} clientes inseridos")
else:
    print("  Clientes ja existem")

conn.commit()

# ============================================================
# 2. ENTREGADORES (EQUIPE)
# ============================================================
print("\n[2/7] Inserindo ENTREGADORES (equipe)...")

entregadores = [
    ('Joao Silva', '11988001001', 'ABC-1234', 'Fiorino'),
    ('Pedro Santos', '11988002002', 'DEF-5678', 'Saveiro'),
    ('Carlos Oliveira', '11988003003', 'GHI-9012', 'Moto CG 160'),
    ('Lucas Ferreira', '11988004004', 'JKL-3456', 'Kombi'),
    ('Marcos Lima', '11988005005', 'MNO-7890', 'HR Hyundai'),
]

cursor.execute("SELECT COUNT(*) as c FROM entregadores WHERE empresa_id = %s", (EMPRESA_ID,))
if cursor.fetchone()['c'] == 0:
    for e in entregadores:
        cursor.execute("""
            INSERT INTO entregadores (empresa_id, nome, telefone, placa_veiculo, tipo_veiculo, disponivel, ativo, criado_em)
            VALUES (%s, %s, %s, %s, %s, 1, 1, NOW())
        """, (EMPRESA_ID, e[0], e[1], e[2], e[3]))
    print(f"  {len(entregadores)} entregadores inseridos")
else:
    print("  Entregadores ja existem")

conn.commit()

# ============================================================
# 3. FORNECEDORES
# ============================================================
print("\n[3/7] Inserindo FORNECEDORES...")

# Verificar se tabela fornecedores existe
cursor.execute("SHOW TABLES LIKE 'fornecedores'")
if not cursor.fetchone():
    print("  Criando tabela fornecedores...")
    cursor.execute("""
        CREATE TABLE fornecedores (
            id INT AUTO_INCREMENT PRIMARY KEY,
            empresa_id INT,
            nome VARCHAR(200),
            cnpj VARCHAR(20),
            email VARCHAR(200),
            telefone VARCHAR(20),
            endereco VARCHAR(300),
            cidade VARCHAR(100),
            estado VARCHAR(2),
            contato VARCHAR(100),
            observacoes TEXT,
            ativo BOOLEAN DEFAULT 1,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

fornecedores = [
    ('Ipiranga Distribuidora', '12.345.678/0001-90', 'vendas@ipiranga.com.br', '1140001001', 'Rua Ipiranga, 100', 'Sao Paulo', 'SP', 'Maria Vendas'),
    ('Texaco Brasil', '23.456.789/0001-01', 'comercial@texaco.com.br', '1140002002', 'Av. Texaco, 200', 'Sao Paulo', 'SP', 'Joao Comercial'),
    ('Mann Filter Brasil', '34.567.890/0001-12', 'vendas@mann.com.br', '1140003003', 'Rod. Mann km 10', 'Jundiai', 'SP', 'Carlos Filtros'),
    ('Tecfil Filtros', '45.678.901/0001-23', 'pedidos@tecfil.com.br', '1140004004', 'Av. Industrial, 300', 'Guarulhos', 'SP', 'Ana Pedidos'),
    ('Militec Brasil', '56.789.012/0001-34', 'distribuidores@militec.com.br', '1140005005', 'Rua Militec, 50', 'Campinas', 'SP', 'Pedro Militar'),
    ('Levorin Pneus', '67.890.123/0001-45', 'atacado@levorin.com.br', '1140006006', 'Rod. Pneus km 20', 'Sorocaba', 'SP', 'Lucas Pneus'),
    ('Tecbril Quimica', '78.901.234/0001-56', 'vendas@tecbril.com.br', '1140007007', 'Av. Quimica, 400', 'Diadema', 'SP', 'Fernanda Quim'),
    ('NGK do Brasil', '89.012.345/0001-67', 'comercial@ngk.com.br', '1140008008', 'Rua Velas, 150', 'Mogi das Cruzes', 'SP', 'Roberto Velas'),
]

cursor.execute("SELECT COUNT(*) as c FROM fornecedores WHERE empresa_id = %s", (EMPRESA_ID,))
if cursor.fetchone()['c'] == 0:
    for f in fornecedores:
        cursor.execute("""
            INSERT INTO fornecedores (empresa_id, nome, cnpj, email, telefone, endereco, cidade, estado, contato, ativo, criado_em)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 1, NOW())
        """, (EMPRESA_ID, f[0], f[1], f[2], f[3], f[4], f[5], f[6], f[7]))
    print(f"  {len(fornecedores)} fornecedores inseridos")
else:
    print("  Fornecedores ja existem")

conn.commit()

# ============================================================
# 4. PEDIDOS E ITENS
# ============================================================
print("\n[4/7] Inserindo PEDIDOS...")

cursor.execute("SELECT id FROM clientes WHERE empresa_id = %s", (EMPRESA_ID,))
clientes_ids = [c['id'] for c in cursor.fetchall()]

cursor.execute("SELECT id, preco FROM produtos WHERE empresa_id = %s AND ativo = 1 LIMIT 50", (EMPRESA_ID,))
produtos_db = cursor.fetchall()

cursor.execute("SELECT COUNT(*) as c FROM pedidos WHERE empresa_id = %s", (EMPRESA_ID,))
if cursor.fetchone()['c'] == 0 and clientes_ids and produtos_db:
    status_opcoes = ['pendente', 'confirmado', 'em_separacao', 'enviado', 'entregue', 'cancelado']
    formas_pagamento = ['pix', 'cartao', 'boleto', 'dinheiro', 'a_prazo']

    pedidos_criados = 0
    for i in range(50):
        cliente_id = random.choice(clientes_ids)
        status = random.choice(status_opcoes)
        forma = random.choice(formas_pagamento)
        dias_atras = random.randint(0, 60)
        data_pedido = datetime.now() - timedelta(days=dias_atras)

        # Criar pedido
        cursor.execute("""
            INSERT INTO pedidos (empresa_id, cliente_id, data_pedido, status, forma_pagamento, subtotal, desconto, total, observacoes, origem, criado_em)
            VALUES (%s, %s, %s, %s, %s, 0, 0, 0, %s, 'sistema', %s)
        """, (EMPRESA_ID, cliente_id, data_pedido, status, forma, f'Pedido #{i+1}', data_pedido))

        pedido_id = cursor.lastrowid

        # Adicionar 1-5 itens ao pedido
        num_itens = random.randint(1, 5)
        total = 0
        for _ in range(num_itens):
            produto = random.choice(produtos_db)
            qtd = random.randint(1, 10)
            preco = float(produto['preco'] or 0)
            subtotal = preco * qtd
            total += subtotal

            cursor.execute("""
                INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario)
                VALUES (%s, %s, %s, %s)
            """, (pedido_id, produto['id'], qtd, preco))

        # Atualizar total do pedido
        desconto = round(total * random.uniform(0, 0.1), 2)
        cursor.execute("UPDATE pedidos SET subtotal = %s, desconto = %s, total = %s WHERE id = %s",
                      (total, desconto, total - desconto, pedido_id))
        pedidos_criados += 1

    print(f"  {pedidos_criados} pedidos inseridos com itens")
else:
    print("  Pedidos ja existem ou faltam dados")

conn.commit()

# ============================================================
# 5. ENTREGAS
# ============================================================
print("\n[5/7] Inserindo ENTREGAS...")

cursor.execute("SELECT id FROM entregadores WHERE empresa_id = %s", (EMPRESA_ID,))
entregadores_ids = [e['id'] for e in cursor.fetchall()]

cursor.execute("SELECT id, cliente_id FROM pedidos WHERE empresa_id = %s AND status IN ('confirmado', 'em_separacao', 'enviado', 'entregue')", (EMPRESA_ID,))
pedidos_para_entrega = cursor.fetchall()

cursor.execute("SELECT COUNT(*) as c FROM entregas WHERE empresa_id = %s", (EMPRESA_ID,))
if cursor.fetchone()['c'] == 0 and entregadores_ids and pedidos_para_entrega:
    status_entrega = ['pendente', 'em_rota', 'entregue', 'devolvida']

    for pedido in pedidos_para_entrega[:35]:
        entregador_id = random.choice(entregadores_ids)
        status = random.choice(status_entrega)
        dias_atras = random.randint(0, 30)
        data_entrega = datetime.now() - timedelta(days=dias_atras)

        cursor.execute("""
            INSERT INTO entregas (empresa_id, pedido_id, cliente_id, entregador_id, endereco_entrega, status, data_prevista, criado_em)
            VALUES (%s, %s, %s, %s, 'Endereco do cliente', %s, %s, NOW())
        """, (EMPRESA_ID, pedido['id'], pedido['cliente_id'], entregador_id, status, data_entrega))

    print(f"  {len(pedidos_para_entrega[:35])} entregas inseridas")
else:
    print("  Entregas ja existem")

conn.commit()

# ============================================================
# 6. AGENDAMENTOS
# ============================================================
print("\n[6/7] Inserindo AGENDAMENTOS...")

# Pegar clientes com nome e telefone
cursor.execute("SELECT id, nome, telefone FROM clientes WHERE empresa_id = %s", (EMPRESA_ID,))
clientes_info = cursor.fetchall()

cursor.execute("SELECT COUNT(*) as c FROM agendamentos WHERE empresa_id = %s", (EMPRESA_ID,))
if cursor.fetchone()['c'] == 0 and clientes_info:
    tipos_agendamento = ['visita', 'entrega', 'retirada', 'orcamento']
    status_agendamento = ['pendente', 'confirmado', 'realizado', 'cancelado']

    for i in range(25):
        cliente = random.choice(clientes_info)
        tipo = random.choice(tipos_agendamento)
        status = random.choice(status_agendamento)
        dias_futuro = random.randint(-10, 30)
        data_hora = datetime.now() + timedelta(days=dias_futuro, hours=random.randint(8, 17))

        cursor.execute("""
            INSERT INTO agendamentos (empresa_id, nome_cliente, telefone_cliente, data_agendamento, tipo, status, observacoes, criado_em)
            VALUES (%s, %s, %s, %s, %s, %s, %s, NOW())
        """, (EMPRESA_ID, cliente['nome'], cliente['telefone'], data_hora, tipo, status, f'Agendamento de {tipo}'))

    print(f"  25 agendamentos inseridos")
else:
    print("  Agendamentos ja existem")

conn.commit()

# ============================================================
# 7. ATUALIZAR EMPRESA
# ============================================================
print("\n[7/7] Atualizando dados da EMPRESA...")

cursor.execute("""
    UPDATE empresas SET
        nome = 'Comercial Mariano',
        nome_fantasia = 'Grupo Comercial Mariano - Lubrificantes e Filtros',
        nicho = 'atacado_varejo',
        telefone = '11 4002-8922',
        email = 'contato@comercialmariano.com.br',
        endereco = 'Av. Industrial, 1500',
        cidade = 'Sao Paulo',
        estado = 'SP',
        cep = '01234-567',
        bot_ativo = 1
    WHERE id = %s
""", (EMPRESA_ID,))

# Atualizar configuracoes do bot
cursor.execute("SELECT id FROM configuracoes_bot WHERE empresa_id = %s", (EMPRESA_ID,))
if not cursor.fetchone():
    cursor.execute("""
        INSERT INTO configuracoes_bot (empresa_id, horario_atendimento, mensagem_boas_vindas, mensagem_ausencia, descricao_empresa)
        VALUES (%s, '08:00 as 18:00',
                'Ola! Bem-vindo ao Comercial Mariano! Somos distribuidores de lubrificantes, filtros e produtos automotivos. Como posso ajudar?',
                'Nosso horario de atendimento e de segunda a sexta, das 8h as 18h. Deixe sua mensagem!',
                'Distribuidor de lubrificantes Ipiranga e Texaco, filtros Mann e Tecfil, aditivos Militec e muito mais.')
    """, (EMPRESA_ID,))
else:
    cursor.execute("""
        UPDATE configuracoes_bot SET
            horario_atendimento = '08:00 as 18:00',
            mensagem_boas_vindas = 'Ola! Bem-vindo ao Comercial Mariano! Somos distribuidores de lubrificantes, filtros e produtos automotivos. Como posso ajudar?',
            mensagem_ausencia = 'Nosso horario de atendimento e de segunda a sexta, das 8h as 18h. Deixe sua mensagem!',
            descricao_empresa = 'Distribuidor de lubrificantes Ipiranga e Texaco, filtros Mann e Tecfil, aditivos Militec e muito mais.'
        WHERE empresa_id = %s
    """, (EMPRESA_ID,))

print("  Empresa atualizada")

conn.commit()
cursor.close()
conn.close()

print("\n" + "="*60)
print("[OK] DADOS POPULADOS COM SUCESSO!")
print("="*60)
print("\nResumo:")
print("  - 20 clientes")
print("  - 5 entregadores (equipe)")
print("  - 8 fornecedores")
print("  - 50 pedidos com itens")
print("  - 35 entregas")
print("  - 25 agendamentos")
print("\nEmpresa: Comercial Mariano (ID 23)")
print("Login: mariano@comercial.com / Mariano@123")

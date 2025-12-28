"""
Criar tabelas de varejo no SQLite e popular com dados
"""
import sqlite3
from pathlib import Path
from datetime import datetime, timedelta
import random

DB_PATH = Path(__file__).parent / 'vendeai.db'
EMPRESA_ID = 23

print(f"Banco: {DB_PATH}")
conn = sqlite3.connect(str(DB_PATH))
cursor = conn.cursor()

# ============================================================
# CRIAR TABELAS
# ============================================================
print("\n[1/8] Criando tabelas...")

# Tabela CLIENTES
cursor.execute("""
CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empresa_id INTEGER,
    nome VARCHAR(200) NOT NULL,
    tipo VARCHAR(10) DEFAULT 'PJ',
    cpf_cnpj VARCHAR(20),
    email VARCHAR(200),
    telefone VARCHAR(20),
    celular VARCHAR(20),
    endereco VARCHAR(300),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),
    observacoes TEXT,
    origem VARCHAR(50) DEFAULT 'manual',
    ativo BOOLEAN DEFAULT 1,
    total_compras REAL DEFAULT 0,
    ultima_compra DATETIME,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME
)
""")
print("  [+] Tabela clientes criada")

# Tabela PEDIDOS
cursor.execute("""
CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empresa_id INTEGER,
    cliente_id INTEGER,
    data_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_entrega DATETIME,
    status VARCHAR(50) DEFAULT 'pendente',
    forma_pagamento VARCHAR(50),
    subtotal REAL DEFAULT 0,
    desconto REAL DEFAULT 0,
    total REAL DEFAULT 0,
    observacoes TEXT,
    origem VARCHAR(50) DEFAULT 'manual',
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
)
""")
print("  [+] Tabela pedidos criada")

# Tabela ITENS_PEDIDO
cursor.execute("""
CREATE TABLE IF NOT EXISTS itens_pedido (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pedido_id INTEGER,
    produto_id INTEGER,
    quantidade INTEGER DEFAULT 1,
    preco_unitario REAL,
    desconto REAL DEFAULT 0,
    subtotal REAL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
    FOREIGN KEY (produto_id) REFERENCES produtos(id)
)
""")
print("  [+] Tabela itens_pedido criada")

# Tabela ENTREGADORES
cursor.execute("""
CREATE TABLE IF NOT EXISTS entregadores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empresa_id INTEGER,
    nome VARCHAR(200) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(200),
    placa_veiculo VARCHAR(20),
    tipo_veiculo VARCHAR(50),
    disponivel BOOLEAN DEFAULT 1,
    ativo BOOLEAN DEFAULT 1,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
)
""")
print("  [+] Tabela entregadores criada")

# Tabela ENTREGAS
cursor.execute("""
CREATE TABLE IF NOT EXISTS entregas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empresa_id INTEGER,
    pedido_id INTEGER,
    cliente_id INTEGER,
    entregador_id INTEGER,
    endereco_entrega TEXT,
    status VARCHAR(50) DEFAULT 'pendente',
    data_prevista DATETIME,
    data_entrega DATETIME,
    observacoes TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (entregador_id) REFERENCES entregadores(id)
)
""")
print("  [+] Tabela entregas criada")

# Tabela FORNECEDORES
cursor.execute("""
CREATE TABLE IF NOT EXISTS fornecedores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empresa_id INTEGER,
    nome VARCHAR(200) NOT NULL,
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
print("  [+] Tabela fornecedores criada")

# Tabela AGENDAMENTOS
cursor.execute("""
CREATE TABLE IF NOT EXISTS agendamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empresa_id INTEGER,
    cliente_id INTEGER,
    nome_cliente VARCHAR(200),
    telefone_cliente VARCHAR(20),
    data_hora DATETIME,
    tipo VARCHAR(50),
    descricao TEXT,
    status VARCHAR(50) DEFAULT 'pendente',
    observacoes TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
)
""")
print("  [+] Tabela agendamentos criada")

conn.commit()

# ============================================================
# POPULAR CLIENTES
# ============================================================
print("\n[2/8] Inserindo CLIENTES...")

cursor.execute("SELECT COUNT(*) FROM clientes WHERE empresa_id = ?", (EMPRESA_ID,))
if cursor.fetchone()[0] == 0:
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

    for c in clientes:
        cursor.execute("""
            INSERT INTO clientes (empresa_id, nome, tipo, cpf_cnpj, email, telefone, celular, endereco, bairro, cidade, estado, ativo, criado_em)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'))
        """, (EMPRESA_ID, c[0], c[1], c[2], c[3], c[4], c[4], c[5], c[6], c[7], c[8]))
    print(f"  {len(clientes)} clientes inseridos")
else:
    print("  Clientes ja existem")

conn.commit()

# ============================================================
# POPULAR ENTREGADORES
# ============================================================
print("\n[3/8] Inserindo ENTREGADORES...")

cursor.execute("SELECT COUNT(*) FROM entregadores WHERE empresa_id = ?", (EMPRESA_ID,))
if cursor.fetchone()[0] == 0:
    entregadores = [
        ('Joao Silva', '11988001001', 'ABC-1234', 'Fiorino'),
        ('Pedro Santos', '11988002002', 'DEF-5678', 'Saveiro'),
        ('Carlos Oliveira', '11988003003', 'GHI-9012', 'Moto CG 160'),
        ('Lucas Ferreira', '11988004004', 'JKL-3456', 'Kombi'),
        ('Marcos Lima', '11988005005', 'MNO-7890', 'HR Hyundai'),
    ]

    for e in entregadores:
        cursor.execute("""
            INSERT INTO entregadores (empresa_id, nome, telefone, placa_veiculo, tipo_veiculo, disponivel, ativo, criado_em)
            VALUES (?, ?, ?, ?, ?, 1, 1, datetime('now'))
        """, (EMPRESA_ID, e[0], e[1], e[2], e[3]))
    print(f"  {len(entregadores)} entregadores inseridos")
else:
    print("  Entregadores ja existem")

conn.commit()

# ============================================================
# POPULAR FORNECEDORES
# ============================================================
print("\n[4/8] Inserindo FORNECEDORES...")

cursor.execute("SELECT COUNT(*) FROM fornecedores WHERE empresa_id = ?", (EMPRESA_ID,))
if cursor.fetchone()[0] == 0:
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

    for f in fornecedores:
        cursor.execute("""
            INSERT INTO fornecedores (empresa_id, nome, cnpj, email, telefone, endereco, cidade, estado, contato, ativo, criado_em)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'))
        """, (EMPRESA_ID, f[0], f[1], f[2], f[3], f[4], f[5], f[6], f[7]))
    print(f"  {len(fornecedores)} fornecedores inseridos")
else:
    print("  Fornecedores ja existem")

conn.commit()

# ============================================================
# POPULAR PEDIDOS
# ============================================================
print("\n[5/8] Inserindo PEDIDOS...")

cursor.execute("SELECT id FROM clientes WHERE empresa_id = ?", (EMPRESA_ID,))
clientes_ids = [c[0] for c in cursor.fetchall()]

cursor.execute("SELECT id, preco FROM produtos WHERE empresa_id = ? AND ativo = 1 LIMIT 50", (EMPRESA_ID,))
produtos_db = cursor.fetchall()

cursor.execute("SELECT COUNT(*) FROM pedidos WHERE empresa_id = ?", (EMPRESA_ID,))
if cursor.fetchone()[0] == 0 and clientes_ids and produtos_db:
    status_opcoes = ['pendente', 'confirmado', 'em_separacao', 'enviado', 'entregue', 'cancelado']
    formas_pagamento = ['pix', 'cartao', 'boleto', 'dinheiro', 'a_prazo']

    pedidos_criados = 0
    for i in range(50):
        cliente_id = random.choice(clientes_ids)
        status = random.choice(status_opcoes)
        forma = random.choice(formas_pagamento)
        dias_atras = random.randint(0, 60)
        data_pedido = datetime.now() - timedelta(days=dias_atras)

        cursor.execute("""
            INSERT INTO pedidos (empresa_id, cliente_id, data_pedido, status, forma_pagamento, subtotal, desconto, total, observacoes, origem, criado_em)
            VALUES (?, ?, ?, ?, ?, 0, 0, 0, ?, 'sistema', ?)
        """, (EMPRESA_ID, cliente_id, data_pedido.strftime('%Y-%m-%d %H:%M:%S'), status, forma, f'Pedido #{i+1}', data_pedido.strftime('%Y-%m-%d %H:%M:%S')))

        pedido_id = cursor.lastrowid

        # Adicionar itens
        num_itens = random.randint(1, 5)
        total = 0
        for _ in range(num_itens):
            produto = random.choice(produtos_db)
            qtd = random.randint(1, 10)
            preco = float(produto[1] or 0)
            subtotal = preco * qtd
            total += subtotal

            cursor.execute("""
                INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario, subtotal)
                VALUES (?, ?, ?, ?, ?)
            """, (pedido_id, produto[0], qtd, preco, subtotal))

        # Atualizar total
        desconto = round(total * random.uniform(0, 0.1), 2)
        cursor.execute("UPDATE pedidos SET subtotal = ?, desconto = ?, total = ? WHERE id = ?",
                      (total, desconto, total - desconto, pedido_id))
        pedidos_criados += 1

    print(f"  {pedidos_criados} pedidos inseridos com itens")
else:
    print("  Pedidos ja existem ou faltam dados")

conn.commit()

# ============================================================
# POPULAR ENTREGAS
# ============================================================
print("\n[6/8] Inserindo ENTREGAS...")

cursor.execute("SELECT id FROM entregadores WHERE empresa_id = ?", (EMPRESA_ID,))
entregadores_ids = [e[0] for e in cursor.fetchall()]

cursor.execute("SELECT id, cliente_id FROM pedidos WHERE empresa_id = ? AND status IN ('confirmado', 'em_separacao', 'enviado', 'entregue')", (EMPRESA_ID,))
pedidos_para_entrega = cursor.fetchall()

cursor.execute("SELECT COUNT(*) FROM entregas WHERE empresa_id = ?", (EMPRESA_ID,))
if cursor.fetchone()[0] == 0 and entregadores_ids and pedidos_para_entrega:
    status_entrega = ['pendente', 'em_rota', 'entregue', 'devolvida']

    for pedido in pedidos_para_entrega[:35]:
        entregador_id = random.choice(entregadores_ids)
        status = random.choice(status_entrega)
        dias_atras = random.randint(0, 30)
        data_entrega = datetime.now() - timedelta(days=dias_atras)

        cursor.execute("""
            INSERT INTO entregas (empresa_id, pedido_id, cliente_id, entregador_id, endereco_entrega, status, data_prevista, criado_em)
            VALUES (?, ?, ?, ?, 'Endereco do cliente', ?, ?, datetime('now'))
        """, (EMPRESA_ID, pedido[0], pedido[1], entregador_id, status, data_entrega.strftime('%Y-%m-%d %H:%M:%S')))

    print(f"  {len(pedidos_para_entrega[:35])} entregas inseridas")
else:
    print("  Entregas ja existem")

conn.commit()

# ============================================================
# POPULAR AGENDAMENTOS
# ============================================================
print("\n[7/8] Inserindo AGENDAMENTOS...")

cursor.execute("SELECT id, nome, telefone FROM clientes WHERE empresa_id = ?", (EMPRESA_ID,))
clientes_info = cursor.fetchall()

cursor.execute("SELECT COUNT(*) FROM agendamentos WHERE empresa_id = ?", (EMPRESA_ID,))
if cursor.fetchone()[0] == 0 and clientes_info:
    tipos = ['visita', 'entrega', 'retirada', 'orcamento']
    status_ag = ['pendente', 'confirmado', 'realizado', 'cancelado']

    for i in range(25):
        cliente = random.choice(clientes_info)
        tipo = random.choice(tipos)
        status = random.choice(status_ag)
        dias = random.randint(-10, 30)
        data_hora = datetime.now() + timedelta(days=dias, hours=random.randint(8, 17))

        cursor.execute("""
            INSERT INTO agendamentos (empresa_id, cliente_id, nome_cliente, telefone_cliente, data_hora, tipo, descricao, status, criado_em)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        """, (EMPRESA_ID, cliente[0], cliente[1], cliente[2], data_hora.strftime('%Y-%m-%d %H:%M:%S'), tipo, f'Agendamento de {tipo}', status))

    print("  25 agendamentos inseridos")
else:
    print("  Agendamentos ja existem")

conn.commit()

# ============================================================
# VERIFICAR DADOS
# ============================================================
print("\n[8/8] Verificando dados...")

tabelas_check = ['clientes', 'pedidos', 'itens_pedido', 'entregas', 'entregadores', 'fornecedores', 'agendamentos', 'produtos']
for tabela in tabelas_check:
    try:
        cursor.execute(f"SELECT COUNT(*) FROM {tabela} WHERE empresa_id = ?", (EMPRESA_ID,))
        count = cursor.fetchone()[0]
        print(f"  {tabela}: {count}")
    except:
        pass

conn.close()

print("\n" + "="*60)
print("[OK] SQLITE POPULADO COM SUCESSO!")
print("="*60)
print("\nLogin: mariano@comercial.com / Mariano@123")

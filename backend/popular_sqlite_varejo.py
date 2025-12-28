"""
Script para popular SQLite com dados de exemplo para Varejo
Empresa: Comercial Mariano (ID 23)
"""

import sqlite3
from pathlib import Path
from datetime import datetime, timedelta
import random

# Caminho do banco SQLite
DB_PATH = Path(__file__).parent.parent / 'database' / 'vendeai.db'
EMPRESA_ID = 23

print(f"Banco SQLite: {DB_PATH}")

conn = sqlite3.connect(str(DB_PATH))
cursor = conn.cursor()

# =====================================================
# PRODUTOS - Lubrificantes, Filtros, Aditivos
# =====================================================
print("\n[1/4] Inserindo produtos...")

produtos = [
    # Lubrificantes - Ipiranga
    ('Oleo Motor 5W30 Semisintetico 1L', 'Oleo de motor para veiculos leves', 'Lubrificantes', 'Oleos de Motor', 45.90, None, 100, 'IPR-5W30-1L', 'Ipiranga', 'oleo, motor, 5w30, sintetico'),
    ('Oleo Motor 10W40 1L', 'Oleo mineral para motores', 'Lubrificantes', 'Oleos de Motor', 38.90, 35.90, 150, 'IPR-10W40-1L', 'Ipiranga', 'oleo, motor, 10w40, mineral'),
    ('Oleo Motor 20W50 1L', 'Oleo mineral alta kilometragem', 'Lubrificantes', 'Oleos de Motor', 32.90, None, 200, 'IPR-20W50-1L', 'Ipiranga', 'oleo, motor, 20w50'),
    ('Fluido Freio DOT4 500ml', 'Fluido de freio sintetico', 'Lubrificantes', 'Fluidos', 28.90, None, 80, 'IPR-DOT4-500', 'Ipiranga', 'fluido, freio, dot4'),
    ('Graxa Multiuso 500g', 'Graxa para uso geral', 'Lubrificantes', 'Graxas', 28.50, None, 70, 'IPR-GRX500', 'Ipiranga', 'graxa, multiuso'),

    # Lubrificantes - Texaco
    ('Oleo Motor 15W40 Diesel 1L', 'Oleo para motores diesel', 'Lubrificantes', 'Oleos de Motor', 52.90, 48.90, 80, 'TEX-15W40-1L', 'Texaco', 'oleo, motor, 15w40, diesel'),
    ('Coolant Radiador 1L', 'Fluido de arrefecimento pronto uso', 'Lubrificantes', 'Coolants', 25.90, None, 120, 'TEX-COOL-1L', 'Texaco', 'coolant, radiador, arrefecimento'),
    ('ATF Dexron III 1L', 'Fluido transmissao automatica', 'Lubrificantes', 'Fluidos', 42.90, None, 60, 'TEX-ATF-1L', 'Texaco', 'atf, transmissao, automatica'),

    # Filtros - Mann
    ('Filtro de Oleo Mann W712/95', 'Filtro para VW/Audi 1.0-2.0', 'Filtros', 'Linha Leve', 38.50, None, 50, 'MANN-W712', 'Mann', 'filtro, oleo, vw, audi'),
    ('Filtro de Oleo Mann W719/30', 'Filtro para GM/Fiat', 'Filtros', 'Linha Leve', 35.90, None, 45, 'MANN-W719', 'Mann', 'filtro, oleo, gm, fiat'),
    ('Filtro de Ar Mann C22117', 'Filtro para Ford/VW', 'Filtros', 'Linha Leve', 52.90, None, 40, 'MANN-C22117', 'Mann', 'filtro, ar, ford, vw'),

    # Filtros - Tecfil
    ('Filtro de Ar Tecfil ARL5811', 'Filtro para Toyota Corolla/Hilux', 'Filtros', 'Linha Leve', 45.00, 42.00, 40, 'TEC-ARL5811', 'Tecfil', 'filtro, ar, toyota, corolla, hilux'),
    ('Filtro de Oleo Tecfil PSL141', 'Filtro para Honda/Hyundai', 'Filtros', 'Linha Leve', 32.90, None, 55, 'TEC-PSL141', 'Tecfil', 'filtro, oleo, honda, hyundai'),
    ('Filtro de Cabine Tecfil ACP006', 'Filtro ar condicionado GM', 'Filtros', 'Cabine', 48.90, None, 35, 'TEC-ACP006', 'Tecfil', 'filtro, cabine, ar condicionado, gm'),

    # Filtros - Fleetguard (Linha Pesada)
    ('Filtro Diesel Fleetguard FF5052', 'Filtro para caminhoes Volvo/Scania', 'Filtros', 'Linha Pesada', 89.90, None, 30, 'FG-FF5052', 'Fleetguard', 'filtro, diesel, volvo, scania, caminhao'),
    ('Filtro de Oleo Fleetguard LF3349', 'Filtro para Mercedes', 'Filtros', 'Linha Pesada', 78.90, None, 25, 'FG-LF3349', 'Fleetguard', 'filtro, oleo, mercedes, caminhao'),
    ('Separador de Agua Fleetguard FS1212', 'Separador diesel', 'Filtros', 'Linha Pesada', 125.90, None, 20, 'FG-FS1212', 'Fleetguard', 'separador, agua, diesel'),

    # Aditivos - Militec
    ('Militec-1 200ml', 'Condicionador de metais', 'Aditivos', 'Condicionadores', 89.00, None, 60, 'MIL-200ML', 'Militec', 'militec, condicionador, metais'),
    ('Militec-1 40ml', 'Condicionador de metais dose', 'Aditivos', 'Condicionadores', 32.00, None, 100, 'MIL-40ML', 'Militec', 'militec, condicionador'),

    # Limpeza Automotiva - Tecbril
    ('Limpador de Parabrisa 500ml', 'Limpador concentrado', 'Limpeza Automotiva', 'Parabrisa', 12.90, None, 120, 'TBR-LIMP500', 'Tecbril', 'limpador, parabrisa'),
    ('Silicone Liquido 100ml', 'Silicone para borrachas', 'Limpeza Automotiva', 'Silicones', 15.90, None, 90, 'TBR-SIL100', 'Tecbril', 'silicone, borracha'),
    ('Limpa Ar Condicionado', 'Higienizador de ar', 'Limpeza Automotiva', 'Higienizadores', 28.90, None, 50, 'TBR-LIMPAR', 'Tecbril', 'limpa, ar condicionado, higienizador'),

    # Camaras de Ar - Levorin
    ('Camara de Ar Aro 18', 'Camara para moto 90/90-18', 'Camaras de Ar', 'Moto', 35.00, None, 45, 'LEV-CAM18', 'Levorin', 'camara, ar, moto, aro 18'),
    ('Camara de Ar Aro 17', 'Camara para moto 110/80-17', 'Camaras de Ar', 'Moto', 32.00, None, 50, 'LEV-CAM17', 'Levorin', 'camara, ar, moto, aro 17'),
    ('Camara de Ar Aro 14', 'Camara para carro 175/65-14', 'Camaras de Ar', 'Carro', 42.00, None, 30, 'LEV-CAM14', 'Levorin', 'camara, ar, carro, aro 14'),
]

for prod in produtos:
    cursor.execute("""
        INSERT INTO produtos (empresa_id, nome, descricao, categoria, subcategoria, preco, preco_promocional, estoque, sku, marca, palavras_chave, disponivel, ativo, criado_em)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, datetime('now'))
    """, (EMPRESA_ID, prod[0], prod[1], prod[2], prod[3], prod[4], prod[5], prod[6], prod[7], prod[8], prod[9]))

print(f"  {len(produtos)} produtos inseridos")

# =====================================================
# LEADS - Clientes do varejo
# =====================================================
print("\n[2/4] Inserindo leads (clientes)...")

leads = [
    ('Auto Mecanica Silva', '11999001001', 'contato@mecsilva.com.br', 'QUENTE', 85, 'WhatsApp', 'Lubrificantes, Filtros'),
    ('Posto Ipiranga Centro', '11999002002', 'posto.centro@email.com', 'QUENTE', 90, 'Indicacao', 'Oleos, Aditivos'),
    ('Oficina do Joao', '11999003003', 'joao.oficina@gmail.com', 'MORNO', 70, 'WhatsApp', 'Filtros Mann'),
    ('Transportadora Rapido', '11999004004', 'compras@rapidotrans.com.br', 'QUENTE', 95, 'WhatsApp', 'Linha Pesada'),
    ('Retifica Motores SA', '11999005005', 'retifica@motores.com', 'MORNO', 65, 'Site', 'Lubrificantes'),
    ('Auto Pecas Dois Irmaos', '11999006006', 'compras@doisirmaos.com', 'QUENTE', 88, 'Indicacao', 'Todos'),
    ('Moto Center 21', '11999007007', 'motocenter@email.com', 'MORNO', 72, 'WhatsApp', 'Camaras, Oleos Moto'),
    ('Agro Tratores Ltda', '11999008008', 'agro@tratores.com.br', 'FRIO', 45, 'Site', 'Linha Agricola'),
    ('Frota Express', '11999009009', 'frota@express.com.br', 'QUENTE', 92, 'WhatsApp', 'Diesel, Filtros'),
    ('Lava Jato Premium', '11999010010', 'premium@lavajato.com', 'MORNO', 68, 'Instagram', 'Limpeza'),
    ('Borracharia 24h', '11999011011', 'borracharia24@gmail.com', 'FRIO', 40, 'WhatsApp', 'Camaras de Ar'),
    ('Auto Eletrica Estrela', '11999012012', 'estrela@autoeletrica.com', 'MORNO', 60, 'Site', 'Aditivos'),
    ('Garagem Tuning', '11999013013', 'tuning@garagem.com', 'FRIO', 35, 'Instagram', 'Oleos Sinteticos'),
    ('Taxi Cidade', '11999014014', 'frota@taxicidade.com.br', 'QUENTE', 85, 'Indicacao', 'Oleos, Filtros'),
    ('Onibus Urbano SA', '11999015015', 'manutencao@onibus.com', 'MORNO', 75, 'WhatsApp', 'Linha Pesada'),
]

for lead in leads:
    cursor.execute("""
        INSERT INTO leads (empresa_id, nome, telefone, email, status, temperatura, pontuacao, origem, interesse, criado_em, ultima_interacao)
        VALUES (?, ?, ?, ?, 'NOVO', ?, ?, ?, ?, datetime('now'), datetime('now', '-' || ? || ' hours'))
    """, (EMPRESA_ID, lead[0], lead[1], lead[2], lead[3], lead[4], lead[5], lead[6], random.randint(1, 72)))

print(f"  {len(leads)} leads inseridos")

# =====================================================
# CONVERSAS - Atendimentos via WhatsApp
# =====================================================
print("\n[3/4] Inserindo conversas...")

# Primeiro pegar os IDs dos leads inseridos
cursor.execute("SELECT id, nome, telefone FROM leads WHERE empresa_id = ?", (EMPRESA_ID,))
leads_db = cursor.fetchall()

conversas_data = []
for i, lead in enumerate(leads_db[:10]):
    cursor.execute("""
        INSERT INTO conversas (empresa_id, lead_id, telefone, nome_contato, ativa, bot_ativo, total_mensagens, mensagens_enviadas, mensagens_recebidas, iniciada_em, ultima_mensagem)
        VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, datetime('now', '-' || ? || ' days'), datetime('now', '-' || ? || ' hours'))
    """, (EMPRESA_ID, lead[0], lead[2], lead[1], i < 5, random.randint(5, 20), random.randint(3, 10), random.randint(2, 10), random.randint(1, 30), random.randint(0, 48)))
    conversas_data.append(cursor.lastrowid)

print(f"  {len(conversas_data)} conversas inseridas")

# =====================================================
# MENSAGENS - Historico de conversas
# =====================================================
print("\n[4/4] Inserindo mensagens...")

mensagens_exemplo = [
    ("recebida", "Oi, bom dia! Voces tem oleo 5w30?"),
    ("enviada", "Bom dia! Sim, temos o Oleo Motor 5W30 Semisintetico Ipiranga por R$ 45,90. Gostaria de encomendar?"),
    ("recebida", "Quanto sai meia duzia?"),
    ("enviada", "Meia duzia (6 unidades) sai R$ 275,40. Fazemos entrega gratis para compras acima de R$ 200!"),
    ("recebida", "Fecha! Pode mandar"),
    ("enviada", "Perfeito! Pedido registrado. Previsao de entrega: amanha ate as 14h. Obrigado pela preferencia!"),
]

# Verificar estrutura da tabela mensagens
cursor.execute("PRAGMA table_info(mensagens)")
cols = [col[1] for col in cursor.fetchall()]
print(f"  Colunas mensagens: {cols}")

msg_count = 0
for conv_id in conversas_data[:8]:
    for i, msg in enumerate(mensagens_exemplo):
        is_bot = 1 if msg[0] == 'enviada' else 0
        cursor.execute("""
            INSERT INTO mensagens (conversa_id, tipo, conteudo, enviada_em, lida, enviada_por_bot)
            VALUES (?, ?, ?, datetime('now', '-' || ? || ' hours'), 1, ?)
        """, (conv_id, msg[0], msg[1], random.randint(1, 48), is_bot))
        msg_count += 1

print(f"  {msg_count} mensagens inseridas")

conn.commit()
conn.close()

print("\n" + "="*50)
print("[OK] Dados populados com sucesso no SQLite!")
print("="*50)
print(f"\nResumo:")
print(f"  - {len(produtos)} produtos")
print(f"  - {len(leads)} leads/clientes")
print(f"  - {len(conversas_data)} conversas")
print(f"  - {msg_count} mensagens")
print(f"\nEmpresa: Comercial Mariano (ID {EMPRESA_ID})")
print(f"Login: viaaaactor@gmail.com / mariano123")

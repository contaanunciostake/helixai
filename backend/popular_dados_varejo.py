"""
Script para popular o banco de dados com dados de exemplo para o nicho Varejo/Atacado
Empresa: Comercial Mariano (ID: 23)
"""

import os
import sys
from datetime import datetime, timedelta
import random

# Adicionar pasta raiz ao path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Configurar para usar MySQL
os.environ['DATABASE_URL'] = 'mysql+pymysql://root:@localhost:3306/helixai_db'

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Criar conexao com o banco
engine = create_engine(os.environ['DATABASE_URL'])
Session = sessionmaker(bind=engine)
session = Session()

# ID da empresa Comercial Mariano
EMPRESA_ID = 23

print("=" * 60)
print("POPULANDO BANCO DE DADOS - COMERCIAL MARIANO (VAREJO)")
print("=" * 60)

# ==================== CLIENTES ====================
print("\n[1/6] Inserindo CLIENTES...")

clientes_data = [
    # (nome, telefone, celular, email, cpf_cnpj, endereco, cidade, estado, cep, origem, observacoes)
    ("Auto Mecanica Sao Jorge", "1134567890", "11987654321", "sanjorge@email.com", "12.345.678/0001-90", "Rua das Oficinas, 123 - Centro", "Sao Paulo", "SP", "01310-100", "whatsapp", "Cliente frequente, compra lubrificantes toda semana"),
    ("Mecanica do Ze", "1134568901", "11912345678", "mecanicadoze@gmail.com", "98.765.432/0001-10", "Av. Brasil, 456 - Ipiranga", "Sao Paulo", "SP", "04262-000", "indicacao", "Especializado em caminhoes"),
    ("Auto Center Premium", "1134569012", "11955556666", "premium@autocenter.com", "11.222.333/0001-44", "Rua Augusta, 1500 - Consolacao", "Sao Paulo", "SP", "01304-001", "site", "Grande volume de compras"),
    ("Oficina Dois Irmaos", "1134560123", "11944443333", "doisirmaos@oficina.com", "44.555.666/0001-77", "Rua da Mooca, 789 - Mooca", "Sao Paulo", "SP", "03104-000", "whatsapp", "Compra filtros regularmente"),
    ("Retifica Central", "1134561234", "11933332222", "contato@retificacentral.com.br", "55.666.777/0001-88", "Av. Cruzeiro do Sul, 2000 - Santana", "Sao Paulo", "SP", "02031-000", "whatsapp", "Especialista em retifica de motores"),
    ("Posto Ipiranga Centro", "1134562345", "11922221111", "posto.centro@ipiranga.com", "22.333.444/0001-55", "Av. Paulista, 1000 - Bela Vista", "Sao Paulo", "SP", "01310-100", "parceria", "Compra oleo a granel"),
    ("Auto Posto Estrela", "1134563456", "11911110000", "estrela@autoposto.com", "33.444.555/0001-66", "Rua Vergueiro, 3500 - Vila Mariana", "Sao Paulo", "SP", "04101-000", "indicacao", "Troca de oleo no local"),
    ("Chevrolet Motors SP", "1134564567", "11900009999", "compras@chevroletsp.com", "66.777.888/0001-99", "Av. dos Bandeirantes, 5000 - Santo Amaro", "Sao Paulo", "SP", "04556-000", "site", "Compras de grande volume"),
    ("Toyota Center", "1134565678", "11988889999", "pecas@toyotacenter.com.br", "77.888.999/0001-00", "Marginal Pinheiros, 8000 - Pinheiros", "Sao Paulo", "SP", "05428-000", "site", "Filtros e oleos Toyota"),
    ("Transportadora Veloz", "1134566789", "11977778888", "manutencao@veloz.com.br", "88.999.000/0001-11", "Rod. Anhanguera, km 25 - Perus", "Sao Paulo", "SP", "05252-000", "whatsapp", "Frota de 50 caminhoes"),
    ("Log Express Transportes", "1934567890", "11966667777", "frota@logexpress.com", "99.000.111/0001-22", "Rod. Presidente Dutra, km 180", "Guarulhos", "SP", "07034-000", "indicacao", "Manutencao preventiva mensal"),
    ("Carlos Silva - Mecanico", "1134568901", "11955554444", "carlao.mecanico@gmail.com", "123.456.789-00", "Rua das Flores, 100 - Penha", "Sao Paulo", "SP", "03604-000", "whatsapp", "Mecanico autonomo, cliente fiel"),
    ("Jose Pereira", "1134569012", "11944445555", "zepecas@hotmail.com", "987.654.321-00", "Av. Sapopemba, 2500", "Sao Paulo", "SP", "03310-000", "whatsapp", "Especialista em motos"),
    ("Anderson Souza", "1134560123", "11933336666", "anderson.mecanico@outlook.com", "456.789.123-00", "Rua do Gasometro, 800 - Bras", "Sao Paulo", "SP", "03004-000", "indicacao", ""),
    ("Pedro Oliveira", "1134561234", "11922227777", "pedro.oficina@gmail.com", "789.123.456-00", "Rua Conselheiro Crispiniano, 250", "Sao Paulo", "SP", "01037-001", "site", "Trabalha com carros importados"),
    ("Agropecuaria Vale Verde", "1934562345", "19988887777", "compras@valeverde.agro.br", "10.111.222/0001-33", "Rod. SP-304, km 45", "Piracicaba", "SP", "13400-000", "whatsapp", "Compra oleo para tratores"),
    ("Fazenda Santa Maria", "1634563456", "16977776666", "manutencao@fsm.com.br", "20.222.333/0001-44", "Estrada Rural, s/n", "Ribeirao Preto", "SP", "14020-000", "whatsapp", "Maquinas pesadas John Deere"),
    ("Correios - Base SP", "1134564567", "11965554444", "frota.sp@correios.com.br", "34.028.316/0001-03", "Rua Mergenthaler, 500 - Vila Leopoldina", "Sao Paulo", "SP", "05311-030", "licitacao", "Frota de vans e motos"),
    ("Uber do Brasil", "1134565678", "11954443333", "frota@uber.com", "17.895.646/0001-87", "Av. Faria Lima, 4000 - Itaim Bibi", "Sao Paulo", "SP", "04538-132", "parceria", "Programa de manutencao para motoristas"),
    ("iFood Delivery", "1134566789", "11943332222", "suprimentos@ifood.com.br", "14.380.200/0001-21", "Av. dos Autonomistas, 1500 - Osasco", "Osasco", "SP", "06090-020", "parceria", "Manutencao de motos delivery"),
]

clientes_inseridos = 0
for c in clientes_data:
    try:
        query = text("""
            INSERT INTO clientes (empresa_id, nome, telefone, celular, email, cpf_cnpj, endereco, cidade, estado, cep, origem, observacoes, ativo, criado_em, atualizado_em)
            VALUES (:empresa_id, :nome, :telefone, :celular, :email, :cpf_cnpj, :endereco, :cidade, :estado, :cep, :origem, :observacoes, 1, NOW(), NOW())
        """)
        session.execute(query, {
            "empresa_id": EMPRESA_ID, "nome": c[0], "telefone": c[1], "celular": c[2], "email": c[3],
            "cpf_cnpj": c[4], "endereco": c[5], "cidade": c[6], "estado": c[7], "cep": c[8],
            "origem": c[9], "observacoes": c[10]
        })
        clientes_inseridos += 1
    except Exception as e:
        print(f"   Erro ao inserir cliente {c[0]}: {e}")

session.commit()
print(f"   [OK] {clientes_inseridos} clientes inseridos")

# ==================== ENTREGADORES ====================
print("\n[2/6] Inserindo ENTREGADORES...")

entregadores_data = [
    ("Joao da Silva", "11998887766", "11998887766", "joao.entrega@gmail.com", "123.456.789-00", "moto", "ABC-1234", True),
    ("Carlos Oliveira", "11997776655", "11997776655", "carlos.delivery@gmail.com", "234.567.890-11", "carro", "DEF-5678", True),
    ("Fernando Santos", "11996665544", "11996665544", "fernando.entrega@outlook.com", "345.678.901-22", "van", "GHI-9012", True),
    ("Ricardo Souza", "11995554433", "11995554433", "ricardo.moto@gmail.com", "456.789.012-33", "moto", "JKL-3456", True),
    ("Marcos Pereira", "11994443322", "11994443322", "marcos.caminhao@hotmail.com", "567.890.123-44", "caminhao", "MNO-7890", False),
]

entregadores_inseridos = 0
for e in entregadores_data:
    try:
        query = text("""
            INSERT INTO entregadores (empresa_id, nome, telefone, whatsapp, email, documento, tipo_veiculo, placa_veiculo, disponivel, ativo, criado_em)
            VALUES (:empresa_id, :nome, :telefone, :whatsapp, :email, :documento, :tipo_veiculo, :placa_veiculo, :disponivel, 1, NOW())
        """)
        session.execute(query, {
            "empresa_id": EMPRESA_ID, "nome": e[0], "telefone": e[1], "whatsapp": e[2], "email": e[3],
            "documento": e[4], "tipo_veiculo": e[5], "placa_veiculo": e[6], "disponivel": e[7]
        })
        entregadores_inseridos += 1
    except Exception as e_err:
        print(f"   Erro ao inserir entregador {e[0]}: {e_err}")

session.commit()
print(f"   [OK] {entregadores_inseridos} entregadores inseridos")

# Obter IDs dos clientes e entregadores inseridos
clientes_ids = session.execute(text("SELECT id FROM clientes WHERE empresa_id = :emp"), {"emp": EMPRESA_ID}).fetchall()
clientes_ids = [c[0] for c in clientes_ids]

entregadores_ids = session.execute(text("SELECT id FROM entregadores WHERE empresa_id = :emp"), {"emp": EMPRESA_ID}).fetchall()
entregadores_ids = [e[0] for e in entregadores_ids]

produtos_result = session.execute(text("SELECT id, nome, preco FROM produtos WHERE empresa_id = :emp"), {"emp": EMPRESA_ID}).fetchall()

# ==================== PEDIDOS E ITENS ====================
print("\n[3/6] Inserindo PEDIDOS e ITENS...")

status_pedido = ['pendente', 'confirmado', 'em_separacao', 'enviado', 'entregue', 'cancelado']
formas_pagamento = ['pix', 'boleto', 'cartao', 'dinheiro', 'prazo']

pedidos_inseridos = 0
itens_inseridos = 0

if clientes_ids and produtos_result:
    # Gerar 50 pedidos
    for i in range(50):
        cliente_id = random.choice(clientes_ids)
        status = random.choice(status_pedido)
        forma_pag = random.choice(formas_pagamento)
        desconto = random.choice([0, 0, 0, 5, 10, 15])

        # Data do pedido (ultimos 60 dias)
        dias_atras = random.randint(0, 60)
        data_pedido = datetime.now() - timedelta(days=dias_atras)

        total_pedido = 0.0

        try:
            # Inserir pedido
            query = text("""
                INSERT INTO pedidos (empresa_id, cliente_id, status, forma_pagamento, desconto, total, subtotal, observacoes, data_pedido, origem, criado_em, atualizado_em)
                VALUES (:empresa_id, :cliente_id, :status, :forma_pagamento, :desconto, :total, :subtotal, :observacoes, :data_pedido, :origem, :criado_em, :criado_em)
            """)
            observacoes = random.choice([
                "", "", "", "Entregar no periodo da tarde", "Cliente solicita nota fiscal",
                "Ligar antes de entregar", "Deixar na portaria", "Pedido urgente"
            ])
            origem = random.choice(['manual', 'whatsapp', 'site'])
            session.execute(query, {
                "empresa_id": EMPRESA_ID, "cliente_id": cliente_id, "status": status,
                "forma_pagamento": forma_pag, "desconto": desconto, "total": 0, "subtotal": 0,
                "observacoes": observacoes, "data_pedido": data_pedido, "origem": origem, "criado_em": data_pedido
            })

            # Obter ID do pedido inserido
            pedido_id = session.execute(text("SELECT LAST_INSERT_ID()")).fetchone()[0]
            pedidos_inseridos += 1

            # Inserir 1 a 5 itens no pedido
            num_itens = random.randint(1, 5)
            produtos_pedido = random.sample(list(produtos_result), min(num_itens, len(produtos_result)))

            for prod in produtos_pedido:
                prod_id, prod_nome, prod_preco = prod
                quantidade = random.randint(1, 10)
                preco_unit = float(prod_preco) if prod_preco else random.uniform(20, 200)

                query_item = text("""
                    INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario)
                    VALUES (:pedido_id, :produto_id, :quantidade, :preco_unitario)
                """)
                session.execute(query_item, {
                    "pedido_id": pedido_id, "produto_id": prod_id,
                    "quantidade": quantidade, "preco_unitario": preco_unit
                })
                total_pedido += quantidade * preco_unit
                itens_inseridos += 1

            # Atualizar total do pedido com desconto
            total_final = total_pedido * (1 - desconto/100)
            session.execute(text("UPDATE pedidos SET total = :total, subtotal = :subtotal WHERE id = :id"),
                           {"total": total_final, "subtotal": total_pedido, "id": pedido_id})

        except Exception as e:
            print(f"   Erro ao inserir pedido: {e}")

    session.commit()
    print(f"   [OK] {pedidos_inseridos} pedidos inseridos")
    print(f"   [OK] {itens_inseridos} itens de pedido inseridos")
else:
    print("   [!] Sem clientes ou produtos para criar pedidos")

# ==================== ENTREGAS ====================
print("\n[4/6] Inserindo ENTREGAS...")

status_entrega = ['pendente', 'aguardando_coleta', 'em_transito', 'entregue', 'cancelada']
prioridades = ['normal', 'normal', 'normal', 'urgente', 'agendada']
origens_entrega = ['manual', 'bot_whatsapp', 'bot_whatsapp', 'site']

entregas_inseridas = 0

# Obter pedidos para associar entregas
pedidos = session.execute(text("""
    SELECT p.id, p.total, c.nome, c.telefone, c.endereco, c.cidade, c.estado, c.cep
    FROM pedidos p
    JOIN clientes c ON p.cliente_id = c.id
    WHERE p.empresa_id = :emp AND p.status IN ('confirmado', 'em_separacao', 'enviado', 'entregue')
    LIMIT 35
"""), {"emp": EMPRESA_ID}).fetchall()

for ped in pedidos:
    status = random.choice(status_entrega)
    prioridade = random.choice(prioridades)
    origem = random.choice(origens_entrega)
    entregador_id = random.choice(entregadores_ids) if entregadores_ids and random.random() > 0.3 else None

    dias_atras = random.randint(0, 30)
    data_criacao = datetime.now() - timedelta(days=dias_atras)

    # Se entregue, definir data de entrega
    data_entrega = None
    data_saida = None
    if status == 'entregue':
        data_saida = data_criacao + timedelta(hours=random.randint(1, 4))
        data_entrega = data_saida + timedelta(hours=random.randint(1, 6))
    elif status == 'em_transito':
        data_saida = data_criacao + timedelta(hours=random.randint(1, 4))

    try:
        query = text("""
            INSERT INTO entregas (empresa_id, pedido_id, cliente_nome, cliente_telefone, cliente_whatsapp,
                endereco, cidade, estado, cep, descricao_itens, valor_pedido, valor_frete,
                forma_pagamento, entregador_id, status, prioridade, origem, data_criacao, data_saida,
                data_entrega, observacoes)
            VALUES (:empresa_id, :pedido_id, :cliente_nome, :cliente_telefone, :cliente_whatsapp,
                :endereco, :cidade, :estado, :cep, :descricao_itens, :valor_pedido, :valor_frete,
                :forma_pagamento, :entregador_id, :status, :prioridade, :origem, :data_criacao, :data_saida,
                :data_entrega, :observacoes)
        """)

        valor_frete = random.choice([0, 0, 15, 20, 25, 30, 40])

        session.execute(query, {
            "empresa_id": EMPRESA_ID, "pedido_id": ped[0], "cliente_nome": ped[2],
            "cliente_telefone": ped[3], "cliente_whatsapp": ped[3],
            "endereco": ped[4], "cidade": ped[5], "estado": ped[6], "cep": ped[7],
            "descricao_itens": "Produtos automotivos", "valor_pedido": float(ped[1]) if ped[1] else 0,
            "valor_frete": valor_frete, "forma_pagamento": random.choice(['pago', 'pix', 'dinheiro']),
            "entregador_id": entregador_id, "status": status, "prioridade": prioridade,
            "origem": origem, "data_criacao": data_criacao, "data_saida": data_saida,
            "data_entrega": data_entrega, "observacoes": ""
        })
        entregas_inseridas += 1
    except Exception as e:
        print(f"   Erro ao inserir entrega: {e}")

session.commit()
print(f"   [OK] {entregas_inseridas} entregas inseridas")

# ==================== LEADS ====================
print("\n[5/6] Inserindo LEADS...")

leads_data = [
    ("Ricardo Mendes", "11989876543", "quente", "novo", "Interessado em lubrificantes para frota"),
    ("Fabiana Costa", "11978765432", "quente", "qualificado", "Pediu orcamento de filtros"),
    ("Bruno Almeida", "11967654321", "morno", "contato_inicial", "Perguntou sobre precos"),
    ("Carla Rodrigues", "11956543210", "frio", "novo", "Apenas visualizou"),
    ("Diego Ferreira", "11945432109", "quente", "proposta", "Negociando grande pedido"),
    ("Eduardo Lima", "11934321098", "morno", "qualificado", "Oficina em Guarulhos"),
    ("Fernanda Santos", "11923210987", "quente", "negociacao", "Fechando contrato mensal"),
    ("Gabriel Martins", "11912109876", "frio", "contato_inicial", "Sem resposta ha 5 dias"),
    ("Helena Souza", "11901098765", "morno", "novo", "Indicacao do Carlos"),
    ("Igor Pereira", "11890987654", "quente", "ganho", "Fechou pedido ontem"),
    ("Julia Oliveira", "11889876543", "frio", "perdido", "Foi para concorrente"),
    ("Kevin Costa", "11878765432", "morno", "qualificado", "Aguardando retorno"),
    ("Larissa Alves", "11867654321", "quente", "proposta", "Interessada em parceria"),
    ("Marcos Nunes", "11856543210", "morno", "contato_inicial", "Conheceu pelo Instagram"),
    ("Natalia Rocha", "11845432109", "quente", "negociacao", "Quer exclusividade de marca"),
]

leads_inseridos = 0
for lead in leads_data:
    try:
        dias_atras = random.randint(0, 45)
        data_criacao = datetime.now() - timedelta(days=dias_atras)

        query = text("""
            INSERT INTO leads (empresa_id, nome, telefone, temperatura, status, observacoes, origem, criado_em, ultima_interacao)
            VALUES (:empresa_id, :nome, :telefone, :temperatura, :status, :observacoes, :origem, :criado_em, :criado_em)
        """)
        session.execute(query, {
            "empresa_id": EMPRESA_ID, "nome": lead[0], "telefone": lead[1],
            "temperatura": lead[2], "status": lead[3], "observacoes": lead[4],
            "origem": random.choice(['whatsapp', 'site', 'indicacao', 'instagram']),
            "criado_em": data_criacao
        })
        leads_inseridos += 1
    except Exception as e:
        print(f"   Erro ao inserir lead {lead[0]}: {e}")

session.commit()
print(f"   [OK] {leads_inseridos} leads inseridos")

# ==================== CONVERSAS ====================
print("\n[6/6] Inserindo CONVERSAS e MENSAGENS...")

# Obter leads para criar conversas
leads = session.execute(text("SELECT id, telefone, nome FROM leads WHERE empresa_id = :emp LIMIT 10"), {"emp": EMPRESA_ID}).fetchall()

conversas_inseridas = 0
mensagens_inseridas = 0

for lead in leads:
    lead_id, telefone, nome = lead
    dias_atras = random.randint(0, 20)
    inicio_conversa = datetime.now() - timedelta(days=dias_atras)

    try:
        # Inserir conversa
        query = text("""
            INSERT INTO conversas (empresa_id, lead_id, telefone, nome_contato, ativa, bot_ativo)
            VALUES (:empresa_id, :lead_id, :telefone, :nome_contato, 1, 1)
        """)
        session.execute(query, {
            "empresa_id": EMPRESA_ID, "lead_id": lead_id, "telefone": telefone,
            "nome_contato": nome
        })

        conversa_id = session.execute(text("SELECT LAST_INSERT_ID()")).fetchone()[0]
        conversas_inseridas += 1

        # Inserir algumas mensagens na conversa
        mensagens_exemplo = [
            ("Ola, boa tarde!", False),
            ("Oi! Aqui e a AIra da Comercial Mariano. Como posso ajudar?", True),
            ("Voces tem oleo 5w30?", False),
            ("Sim! Temos oleos 5W30 de varias marcas: Ipiranga, Texaco e Mann. Qual voce prefere?", True),
            ("Qual o preco do Ipiranga?", False),
            ("O Ipiranga 5W30 1L esta R$ 45,90. Temos tambem galao de 4L por R$ 165,00. Quer que eu separe?", True),
            ("Pode separar 2 galoes de 4L", False),
            ("Perfeito! Separei 2 galoes de Oleo 5W30 Ipiranga 4L. Total: R$ 330,00. Como prefere receber: retirar na loja ou delivery?", True),
        ]

        num_msgs = random.randint(4, len(mensagens_exemplo))
        msgs_selecionadas = mensagens_exemplo[:num_msgs]

        for idx, (conteudo, por_bot) in enumerate(msgs_selecionadas):
            tempo_msg = inicio_conversa + timedelta(minutes=idx * random.randint(1, 5))

            query_msg = text("""
                INSERT INTO mensagens (conversa_id, tipo, conteudo, enviada_por_bot, enviada_em, lida)
                VALUES (:conversa_id, 'texto', :conteudo, :enviada_por_bot, :enviada_em, 1)
            """)
            session.execute(query_msg, {
                "conversa_id": conversa_id, "conteudo": conteudo,
                "enviada_por_bot": por_bot, "enviada_em": tempo_msg
            })
            mensagens_inseridas += 1

    except Exception as e:
        print(f"   Erro ao inserir conversa: {e}")

session.commit()
print(f"   [OK] {conversas_inseridas} conversas inseridas")
print(f"   [OK] {mensagens_inseridas} mensagens inseridas")

# ==================== RESUMO FINAL ====================
print("\n" + "=" * 60)
print("RESUMO DA POPULACAO DO BANCO DE DADOS")
print("=" * 60)
print(f"""
Empresa: Comercial Mariano (ID: {EMPRESA_ID})

[OK] Clientes: {clientes_inseridos}
[OK] Entregadores: {entregadores_inseridos}
[OK] Pedidos: {pedidos_inseridos}
[OK] Itens de Pedido: {itens_inseridos}
[OK] Entregas: {entregas_inseridas}
[OK] Leads: {leads_inseridos}
[OK] Conversas: {conversas_inseridas}
[OK] Mensagens: {mensagens_inseridas}

Login: viaaaactor@gmail.com
Senha: mariano123
""")

session.close()
print("Banco de dados populado com sucesso!")

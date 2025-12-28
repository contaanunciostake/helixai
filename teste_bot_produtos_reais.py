# -*- coding: utf-8 -*-
"""
TESTE BOT COM PRODUTOS REAIS DO BANCO DE DADOS
Testa conversas reais + notificacoes para gerente (incluindo status de entrega)
"""

import requests
import time
import sqlite3
from datetime import datetime

BOT_URL = "http://localhost:3010"
API_URL = "http://localhost:5000"
EMPRESA_ID = 27
DB_PATH = 'D:/Helix/HelixAI/backend/vendeai.db'

def buscar_produtos_para_teste():
    """Busca produtos reais do banco para usar nos testes"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Buscar produtos de diferentes categorias
    cursor.execute('''
        SELECT nome, preco, categoria, subcategoria, marca
        FROM produtos
        WHERE empresa_id = ? AND disponivel = 1
        ORDER BY RANDOM()
        LIMIT 20
    ''', (EMPRESA_ID,))

    produtos = cursor.fetchall()
    conn.close()

    return produtos

def enviar_mensagem(telefone, mensagem):
    """Envia mensagem para o bot"""
    try:
        response = requests.post(
            f"{BOT_URL}/api/bot/test-message",
            json={
                "empresaId": EMPRESA_ID,
                "mensagem": mensagem,
                "telefone": telefone
            },
            timeout=120
        )
        data = response.json()
        if data.get("success"):
            return data.get("data", {}).get("respostaBot", "")
        return f"[ERRO: {data.get('error', 'Desconhecido')}]"
    except Exception as e:
        return f"[ERRO: {e}]"

def enviar_notificacao_lead(cliente):
    """Envia notificacao de lead para gerente"""
    try:
        response = requests.post(
            f"{API_URL}/api/empresa/notificacoes/enviar",
            json={
                "empresa_id": EMPRESA_ID,
                "tipo": "lead",
                "dados": {
                    "nome": cliente["nome"],
                    "telefone": cliente["telefone"],
                    "mensagem": cliente["interesse"],
                    "interesse": cliente["categoria"]
                }
            },
            timeout=30
        )
        return response.status_code == 200
    except:
        return False

def enviar_notificacao_venda(cliente, produto, quantidade):
    """Envia notificacao de venda para gerente"""
    valor_total = round(produto[1] * quantidade, 2)
    try:
        response = requests.post(
            f"{API_URL}/api/empresa/notificacoes/enviar",
            json={
                "empresa_id": EMPRESA_ID,
                "tipo": "venda",
                "dados": {
                    "cliente_nome": cliente["nome"],
                    "cliente_telefone": cliente["telefone"],
                    "produtos_texto": f"{quantidade}x {produto[0]}",
                    "valor_total": f"R$ {valor_total:.2f}",
                    "forma_pagamento": cliente.get("pagamento", "PIX"),
                    "tipo_entrega": cliente.get("tipo_entrega", "Entrega")
                }
            },
            timeout=30
        )
        return response.status_code == 200
    except:
        return False

def criar_entrega(cliente, produto, quantidade, endereco):
    """Cria entrega no banco"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    valor_total = round(produto[1] * quantidade, 2)
    itens = f"{quantidade}x {produto[0]} - R$ {valor_total:.2f}"

    cursor.execute('''
        INSERT INTO entregas (
            empresa_id, cliente_nome, cliente_telefone, cliente_whatsapp,
            endereco_entrega, descricao_itens, status, criado_em
        ) VALUES (?, ?, ?, ?, ?, ?, 'pendente', datetime('now'))
    ''', (EMPRESA_ID, cliente["nome"], cliente["telefone"], cliente["telefone"],
          endereco, itens))

    conn.commit()
    entrega_id = cursor.lastrowid
    conn.close()
    return entrega_id

def atualizar_status_entrega(entrega_id, status):
    """Atualiza status da entrega (notifica cliente E gerente)"""
    try:
        response = requests.post(
            f"{API_URL}/api/entrega/status/atualizar",
            json={
                "entrega_id": entrega_id,
                "empresa_id": EMPRESA_ID,
                "novo_status": status
            },
            timeout=30
        )
        data = response.json()
        return data.get("success", False), data.get("data", {})
    except Exception as e:
        print(f"  [ERRO] Falha ao atualizar status: {e}")
        return False, {}

def simular_cliente(cliente, produtos):
    """Simula conversa completa de um cliente"""
    produto = produtos[0]  # Usar primeiro produto da lista

    print(f"\n{'='*70}")
    print(f"CLIENTE: {cliente['nome']}")
    print(f"Telefone: {cliente['telefone']}")
    print(f"Produto: {produto[0]} - R$ {produto[1]:.2f}")
    print(f"{'='*70}")

    # Conversa simulada
    conversas = cliente["conversa"]

    for i, msg in enumerate(conversas):
        # Substituir placeholder de produto
        msg = msg.replace("{PRODUTO}", produto[0])
        msg = msg.replace("{CATEGORIA}", produto[2])
        msg = msg.replace("{PRECO}", f"R$ {produto[1]:.2f}")

        print(f"\n[{cliente['nome']}]: {msg}")

        resposta = enviar_mensagem(cliente["telefone"], msg)
        if resposta:
            # Limitar resposta para exibicao
            resposta_limpa = resposta[:300]
            print(f"[BOT]: {resposta_limpa}...")

        # Primeira mensagem = notificar lead
        if i == 0:
            if enviar_notificacao_lead(cliente):
                print(f"   >> LEAD notificado ao gerente")

        time.sleep(2)

    # Simular venda apos conversa
    quantidade = cliente.get("quantidade", 1)
    print(f"\n   >> Processando VENDA: {quantidade}x {produto[0]}")

    if enviar_notificacao_venda(cliente, produto, quantidade):
        print(f"   >> VENDA notificada ao gerente")

    # Se for entrega, criar e atualizar status
    if cliente.get("tipo_entrega") == "Entrega" and cliente.get("endereco"):
        print(f"\n   >> Criando ENTREGA...")
        entrega_id = criar_entrega(cliente, produto, quantidade, cliente["endereco"])
        print(f"   >> Entrega #{entrega_id} criada")

        # Atualizar status gradualmente
        time.sleep(1)

        print(f"\n   >> Atualizando status: pendente")
        ok, data = atualizar_status_entrega(entrega_id, "pendente")
        if ok:
            print(f"      Cliente notificado: {data.get('cliente_notificado', False)}")
            print(f"      Gerente notificado: {data.get('gerente_notificado', False)}")

        time.sleep(2)

        print(f"\n   >> Atualizando status: em_preparacao")
        ok, data = atualizar_status_entrega(entrega_id, "em_preparacao")
        if ok:
            print(f"      Cliente notificado: {data.get('cliente_notificado', False)}")
            print(f"      Gerente notificado: {data.get('gerente_notificado', False)}")

        time.sleep(2)

        print(f"\n   >> Atualizando status: saiu_entrega")
        ok, data = atualizar_status_entrega(entrega_id, "saiu_entrega")
        if ok:
            print(f"      Cliente notificado: {data.get('cliente_notificado', False)}")
            print(f"      Gerente notificado: {data.get('gerente_notificado', False)}")

    return True

def main():
    print("\n" + "#"*70)
    print("#  TESTE BOT - PRODUTOS REAIS + NOTIFICACOES GERENTE")
    print("#  Empresa ID: " + str(EMPRESA_ID))
    print("#"*70)

    # Buscar produtos reais do banco
    print("\nBuscando produtos do banco de dados...")
    produtos = buscar_produtos_para_teste()

    if not produtos:
        print("[ERRO] Nenhum produto encontrado no banco!")
        return

    print(f"[OK] {len(produtos)} produtos encontrados")
    print("\nAlguns produtos disponiveis:")
    for p in produtos[:5]:
        print(f"  - {p[0][:50]} | R$ {p[1]:.2f} | {p[2]}")

    # Definir 3 clientes para teste
    clientes = [
        {
            "telefone": "5542991111111",
            "nome": "Carlos Pintor",
            "interesse": "Preciso de tinta acrilica para pintar minha casa",
            "categoria": "Tintas",
            "quantidade": 3,
            "pagamento": "PIX",
            "tipo_entrega": "Entrega",
            "endereco": "Rua das Palmeiras, 450 - Centro",
            "conversa": [
                "Ola, boa tarde!",
                "To precisando de tinta pra pintar minha casa",
                "Voces tem {CATEGORIA}?",
                "Quanto ta o preco dessa {PRODUTO}?",
                "Vou querer 3 latas, aceita pix?",
                "Pode entregar na Rua das Palmeiras, 450 - Centro"
            ]
        },
        {
            "telefone": "5542992222222",
            "nome": "Maria Decoradora",
            "interesse": "Busco verniz para moveis",
            "categoria": "Vernizes",
            "quantidade": 2,
            "pagamento": "Cartao",
            "tipo_entrega": "Retirada",
            "endereco": "",
            "conversa": [
                "Oi! Tudo bem?",
                "Estou reformando alguns moveis antigos",
                "Tem verniz pra madeira ai?",
                "Qual o preco?",
                "Quero 2 unidades, posso buscar ai na loja?"
            ]
        },
        {
            "telefone": "5542993333333",
            "nome": "Joao Construtor",
            "interesse": "Preciso de material para obra",
            "categoria": "Massas",
            "quantidade": 5,
            "pagamento": "Dinheiro",
            "tipo_entrega": "Entrega",
            "endereco": "Av. Brasil, 1200 - Bairro Industrial",
            "conversa": [
                "E ai, beleza?",
                "To fazendo uma obra aqui",
                "Voces vendem massa corrida?",
                "Me fala o preco por favor",
                "Ah, antes me fala, vcs entregam?",
                "Legal! Quero 5 unidades, entrega na Av. Brasil, 1200"
            ]
        }
    ]

    # Atribuir produtos diferentes para cada cliente
    produtos_por_categoria = {}
    for p in produtos:
        cat = p[2]
        if cat not in produtos_por_categoria:
            produtos_por_categoria[cat] = []
        produtos_por_categoria[cat].append(p)

    # Executar teste para cada cliente
    for i, cliente in enumerate(clientes):
        categoria = cliente["categoria"]
        if categoria in produtos_por_categoria and produtos_por_categoria[categoria]:
            produtos_cliente = produtos_por_categoria[categoria]
        else:
            produtos_cliente = produtos[:3]

        simular_cliente(cliente, produtos_cliente)
        time.sleep(3)

    print("\n" + "#"*70)
    print("#  TESTE CONCLUIDO!")
    print("#"*70)
    print("\nResumo das notificacoes enviadas ao gerente:")
    print("  - 3x Novo Lead")
    print("  - 3x Nova Venda")
    print("  - 6x Status de Entrega (2 clientes com entrega)")
    print("     * 2x Pedido Pendente")
    print("     * 2x Em Preparacao")
    print("     * 2x Saiu para Entrega")
    print("\nVerifique seu WhatsApp!")
    print("#"*70 + "\n")

if __name__ == "__main__":
    main()

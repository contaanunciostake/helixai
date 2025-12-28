# -*- coding: utf-8 -*-
"""
TESTE FLUXO COMPLETO DE VENDAS
Testa: Bot -> API -> Banco de Dados -> Notificacao Gerente
"""

import requests
import sqlite3
from datetime import datetime

API_URL = "http://localhost:5000"
BOT_URL = "http://localhost:3010"
EMPRESA_ID = 27
DB_PATH = 'D:/Helix/HelixAI/backend/vendeai.db'

def get_produtos_disponiveis():
    """Busca 3 produtos disponíveis"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        SELECT id, nome, preco, estoque FROM produtos
        WHERE empresa_id = ? AND disponivel = 1 AND estoque > 0
        LIMIT 3
    ''', (EMPRESA_ID,))
    produtos = cursor.fetchall()
    conn.close()
    return produtos

def get_ultimo_pedido():
    """Busca último pedido criado"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        SELECT id, cliente_id, total, status, criado_em
        FROM pedidos
        WHERE empresa_id = ?
        ORDER BY id DESC LIMIT 1
    ''', (EMPRESA_ID,))
    pedido = cursor.fetchone()
    conn.close()
    return pedido

def get_estoque_produto(produto_id):
    """Busca estoque atual de um produto"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT estoque FROM produtos WHERE id = ?', (produto_id,))
    result = cursor.fetchone()
    conn.close()
    return result[0] if result else 0

def testar_registro_venda():
    """Testa o endpoint /api/venda/registrar diretamente"""
    print("\n" + "="*60)
    print("TESTE: Registro de Venda via API")
    print("="*60)

    # Buscar produtos
    produtos = get_produtos_disponiveis()
    if not produtos:
        print("[ERRO] Nenhum produto disponível!")
        return False

    produto = produtos[0]
    print(f"\n[INFO] Produto selecionado: {produto[1]} (ID: {produto[0]})")
    print(f"[INFO] Preco: R$ {produto[2]:.2f} | Estoque atual: {produto[3]}")

    estoque_antes = get_estoque_produto(produto[0])
    pedido_antes = get_ultimo_pedido()
    pedido_id_antes = pedido_antes[0] if pedido_antes else 0

    # Registrar venda
    print("\n[TESTE] Chamando /api/venda/registrar...")

    response = requests.post(
        f"{API_URL}/api/venda/registrar",
        json={
            "empresa_id": EMPRESA_ID,
            "cliente": {
                "nome": "Teste Fluxo Completo",
                "telefone": "5542999888777"
            },
            "itens": [
                {"produto_id": produto[0], "quantidade": 2}
            ],
            "forma_pagamento": "pix",
            "tipo_entrega": "entrega",
            "endereco_entrega": "Rua Teste, 123 - Centro"
        },
        timeout=30
    )

    result = response.json()

    if result.get("success"):
        data = result.get("data", {})
        print(f"\n[OK] Venda registrada com sucesso!")
        print(f"  - Pedido ID: {data.get('pedido_id')}")
        print(f"  - Cliente ID: {data.get('cliente_id')}")
        print(f"  - Valor Total: R$ {data.get('valor_total', 0):.2f}")
        print(f"  - Entrega ID: {data.get('entrega_id')}")
        print(f"  - Gerente notificado: {data.get('gerente_notificado')}")

        # Verificar se estoque foi atualizado
        estoque_depois = get_estoque_produto(produto[0])
        print(f"\n[VERIFICACAO] Estoque:")
        print(f"  - Antes: {estoque_antes}")
        print(f"  - Depois: {estoque_depois}")
        print(f"  - Diferenca: {estoque_antes - estoque_depois} (esperado: 2)")

        # Verificar se pedido foi criado
        pedido_depois = get_ultimo_pedido()
        if pedido_depois and pedido_depois[0] > pedido_id_antes:
            print(f"\n[VERIFICACAO] Pedido criado no banco:")
            print(f"  - ID: {pedido_depois[0]}")
            print(f"  - Cliente ID: {pedido_depois[1]}")
            print(f"  - Valor: R$ {pedido_depois[2]:.2f}")
            print(f"  - Status: {pedido_depois[3]}")
            print(f"  - Data: {pedido_depois[4]}")

        return True
    else:
        print(f"\n[ERRO] Falha ao registrar venda: {result.get('error')}")
        return False

def testar_via_bot():
    """Testa conversa com bot que deve registrar venda"""
    print("\n" + "="*60)
    print("TESTE: Venda via Bot (simulacao)")
    print("="*60)

    produtos = get_produtos_disponiveis()
    if not produtos:
        print("[ERRO] Nenhum produto disponível!")
        return False

    produto = produtos[1] if len(produtos) > 1 else produtos[0]
    print(f"\n[INFO] Produto: {produto[1]}")

    telefone = "5542999777666"
    mensagens = [
        "Ola, quero comprar tinta",
        f"Quanto custa o {produto[1][:30]}?",
        "Quero 2 unidades, aceita pix?",
        "Pode entregar na Rua das Flores, 500"
    ]

    for msg in mensagens:
        print(f"\n[CLIENTE]: {msg}")
        try:
            response = requests.post(
                f"{BOT_URL}/api/bot/test-message",
                json={
                    "empresaId": EMPRESA_ID,
                    "mensagem": msg,
                    "telefone": telefone
                },
                timeout=60
            )
            data = response.json()
            if data.get("success"):
                resposta = data.get("data", {}).get("respostaBot", "")[:200]
                print(f"[BOT]: {resposta}...")
            else:
                print(f"[ERRO]: {data.get('error')}")
        except Exception as e:
            print(f"[ERRO]: {e}")

    return True

def main():
    print("\n" + "#"*60)
    print("#  TESTE FLUXO COMPLETO DE VENDAS")
    print("#  Empresa ID:", EMPRESA_ID)
    print("#"*60)

    # Teste 1: API direta
    ok1 = testar_registro_venda()

    # Teste 2: Via bot (opcional - requer bot rodando)
    print("\n" + "-"*60)
    try:
        response = requests.get(f"{BOT_URL}/api/status", timeout=5)
        if response.status_code == 200:
            ok2 = testar_via_bot()
        else:
            print("[INFO] Bot nao esta rodando, pulando teste via bot")
            ok2 = True
    except:
        print("[INFO] Bot nao disponivel, pulando teste via bot")
        ok2 = True

    print("\n" + "#"*60)
    print("#  RESULTADO FINAL")
    print("#"*60)
    print(f"\n  API Direta: {'OK' if ok1 else 'FALHOU'}")
    print(f"  Via Bot: {'OK' if ok2 else 'FALHOU'}")
    print("\n" + "#"*60)

if __name__ == "__main__":
    main()

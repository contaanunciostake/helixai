# -*- coding: utf-8 -*-
"""
Simulador de Atendimento Completo - Loja de Tintas
Testa todas as possibilidades do sistema e envia notificacoes
"""

import requests
import time
import json

EMPRESA_ID = 27
BOT_URL = "http://localhost:3010"
API_URL = "http://localhost:5000"
TELEFONE_CLIENTE = "5542999111222"  # Cliente ficticio
TELEFONE_GERENTE = "42999300611"    # Seu numero (recebe notificacoes)

def test_message(mensagem, cliente_nome="Cliente Teste"):
    """Envia mensagem de teste para o bot e retorna resposta"""
    try:
        response = requests.post(
            f"{BOT_URL}/api/bot/test-message",
            json={
                "empresaId": EMPRESA_ID,
                "mensagem": mensagem,
                "telefone": TELEFONE_CLIENTE
            },
            timeout=60
        )
        data = response.json()
        return data
    except Exception as e:
        return {"success": False, "error": str(e)}

def enviar_notificacao(tipo, dados):
    """Envia notificacao para o gerente"""
    try:
        response = requests.post(
            f"{API_URL}/api/empresa/notificacoes/enviar",
            json={
                "empresa_id": EMPRESA_ID,
                "tipo": tipo,
                "dados": dados
            },
            timeout=30
        )
        return response.json()
    except Exception as e:
        return {"success": False, "error": str(e)}

def print_divider(titulo):
    print("\n" + "="*60)
    print(f"  {titulo}")
    print("="*60)

def main():
    print("\n" + "#"*60)
    print("#  SIMULADOR DE ATENDIMENTO - LOJA DE TINTAS")
    print("#  Empresa ID: 27")
    print("#  Notificacoes para: " + TELEFONE_GERENTE)
    print("#"*60)

    # ============================================================
    # CENARIO 1: Novo cliente chega (LEAD)
    # ============================================================
    print_divider("CENARIO 1: NOVO CLIENTE - LEAD")

    msg1 = "Ola, boa tarde!"
    print(f"\n[CLIENTE]: {msg1}")

    resp1 = test_message(msg1)
    if resp1.get("success"):
        print(f"[BOT]: {resp1.get('resposta', 'Sem resposta')[:200]}...")
    else:
        print(f"[ERRO]: {resp1.get('error')}")

    # Notificar novo lead
    print("\n>> Enviando notificacao de NOVO LEAD...")
    notif_lead = enviar_notificacao("lead", {
        "nome": "Carlos Mendes",
        "telefone": "42999111222",
        "mensagem": "Ola, boa tarde!",
        "interesse": "Primeiro contato"
    })
    print(f">> Notificacao Lead: {'ENVIADA' if notif_lead.get('success') else 'FALHOU'}")

    time.sleep(3)

    # ============================================================
    # CENARIO 2: Cliente pergunta sobre produtos
    # ============================================================
    print_divider("CENARIO 2: CONSULTA DE PRODUTOS")

    msg2 = "Quais tintas voces tem? Preciso pintar minha sala"
    print(f"\n[CLIENTE]: {msg2}")

    resp2 = test_message(msg2)
    if resp2.get("success"):
        print(f"[BOT]: {resp2.get('resposta', 'Sem resposta')[:300]}...")
    else:
        print(f"[ERRO]: {resp2.get('error')}")

    time.sleep(2)

    # ============================================================
    # CENARIO 3: Cliente pede orcamento especifico
    # ============================================================
    print_divider("CENARIO 3: PEDIDO DE ORCAMENTO")

    msg3 = "Quanto custa a tinta Suvinil 18 litros na cor branca?"
    print(f"\n[CLIENTE]: {msg3}")

    resp3 = test_message(msg3)
    if resp3.get("success"):
        print(f"[BOT]: {resp3.get('resposta', 'Sem resposta')[:300]}...")
    else:
        print(f"[ERRO]: {resp3.get('error')}")

    time.sleep(2)

    # ============================================================
    # CENARIO 4: Cliente quer saber sobre entrega
    # ============================================================
    print_divider("CENARIO 4: PERGUNTA SOBRE ENTREGA")

    msg4 = "Voces fazem entrega? Quanto custa o frete para o centro?"
    print(f"\n[CLIENTE]: {msg4}")

    resp4 = test_message(msg4)
    if resp4.get("success"):
        print(f"[BOT]: {resp4.get('resposta', 'Sem resposta')[:300]}...")
    else:
        print(f"[ERRO]: {resp4.get('error')}")

    time.sleep(2)

    # ============================================================
    # CENARIO 5: Cliente confirma compra (VENDA)
    # ============================================================
    print_divider("CENARIO 5: CONFIRMACAO DE COMPRA - VENDA")

    msg5 = "Ok, vou querer 2 latas da Suvinil 18L branca e 1 galao de massa corrida. Pode fechar o pedido?"
    print(f"\n[CLIENTE]: {msg5}")

    resp5 = test_message(msg5)
    if resp5.get("success"):
        print(f"[BOT]: {resp5.get('resposta', 'Sem resposta')[:300]}...")
    else:
        print(f"[ERRO]: {resp5.get('error')}")

    # Notificar venda
    print("\n>> Enviando notificacao de VENDA...")
    notif_venda = enviar_notificacao("venda", {
        "cliente": "Carlos Mendes",
        "telefone": "42999111222",
        "produtos": "2x Tinta Suvinil 18L Branca, 1x Massa Corrida 25kg",
        "valor": 589.70,
        "forma_pagamento": "A combinar"
    })
    print(f">> Notificacao Venda: {'ENVIADA' if notif_venda.get('success') else 'FALHOU'}")

    time.sleep(3)

    # ============================================================
    # CENARIO 6: Cliente agenda entrega (ENTREGA)
    # ============================================================
    print_divider("CENARIO 6: AGENDAMENTO DE ENTREGA")

    msg6 = "Pode entregar amanha de manha no endereco Rua das Palmeiras, 456 - Centro"
    print(f"\n[CLIENTE]: {msg6}")

    resp6 = test_message(msg6)
    if resp6.get("success"):
        print(f"[BOT]: {resp6.get('resposta', 'Sem resposta')[:300]}...")
    else:
        print(f"[ERRO]: {resp6.get('error')}")

    # Notificar entrega
    print("\n>> Enviando notificacao de ENTREGA...")
    notif_entrega = enviar_notificacao("entrega", {
        "cliente": "Carlos Mendes",
        "telefone": "42999111222",
        "endereco": "Rua das Palmeiras, 456 - Centro",
        "produtos": "2x Tinta Suvinil 18L, 1x Massa Corrida",
        "horario": "Amanha - Manha (08:00-12:00)",
        "valor": 589.70
    })
    print(f">> Notificacao Entrega: {'ENVIADA' if notif_entrega.get('success') else 'FALHOU'}")

    time.sleep(3)

    # ============================================================
    # CENARIO 7: Cliente faz pergunta tecnica
    # ============================================================
    print_divider("CENARIO 7: DUVIDA TECNICA")

    msg7 = "Qual a diferenca entre tinta acrilica e latex? Qual rende mais?"
    print(f"\n[CLIENTE]: {msg7}")

    resp7 = test_message(msg7)
    if resp7.get("success"):
        print(f"[BOT]: {resp7.get('resposta', 'Sem resposta')[:400]}...")
    else:
        print(f"[ERRO]: {resp7.get('error')}")

    time.sleep(2)

    # ============================================================
    # CENARIO 8: Cliente pergunta horario de funcionamento
    # ============================================================
    print_divider("CENARIO 8: HORARIO DE FUNCIONAMENTO")

    msg8 = "Qual o horario de funcionamento da loja? Abrem no sabado?"
    print(f"\n[CLIENTE]: {msg8}")

    resp8 = test_message(msg8)
    if resp8.get("success"):
        print(f"[BOT]: {resp8.get('resposta', 'Sem resposta')[:300]}...")
    else:
        print(f"[ERRO]: {resp8.get('error')}")

    time.sleep(2)

    # ============================================================
    # CENARIO 9: Segundo cliente - Lead separado
    # ============================================================
    print_divider("CENARIO 9: SEGUNDO CLIENTE - NOVO LEAD")

    # Notificar segundo lead
    print("\n>> Enviando notificacao de SEGUNDO LEAD...")
    notif_lead2 = enviar_notificacao("lead", {
        "nome": "Ana Paula Silva",
        "telefone": "42988776655",
        "mensagem": "Oi, voces tem tinta para piso?",
        "interesse": "Tinta para piso"
    })
    print(f">> Notificacao Lead 2: {'ENVIADA' if notif_lead2.get('success') else 'FALHOU'}")

    time.sleep(2)

    # ============================================================
    # CENARIO 10: Cliente pede promocao
    # ============================================================
    print_divider("CENARIO 10: PERGUNTA SOBRE PROMOCOES")

    msg10 = "Tem alguma promocao ou desconto para compras acima de 500 reais?"
    print(f"\n[CLIENTE]: {msg10}")

    resp10 = test_message(msg10)
    if resp10.get("success"):
        print(f"[BOT]: {resp10.get('resposta', 'Sem resposta')[:300]}...")
    else:
        print(f"[ERRO]: {resp10.get('error')}")

    # ============================================================
    # RESUMO FINAL
    # ============================================================
    print("\n" + "#"*60)
    print("#  SIMULACAO CONCLUIDA!")
    print("#"*60)
    print("\nNotificacoes enviadas para " + TELEFONE_GERENTE + ":")
    print("  1. Lead - Carlos Mendes (primeiro contato)")
    print("  2. Venda - Carlos Mendes (R$ 589,70)")
    print("  3. Entrega - Carlos Mendes (amanha manha)")
    print("  4. Lead - Ana Paula Silva (tinta para piso)")
    print("\nVerifique seu WhatsApp!")
    print("#"*60 + "\n")

if __name__ == "__main__":
    main()

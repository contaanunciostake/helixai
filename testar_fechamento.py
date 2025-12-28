# -*- coding: utf-8 -*-
"""
Teste de Fechamento Inteligente - Loja de Tintas
Simula conversas para testar a nova logica de fechamento contextual
"""

import requests
import time
import json

BOT_URL = "http://localhost:3010"
EMPRESA_ID = 27

def test_message(mensagem, telefone="5542999333444"):
    """Envia mensagem de teste para o bot"""
    try:
        response = requests.post(
            f"{BOT_URL}/api/bot/test-message",
            json={
                "empresaId": EMPRESA_ID,
                "mensagem": mensagem,
                "telefone": telefone
            },
            timeout=90
        )
        return response.json()
    except Exception as e:
        return {"success": False, "error": str(e)}

def print_resposta(resp):
    if resp.get("success"):
        data = resp.get("data", {})
        resposta = data.get('respostaBot', 'Sem resposta')
        # Remover emojis para evitar erro de encoding no Windows
        resposta_limpa = resposta.encode('ascii', 'ignore').decode('ascii')
        print(f"[BOT {data.get('nomeBot', 'Laura')}]: {resposta_limpa}")
        print(f"   Tempo: {data.get('tempoProcessamentoMs', 0)}ms")
    else:
        print(f"[ERRO]: {resp.get('error', 'Erro desconhecido')}")

def main():
    print("\n" + "="*70)
    print("  TESTE DE FECHAMENTO INTELIGENTE - LOJA DE TINTAS")
    print("  Testando deteccao contextual de sinais de compra")
    print("="*70)

    # Usar telefone diferente para conversa limpa
    tel = "5542999777888"

    # ============================================
    # CONVERSA 1: Cliente com sinais claros de compra
    # ============================================
    print("\n" + "-"*60)
    print("CENARIO 1: Cliente com sinais claros de compra")
    print("-"*60)

    print("\n[CLIENTE]: Oi, preciso de tinta pra pintar minha sala")
    resp = test_message("Oi, preciso de tinta pra pintar minha sala", tel)
    print_resposta(resp)
    time.sleep(2)

    print("\n[CLIENTE]: Quero 2 latas de 18 litros da Suvinil branco gelo")
    resp = test_message("Quero 2 latas de 18 litros da Suvinil branco gelo", tel)
    print_resposta(resp)
    time.sleep(2)

    print("\n[CLIENTE]: Quanto fica e voces aceitam pix?")
    resp = test_message("Quanto fica e voces aceitam pix?", tel)
    print_resposta(resp)
    time.sleep(2)

    print("\n[CLIENTE]: Beleza, pode fechar! Voces entregam?")
    resp = test_message("Beleza, pode fechar! Voces entregam?", tel)
    print_resposta(resp)

    # ============================================
    # CONVERSA 2: Cliente indeciso
    # ============================================
    print("\n" + "-"*60)
    print("CENARIO 2: Cliente indeciso (NAO deve fechar)")
    print("-"*60)

    tel2 = "5542999666555"

    print("\n[CLIENTE]: Oi, to pesquisando tinta")
    resp = test_message("Oi, to pesquisando tinta", tel2)
    print_resposta(resp)
    time.sleep(2)

    print("\n[CLIENTE]: Qual a diferenca entre acrilica e latex?")
    resp = test_message("Qual a diferenca entre acrilica e latex?", tel2)
    print_resposta(resp)
    time.sleep(2)

    print("\n[CLIENTE]: Vou pensar e depois te falo")
    resp = test_message("Vou pensar e depois te falo", tel2)
    print_resposta(resp)

    # ============================================
    # CONVERSA 3: Fechamento com entrega
    # ============================================
    print("\n" + "-"*60)
    print("CENARIO 3: Fechamento completo com entrega")
    print("-"*60)

    tel3 = "5542999444333"

    print("\n[CLIENTE]: Boa tarde, quero comprar tinta")
    resp = test_message("Boa tarde, quero comprar tinta", tel3)
    print_resposta(resp)
    time.sleep(2)

    print("\n[CLIENTE]: Me da 3 galoes de tinta branca 18L")
    resp = test_message("Me da 3 galoes de tinta branca 18L", tel3)
    print_resposta(resp)
    time.sleep(2)

    print("\n[CLIENTE]: Pode mandar entregar na Rua das Flores, 123 - Centro")
    resp = test_message("Pode mandar entregar na Rua das Flores, 123 - Centro", tel3)
    print_resposta(resp)
    time.sleep(2)

    print("\n[CLIENTE]: Vou pagar no pix quando chegar")
    resp = test_message("Vou pagar no pix quando chegar", tel3)
    print_resposta(resp)

    print("\n" + "="*70)
    print("  TESTE CONCLUIDO!")
    print("  A IA deve ter oferecido fechamento naturalmente nos cenarios 1 e 3")
    print("  E mantido tom consultivo no cenario 2 (cliente indeciso)")
    print("="*70 + "\n")

if __name__ == "__main__":
    main()

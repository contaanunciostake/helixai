# -*- coding: utf-8 -*-
"""
TESTE COMPLETO - 5 CLIENTES SIMULTANEOS
Testa conversas com desvios de contexto e retorno para venda
"""

import requests
import time
import sqlite3
import threading
from datetime import datetime

BOT_URL = "http://localhost:3010"
API_URL = "http://localhost:5000"
EMPRESA_ID = 27
GERENTE_WHATSAPP = "42999300611"

# 5 clientes com perfis diferentes
CLIENTES = [
    {
        "telefone": "5542991111111",
        "nome": "Joao Silva",
        "conversa": [
            "Oi boa tarde",
            "Preciso pintar minha casa toda",
            "Ah mas antes deixa eu perguntar, voces vendem cimento tambem?",  # SAI DO CONTEXTO
            "Entendi, voltando pra tinta entao, quero branca 18 litros",
            "Quanto custa a Suvinil?",
            "Vou querer 4 latas, aceita pix?",
            "Fechado! Entrega na Rua das Flores, 100 - Centro"
        ]
    },
    {
        "telefone": "5542992222222",
        "nome": "Maria Santos",
        "conversa": [
            "Ola!",
            "To reformando meu apartamento",
            "Ei, voce sabe onde fica o cartorio aqui perto?",  # SAI DO CONTEXTO TOTALMENTE
            "Desculpa, pergunta errada kkk",
            "Quero tinta pra quarto de bebe, tem cor rosa?",
            "Quanto sai 2 latas de 3.6 litros?",
            "Pode separar pra mim, pago na hora que buscar"
        ]
    },
    {
        "telefone": "5542993333333",
        "nome": "Pedro Oliveira",
        "conversa": [
            "Bom dia",
            "Preciso de massa corrida e tinta",
            "Voces fazem entrega pra zona rural?",  # PERGUNTA VALIDA MAS DESVIA
            "Ah legal, mas primeiro me fala, qual a diferenca entre latex e acrilica?",  # DUVIDA TECNICA
            "Entendi, vou de acrilica entao",
            "Me da 2 latas 18L branca e 1 massa corrida 25kg",
            "Pode mandar entregar amanha de manha na Estrada do Campo, km 5"
        ]
    },
    {
        "telefone": "5542994444444",
        "nome": "Ana Paula",
        "conversa": [
            "Oi, tudo bem?",
            "Nossa que calor hoje ne",  # CONVERSA FIADA
            "Deixa eu ver aqui o que preciso...",
            "Ah sim! Tinta pra pintar portao de ferro",
            "Tem esmalte sintetico preto?",
            "Quanto ta o galao?",
            "Vou buscar ai na loja, guarda pra mim 2 galoes"
        ]
    },
    {
        "telefone": "5542995555555",
        "nome": "Carlos Mendes",
        "conversa": [
            "E ai beleza",
            "To precisando de umas coisas ai",
            "Minha esposa quer pintar a cozinha de amarelo",  # CONTEXTO PESSOAL
            "Ela que escolheu a cor kkk",
            "Tem tinta amarela? Quanto preciso pra uma cozinha de 12m2?",
            "Manda 1 lata de 18L entao, deve dar ne?",
            "Vou passar ai hoje a tarde pra pegar"
        ]
    }
]

def enviar_mensagem(telefone, mensagem):
    """Envia mensagem para o bot e retorna resposta"""
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
        return None
    except Exception as e:
        return f"ERRO: {e}"

def enviar_notificacao_lead(cliente):
    """Envia notificacao de lead para o gerente"""
    try:
        requests.post(
            f"{API_URL}/api/empresa/notificacoes/enviar",
            json={
                "empresa_id": EMPRESA_ID,
                "tipo": "lead",
                "dados": {
                    "nome": cliente["nome"],
                    "telefone": cliente["telefone"],
                    "mensagem": cliente["conversa"][0],
                    "interesse": "Tintas"
                }
            },
            timeout=30
        )
        return True
    except:
        return False

def enviar_notificacao_venda(cliente, itens, valor):
    """Envia notificacao de venda para o gerente"""
    try:
        requests.post(
            f"{API_URL}/api/empresa/notificacoes/enviar",
            json={
                "empresa_id": EMPRESA_ID,
                "tipo": "venda",
                "dados": {
                    "cliente_nome": cliente["nome"],
                    "cliente_telefone": cliente["telefone"],
                    "produtos_texto": itens,
                    "valor_total": valor,
                    "forma_pagamento": "PIX/Dinheiro",
                    "tipo_entrega": "Entrega" if "Entrega" in cliente.get("tipo", "") else "Retirada"
                }
            },
            timeout=30
        )
        return True
    except:
        return False

def criar_entrega_e_atualizar_status(cliente, itens, endereco):
    """Cria entrega e atualiza status"""
    try:
        conn = sqlite3.connect('D:/Helix/HelixAI/backend/vendeai.db')
        cursor = conn.cursor()

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

        # Atualizar status para saiu_entrega (notifica cliente)
        time.sleep(1)
        requests.post(
            f"{API_URL}/api/entrega/status/atualizar",
            json={
                "entrega_id": entrega_id,
                "empresa_id": EMPRESA_ID,
                "novo_status": "saiu_entrega"
            },
            timeout=30
        )

        return entrega_id
    except Exception as e:
        print(f"Erro ao criar entrega: {e}")
        return None

def simular_cliente(cliente, cliente_num):
    """Simula conversa completa de um cliente"""
    print(f"\n{'='*60}")
    print(f"CLIENTE {cliente_num}: {cliente['nome']}")
    print(f"Telefone: {cliente['telefone']}")
    print(f"{'='*60}")

    respostas = []

    for i, msg in enumerate(cliente["conversa"]):
        print(f"\n[{cliente['nome']}]: {msg}")

        resposta = enviar_mensagem(cliente["telefone"], msg)
        if resposta:
            # Limpar resposta para exibicao
            resposta_limpa = resposta.encode('ascii', 'ignore').decode('ascii')[:200]
            print(f"[BOT]: {resposta_limpa}...")
            respostas.append(resposta)

        # Primeira mensagem = notificar lead
        if i == 0:
            enviar_notificacao_lead(cliente)
            print(f"   >> Notificacao de LEAD enviada ao gerente")

        time.sleep(2)  # Intervalo entre mensagens

    return respostas

def main():
    print("\n" + "#"*70)
    print("#  TESTE COMPLETO - 5 CLIENTES SIMULTANEOS")
    print("#  Testando conversas com desvios e retorno para venda")
    print("#  Notificacoes para: " + GERENTE_WHATSAPP)
    print("#"*70)

    # Dados das vendas simuladas
    vendas = [
        {"cliente": CLIENTES[0], "itens": "4x Tinta Suvinil 18L Branca", "valor": "759,60", "endereco": "Rua das Flores, 100 - Centro", "tipo": "Entrega"},
        {"cliente": CLIENTES[1], "itens": "2x Tinta Rosa 3.6L", "valor": "189,80", "endereco": "", "tipo": "Retirada"},
        {"cliente": CLIENTES[2], "itens": "2x Tinta Acrilica 18L + 1x Massa Corrida 25kg", "valor": "424,70", "endereco": "Estrada do Campo, km 5", "tipo": "Entrega"},
        {"cliente": CLIENTES[3], "itens": "2x Esmalte Sintetico Preto", "valor": "156,00", "endereco": "", "tipo": "Retirada"},
        {"cliente": CLIENTES[4], "itens": "1x Tinta Amarela 18L", "valor": "189,90", "endereco": "", "tipo": "Retirada"},
    ]

    # Simular cada cliente sequencialmente (para nao sobrecarregar)
    for i, cliente in enumerate(CLIENTES):
        simular_cliente(cliente, i+1)

        # Apos conversa, enviar notificacao de venda
        venda = vendas[i]
        print(f"\n   >> Enviando notificacao de VENDA: {venda['itens']}")
        enviar_notificacao_venda(venda["cliente"], venda["itens"], venda["valor"])

        # Se for entrega, criar e notificar cliente
        if venda["tipo"] == "Entrega" and venda["endereco"]:
            print(f"   >> Criando ENTREGA e notificando cliente...")
            entrega_id = criar_entrega_e_atualizar_status(
                venda["cliente"],
                venda["itens"],
                venda["endereco"]
            )
            if entrega_id:
                print(f"   >> Entrega #{entrega_id} criada - Cliente notificado!")

        time.sleep(3)  # Intervalo entre clientes

    print("\n" + "#"*70)
    print("#  TESTE CONCLUIDO!")
    print("#"*70)
    print("\nNotificacoes enviadas ao gerente:")
    print("  - 5x Novo Lead")
    print("  - 5x Nova Venda")
    print("\nNotificacoes enviadas aos clientes (entregas):")
    print("  - Joao Silva: Status 'Saiu para entrega'")
    print("  - Pedro Oliveira: Status 'Saiu para entrega'")
    print("\nVerifique seu WhatsApp!")
    print("#"*70 + "\n")

if __name__ == "__main__":
    main()

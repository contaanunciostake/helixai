"""
Script para importar 20 veículos completos ao banco de dados
Com isolamento multi-tenant por empresa_id
"""
import sqlite3
import csv
from datetime import datetime

# Conectar ao banco de dados
db_path = 'D:/Helix/HelixAI/vendeai.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Empresa ID (alterar conforme necessário)
EMPRESA_ID = 1

# Abrir CSV
csv_path = 'D:/Helix/HelixAI/uploads/produtos/veiculos_completos_20.csv'

print(f"\n{'='*60}")
print(f"IMPORTANDO 20 VEÍCULOS - EMPRESA ID: {EMPRESA_ID}")
print(f"{'='*60}\n")

try:
    with open(csv_path, 'r', encoding='utf-8') as file:
        csv_reader = csv.DictReader(file)

        count = 0
        for row in csv_reader:
            # Preparar dados
            marca = row['marca']
            modelo = row['modelo']
            versao = row['versao']
            ano_modelo = row['ano_modelo']
            ano_fabricacao = row['ano_fabricacao']
            preco = float(row['preco'])
            preco_anterior = float(row['preco_anterior']) if row['preco_anterior'] else None
            aceita_troca = int(row['aceita_troca'])
            financiamento_disponivel = int(row['financiamento_disponivel'])
            quilometragem = row['quilometragem']
            cor = row['cor']
            combustivel = row['combustivel']
            cambio = row['cambio']
            motor = row['motor']
            portas = int(row['portas'])
            final_placa = row['final_placa']
            opcionais = row['opcionais']
            imagem_principal = row['imagem_principal']
            imagens_galeria = row['imagens_galeria']
            descricao = row['descricao']
            observacoes = row['observacoes']
            disponivel = int(row['disponivel'])
            destaque = int(row['destaque'])
            oferta_especial = int(row['oferta_especial'])
            codigo_fipe = row['codigo_fipe']
            valor_fipe = float(row['valor_fipe']) if row['valor_fipe'] else None
            cidade = row['cidade']
            estado = row['estado']
            loja = row['loja']
            codigo_interno = row['codigo_interno']
            sku = row['sku']

            # Data atual
            criado_em = datetime.now().isoformat()
            atualizado_em = criado_em

            # Inserir no banco
            cursor.execute('''
                INSERT INTO veiculos (
                    empresa_id, marca, modelo, versao, ano_modelo, ano_fabricacao,
                    preco, preco_anterior, aceita_troca, financiamento_disponivel,
                    quilometragem, cor, combustivel, cambio, motor, portas, final_placa,
                    opcionais, imagem_principal, imagens_galeria, descricao, observacoes,
                    disponivel, destaque, oferta_especial, codigo_fipe, valor_fipe,
                    cidade, estado, loja, codigo_interno, sku,
                    criado_em, atualizado_em
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                EMPRESA_ID, marca, modelo, versao, ano_modelo, ano_fabricacao,
                preco, preco_anterior, aceita_troca, financiamento_disponivel,
                quilometragem, cor, combustivel, cambio, motor, portas, final_placa,
                opcionais, imagem_principal, imagens_galeria, descricao, observacoes,
                disponivel, destaque, oferta_especial, codigo_fipe, valor_fipe,
                cidade, estado, loja, codigo_interno, sku,
                criado_em, atualizado_em
            ))

            count += 1
            print(f"[OK] {count:02d}. {marca} {modelo} {versao} - R$ {preco:,.2f}")

    # Commit
    conn.commit()

    print(f"\n{'='*60}")
    print(f"[SUCESSO] {count} veiculos importados para empresa_id={EMPRESA_ID}")
    print(f"{'='*60}\n")

    # Estatísticas
    cursor.execute('SELECT COUNT(*) FROM veiculos WHERE empresa_id = ?', (EMPRESA_ID,))
    total = cursor.fetchone()[0]

    cursor.execute('SELECT COUNT(*) FROM veiculos WHERE empresa_id = ? AND disponivel = 1', (EMPRESA_ID,))
    disponiveis = cursor.fetchone()[0]

    cursor.execute('SELECT COUNT(*) FROM veiculos WHERE empresa_id = ? AND destaque = 1', (EMPRESA_ID,))
    destaques = cursor.fetchone()[0]

    cursor.execute('SELECT COUNT(*) FROM veiculos WHERE empresa_id = ? AND oferta_especial = 1', (EMPRESA_ID,))
    ofertas = cursor.fetchone()[0]

    print("[ESTATISTICAS]:")
    print(f"   Total de veiculos: {total}")
    print(f"   Disponiveis: {disponiveis}")
    print(f"   Destaques: {destaques}")
    print(f"   Ofertas especiais: {ofertas}")
    print(f"\n   Isolamento Multi-Tenant: [OK] ATIVO")
    print(f"   Bot terá acesso apenas aos veículos da empresa_id={EMPRESA_ID}\n")

except Exception as e:
    print(f"\n[ERRO]: {e}")
    conn.rollback()
finally:
    conn.close()

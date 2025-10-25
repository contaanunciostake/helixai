"""
Script para importar veículos de exemplo no banco SQLite
Uso: python importar_veiculos_sqlite.py
"""

import sqlite3
import csv
from pathlib import Path
from datetime import datetime
import json

def importar_veiculos(empresa_id=1):
    """Importa veículos do CSV de exemplo"""

    db_path = Path(__file__).parent / 'vendeai.db'
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Verificar se empresa existe
        cursor.execute('SELECT id, nome_fantasia FROM empresas WHERE id = ?', (empresa_id,))
        empresa = cursor.fetchone()

        if not empresa:
            print(f"ERRO: Empresa {empresa_id} não encontrada!")
            return

        print(f"OK: Importando veículos para empresa: {empresa[1]}")
        print()

        # Abrir CSV
        csv_path = Path(__file__).parent / 'uploads' / 'produtos' / 'exemplo_veiculos.csv'

        if not csv_path.exists():
            print(f"ERRO: Arquivo CSV não encontrado: {csv_path}")
            return

        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)

            count = 0
            for row in reader:
                try:
                    # Preparar dados
                    opcionais = json.dumps(row['opcionais'].split(';')) if row['opcionais'] else None
                    imagens_galeria = json.dumps(row['imagens_galeria'].split(',')) if row['imagens_galeria'] else None

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
                        empresa_id,
                        row['marca'],
                        row['modelo'],
                        row['versao'],
                        row['ano_modelo'],
                        row['ano_fabricacao'],
                        float(row['preco']),
                        float(row['preco_anterior']) if row['preco_anterior'] else None,
                        1 if row['aceita_troca'].lower() == 'true' else 0,
                        1 if row['financiamento_disponivel'].lower() == 'true' else 0,
                        row['quilometragem'],
                        row['cor'],
                        row['combustivel'],
                        row['cambio'],
                        row['motor'],
                        int(row['portas']),
                        row['final_placa'],
                        opcionais,
                        row['imagem_principal'],
                        imagens_galeria,
                        row['descricao'],
                        row['observacoes'],
                        1 if row['disponivel'].lower() == 'true' else 0,
                        1 if row['destaque'].lower() == 'true' else 0,
                        1 if row['oferta_especial'].lower() == 'true' else 0,
                        row['codigo_fipe'],
                        float(row['valor_fipe']) if row['valor_fipe'] else None,
                        row['cidade'],
                        row['estado'],
                        row['loja'],
                        row['codigo_interno'],
                        row['sku'],
                        datetime.now().isoformat(),
                        datetime.now().isoformat()
                    ))

                    count += 1
                    preco_fmt = f"R$ {float(row['preco']):,.2f}".replace(',', '.')
                    print(f"  OK: {row['marca']} {row['modelo']} {row['versao']} - {preco_fmt}")

                except Exception as e:
                    print(f"  ERRO ao processar linha: {e}")
                    continue

            conn.commit()
            print()
            print(f"SUCESSO: {count} veículos importados!")

    except Exception as e:
        print(f"ERRO durante importação: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == '__main__':
    print("=" * 70)
    print("IMPORTAÇÃO DE VEÍCULOS DE EXEMPLO")
    print("=" * 70)
    print()

    importar_veiculos(1)

    print()
    print("=" * 70)
    print("Importação concluída!")
    print("=" * 70)

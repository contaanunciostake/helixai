"""
Script para importar veículos de exemplo no banco de dados
Uso: python importar_veiculos_exemplo.py
"""

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))

from database.models import DatabaseManager, Veiculo, Empresa
import csv
from datetime import datetime
import json

def importar_veiculos(empresa_id=1):
    """Importa veículos do CSV de exemplo"""

    db = DatabaseManager()
    session = db.get_session()

    try:
        # Verificar se empresa existe
        empresa = session.query(Empresa).get(empresa_id)
        if not empresa:
            print(f"❌ Empresa {empresa_id} não encontrada!")
            return

        print(f"✅ Importando veículos para empresa: {empresa.nome_fantasia}")

        # Abrir CSV
        csv_path = Path(__file__).parent / 'uploads' / 'produtos' / 'exemplo_veiculos.csv'

        if not csv_path.exists():
            print(f"❌ Arquivo CSV não encontrado: {csv_path}")
            return

        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)

            count = 0
            for row in reader:
                # Converter valores
                try:
                    veiculo = Veiculo(
                        empresa_id=empresa_id,
                        marca=row['marca'],
                        modelo=row['modelo'],
                        versao=row['versao'],
                        ano_modelo=row['ano_modelo'],
                        ano_fabricacao=row['ano_fabricacao'],
                        preco=float(row['preco']),
                        preco_anterior=float(row['preco_anterior']) if row['preco_anterior'] else None,
                        aceita_troca=row['aceita_troca'].lower() == 'true',
                        financiamento_disponivel=row['financiamento_disponivel'].lower() == 'true',
                        quilometragem=row['quilometragem'],
                        cor=row['cor'],
                        combustivel=row['combustivel'],
                        cambio=row['cambio'],
                        motor=row['motor'],
                        portas=int(row['portas']),
                        final_placa=row['final_placa'],
                        opcionais=json.dumps(row['opcionais'].split(';')) if row['opcionais'] else None,
                        imagem_principal=row['imagem_principal'],
                        imagens_galeria=json.dumps(row['imagens_galeria'].split(',')) if row['imagens_galeria'] else None,
                        descricao=row['descricao'],
                        observacoes=row['observacoes'],
                        disponivel=row['disponivel'].lower() == 'true',
                        destaque=row['destaque'].lower() == 'true',
                        oferta_especial=row['oferta_especial'].lower() == 'true',
                        codigo_fipe=row['codigo_fipe'],
                        valor_fipe=float(row['valor_fipe']) if row['valor_fipe'] else None,
                        cidade=row['cidade'],
                        estado=row['estado'],
                        loja=row['loja'],
                        codigo_interno=row['codigo_interno'],
                        sku=row['sku'],
                        criado_em=datetime.now(),
                        atualizado_em=datetime.now()
                    )

                    session.add(veiculo)
                    count += 1
                    print(f"  ✅ {veiculo.marca} {veiculo.modelo} {veiculo.versao} - R$ {veiculo.preco:,.2f}")

                except Exception as e:
                    print(f"  ❌ Erro ao processar linha: {e}")
                    continue

            session.commit()
            print(f"\n✅ {count} veículos importados com sucesso!")

    except Exception as e:
        print(f"❌ Erro durante importação: {e}")
        session.rollback()
    finally:
        session.close()

if __name__ == '__main__':
    print("=" * 70)
    print("IMPORTAÇÃO DE VEÍCULOS DE EXEMPLO")
    print("=" * 70)
    print()

    # Você pode mudar o empresa_id aqui
    empresa_id = int(sys.argv[1]) if len(sys.argv) > 1 else 1

    importar_veiculos(empresa_id)

    print()
    print("=" * 70)
    print("Importação concluída!")
    print("=" * 70)

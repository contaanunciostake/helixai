"""
Script para importar veículos do cars.sql para o banco VendeAI
"""

import sys
from pathlib import Path
import re

# Adicionar pasta raiz ao path
sys.path.append(str(Path(__file__).parent.parent))

from database.models import DatabaseManager, Veiculo

def extrair_dados_sql(arquivo_sql):
    """Extrai dados dos INSERTs do arquivo SQL"""
    veiculos = []

    with open(arquivo_sql, 'r', encoding='utf-8') as f:
        conteudo = f.read()

    # Encontrar todos os INSERTs
    pattern = r"INSERT INTO `cars`.*?VALUES\s*\((.*?)\)(?:,|\;)"

    matches = re.findall(pattern, conteudo, re.DOTALL)

    for match in matches:
        # Dividir valores
        valores = []
        valor_atual = ""
        dentro_aspas = False

        for char in match:
            if char == "'" and (not valor_atual or valor_atual[-1] != '\\'):
                dentro_aspas = not dentro_aspas
                valor_atual += char
            elif char == ',' and not dentro_aspas:
                valores.append(valor_atual.strip().strip("'"))
                valor_atual = ""
            else:
                valor_atual += char

        # Adicionar último valor
        if valor_atual:
            valores.append(valor_atual.strip().strip("'"))

        # Parsear valores conforme estrutura da tabela cars
        if len(valores) >= 12:
            try:
                veiculo = {
                    'id': int(valores[0]) if valores[0] != 'NULL' else None,
                    'imagem_principal': valores[1] if valores[1] != 'NULL' else None,
                    'vendor_id': int(valores[2]) if valores[2] != 'NULL' and valores[2] != '0' else None,
                    'preco': float(valores[3]) if valores[3] != 'NULL' else 0.0,
                    'preco_anterior': float(valores[4]) if valores[4] != 'NULL' else None,
                    'speed': valores[5] if valores[5] != 'NULL' else None,
                    'ano_modelo': valores[6] if valores[6] != 'NULL' else None,
                    'quilometragem': valores[7] if valores[7] != 'NULL' else '0',
                    'destaque': valores[8] == '1' if valores[8] != 'NULL' else False,
                    'oferta_especial': valores[9] == '1' if valores[9] != 'NULL' else False,
                    'disponivel': valores[11] == '1' if len(valores) > 11 else True,
                }
                veiculos.append(veiculo)
            except Exception as e:
                print(f"Erro ao parsear veículo: {e}")
                print(f"Valores: {valores}")

    return veiculos


def importar_veiculos(empresa_id=2):
    """Importa veículos para o banco VendeAI"""

    # Caminho do arquivo SQL
    arquivo_sql = Path(__file__).parent.parent / 'bot_engine' / 'cars.sql'

    if not arquivo_sql.exists():
        print(f"❌ Arquivo não encontrado: {arquivo_sql}")
        return

    print(f"\n📁 Lendo arquivo: {arquivo_sql}")

    # Extrair dados
    veiculos_data = extrair_dados_sql(arquivo_sql)

    print(f"✅ {len(veiculos_data)} veículos encontrados no SQL\n")

    # Conectar banco
    db = DatabaseManager('sqlite:///vendeai.db')
    db.create_all()  # Garantir que tabela veiculos existe

    session = db.get_session()

    try:
        # Verificar quantos já existem
        total_existentes = session.query(Veiculo).count()
        print(f"ℹ️  Veículos já cadastrados: {total_existentes}")

        # Limpar tabela (opcional - comente se não quiser limpar)
        if total_existentes > 0:
            resposta = input("\n⚠️  Deseja limpar os veículos existentes? (s/n): ")
            if resposta.lower() == 's':
                session.query(Veiculo).delete()
                session.commit()
                print("✅ Veículos anteriores removidos")

        # Importar novos
        importados = 0
        erros = 0

        for veiculo_data in veiculos_data:
            try:
                veiculo = Veiculo(
                    empresa_id=empresa_id,
                    imagem_principal=veiculo_data.get('imagem_principal'),
                    preco=veiculo_data.get('preco', 0.0),
                    preco_anterior=veiculo_data.get('preco_anterior'),
                    ano_modelo=veiculo_data.get('ano_modelo'),
                    quilometragem=veiculo_data.get('quilometragem', '0'),
                    destaque=veiculo_data.get('destaque', False),
                    oferta_especial=veiculo_data.get('oferta_especial', False),
                    disponivel=veiculo_data.get('disponivel', True),
                    # Campos que precisam de parsing adicional (podem ser NULL no SQL original)
                    marca='A definir',  # Precisa ser extraído do nome/descrição
                    modelo='A definir',
                )

                session.add(veiculo)
                importados += 1

                if importados % 10 == 0:
                    print(f"   Importando... {importados} veículos")

            except Exception as e:
                erros += 1
                print(f"❌ Erro ao importar veículo ID {veiculo_data.get('id')}: {e}")

        session.commit()

        print(f"\n" + "="*70)
        print(f"✅ IMPORTAÇÃO CONCLUÍDA")
        print(f"="*70)
        print(f"   Total importado: {importados}")
        print(f"   Erros: {erros}")
        print(f"="*70 + "\n")

    except Exception as e:
        session.rollback()
        print(f"\n❌ Erro durante importação: {e}")
    finally:
        session.close()


if __name__ == '__main__':
    print("\n" + "="*70)
    print("IMPORTADOR DE VEÍCULOS - VendeAI")
    print("="*70 + "\n")

    # ID da empresa (padrão: 2 = Empresa Demonstração)
    empresa_id = 2

    if len(sys.argv) > 1:
        empresa_id = int(sys.argv[1])

    print(f"Importando para Empresa ID: {empresa_id}\n")

    importar_veiculos(empresa_id)

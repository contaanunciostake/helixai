"""
Script para definir nicho da empresa
"""
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from database.models import Empresa, NichoEmpresa
from backend import db_manager

# Conectar ao banco
session = db_manager.get_session()

try:
    # Buscar empresa ID 1
    empresa = session.query(Empresa).filter_by(id=1).first()

    if empresa:
        print(f'[OK] Empresa encontrada: {empresa.nome}')
        print(f'[INFO] Nicho atual: {empresa.nicho.value if empresa.nicho else "Nao definido"}')

        # Definir nicho como veículos
        empresa.nicho = NichoEmpresa.VEICULOS
        session.commit()

        print(f'[OK] Nicho atualizado para: {empresa.nicho.value}')
        print(f'[INFO] Mensagens serao roteadas para AIra Auto')
    else:
        print('[ERRO] Empresa ID 1 nao encontrada')

except Exception as e:
    print(f'[ERRO] Erro: {e}')
    import traceback
    traceback.print_exc()
    session.rollback()
finally:
    session.close()

print('\n[OK] Script concluido!')

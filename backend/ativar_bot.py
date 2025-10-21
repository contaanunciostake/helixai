"""
Script para ativar bot da empresa
"""
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from database.models import Empresa
from backend import db_manager

# Conectar ao banco
session = db_manager.get_session()

try:
    # Buscar empresa ID 1
    empresa = session.query(Empresa).filter_by(id=1).first()

    if empresa:
        print(f'[OK] Empresa encontrada: {empresa.nome}')
        print(f'[INFO] Bot ativo atual: {empresa.bot_ativo}')

        # Ativar bot
        empresa.bot_ativo = True
        session.commit()

        print(f'[OK] Bot ativado: {empresa.bot_ativo}')
        print(f'[INFO] Bot agora processará mensagens recebidas')
    else:
        print('[ERRO] Empresa ID 1 não encontrada')

except Exception as e:
    print(f'[ERRO] Erro: {e}')
    import traceback
    traceback.print_exc()
    session.rollback()
finally:
    session.close()

print('\n[OK] Script concluído!')

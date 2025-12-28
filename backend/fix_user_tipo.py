"""
Script para corrigir tipo de usuários que foram criados com 'cliente'
"""
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

from database.models import DatabaseManager
from sqlalchemy import text

db_manager = DatabaseManager('sqlite:///vendeai.db')
session = db_manager.get_session()

try:
    # Atualizar usuários com tipo 'cliente' para 'admin_empresa'
    update_query = text("""
        UPDATE usuarios
        SET tipo = 'admin_empresa'
        WHERE tipo = 'cliente'
    """)

    result = session.execute(update_query)
    session.commit()

    print(f"[OK] {result.rowcount} usuario(s) corrigido(s) de 'cliente' para 'admin_empresa'")

    # Verificar se há outros tipos inválidos
    check_query = text("""
        SELECT DISTINCT tipo FROM usuarios
    """)

    tipos = session.execute(check_query).fetchall()
    print(f"\nTipos de usuario no banco:")
    for tipo in tipos:
        print(f"  - {tipo[0]}")

except Exception as e:
    session.rollback()
    print(f"[ERRO] Erro: {e}")
    import traceback
    traceback.print_exc()
finally:
    session.close()

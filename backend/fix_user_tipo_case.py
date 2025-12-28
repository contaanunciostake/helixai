"""
Script para padronizar os tipos de usuário para lowercase conforme o enum
"""
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

from database.models import DatabaseManager
from sqlalchemy import text

db_manager = DatabaseManager('sqlite:///vendeai.db')
session = db_manager.get_session()

try:
    # Atualizar SUPER_ADMIN para super_admin
    update1 = text("UPDATE usuarios SET tipo = 'super_admin' WHERE tipo = 'SUPER_ADMIN'")
    result1 = session.execute(update1)

    # Atualizar ADMIN_EMPRESA para admin_empresa
    update2 = text("UPDATE usuarios SET tipo = 'admin_empresa' WHERE tipo = 'ADMIN_EMPRESA'")
    result2 = session.execute(update2)

    # Atualizar USUARIO para usuario
    update3 = text("UPDATE usuarios SET tipo = 'usuario' WHERE tipo = 'USUARIO'")
    result3 = session.execute(update3)

    # Atualizar VISUALIZADOR para visualizador
    update4 = text("UPDATE usuarios SET tipo = 'visualizador' WHERE tipo = 'VISUALIZADOR'")
    result4 = session.execute(update4)

    session.commit()

    total = result1.rowcount + result2.rowcount + result3.rowcount + result4.rowcount
    print(f"[OK] {total} usuario(s) padronizado(s) para lowercase")

    # Verificar resultado
    check_query = text("SELECT DISTINCT tipo FROM usuarios")
    tipos = session.execute(check_query).fetchall()

    print(f"\nTipos de usuario no banco (apos correcao):")
    for tipo in tipos:
        print(f"  - {tipo[0]}")

except Exception as e:
    session.rollback()
    print(f"[ERRO] Erro: {e}")
    import traceback
    traceback.print_exc()
finally:
    session.close()

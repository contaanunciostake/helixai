"""
Debug SQLAlchemy enum loading
"""
from database.models import TipoUsuario, Usuario, DatabaseManager
from sqlalchemy import inspect

print("=" * 80)
print("DEBUG SQLALCHEMY ENUM")
print("=" * 80)
print()

# 1. Verificar enum Python
print("1. ENUM PYTHON (TipoUsuario):")
print("-" * 80)
for e in TipoUsuario:
    print(f"   {e.name:20s} = '{e.value}' (len: {len(e.value)})")
print()

# 2. Verificar definição da coluna no SQLAlchemy
print("2. DEFINICAO DA COLUNA NO SQLALCHEMY:")
print("-" * 80)
tipo_column = Usuario.__table__.columns['tipo']
print(f"   Type: {tipo_column.type}")
print(f"   Type class: {tipo_column.type.__class__.__name__}")

if hasattr(tipo_column.type, 'enums'):
    print(f"   Enums: {tipo_column.type.enums}")

if hasattr(tipo_column.type, '_valid_lookup'):
    print(f"   Valid lookup: {tipo_column.type._valid_lookup}")

if hasattr(tipo_column.type, '_object_lookup'):
    print(f"   Object lookup keys: {list(tipo_column.type._object_lookup.keys())}")
    print()
    print("   DETALHE DO OBJECT LOOKUP:")
    for key, value in tipo_column.type._object_lookup.items():
        print(f"      '{key}' (len: {len(key)}) -> {value}")

print()

# 3. Tentar carregar um usuario
print("3. TESTE DE CARREGAMENTO:")
print("-" * 80)
try:
    db = DatabaseManager('sqlite:///vendeai.db')
    session = db.get_session()

    # Buscar direto do banco
    import sqlite3
    conn = sqlite3.connect('vendeai.db')
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, tipo FROM usuarios WHERE email='demo@vendeai.com'")
    row = cursor.fetchone()

    print(f"   Valor RAW do banco: '{row[2]}' (len: {len(row[2])})")
    print()

    # Tentar carregar via SQLAlchemy
    print("   Tentando carregar via SQLAlchemy...")
    usuario = session.query(Usuario).filter_by(email='demo@vendeai.com').first()

    if usuario:
        print(f"   SUCESSO! Usuario: {usuario.nome}")
        print(f"   Tipo: {usuario.tipo}")

    session.close()
    conn.close()

except Exception as e:
    print(f"   ERRO: {e}")
    import traceback
    traceback.print_exc()

print()
print("=" * 80)

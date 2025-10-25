import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent / 'backend'))

from backend import db_manager
from database.models import Empresa

session = db_manager.get_session()
try:
    # Try .get() method
    empresa_get = session.query(Empresa).get(22)
    print(f"Using .get(22): {empresa_get}")
    if empresa_get:
        print(f"  ID: {empresa_get.id}, Nome: {empresa_get.nome}")

    # Try .filter_by() method
    empresa_filter = session.query(Empresa).filter_by(id=22).first()
    print(f"\nUsing .filter_by(id=22).first(): {empresa_filter}")
    if empresa_filter:
        print(f"  ID: {empresa_filter.id}, Nome: {empresa_filter.nome}")

    # List all empresas
    print(f"\nAll empresas:")
    all_empresas = session.query(Empresa).all()
    for emp in all_empresas:
        print(f"  ID: {emp.id}, Nome: {emp.nome}")
finally:
    session.close()

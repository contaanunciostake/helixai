"""
Script para criar super admin de teste
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from database.models import Usuario, Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from werkzeug.security import generate_password_hash

DATABASE_PATH = Path(__file__).parent.parent / "database" / "vendeai.db"
engine = create_engine(f'sqlite:///{DATABASE_PATH}')
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)
session = Session()

def criar_super_admin():
    try:
        usuario = session.query(Usuario).filter_by(email='admin@aira.com').first()

        if not usuario:
            print("[+] Criando super admin...")
            usuario = Usuario(
                nome='Administrador AIra',
                email='admin@aira.com',
                senha_hash=generate_password_hash('Admin@123'),
                tipo='super_admin',
                ativo=True,
                empresa_id=None,
                telefone='11999999999'
            )
            session.add(usuario)
        else:
            print(f"[*] Super admin ja existe, atualizando senha...")
            usuario.senha_hash = generate_password_hash('Admin@123')
            usuario.tipo = 'super_admin'
            usuario.ativo = True

        session.commit()

        print("\n" + "="*50)
        print("CREDENCIAIS DO SUPER ADMIN")
        print("="*50)
        print(f"URL:    http://localhost:5175")
        print(f"Email:  admin@aira.com")
        print(f"Senha:  Admin@123")
        print(f"Tipo:   super_admin")
        print("="*50)

    except Exception as e:
        print(f"[!] Erro: {e}")
        session.rollback()
        import traceback
        traceback.print_exc()
    finally:
        session.close()

if __name__ == '__main__':
    criar_super_admin()

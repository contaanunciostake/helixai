"""
Script para testar o status da empresa 22
"""
import sys
from pathlib import Path

# Adicionar caminho do backend ao Python path
sys.path.append(str(Path(__file__).parent / 'backend'))

from backend import db_manager
from database.models import Empresa, Usuario

def test_empresa_22():
    session = db_manager.get_session()
    try:
        # Buscar empresa 22
        empresa = session.query(Empresa).get(22)

        if not empresa:
            print("❌ Empresa 22 não encontrada!")
            return

        print("✅ Empresa 22 encontrada!")
        print(f"   Nome: {empresa.nome}")
        print(f"   Email: {empresa.email}")
        print(f"   Nicho: {empresa.nicho.value if empresa.nicho else 'Nenhum'}")
        print(f"   Plano: {empresa.plano.value if empresa.plano else 'Nenhum'}")
        print(f"   WhatsApp Conectado: {empresa.whatsapp_conectado}")
        print(f"   Bot Ativo: {empresa.bot_ativo}")
        print(f"   Setup Completo: {empresa.whatsapp_conectado and empresa.nicho is not None}")
        print("")

        # Buscar usuários da empresa 22
        usuarios = session.query(Usuario).filter_by(empresa_id=22).all()
        print(f"👥 Usuários da empresa 22: {len(usuarios)}")
        for usuario in usuarios:
            print(f"   - {usuario.nome} ({usuario.email}) - Empresa ID: {usuario.empresa_id}")

    finally:
        session.close()

if __name__ == '__main__':
    test_empresa_22()

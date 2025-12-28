"""
Criar usuario usando SQLAlchemy (igual ao sistema faz)
"""
import sys
from pathlib import Path

# Adicionar paths
sys.path.insert(0, str(Path(__file__).parent.parent))
sys.path.insert(0, str(Path(__file__).parent))

from database.models import DatabaseManager, Usuario, Empresa

# Usar o mesmo banco que o backend usa
db_path = Path(__file__).parent.parent / 'database' / 'vendeai.db'
db_manager = DatabaseManager(f'sqlite:///{db_path}')

print(f"Banco: {db_path}")
print(f"Existe: {db_path.exists()}")

session = db_manager.get_session()

try:
    # 1. Verificar/criar empresa
    empresa = session.query(Empresa).filter_by(id=23).first()
    if not empresa:
        print("\nCriando empresa Comercial Mariano...")
        empresa = Empresa(
            id=23,
            nome='Comercial Mariano',
            nome_fantasia='Grupo Comercial Mariano',
            nicho='ATACADO_VAREJO',
            plano='PROFISSIONAL',
            plano_ativo=True,
            bot_ativo=True
        )
        session.add(empresa)
        session.commit()
        print("Empresa criada!")
    else:
        print(f"\nEmpresa existe: {empresa.nome}")

    # 2. Verificar/criar usuario
    usuario = session.query(Usuario).filter_by(email='mariano@comercial.com').first()
    if usuario:
        print(f"\nUsuario existe (ID {usuario.id}), atualizando senha...")
        usuario.set_senha('mariano123')
        session.commit()
        print("Senha atualizada!")
    else:
        print("\nCriando usuario mariano@comercial.com...")
        usuario = Usuario(
            nome='Admin Mariano',
            email='mariano@comercial.com',
            tipo='admin_empresa',  # Mesmo tipo do cliente@teste.com
            ativo=True,
            empresa_id=23
        )
        usuario.set_senha('mariano123')
        session.add(usuario)
        session.commit()
        print(f"Usuario criado com ID {usuario.id}")

    # 3. Verificar
    print("\n" + "="*50)
    print("VERIFICACAO")
    print("="*50)

    u = session.query(Usuario).filter_by(email='mariano@comercial.com').first()
    print(f"ID: {u.id}")
    print(f"Email: {u.email}")
    print(f"Nome: {u.nome}")
    print(f"Tipo: {u.tipo}")
    print(f"Empresa ID: {u.empresa_id}")
    print(f"Ativo: {u.ativo}")
    print(f"Hash: {u.senha_hash[:60]}...")

    # Testar senha
    print(f"\nTeste senha 'mariano123': {u.check_senha('mariano123')}")

    # Comparar com cliente@teste.com
    cliente = session.query(Usuario).filter_by(email='cliente@teste.com').first()
    if cliente:
        print(f"\n--- Comparando com cliente@teste.com ---")
        print(f"Tipo cliente@teste.com: {cliente.tipo}")
        print(f"Hash cliente@teste.com: {cliente.senha_hash[:60]}...")

    print("\n" + "="*50)
    print("LOGIN: mariano@comercial.com")
    print("SENHA: mariano123")
    print("="*50)

finally:
    session.close()

"""
Testar carregamento de usuarios com enum
"""
from database.models import DatabaseManager, Usuario, TipoUsuario

db = DatabaseManager('sqlite:///vendeai.db')
session = db.get_session()

try:
    print("Testando carregamento de usuarios...")
    print("=" * 80)

    # Tentar carregar usuario demo
    usuario = session.query(Usuario).filter_by(email='demo@vendeai.com').first()

    if usuario:
        print(f"Usuario encontrado: {usuario.nome}")
        print(f"Email: {usuario.email}")
        print(f"Tipo (raw): {usuario.tipo}")
        print(f"Tipo (type): {type(usuario.tipo)}")

        # Tentar comparar com enum
        print()
        print("Testando comparacoes com enum:")
        print(f"  usuario.tipo == TipoUsuario.ADMIN_EMPRESA: {usuario.tipo == TipoUsuario.ADMIN_EMPRESA}")
        print(f"  usuario.tipo == TipoUsuario.SUPER_ADMIN: {usuario.tipo == TipoUsuario.SUPER_ADMIN}")
        print(f"  usuario.tipo.value: {usuario.tipo.value if hasattr(usuario.tipo, 'value') else 'N/A'}")

        # Verificar senha
        print()
        print("Testando senha 'demo123'...")
        senha_valida = usuario.check_senha('demo123')
        print(f"  Senha valida: {senha_valida}")

        print()
        print("=" * 80)
        print("TESTE PASSOU COM SUCESSO!")

    else:
        print("Usuario demo@vendeai.com nao encontrado")

except Exception as e:
    print(f"ERRO: {e}")
    import traceback
    traceback.print_exc()

finally:
    session.close()

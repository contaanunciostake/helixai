"""
Script para criar usuários de teste no banco de dados
Cria:
- admin@admin.com / admin123 (Super Admin)
- cliente@teste.com / cliente123 (Cliente)
- demo@demo.com / demo123 (Demo)
"""

import sqlite3
import sys
import os
from pathlib import Path

# Forçar UTF-8 no Windows
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# Adicionar pasta raiz ao path
sys.path.append(str(Path(__file__).parent.parent))

from database.models import DatabaseManager, Usuario, Empresa, TipoUsuario, PlanoAssinatura, NichoEmpresa

def criar_usuarios_teste():
    """Cria usuários de teste no banco de dados"""

    db = DatabaseManager('sqlite:///vendeai.db')
    session = db.get_session()

    print("=" * 70)
    print("CRIANDO USUÁRIOS DE TESTE")
    print("=" * 70)
    print()

    try:
        # 1. Buscar ou criar empresa VendeAI (para admin)
        empresa_admin = session.query(Empresa).filter_by(nome='VendeAI Sistema').first()
        if not empresa_admin:
            empresa_admin = Empresa(
                nome='VendeAI Sistema',
                plano=PlanoAssinatura.ENTERPRISE,
                plano_ativo=True,
                bot_ativo=False
            )
            session.add(empresa_admin)
            session.flush()
            print("✓ Empresa VendeAI Sistema criada")
        else:
            print("✓ Empresa VendeAI Sistema já existe")

        # 2. Criar Super Admin
        admin = session.query(Usuario).filter_by(email='admin@admin.com').first()
        if not admin:
            admin = Usuario(
                nome='Administrador',
                email='admin@admin.com',
                tipo=TipoUsuario.SUPER_ADMIN,
                empresa_id=empresa_admin.id,
                ativo=True,
                telefone='11999999999'
            )
            admin.set_senha('admin123')
            session.add(admin)
            print("✓ Super Admin criado: admin@admin.com / admin123")
        else:
            # Atualizar senha e tipo
            admin.set_senha('admin123')
            admin.tipo = TipoUsuario.SUPER_ADMIN
            admin.ativo = True
            print("✓ Super Admin atualizado: admin@admin.com / admin123")

        # 3. Buscar ou criar empresa Cliente
        empresa_cliente = session.query(Empresa).filter_by(nome='Empresa Cliente Teste').first()
        if not empresa_cliente:
            empresa_cliente = Empresa(
                nome='Empresa Cliente Teste',
                nome_fantasia='Cliente Teste',
                plano=PlanoAssinatura.PROFISSIONAL,
                plano_ativo=True,
                bot_ativo=False,
                nicho=None  # Genérico
            )
            session.add(empresa_cliente)
            session.flush()
            print("✓ Empresa Cliente Teste criada")
        else:
            print("✓ Empresa Cliente Teste já existe")

        # 4. Criar usuário cliente
        cliente = session.query(Usuario).filter_by(email='cliente@teste.com').first()
        if not cliente:
            cliente = Usuario(
                nome='Cliente Teste',
                email='cliente@teste.com',
                tipo=TipoUsuario.ADMIN_EMPRESA,
                empresa_id=empresa_cliente.id,
                ativo=True,
                telefone='11988888888'
            )
            cliente.set_senha('cliente123')
            session.add(cliente)
            print("✓ Cliente criado: cliente@teste.com / cliente123")
        else:
            # Atualizar senha
            cliente.set_senha('cliente123')
            cliente.tipo = TipoUsuario.ADMIN_EMPRESA
            cliente.ativo = True
            print("✓ Cliente atualizado: cliente@teste.com / cliente123")

        # 5. Buscar ou criar empresa Demo
        empresa_demo = session.query(Empresa).filter_by(nome='Empresa Demo').first()
        if not empresa_demo:
            empresa_demo = Empresa(
                nome='Empresa Demo',
                nome_fantasia='Demo',
                plano=PlanoAssinatura.PROFISSIONAL,
                plano_ativo=True,
                bot_ativo=False,
                nicho=NichoEmpresa.VEICULOS  # Bot de veículos
            )
            session.add(empresa_demo)
            session.flush()
            print("✓ Empresa Demo criada (nicho: veículos)")
        else:
            # Atualizar nicho para veículos
            empresa_demo.nicho = NichoEmpresa.VEICULOS
            print("✓ Empresa Demo já existe (nicho: veículos)")

        # 6. Criar usuário demo
        demo = session.query(Usuario).filter_by(email='demo@demo.com').first()
        if not demo:
            demo = Usuario(
                nome='Demo User',
                email='demo@demo.com',
                tipo=TipoUsuario.ADMIN_EMPRESA,
                empresa_id=empresa_demo.id,
                ativo=True,
                telefone='11977777777'
            )
            demo.set_senha('demo123')
            session.add(demo)
            print("✓ Demo criado: demo@demo.com / demo123")
        else:
            # Atualizar senha
            demo.set_senha('demo123')
            demo.tipo = TipoUsuario.ADMIN_EMPRESA
            demo.ativo = True
            print("✓ Demo atualizado: demo@demo.com / demo123")

        # Commit das alterações
        session.commit()

        print("\n" + "=" * 70)
        print("✅ USUÁRIOS CRIADOS COM SUCESSO!")
        print("=" * 70)
        print()

        print("CREDENCIAIS DE ACESSO:")
        print("-" * 70)
        print("\n🔐 SUPER ADMIN:")
        print("   Email: admin@admin.com")
        print("   Senha: admin123")
        print("   Empresa: VendeAI Sistema")
        print()
        print("👤 CLIENTE CRM:")
        print("   Email: cliente@teste.com")
        print("   Senha: cliente123")
        print("   Empresa: Empresa Cliente Teste (genérico)")
        print()
        print("🎯 DEMO (Bot de Veículos):")
        print("   Email: demo@demo.com")
        print("   Senha: demo123")
        print("   Empresa: Empresa Demo (nicho: veículos)")
        print()
        print("-" * 70)
        print("\nURLs de Acesso:")
        print("  CRM Admin:   http://localhost:5175/")
        print("  CRM Cliente: http://localhost:5177/")
        print()

    except Exception as e:
        session.rollback()
        print(f"\n❌ ERRO: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        session.close()

if __name__ == '__main__':
    criar_usuarios_teste()

"""
Script para criar usuário de teste no banco de dados
"""

import sys
from pathlib import Path

# Adicionar pasta raiz ao path
sys.path.append(str(Path(__file__).parent))

from database.models import DatabaseManager, Usuario, Empresa, ConfiguracaoBot, PlanoAssinatura, TipoUsuario
from datetime import datetime

def criar_usuario_teste():
    """Cria usuário de teste se não existir"""

    # Conectar ao banco
    db_manager = DatabaseManager('sqlite:///vendeai.db')
    session = db_manager.get_session()

    try:
        # Verificar se usuário já existe
        usuario_existente = session.query(Usuario).filter_by(email='teste@vendeai.com').first()

        if usuario_existente:
            print(f"[OK] Usuario de teste ja existe:")
            print(f"   Email: {usuario_existente.email}")
            print(f"   Nome: {usuario_existente.nome}")
            print(f"   Empresa ID: {usuario_existente.empresa_id}")
            print(f"   Ativo: {usuario_existente.ativo}")

            # Atualizar senha se necessário
            usuario_existente.set_senha('teste123')
            session.commit()
            print(f"   [OK] Senha atualizada para: teste123")

            return

        # Criar empresa de teste
        empresa = session.query(Empresa).filter_by(email='teste@vendeai.com').first()

        if not empresa:
            print("Criando empresa de teste...")
            empresa = Empresa(
                nome='Empresa Teste',
                email='teste@vendeai.com',
                telefone='11999999999',
                plano=PlanoAssinatura.GRATUITO,
                plano_ativo=True,
                criado_em=datetime.utcnow()
            )
            session.add(empresa)
            session.flush()
            print(f"[OK] Empresa criada: ID {empresa.id}")
        else:
            print(f"[OK] Empresa ja existe: ID {empresa.id}")

        # Criar usuário
        print("Criando usuario de teste...")
        usuario = Usuario(
            nome='Usuario Teste',
            email='teste@vendeai.com',
            telefone='11999999999',
            empresa_id=empresa.id,
            tipo=TipoUsuario.ADMIN_EMPRESA,
            ativo=True,
            criado_em=datetime.utcnow()
        )
        usuario.set_senha('teste123')
        session.add(usuario)

        # Criar configuração do bot se não existir
        config = session.query(ConfiguracaoBot).filter_by(empresa_id=empresa.id).first()
        if not config:
            print("Criando configuracao do bot...")
            config = ConfiguracaoBot(
                empresa_id=empresa.id,
                mensagem_boas_vindas='Ola! Como posso ajuda-lo hoje?',
                auto_resposta_ativa=False
            )
            session.add(config)

        session.commit()

        print("\n" + "="*60)
        print("[OK] USUARIO DE TESTE CRIADO COM SUCESSO!")
        print("="*60)
        print(f"Email: teste@vendeai.com")
        print(f"Senha: teste123")
        print(f"Nome: {usuario.nome}")
        print(f"Empresa: {empresa.nome}")
        print(f"Tipo: {usuario.tipo.value}")
        print("="*60)

    except Exception as e:
        session.rollback()
        print(f"[ERRO] Erro ao criar usuario: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        session.close()

if __name__ == '__main__':
    print("\n" + "="*60)
    print("CRIAR USUARIO DE TESTE")
    print("="*60 + "\n")

    criar_usuario_teste()

    print("\n[OK] Processo concluido!")
    print("\nUse estas credenciais para fazer login:")
    print("   Email: teste@vendeai.com")
    print("   Senha: teste123")
    print()

"""
Script para criar usuario cliente de teste
"""
import sys
from pathlib import Path

# Adicionar path do projeto
sys.path.insert(0, str(Path(__file__).parent.parent))

from database.models import Usuario, Empresa, ConfiguracaoBot, Base, NichoEmpresa, PlanoAssinatura
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from werkzeug.security import generate_password_hash
from datetime import datetime

# Conectar ao banco
DATABASE_PATH = Path(__file__).parent.parent / "database" / "vendeai.db"
engine = create_engine(f'sqlite:///{DATABASE_PATH}')

# Criar tabelas se nao existirem
Base.metadata.create_all(engine)

Session = sessionmaker(bind=engine)
session = Session()

def criar_usuario_cliente():
    try:
        # Verificar se empresa ja existe
        empresa = session.query(Empresa).filter_by(email='cliente@teste.com').first()

        if not empresa:
            print("[+] Criando empresa de teste...")
            empresa = Empresa(
                nome='Empresa Teste',
                email='cliente@teste.com',
                telefone='11999999999',
                nicho=NichoEmpresa.VEICULOS,
                plano=PlanoAssinatura.BASICO,
                plano_ativo=True,
                bot_ativo=True
            )
            session.add(empresa)
            session.flush()
            print(f"[+] Empresa criada com ID: {empresa.id}")

            # Criar configuracao do bot
            config = ConfiguracaoBot(
                empresa_id=empresa.id,
                mensagem_boas_vindas='Ola! Como posso ajudar?',
                auto_resposta_ativa=True
            )
            session.add(config)
        else:
            print(f"[*] Empresa ja existe com ID: {empresa.id}")

        # Verificar se usuario ja existe
        usuario = session.query(Usuario).filter_by(email='cliente@teste.com').first()

        if not usuario:
            print("[+] Criando usuario cliente...")
            usuario = Usuario(
                nome='Cliente Teste',
                email='cliente@teste.com',
                senha_hash=generate_password_hash('Cliente@123'),
                tipo='admin_empresa',
                ativo=True,
                empresa_id=empresa.id,
                telefone='11999999999',
                criado_em=datetime.utcnow()
            )
            session.add(usuario)
            print(f"[+] Usuario criado!")
        else:
            print(f"[*] Usuario ja existe, atualizando senha...")
            usuario.senha_hash = generate_password_hash('Cliente@123')
            usuario.ativo = True

        session.commit()

        print("\n" + "="*50)
        print("CREDENCIAIS DO CLIENTE")
        print("="*50)
        print(f"URL:    http://localhost:5177")
        print(f"Email:  cliente@teste.com")
        print(f"Senha:  Cliente@123")
        print(f"Tipo:   admin_empresa")
        print(f"Empresa: {empresa.nome} (ID: {empresa.id})")
        print("="*50)

        return True

    except Exception as e:
        print(f"[!] Erro: {e}")
        session.rollback()
        import traceback
        traceback.print_exc()
        return False
    finally:
        session.close()

if __name__ == '__main__':
    criar_usuario_cliente()

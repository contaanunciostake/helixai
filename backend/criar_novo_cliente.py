"""
Script para criar novo cliente no sistema AIra CRM
"""
import sys
from pathlib import Path

# Adiciona o diretório raiz ao path
sys.path.insert(0, str(Path(__file__).parent.parent))

from database.models import Base, Usuario, Empresa, NichoEmpresa, PlanoAssinatura
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta

# Configuração do banco SQLite - USAR vendeai.db (banco principal do backend)
DB_PATH = Path(__file__).parent.parent / 'database' / 'vendeai.db'
engine = create_engine(f'sqlite:///{DB_PATH}', echo=False)
Session = sessionmaker(bind=engine)

# Criar tabelas se nao existirem
Base.metadata.create_all(engine)

def criar_cliente(nome_empresa, nome_usuario, email, senha, nicho='atacado_varejo'):
    """Cria uma nova empresa e usuário admin"""
    session = Session()

    try:
        # Verificar se email já existe
        usuario_existente = session.query(Usuario).filter_by(email=email).first()
        if usuario_existente:
            print(f"[ERRO] Email {email} ja esta cadastrado!")
            return None, None

        # Criar empresa
        empresa = Empresa(
            nome=nome_empresa,
            nome_fantasia=nome_empresa,
            nicho=NichoEmpresa.ATACADO_VAREJO if nicho == 'atacado_varejo' else NichoEmpresa.VEICULOS,
            plano=PlanoAssinatura.PROFISSIONAL,
            plano_ativo=True,
            data_inicio_plano=datetime.utcnow(),
            data_fim_plano=datetime.utcnow() + timedelta(days=365),
            limite_leads=1000,
            limite_disparos_mes=5000,
            limite_usuarios=10,
            bot_ativo=False,
            whatsapp_conectado=False
        )
        session.add(empresa)
        session.flush()  # Obtém o ID da empresa

        print(f"[OK] Empresa criada: {empresa.nome} (ID: {empresa.id})")

        # Criar usuário admin da empresa
        usuario = Usuario(
            nome=nome_usuario,
            email=email,
            tipo='admin_empresa',
            ativo=True,
            empresa_id=empresa.id,
            criado_em=datetime.utcnow()
        )
        usuario.set_senha(senha)
        session.add(usuario)

        session.commit()

        print(f"[OK] Usuario criado: {usuario.nome} (ID: {usuario.id})")
        print(f"    Email: {email}")
        print(f"    Empresa ID: {empresa.id}")

        return empresa, usuario

    except Exception as e:
        session.rollback()
        print(f"[ERRO] {str(e)}")
        return None, None
    finally:
        session.close()


if __name__ == '__main__':
    print("=" * 50)
    print("   CRIANDO NOVO CLIENTE - AIra CRM")
    print("=" * 50)

    # Dados do novo cliente
    NOME_EMPRESA = "Grupo Comercial Mariano"
    NOME_USUARIO = "Admin Mariano"
    EMAIL = "admin@mariano.com.br"
    SENHA = "Mariano@2024"
    NICHO = "atacado_varejo"

    empresa, usuario = criar_cliente(
        nome_empresa=NOME_EMPRESA,
        nome_usuario=NOME_USUARIO,
        email=EMAIL,
        senha=SENHA,
        nicho=NICHO
    )

    if empresa and usuario:
        print("\n" + "=" * 50)
        print("   CREDENCIAIS DE ACESSO")
        print("=" * 50)
        print(f"   Email: {EMAIL}")
        print(f"   Senha: {SENHA}")
        print(f"   Empresa: {NOME_EMPRESA}")
        print(f"   Nicho: {NICHO}")
        print("=" * 50)

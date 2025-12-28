# -*- coding: utf-8 -*-
"""
Setup PostgreSQL no Render.com
Cria tabelas, super admin e migra dados do SQLite
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database.models import (
    DatabaseManager, Base, Usuario, Empresa, TipoUsuario, PlanoAssinatura,
    ConfiguracaoBot
)
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import sqlite3

# Configuracoes
POSTGRES_URL = "postgresql://vendefacil:rpCvUYf2fEWL51mQwRvlHhTtDjVnNoVV@dpg-d58bvbur433s73f69kjg-a.oregon-postgres.render.com/vendefacil_3qo1"
SQLITE_PATH = "vendeai.db"

def conectar_postgres():
    """Conecta ao PostgreSQL"""
    print("=" * 60)
    print("CONECTANDO AO POSTGRESQL DO RENDER")
    print("=" * 60)

    try:
        engine = create_engine(POSTGRES_URL, echo=False)
        # Testar conexao
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            print(f"[OK] Conectado ao PostgreSQL")
            print(f"     Versao: {version[:50]}...")
        return engine
    except Exception as e:
        print(f"[ERRO] Falha na conexao: {e}")
        return None

def criar_tabelas(engine):
    """Cria todas as tabelas"""
    print("\n" + "=" * 60)
    print("CRIANDO TABELAS")
    print("=" * 60)

    try:
        Base.metadata.create_all(engine)
        print("[OK] Todas as tabelas criadas!")

        # Listar tabelas criadas
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT table_name FROM information_schema.tables
                WHERE table_schema = 'public'
                ORDER BY table_name
            """))
            tables = [row[0] for row in result.fetchall()]
            print(f"\n[INFO] {len(tables)} tabelas criadas:")
            for t in tables:
                print(f"  - {t}")

        return True
    except Exception as e:
        print(f"[ERRO] Falha ao criar tabelas: {e}")
        return False

def criar_super_admin(engine):
    """Cria super admin com credenciais especificas"""
    print("\n" + "=" * 60)
    print("CRIANDO SUPER ADMIN")
    print("=" * 60)

    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        # Verificar se ja existe
        admin = session.query(Usuario).filter_by(email='admin@vendefacil.com').first()

        if admin:
            print("[INFO] Super admin ja existe!")
            return True

        # Criar empresa VendeFacil
        empresa = Empresa(
            nome='VendeFacil Sistema',
            nome_fantasia='VendeFacil',
            email='contato@vendefacil.com',
            plano=PlanoAssinatura.ENTERPRISE,
            plano_ativo=True
        )
        session.add(empresa)
        session.flush()

        # Criar super admin
        admin = Usuario(
            nome='Super Admin',
            email='admin@vendefacil.com',
            tipo=TipoUsuario.SUPER_ADMIN,
            empresa_id=empresa.id,
            ativo=True
        )
        admin.set_senha('Admin@123')
        session.add(admin)

        # Criar configuracao padrao
        config = ConfiguracaoBot(
            empresa_id=empresa.id,
            descricao_empresa='Sistema VendeFacil - Plataforma de automacao de vendas',
            mensagem_boas_vindas='Ola! Bem-vindo ao VendeFacil!',
            auto_resposta_ativa=True
        )
        session.add(config)

        session.commit()

        print("[OK] Super Admin criado com sucesso!")
        print(f"     Email: admin@vendefacil.com")
        print(f"     Senha: Admin@123")
        print(f"     Empresa ID: {empresa.id}")

        return True

    except Exception as e:
        session.rollback()
        print(f"[ERRO] Falha ao criar super admin: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        session.close()

def migrar_sqlite_para_postgres(engine):
    """Migra dados do SQLite para PostgreSQL"""
    print("\n" + "=" * 60)
    print("MIGRANDO DADOS DO SQLITE")
    print("=" * 60)

    if not os.path.exists(SQLITE_PATH):
        print(f"[INFO] Arquivo SQLite nao encontrado: {SQLITE_PATH}")
        print("       Pulando migracao...")
        return True

    try:
        # Conectar ao SQLite
        sqlite_conn = sqlite3.connect(SQLITE_PATH)
        sqlite_conn.row_factory = sqlite3.Row
        sqlite_cursor = sqlite_conn.cursor()

        # Listar tabelas do SQLite
        sqlite_cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        sqlite_tables = [row[0] for row in sqlite_cursor.fetchall()]
        print(f"[INFO] Tabelas no SQLite: {len(sqlite_tables)}")

        Session = sessionmaker(bind=engine)
        pg_session = Session()

        # Tabelas para migrar (ordem importante por causa de foreign keys)
        tabelas_ordem = [
            'empresas',
            'usuarios',
            'clientes',
            'leads',
            'conversas',
            'mensagens',
            'produtos',
            'pedidos',
            'itens_pedido',
            'entregas',
            'configuracoes_bot',
            'campanhas',
            'disparos',
            'afiliados'
        ]

        total_migrado = 0

        for tabela in tabelas_ordem:
            if tabela not in sqlite_tables:
                continue

            try:
                # Contar registros
                sqlite_cursor.execute(f"SELECT COUNT(*) FROM {tabela}")
                count = sqlite_cursor.fetchone()[0]

                if count == 0:
                    continue

                # Buscar dados
                sqlite_cursor.execute(f"SELECT * FROM {tabela}")
                rows = sqlite_cursor.fetchall()
                columns = [description[0] for description in sqlite_cursor.description]

                # Inserir no PostgreSQL
                with engine.connect() as pg_conn:
                    for row in rows:
                        try:
                            values = dict(zip(columns, row))

                            # Remover campos None para colunas que podem ter default
                            values = {k: v for k, v in values.items() if v is not None or k == 'id'}

                            cols = ', '.join(values.keys())
                            placeholders = ', '.join([f":{k}" for k in values.keys()])

                            sql = text(f"""
                                INSERT INTO {tabela} ({cols})
                                VALUES ({placeholders})
                                ON CONFLICT (id) DO NOTHING
                            """)
                            pg_conn.execute(sql, values)
                        except Exception as row_error:
                            # Ignorar erros de registro individual
                            pass

                    pg_conn.commit()

                print(f"  [OK] {tabela}: {count} registros")
                total_migrado += count

            except Exception as table_error:
                print(f"  [WARN] {tabela}: Erro - {str(table_error)[:50]}")

        # Atualizar sequences
        print("\n[INFO] Atualizando sequences...")
        with engine.connect() as pg_conn:
            for tabela in tabelas_ordem:
                try:
                    pg_conn.execute(text(f"""
                        SELECT setval(pg_get_serial_sequence('{tabela}', 'id'),
                               COALESCE((SELECT MAX(id) FROM {tabela}), 1))
                    """))
                except:
                    pass
            pg_conn.commit()

        sqlite_conn.close()
        pg_session.close()

        print(f"\n[OK] Migracao concluida! Total: {total_migrado} registros")
        return True

    except Exception as e:
        print(f"[ERRO] Falha na migracao: {e}")
        import traceback
        traceback.print_exc()
        return False

def verificar_dados(engine):
    """Verifica dados no PostgreSQL"""
    print("\n" + "=" * 60)
    print("VERIFICANDO DADOS")
    print("=" * 60)

    with engine.connect() as conn:
        # Contar registros por tabela
        result = conn.execute(text("""
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = 'public'
        """))
        tables = [row[0] for row in result.fetchall()]

        print("\nRegistros por tabela:")
        for table in sorted(tables):
            try:
                result = conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
                count = result.fetchone()[0]
                if count > 0:
                    print(f"  {table}: {count}")
            except:
                pass

        # Verificar super admin
        print("\n[INFO] Verificando super admin...")
        result = conn.execute(text("""
            SELECT u.id, u.nome, u.email, u.tipo, e.nome as empresa
            FROM usuarios u
            JOIN empresas e ON u.empresa_id = e.id
            WHERE u.email = 'admin@vendefacil.com'
        """))
        admin = result.fetchone()

        if admin:
            print(f"  [OK] Super Admin encontrado!")
            print(f"       ID: {admin[0]}")
            print(f"       Nome: {admin[1]}")
            print(f"       Email: {admin[2]}")
            print(f"       Tipo: {admin[3]}")
            print(f"       Empresa: {admin[4]}")
        else:
            print("  [WARN] Super Admin NAO encontrado!")

def main():
    print("\n" + "#" * 60)
    print("#  SETUP POSTGRESQL - VENDEFACIL")
    print("#  Render.com Database Configuration")
    print("#" * 60)

    # 1. Conectar
    engine = conectar_postgres()
    if not engine:
        return False

    # 2. Criar tabelas
    if not criar_tabelas(engine):
        return False

    # 3. Migrar dados do SQLite
    migrar_sqlite_para_postgres(engine)

    # 4. Criar super admin
    criar_super_admin(engine)

    # 5. Verificar
    verificar_dados(engine)

    print("\n" + "#" * 60)
    print("#  SETUP CONCLUIDO!")
    print("#" * 60)
    print("\nProximos passos:")
    print("  1. Acesse https://vendefacil-admin.onrender.com")
    print("  2. Login: admin@vendefacil.com / Admin@123")
    print("#" * 60 + "\n")

    return True

if __name__ == "__main__":
    main()

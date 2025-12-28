"""
Script para corrigir o enum tipousuario no banco de dados
O enum está truncado como 'ADMIN_EMPRE..' ao invés de 'admin_empresa'
"""
import sys
from sqlalchemy import create_engine, text
from database.models import DatabaseManager

def fix_tipousuario_enum():
    print("=" * 60)
    print("CORRIGINDO ENUM TIPOUSUARIO NO BANCO DE DADOS")
    print("=" * 60)
    print()

    try:
        # Conectar ao banco
        db = DatabaseManager()
        engine = db.engine

        with engine.connect() as conn:
            # 1. Verificar o enum atual
            print("[1/5] Verificando enum atual...")
            result = conn.execute(text("""
                SELECT COLUMN_TYPE
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = 'vendeai_crm'
                AND TABLE_NAME = 'usuarios'
                AND COLUMN_NAME = 'tipo'
            """))
            current_enum = result.fetchone()
            if current_enum:
                print(f"      Enum atual: {current_enum[0]}")

            # 2. Criar coluna temporária
            print("[2/5] Criando coluna temporária...")
            conn.execute(text("""
                ALTER TABLE usuarios
                ADD COLUMN tipo_temp VARCHAR(50) NULL
            """))
            conn.commit()
            print("      Coluna temporária criada")

            # 3. Copiar dados para coluna temporária (normalizando valores)
            print("[3/5] Copiando e normalizando dados...")
            conn.execute(text("""
                UPDATE usuarios
                SET tipo_temp = CASE
                    WHEN tipo LIKE '%super_admin%' THEN 'super_admin'
                    WHEN tipo LIKE '%admin%' OR tipo LIKE '%ADMIN_EMPRE%' THEN 'admin_empresa'
                    WHEN tipo LIKE '%visuali%' THEN 'visualizador'
                    ELSE 'usuario'
                END
            """))
            conn.commit()
            print("      Dados normalizados")

            # 4. Remover coluna antiga e recriar com enum correto
            print("[4/5] Recriando coluna com enum correto...")
            conn.execute(text("""
                ALTER TABLE usuarios
                DROP COLUMN tipo
            """))
            conn.commit()

            conn.execute(text("""
                ALTER TABLE usuarios
                ADD COLUMN tipo ENUM('super_admin', 'admin_empresa', 'usuario', 'visualizador')
                NOT NULL DEFAULT 'usuario'
            """))
            conn.commit()
            print("      Coluna recriada com enum correto")

            # 5. Copiar dados de volta
            print("[5/5] Restaurando dados...")
            conn.execute(text("""
                UPDATE usuarios
                SET tipo = tipo_temp
            """))
            conn.commit()

            # Remover coluna temporária
            conn.execute(text("""
                ALTER TABLE usuarios
                DROP COLUMN tipo_temp
            """))
            conn.commit()
            print("      Dados restaurados")

            # Verificar resultado
            print()
            print("Verificando resultado...")
            result = conn.execute(text("""
                SELECT email, tipo
                FROM usuarios
                ORDER BY id
            """))

            print()
            print("Usuários no banco:")
            print("-" * 60)
            for row in result:
                print(f"  {row[0]:40s} -> {row[1]}")

            print()
            print("=" * 60)
            print("✅ ENUM CORRIGIDO COM SUCESSO!")
            print("=" * 60)
            print()
            print("Valores corretos do enum:")
            print("  - super_admin")
            print("  - admin_empresa")
            print("  - usuario")
            print("  - visualizador")
            print()

    except Exception as e:
        print(f"❌ ERRO: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    fix_tipousuario_enum()

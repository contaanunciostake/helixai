"""
Script para corrigir valores do campo tipo na tabela usuarios (SQLite)
SQLite nao tem ENUM nativo, entao usamos CHECK constraint
"""
import sqlite3
import sys

def fix_tipousuario_values():
    print("=" * 60)
    print("CORRIGINDO VALORES DO CAMPO TIPO NA TABELA USUARIOS")
    print("=" * 60)
    print()

    try:
        # Conectar ao banco SQLite
        conn = sqlite3.connect('vendeai.db')
        cursor = conn.cursor()

        # 1. Verificar valores atuais
        print("[1/3] Verificando valores atuais...")
        cursor.execute("SELECT id, email, tipo FROM usuarios")
        usuarios = cursor.fetchall()

        print()
        print("Usuarios encontrados:")
        print("-" * 60)
        for usuario in usuarios:
            print(f"  ID {usuario[0]}: {usuario[1]:40s} -> {usuario[2]}")
        print()

        # 2. Normalizar valores para lowercase e corrigir valores truncados
        print("[2/3] Normalizando valores...")

        # Atualizar todos os valores para lowercase
        cursor.execute("""
            UPDATE usuarios
            SET tipo = CASE
                WHEN LOWER(tipo) LIKE '%super%admin%' THEN 'super_admin'
                WHEN LOWER(tipo) LIKE '%admin%' OR LOWER(tipo) LIKE '%empre%' THEN 'admin_empresa'
                WHEN LOWER(tipo) LIKE '%visuali%' THEN 'visualizador'
                ELSE 'usuario'
            END
        """)

        conn.commit()
        print(f"      {cursor.rowcount} registros atualizados")

        # 3. Verificar resultado
        print()
        print("[3/3] Verificando resultado...")
        cursor.execute("SELECT id, email, tipo FROM usuarios")
        usuarios = cursor.fetchall()

        print()
        print("Usuarios apos correcao:")
        print("-" * 60)
        for usuario in usuarios:
            print(f"  ID {usuario[0]}: {usuario[1]:40s} -> {usuario[2]}")

        print()
        print("=" * 60)
        print("CORRECAO CONCLUIDA COM SUCESSO!")
        print("=" * 60)
        print()
        print("Valores corretos do campo tipo:")
        print("  - super_admin")
        print("  - admin_empresa")
        print("  - usuario")
        print("  - visualizador")
        print()

        conn.close()

    except Exception as e:
        print(f"ERRO: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    fix_tipousuario_values()

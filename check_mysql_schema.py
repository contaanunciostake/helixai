"""
Script para verificar schema do MySQL
"""
import pymysql

try:
    conn = pymysql.connect(
        host='localhost',
        port=3306,
        user='root',
        password='',
        database='helixai_db',
        charset='utf8mb4'
    )

    cursor = conn.cursor()

    # Listar colunas da tabela empresas
    cursor.execute("DESCRIBE empresas")
    colunas = cursor.fetchall()

    print("Colunas da tabela 'empresas':")
    print("-" * 60)
    for col in colunas:
        print(f"  {col[0]:30s} {col[1]:20s}")

    print("\n")

    # Verificar empresa 22
    cursor.execute("SELECT * FROM empresas WHERE id = 22 LIMIT 1")
    empresa = cursor.fetchone()

    if empresa:
        print("Empresa 22 encontrada!")
        cursor.execute("DESCRIBE empresas")
        cols = [desc[0] for desc in cursor.fetchall()]

        print("\nDados da empresa 22:")
        for i, col_name in enumerate(cols):
            if i < len(empresa):
                print(f"  {col_name}: {empresa[i]}")

    cursor.close()
    conn.close()

except Exception as e:
    print(f"Erro: {e}")

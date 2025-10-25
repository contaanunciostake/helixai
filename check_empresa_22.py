import sqlite3

conn = sqlite3.connect(r'D:\Helix\HelixAI\backend\vendeai.db')
cursor = conn.cursor()

try:
    # Ver estrutura da tabela
    cursor.execute("PRAGMA table_info(empresas)")
    colunas = cursor.fetchall()

    print("Colunas da tabela empresas:")
    for col in colunas:
        print(f"  - {col[1]} ({col[2]})")

    print("\n" + "="*50)

    # Ver dados da empresa 22
    cursor.execute("SELECT * FROM empresas WHERE id = 22")
    empresa = cursor.fetchone()

    if empresa:
        print("\nDados da Empresa 22:")
        for i, col in enumerate(colunas):
            print(f"  {col[1]}: {empresa[i]}")
    else:
        print("\nEmpresa 22 nao encontrada")

finally:
    conn.close()

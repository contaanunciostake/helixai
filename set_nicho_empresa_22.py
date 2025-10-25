import sqlite3

conn = sqlite3.connect(r'D:\Helix\HelixAI\backend\vendeai.db')
cursor = conn.cursor()

try:
    # Atualizar nicho diretamente com SQL
    cursor.execute("UPDATE empresas SET nicho = 'veiculos' WHERE id = 22")
    conn.commit()

    # Verificar
    cursor.execute("SELECT id, nome, nicho FROM empresas WHERE id = 22")
    empresa = cursor.fetchone()

    print(f"SUCESSO - Empresa 22 atualizada:")
    print(f"   ID: {empresa[0]}")
    print(f"   Nome: {empresa[1]}")
    print(f"   Nicho: {empresa[2]}")

finally:
    conn.close()

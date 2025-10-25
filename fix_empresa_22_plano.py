import sqlite3

# Conectar ao banco de dados backend
conn = sqlite3.connect(r'D:\Helix\HelixAI\backend\vendeai.db')
cursor = conn.cursor()

try:
    # Atualizar plano de 'basico' para 'BASICO'
    cursor.execute("UPDATE empresas SET plano = 'BASICO' WHERE id = 22")
    conn.commit()

    # Verificar
    cursor.execute("SELECT id, nome, plano FROM empresas WHERE id = 22")
    empresa = cursor.fetchone()

    print(f"SUCESSO - Empresa 22 atualizada:")
    print(f"   ID: {empresa[0]}")
    print(f"   Nome: {empresa[1]}")
    print(f"   Plano: {empresa[2]}")

finally:
    conn.close()

"""
Script para verificar o schema do banco de dados
"""
import sqlite3

db_path = r'D:\Helix\HelixAI\backend\vendeai.db'

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Verificar colunas da tabela empresas
cursor.execute("PRAGMA table_info(empresas)")
colunas = cursor.fetchall()

print("Colunas da tabela 'empresas':")
print("-" * 60)
for coluna in colunas:
    print(f"  {coluna[1]:30s} {coluna[2]:15s} {'NOT NULL' if coluna[3] else ''}")

print("\n" * 2)

# Verificar se empresa 22 existe
cursor.execute("SELECT id, nome, email FROM empresas WHERE id = 22")
empresa = cursor.fetchone()

if empresa:
    print(f"OK - Empresa 22 encontrada: {empresa[1]} ({empresa[2]})")
else:
    print("ERRO - Empresa 22 nao encontrada")

conn.close()

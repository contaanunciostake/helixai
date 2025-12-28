"""
Verificar schema da tabela usuarios
"""
import sqlite3

conn = sqlite3.connect('vendeai.db')
cursor = conn.cursor()

# Obter schema da tabela
cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='usuarios'")
schema = cursor.fetchone()

if schema:
    print("Schema da tabela usuarios:")
    print("=" * 80)
    print(schema[0])
    print("=" * 80)
else:
    print("Tabela usuarios nao encontrada")

# Verificar constraints
cursor.execute("PRAGMA table_info(usuarios)")
columns = cursor.fetchall()

print()
print("Colunas da tabela usuarios:")
print("-" * 80)
for col in columns:
    print(f"  {col[1]:20s} {col[2]:15s} NOTNULL={col[3]} DEFAULT={col[4]}")

conn.close()

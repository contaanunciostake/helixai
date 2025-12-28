"""
Verificar constraints e indices
"""
import sqlite3

conn = sqlite3.connect('vendeai.db')
cursor = conn.cursor()

# Verificar se ha CHECK constraints
cursor.execute("""
    SELECT sql FROM sqlite_master
    WHERE type='table' AND name='usuarios' AND sql LIKE '%CHECK%'
""")
result = cursor.fetchone()

if result:
    print("CHECK constraints encontradas:")
    print("=" * 80)
    print(result[0])
    print("=" * 80)
else:
    print("Nenhuma CHECK constraint encontrada na definicao da tabela")

# Verificar indices
cursor.execute("""
    SELECT name, sql FROM sqlite_master
    WHERE type='index' AND tbl_name='usuarios'
""")
indices = cursor.fetchall()

print()
print("Indices da tabela usuarios:")
print("-" * 80)
for idx in indices:
    print(f"  {idx[0]}: {idx[1]}")

# Testar valores atuais
print()
print("Valores de 'tipo' no banco:")
print("-" * 80)
cursor.execute("SELECT DISTINCT tipo, LENGTH(tipo) as len FROM usuarios ORDER BY tipo")
tipos = cursor.fetchall()
for tipo in tipos:
    print(f"  '{tipo[0]}' (length: {tipo[1]})")

conn.close()

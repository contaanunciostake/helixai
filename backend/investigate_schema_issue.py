"""
Investigar problema com CHECK constraint do SQLite
"""
import sqlite3

conn = sqlite3.connect('vendeai.db')
cursor = conn.cursor()

print("=" * 80)
print("INVESTIGANDO SCHEMA DA TABELA USUARIOS")
print("=" * 80)
print()

# Obter schema completo da tabela
cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='usuarios'")
schema = cursor.fetchone()

if schema:
    print("SCHEMA COMPLETO DA TABELA:")
    print("-" * 80)
    print(schema[0])
    print("-" * 80)
    print()

    # Verificar se há CHECK constraint
    if 'CHECK' in schema[0]:
        print("⚠️  CHECK CONSTRAINT ENCONTRADO!")
        print()
        # Extrair a parte do CHECK
        check_start = schema[0].find('CHECK')
        check_section = schema[0][check_start:check_start+200]
        print("Trecho do CHECK constraint:")
        print(check_section)
    else:
        print("✅ Nenhum CHECK constraint encontrado")

    # Verificar definição da coluna tipo
    print()
    print("DEFINIÇÃO DA COLUNA 'tipo':")
    print("-" * 80)
    lines = schema[0].split('\n')
    for line in lines:
        if 'tipo' in line.lower():
            print(line)
    print("-" * 80)

print()
print("VALORES ATUAIS NO BANCO:")
print("-" * 80)
cursor.execute("SELECT id, email, tipo, LENGTH(tipo) as len FROM usuarios LIMIT 5")
for row in cursor.fetchall():
    print(f"ID {row[0]}: {row[1]:40s} -> '{row[2]}' (len: {row[3]})")

conn.close()

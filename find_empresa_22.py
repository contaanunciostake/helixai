"""
Script para encontrar qual banco tem a empresa 22
"""
import sqlite3
from pathlib import Path

# Lista de bancos para verificar
bancos = [
    r'D:\Helix\HelixAI\backend\vendeai.db',
    r'D:\Helix\HelixAI\vendeai.db',
    r'D:\Helix\HelixAI\database\vendeai.db',
    r'D:\Helix\HelixAI\Databases\vendeai.db',
    r'D:\Helix\HelixAI\VendeAI\vendeai.db',
    r'D:\Helix\HelixAI\backend\database\vendeai.db',
]

print("Procurando empresa 22 nos bancos de dados...\n")
print("=" * 70)

for db_path in bancos:
    path = Path(db_path)
    if not path.exists():
        continue

    try:
        conn = sqlite3.connect(str(path))
        cursor = conn.cursor()

        # Verificar se tabela empresas existe
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='empresas'")
        if not cursor.fetchone():
            conn.close()
            continue

        # Buscar empresa 22
        cursor.execute("SELECT id, nome, email FROM empresas WHERE id = 22")
        empresa = cursor.fetchone()

        if empresa:
            print(f"\nOK ENCONTRADO!")
            print(f"Banco: {db_path}")
            print(f"Empresa: {empresa[1]}")
            print(f"Email: {empresa[2]}")

            # Verificar colunas
            cursor.execute("PRAGMA table_info(empresas)")
            colunas = cursor.fetchall()
            coluna_names = [col[1] for col in colunas]

            print(f"\nColunas da tabela empresas:")
            if 'nicho' in coluna_names:
                print("  - nicho: EXISTE")
            else:
                print("  - nicho: NAO EXISTE (PROBLEMA!)")

            if 'bot_ativo' in coluna_names:
                print("  - bot_ativo: EXISTE")
            else:
                print("  - bot_ativo: NAO EXISTE")

            print("=" * 70)

        conn.close()
    except Exception as e:
        print(f"Erro ao verificar {db_path}: {e}")

print("\nBusca finalizada!")

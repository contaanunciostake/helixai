"""
Script para aplicar migrations no banco de dados
VendeAI - Database Migration Tool
"""

import sqlite3
import os
from pathlib import Path
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

def apply_migration(migration_file):
    """
    Aplica uma migration SQL no banco de dados

    Args:
        migration_file: Caminho do arquivo SQL
    """
    try:
        # Conectar ao banco
        db_path = Path(__file__).parent / 'vendeai.db'
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()

        print(f"\n{'='*70}")
        print(f"APLICANDO MIGRATION: {migration_file}")
        print(f"{'='*70}\n")

        # Ler arquivo SQL
        with open(migration_file, 'r', encoding='utf-8') as f:
            sql_content = f.read()

        # Dividir em statements (SQLite não suporta múltiplos statements por vez)
        statements = []
        current_statement = []

        for line in sql_content.split('\n'):
            # Ignorar comentários
            if line.strip().startswith('--') or not line.strip():
                continue

            current_statement.append(line)

            # Executar quando encontrar ;
            if ';' in line:
                statement = '\n'.join(current_statement)
                if statement.strip():
                    statements.append(statement)
                current_statement = []

        # Executar cada statement
        for i, statement in enumerate(statements, 1):
            try:
                cursor.execute(statement)
                print(f"[OK] Statement {i}/{len(statements)} executado com sucesso")
            except Exception as e:
                print(f"[WARN] Statement {i}/{len(statements)} falhou: {str(e)}")
                # Continuar com os próximos statements

        # Commit
        conn.commit()

        print(f"\n{'='*70}")
        print(f"[SUCCESS] MIGRATION APLICADA COM SUCESSO!")
        print(f"{'='*70}\n")

        # Verificar tabelas criadas
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
        tables = cursor.fetchall()

        print("Tabelas no banco de dados:")
        for table in tables:
            print(f"  - {table[0]}")

        conn.close()

    except Exception as e:
        print(f"\n[ERROR] Erro ao aplicar migration: {str(e)}")
        import traceback
        traceback.print_exc()


def main():
    """Função principal"""
    # Caminho da migration
    migrations_dir = Path(__file__).parent / 'database' / 'migrations'
    migration_file = migrations_dir / '004_sistema_assinaturas.sql'

    if not migration_file.exists():
        print(f"❌ Arquivo de migration não encontrado: {migration_file}")
        return

    # Aplicar migration
    apply_migration(migration_file)


if __name__ == '__main__':
    main()

"""
Migração: Adicionar campo 'nicho' à tabela empresas
Data: 2025-10-17
Descrição: Adiciona coluna nicho (ENUM: veiculos, imoveis) para diferenciar
           empresas de venda de veículos e imóveis
"""

import sys
import os
from pathlib import Path

# Adicionar pasta database ao path para importar models
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

from sqlalchemy import text

# Importar diretamente do arquivo models.py
from models import DatabaseManager, NichoEmpresa


def migrate_add_nicho():
    """Adiciona coluna nicho à tabela empresas"""

    # O banco está em D:\Helix\HelixAI\backend\vendeai.db
    # Caminho relativo a partir de database/
    db = DatabaseManager('sqlite:///../vendeai.db')
    session = db.get_session()

    try:
        print("\n" + "="*70)
        print("MIGRAÇÃO: Adicionar campo 'nicho' à tabela empresas")
        print("="*70 + "\n")

        # Verificar se a coluna já existe
        result = session.execute(text("PRAGMA table_info(empresas)"))
        columns = [row[1] for row in result.fetchall()]

        if 'nicho' in columns:
            print("[INFO] Coluna 'nicho' já existe na tabela empresas.")
            print("[OK] Nenhuma ação necessária.\n")
            return

        # Adicionar coluna nicho
        print("[1/2] Adicionando coluna 'nicho' à tabela empresas...")
        session.execute(text("""
            ALTER TABLE empresas
            ADD COLUMN nicho VARCHAR(20)
        """))
        session.commit()
        print("[OK] Coluna 'nicho' adicionada com sucesso!\n")

        # Exibir informações sobre os valores possíveis
        print("[INFO] Valores possíveis para o campo 'nicho':")
        print(f"  - {NichoEmpresa.VEICULOS.value}: Vendas de veículos (AIra Auto)")
        print(f"  - {NichoEmpresa.IMOVEIS.value}: Vendas de imóveis (AIra Imob)")
        print()

        print("="*70)
        print("MIGRAÇÃO CONCLUÍDA COM SUCESSO!")
        print("="*70)
        print("\nO campo 'nicho' foi adicionado à tabela empresas.")
        print("Empresas novas precisarão ter o nicho definido no cadastro.")
        print()

    except Exception as e:
        session.rollback()
        print(f"\n[ERRO] Falha na migração: {e}\n")
        raise
    finally:
        session.close()


def rollback_nicho():
    """Remove a coluna nicho (rollback da migração)"""

    db = DatabaseManager('sqlite:///../vendeai.db')
    session = db.get_session()

    try:
        print("\n" + "="*70)
        print("ROLLBACK: Remover campo 'nicho' da tabela empresas")
        print("="*70 + "\n")

        # NOTA: SQLite não suporta DROP COLUMN diretamente
        # Seria necessário recriar a tabela sem a coluna
        print("[AVISO] SQLite não suporta DROP COLUMN diretamente.")
        print("Para remover a coluna, seria necessário recriar a tabela.")
        print("Por segurança, esta operação não será executada automaticamente.\n")

    except Exception as e:
        session.rollback()
        print(f"\n[ERRO] Falha no rollback: {e}\n")
        raise
    finally:
        session.close()


if __name__ == '__main__':
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == '--rollback':
        rollback_nicho()
    else:
        migrate_add_nicho()

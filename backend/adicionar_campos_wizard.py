"""
Script para adicionar campos do wizard à tabela empresas
Adiciona: nome_bot, setup_completo, tem_catalogo
"""
import sys
from pathlib import Path
import sqlite3

sys.path.append(str(Path(__file__).parent.parent))

# Caminho do banco de dados
db_path = Path(__file__).parent.parent / 'vendeai.db'

print(f"[MIGRACAO] Conectando ao banco: {db_path}")

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Verificar se as colunas já existem
    cursor.execute("PRAGMA table_info(empresas)")
    colunas_existentes = [col[1] for col in cursor.fetchall()]

    print(f"[MIGRACAO] Colunas existentes na tabela empresas: {colunas_existentes}")

    # Adicionar coluna nome_bot se não existir
    if 'nome_bot' not in colunas_existentes:
        print("[MIGRACAO] Adicionando coluna 'nome_bot'...")
        cursor.execute("ALTER TABLE empresas ADD COLUMN nome_bot VARCHAR(100)")
        print("[MIGRACAO] [OK] Coluna 'nome_bot' adicionada")
    else:
        print("[MIGRACAO] [AVISO] Coluna 'nome_bot' ja existe")

    # Adicionar coluna setup_completo se não existir
    if 'setup_completo' not in colunas_existentes:
        print("[MIGRACAO] Adicionando coluna 'setup_completo'...")
        cursor.execute("ALTER TABLE empresas ADD COLUMN setup_completo BOOLEAN DEFAULT 0")
        print("[MIGRACAO] [OK] Coluna 'setup_completo' adicionada")
    else:
        print("[MIGRACAO] [AVISO] Coluna 'setup_completo' ja existe")

    # Adicionar coluna tem_catalogo se não existir
    if 'tem_catalogo' not in colunas_existentes:
        print("[MIGRACAO] Adicionando coluna 'tem_catalogo'...")
        cursor.execute("ALTER TABLE empresas ADD COLUMN tem_catalogo BOOLEAN DEFAULT 0")
        print("[MIGRACAO] [OK] Coluna 'tem_catalogo' adicionada")
    else:
        print("[MIGRACAO] [AVISO] Coluna 'tem_catalogo' ja existe")

    conn.commit()

    # Verificar resultado
    cursor.execute("PRAGMA table_info(empresas)")
    colunas_atualizadas = [col[1] for col in cursor.fetchall()]

    print(f"\n[MIGRACAO] [OK] Migracao concluida!")
    print(f"[MIGRACAO] Colunas na tabela empresas apos migracao: {colunas_atualizadas}")

    # Verificar empresas existentes
    cursor.execute("SELECT id, nome, setup_completo FROM empresas")
    empresas = cursor.fetchall()

    if empresas:
        print(f"\n[MIGRACAO] Empresas existentes:")
        for empresa in empresas:
            print(f"   - ID: {empresa[0]}, Nome: {empresa[1]}, Setup Completo: {empresa[2]}")
    else:
        print(f"\n[MIGRACAO] Nenhuma empresa cadastrada no banco")

except Exception as e:
    print(f"[MIGRACAO] [ERRO] Erro: {e}")
    import traceback
    traceback.print_exc()
finally:
    if conn:
        conn.close()
        print("\n[MIGRACAO] Conexao fechada")

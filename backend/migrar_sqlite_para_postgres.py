# -*- coding: utf-8 -*-
"""
Script de Migracao SQLite -> PostgreSQL
Exporta dados do SQLite local e importa no PostgreSQL do Render
"""

import sqlite3
import os
from datetime import datetime

# Configuracao
SQLITE_PATH = 'vendeai.db'
OUTPUT_SQL = 'dados_exportados.sql'

def get_tables(cursor):
    """Lista todas as tabelas do banco"""
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    return [row[0] for row in cursor.fetchall()]

def get_table_schema(cursor, table):
    """Obtem schema da tabela"""
    cursor.execute(f"PRAGMA table_info({table})")
    return cursor.fetchall()

def escape_value(value):
    """Escapa valores para SQL"""
    if value is None:
        return "NULL"
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, bytes):
        return "NULL"  # Skip binary data
    # Escape strings
    escaped = str(value).replace("'", "''")
    return f"'{escaped}'"

def export_table_data(cursor, table, output_file):
    """Exporta dados de uma tabela"""
    cursor.execute(f"SELECT * FROM {table}")
    rows = cursor.fetchall()

    if not rows:
        return 0

    # Obter nomes das colunas
    cursor.execute(f"PRAGMA table_info({table})")
    columns = [col[1] for col in cursor.fetchall()]

    count = 0
    for row in rows:
        values = [escape_value(v) for v in row]
        cols_str = ', '.join(columns)
        vals_str = ', '.join(values)

        # Usar INSERT com ON CONFLICT para evitar duplicatas
        sql = f"INSERT INTO {table} ({cols_str}) VALUES ({vals_str}) ON CONFLICT DO NOTHING;\n"
        output_file.write(sql)
        count += 1

    return count

def main():
    print("=" * 60)
    print("MIGRACAO SQLite -> PostgreSQL")
    print("=" * 60)

    if not os.path.exists(SQLITE_PATH):
        print(f"[ERRO] Banco SQLite nao encontrado: {SQLITE_PATH}")
        return

    conn = sqlite3.connect(SQLITE_PATH)
    cursor = conn.cursor()

    tables = get_tables(cursor)
    print(f"\n[INFO] Tabelas encontradas: {len(tables)}")
    for t in tables:
        print(f"  - {t}")

    # Ordem de exportacao (respeitar foreign keys)
    ordem_tabelas = [
        'empresas',
        'usuarios',
        'clientes',
        'leads',
        'conversas',
        'mensagens',
        'veiculos',
        'produtos',
        'pedidos',
        'itens_pedido',
        'entregas',
        'agendamentos',
        'campanhas',
        'disparos',
        'afiliados',
        'links_afiliados',
        'cliques_afiliados',
        'vendas_afiliados',
        'saques_afiliados',
        'notificacoes',
        'assinaturas',
        'pagamentos',
        'configuracoes_bot',
    ]

    # Adicionar tabelas que nao estao na ordem
    for t in tables:
        if t not in ordem_tabelas:
            ordem_tabelas.append(t)

    with open(OUTPUT_SQL, 'w', encoding='utf-8') as f:
        f.write("-- Dados exportados do SQLite\n")
        f.write(f"-- Data: {datetime.now().isoformat()}\n")
        f.write("-- Usar com: psql $DATABASE_URL < dados_exportados.sql\n\n")

        f.write("-- Desabilitar checks temporariamente\n")
        f.write("SET session_replication_role = 'replica';\n\n")

        total = 0
        for table in ordem_tabelas:
            if table in tables:
                print(f"\n[EXPORTANDO] {table}...")
                count = export_table_data(cursor, table, f)
                print(f"  -> {count} registros")
                total += count
                f.write(f"\n-- Fim de {table}: {count} registros\n\n")

        f.write("\n-- Reabilitar checks\n")
        f.write("SET session_replication_role = 'origin';\n")

        # Resetar sequences
        f.write("\n-- Resetar sequences (auto-increment)\n")
        for table in ordem_tabelas:
            if table in tables:
                f.write(f"SELECT setval(pg_get_serial_sequence('{table}', 'id'), COALESCE(MAX(id), 1)) FROM {table};\n")

    conn.close()

    print(f"\n{'='*60}")
    print(f"[OK] Exportacao concluida!")
    print(f"  - Total de registros: {total}")
    print(f"  - Arquivo gerado: {OUTPUT_SQL}")
    print(f"\nPara importar no PostgreSQL do Render:")
    print(f"  psql $DATABASE_URL < {OUTPUT_SQL}")
    print("=" * 60)

if __name__ == "__main__":
    main()

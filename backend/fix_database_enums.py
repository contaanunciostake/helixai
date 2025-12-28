"""
Script para corrigir valores de enum inválidos no banco de dados
"""

import sqlite3
import sys
import os
from pathlib import Path

# Forçar UTF-8 no Windows
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# Adicionar pasta raiz ao path
sys.path.append(str(Path(__file__).parent.parent))

def fix_database_enums():
    """Corrige valores de enum inválidos no banco de dados"""

    conn = sqlite3.connect('vendeai.db')
    cursor = conn.cursor()

    print("=" * 70)
    print("CORRIGINDO VALORES DE ENUM NO BANCO DE DADOS")
    print("=" * 70)
    print()

    # 1. Corrigir valores de 'tipo' na tabela 'usuarios'
    print("[1/3] Corrigindo tipos de usuário...")

    # Mapear valores antigos para novos
    tipo_mapping = {
        'usuario': 'usuario',  # já está correto
        'admin': 'admin_empresa',
        'super_admin': 'super_admin',
        'visualizador': 'visualizador'
    }

    cursor.execute("SELECT id, tipo FROM usuarios WHERE tipo NOT IN ('super_admin', 'admin_empresa', 'usuario', 'visualizador')")
    usuarios_invalidos = cursor.fetchall()

    for user_id, tipo_atual in usuarios_invalidos:
        novo_tipo = tipo_mapping.get(tipo_atual, 'usuario')
        cursor.execute("UPDATE usuarios SET tipo = ? WHERE id = ?", (novo_tipo, user_id))
        print(f"   ✓ Usuário ID {user_id}: '{tipo_atual}' → '{novo_tipo}'")

    if not usuarios_invalidos:
        print("   ✓ Todos os tipos de usuário estão corretos!")

    # 2. Corrigir valores de 'nicho' na tabela 'empresas'
    print("\n[2/3] Corrigindo nichos de empresas...")

    # Empresas com nicho inválido devem ter nicho NULL
    cursor.execute("SELECT id, nome, nicho FROM empresas WHERE nicho NOT IN ('veiculos', 'imoveis') AND nicho IS NOT NULL")
    empresas_invalidas = cursor.fetchall()

    for empresa_id, nome, nicho_atual in empresas_invalidas:
        # Se o nicho for 'geral' ou outro valor inválido, definir como NULL
        cursor.execute("UPDATE empresas SET nicho = NULL WHERE id = ?", (empresa_id,))
        print(f"   ✓ Empresa ID {empresa_id} ({nome}): '{nicho_atual}' → NULL (genérico)")

    if not empresas_invalidas:
        print("   ✓ Todos os nichos de empresa estão corretos!")

    # 3. Corrigir valores de 'plano' na tabela 'empresas'
    print("\n[3/3] Corrigindo planos de assinatura...")

    # Mapear valores antigos para novos (Python usa maiúsculas no enum)
    plano_mapping = {
        'gratuito': 'GRATUITO',
        'free': 'GRATUITO',
        'basico': 'BASICO',
        'basic': 'BASICO',
        'profissional': 'PROFISSIONAL',
        'pro': 'PROFISSIONAL',
        'professional': 'PROFISSIONAL',
        'enterprise': 'ENTERPRISE',
        'ENTERPRISE': 'ENTERPRISE',
        'PROFISSIONAL': 'PROFISSIONAL',
        'BASICO': 'BASICO',
        'GRATUITO': 'GRATUITO'
    }

    cursor.execute("SELECT id, nome, plano FROM empresas")
    empresas_plano = cursor.fetchall()

    planos_corrigidos = False
    for empresa_id, nome, plano_atual in empresas_plano:
        if plano_atual not in ['GRATUITO', 'BASICO', 'PROFISSIONAL', 'ENTERPRISE']:
            novo_plano = plano_mapping.get(plano_atual, 'GRATUITO')
            cursor.execute("UPDATE empresas SET plano = ? WHERE id = ?", (novo_plano, empresa_id))
            print(f"   ✓ Empresa ID {empresa_id} ({nome}): '{plano_atual}' → '{novo_plano}'")
            planos_corrigidos = True

    if not planos_corrigidos:
        print("   ✓ Todos os planos estão corretos!")

    # Commit das alterações
    conn.commit()

    print("\n" + "=" * 70)
    print("✅ CORREÇÕES CONCLUÍDAS COM SUCESSO!")
    print("=" * 70)
    print()

    # Mostrar resumo final
    print("RESUMO DAS TABELAS:")
    print("-" * 70)

    cursor.execute("SELECT COUNT(*), tipo FROM usuarios GROUP BY tipo")
    usuarios = cursor.fetchall()
    print("\n👥 USUÁRIOS POR TIPO:")
    for count, tipo in usuarios:
        print(f"   - {tipo}: {count} usuário(s)")

    cursor.execute("SELECT COUNT(*), COALESCE(nicho, 'NULL') as nicho FROM empresas GROUP BY nicho")
    empresas = cursor.fetchall()
    print("\n🏢 EMPRESAS POR NICHO:")
    for count, nicho in empresas:
        nicho_label = 'genérico' if nicho == 'NULL' else nicho
        print(f"   - {nicho_label}: {count} empresa(s)")

    cursor.execute("SELECT COUNT(*), plano FROM empresas GROUP BY plano")
    planos = cursor.fetchall()
    print("\n💰 EMPRESAS POR PLANO:")
    for count, plano in planos:
        print(f"   - {plano}: {count} empresa(s)")

    print()

    conn.close()

if __name__ == '__main__':
    try:
        fix_database_enums()
    except Exception as e:
        print(f"\n❌ ERRO: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

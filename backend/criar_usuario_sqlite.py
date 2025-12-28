"""
Script para criar usuario e empresa no SQLite (vendeai.db)
O backend usa SQLite por padrao, nao MySQL
"""

import sqlite3
from pathlib import Path
from werkzeug.security import generate_password_hash

# Caminho do banco SQLite
DB_PATH = Path(__file__).parent.parent / 'database' / 'vendeai.db'

print(f"Banco SQLite: {DB_PATH}")
print(f"Existe: {DB_PATH.exists()}")

conn = sqlite3.connect(str(DB_PATH))
cursor = conn.cursor()

# 1. Verificar estrutura das tabelas
print("\n=== Estrutura da tabela empresas ===")
cursor.execute("PRAGMA table_info(empresas)")
cols = cursor.fetchall()
for col in cols:
    print(f"  {col[1]} ({col[2]})")

print("\n=== Estrutura da tabela usuarios ===")
cursor.execute("PRAGMA table_info(usuarios)")
cols = cursor.fetchall()
for col in cols:
    print(f"  {col[1]} ({col[2]})")

# 2. Verificar se empresa ja existe
cursor.execute("SELECT id, nome FROM empresas WHERE id = 23")
empresa = cursor.fetchone()
print(f"\nEmpresa ID 23: {empresa}")

# 3. Criar empresa se nao existir
if not empresa:
    print("\nCriando empresa Comercial Mariano...")
    cursor.execute("""
        INSERT INTO empresas (id, nome, nome_fantasia, nicho, plano, plano_ativo, bot_ativo, criado_em)
        VALUES (23, 'Comercial Mariano', 'Grupo Comercial Mariano', 'ATACADO_VAREJO', 'PROFISSIONAL', 1, 1, datetime('now'))
    """)
    print("Empresa criada!")
else:
    print("Empresa ja existe.")

# 4. Verificar se usuario ja existe
cursor.execute("SELECT id, email, empresa_id FROM usuarios WHERE email = 'viaaaactor@gmail.com'")
usuario = cursor.fetchone()
print(f"\nUsuario viaaaactor@gmail.com: {usuario}")

# 5. Criar usuario se nao existir
if not usuario:
    print("\nCriando usuario viaaaactor@gmail.com...")
    senha_hash = generate_password_hash('mariano123', method='scrypt')
    cursor.execute("""
        INSERT INTO usuarios (nome, email, senha_hash, tipo, empresa_id, ativo, criado_em)
        VALUES ('Victor Mariano', 'viaaaactor@gmail.com', ?, 'cliente', 23, 1, datetime('now'))
    """, (senha_hash,))
    print("Usuario criado!")
else:
    print("Usuario ja existe, atualizando senha...")
    senha_hash = generate_password_hash('mariano123', method='scrypt')
    cursor.execute("UPDATE usuarios SET senha_hash = ? WHERE email = 'viaaaactor@gmail.com'", (senha_hash,))
    print("Senha atualizada!")

conn.commit()

# 6. Verificar resultado
print("\n=== Verificacao Final ===")
cursor.execute("SELECT id, nome, nicho FROM empresas WHERE id = 23")
empresa = cursor.fetchone()
print(f"Empresa: {empresa}")

cursor.execute("SELECT id, email, empresa_id, tipo FROM usuarios WHERE email = 'viaaaactor@gmail.com'")
usuario = cursor.fetchone()
print(f"Usuario: {usuario}")

# 7. Listar todos usuarios
print("\n=== Todos os usuarios ===")
cursor.execute("SELECT id, email, empresa_id, tipo FROM usuarios")
for u in cursor.fetchall():
    print(f"  {u}")

conn.close()
print("\n[OK] Pronto! Tente fazer login agora.")

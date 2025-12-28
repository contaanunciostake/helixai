"""
Script para sincronizar dados do SQLite para MySQL
Resolve o problema de bancos de dados separados
"""

import sqlite3
import mysql.connector
from dotenv import load_dotenv
import os
import sys

# Configurar encoding para UTF-8
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Carregar variáveis de ambiente
load_dotenv()

# Conectar ao SQLite
sqlite_conn = sqlite3.connect('vendeai.db')
sqlite_conn.row_factory = sqlite3.Row
sqlite_cursor = sqlite_conn.cursor()

# Conectar ao MySQL
mysql_conn = mysql.connector.connect(
    host=os.getenv('DB_HOST', 'localhost'),
    user=os.getenv('DB_USER', 'root'),
    password=os.getenv('DB_PASSWORD', ''),
    database=os.getenv('DB_NAME', 'helixai_db')
)
mysql_cursor = mysql_conn.cursor()

print("=" * 70)
print("SINCRONIZANDO SQLITE PARA MYSQL")
print("=" * 70)
print()

# ========================================================================
# 1. SINCRONIZAR EMPRESAS
# ========================================================================
print("[1/3] Sincronizando empresas...")

sqlite_cursor.execute("""
    SELECT id, nome, email, telefone, nicho, cnpj,
           endereco, cidade, estado, cep, plano, plano_ativo,
           bot_ativo, whatsapp_conectado, whatsapp_numero,
           whatsapp_qr_code, data_cadastro
    FROM empresas
""")

empresas = sqlite_cursor.fetchall()
empresas_sincronizadas = 0

for emp in empresas:
    # Verificar se já existe
    mysql_cursor.execute("SELECT id FROM empresas WHERE id = %s", (emp['id'],))
    existe = mysql_cursor.fetchone()

    if existe:
        # Atualizar
        mysql_cursor.execute("""
            UPDATE empresas SET
                nome = %s, email = %s, telefone = %s, nicho = %s, cnpj = %s,
                endereco = %s, cidade = %s, estado = %s, cep = %s,
                plano = %s, plano_ativo = %s, bot_ativo = %s,
                whatsapp_conectado = %s, whatsapp_numero = %s,
                whatsapp_qr_code = %s, data_cadastro = %s
            WHERE id = %s
        """, (
            emp['nome'], emp['email'], emp['telefone'], emp['nicho'], emp['cnpj'],
            emp['endereco'], emp['cidade'], emp['estado'], emp['cep'],
            emp['plano'], emp['plano_ativo'], emp['bot_ativo'],
            emp['whatsapp_conectado'], emp['whatsapp_numero'],
            emp['whatsapp_qr_code'], emp['data_cadastro'],
            emp['id']
        ))
        print(f"  OK Atualizada: {emp['nome']} (ID {emp['id']})")
    else:
        # Inserir
        mysql_cursor.execute("""
            INSERT INTO empresas (
                id, nome, email, telefone, nicho, cnpj,
                endereco, cidade, estado, cep, plano, plano_ativo,
                bot_ativo, whatsapp_conectado, whatsapp_numero,
                whatsapp_qr_code, data_cadastro
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            emp['id'], emp['nome'], emp['email'], emp['telefone'], emp['nicho'], emp['cnpj'],
            emp['endereco'], emp['cidade'], emp['estado'], emp['cep'],
            emp['plano'], emp['plano_ativo'], emp['bot_ativo'],
            emp['whatsapp_conectado'], emp['whatsapp_numero'],
            emp['whatsapp_qr_code'], emp['data_cadastro']
        ))
        print(f"  OK Inserida: {emp['nome']} (ID {emp['id']})")

    empresas_sincronizadas += 1

mysql_conn.commit()
print(f"  -> {empresas_sincronizadas} empresas sincronizadas\n")

# ========================================================================
# 2. SINCRONIZAR USUARIOS
# ========================================================================
print("[2/3] Sincronizando usuários...")

sqlite_cursor.execute("""
    SELECT id, nome, email, telefone, senha, tipo, empresa_id,
           ativo, ultimo_acesso, data_cadastro
    FROM usuarios
""")

usuarios = sqlite_cursor.fetchall()
usuarios_sincronizados = 0

for user in usuarios:
    # Verificar se já existe
    mysql_cursor.execute("SELECT id FROM usuarios WHERE id = %s", (user['id'],))
    existe = mysql_cursor.fetchone()

    if existe:
        # Atualizar
        mysql_cursor.execute("""
            UPDATE usuarios SET
                nome = %s, email = %s, telefone = %s, senha = %s,
                tipo = %s, empresa_id = %s, ativo = %s,
                ultimo_acesso = %s, data_cadastro = %s
            WHERE id = %s
        """, (
            user['nome'], user['email'], user['telefone'], user['senha'],
            user['tipo'], user['empresa_id'], user['ativo'],
            user['ultimo_acesso'], user['data_cadastro'],
            user['id']
        ))
        print(f"  ✓ Atualizado: {user['email']} (ID {user['id']})")
    else:
        # Inserir
        mysql_cursor.execute("""
            INSERT INTO usuarios (
                id, nome, email, telefone, senha, tipo, empresa_id,
                ativo, ultimo_acesso, data_cadastro
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            user['id'], user['nome'], user['email'], user['telefone'], user['senha'],
            user['tipo'], user['empresa_id'], user['ativo'],
            user['ultimo_acesso'], user['data_cadastro']
        ))
        print(f"  ✓ Inserido: {user['email']} (ID {user['id']})")

    usuarios_sincronizados += 1

mysql_conn.commit()
print(f"  → {usuarios_sincronizados} usuários sincronizados\n")

# ========================================================================
# 3. SINCRONIZAR CONFIGURAÇÕES BOT
# ========================================================================
print("[3/3] Sincronizando configurações do bot...")

sqlite_cursor.execute("""
    SELECT id, empresa_id, mensagem_boas_vindas, mensagem_ausencia,
           mensagem_encerramento, auto_resposta_ativa, horario_inicio,
           horario_fim, dias_semana_ativos
    FROM configuracoes_bot
""")

configs = sqlite_cursor.fetchall()
configs_sincronizadas = 0

for config in configs:
    # Verificar se já existe
    mysql_cursor.execute(
        "SELECT id FROM configuracoes_bot WHERE empresa_id = %s",
        (config['empresa_id'],)
    )
    existe = mysql_cursor.fetchone()

    if existe:
        # Atualizar
        mysql_cursor.execute("""
            UPDATE configuracoes_bot SET
                mensagem_boas_vindas = %s, mensagem_ausencia = %s,
                mensagem_encerramento = %s, auto_resposta_ativa = %s,
                horario_inicio = %s, horario_fim = %s, dias_semana_ativos = %s
            WHERE empresa_id = %s
        """, (
            config['mensagem_boas_vindas'], config['mensagem_ausencia'],
            config['mensagem_encerramento'], config['auto_resposta_ativa'],
            config['horario_inicio'], config['horario_fim'], config['dias_semana_ativos'],
            config['empresa_id']
        ))
        print(f"  ✓ Atualizada: Empresa ID {config['empresa_id']}")
    else:
        # Inserir
        mysql_cursor.execute("""
            INSERT INTO configuracoes_bot (
                empresa_id, mensagem_boas_vindas, mensagem_ausencia,
                mensagem_encerramento, auto_resposta_ativa,
                horario_inicio, horario_fim, dias_semana_ativos
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            config['empresa_id'], config['mensagem_boas_vindas'], config['mensagem_ausencia'],
            config['mensagem_encerramento'], config['auto_resposta_ativa'],
            config['horario_inicio'], config['horario_fim'], config['dias_semana_ativos']
        ))
        print(f"  ✓ Inserida: Empresa ID {config['empresa_id']}")

    configs_sincronizadas += 1

mysql_conn.commit()
print(f"  → {configs_sincronizadas} configurações sincronizadas\n")

# ========================================================================
# RESUMO
# ========================================================================
print("=" * 70)
print("✅ SINCRONIZAÇÃO CONCLUÍDA COM SUCESSO!")
print("=" * 70)
print(f"  Empresas:       {empresas_sincronizadas}")
print(f"  Usuários:       {usuarios_sincronizados}")
print(f"  Configurações:  {configs_sincronizadas}")
print()

# Fechar conexões
sqlite_conn.close()
mysql_conn.close()

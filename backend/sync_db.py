# -*- coding: utf-8 -*-
"""Sincronizar dados do SQLite para MySQL"""

import sqlite3
import mysql.connector
from dotenv import load_dotenv
import os

load_dotenv()

# Conectar bancos
sqlite_conn = sqlite3.connect('vendeai.db')
sqlite_conn.row_factory = sqlite3.Row
sqlite_cur = sqlite_conn.cursor()

mysql_conn = mysql.connector.connect(
    host=os.getenv('DB_HOST', 'localhost'),
    user=os.getenv('DB_USER', 'root'),
    password=os.getenv('DB_PASSWORD', ''),
    database=os.getenv('DB_NAME', 'helixai_db')
)
mysql_cur = mysql_conn.cursor()

print("SINCRONIZANDO DADOS...")
print()

# EMPRESAS
print("[1/3] Empresas...")
sqlite_cur.execute("SELECT * FROM empresas")
for emp in sqlite_cur.fetchall():
    mysql_cur.execute("SELECT id FROM empresas WHERE id = %s", (emp['id'],))
    if mysql_cur.fetchone():
        mysql_cur.execute("""
            UPDATE empresas SET nome=%s, email=%s, telefone=%s, nicho=%s,
                   bot_ativo=%s, whatsapp_conectado=%s, whatsapp_numero=%s,
                   plano=%s, plano_ativo=%s
            WHERE id=%s
        """, (emp['nome'], emp['email'], emp['telefone'], emp['nicho'],
              emp['bot_ativo'], emp['whatsapp_conectado'], emp['whatsapp_numero'],
              emp['plano'], emp['plano_ativo'], emp['id']))
        print(f"  Atualizada: {emp['nome']} (ID {emp['id']})")
    else:
        mysql_cur.execute("""
            INSERT INTO empresas (id, nome, email, telefone, nicho, bot_ativo,
                   whatsapp_conectado, whatsapp_numero, plano, plano_ativo)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (emp['id'], emp['nome'], emp['email'], emp['telefone'], emp['nicho'],
              emp['bot_ativo'], emp['whatsapp_conectado'], emp['whatsapp_numero'],
              emp['plano'], emp['plano_ativo']))
        print(f"  Inserida: {emp['nome']} (ID {emp['id']})")
mysql_conn.commit()

# USUARIOS
print("[2/3] Usuarios...")
sqlite_cur.execute("SELECT * FROM usuarios")
for user in sqlite_cur.fetchall():
    mysql_cur.execute("SELECT id FROM usuarios WHERE id = %s", (user['id'],))
    if mysql_cur.fetchone():
        mysql_cur.execute("""
            UPDATE usuarios SET nome=%s, email=%s, senha_hash=%s, tipo=%s,
                   empresa_id=%s, ativo=%s
            WHERE id=%s
        """, (user['nome'], user['email'], user['senha_hash'], user['tipo'],
              user['empresa_id'], user['ativo'], user['id']))
        print(f"  Atualizado: {user['email']}")
    else:
        mysql_cur.execute("""
            INSERT INTO usuarios (id, nome, email, senha_hash, tipo, empresa_id, ativo)
            VALUES (%s,%s,%s,%s,%s,%s,%s)
        """, (user['id'], user['nome'], user['email'], user['senha_hash'],
              user['tipo'], user['empresa_id'], user['ativo']))
        print(f"  Inserido: {user['email']}")
mysql_conn.commit()

# CONFIGURACOES_BOT
print("[3/3] Configuracoes...")
sqlite_cur.execute("SELECT * FROM configuracoes_bot")
for cfg in sqlite_cur.fetchall():
    mysql_cur.execute("SELECT id FROM configuracoes_bot WHERE empresa_id = %s", (cfg['empresa_id'],))
    if mysql_cur.fetchone():
        mysql_cur.execute("""
            UPDATE configuracoes_bot SET mensagem_boas_vindas=%s,
                   auto_resposta_ativa=%s
            WHERE empresa_id=%s
        """, (cfg['mensagem_boas_vindas'], cfg['auto_resposta_ativa'], cfg['empresa_id']))
        print(f"  Atualizada: Empresa {cfg['empresa_id']}")
    else:
        mysql_cur.execute("""
            INSERT INTO configuracoes_bot (empresa_id, mensagem_boas_vindas, auto_resposta_ativa)
            VALUES (%s,%s,%s)
        """, (cfg['empresa_id'], cfg['mensagem_boas_vindas'], cfg['auto_resposta_ativa']))
        print(f"  Inserida: Empresa {cfg['empresa_id']}")
mysql_conn.commit()

print()
print("SINCRONIZACAO CONCLUIDA!")

sqlite_conn.close()
mysql_conn.close()

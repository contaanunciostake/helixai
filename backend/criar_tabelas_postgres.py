# -*- coding: utf-8 -*-
"""
Script para criar todas as tabelas no PostgreSQL
Executar apos o deploy no Render.com
"""

import os
from database.models import DatabaseManager, Base

def main():
    database_url = os.getenv('DATABASE_URL')

    if not database_url:
        print("[ERRO] DATABASE_URL nao definida!")
        print("       Defina a variavel de ambiente com a URL do PostgreSQL")
        return

    # Render.com usa postgres:// mas SQLAlchemy precisa de postgresql://
    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)

    # Adicionar SSL para conexoes remotas
    if 'sslmode' not in database_url:
        database_url += '?sslmode=require'

    print("=" * 60)
    print("CRIANDO TABELAS NO POSTGRESQL")
    print("=" * 60)

    try:
        db = DatabaseManager(database_url)

        print("\n[INFO] Criando todas as tabelas...")
        db.create_all()

        print("\n[INFO] Criando super admin...")
        db.criar_super_admin()

        print("\n" + "=" * 60)
        print("[OK] Banco de dados configurado com sucesso!")
        print("=" * 60)
        print("\nCredenciais do Super Admin:")
        print("  Email: admin@vendeai.com")
        print("  Senha: admin123")
        print("\n[IMPORTANTE] Altere a senha apos o primeiro login!")
        print("=" * 60)

    except Exception as e:
        print(f"\n[ERRO] Falha ao criar tabelas: {e}")
        raise

if __name__ == "__main__":
    main()

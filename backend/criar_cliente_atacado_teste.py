"""
Script para criar cliente de teste do nicho Atacado/Varejo
Cria:
- atacado@teste.com / atacado123 (Cliente Atacado/Varejo)
- Empresa: Grupo Comercial Mariano
- Produtos de exemplo (lubrificantes, filtros, aditivos)
"""

import sqlite3
import sys
import os
import csv
from pathlib import Path

# Forcar UTF-8 no Windows
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# Adicionar pasta raiz ao path
sys.path.append(str(Path(__file__).parent.parent))

from database.models import (
    DatabaseManager, Usuario, Empresa, Produto,
    TipoUsuario, PlanoAssinatura, NichoEmpresa
)

def criar_cliente_atacado():
    """Cria cliente de teste para nicho Atacado/Varejo"""

    db = DatabaseManager('sqlite:///vendeai.db')
    session = db.get_session()

    print("=" * 70)
    print("CRIANDO CLIENTE ATACADO/VAREJO DE TESTE")
    print("=" * 70)
    print()

    try:
        # 1. Buscar ou criar empresa Grupo Comercial Mariano
        empresa = session.query(Empresa).filter_by(nome='Grupo Comercial Mariano').first()
        if not empresa:
            empresa = Empresa(
                nome='Grupo Comercial Mariano',
                nome_fantasia='Mariano Distribuidora',
                plano='PROFISSIONAL',
                plano_ativo=True,
                bot_ativo=True,
                nicho='ATACADO_VAREJO',
                nome_bot='AIra Vendas'
            )
            session.add(empresa)
            session.flush()
            print("OK Empresa Grupo Comercial Mariano criada (nicho: atacado_varejo)")
        else:
            # Atualizar nicho
            empresa.nicho = 'ATACADO_VAREJO'
            empresa.bot_ativo = True
            empresa.nome_bot = 'AIra Vendas'
            print("OK Empresa Grupo Comercial Mariano atualizada (nicho: atacado_varejo)")

        # 2. Criar usuario atacado
        usuario = session.query(Usuario).filter_by(email='atacado@teste.com').first()
        if not usuario:
            usuario = Usuario(
                nome='Gerente Mariano',
                email='atacado@teste.com',
                tipo='admin_empresa',
                empresa_id=empresa.id,
                ativo=True,
                telefone='65999999999'
            )
            usuario.set_senha('atacado123')
            session.add(usuario)
            print("OK Usuario criado: atacado@teste.com / atacado123")
        else:
            # Atualizar senha e empresa
            usuario.set_senha('atacado123')
            usuario.tipo = 'admin_empresa'
            usuario.empresa_id = empresa.id
            usuario.ativo = True
            print("OK Usuario atualizado: atacado@teste.com / atacado123")

        session.commit()

        # 3. Importar produtos do CSV de exemplo
        csv_path = Path(__file__).parent.parent / 'templates' / 'produtos_atacado_exemplo.csv'

        if csv_path.exists():
            print("\n" + "-" * 70)
            print("Importando produtos de exemplo...")
            print("-" * 70)

            # Limpar produtos antigos da empresa (se houver)
            produtos_antigos = session.query(Produto).filter_by(empresa_id=empresa.id).count()
            if produtos_antigos > 0:
                session.query(Produto).filter_by(empresa_id=empresa.id).delete()
                session.commit()
                print(f"   Removidos {produtos_antigos} produtos antigos")

            # Importar novos produtos
            importados = 0
            with open(csv_path, 'r', encoding='utf-8-sig') as csvfile:
                reader = csv.DictReader(csvfile)
                for row in reader:
                    try:
                        produto = Produto(
                            empresa_id=empresa.id,
                            nome=row.get('nome', ''),
                            descricao=row.get('descricao', ''),
                            categoria=row.get('categoria', ''),
                            subcategoria=row.get('subcategoria', ''),
                            marca=row.get('marca', ''),
                            preco=float(row.get('preco', 0)),
                            estoque=int(row.get('estoque', 0)),
                            sku=row.get('sku', ''),
                            aplicacao=row.get('aplicacao', ''),
                            palavras_chave=row.get('palavras_chave', ''),
                            disponivel=True,
                            ativo=True,
                            importado_csv=True
                        )
                        session.add(produto)
                        importados += 1
                    except Exception as e:
                        print(f"   ERRO ao importar produto: {e}")

            session.commit()
            print(f"   OK {importados} produtos importados com sucesso!")
        else:
            print(f"\n   AVISO: CSV de exemplo nao encontrado em {csv_path}")

        print("\n" + "=" * 70)
        print("OK CLIENTE ATACADO/VAREJO CRIADO COM SUCESSO!")
        print("=" * 70)
        print()

        print("CREDENCIAIS DE ACESSO:")
        print("-" * 70)
        print("\n[ATACADO/VAREJO] Cliente de Teste:")
        print("   Email: atacado@teste.com")
        print("   Senha: atacado123")
        print("   Empresa: Grupo Comercial Mariano")
        print("   Nicho: Atacado/Varejo")
        print("   Bot: AIra Vendas (IA Claude)")
        print()
        print("-" * 70)
        print("\nURLs de Acesso:")
        print("  CRM Cliente: http://localhost:5177/")
        print()
        print("Produtos disponiveis:")
        print("  - Lubrificantes (Ipiranga, Texaco)")
        print("  - Filtros (Mann, Tecfil, Donaldson, Fleetguard)")
        print("  - Aditivos (Militec)")
        print("  - Limpeza Automotiva (Tecbril)")
        print("  - Camaras de Ar (Levorin)")
        print()

    except Exception as e:
        session.rollback()
        print(f"\nERRO: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        session.close()

if __name__ == '__main__':
    criar_cliente_atacado()

"""
Script simples para verificar se a rota de login de afiliados existe
"""
import sys
import os

# Adicionar diretório do projeto ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Importar app Flask
try:
    from backend.app import app

    print("\n" + "="*70)
    print("VERIFICACAO DE ROTAS - AFILIADOS")
    print("="*70 + "\n")

    # Buscar rota específica de afiliados
    found = False
    afiliados_routes = []

    with app.app_context():
        for rule in app.url_map.iter_rules():
            if 'afiliados' in rule.rule:
                afiliados_routes.append(rule)
                if '/login' in rule.rule and 'afiliados' in rule.rule:
                    found = True
                    print(f"[OK] Rota encontrada: {rule.rule}")
                    print(f"     Metodos: {', '.join(rule.methods)}")
                    print(f"     Endpoint: {rule.endpoint}")

    print("\n" + "-"*70)
    print(f"Total de rotas de afiliados encontradas: {len(afiliados_routes)}")
    print("-"*70 + "\n")

    if found:
        print("[SUCESSO] Endpoint /api/afiliados/login existe!")
        print("\nO backend esta pronto para aceitar requisicoes de login.")
        print("Execute: python testar_login_afiliado.py")
    else:
        print("[ERRO] Endpoint /api/afiliados/login NAO foi encontrado!")
        print("\nRotas de afiliados disponiveis:")
        for route in afiliados_routes:
            print(f"  - {route.rule} [{', '.join(route.methods)}]")

    print("\n" + "="*70 + "\n")

except Exception as e:
    print(f"\n[ERRO] Nao foi possivel verificar rotas: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

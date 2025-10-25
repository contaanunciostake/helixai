"""
Script para verificar rotas registradas no Flask
Execute este script para ver todas as rotas disponíveis
"""

import sys
from pathlib import Path

# Adicionar pasta raiz ao path
sys.path.append(str(Path(__file__).parent))

try:
    from backend import app

    print("="*80)
    print("ROTAS REGISTRADAS NO FLASK")
    print("="*80)

    # Agrupar rotas por blueprint
    rotas_por_blueprint = {}

    for rule in app.url_map.iter_rules():
        # Pegar blueprint
        if rule.endpoint.startswith('static'):
            continue

        blueprint = rule.endpoint.split('.')[0] if '.' in rule.endpoint else 'main'

        if blueprint not in rotas_por_blueprint:
            rotas_por_blueprint[blueprint] = []

        rotas_por_blueprint[blueprint].append({
            'path': str(rule),
            'methods': ', '.join(sorted(rule.methods - {'HEAD', 'OPTIONS'})),
            'endpoint': rule.endpoint
        })

    # Mostrar rotas agrupadas
    for blueprint in sorted(rotas_por_blueprint.keys()):
        print(f"\n📦 BLUEPRINT: {blueprint.upper()}")
        print("-"*80)

        for rota in sorted(rotas_por_blueprint[blueprint], key=lambda x: x['path']):
            print(f"  {rota['methods']:15s} {rota['path']}")

    # Verificar especificamente rotas de afiliados
    print("\n" + "="*80)
    print("🔍 VERIFICAÇÃO: Rotas de Afiliados")
    print("="*80)

    afiliados_rotas = [r for r in app.url_map.iter_rules() if '/afiliados' in str(r)]

    if afiliados_rotas:
        print(f"✅ Encontradas {len(afiliados_rotas)} rotas de afiliados:")
        for rota in afiliados_rotas:
            methods = ', '.join(sorted(rota.methods - {'HEAD', 'OPTIONS'}))
            print(f"  {methods:15s} {rota}")
    else:
        print("❌ NENHUMA rota de afiliados encontrada!")
        print("\n⚠️  SOLUÇÃO:")
        print("  1. Verifique se backend/routes/afiliados.py existe")
        print("  2. Verifique se está registrado em backend/__init__.py")
        print("  3. Reinicie o backend: python backend/app.py")

    # Verificar especificamente /api/afiliados/login
    print("\n" + "="*80)
    print("🎯 VERIFICAÇÃO: /api/afiliados/login")
    print("="*80)

    login_route = None
    for rule in app.url_map.iter_rules():
        if str(rule) == '/api/afiliados/login':
            login_route = rule
            break

    if login_route:
        methods = ', '.join(sorted(login_route.methods - {'HEAD', 'OPTIONS'}))
        print(f"✅ Rota encontrada!")
        print(f"   Métodos: {methods}")
        print(f"   Endpoint: {login_route.endpoint}")
    else:
        print("❌ Rota /api/afiliados/login NÃO ENCONTRADA!")
        print("\n⚠️  PROBLEMA:")
        print("  O endpoint não foi registrado.")
        print("\n💡 SOLUÇÃO:")
        print("  1. Verifique se você salvou o arquivo backend/routes/afiliados.py")
        print("  2. Reinicie o backend completamente:")
        print("     - Pare o servidor (Ctrl+C)")
        print("     - Execute novamente: python backend/app.py")

    print("\n" + "="*80)

except ImportError as e:
    print(f"❌ ERRO ao importar backend: {e}")
    print("\nCertifique-se de estar no diretório correto:")
    print("  cd D:\\Helix\\HelixAI")
    print("  python verificar_rotas.py")

except Exception as e:
    print(f"❌ ERRO: {e}")
    import traceback
    traceback.print_exc()

"""Script para testar importação de assinatura"""
import sys
from pathlib import Path

# Adicionar pasta raiz ao path
sys.path.append(str(Path(__file__).parent.parent))

print("=" * 70)
print("TESTANDO IMPORTAÇÃO DO MÓDULO ASSINATURA")
print("=" * 70)

try:
    from backend import app
    print("\n[OK] App Flask importado com sucesso")

    print("\nBlueprints registrados:")
    for name, blueprint in app.blueprints.items():
        url_prefix = blueprint.url_prefix or '/'
        print(f"  - {name}: {url_prefix}")

    print("\n" + "=" * 70)

    # Verificar se assinatura está registrado
    if 'assinatura' in app.blueprints:
        print("[OK] Blueprint 'assinatura' ESTA registrado")
        print(f"  URL Prefix: {app.blueprints['assinatura'].url_prefix}")
    else:
        print("[ERRO] Blueprint 'assinatura' NAO esta registrado")

except Exception as e:
    print(f"\n[ERRO] Erro ao importar: {e}")
    import traceback
    traceback.print_exc()

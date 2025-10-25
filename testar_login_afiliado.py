"""
Script de Teste - Login de Afiliado
Testa o endpoint /api/afiliados/login
"""

import requests
import json

# Configurações
BASE_URL = "http://localhost:5000"
LOGIN_URL = f"{BASE_URL}/api/afiliados/login"

# Credenciais de teste
CREDENCIAIS = {
    "email": "afiliado@teste.com",
    "senha": "123456"
}

def testar_login():
    """Testa o login do afiliado"""
    print("="*60)
    print("TESTANDO LOGIN DE AFILIADO")
    print("="*60)
    print(f"\nURL: {LOGIN_URL}")
    print(f"Email: {CREDENCIAIS['email']}")
    print(f"Senha: {CREDENCIAIS['senha']}")
    print("\n" + "-"*60)

    try:
        print("\n[1] Enviando requisição...")
        response = requests.post(
            LOGIN_URL,
            json=CREDENCIAIS,
            headers={"Content-Type": "application/json"}
        )

        print(f"[2] Status Code: {response.status_code}")

        if response.status_code == 200:
            print("✅ [3] LOGIN BEM-SUCEDIDO!")
            data = response.json()

            print("\n📊 RESPOSTA:")
            print(json.dumps(data, indent=2, ensure_ascii=False))

            if 'afiliado' in data:
                afiliado = data['afiliado']
                print("\n" + "="*60)
                print("DADOS DO AFILIADO")
                print("="*60)
                print(f"Nome: {afiliado.get('nome')}")
                print(f"Email: {afiliado.get('email')}")
                print(f"Chave: {afiliado.get('chave_referencia')}")
                print(f"Status: {afiliado.get('status')}")
                print(f"Link: {afiliado.get('link_referencia')}")
                print(f"\n💰 FINANCEIRO:")
                print(f"  Saldo Disponível: R$ {afiliado.get('saldo_disponivel', 0):.2f}")
                print(f"  Comissões Geradas: R$ {afiliado.get('total_comissoes_geradas', 0):.2f}")
                print(f"  Comissões Pagas: R$ {afiliado.get('total_comissoes_pagas', 0):.2f}")
                print(f"\n📊 MÉTRICAS:")
                print(f"  Total de Clicks: {afiliado.get('total_clicks', 0)}")
                print(f"  Total de Cadastros: {afiliado.get('total_cadastros', 0)}")
                print(f"  Total de Vendas: {afiliado.get('total_vendas', 0)}")

            if 'token' in data:
                print(f"\n🔑 TOKEN JWT:")
                print(f"  {data['token'][:50]}...")

        elif response.status_code == 401:
            print("❌ [3] ERRO 401 - Não Autorizado")
            data = response.json()
            print(f"Mensagem: {data.get('message')}")

        elif response.status_code == 403:
            print("❌ [3] ERRO 403 - Acesso Negado")
            data = response.json()
            print(f"Mensagem: {data.get('message')}")

        else:
            print(f"❌ [3] ERRO {response.status_code}")
            try:
                data = response.json()
                print(f"Mensagem: {data.get('message')}")
                print(f"Resposta completa: {json.dumps(data, indent=2)}")
            except:
                print(f"Resposta: {response.text}")

    except requests.exceptions.ConnectionError:
        print("❌ ERRO: Não foi possível conectar ao backend!")
        print("Verifique se o backend está rodando em http://localhost:5000")
        print("\nPara iniciar o backend:")
        print("  cd D:\\Helix\\HelixAI\\backend")
        print("  python app.py")

    except Exception as e:
        print(f"❌ ERRO INESPERADO: {str(e)}")
        import traceback
        traceback.print_exc()

    print("\n" + "="*60)


if __name__ == "__main__":
    testar_login()

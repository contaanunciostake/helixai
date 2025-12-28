"""
Testar API de login diretamente
"""
import requests
import json

# URL da API
url = 'http://localhost:5000/api/auth/login'

# Dados de login
data = {
    'email': 'demo@vendeai.com',
    'senha': 'demo123'
}

try:
    print("Testando login via API REST...")
    print("=" * 80)
    print(f"URL: {url}")
    print(f"Data: {json.dumps(data, indent=2)}")
    print()

    response = requests.post(url, json=data, timeout=10)

    print(f"Status Code: {response.status_code}")
    print()
    print("Response:")
    print("-" * 80)
    print(json.dumps(response.json(), indent=2))
    print("-" * 80)

    if response.status_code == 200:
        print()
        print("LOGIN BEM-SUCEDIDO!")
    else:
        print()
        print("LOGIN FALHOU!")

except requests.exceptions.ConnectionError:
    print("ERRO: Nao foi possivel conectar ao servidor.")
    print("Certifique-se de que o backend esta rodando em http://localhost:5000")
except Exception as e:
    print(f"ERRO: {e}")
    import traceback
    traceback.print_exc()

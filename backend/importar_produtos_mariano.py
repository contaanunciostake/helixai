"""
Script para importar produtos do Comercial Mariano para o banco de dados MySQL
"""
import csv
import os
import mysql.connector
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

def get_connection():
    """Conectar ao MySQL"""
    return mysql.connector.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        user=os.getenv('DB_USER', 'root'),
        password=os.getenv('DB_PASSWORD', ''),
        database=os.getenv('DB_NAME', 'helixai_db')
    )

def importar_produtos(empresa_id=23):
    """Importar produtos do CSV para o banco"""

    csv_path = os.path.join(os.path.dirname(__file__), '..', 'templates', 'produtos_comercial_mariano.csv')

    if not os.path.exists(csv_path):
        print(f"[ERRO] Arquivo nao encontrado: {csv_path}")
        return

    print(f"[FILE] Lendo arquivo: {csv_path}")

    conn = get_connection()
    cursor = conn.cursor()

    # Limpar produtos anteriores desta empresa (opcional)
    cursor.execute("DELETE FROM produtos WHERE empresa_id = %s", (empresa_id,))
    print(f"[DEL] Produtos anteriores removidos para empresa {empresa_id}")

    importados = 0
    erros = []

    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f, delimiter=';')

        for linha_num, row in enumerate(reader, start=2):
            try:
                nome = row.get('nome', '').strip()
                if not nome:
                    continue

                # Extrair dados
                descricao = row.get('descricao', '').strip()
                categoria = row.get('categoria', '').strip()
                subcategoria = row.get('subcategoria', '').strip()
                marca = row.get('marca', '').strip()
                sku = row.get('sku', '').strip()
                aplicacao = row.get('aplicacao', '').strip()

                # Preço
                preco_str = row.get('preco', '0').replace(',', '.')
                try:
                    preco = float(preco_str)
                except:
                    preco = 0

                # Estoque
                try:
                    estoque = int(row.get('estoque', '0'))
                except:
                    estoque = 0

                # Disponível
                disponivel_str = row.get('disponivel', 'sim').lower()
                disponivel = disponivel_str in ['sim', 's', '1', 'true', 'yes']

                # Palavras-chave para busca
                palavras_chave = f"{nome} {marca} {categoria} {subcategoria} {aplicacao}"

                # Inserir produto
                cursor.execute("""
                    INSERT INTO produtos (
                        empresa_id, nome, descricao, categoria, subcategoria,
                        marca, preco, estoque, sku, aplicacao, disponivel,
                        palavras_chave, ativo, importado_csv
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 1, 1)
                """, (
                    empresa_id, nome, descricao, categoria, subcategoria,
                    marca, preco, estoque, sku, aplicacao, disponivel,
                    palavras_chave
                ))

                importados += 1

            except Exception as e:
                erros.append(f"Linha {linha_num}: {str(e)}")
                print(f"[WARN] Erro linha {linha_num}: {e}")

    conn.commit()
    cursor.close()
    conn.close()

    print(f"\n[OK] Importacao concluida!")
    print(f"   Produtos importados: {importados}")
    if erros:
        print(f"   Erros: {len(erros)}")
        for erro in erros[:5]:
            print(f"   - {erro}")

def atualizar_config_empresa(empresa_id=23):
    """Atualizar configurações da empresa Comercial Mariano"""

    conn = get_connection()
    cursor = conn.cursor()

    # Atualizar dados da empresa
    cursor.execute("""
        UPDATE empresas SET
            nome = 'Comercial Mariano LTDA',
            nome_fantasia = 'Comercial Mariano'
        WHERE id = %s
    """, (empresa_id,))

    # Configurações extras em JSON
    import json
    config_json = json.dumps({
        'celular': '(11) 99999-9999',
        'numero': '123',
        'complemento': '',
        'bairro': 'Centro',
        'horario_abertura': '08:00',
        'horario_fechamento': '18:00',
        'dias_funcionamento': ['seg', 'ter', 'qua', 'qui', 'sex', 'sab'],
        'aceita_cartao': True,
        'aceita_pix': True,
        'aceita_boleto': True,
        'aceita_dinheiro': True,
        'prazo_entrega': '1-3 dias úteis',
        'taxa_entrega': 15.0,
        'entrega_gratis_acima': 500,
        'sobre_empresa': 'A Comercial Mariano é uma distribuidora de lubrificantes, filtros e produtos automotivos. Trabalhamos com as melhores marcas como Ipiranga, Texaco, Mann, Tecfil, Fleetguard, Militec. Atendemos oficinas, postos e consumidores finais.'
    }, ensure_ascii=False)

    # Verificar se já existe config
    cursor.execute("SELECT id FROM configuracoes_bot WHERE empresa_id = %s", (empresa_id,))
    existe = cursor.fetchone()

    if existe:
        cursor.execute("""
            UPDATE configuracoes_bot SET
                horario_atendimento = '08:00 as 18:00',
                mensagem_boas_vindas = 'Ola! Bem-vindo a Comercial Mariano! Sou a AIra, como posso ajudar voce hoje?',
                mensagem_ausencia = 'Ola! Estamos fora do horario de atendimento. Nosso horario e de segunda a sabado das 8h as 18h.',
                descricao_empresa = %s
            WHERE empresa_id = %s
        """, (config_json, empresa_id))
    else:
        cursor.execute("""
            INSERT INTO configuracoes_bot (
                empresa_id, horario_atendimento, mensagem_boas_vindas,
                mensagem_ausencia, descricao_empresa
            ) VALUES (%s, '08:00 as 18:00', %s, %s, %s)
        """, (
            empresa_id,
            'Ola! Bem-vindo a Comercial Mariano! Sou a AIra, como posso ajudar voce hoje?',
            'Ola! Estamos fora do horario de atendimento. Nosso horario e de segunda a sabado das 8h as 18h.',
            config_json
        ))

    conn.commit()
    cursor.close()
    conn.close()

    print(f"[OK] Configuracoes da empresa {empresa_id} atualizadas!")

if __name__ == '__main__':
    import sys

    # Verificar se foi passado um empresa_id
    empresa_id = 23  # Padrao
    if len(sys.argv) > 1:
        try:
            empresa_id = int(sys.argv[1])
        except:
            pass

    print(f"[IMPORT] Importando produtos para empresa_id = {empresa_id}")
    print("="*50)

    importar_produtos(empresa_id)
    atualizar_config_empresa(empresa_id)

    print("\n" + "="*50)
    print("[OK] Processo concluido!")

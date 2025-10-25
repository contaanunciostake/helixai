import json
import mysql.connector
import os

# Configurações do banco de dados
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "helixai_user")
DB_PASSWORD = os.getenv("DB_PASSWORD", "helixai_password")
DB_NAME = os.getenv("DB_NAME", "helixai_db")

# Caminho para o arquivo JSON
JSON_FILE_PATH = "/home/ubuntu/HelixAI/Databases/properties.json"

def populate_properties_table():
    try:
        # Conectar ao MySQL
        conn = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME
        )
        cursor = conn.cursor()

        # Ler o arquivo JSON
        with open(JSON_FILE_PATH, "r", encoding="utf-8") as f:
            properties_data = json.load(f)

        # Inserir dados na tabela properties
        for prop in properties_data:
            endereco = prop.get("endereco", {})
            condicoes_pagamento = json.dumps(prop.get("condicoes_pagamento", []))
            comodidades = json.dumps(prop.get("comodidades", []))
            url_imagens = json.dumps(prop.get("url_imagens", []))

            sql = """
            INSERT INTO properties (
                property_id, property_type, finalidade, preco,
                endereco_logradouro, endereco_bairro, endereco_cidade, endereco_estado, endereco_cep,
                metragem, quartos, banheiros, vagas, condominio, iptu, ano_construcao,
                comodidades, descricao, condicoes_pagamento, status, url_imagens, link_site
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
            """
            values = (
                prop.get("property_id"), prop.get("property_type"), prop.get("finalidade"), prop.get("preco"),
                endereco.get("logradouro"), endereco.get("bairro"), endereco.get("cidade"), endereco.get("estado"), endereco.get("cep"),
                prop.get("metragem"), prop.get("quartos"), prop.get("banheiros"), prop.get("vagas"), prop.get("condominio"), prop.get("iptu"), prop.get("ano_construcao"),
                comodidades, prop.get("descricao"), condicoes_pagamento, prop.get("status"), url_imagens, prop.get("link_site")
            )
            cursor.execute(sql, values)

        conn.commit()
        print(f"✅ {len(properties_data)} imóveis inseridos com sucesso na tabela properties.")

    except mysql.connector.Error as err:
        print(f"❌ Erro ao conectar ou inserir dados no MySQL: {err}")
    except FileNotFoundError:
        print(f"❌ Arquivo JSON não encontrado: {JSON_FILE_PATH}")
    except json.JSONDecodeError:
        print(f"❌ Erro ao decodificar o arquivo JSON: {JSON_FILE_PATH}")
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()
            print("Conexão com o MySQL fechada.")

if __name__ == "__main__":
    populate_properties_table()

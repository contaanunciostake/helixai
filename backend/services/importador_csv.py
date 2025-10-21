"""
VendeAI - Importador de CSV para Leads
Sistema de importação em massa com validação e tratamento de erros
"""

import csv
import io
import re
from typing import List, Dict, Optional
from datetime import datetime
from pathlib import Path

from database.models import ArquivoImportacao, Empresa
from database.models_robo import LeadImportacao


class ImportadorCSV:
    """Importador inteligente de CSV para leads"""

    # Mapeamento de colunas comuns (variações de nomes)
    MAPEAMENTO_COLUNAS = {
        'nome': ['nome', 'name', 'nome_completo', 'cliente', 'razao_social'],
        'whatsapp': ['whatsapp', 'telefone', 'celular', 'phone', 'contato', 'tel'],
        'email': ['email', 'e-mail', 'mail'],
        'empresa': ['empresa', 'empresa_lead', 'company', 'razao_social', 'loja'],
        'cidade': ['cidade', 'city', 'municipio'],
        'estado': ['estado', 'uf', 'state'],
        'cargo': ['cargo', 'funcao', 'position', 'role']
    }

    def __init__(self, db_session, empresa_id: int):
        self.db = db_session
        self.empresa_id = empresa_id
        self.erros = []
        self.stats = {
            'total_linhas': 0,
            'importados': 0,
            'duplicados': 0,
            'erros': 0
        }

    def detectar_delimitador(self, conteudo: str) -> str:
        """Detecta delimitador do CSV"""
        primeira_linha = conteudo.split('\n')[0]

        delimitadores = [',', ';', '\t', '|']
        contagens = {d: primeira_linha.count(d) for d in delimitadores}

        return max(contagens, key=contagens.get)

    def normalizar_nome_coluna(self, coluna: str) -> str:
        """Normaliza nome da coluna para formato padrão"""
        coluna_limpa = coluna.lower().strip()

        for padrao, variacoes in self.MAPEAMENTO_COLUNAS.items():
            if coluna_limpa in variacoes:
                return padrao

        return coluna_limpa

    def validar_whatsapp(self, numero: str) -> Optional[str]:
        """Valida e formata número de WhatsApp"""
        if not numero:
            return None

        # Remove caracteres não numéricos
        numero_limpo = re.sub(r'\D', '', str(numero))

        # Remove código do país se presente
        if numero_limpo.startswith('55'):
            numero_limpo = numero_limpo[2:]

        # Validar tamanho (DDD + número)
        if len(numero_limpo) < 10 or len(numero_limpo) > 11:
            return None

        # Adicionar código do país
        return f"55{numero_limpo}"

    def validar_email(self, email: str) -> Optional[str]:
        """Valida email"""
        if not email:
            return None

        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if re.match(pattern, str(email).strip()):
            return email.strip().lower()

        return None

    def processar_linha(self, linha_dict: Dict, numero_linha: int, colunas_mapeadas: Dict) -> Optional[LeadImportacao]:
        """Processa uma linha do CSV"""

        try:
            # Extrair dados mapeados
            dados = {}
            dados_extras = {}

            for coluna_original, coluna_normalizada in colunas_mapeadas.items():
                valor = linha_dict.get(coluna_original, '').strip()

                if coluna_normalizada in ['nome', 'whatsapp', 'email', 'empresa', 'cidade', 'estado', 'cargo']:
                    dados[coluna_normalizada] = valor
                else:
                    # Dados extras
                    if valor:
                        dados_extras[coluna_normalizada] = valor

            # Validar WhatsApp (obrigatório)
            whatsapp = self.validar_whatsapp(dados.get('whatsapp'))
            if not whatsapp:
                self.erros.append({
                    'linha': numero_linha,
                    'erro': 'WhatsApp inválido ou ausente',
                    'dados': dados
                })
                self.stats['erros'] += 1
                return None

            # Verificar duplicata
            existe = self.db.query(LeadImportacao).filter_by(
                empresa_id=self.empresa_id,
                whatsapp=whatsapp
            ).first()

            if existe:
                self.stats['duplicados'] += 1
                return None

            # Validar email (opcional)
            email = self.validar_email(dados.get('email'))

            # Criar lead
            lead = LeadImportacao(
                empresa_id=self.empresa_id,
                nome=dados.get('nome') or 'Cliente',
                whatsapp=whatsapp,
                email=email,
                empresa_lead=dados.get('empresa'),
                cidade=dados.get('cidade'),
                estado=dados.get('estado'),
                cargo=dados.get('cargo'),
                dados_extras=dados_extras if dados_extras else None
            )

            return lead

        except Exception as e:
            self.erros.append({
                'linha': numero_linha,
                'erro': str(e),
                'dados': linha_dict
            })
            self.stats['erros'] += 1
            return None

    def importar_arquivo(self, arquivo_path: str, campanha_id: Optional[int] = None) -> Dict:
        """Importa arquivo CSV completo"""

        print(f"\n📂 Importando arquivo: {arquivo_path}")

        try:
            # Ler arquivo
            with open(arquivo_path, 'r', encoding='utf-8-sig') as f:
                conteudo = f.read()

            # Detectar delimitador
            delimitador = self.detectar_delimitador(conteudo)
            print(f"   Delimitador detectado: '{delimitador}'")

            # Parsear CSV
            reader = csv.DictReader(io.StringIO(conteudo), delimiter=delimitador)

            # Mapear colunas
            colunas_originais = reader.fieldnames
            colunas_mapeadas = {
                col: self.normalizar_nome_coluna(col)
                for col in colunas_originais
            }

            print(f"   Colunas encontradas: {len(colunas_originais)}")
            print(f"   Mapeamento: {colunas_mapeadas}\n")

            # Criar registro de importação
            nome_arquivo = Path(arquivo_path).name
            arquivo_import = ArquivoImportacao(
                empresa_id=self.empresa_id,
                nome_arquivo=nome_arquivo,
                tipo='leads',
                caminho=arquivo_path,
                status='processando'
            )
            self.db.add(arquivo_import)
            self.db.commit()

            # Processar linhas
            leads_importar = []
            numero_linha = 1

            for linha in reader:
                numero_linha += 1
                self.stats['total_linhas'] += 1

                lead = self.processar_linha(linha, numero_linha, colunas_mapeadas)

                if lead:
                    lead.arquivo_importacao_id = arquivo_import.id
                    leads_importar.append(lead)

                # Commit em lotes de 100
                if len(leads_importar) >= 100:
                    self.db.bulk_save_objects(leads_importar)
                    self.db.commit()
                    print(f"   ✅ Importados {len(leads_importar)} leads...")
                    self.stats['importados'] += len(leads_importar)
                    leads_importar = []

            # Commit final
            if leads_importar:
                self.db.bulk_save_objects(leads_importar)
                self.db.commit()
                self.stats['importados'] += len(leads_importar)

            # Atualizar arquivo de importação
            arquivo_import.total_linhas = self.stats['total_linhas']
            arquivo_import.importados_sucesso = self.stats['importados']
            arquivo_import.importados_erro = self.stats['erros']
            arquivo_import.erros_detalhes = self.erros if self.erros else None
            arquivo_import.status = 'concluido'
            self.db.commit()

            # Resultado
            print("\n" + "="*70)
            print("📊 RESULTADO DA IMPORTAÇÃO")
            print("="*70)
            print(f"Total de linhas: {self.stats['total_linhas']}")
            print(f"✅ Importados: {self.stats['importados']}")
            print(f"🔄 Duplicados: {self.stats['duplicados']}")
            print(f"❌ Erros: {self.stats['erros']}")
            print("="*70 + "\n")

            if self.erros:
                print("⚠️  Erros encontrados:")
                for erro in self.erros[:10]:  # Mostrar só os 10 primeiros
                    print(f"   Linha {erro['linha']}: {erro['erro']}")
                if len(self.erros) > 10:
                    print(f"   ... e mais {len(self.erros) - 10} erros")
                print()

            return {
                'sucesso': True,
                'arquivo_id': arquivo_import.id,
                'stats': self.stats,
                'erros': self.erros
            }

        except Exception as e:
            print(f"\n❌ Erro ao importar arquivo: {e}\n")
            return {
                'sucesso': False,
                'erro': str(e)
            }

    def importar_de_stream(self, stream_data: str, nome_arquivo: str) -> Dict:
        """Importa CSV direto de um stream (upload web)"""

        # Salvar temporariamente
        temp_path = f"uploads/temp_{nome_arquivo}"
        Path("uploads").mkdir(exist_ok=True)

        with open(temp_path, 'w', encoding='utf-8') as f:
            f.write(stream_data)

        # Importar
        resultado = self.importar_arquivo(temp_path)

        return resultado


# CLI para testes
def main():
    import sys
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker

    if len(sys.argv) < 3:
        print("Uso: python importador_csv.py <empresa_id> <arquivo.csv>")
        return

    empresa_id = int(sys.argv[1])
    arquivo = sys.argv[2]

    # Conectar banco
    engine = create_engine('sqlite:///vendeai.db')
    Session = sessionmaker(bind=engine)
    db = Session()

    # Importar
    importador = ImportadorCSV(db, empresa_id)
    resultado = importador.importar_arquivo(arquivo)

    if resultado['sucesso']:
        print(f"\n✅ Importação concluída! ID do arquivo: {resultado['arquivo_id']}")
    else:
        print(f"\n❌ Falha na importação: {resultado.get('erro')}")


if __name__ == '__main__':
    main()

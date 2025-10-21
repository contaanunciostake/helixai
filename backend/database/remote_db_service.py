"""
Serviço de Conexão com API Remota do Banco de Dados
Permite sincronizar dados entre banco local SQLite e banco remoto via API
"""

import os
import requests
from typing import Dict, List, Optional, Any
from datetime import datetime
import json
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()


class RemoteDBService:
    """Serviço para comunicação com API remota do banco de dados"""

    def __init__(self):
        self.api_url = os.getenv('DB_API_URL')
        self.api_token = os.getenv('DB_API_TOKEN')
        self.use_remote = os.getenv('USE_REMOTE_DB', 'False').lower() == 'true'

        if not self.api_url or not self.api_token:
            raise ValueError("DB_API_URL e DB_API_TOKEN devem estar configurados no .env")

    def _make_request(self, action: str, data: Dict = None) -> Dict:
        """
        Faz requisição para a API remota

        Args:
            action: Ação a ser executada (get, insert, update, delete, query)
            data: Dados da requisição

        Returns:
            Resposta da API
        """
        try:
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {self.api_token}'
            }

            payload = {
                'action': action,
                'token': self.api_token,
                **(data or {})
            }

            response = requests.post(
                self.api_url,
                headers=headers,
                json=payload,
                timeout=30
            )

            response.raise_for_status()
            return response.json()

        except requests.exceptions.RequestException as e:
            print(f"[ERRO] Falha na conexão com API remota: {e}")
            return {'success': False, 'error': str(e)}
        except Exception as e:
            print(f"[ERRO] Erro inesperado: {e}")
            return {'success': False, 'error': str(e)}

    def get_veiculos(self, filters: Dict = None) -> List[Dict]:
        """
        Busca veículos do banco remoto

        Args:
            filters: Filtros opcionais (marca, modelo, disponivel, etc)

        Returns:
            Lista de veículos
        """
        data = {
            'table': 'veiculos',
            'filters': filters or {}
        }

        result = self._make_request('query', data)

        if result.get('success'):
            return result.get('data', [])
        else:
            print(f"[ERRO] Falha ao buscar veículos: {result.get('error')}")
            return []

    def get_veiculo_by_id(self, veiculo_id: int) -> Optional[Dict]:
        """
        Busca veículo específico por ID

        Args:
            veiculo_id: ID do veículo

        Returns:
            Dados do veículo ou None
        """
        data = {
            'table': 'veiculos',
            'filters': {'id': veiculo_id}
        }

        result = self._make_request('get', data)

        if result.get('success') and result.get('data'):
            return result['data'][0] if isinstance(result['data'], list) else result['data']

        return None

    def search_veiculos(self, search_term: str) -> List[Dict]:
        """
        Busca veículos por termo de pesquisa (marca, modelo, etc)

        Args:
            search_term: Termo de busca

        Returns:
            Lista de veículos encontrados
        """
        data = {
            'table': 'veiculos',
            'search': search_term
        }

        result = self._make_request('search', data)

        if result.get('success'):
            return result.get('data', [])

        return []

    def insert_lead(self, lead_data: Dict) -> Optional[int]:
        """
        Insere novo lead no banco remoto

        Args:
            lead_data: Dados do lead

        Returns:
            ID do lead criado ou None
        """
        data = {
            'table': 'leads',
            'data': lead_data
        }

        result = self._make_request('insert', data)

        if result.get('success'):
            return result.get('insert_id')
        else:
            print(f"[ERRO] Falha ao inserir lead: {result.get('error')}")
            return None

    def update_lead(self, lead_id: int, updates: Dict) -> bool:
        """
        Atualiza dados de um lead

        Args:
            lead_id: ID do lead
            updates: Campos a atualizar

        Returns:
            True se sucesso, False caso contrário
        """
        data = {
            'table': 'leads',
            'id': lead_id,
            'data': updates
        }

        result = self._make_request('update', data)
        return result.get('success', False)

    def get_leads(self, filters: Dict = None) -> List[Dict]:
        """
        Busca leads do banco remoto

        Args:
            filters: Filtros opcionais

        Returns:
            Lista de leads
        """
        data = {
            'table': 'leads',
            'filters': filters or {}
        }

        result = self._make_request('query', data)

        if result.get('success'):
            return result.get('data', [])

        return []

    def insert_conversa(self, conversa_data: Dict) -> Optional[int]:
        """
        Insere nova conversa no banco remoto

        Args:
            conversa_data: Dados da conversa

        Returns:
            ID da conversa criada ou None
        """
        data = {
            'table': 'conversas',
            'data': conversa_data
        }

        result = self._make_request('insert', data)

        if result.get('success'):
            return result.get('insert_id')

        return None

    def insert_mensagem(self, mensagem_data: Dict) -> Optional[int]:
        """
        Insere nova mensagem no banco remoto

        Args:
            mensagem_data: Dados da mensagem

        Returns:
            ID da mensagem criada ou None
        """
        data = {
            'table': 'mensagens',
            'data': mensagem_data
        }

        result = self._make_request('insert', data)

        if result.get('success'):
            return result.get('insert_id')

        return None

    def get_conversas(self, filters: Dict = None) -> List[Dict]:
        """
        Busca conversas do banco remoto

        Args:
            filters: Filtros opcionais

        Returns:
            Lista de conversas
        """
        data = {
            'table': 'conversas',
            'filters': filters or {}
        }

        result = self._make_request('query', data)

        if result.get('success'):
            return result.get('data', [])

        return []

    def get_mensagens_conversa(self, conversa_id: int) -> List[Dict]:
        """
        Busca mensagens de uma conversa específica

        Args:
            conversa_id: ID da conversa

        Returns:
            Lista de mensagens
        """
        data = {
            'table': 'mensagens',
            'filters': {'conversa_id': conversa_id},
            'order_by': 'enviada_em ASC'
        }

        result = self._make_request('query', data)

        if result.get('success'):
            return result.get('data', [])

        return []

    def sync_veiculo_to_local(self, veiculo_remoto: Dict, local_session) -> bool:
        """
        Sincroniza um veículo do banco remoto para o local

        Args:
            veiculo_remoto: Dados do veículo remoto
            local_session: Sessão do SQLAlchemy local

        Returns:
            True se sucesso
        """
        try:
            from database.models import Veiculo

            # Buscar veículo local pelo código interno
            veiculo_local = local_session.query(Veiculo).filter_by(
                codigo_interno=veiculo_remoto.get('codigo_interno')
            ).first()

            if veiculo_local:
                # Atualizar veículo existente
                for key, value in veiculo_remoto.items():
                    if hasattr(veiculo_local, key):
                        setattr(veiculo_local, key, value)
            else:
                # Criar novo veículo
                veiculo_local = Veiculo(**veiculo_remoto)
                local_session.add(veiculo_local)

            local_session.commit()
            return True

        except Exception as e:
            print(f"[ERRO] Falha ao sincronizar veículo: {e}")
            local_session.rollback()
            return False

    def sync_all_veiculos(self, local_session) -> Dict[str, int]:
        """
        Sincroniza todos os veículos do banco remoto para o local

        Args:
            local_session: Sessão do SQLAlchemy local

        Returns:
            Estatísticas da sincronização
        """
        stats = {
            'total': 0,
            'novos': 0,
            'atualizados': 0,
            'erros': 0
        }

        veiculos_remotos = self.get_veiculos()
        stats['total'] = len(veiculos_remotos)

        for veiculo_remoto in veiculos_remotos:
            try:
                from database.models import Veiculo

                codigo_interno = veiculo_remoto.get('codigo_interno') or veiculo_remoto.get('id')

                veiculo_local = local_session.query(Veiculo).filter_by(
                    codigo_interno=codigo_interno
                ).first()

                if veiculo_local:
                    # Atualizar
                    for key, value in veiculo_remoto.items():
                        if hasattr(veiculo_local, key) and key != 'id':
                            setattr(veiculo_local, key, value)
                    stats['atualizados'] += 1
                else:
                    # Criar novo
                    veiculo_remoto['codigo_interno'] = codigo_interno
                    if 'id' in veiculo_remoto:
                        del veiculo_remoto['id']  # Deixar o SQLite gerar novo ID

                    veiculo_local = Veiculo(**veiculo_remoto)
                    local_session.add(veiculo_local)
                    stats['novos'] += 1

                local_session.commit()

            except Exception as e:
                print(f"[ERRO] Falha ao sincronizar veículo {codigo_interno}: {e}")
                local_session.rollback()
                stats['erros'] += 1

        return stats

    def test_connection(self) -> bool:
        """
        Testa conexão com a API remota

        Returns:
            True se conectado com sucesso
        """
        result = self._make_request('ping')

        if result.get('success'):
            print("[OK] Conexão com API remota estabelecida com sucesso!")
            return True
        else:
            print(f"[ERRO] Falha ao conectar com API remota: {result.get('error')}")
            return False


# Singleton global
_remote_db_service = None

def get_remote_db_service() -> RemoteDBService:
    """Retorna instância singleton do RemoteDBService"""
    global _remote_db_service

    if _remote_db_service is None:
        _remote_db_service = RemoteDBService()

    return _remote_db_service


# Para testes
if __name__ == '__main__':
    print("="*70)
    print("TESTE DE CONEXÃO COM API REMOTA DO BANCO DE DADOS")
    print("="*70)

    service = get_remote_db_service()

    # Testar conexão
    print("\n1. Testando conexão...")
    service.test_connection()

    # Buscar veículos
    print("\n2. Buscando veículos...")
    veiculos = service.get_veiculos()
    print(f"   Total de veículos encontrados: {len(veiculos)}")

    if veiculos:
        print(f"\n   Exemplo do primeiro veículo:")
        primeiro = veiculos[0]
        print(f"   - ID: {primeiro.get('id')}")
        print(f"   - Marca/Modelo: {primeiro.get('marca')} {primeiro.get('modelo')}")
        print(f"   - Ano: {primeiro.get('ano_modelo')}")
        print(f"   - Preço: R$ {primeiro.get('preco')}")

    print("\n" + "="*70)

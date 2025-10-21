"""
Gerenciador Híbrido de Banco de Dados
Combina banco local SQLite com API remota
"""

import os
from typing import List, Optional, Dict
from datetime import datetime
from dotenv import load_dotenv

from database.models import DatabaseManager, Veiculo, Lead, Conversa, Mensagem
from database.remote_db_service import get_remote_db_service

load_dotenv()


class HybridDatabaseManager(DatabaseManager):
    """
    Gerenciador que trabalha com banco local E remoto
    - Dados locais: SQLite (cache e operações rápidas)
    - Dados remotos: API (fonte principal de veículos e sincronização)
    """

    def __init__(self, connection_string='sqlite:///vendeai.db'):
        super().__init__(connection_string)
        self.use_remote = os.getenv('USE_REMOTE_DB', 'False').lower() == 'true'
        self.remote_service = get_remote_db_service() if self.use_remote else None

    # ==================== VEÍCULOS ====================

    def get_veiculos_from_remote(self, filters: Dict = None) -> List[Dict]:
        """
        Busca veículos do banco remoto via API

        Args:
            filters: Filtros opcionais

        Returns:
            Lista de veículos
        """
        if not self.use_remote or not self.remote_service:
            return []

        return self.remote_service.get_veiculos(filters)

    def get_veiculo_by_id_remote(self, veiculo_id: int) -> Optional[Dict]:
        """
        Busca veículo específico do banco remoto

        Args:
            veiculo_id: ID do veículo

        Returns:
            Dados do veículo ou None
        """
        if not self.use_remote or not self.remote_service:
            return None

        return self.remote_service.get_veiculo_by_id(veiculo_id)

    def search_veiculos_remote(self, search_term: str) -> List[Dict]:
        """
        Busca veículos no banco remoto por termo

        Args:
            search_term: Termo de busca

        Returns:
            Lista de veículos
        """
        if not self.use_remote or not self.remote_service:
            return []

        return self.remote_service.search_veiculos(search_term)

    def sync_veiculos_from_remote(self) -> Dict[str, int]:
        """
        Sincroniza todos os veículos do banco remoto para o local

        Returns:
            Estatísticas da sincronização
        """
        if not self.use_remote or not self.remote_service:
            return {'error': 'Remote DB not enabled'}

        session = self.get_session()
        try:
            stats = self.remote_service.sync_all_veiculos(session)
            print(f"\n[SYNC] Sincronização de veículos concluída:")
            print(f"  - Total: {stats['total']}")
            print(f"  - Novos: {stats['novos']}")
            print(f"  - Atualizados: {stats['atualizados']}")
            print(f"  - Erros: {stats['erros']}")
            return stats
        finally:
            session.close()

    def get_veiculos_hybrid(self, filters: Dict = None, force_remote: bool = False) -> List:
        """
        Busca veículos de forma híbrida (local ou remoto)

        Args:
            filters: Filtros opcionais
            force_remote: Forçar busca no banco remoto

        Returns:
            Lista de veículos
        """
        session = self.get_session()

        try:
            # Se forçar remoto ou usar remote DB, buscar da API
            if force_remote and self.use_remote:
                veiculos_remotos = self.get_veiculos_from_remote(filters)
                return veiculos_remotos

            # Caso contrário, buscar do banco local
            query = session.query(Veiculo)

            if filters:
                if 'disponivel' in filters:
                    query = query.filter(Veiculo.disponivel == filters['disponivel'])
                if 'marca' in filters:
                    query = query.filter(Veiculo.marca.ilike(f"%{filters['marca']}%"))
                if 'modelo' in filters:
                    query = query.filter(Veiculo.modelo.ilike(f"%{filters['modelo']}%"))

            return query.all()

        finally:
            session.close()

    # ==================== LEADS ====================

    def create_lead_hybrid(self, lead_data: Dict) -> Optional[int]:
        """
        Cria lead tanto no banco local quanto no remoto

        Args:
            lead_data: Dados do lead

        Returns:
            ID do lead local criado
        """
        session = self.get_session()

        try:
            # Criar no banco local
            lead_local = Lead(**lead_data)
            session.add(lead_local)
            session.commit()

            # Se usar banco remoto, criar lá também
            if self.use_remote and self.remote_service:
                remote_id = self.remote_service.insert_lead(lead_data)
                if remote_id:
                    print(f"[SYNC] Lead criado no banco remoto com ID: {remote_id}")

            return lead_local.id

        except Exception as e:
            session.rollback()
            print(f"[ERRO] Falha ao criar lead: {e}")
            return None
        finally:
            session.close()

    def update_lead_hybrid(self, lead_id: int, updates: Dict) -> bool:
        """
        Atualiza lead no banco local e remoto

        Args:
            lead_id: ID do lead
            updates: Campos a atualizar

        Returns:
            True se sucesso
        """
        session = self.get_session()

        try:
            # Atualizar no banco local
            lead = session.query(Lead).get(lead_id)
            if lead:
                for key, value in updates.items():
                    if hasattr(lead, key):
                        setattr(lead, key, value)

                lead.atualizado_em = datetime.utcnow()
                session.commit()

                # Atualizar no banco remoto se habilitado
                if self.use_remote and self.remote_service:
                    self.remote_service.update_lead(lead_id, updates)

                return True

            return False

        except Exception as e:
            session.rollback()
            print(f"[ERRO] Falha ao atualizar lead: {e}")
            return False
        finally:
            session.close()

    # ==================== CONVERSAS E MENSAGENS ====================

    def create_conversa_hybrid(self, conversa_data: Dict) -> Optional[int]:
        """
        Cria conversa no banco local e remoto

        Args:
            conversa_data: Dados da conversa

        Returns:
            ID da conversa criada
        """
        session = self.get_session()

        try:
            # Criar no banco local
            conversa = Conversa(**conversa_data)
            session.add(conversa)
            session.commit()

            # Criar no banco remoto
            if self.use_remote and self.remote_service:
                remote_id = self.remote_service.insert_conversa(conversa_data)
                if remote_id:
                    print(f"[SYNC] Conversa criada no banco remoto com ID: {remote_id}")

            return conversa.id

        except Exception as e:
            session.rollback()
            print(f"[ERRO] Falha ao criar conversa: {e}")
            return None
        finally:
            session.close()

    def create_mensagem_hybrid(self, mensagem_data: Dict) -> Optional[int]:
        """
        Cria mensagem no banco local e remoto

        Args:
            mensagem_data: Dados da mensagem

        Returns:
            ID da mensagem criada
        """
        session = self.get_session()

        try:
            # Criar no banco local
            mensagem = Mensagem(**mensagem_data)
            session.add(mensagem)
            session.commit()

            # Criar no banco remoto
            if self.use_remote and self.remote_service:
                remote_id = self.remote_service.insert_mensagem(mensagem_data)
                if remote_id:
                    print(f"[SYNC] Mensagem criada no banco remoto com ID: {remote_id}")

            return mensagem.id

        except Exception as e:
            session.rollback()
            print(f"[ERRO] Falha ao criar mensagem: {e}")
            return None
        finally:
            session.close()

    # ==================== UTILIDADES ====================

    def test_remote_connection(self) -> bool:
        """
        Testa conexão com banco remoto

        Returns:
            True se conectado
        """
        if not self.use_remote or not self.remote_service:
            print("[INFO] Banco remoto não está habilitado")
            return False

        return self.remote_service.test_connection()

    def get_sync_status(self) -> Dict:
        """
        Retorna status da sincronização

        Returns:
            Dicionário com informações de sincronização
        """
        session = self.get_session()

        try:
            status = {
                'remote_enabled': self.use_remote,
                'local_veiculos': session.query(Veiculo).count(),
                'local_leads': session.query(Lead).count(),
                'local_conversas': session.query(Conversa).count(),
                'local_mensagens': session.query(Mensagem).count(),
            }

            if self.use_remote and self.remote_service:
                remote_veiculos = self.remote_service.get_veiculos()
                status['remote_veiculos'] = len(remote_veiculos)

                remote_leads = self.remote_service.get_leads()
                status['remote_leads'] = len(remote_leads)

            return status

        finally:
            session.close()


# Singleton global
_hybrid_db_manager = None

def get_hybrid_db_manager() -> HybridDatabaseManager:
    """Retorna instância singleton do HybridDatabaseManager"""
    global _hybrid_db_manager

    if _hybrid_db_manager is None:
        _hybrid_db_manager = HybridDatabaseManager()

    return _hybrid_db_manager


# Para testes
if __name__ == '__main__':
    print("="*70)
    print("TESTE DO GERENCIADOR HÍBRIDO DE BANCO DE DADOS")
    print("="*70)

    manager = get_hybrid_db_manager()

    # Testar conexão remota
    print("\n1. Testando conexão com banco remoto...")
    manager.test_remote_connection()

    # Status de sincronização
    print("\n2. Status de sincronização:")
    status = manager.get_sync_status()
    print(f"   - Remoto habilitado: {status['remote_enabled']}")
    print(f"   - Veículos locais: {status['local_veiculos']}")
    print(f"   - Leads locais: {status['local_leads']}")

    if 'remote_veiculos' in status:
        print(f"   - Veículos remotos: {status['remote_veiculos']}")

    # Sincronizar veículos
    if status['remote_enabled']:
        print("\n3. Sincronizando veículos do banco remoto...")
        sync_stats = manager.sync_veiculos_from_remote()

    print("\n" + "="*70)

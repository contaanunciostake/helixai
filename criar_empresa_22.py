import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent / 'backend'))

from backend import db_manager
from database.models import Empresa, NichoEmpresa, PlanoAssinatura
from datetime import datetime

session = db_manager.get_session()
try:
    # Verificar se empresa 22 já existe
    empresa_existente = session.query(Empresa).get(22)

    if empresa_existente:
        print(f"✅ Empresa ID 22 já existe: {empresa_existente.nome}")
    else:
        # Criar empresa 22
        nova_empresa = Empresa(
            id=22,
            nome='Empresa Teste',
            nome_fantasia='Teste CRM',
            email='teste@empresa.com',
            telefone='42999999999',
            cnpj=None,
            nicho=None,  # Será definido no wizard de setup
            plano=PlanoAssinatura.BASICO,
            whatsapp_conectado=False,
            whatsapp_numero=None,
            bot_ativo=False,
            criado_em=datetime.now(),
            atualizado_em=datetime.now()
        )

        session.add(nova_empresa)
        session.commit()

        print(f"✅ Empresa ID 22 criada com sucesso!")
        print(f"   Nome: {nova_empresa.nome}")
        print(f"   Email: {nova_empresa.email}")
        print(f"   Plano: {nova_empresa.plano.value}")

finally:
    session.close()

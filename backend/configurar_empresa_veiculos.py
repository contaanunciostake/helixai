"""
Script para configurar empresa com nicho de veículos
Garante que o roteamento do webhook funcione corretamente
"""

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from backend import db_manager
from database.models import Empresa, NichoEmpresa

def configurar_empresa():
    """Configura empresa ID 1 com nicho de veículos"""
    session = db_manager.get_session()

    try:
        print("\n" + "="*70)
        print("[AUTO] CONFIGURANDO EMPRESA PARA BOT DE VEICULOS")
        print("="*70 + "\n")

        # Buscar empresa ID 1
        empresa = session.query(Empresa).filter_by(id=1).first()

        if not empresa:
            print("[ERRO] Empresa ID 1 nao encontrada!")
            print("\nCriando empresa padrao...")

            empresa = Empresa(
                id=1,
                nome='Feirao ShowCar',
                nicho=NichoEmpresa.VEICULOS,
                bot_ativo=True,
                whatsapp_conectado=False
            )
            session.add(empresa)
            session.commit()
            print("[OK] Empresa criada com sucesso!")
        else:
            print(f"[INFO] Empresa encontrada: {empresa.nome}")
            print(f"       Nicho atual: {empresa.nicho.value if empresa.nicho else 'NAO DEFINIDO'}")

            # Atualizar nicho
            empresa.nicho = NichoEmpresa.VEICULOS
            empresa.bot_ativo = True
            session.commit()

            print(f"\n[OK] Empresa atualizada!")

        print(f"\n[CONFIG] CONFIGURACAO FINAL:")
        print(f"         ID: {empresa.id}")
        print(f"         Nome: {empresa.nome}")
        print(f"         Nicho: {empresa.nicho.value if empresa.nicho else 'N/A'}")
        print(f"         Bot Ativo: {'SIM' if empresa.bot_ativo else 'NAO'}")
        print(f"         WhatsApp Conectado: {'SIM' if empresa.whatsapp_conectado else 'NAO'}")

        print("\n" + "="*70)
        print("[SUCESSO] CONFIGURACAO CONCLUIDA!")
        print("="*70)
        print("\nAgora o webhook ira rotear mensagens para o bot AIra Auto (porta 4000)")
        print("Endpoint: http://localhost:4000/api/processar-mensagem")
        print("\n")

        return True

    except Exception as e:
        session.rollback()
        print(f"\n[ERRO] Erro ao configurar empresa: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        session.close()

if __name__ == '__main__':
    sucesso = configurar_empresa()
    sys.exit(0 if sucesso else 1)

"""
Script para criar afiliado de teste no banco de dados
"""

import sys
import os

# Adicionar diretório backend ao path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_path)

# Importar models do backend
from database.models import (
    Usuario, Empresa, Afiliado, Referencia, Comissao,
    SaqueAfiliado, ConfiguracaoAfiliados,
    TipoUsuario, StatusAfiliado, StatusReferencia,
    StatusComissao, TipoComissao, PlanoAssinatura
)
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import random

# Conectar ao banco
DATABASE_URL = "mysql+pymysql://root:helix2025@localhost/vendeai_db"
engine = create_engine(DATABASE_URL, echo=False)
Session = sessionmaker(bind=engine)
session = Session()

def criar_afiliado_teste():
    """Cria um afiliado de teste com dados completos"""

    print("=" * 60)
    print("CRIANDO AFILIADO DE TESTE")
    print("=" * 60)

    # 1. Verificar se já existe
    usuario_existente = session.query(Usuario).filter_by(email='afiliado@teste.com').first()
    if usuario_existente:
        print("\n⚠️  Usuário afiliado@teste.com já existe!")
        afiliado_existente = session.query(Afiliado).filter_by(usuario_id=usuario_existente.id).first()
        if afiliado_existente:
            print(f"✅ Afiliado já cadastrado com chave: {afiliado_existente.chave_referencia}")
            print(f"✅ Status: {afiliado_existente.status.value}")
            print(f"✅ Saldo: R$ {afiliado_existente.saldo_disponivel:.2f}")
            return afiliado_existente
        else:
            print("⚠️  Usuário existe mas não é afiliado. Criando afiliado...")
            usuario = usuario_existente
    else:
        # 2. Pegar uma empresa existente
        empresa = session.query(Empresa).first()
        if not empresa:
            print("\n❌ Nenhuma empresa encontrada! Criando empresa teste...")
            empresa = Empresa(
                nome="Empresa Teste",
                slug="empresa-teste",
                email="empresa@teste.com",
                telefone="11999999999",
                plano=PlanoAssinatura.BASICO,
                ativo=True
            )
            session.add(empresa)
            session.commit()
            print(f"✅ Empresa criada: {empresa.nome} (ID: {empresa.id})")
        else:
            print(f"\n✅ Usando empresa existente: {empresa.nome} (ID: {empresa.id})")

        # 3. Criar usuário afiliado
        print("\n📝 Criando usuário afiliado...")
        usuario = Usuario(
            empresa_id=empresa.id,
            nome="João Silva - Afiliado",
            email="afiliado@teste.com",
            senha_hash=generate_password_hash("123456"),
            tipo=TipoUsuario.USUARIO,
            ativo=True
        )
        session.add(usuario)
        session.commit()
        print(f"✅ Usuário criado: {usuario.email} (ID: {usuario.id})")

    # 4. Criar afiliado
    print("\n💼 Criando afiliado...")
    afiliado = Afiliado(
        usuario_id=usuario.id,
        chave_referencia="teste2025",
        status=StatusAfiliado.ATIVO,
        nome_completo="João Silva dos Santos",
        cpf_cnpj="123.456.789-00",
        telefone="(11) 98765-4321",
        banco="Banco do Brasil",
        agencia="1234",
        conta="56789-0",
        tipo_conta="corrente",
        pix_tipo="cpf",
        pix_chave="12345678900",
        comissao_primeira_venda=30.0,
        comissao_recorrente=20.0,
        data_aprovacao=datetime.utcnow()
    )
    session.add(afiliado)
    session.commit()
    print(f"✅ Afiliado criado! Chave de referência: {afiliado.chave_referencia}")

    # 5. Criar algumas referências (clicks)
    print("\n🔗 Criando referências de teste...")
    for i in range(5):
        ref = Referencia(
            afiliado_id=afiliado.id,
            ip_origem=f"192.168.1.{random.randint(1, 255)}",
            user_agent="Mozilla/5.0",
            url_origem="https://www.google.com",
            status=StatusReferencia.CLICK,
            data_clique=datetime.utcnow() - timedelta(days=random.randint(1, 30))
        )
        session.add(ref)

    # Algumas com cadastro
    for i in range(3):
        ref = Referencia(
            afiliado_id=afiliado.id,
            ip_origem=f"192.168.1.{random.randint(1, 255)}",
            user_agent="Mozilla/5.0",
            url_origem="https://www.google.com",
            status=StatusReferencia.CADASTRO,
            data_clique=datetime.utcnow() - timedelta(days=random.randint(1, 20)),
            data_cadastro=datetime.utcnow() - timedelta(days=random.randint(1, 15))
        )
        session.add(ref)

    # Algumas convertidas
    for i in range(2):
        ref = Referencia(
            afiliado_id=afiliado.id,
            ip_origem=f"192.168.1.{random.randint(1, 255)}",
            user_agent="Mozilla/5.0",
            url_origem="https://www.google.com",
            status=StatusReferencia.CONVERTIDO,
            data_clique=datetime.utcnow() - timedelta(days=random.randint(10, 25)),
            data_cadastro=datetime.utcnow() - timedelta(days=random.randint(5, 20)),
            data_conversao=datetime.utcnow() - timedelta(days=random.randint(1, 10)),
            valor_primeira_compra=random.choice([97.0, 197.0, 497.0]),
            plano_contratado=random.choice(['basico', 'profissional', 'enterprise'])
        )
        session.add(ref)

    session.commit()
    print(f"✅ {10} referências criadas (5 clicks, 3 cadastros, 2 vendas)")

    # 6. Criar comissões
    print("\n💰 Criando comissões de teste...")

    # Comissão pendente
    comissao1 = Comissao(
        afiliado_id=afiliado.id,
        tipo=TipoComissao.PRIMEIRA_VENDA,
        valor=29.10,  # 30% de R$ 97
        percentual=30.0,
        valor_base=97.0,
        status=StatusComissao.PENDENTE,
        descricao="Comissão da primeira venda - Plano Básico",
        data_geracao=datetime.utcnow() - timedelta(days=5)
    )
    session.add(comissao1)

    # Comissão aprovada
    comissao2 = Comissao(
        afiliado_id=afiliado.id,
        tipo=TipoComissao.PRIMEIRA_VENDA,
        valor=149.10,  # 30% de R$ 497
        percentual=30.0,
        valor_base=497.0,
        status=StatusComissao.APROVADA,
        descricao="Comissão da primeira venda - Plano Enterprise",
        data_geracao=datetime.utcnow() - timedelta(days=20),
        data_aprovacao=datetime.utcnow() - timedelta(days=10)
    )
    session.add(comissao2)

    # Comissão paga
    comissao3 = Comissao(
        afiliado_id=afiliado.id,
        tipo=TipoComissao.RECORRENTE,
        valor=39.40,  # 20% de R$ 197
        percentual=20.0,
        valor_base=197.0,
        status=StatusComissao.PAGA,
        descricao="Comissão recorrente - Plano Profissional (Mês 2)",
        data_geracao=datetime.utcnow() - timedelta(days=30),
        data_aprovacao=datetime.utcnow() - timedelta(days=20),
        data_pagamento=datetime.utcnow() - timedelta(days=10)
    )
    session.add(comissao3)

    # Bônus por meta
    comissao4 = Comissao(
        afiliado_id=afiliado.id,
        tipo=TipoComissao.BONUS,
        valor=100.0,
        percentual=0.0,
        valor_base=0.0,
        status=StatusComissao.PAGA,
        descricao="Bônus por atingir 5 vendas no mês",
        data_geracao=datetime.utcnow() - timedelta(days=15),
        data_aprovacao=datetime.utcnow() - timedelta(days=10),
        data_pagamento=datetime.utcnow() - timedelta(days=5)
    )
    session.add(comissao4)

    session.commit()
    print(f"✅ 4 comissões criadas (1 pendente, 1 aprovada, 2 pagas)")

    # 7. Atualizar métricas do afiliado
    print("\n📊 Atualizando métricas do afiliado...")
    afiliado.total_clicks = 10
    afiliado.total_cadastros = 5
    afiliado.total_vendas = 2
    afiliado.total_comissoes_geradas = 317.60  # Soma de todas
    afiliado.total_comissoes_pagas = 139.40    # Soma das pagas
    afiliado.saldo_disponivel = 149.10         # Comissão aprovada disponível para saque

    session.commit()
    print(f"✅ Métricas atualizadas")

    # 8. Criar histórico de saques
    print("\n💸 Criando histórico de saques...")

    # Saque pago
    saque1 = SaqueAfiliado(
        afiliado_id=afiliado.id,
        valor_solicitado=139.40,
        valor_pago=139.40,
        taxa=0.0,
        status='pago',
        metodo_pagamento='pix',
        data_solicitacao=datetime.utcnow() - timedelta(days=15),
        data_aprovacao=datetime.utcnow() - timedelta(days=10),
        data_pagamento=datetime.utcnow() - timedelta(days=5),
        observacoes='Pagamento realizado via PIX'
    )
    session.add(saque1)

    # Saque pendente
    saque2 = SaqueAfiliado(
        afiliado_id=afiliado.id,
        valor_solicitado=50.0,
        status='pendente',
        metodo_pagamento='pix',
        data_solicitacao=datetime.utcnow() - timedelta(days=2)
    )
    session.add(saque2)

    session.commit()
    print(f"✅ 2 saques criados (1 pago, 1 pendente)")

    # 9. Criar/atualizar configurações de afiliados
    print("\n⚙️  Criando configurações do sistema de afiliados...")
    config = session.query(ConfiguracaoAfiliados).first()
    if not config:
        config = ConfiguracaoAfiliados(
            comissao_primeira_venda_padrao=30.0,
            comissao_recorrente_padrao=20.0,
            prazo_cookie_dias=30,
            minimo_saque=50.0,
            prazo_aprovacao_comissao_dias=7,
            bonus_meta_5_vendas=100.0,
            bonus_meta_10_vendas=300.0,
            bonus_meta_20_vendas=1000.0,
            programa_ativo=True,
            aceitar_novos_afiliados=True,
            termos_uso="Termos e condições do programa de afiliados...",
            politica_pagamento="Política de pagamento: saques processados em até 7 dias úteis..."
        )
        session.add(config)
        session.commit()
        print(f"✅ Configurações criadas")
    else:
        print(f"✅ Configurações já existem")

    print("\n" + "=" * 60)
    print("✅ AFILIADO DE TESTE CRIADO COM SUCESSO!")
    print("=" * 60)
    print(f"\n🔑 CREDENCIAIS DE LOGIN:")
    print(f"   Email: afiliado@teste.com")
    print(f"   Senha: 123456")
    print(f"\n📊 DADOS DO AFILIADO:")
    print(f"   Nome: {afiliado.nome_completo}")
    print(f"   Status: {afiliado.status.value}")
    print(f"   Chave de Referência: {afiliado.chave_referencia}")
    print(f"   Link: http://localhost:5000/r/{afiliado.chave_referencia}")
    print(f"\n💰 MÉTRICAS:")
    print(f"   Total de Clicks: {afiliado.total_clicks}")
    print(f"   Total de Cadastros: {afiliado.total_cadastros}")
    print(f"   Total de Vendas: {afiliado.total_vendas}")
    print(f"   Comissões Geradas: R$ {afiliado.total_comissoes_geradas:.2f}")
    print(f"   Comissões Pagas: R$ {afiliado.total_comissoes_pagas:.2f}")
    print(f"   Saldo Disponível: R$ {afiliado.saldo_disponivel:.2f}")
    print(f"\n🎯 COMISSÕES:")
    print(f"   Primeira Venda: {afiliado.comissao_primeira_venda}%")
    print(f"   Recorrente: {afiliado.comissao_recorrente}%")
    print("\n" + "=" * 60)

    return afiliado

if __name__ == "__main__":
    try:
        afiliado = criar_afiliado_teste()
        print("\n✅ Script executado com sucesso!")
    except Exception as e:
        print(f"\n❌ Erro: {e}")
        import traceback
        traceback.print_exc()
        session.rollback()
    finally:
        session.close()
